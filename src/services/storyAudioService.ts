/**
 * Story narration — one sentence at a time, spoken exactly once.
 *
 * Two things make it sound like a person rather than a machine, both taken
 * from the approach proven in English 2.0:
 *
 *   1. ASK FOR THE GOOD VOICE. expo-speech with no `voice` uses the system
 *      default, which on both platforms is the small "compact" cut — the
 *      flat, clipped one that sounds synthetic. Both platforms also ship a
 *      far more natural neural voice that costs nothing to request and is
 *      simply never chosen by default. iOS labels those Enhanced/Premium;
 *      Android exposes network voices whose identifiers carry a variant tag.
 *      `bestVoice` scores the list and takes the best one.
 *   2. ON iOS, PREFER GOOGLE'S VOICE. AVSpeechSynthesizer on iOS 17/18 is
 *      both duller and genuinely unstable — driving a whole story through it
 *      crashed the app — so online we fetch the audio and play it. Offline,
 *      or once Google refuses, we fall back to the on-device voice from (1).
 *
 *      Do not make the device voice primary on iOS to gain some other
 *      feature. That was tried, to allow choosing a gender, and it cost both
 *      the voice quality and stability. Gender applies to the device voice,
 *      which is Android and offline iOS.
 *
 *   3. HOLD ONE ENGINE PER SESSION. It is chosen on the first sentence and
 *      only ever degrades. Deciding per sentence let one failed fetch swap
 *      the voice mid-chapter and swap back thirty seconds later.
 *
 * The playback contract is unchanged and strict, because it is what stops a
 * listener ever hearing a line twice:
 *
 *   `speak()` resolves EXACTLY ONCE, with why it ended.
 *
 * The queue advances only on 'done'. A generation counter makes a superseded
 * utterance unable to report anything at all, whichever path produced it.
 */
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';
import * as Network from 'expo-network';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';
import { registerAudioProducer, claimAudio } from './audioBus';
import { chunkForUrl } from './narrationText';

export type SpeakResult = 'done' | 'stopped' | 'error';
export type NarrationLang = 'en' | 'fr';
export type VoiceGender = 'female' | 'male';

/**
 * Voices carry no gender field, so it has to be read off the identifier.
 * Android usually says so outright (`#male_1`); Apple only gives a name.
 */
const FEMALE_NAMES = [
  'samantha', 'karen', 'moira', 'tessa', 'fiona', 'ava', 'allison', 'susan', 'nicky',
  'serena', 'kate', 'martha', 'catherine', 'zoe', 'joelle', 'sandy', 'shelley', 'flo',
  'audrey', 'aurelie', 'amelie', 'marie', 'chantal', 'virginie', 'celine',
];
const MALE_NAMES = [
  'alex', 'daniel', 'fred', 'tom', 'aaron', 'nathan', 'oliver', 'rishi', 'gordon',
  'arthur', 'evan', 'ralph', 'reed', 'rocko', 'eddy', 'junior',
  'thomas', 'nicolas', 'paul', 'mathieu', 'sebastien',
];

/**
 * Rate for the on-device voice. 1 is the platform default, which reads a
 * touch fast for a story, so the scale sits just under it. The enhanced
 * voices lose their warmth if pushed much past 1.2.
 */
const DEVICE_RATE: Record<number, number> = {
  0.75: 0.78,
  1: 0.92,
  1.25: 1.06,
  1.5: 1.2,
};

/** Roughly how fast either path gets through words, for time-remaining. */
const WORDS_PER_MINUTE = 155;

/** Google's endpoint refuses long strings; this is a safe clip length. */
const URL_CHUNK = 180;

/** How long to stop trying Google after it fails, so taps do not stall. */
const NETWORK_BACKOFF_MS = 30_000;

/** After it fails twice, stop asking for the rest of the session. */
const SESSION_BACKOFF_MS = 24 * 60 * 60 * 1000;

export function estimateSeconds(text: string, speed: number): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return (words / WORDS_PER_MINUTE) * 60 * (1 / (speed || 1));
}

class StoryAudioService {
  private generation = 0;
  private audioConfigured = false;
  private paused = false;
  private supportsDevicePause: boolean | null = null;
  private voiceCache = new Map<string, string | undefined>();
  private gender: VoiceGender = 'female';
  /**
   * Which engine this listening session settled on. Chosen once and only ever
   * degraded: hearing the voice change halfway through a chapter is worse
   * than anything either engine does badly.
   */
  private sessionEngine: 'device' | 'network' | null = null;
  private players = new Set<AudioPlayer>();
  private deviceSpeaking = false;
  private networkUnavailableUntil = 0;
  private networkFailures = 0;
  private onlineCheckedAt = 0;
  private onlineCached = true;

  // -- audio session ------------------------------------------------------

