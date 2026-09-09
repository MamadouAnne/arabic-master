/**
 * Story narration — one sentence at a time, spoken exactly once.
 *
 * The previous version started an utterance and then ALSO polled
 * `isSpeakingAsync` to decide it had finished. Both paths could fire, and
 * between them a paragraph could be announced twice, or the queue could
 * advance while the voice was still talking and end up speaking over itself.
 * That is the whole reason a listener hears a line repeat.
 *
 * So the contract here is narrow and strict:
 *
 *   `speak()` resolves EXACTLY ONCE, with why it ended.
 *
 * Whoever owns the queue awaits that promise and advances on 'done'. On
 * 'stopped' it must not advance — something else took over. A generation
 * counter makes a superseded utterance unable to report anything at all.
 *
 * Pause is real pause where the platform has it: the promise simply stays
 * pending while the voice is suspended, so resuming continues mid-sentence
 * and no word is ever said twice. Where the platform lacks it we stop, and
 * the queue resumes at the start of that one sentence — the smallest repeat
 * possible, and the only one in the system.
 */
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';
import { setAudioModeAsync } from 'expo-audio';
import { registerAudioProducer, claimAudio } from './audioBus';

export type SpeakResult = 'done' | 'stopped' | 'error';
export type NarrationLang = 'en' | 'fr';

/**
 * Rate passed to the engine. expo-speech takes a multiplier where 1 is the
 * platform default, which is markedly faster than a person reads aloud, so
 * every step sits below it: 1x here is a measured storytelling pace.
 */
const RATE: Record<number, number> = {
  0.75: 0.52,
  1: 0.68,
  1.25: 0.84,
  1.5: 1.0,
};

const VOICE_HINTS: Record<NarrationLang, string[]> = {
  // Clear, warm, widely installed. Order is preference.
  en: ['samantha', 'karen', 'daniel', 'moira', 'serena', 'alex'],
  fr: ['thomas', 'audrey', 'aurelie', 'amelie', 'marie'],
};

/** Roughly how fast the engine gets through words, for time-remaining. */
const WORDS_PER_MINUTE = 150;

export function estimateSeconds(text: string, speed: number): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const rate = RATE[speed] ?? RATE[1];
  // RATE[1] is the reference pace; scale from there.
  return (words / WORDS_PER_MINUTE) * 60 * (RATE[1] / rate);
}

class StoryAudioService {
  private generation = 0;
  private audioConfigured = false;
  private voices: Partial<Record<NarrationLang, string | undefined>> = {};
  private voicesLoadedFor = new Set<NarrationLang>();
  private paused = false;
  private supportsPause: boolean | null = null;

