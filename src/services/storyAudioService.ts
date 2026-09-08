// Story Audio Service - English TTS for Prophet Stories narration
// Human-like narration with prosodic modeling, breathing simulation, and natural rhythm
import * as Speech from 'expo-speech';
import { registerAudioProducer, claimAudio } from './audioBus';
import { setAudioModeAsync } from 'expo-audio';
import { PlaybackSpeed } from '../types/prophetStories';

interface NarrationOptions {
  onStart?: () => void;
  onDone?: () => void;
  onError?: (error: any) => void;
  onSentenceStart?: (sentenceIndex: number) => void;
}

type EmotionalTone = 'neutral' | 'reverent' | 'warning' | 'joyful' | 'dramatic' | 'contemplative';
type PhrasePosition = 'start' | 'middle' | 'end' | 'single';
type SentenceType = 'declarative' | 'exclamatory' | 'interrogative' | 'imperative';
type EmphasisLevel = 0 | 1 | 2 | 3; // 0=none, 1=mild, 2=moderate, 3=strong

interface Chunk {
  text: string;
  isQuote: boolean;
  tone: EmotionalTone;
  position: PhrasePosition;
  emphasisLevel: EmphasisLevel;
  pauseAfter: number;
  pauseBefore: number;
  pitchContour: 'rising' | 'falling' | 'steady' | 'peak' | 'dip-rise';
  sentenceType: SentenceType;
  breathBefore: boolean;
  wordCount: number;
  sentenceProgress: number; // 0-1, how far into sentence
  isClimax: boolean;
}

// Speed settings - slow, clear storytelling pace
const SPEED_MULTIPLIERS: Record<PlaybackSpeed, number> = {
  0.75: 0.55,
  1: 0.7,    // Slow, deliberate narration
  1.25: 0.8,
  1.5: 0.95,
};

// Simple pitch contours
const PITCH_CONTOURS = {
  rising: { start: 1.0, mid: 1.0, end: 1.05 },
  falling: { start: 1.0, mid: 1.0, end: 0.95 },
  steady: { start: 1.0, mid: 1.0, end: 1.0 },
  peak: { start: 1.0, mid: 1.05, end: 1.0 },
  'dip-rise': { start: 1.0, mid: 0.95, end: 1.0 },
};

// Simple tone settings - minimal variation
const TONE_SETTINGS: Record<EmotionalTone, { basePitch: number; rateMultiplier: number; breathRate: number }> = {
  neutral: { basePitch: 1.0, rateMultiplier: 1.0, breathRate: 0.05 },
  reverent: { basePitch: 1.0, rateMultiplier: 0.95, breathRate: 0.1 },
  warning: { basePitch: 1.0, rateMultiplier: 1.0, breathRate: 0.05 },
  joyful: { basePitch: 1.0, rateMultiplier: 1.0, breathRate: 0.05 },
  dramatic: { basePitch: 1.0, rateMultiplier: 0.95, breathRate: 0.1 },
  contemplative: { basePitch: 1.0, rateMultiplier: 0.95, breathRate: 0.1 },
};

// Emphasis words with levels (1=mild, 2=moderate, 3=strong)
const EMPHASIS_LEVELS: Record<string, EmphasisLevel> = {};
// Strong emphasis (level 3) - sacred names and core concepts
['allah', 'god', 'lord', 'creator', 'prophet', 'paradise', 'eternal', 'miracle'].forEach(w => EMPHASIS_LEVELS[w] = 3);
// Moderate emphasis (level 2) - important concepts
['never', 'always', 'must', 'forbidden', 'commanded', 'created', 'destroyed', 'saved', 'truth', 'mercy', 'light', 'angels', 'heaven', 'adam', 'iblis'].forEach(w => EMPHASIS_LEVELS[w] = 2);
// Mild emphasis (level 1) - narrative emphasis
['behold', 'indeed', 'truly', 'verily', 'surely', 'suddenly', 'first', 'last', 'only', 'finally', 'then', 'therefore'].forEach(w => EMPHASIS_LEVELS[w] = 1);

// Climax trigger words/phrases
const CLIMAX_TRIGGERS = new Set([
  'and then', 'at that moment', 'suddenly', 'behold', 'and so', 'thus',
  'it was then', 'in that instant', 'at once', 'immediately'
]);