  /**
   * Configured once and left alone. Tearing the session down between
   * sentences is what would let the system suspend the app mid-story.
   *
   * The two flags are the whole of background listening, and match what the
   * reciter already uses:
   *
   *   `shouldPlayInBackground` keeps the session alive once the screen
   *   locks. It defaults to false, which is why narration stopped dead the
   *   moment the phone went to sleep.
   *
   *   `doNotMix` makes this the PRIMARY session. iOS only offers lock-screen
   *   controls to primary audio; a mixable session gets none. It also means
   *   a story politely takes over from whatever else was playing, which is
   *   what someone pressing play on a story expects.
   */
  private async configureAudio(): Promise<void> {
    if (this.audioConfigured) return;
    this.audioConfigured = true;
    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: true,
        interruptionMode: 'doNotMix',
      });
      // iOS needs a moment to bring the session up before the first clip.
      await new Promise((r) => setTimeout(r, 50));
    } catch (e) {
      __DEV__ && console.log('[story audio] audio mode:', e);
    }
  }

  // -- voice selection ----------------------------------------------------

  /**
   * The best installed voice for a language. Scored rather than matched by
   * name, because the good voices are named differently on every platform and
   * only their quality flags and identifier tags are dependable.
   */
  private genderOf(voice: { identifier?: string; name?: string }): VoiceGender | undefined {
    const hay = `${voice.identifier || ''} ${voice.name || ''}`.toLowerCase();
    if (hay.includes('female')) return 'female';
    // 'female' also contains 'male', so require a non-e before it.
    if (/(^|[^e])male/.test(hay)) return 'male';
    for (const n of FEMALE_NAMES) if (hay.includes(n)) return 'female';
    for (const n of MALE_NAMES) if (hay.includes(n)) return 'male';
    return undefined;
  }

  private async bestVoice(locale: string): Promise<string | undefined> {
    const key = `${locale}:${this.gender}`;
    if (this.voiceCache.has(key)) return this.voiceCache.get(key);

    let chosen: string | undefined;
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      const want = locale.toLowerCase();
      const short = want.split('-')[0];
      const candidates = voices.filter((v) => {
        const vl = (v.language || '').toLowerCase();
        return vl === want || vl.replace('_', '-') === want || vl.startsWith(short);
      });

      const score = (v: (typeof voices)[number]) => {
        const id = (v.identifier || '').toLowerCase();
        const quality = String(v.quality || '').toLowerCase();
        let n = 0;
        if (quality.includes('enhanced') || quality.includes('premium')) n += 100;
        if (id.includes('premium')) n += 60;
        if (id.includes('enhanced')) n += 50;
        if (id.includes('-network')) n += 45; // Android neural voices
        if (id.includes('siri')) n += 40;
        if (id.includes('-local')) n += 10;
        if (id.includes('compact')) n -= 50;
        if ((v.language || '').toLowerCase().replace('_', '-') === want) n += 15;
        return n;
      };

      // Honour the chosen gender when the device has one; otherwise take the
      // best voice it does have rather than refusing to speak.
      const matching = candidates.filter((v) => this.genderOf(v) === this.gender);
      const pool = matching.length ? matching : candidates;
      pool.sort((a, b) => score(b) - score(a));
      chosen = pool[0]?.identifier;
      __DEV__ && console.log(`[story audio] ${locale} ${this.gender} voice:`, chosen);
    } catch (e) {
      __DEV__ && console.log('[story audio] voices:', e);
    }

    this.voiceCache.set(key, chosen);
    return chosen;
  }

  /**
   * Changing this re-picks the voice on the next sentence. It does not
   * disturb the engine: the cache is keyed by gender, and forcing a session
   * back onto the device engine to honour a gender is what crashed iOS.
   */
  setGender(gender: VoiceGender): void {
    this.gender = gender;
  }

  /** Which engine this session settled on, once it has spoken. */
  getEngine(): 'device' | 'network' | null {
    return this.sessionEngine;
  }

  getGender(): VoiceGender {
    return this.gender;
  }

  /** Called when a story stops, so the next one re-chooses its engine. */
  resetSession(): void {
    this.sessionEngine = null;
  }

  private localeFor(lang: NarrationLang): string {
    return lang === 'fr' ? 'fr-FR' : 'en-US';
  }

  /** Warm the audio session and voice list so the first tap is not slow. */
  async prime(lang: NarrationLang): Promise<void> {
    await this.configureAudio();
    await this.bestVoice(this.localeFor(lang));
  }

  // -- players ------------------------------------------------------------

  /**
   * Pausing before removing matters: releasing a player while it is sounding
   * does not reliably cut the audio, which is how a "stopped" voice carries
   * on talking.
   */
  private killPlayer(player: AudioPlayer) {
    // Idempotent on purpose. Two things race to release a clip: whoever
    // supersedes it calls killAllPlayers, and the clip's own settle path
    // calls this too. Releasing a native player twice reaches memory that is
    // already gone, which crashes the app rather than throwing something
    // try/catch could hold. The set is the record of what is still live, so
    // deleting first is what makes a second call harmless.
    if (!this.players.delete(player)) return;
    try {
      player.removeAllListeners('playbackStatusUpdate');
    } catch {}
    try {
      player.pause();
    } catch {}
    try {
      player.remove();
    } catch {}
  }

  private killAllPlayers() {
    for (const player of Array.from(this.players)) this.killPlayer(player);
    this.players.clear();
  }

  private async isOnline(): Promise<boolean> {
    // Asking per sentence would put a stall before every line of the story.
    if (Date.now() - this.onlineCheckedAt < 15_000) return this.onlineCached;
    try {
      const state = await Network.getNetworkStateAsync();
      this.onlineCached = state.isInternetReachable ?? state.isConnected ?? true;
    } catch {
      this.onlineCached = true; // the network path fails safe on its own
    }
    this.onlineCheckedAt = Date.now();
    return this.onlineCached;
  }

  // -- speaking -----------------------------------------------------------

  /**
   * Speak one sentence. Resolves once, when the voice actually finished, was
   * stopped, or failed. A superseded call resolves 'stopped' without touching
   * shared state.
   */
  async speak(text: string, speed: number, lang: NarrationLang): Promise<SpeakResult> {
    claimAudio('story');
    const body = text?.trim();
    if (!body) return 'done';

    const generation = ++this.generation;
    this.paused = false;
    this.killAllPlayers();

    // Silence a device utterance we are superseding. Without this the old one
    // keeps talking under the new one.
    if (this.deviceSpeaking) {
      this.deviceSpeaking = false;
      try {
        await Speech.stop();
      } catch {}
    }

    await this.configureAudio();
    if (generation !== this.generation) return 'stopped';

    // Chosen once per session, then held. Deciding per sentence is what made
    // the voice change halfway through a chapter.
    if (this.sessionEngine === null) {
      const canFetch =
        Platform.OS === 'ios' && Date.now() >= this.networkUnavailableUntil && (await this.isOnline());
      if (generation !== this.generation) return 'stopped';
      this.sessionEngine = canFetch ? 'network' : 'device';
    }

    if (this.sessionEngine === 'network') return this.speakOnline(body, speed, lang, generation);
    return this.speakOnDevice(body, speed, lang, generation);
  }

  /** Google's voice, fetched a clip at a time and played in order. */
  private async speakOnline(
    body: string,
    speed: number,
    lang: NarrationLang,
    generation: number
  ): Promise<SpeakResult> {
    const chunks = chunkForUrl(body, URL_CHUNK);
    let spoken = 0;

    try {
      for (const chunk of chunks) {
        if (generation !== this.generation) return 'stopped';
        await this.playClip(chunk, speed, lang, generation);
        spoken += 1;
      }
      return generation === this.generation ? 'done' : 'stopped';
    } catch {
      if (generation !== this.generation) return 'stopped';
      // Offline, blocked or stalled. Stop trying for a while and finish this
      // sentence with the on-device voice — but only the part not yet heard,
      // or the listener gets the beginning of it twice.
      // Switching voices back and forth mid-story is worse than settling for
      // the device voice, so a second failure retires the network path for
      // the rest of the session rather than retrying every half minute.
      this.networkFailures += 1;
      this.networkUnavailableUntil =
        Date.now() + (this.networkFailures >= 2 ? SESSION_BACKOFF_MS : NETWORK_BACKOFF_MS);
      this.sessionEngine = 'device';
      const remaining = chunks.slice(spoken).join(' ');
      if (!remaining) return 'done';
      return this.speakOnDevice(remaining, speed, lang, generation);
    }
  }

  /** One clip. Resolves when it finishes, rejects if it never starts. */
  private playClip(chunk: string, speed: number, lang: NarrationLang, generation: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const url =
        `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}` +
        `&client=tw-ob&ttsspeed=1&q=${encodeURIComponent(chunk)}`;

      let started = false;
      let settled = false;
      const player = createAudioPlayer({ uri: url });
      this.players.add(player);

      try {
        player.shouldCorrectPitch = true;
        player.setPlaybackRate(speed, 'high');
      } catch {
        /* rate is a nicety; the clip still plays at normal speed */
      }

      const settle = (fn: () => void) => {
        if (settled) return;
        settled = true;
        clearTimeout(startTimer);
        if (endTimer) clearTimeout(endTimer);
        clearInterval(staleCheck);
        this.killPlayer(player);
        fn();
      };

      // Nothing playing within five seconds is the signature of a blocked or
      // offline fetch. Paused does not count against it — waiting out a pause
      // and then giving up would strand the clip, so reschedule instead.
      let startTimer: ReturnType<typeof setTimeout>;
      const waitForStart = () => {
        startTimer = setTimeout(() => {
          if (started) return;
          if (this.paused) {
            waitForStart();
            return;
          }
          settle(() => reject(new Error('tts-timeout')));
        }, 5000);
      };
      waitForStart();

      // And once it is playing, a clip that stops reporting status must not
      // hang the queue.
      let endTimer: ReturnType<typeof setTimeout> | null = null;
      const armEnd = () => {
        if (endTimer) clearTimeout(endTimer);
        endTimer = setTimeout(() => {
          if (this.paused) {
            armEnd();
            return;
          }
          settle(resolve);
        }, (estimateSeconds(chunk, speed) + 10) * 1000);
      };

      const staleCheck = setInterval(() => {
        if (generation !== this.generation) settle(resolve);
      }, 60);

      player.addListener('playbackStatusUpdate', (status) => {
        if (status.playing || status.currentTime > 0) {
          if (!started) {
            started = true;
            clearTimeout(startTimer);
            armEnd();
          }
        }
        // `duration` is 0 until the clip loads. Without this guard the
        // finished test is true on the first tick and every clip is skipped.
        const durationKnown = typeof status.duration === 'number' && status.duration > 0;
        const ranOut =
          durationKnown &&
          status.playing === false &&
          status.currentTime > 0 &&
          status.currentTime >= status.duration - 0.1;
        if (status.didJustFinish || ranOut) settle(resolve);
      });

      player.play();
    });
  }

  /** The on-device voice, chosen for quality rather than left to default. */
  private async speakOnDevice(
    body: string,
    speed: number,
    lang: NarrationLang,
    generation: number
  ): Promise<SpeakResult> {
    const locale = this.localeFor(lang);
    const voice = await this.bestVoice(locale);
    if (generation !== this.generation) return 'stopped';

    return new Promise<SpeakResult>((resolve) => {
      let settled = false;
      let watchdog: ReturnType<typeof setTimeout> | null = null;

      const finish = (result: SpeakResult) => {
        if (settled) return;
        settled = true;
        if (watchdog) clearTimeout(watchdog);
        if (generation === this.generation) this.deviceSpeaking = false;
        resolve(result);
      };
      const guard = (result: SpeakResult) => finish(generation === this.generation ? result : 'stopped');

      this.deviceSpeaking = true;

      try {
        Speech.speak(body, {
          language: locale,
          voice,
          rate: DEVICE_RATE[speed] ?? DEVICE_RATE[1],
          // Exactly 1. Any deviation gives the enhanced voices a chipmunk edge.
          pitch: 1.0,
          onDone: () => guard('done'),
          onStopped: () => guard('stopped'),
          onError: () => guard('error'),
        });
      } catch (e) {
        __DEV__ && console.log('[story audio] speak threw:', e);
        finish('error');
        return;
      }

      // Some engines never report completion. Without a backstop the queue
      // would hang on one sentence forever.
      const budget = (estimateSeconds(body, speed) + 6) * 1000 * 2.5;
      const check = async () => {
        if (settled) return;
        // Paused is not stalled.
        if (this.paused) {
          watchdog = setTimeout(check, budget);
          return;
        }
        try {
          if (await Speech.isSpeakingAsync()) {
            watchdog = setTimeout(check, budget);
            return;
          }
        } catch {
          /* fall through */
        }
        guard('done');
      };
      watchdog = setTimeout(check, budget);
    });
  }

  // -- transport ----------------------------------------------------------

  /**
   * Suspend the current sentence. True when it really paused, so the pending
   * `speak()` promise stays pending and resuming continues mid-sentence.
   * False when it could only be stopped, which settles that promise.
   */
  async pause(): Promise<boolean> {
    if (this.players.size > 0) {
      this.paused = true;
      for (const player of this.players) {
        try {
          player.pause();
        } catch {}
      }
      return true;
    }

    if (Platform.OS !== 'ios' || this.supportsDevicePause === false) {
      this.supportsDevicePause = false;
      await this.stop();
      return false;
    }
    try {
      await Speech.pause();
      this.paused = true;
      this.supportsDevicePause = true;
      return true;
    } catch {
      this.supportsDevicePause = false;
      await this.stop();
      return false;
    }
  }

  async resume(): Promise<void> {
    if (!this.paused) return;
    this.paused = false;
    if (this.players.size > 0) {
      for (const player of this.players) {
        try {
          player.play();
        } catch {}
      }
      return;
    }
    try {
      await Speech.resume();
    } catch {
      /* the queue restarts the sentence instead */
    }
  }

  /** Silence everything and invalidate any in-flight utterance. */
  async stop(): Promise<void> {
    this.generation++;
    this.paused = false;
    this.deviceSpeaking = false;
    this.killAllPlayers();
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
