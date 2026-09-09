/**
 * Listening to a story.
 *
 * The story is flattened once into a queue of sentence-sized utterances, each
 * remembering which block it came from. Playback is a single async loop over
 * that queue, and the loop is owned by a "run" number: starting playback
 * increments it, and any older loop that wakes up to find the number changed
 * returns without speaking or advancing.
 *
 * That is the whole defence against hearing something twice. Every control —
 * play, pause, skip, speed, changing chapter, leaving the screen — either
 * lets the current loop continue or supersedes it; nothing ever leaves two
 * loops running, and a superseded loop cannot advance the index it no longer
 * owns.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocalizedContent } from './useLocalizedContent';
import { useSettingsStore } from '../stores/settingsStore';
import {
  storyAudioService,
  estimateSeconds,
  NarrationLang,
  VoiceGender,
} from '../services/storyAudioService';
import { prepareForSpeech, splitSentences, speechKey } from '../services/narrationText';

export type NarrationStatus = 'idle' | 'loading' | 'playing' | 'paused';
export type NarrationSpeed = 0.75 | 1 | 1.25 | 1.5;
/** Minutes, or off. Listening at night is the reason this exists. */
export type SleepOption = 'off' | 5 | 15 | 30 | 45;

/** The shape both prophet-story and Quran-story blocks already have. */
export interface NarratableBlock {
  id: string;
  type: 'narrative' | 'quran_source' | 'hadith_source';
  content: string;
  contentFr?: string;
  source?: {
    type: 'quran' | 'hadith';
    translation: string;
    translationFr?: string;
  } | null;
}

interface Utterance {
  text: string;
  blockId: string;
  blockIndex: number;
  seconds: number;
}

/** Breath between sentences, and a longer settling pause between blocks. */
const GAP_SENTENCE = 260;
const GAP_BLOCK = 620;