// Pause timings (ms) - generous pauses for storytelling
const PAUSE = {
  MICRO: 80,
  BREATH_SHORT: 150,
  SHORT: 250,
  MEDIUM: 400,
  LONG: 600,
  DRAMATIC: 800,
  PARAGRAPH: 900,
  BREATH_DEEP: 300,
  THOUGHT: 500,
  REVELATION: 800,
};

// Emotion keywords
const EMOTION_KEYWORDS: Record<string, EmotionalTone> = {};
['allah', 'lord', 'god', 'creator', 'worship', 'prayer', 'praise', 'glorify', 'blessed', 'holy', 'sacred', 'prostrate', 'divine', 'revelation', 'merciful', 'compassionate', 'almighty'].forEach(w => EMOTION_KEYWORDS[w] = 'reverent');
['forbidden', 'punishment', 'destroy', 'wrath', 'disobey', 'sin', 'arrogance', 'reject', 'hell', 'fire', 'curse', 'enemy', 'satan', 'iblis', 'evil', 'doom', 'terrible', 'severe'].forEach(w => EMOTION_KEYWORDS[w] = 'warning');
['paradise', 'garden', 'reward', 'mercy', 'forgive', 'accept', 'save', 'joy', 'peace', 'love', 'success', 'guidance', 'light', 'blessed', 'happy', 'beautiful'].forEach(w => EMOTION_KEYWORDS[w] = 'joyful');
['behold', 'suddenly', 'commanded', 'decreed', 'miracle', 'angels', 'heaven', 'earth', 'created', 'descended', 'flood', 'storm', 'power', 'mighty', 'glory'].forEach(w => EMOTION_KEYWORDS[w] = 'dramatic');
['reflect', 'ponder', 'remember', 'lesson', 'wisdom', 'understand', 'meaning', 'soul', 'heart', 'journey', 'consider', 'think', 'realize'].forEach(w => EMOTION_KEYWORDS[w] = 'contemplative');

class StoryAudioService {
  private isSpeaking = false;
  private isPaused = false;
  private audioConfigured = false;
  private bestVoice: string | null = null;
  private secondaryVoice: string | null = null;
  private voiceInitialized = false;
  private currentSpeed: PlaybackSpeed = 1;
  private chunks: Chunk[] = [];
  private currentChunkIndex = 0;
  private onDoneCallback: (() => void) | null = null;
  private onSentenceCallback: ((index: number) => void) | null = null;
  private shouldStop = false;
  private emotionalMomentum: EmotionalTone = 'neutral'; // Carries emotion across chunks
  private sentenceIndex = 0;

