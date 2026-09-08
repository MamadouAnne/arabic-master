import * as Speech from 'expo-speech';
import { registerAudioProducer } from './audioBus';
import { setAudioModeAsync } from 'expo-audio';
import { speakArabic as speakArabicOnce, stopArabic, setArabicVoiceGender } from './speech/arabicTTS';

export type VoiceGender = 'female' | 'male';

interface SpeakOptions {
  text: string;
  rate?: number;
  gender?: VoiceGender;
  onDone?: () => void;
  onError?: (error: any) => void;
}

class AudioService {
  private isSpeaking: boolean = false;
  private audioConfigured: boolean = false;
  private femaleVoice: string | null = null;
  private maleVoice: string | null = null;
  private voiceInitialized: boolean = false;
  private preferredGender: VoiceGender = 'female'; // Default to female
  private hasMultipleVoices: boolean = false; // Track if different male/female voices exist

  private async configureAudio(): Promise<void> {
    if (this.audioConfigured) return;

    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        interruptionMode: 'duckOthers',
      });
      this.audioConfigured = true;
    } catch (error) {
      __DEV__ && console.log('Audio config error:', error);
    }
  }

  // Find the best Arabic voices (male and female) available
  private async findBestVoice(): Promise<void> {
    if (this.voiceInitialized) return;

    try {
      const voices = await Speech.getAvailableVoicesAsync();

      // Filter Arabic voices
      const arabicVoices = voices.filter(v =>
        v.language.startsWith('ar') || v.language.includes('Arab')
      );

      __DEV__ && console.log('=== Arabic voices found:', arabicVoices.length, '===');
      arabicVoices.forEach(v => {
        __DEV__ && console.log(`  Voice: ${v.identifier}`);
        __DEV__ && console.log(`    Name: ${v.name || 'N/A'}`);
        __DEV__ && console.log(`    Language: ${v.language}`);
        __DEV__ && console.log(`    Quality: ${v.quality}`);
      });

      // iOS Arabic voice names (case-insensitive matching)
      // Female Arabic names: Laila, Maryam, Amira, Hoda, Salma, Zeina, Lana, Sara, Fatima, Samira
      // Male Arabic names: Maged, Tarik, Omar, Khaled, Ahmed, Hassan, Majed
      const femaleNames = ['laila', 'maryam', 'amira', 'hoda', 'salma', 'zeina', 'lana', 'sara', 'fatima', 'samira', 'female'];
      const maleNames = ['maged', 'majed', 'tarik', 'omar', 'khaled', 'ahmed', 'hassan', 'male'];

      // Helper function to check if voice is female
      const isFemaleVoice = (v: Speech.Voice) => {
        const id = v.identifier.toLowerCase();
        const name = (v.name || '').toLowerCase();
        const combined = id + ' ' + name;
        return femaleNames.some(f => combined.includes(f));
      };

      // Helper function to check if voice is male
      const isMaleVoice = (v: Speech.Voice) => {
        const id = v.identifier.toLowerCase();
        const name = (v.name || '').toLowerCase();
        const combined = id + ' ' + name;
        return maleNames.some(m => combined.includes(m));
      };

      // Helper to select best voice from a filtered list
      const selectBest = (voiceList: Speech.Voice[]) => {
        const enhanced = voiceList.find(v =>
          v.quality === 'Enhanced' ||
          v.identifier.includes('premium') ||
          v.identifier.includes('enhanced')
        );
        const defaultQ = voiceList.find(v =>
          v.quality === 'Default' &&
          !v.identifier.includes('compact')
        );
        const nonCompact = voiceList.find(v =>
          !v.identifier.includes('compact')
        );
        const compact = voiceList.find(v =>
          v.identifier.includes('compact') &&
          !v.identifier.includes('super-compact')
        );
        return enhanced || defaultQ || nonCompact || compact || voiceList[0];
      };

      // Separate voices by gender
      const femaleVoices = arabicVoices.filter(isFemaleVoice);
      const maleVoices = arabicVoices.filter(isMaleVoice);
      const unidentifiedVoices = arabicVoices.filter(v => !isFemaleVoice(v) && !isMaleVoice(v));

      __DEV__ && console.log('Female voices:', femaleVoices.map(v => v.identifier));
      __DEV__ && console.log('Male voices:', maleVoices.map(v => v.identifier));
      __DEV__ && console.log('Unidentified voices:', unidentifiedVoices.map(v => v.identifier));

      // Assign female voice
      if (femaleVoices.length > 0) {
        const selected = selectBest(femaleVoices);
        if (selected) {
          this.femaleVoice = selected.identifier;
          __DEV__ && console.log('✓ Selected FEMALE voice:', selected.identifier);
        }
      }

      // Assign male voice
      if (maleVoices.length > 0) {
        const selected = selectBest(maleVoices);
        if (selected) {
          this.maleVoice = selected.identifier;
          __DEV__ && console.log('✓ Selected MALE voice:', selected.identifier);
        }
      }

      // If we couldn't identify genders but have voices, assign them
      if (!this.femaleVoice && !this.maleVoice && arabicVoices.length > 0) {
        // If only one voice available, use it for both
        if (arabicVoices.length === 1) {
          this.femaleVoice = arabicVoices[0].identifier;
          this.maleVoice = arabicVoices[0].identifier;
          this.hasMultipleVoices = false;
          __DEV__ && console.log('Only one voice available, using for both:', arabicVoices[0].identifier);
        } else {
          // Use first for female, second for male (arbitrary assignment)
          const sorted = [...arabicVoices].sort((a, b) => a.identifier.localeCompare(b.identifier));
          this.femaleVoice = sorted[0].identifier;
          this.maleVoice = sorted[1].identifier;
          this.hasMultipleVoices = true;
          __DEV__ && console.log('Assigned first voice as female:', this.femaleVoice);
          __DEV__ && console.log('Assigned second voice as male:', this.maleVoice);
        }
      } else if (!this.femaleVoice && this.maleVoice) {
        // Only found male, use it for female too
        this.femaleVoice = this.maleVoice;
        this.hasMultipleVoices = false;
        __DEV__ && console.log('No female voice found, using male for both');
      } else if (this.femaleVoice && !this.maleVoice) {
        // Only found female, use it for male too
        this.maleVoice = this.femaleVoice;
        this.hasMultipleVoices = false;
        __DEV__ && console.log('No male voice found, using female for both');
      } else if (this.femaleVoice && this.maleVoice) {
        // Both found
        this.hasMultipleVoices = this.femaleVoice !== this.maleVoice;
        __DEV__ && console.log('Both voices found, different:', this.hasMultipleVoices);
      }

      if (!this.femaleVoice && !this.maleVoice) {
        __DEV__ && console.log('⚠ No Arabic voice found, using system default');
      }

      this.voiceInitialized = true;
    } catch (error) {
      __DEV__ && console.log('Voice search error:', error);
      this.voiceInitialized = true;
    }
  }

  // Set preferred voice gender
  setVoiceGender(gender: VoiceGender): void {
    this.preferredGender = gender;
    __DEV__ && console.log('Voice gender set to:', gender);
  }

  // Get current voice gender preference
  getVoiceGender(): VoiceGender {
    return this.preferredGender;
  }

  // Swap male and female voices (in case detection was wrong)
  swapVoices(): void {
    const temp = this.femaleVoice;
    this.femaleVoice = this.maleVoice;
    this.maleVoice = temp;
    __DEV__ && console.log('Voices swapped!');
    __DEV__ && console.log('  Female voice now:', this.femaleVoice);
    __DEV__ && console.log('  Male voice now:', this.maleVoice);
  }

  // Reset voice initialization to re-detect voices
  resetVoices(): void {
    this.voiceInitialized = false;
    this.femaleVoice = null;
    this.maleVoice = null;
    __DEV__ && console.log('Voice initialization reset');
  }

  // Get current voice assignments for debugging
  getVoiceInfo(): { female: string | null; male: string | null; hasMultipleVoices: boolean } {
    return {
      female: this.femaleVoice,
      male: this.maleVoice,
      hasMultipleVoices: this.hasMultipleVoices,
    };
  }

  // Check if multiple Arabic voices are available
  hasMultipleArabicVoices(): boolean {
    return this.hasMultipleVoices;
  }

  // Initialize voices and return info (useful for UI to show status)
  async initializeAndGetVoiceInfo(): Promise<{ female: string | null; male: string | null; hasMultipleVoices: boolean }> {
    await this.findBestVoice();
    return this.getVoiceInfo();
  }

  // Preprocess Arabic text to help TTS read diacritics correctly
  private preprocessArabicText(text: string): string {
    // Arabic diacritics (harakat)
    const FATHA = '\u064E';      // ـَ
    const KASRA = '\u0650';      // ـِ
    const DAMMA = '\u064F';      // ـُ
    const SUKUN = '\u0652';      // ـْ
    const SHADDA = '\u0651';     // ـّ
    const FATHATAN = '\u064B';   // ـً
    const KASRATAN = '\u064D';   // ـٍ
    const DAMMATAN = '\u064C';   // ـٌ

    let trimmedText = text.trim();
    if (!trimmedText) return text;

    // Special handling for common words with shadda
    // Replace الله variants with phonetic spelling for proper TTS pronunciation
    // الله (Allah) - the doubled lam needs to be explicit

    // اللهم (Allahumma) - must be processed BEFORE الله to avoid partial replacement
    // Insert space to force TTS to pronounce "Al" then "lahumma" separately
    trimmedText = trimmedText.replace(/اللَّهُمَّ/g, 'أَلْ لَهُمَّ');  // Allahumma (with diacritics)
    trimmedText = trimmedText.replace(/اللهم/g, 'أَلْ لَهُمَّ');       // Allahumma (without diacritics)

    // الله (Allah) variants
    trimmedText = trimmedText.replace(/اللَّهِ/g, 'اَللاهِ');  // Allahi
    trimmedText = trimmedText.replace(/اللَّهُ/g, 'اَللاهُ');  // Allahu
    trimmedText = trimmedText.replace(/اللَّهَ/g, 'اَللاهَ');  // Allaha
    trimmedText = trimmedText.replace(/الله/g, 'اَللاه');     // Allah (without diacritics)
    trimmedText = trimmedText.replace(/لِلَّهِ/g, 'لِلَّاهِ');   // lillahi (lil-lahi)

    // Fix عَلَىٰ عَهْدِكَ ('ala 'ahdika) - TTS adds extra "kha" sound
    // Replace entire phrase with phonetically cleaner version
    trimmedText = trimmedText.replace(/عَلَىٰ عَهْدِكَ/g, 'عَلا أَهْدِكَ');
    trimmedText = trimmedText.replace(/عَلَى عَهْدِكَ/g, 'عَلا أَهْدِكَ');
    // Also fix standalone عَهْدِكَ
    trimmedText = trimmedText.replace(/عَهْدِكَ/g, 'أَهْدِكَ');
    trimmedText = trimmedText.replace(/عَهْدِك/g, 'أَهْدِك');

    // Get the last few characters to check ending
    const lastChar = trimmedText[trimmedText.length - 1];
    const lastTwoChars = trimmedText.slice(-2);

    // Check if text is very short (1-3 characters including diacritics)
    // This typically means it's a single letter with vowel marks
    const withoutDiacritics = trimmedText.replace(/[\u064B-\u065F\u0670]/g, '');

    if (withoutDiacritics.length <= 2) {
      // For single letters with diacritics, add a helping structure
      // This makes TTS engines pronounce the vowel properly

      // Check what vowel is present
      if (trimmedText.includes(FATHA) || trimmedText.includes(FATHATAN)) {
        // Add alif to extend the 'a' sound: بَ becomes بَا (baa)
        return trimmedText + 'ا';
      } else if (trimmedText.includes(KASRA) || trimmedText.includes(KASRATAN)) {
        // Add ya to extend the 'i' sound: بِ becomes بِي (bee)
        return trimmedText + 'ي';
      } else if (trimmedText.includes(DAMMA) || trimmedText.includes(DAMMATAN)) {
        // Add waw to extend the 'u' sound: بُ becomes بُو (boo)
        return trimmedText + 'و';
      } else if (trimmedText.includes(SUKUN)) {
        // For sukun, add a short vowel before to make it pronounceable
        // بْ becomes اَبْ (ab)
        return 'اَ' + trimmedText;
      } else if (trimmedText.includes(SHADDA)) {
        // For shadda alone, add fatha to make it clear
        return trimmedText + FATHA + 'ا';
      }
    }

    // For longer words: check if the word ends with a short vowel
    // TTS engines often drop final short vowels (pausal form)
    // We extend them to make the vowel audible

    // Check if ends with fatha (most common case like كَتَبَ)
    if (lastChar === FATHA) {
      // Add a soft alif to extend: كَتَبَ becomes كَتَبَا (katabaa - but sounds like kataba)
      return trimmedText + 'ا';
    }

    // Check if ends with kasra
    if (lastChar === KASRA) {
      // Add ya to extend the 'i' sound
      return trimmedText + 'ي';
    }

    // Check if ends with damma
    if (lastChar === DAMMA) {
      // Add waw to extend the 'u' sound
      return trimmedText + 'و';
    }

    // Check if ends with shadda + vowel (like حَقّ or رَبّ)
    if (lastTwoChars[0] === SHADDA) {
      if (lastChar === FATHA) {
        return trimmedText + 'ا';
      } else if (lastChar === KASRA) {
        return trimmedText + 'ي';
      } else if (lastChar === DAMMA) {
        return trimmedText + 'و';
      }
    }

    // Check if ends with ta marbuta (ة) + tanween
    // Ta marbuta should be pronounced as "t" when followed by tanween
    const TA_MARBUTA = '\u0629';  // ة
    const lastThreeChars = trimmedText.slice(-3);

    // Check for ta marbuta + tanween pattern
    if (lastThreeChars.length >= 2) {
      const secondToLast = trimmedText[trimmedText.length - 2];

      if (secondToLast === TA_MARBUTA || lastTwoChars[0] === TA_MARBUTA) {
        // Replace ة + tanween with ت + vowel + noon
        if (lastChar === DAMMATAN) {
          return trimmedText.slice(0, -2) + 'تُنْ';
        } else if (lastChar === KASRATAN) {
          return trimmedText.slice(0, -2) + 'تِنْ';
        } else if (lastChar === FATHATAN) {
          return trimmedText.slice(0, -2) + 'تَنْ';
        }
      }
    }

    // Check if ends with tanween (nunation) on regular letters
    // Replace tanween with vowel + noon for proper pronunciation

    // Dammatan (ـٌ) = "un" sound
    if (lastChar === DAMMATAN) {
      return trimmedText.slice(0, -1) + DAMMA + 'نْ';
    }

    // Kasratan (ـٍ) = "in" sound
    if (lastChar === KASRATAN) {
      return trimmedText.slice(0, -1) + KASRA + 'نْ';
    }

    // Fathatan (ـً) = "an" sound
    if (lastChar === FATHATAN) {
      return trimmedText.slice(0, -1) + FATHA + 'نْ';
    }

    return trimmedText;
  }

  async speakArabic(options: SpeakOptions): Promise<void> {
    const { text, rate = 1.0, onDone, onError } = options;

    if (!text || text.trim() === '') return;

    await this.configureAudio();

    if (this.isSpeaking) {
      await this.stop();
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    try {
      this.isSpeaking = true;

      // Free Google TTS reads fully-diacritized Arabic natively, so we send the
      // raw text (the old device-TTS pronunciation hacks would only hurt it).
      // `rate` is the pitch-corrected playback speed directly (1.0 = natural).
      const playbackRate = Math.max(0.5, Math.min(2.0, rate));

      await speakArabicOnce(text.trim(), {
        speed: playbackRate,
        onDone: () => {
          this.isSpeaking = false;
          onDone?.();
        },
        onError: (error) => {
          __DEV__ && console.log('Arabic TTS error:', error);
          this.isSpeaking = false;
          onError?.(error);
        },
      });
    } catch (error) {
      __DEV__ && console.log('Speak error:', error);
      this.isSpeaking = false;
      onError?.(error);
    }
  }

  /** Deliberately slower, for picking apart a word. Google renders it slow. */
  async speakSlow(text: string): Promise<void> {
    return this.speakArabic({ text, rate: 0.5 });
  }

  /** Normal means normal. This asked for 0.75 and everything sounded slurred. */
  async speakNormal(text: string): Promise<void> {
    return this.speakArabic({ text, rate: 1.0 });
  }

  async stop(): Promise<void> {
    try {
      stopArabic();
    } catch (error) {
      __DEV__ && console.log('Stop error:', error);
    }
    try {
      await Speech.stop();
    } catch {}
    this.isSpeaking = false;
  }

  getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      return voices.some(voice => voice.language.startsWith('ar'));
    } catch {
      return false;
    }
  }

  // For debugging - list all Arabic voices
  async listArabicVoices(): Promise<void> {
    const voices = await Speech.getAvailableVoicesAsync();
    const arabic = voices.filter(v => v.language.startsWith('ar'));
    __DEV__ && console.log('=== Available Arabic Voices ===');
    arabic.forEach(v => {
      __DEV__ && console.log(`${v.name || v.identifier}`);
      __DEV__ && console.log(`  ID: ${v.identifier}`);
      __DEV__ && console.log(`  Language: ${v.language}`);
      __DEV__ && console.log(`  Quality: ${v.quality}`);
      __DEV__ && console.log('---');
    });
  }

  async testAudioOutput(): Promise<void> {
    try {
      await this.configureAudio();
      Speech.speak('Test', {
        language: 'en-US',
        rate: 1.0,
        onError: (error) => { __DEV__ && console.warn('TTS test error:', error); },
      });
    } catch (error) {
      __DEV__ && console.warn('Audio test error:', error);
    }
  }

  async testEnglish(): Promise<void> {
    await this.configureAudio();
    Speech.speak('Hello, testing audio', {
      language: 'en-US',
      rate: 0.8,
      onError: (error) => { __DEV__ && console.warn('TTS test error:', error); },
    });
  }
}

export const audioService = new AudioService();

registerAudioProducer('audioService', 'speech', () => audioService.stop());
export default audioService;
