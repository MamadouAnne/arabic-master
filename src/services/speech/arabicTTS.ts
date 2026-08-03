// Arabic text-to-speech for the memorization feature.
//
// Uses Google Translate TTS (tl=ar) played through expo-audio. Each chunk is
// DOWNLOADED to a local file then played (iOS AVPlayer fails to stream Google's
// endpoint directly). Playback is line-by-line: each verse is spoken in order and
// the caller is notified (onLineStart) so the UI can highlight the active line.
//
// Concurrency: every playArabicLines() call claims a new "generation"; any older
// in-flight call notices its generation is stale and bails, and stopArabic() bumps
// the generation to cancel whatever is running — preventing overlapping audio when
// verses/play are tapped rapidly.

import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';
import { File, Paths } from 'expo-file-system';

let generation = 0;
let currentPlayer: AudioPlayer | null = null;
let interruptCurrent: (() => void) | null = null;
let audioInitialized = false;

const MAX_CHUNK_LEN = 180;

export interface ArabicPlayOptions {
  /** Playback rate. 1.0 = natural. Lower = slower (pitch-corrected). */
  speed?: number;
  /** Line index to start from (default 0) — used to resume or tap-to-start. */
  startIndex?: number;
  /** Called with the index (into `lines`) of the line about to be spoken. */
  onLineStart?: (index: number) => void;
  /** Called once all lines finished (not called if stopped early). */
  onDone?: () => void;
  onError?: (error?: any) => void;
}

async function ensureAudioInit() {
  if (audioInitialized) return;
  audioInitialized = true;
  try {
    await setAudioModeAsync({ playsInSilentMode: true });
  } catch {}
}

function chunkLine(text: string, maxLen = MAX_CHUNK_LEN): string[] {
  const trimmed = text.trim();
  if (trimmed.length <= maxLen) return [trimmed];

  const chunks: string[] = [];
  let remaining = trimmed;
  while (remaining.length > 0) {
    if (remaining.length <= maxLen) {
      chunks.push(remaining);
      break;
    }
    let splitAt = remaining.lastIndexOf(' ', maxLen);
    if (splitAt === -1 || splitAt < maxLen / 2) splitAt = maxLen;
    chunks.push(remaining.substring(0, splitAt).trim());
    remaining = remaining.substring(splitAt).trim();
  }
  return chunks;
}

function deleteQuietly(uri: string) {
  try {
    new File(uri).delete();
  } catch {}
}

function teardownCurrent() {
  const stop = interruptCurrent;
  interruptCurrent = null;
  if (stop) {
    stop();
  } else if (currentPlayer) {
    try {
      currentPlayer.pause();
    } catch {}
    try {
      currentPlayer.remove();
    } catch {}
    currentPlayer = null;
  }
}

async function fetchChunkToFile(text: string): Promise<string> {
  const url =
    `https://translate.google.com/translate_tts?ie=UTF-8&tl=ar&client=tw-ob&ttsspeed=1&q=` +
    encodeURIComponent(text);

  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`tts_http_${resp.status}`);

  const blob = await resp.blob();
  const base64: string = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1] || '');
    reader.onerror = () => reject(new Error('tts_read_failed'));
    reader.readAsDataURL(blob);
  });
  if (!base64) throw new Error('tts_empty');

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

  const file = new File(
    Paths.cache,
    `ar-tts-${Date.now()}-${Math.random().toString(36).slice(2)}.mp3`
  );
  file.write(bytes);
  return file.uri;
}

function playFile(uri: string, speed: number): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    let player: AudioPlayer;
    try {
      player = createAudioPlayer(uri);
    } catch (e) {
      deleteQuietly(uri);
      reject(e);
      return;
    }

    player.shouldCorrectPitch = true;
    try {
      player.setPlaybackRate(speed, 'high');
    } catch {}
    currentPlayer = player;

    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      try {
        subscription.remove();
      } catch {}
      try {
        player.pause();
      } catch {}
      try {
        player.remove();
      } catch {}
      if (currentPlayer === player) currentPlayer = null;
      if (interruptCurrent === finish) interruptCurrent = null;
      deleteQuietly(uri);
      resolve();
    };

    interruptCurrent = finish;

    const subscription = player.addListener('playbackStatusUpdate', (status) => {
      if (settled) return;
      if (
        status.didJustFinish ||
        (status.playing === false &&
          status.currentTime > 0 &&
          status.duration > 0 &&
          status.currentTime >= status.duration - 0.15)
      ) {
        finish();
      }
    });

    try {
      player.play();
    } catch (e) {
      finish();
    }
  });
}

/**
 * Speak an array of lines in order. Empty lines (stanza breaks) are skipped but
 * their index is preserved, so `onLineStart` indices map 1:1 onto `lines`.
 */
export async function playArabicLines(
  lines: string[],
  options: ArabicPlayOptions = {}
): Promise<void> {
  const myGen = ++generation;
  teardownCurrent();
  await ensureAudioInit();

  const speed = options.speed ?? 1.0;
  const startIndex = Math.max(0, options.startIndex ?? 0);

  try {
    for (let i = startIndex; i < lines.length; i++) {
      if (myGen !== generation) return;
      const line = lines[i].trim();
      if (!line) continue; // stanza break — no audio, no highlight

      options.onLineStart?.(i);

      const chunks = chunkLine(line);
      for (const chunk of chunks) {
        if (myGen !== generation) return;
        const uri = await fetchChunkToFile(chunk);
        if (myGen !== generation) {
          deleteQuietly(uri);
          return;
        }
        await playFile(uri, speed);
        if (myGen !== generation) return;
      }
    }
    if (myGen === generation) options.onDone?.();
  } catch (e: any) {
    if (myGen === generation) options.onError?.(e);
  }
}

export function stopArabic(): void {
  generation++;
  teardownCurrent();
}