  private async configureAudio(): Promise<void> {
    if (this.audioConfigured) return;
    try {
      await setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'duckOthers' });
      this.audioConfigured = true;
    } catch (e) { __DEV__ && console.log('Audio config error:', e); }
  }

  private async findBestVoice(): Promise<void> {
    if (this.voiceInitialized) return;
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      const english = voices.filter(v => v.language.startsWith('en-US') || v.language.startsWith('en-GB'));

      __DEV__ && console.log('Available English voices:');
      english.forEach(v => __DEV__ && console.log(`  ${v.identifier} (${v.quality})`));

      // Find best voices - prefer enhanced quality voices
      const findVoice = (names: string[], preferEnhanced = true) => {
        if (preferEnhanced) {
          for (const name of names) {
            const v = english.find(v => v.identifier.toLowerCase().includes(name) && v.quality === 'Enhanced');
            if (v) return v.identifier;
          }
        }
        for (const name of names) {
          const v = english.find(v => v.identifier.toLowerCase().includes(name));
          if (v) return v.identifier;
        }
        return null;
      };

      // Primary: Try the clearest voices on iOS/Android
      // Samantha and Karen are known for clear pronunciation
      this.bestVoice = findVoice([
        'samantha',    // iOS female - very clear pronunciation
        'karen',       // Australian female - clear
        'daniel',      // UK male - clear British pronunciation
        'moira',       // Irish female
        'alex',        // US male
      ])
        || english.find(v => v.quality === 'Enhanced')?.identifier
        || english[0]?.identifier || null;

      // Use same voice for quotes to keep consistency
      this.secondaryVoice = this.bestVoice;

      __DEV__ && console.log('Selected voice:', this.bestVoice);
      this.voiceInitialized = true;
    } catch (e) {
      __DEV__ && console.log('Voice error:', e);
      this.voiceInitialized = true;
    }
  }

  // Detect dominant emotion with weighted scoring
  private detectTone(text: string): EmotionalTone {
    const words = text.toLowerCase().split(/\s+/);
    const scores: Record<EmotionalTone, number> = {
      neutral: 0, reverent: 0, warning: 0, joyful: 0, dramatic: 0, contemplative: 0
    };

    for (const word of words) {
      const clean = word.replace(/[^a-z]/g, '');
      if (EMOTION_KEYWORDS[clean]) {
        // Weight by emphasis level
        const emphasisBonus = EMPHASIS_LEVELS[clean] || 0;
        scores[EMOTION_KEYWORDS[clean]] += 1 + (emphasisBonus * 0.5);
      }
    }

    // Also check for emotional phrases
    const lowerText = text.toLowerCase();
    if (lowerText.includes('allah said') || lowerText.includes('the lord')) scores.reverent += 2;
    if (lowerText.includes('and behold') || lowerText.includes('at that moment')) scores.dramatic += 2;
    if (lowerText.includes('be warned') || lowerText.includes('do not')) scores.warning += 1.5;

    let max = 0, tone: EmotionalTone = 'neutral';
    for (const [t, s] of Object.entries(scores)) {
      if (s > max) { max = s; tone = t as EmotionalTone; }
    }

    // Blend with momentum for continuity (30% previous, 70% current)
    if (max < 1.5 && this.emotionalMomentum !== 'neutral') {
      return this.emotionalMomentum; // Carry forward if current is weak
    }

    return max > 0 ? tone : 'neutral';
  }

  // Get emphasis level (0-3)
  private getEmphasisLevel(word: string): EmphasisLevel {
    const clean = word.toLowerCase().replace(/[^a-z]/g, '');
    return EMPHASIS_LEVELS[clean] || 0;
  }

  // Detect sentence type
  private getSentenceType(sentence: string): SentenceType {
    const trimmed = sentence.trim();
    if (trimmed.endsWith('?')) return 'interrogative';
    if (trimmed.endsWith('!')) return 'exclamatory';
    if (/^(let|do|be|may|shall|worship|remember|consider|behold)/i.test(trimmed)) return 'imperative';
    return 'declarative';
  }

  // Check if this is a climactic moment
  private isClimaxMoment(text: string): boolean {
    const lower = text.toLowerCase();
    const triggers = Array.from(CLIMAX_TRIGGERS);
    for (let i = 0; i < triggers.length; i++) {
      if (lower.includes(triggers[i])) return true;
    }
    return false;
  }

  // Break into longer natural phrases for smoother speech
  private breakIntoProsodicPhrases(sentence: string): string[] {
    const words = sentence.split(/\s+/).filter(w => w);

    // For short sentences, keep them as one phrase
    if (words.length <= 12) {
      return [sentence];
    }

    const phrases: string[] = [];
    let current: string[] = [];

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      current.push(word);

      // Only break on natural punctuation, not conjunctions
      const isPunctuation = /[,;:]$/.test(word);
      const isLongEnough = current.length >= 8;

      if (isPunctuation && isLongEnough) {
        phrases.push(current.join(' '));
        current = [];
      }
    }

    if (current.length > 0) {
      // Merge short final phrase with previous
      if (current.length <= 4 && phrases.length > 0) {
        phrases[phrases.length - 1] += ' ' + current.join(' ');
      } else {
        phrases.push(current.join(' '));
      }
    }

    return phrases.length > 0 ? phrases : [sentence];
  }

  // Determine pitch contour based on multiple factors
  private getPitchContour(text: string, position: PhrasePosition, sentenceType: SentenceType, isClimax: boolean): Chunk['pitchContour'] {
    // Question rises at end
    if (sentenceType === 'interrogative' && position === 'end') return 'rising';

    // Climax gets peak contour
    if (isClimax) return 'peak';

    // Exclamatory stays higher
    if (sentenceType === 'exclamatory') return position === 'end' ? 'falling' : 'peak';

    // Parenthetical/aside feeling
    if (text.includes('—') || (text.startsWith('(') && text.endsWith(')'))) return 'dip-rise';

    // Standard patterns
    if (position === 'end' || text.endsWith('.')) return 'falling';
    if (position === 'start') return 'rising';
    if (position === 'middle') return 'steady';

    // Check for emphasis words
    const maxEmphasis = Math.max(...text.split(/\s+/).map(w => this.getEmphasisLevel(w)));
    if (maxEmphasis >= 2) return 'peak';

    return 'steady';
  }

  // Determine if breath needed before phrase
  private needsBreathBefore(wordCount: number, position: PhrasePosition, tone: EmotionalTone): boolean {
    // Always breathe at start
    if (position === 'start') return true;

    // Breathe before longer phrases
    if (wordCount >= 5) return true;

    // Emotional content needs more breath
    const breathRate = TONE_SETTINGS[tone].breathRate;
    return Math.random() < breathRate;
  }

  // Main text processing - simple sentence-based chunks
  private processText(text: string): Chunk[] {
    const chunks: Chunk[] = [];
    const cleanedText = this.cleanText(text);
    if (!cleanedText) return chunks;

    // Split into sentences, keeping it simple
    const sentences = cleanedText.split(/(?<=[.!?])\s+/).filter(s => s.trim());

    for (const sentence of sentences) {
      const tone = this.detectTone(sentence);
      const phrases = this.breakIntoProsodicPhrases(sentence);

      for (let idx = 0; idx < phrases.length; idx++) {
        const phrase = phrases[idx];
        const wordCount = phrase.split(/\s+/).length;
        const isLast = idx === phrases.length - 1;

        // Simple pause: short between phrases, longer at end of sentence
        const pauseAfter = isLast ? PAUSE.LONG : PAUSE.SHORT;

        chunks.push({
          text: phrase,
          isQuote: false,
          tone,
          position: phrases.length === 1 ? 'single' : (idx === 0 ? 'start' : (isLast ? 'end' : 'middle')),
          emphasisLevel: 0,
          pauseAfter,
          pauseBefore: 0,
          pitchContour: 'steady',
          sentenceType: 'declarative',
          breathBefore: false,
          wordCount,
          sentenceProgress: 0.5,
          isClimax: false,
        });
      }
    }

    return chunks;
  }

  private cleanText(text: string): string {
    let t = text.trim();

    // Remove quotes
    t = t.replace(/["'"'«»]/g, '');

    // Expand abbreviations
    t = t.replace(/\bPBUH\b/gi, 'peace be upon him');
    t = t.replace(/\(PBUH\)/gi, 'peace be upon him');
    t = t.replace(/\bSWT\b/gi, 'glorified and exalted');
    t = t.replace(/\(SWT\)/gi, 'glorified and exalted');

    // Fix "honored" - emphasize the H sound
    t = t.replace(/\bhonored\b/gi, 'honnerd');
    t = t.replace(/\bhonor\b/gi, 'honner');
    t = t.replace(/\bhonors\b/gi, 'honners');
    t = t.replace(/\bhonoring\b/gi, 'honnering');

    // Arabic pronunciation - use phonetic spelling without hyphens
    t = t.replace(/\bAllah's\b/g, 'Ollahs');
    t = t.replace(/\bAllah\b/g, 'Ollah');
    t = t.replace(/\bIblis\b/g, 'Iblees');
    t = t.replace(/\bkhalifah\b/gi, 'khaleefah');
    t = t.replace(/\bHawwa\b/gi, 'Hawwah');
    t = t.replace(/\bJannah\b/gi, 'Jannah');
    t = t.replace(/\bJahannam\b/gi, 'Jahannam');
    t = t.replace(/\bQuran\b/gi, 'Quraan');
    t = t.replace(/\bAyah\b/gi, 'aayah');
    t = t.replace(/\bAyat\b/gi, 'aayaat');
    t = t.replace(/\bSurah\b/gi, 'Soorah');
    t = t.replace(/\bIbrahim\b/gi, 'Ibraheem');
    t = t.replace(/\bIsmail\b/gi, 'Ismaeel');
    t = t.replace(/\bMusa\b/gi, 'Moosa');
    t = t.replace(/\bIsa\b/gi, 'Eesa');
    t = t.replace(/\bNuh\b/gi, 'Nooh');
    t = t.replace(/\bSalih\b/gi, 'Saalih');
    t = t.replace(/\bShuayb\b/gi, 'Shuayb');
    t = t.replace(/\bDawud\b/gi, 'Dawood');
    t = t.replace(/\bSulayman\b/gi, 'Sulaymaan');
    t = t.replace(/\bYusuf\b/gi, 'Yoosuf');
    t = t.replace(/\bYunus\b/gi, 'Yoonus');
    t = t.replace(/\bYahya\b/gi, 'Yahyaa');
    t = t.replace(/\bZakariya\b/gi, 'Zakariyyah');
    t = t.replace(/\bshaytan\b/gi, 'shaytaan');
    t = t.replace(/\bSatan\b/gi, 'Shaytaan');
    t = t.replace(/\bAdam\b/g, 'Aadam');

    // Numbers to words
    t = t.replace(/\b(\d+)\b/g, (_, n) => this.numToWords(parseInt(n)));

    // Keep punctuation that helps with pauses: . , ! ?
    // Remove other symbols that shouldn't be read
    t = t.replace(/[—–\-:;()[\]{}<>@#$%^&*_=+|\\\/~`]/g, ' ');

    // Clean up extra spaces
    t = t.replace(/\s+/g, ' ').trim();

    return t;
  }

  private numToWords(n: number): string {
    if (n < 10) return ['zero','one','two','three','four','five','six','seven','eight','nine'][n];
    if (n < 20) return ['ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'][n-10];
    if (n < 100) return ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'][Math.floor(n/10)] + (n%10 ? '-' + this.numToWords(n%10) : '');
    if (n < 1000) return this.numToWords(Math.floor(n/100)) + ' hundred' + (n%100 ? ' and ' + this.numToWords(n%100) : '');
    return n.toString();
  }

  async speak(text: string, speed: PlaybackSpeed = 1, options?: NarrationOptions): Promise<void> {
    claimAudio('story');
    if (!text?.trim()) {
      return;
    }

    await this.configureAudio();
    await this.findBestVoice();

    if (this.isSpeaking) {
      await this.stop();
      await new Promise(r => setTimeout(r, 200));
    }

    this.shouldStop = false;
    this.isSpeaking = true;
    this.isPaused = false;
    this.currentSpeed = speed;

    // Clean the text
    const cleanedText = this.cleanText(text);
    if (!cleanedText) {
      this.isSpeaking = false;
      return;
    }

    __DEV__ && console.log('Speaking text:', cleanedText.substring(0, 50) + '...');

    const rate = SPEED_MULTIPLIERS[this.currentSpeed];
    const pitch = 1.05;

    options?.onStart?.();

    // Start speaking
    Speech.speak(cleanedText, {
      language: 'en-US',
      rate,
      pitch,
      voice: this.bestVoice || undefined,
      onDone: () => {
        this.isSpeaking = false;
        this.isPaused = false;
        options?.onDone?.();
      },
      onError: (error) => {
        this.isSpeaking = false;
        this.isPaused = false;
        options?.onError?.(error);
      },
    });

    // Wait for speech to complete by polling
    await this.waitForSpeechEnd();

    this.isSpeaking = false;
    this.isPaused = false;
  }

  private async waitForSpeechEnd(): Promise<void> {
    // Initial wait to let speech start
    await new Promise(r => setTimeout(r, 500));

    // Poll until speech ends
    while (!this.shouldStop) {
      try {
        const speaking = await Speech.isSpeakingAsync();
        if (!speaking) {
          return;
        }
      } catch (e) {
        __DEV__ && console.log('Poll error:', e);
        return;
      }
      await new Promise(r => setTimeout(r, 300));
    }
  }

  async pause(): Promise<void> {
    if (this.isSpeaking && !this.isPaused) {
      await Speech.pause();
      this.isPaused = true;
    }
  }

  async resume(): Promise<void> {
    if (this.isPaused) {
      try {
        await Speech.resume();
        this.isPaused = false;
      } catch {
        this.isPaused = false;
      }
    }
  }

  async stop(): Promise<void> {
    this.shouldStop = true;
    await Speech.stop();
    this.isSpeaking = false;
    this.isPaused = false;
    this.chunks = [];
    this.currentChunkIndex = 0;
  }

  setSpeed(speed: PlaybackSpeed): void { this.currentSpeed = speed; }
  getIsSpeaking(): boolean { return this.isSpeaking; }
  getIsPaused(): boolean { return this.isPaused; }
  getCurrentSpeed(): PlaybackSpeed { return this.currentSpeed; }
  getCurrentSegmentIndex(): number { return this.currentChunkIndex; }
  getTotalSegments(): number { return this.chunks.length; }

  async isAvailable(): Promise<boolean> {
    const voices = await Speech.getAvailableVoicesAsync();
    return voices.some(v => v.language.startsWith('en'));
  }

  async listEnglishVoices(): Promise<void> {
    const voices = await Speech.getAvailableVoicesAsync();
    voices.filter(v => v.language.startsWith('en')).forEach(v => {
      __DEV__ && console.log(`${v.identifier} | ${v.quality}`);
    });
  }
}

export const storyAudioService = new StoryAudioService();

registerAudioProducer('story', 'longform', () => storyAudioService.stop());
export default storyAudioService;