export function useStoryNarration(blocks: NarratableBlock[]) {
  // Narration follows the same language setting the text on screen does, so
  // the voice never reads English while the reader shows French.
  const { lc, language } = useLocalizedContent();
  const lang: NarrationLang = language === 'fr' ? 'fr' : 'en';

  const voice = useSettingsStore((s) => s.narrationVoice);
  const storeVoice = useSettingsStore((s) => s.setNarrationVoice);

  const [status, setStatus] = useState<NarrationStatus>('idle');
  const [index, setIndex] = useState(0);
  const [speed, setSpeedState] = useState<NarrationSpeed>(1);
  const [sleep, setSleep] = useState<SleepOption>('off');
  const [engine, setEngine] = useState<'device' | 'network' | null>(null);

  const runRef = useRef(0);
  const indexRef = useRef(0);
  const speedRef = useRef<NarrationSpeed>(1);
  const pausedByStopRef = useRef(false);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);
  useEffect(() => {
    storyAudioService.setGender(voice);
  }, [voice]);

  /**
   * Flatten the story. A source block reads its caption and then the
   * translation; when the caption merely restates the line before it, it is
   * dropped rather than said twice.
   */
  const utterances = useMemo<Utterance[]>(() => {
    const out: Utterance[] = [];
    let lastKey = '';

    const push = (raw: string, blockId: string, blockIndex: number) => {
      const prepared = prepareForSpeech(raw, lang);
      for (const sentence of splitSentences(prepared)) {
        const key = speechKey(sentence);
        if (!key || key === lastKey) continue;
        lastKey = key;
        out.push({ text: sentence, blockId, blockIndex, seconds: 0 });
      }
    };

    blocks.forEach((block, blockIndex) => {
      const caption = lc(block.content, block.contentFr);
      if (block.type === 'narrative') {
        push(caption, block.id, blockIndex);
        return;
      }
      push(caption, block.id, blockIndex);
      const translation = block.source ? lc(block.source.translation, block.source.translationFr) : '';
      if (translation) push(translation, block.id, blockIndex);
    });

    return out;
  }, [blocks, lang, lc]);

  const totalSeconds = useMemo(
    () => utterances.reduce((sum, u) => sum + estimateSeconds(u.text, speed), 0),
    [utterances, speed]
  );

  const remainingSeconds = useMemo(() => {
    let sum = 0;
    for (let i = index; i < utterances.length; i++) sum += estimateSeconds(utterances[i].text, speed);
    return sum;
  }, [utterances, index, speed]);

  const current = utterances[index];
  const currentBlockId = current?.blockId ?? null;
  const currentBlockIndex = current?.blockIndex ?? 0;

  /** The loop. Owns `run`; exits the moment it stops being current. */
  const run = useCallback(
    async (from: number) => {
      const mine = ++runRef.current;
      pausedByStopRef.current = false;

      setStatus('loading');
      await storyAudioService.prime(lang);
      if (mine !== runRef.current) return;
      setStatus('playing');

      for (let i = from; i < utterances.length; i++) {
        if (mine !== runRef.current) return;

        setIndex(i);
        indexRef.current = i;

        const utterance = utterances[i];
        const result = await storyAudioService.speak(utterance.text, speedRef.current, lang);
        setEngine(storyAudioService.getEngine());

        if (mine !== runRef.current) return;
        if (result === 'error') {
          setStatus('idle');
          return;
        }
        if (result !== 'done') return; // stopped by someone else — do not advance

        const next = utterances[i + 1];
        const gap = next && next.blockIndex !== utterance.blockIndex ? GAP_BLOCK : GAP_SENTENCE;
        await new Promise((r) => setTimeout(r, gap));
        if (mine !== runRef.current) return;
      }

      if (mine !== runRef.current) return;
      setStatus('idle');
      setIndex(0);
      indexRef.current = 0;
    },
    [utterances, lang]
  );

  const start = useCallback(
    (fromIndex = 0) => {
      void run(Math.max(0, Math.min(fromIndex, Math.max(0, utterances.length - 1))));
    },
    [run, utterances.length]
  );

  const stop = useCallback(async () => {
    runRef.current++;
    pausedByStopRef.current = false;
    storyAudioService.resetSession();
    await storyAudioService.stop();
    setStatus('idle');
    setIndex(0);
    indexRef.current = 0;
  }, []);

  /**
   * Pause without killing the loop where the platform supports it: the
   * pending utterance promise simply stays pending, so resuming picks the
   * sentence up mid-word. Where it does not, the loop ends and resuming
   * restarts that one sentence.
   */
  const pause = useCallback(async () => {
    const reallyPaused = await storyAudioService.pause();
    pausedByStopRef.current = !reallyPaused;
    setStatus('paused');
  }, []);

  // Sleep timer. It pauses rather than stops, so the story is exactly where
  // it was left when the listener comes back to it.
  useEffect(() => {
    if (sleep === 'off') return;
    const handle = setTimeout(() => {
      void pause();
      setSleep('off');
    }, sleep * 60 * 1000);
    return () => clearTimeout(handle);
  }, [sleep, pause]);

  const resume = useCallback(async () => {
    if (pausedByStopRef.current) {
      pausedByStopRef.current = false;
      void run(indexRef.current);
      return;
    }
    setStatus('playing');
    await storyAudioService.resume();
  }, [run]);

  const toggle = useCallback(() => {
    if (status === 'playing') void pause();
    else if (status === 'paused') void resume();
    else start(indexRef.current);
  }, [status, pause, resume, start]);

  /** Jump whole blocks — a paragraph is the unit a listener thinks in. */
  const skipBlocks = useCallback(
    (delta: number) => {
      if (!utterances.length) return;
      const here = utterances[indexRef.current]?.blockIndex ?? 0;
      const target = here + delta;
      let candidate = utterances.findIndex((u) => u.blockIndex === target);
      if (candidate === -1) candidate = delta < 0 ? 0 : utterances.length - 1;
      void run(candidate);
    },
    [utterances, run]
  );

  const seekToBlock = useCallback(
    (blockIndex: number) => {
      const candidate = utterances.findIndex((u) => u.blockIndex === blockIndex);
      if (candidate >= 0) void run(candidate);
    },
    [utterances, run]
  );

  const seekToFraction = useCallback(
    (fraction: number) => {
      if (!utterances.length) return;
      const target = Math.round(fraction * (utterances.length - 1));
      void run(Math.max(0, Math.min(target, utterances.length - 1)));
    },
    [utterances, run]
  );

  const setVoice = useCallback(
    (next: VoiceGender) => {
      if (next === voice) return;
      storeVoice(next);
      storyAudioService.setGender(next);
      // Lands on the next sentence, like speed does. Restarting the current
      // one to make it audible immediately meant tearing a clip down while it
      // was playing, and that crashed the app.
    },
    [voice, storeVoice]
  );

  const setSpeed = useCallback((next: NarrationSpeed) => {
    // The engine fixes rate when an utterance starts, so this lands on the
    // next sentence. Restarting the current one to apply it sooner would mean
    // saying it twice, which is never worth it.
    setSpeedState(next);
    speedRef.current = next;
  }, []);

  // Leaving the screen must not leave a voice talking.
  useEffect(() => {
    return () => {
      runRef.current++;
      void storyAudioService.stop();
    };
  }, []);

  // Changing chapter replaces the queue; anything still speaking is stale.
  useEffect(() => {
    runRef.current++;
    storyAudioService.resetSession();
    void storyAudioService.stop();
    setStatus('idle');
    setIndex(0);
    indexRef.current = 0;
  }, [utterances]);

  return {
    status,
    isActive: status !== 'idle',
    isPlaying: status === 'playing',
    speed,
    index,
    total: utterances.length,
    currentBlockId,
    currentBlockIndex,
    blockCount: blocks.length,
    progress: utterances.length ? index / utterances.length : 0,
    remainingSeconds,
    elapsedSeconds: Math.max(0, totalSeconds - remainingSeconds),
    totalSeconds,
    sleep,
    setSleep,
    voice,
    setVoice,
    // The fetched voice offers exactly one voice per language, so a choice
    // between female and male only means anything on the device voice.
    voiceApplies: engine !== 'network',
    start,
    stop,
    toggle,
    pause,
    resume,
    skipBlocks,
    seekToBlock,
    seekToFraction,
    setSpeed,
  };
}

export default useStoryNarration;