  private async configureAudio(): Promise<void> {
    if (this.audioConfigured) return;
    try {
      await setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'duckOthers' });
      this.audioConfigured = true;
    } catch (e) {
      __DEV__ && console.log('[story audio] audio mode:', e);
    }
  }

  private async pickVoice(lang: NarrationLang): Promise<void> {
    if (this.voicesLoadedFor.has(lang)) return;
    this.voicesLoadedFor.add(lang);
    try {
      const all = await Speech.getAvailableVoicesAsync();
      const matching = all.filter((v) => v.language?.toLowerCase().startsWith(lang));
      const byName = (name: string) =>
        matching.find((v) => v.identifier?.toLowerCase().includes(name) && v.quality === 'Enhanced') ||
        matching.find((v) => v.identifier?.toLowerCase().includes(name));

      let chosen: string | undefined;
      for (const hint of VOICE_HINTS[lang]) {
        const v = byName(hint);
        if (v) {
          chosen = v.identifier;
          break;
        }
      }
      this.voices[lang] =
        chosen || matching.find((v) => v.quality === 'Enhanced')?.identifier || matching[0]?.identifier;
      __DEV__ && console.log(`[story audio] ${lang} voice:`, this.voices[lang]);
    } catch (e) {
      __DEV__ && console.log('[story audio] voices:', e);
    }
  }

  /** Warm up audio session and voice list so the first tap is not slow. */
  async prime(lang: NarrationLang): Promise<void> {
    await this.configureAudio();
    await this.pickVoice(lang);
  }

  async listVoices(lang: NarrationLang): Promise<Speech.Voice[]> {
    try {
      const all = await Speech.getAvailableVoicesAsync();
      return all.filter((v) => v.language?.toLowerCase().startsWith(lang));
    } catch {
      return [];
    }
  }

  setVoice(lang: NarrationLang, identifier: string | undefined): void {
    this.voices[lang] = identifier;
    this.voicesLoadedFor.add(lang);
  }

  getVoice(lang: NarrationLang): string | undefined {
    return this.voices[lang];
  }

  /**
   * Speak one sentence. Resolves once, when the voice actually finished, was
   * stopped, or failed. Never resolves twice, and a superseded call resolves
   * 'stopped' without touching shared state.
   */
  speak(text: string, speed: number, lang: NarrationLang): Promise<SpeakResult> {
    claimAudio('story');
    const body = text?.trim();
    if (!body) return Promise.resolve('done');

    const generation = ++this.generation;
    this.paused = false;

    return new Promise<SpeakResult>((resolve) => {
      let settled = false;
      let watchdog: ReturnType<typeof setTimeout> | null = null;

      const finish = (result: SpeakResult) => {
        if (settled) return;
        settled = true;
        if (watchdog) clearTimeout(watchdog);
        resolve(result);
      };

      // A superseded utterance must not report progress to the queue that
      // replaced it.
      const guard = (result: SpeakResult) => finish(generation === this.generation ? result : 'stopped');

      try {
        Speech.speak(body, {
          language: lang === 'fr' ? 'fr-FR' : 'en-US',
          voice: this.voices[lang],
          rate: RATE[speed] ?? RATE[1],
          pitch: 1.02,
          onDone: () => guard('done'),
          onStopped: () => guard('stopped'),
          onError: () => guard('error'),
        });
      } catch (e) {
        __DEV__ && console.log('[story audio] speak threw:', e);
        finish('error');
        return;
      }

      // Some engines never call onDone. Without a backstop the queue would
      // hang forever on one sentence, so allow generous headroom and then
      // treat it as finished. The `settled` guard means a late real callback
      // cannot double-advance.
      const budget = (estimateSeconds(body, speed) + 6) * 1000 * 2.5;
      const check = async () => {
        if (settled) return;
        // Paused is not stalled. Waiting here is what keeps a long pause from
        // advancing the queue behind the listener's back.
        if (this.paused) {
          watchdog = setTimeout(check, budget);
          return;
        }
        try {
          if (await Speech.isSpeakingAsync()) {
            // Genuinely a long sentence — give it the same budget again
            // rather than cutting the voice off.
            watchdog = setTimeout(check, budget);
            return;
          }
        } catch {
          /* fall through and finish */
        }
        guard('done');
      };
      watchdog = setTimeout(check, budget);
    });
  }

  /**
   * Suspend the current sentence. Returns true when the platform really
   * paused (the pending `speak()` promise stays pending); false when it could
   * only be stopped, which settles that promise as 'stopped'.
   */
  async pause(): Promise<boolean> {
    if (Platform.OS !== 'ios' || this.supportsPause === false) {
      this.supportsPause = false;
      await this.stop();
      return false;
    }
    try {
      await Speech.pause();
      this.paused = true;
      this.supportsPause = true;
      return true;
    } catch {
      this.supportsPause = false;
      await this.stop();
      return false;
    }
  }

  async resume(): Promise<void> {
    if (!this.paused) return;
    try {
      await Speech.resume();
    } catch {
      /* the queue restarts the sentence instead */
    }
    this.paused = false;
  }

  /** Silence everything and invalidate any in-flight utterance. */
  async stop(): Promise<void> {
    this.generation++;
    this.paused = false;
    try {
      await Speech.stop();
    } catch {
      /* already quiet */
    }
  }

  isPaused(): boolean {
    return this.paused;
  }
}

export const storyAudioService = new StoryAudioService();

registerAudioProducer('story', 'longform', () => storyAudioService.stop());

export default storyAudioService;
