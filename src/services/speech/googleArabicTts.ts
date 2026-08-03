// Free Arabic text-to-speech using Google Translate TTS (tl=ar), played through
// expo-audio. Each chunk is DOWNLOADED to a local file and then played (iOS
// AVPlayer fails to stream Google's endpoint directly). This is the shared engine
// used app-wide via audioService.speakArabic().
//
// Concurrency: every speak() call claims a monotonically increasing "generation".
// Any older in-flight call notices its generation is stale and bails immediately,
// and stopGoogleArabic() bumps the generation to cancel whatever is running. This
// prevents overlapping/redundant audio when play is tapped repeatedly.
//
// Requires an internet connection (Google TTS is a network request).

import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';
import { File, Paths } from 'expo-file-system';

let generation = 0;
let currentPlayer: AudioPlayer | null = null;
let interruptCurrent: (() => void) | null = null;
let speaking = false;
let audioInitialized = false;

// Google Translate TTS rejects requests longer than ~200 chars.
const MAX_CHUNK_LEN = 180;

export interface GoogleTtsOptions {
  /** Playback rate. 1.0 = natural. Lower = slower (pitch-corrected). */
  rate?: number;
  onStart?: () => void;
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

function splitChunks(text: string, maxLen = MAX_CHUNK_LEN): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  if (trimmed.length <= maxLen) return [trimmed];

  const chunks: string[] = [];
  let remaining = trimmed;
  while (remaining.length > 0) {
    if (remaining.length <= maxLen) {
      chunks.push(remaining);
      break;
    }
    let splitAt = remaining.lastIndexOf('\n', maxLen);
    if (splitAt < maxLen / 2) splitAt = remaining.lastIndexOf(' ', maxLen);
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

// Stop and tear down whatever is currently playing, and unblock its awaiter.
function teardownCurrent() {
  const stop = interruptCurrent;
  interruptCurrent = null;
  if (stop) {
    stop(); // resolves the in-flight playFile() promise and removes the player
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

// Download one chunk's audio to a local cache file (blob → base64 → bytes).
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

function playFile(uri: string, rate: number): Promise<void> {
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
    // playbackRate is a read-only getter at runtime — must use setPlaybackRate().
    try {
      player.setPlaybackRate(rate, 'high');
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

    // Allow an external stop / newer call to end this playback immediately.
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
      // Treat a play failure as completion so the loop can move on / exit.
      finish();
    }
  });
}

/** Speak Arabic text via Google TTS. Long text is chunked and played in order. */
export async function speakGoogleArabic(
  text: string,
  options: GoogleTtsOptions = {}
): Promise<void> {
  // Claim a new generation and cancel anything currently playing.
  const myGen = ++generation;
  teardownCurrent();
  speaking = true;
  await ensureAudioInit();

  const rate = options.rate ?? 1.0;

  try {
    const chunks = splitChunks(text);
    if (chunks.length === 0) {
      if (myGen === generation) {
        speaking = false;
        options.onDone?.();
      }
      return;
    }

    options.onStart?.();

    for (const chunk of chunks) {
      if (myGen !== generation) return; // superseded by a newer call / stopped
      const uri = await fetchChunkToFile(chunk);
      if (myGen !== generation) {
        deleteQuietly(uri);
        return;
      }
      await playFile(uri, rate);
      if (myGen !== generation) return;
    }

    if (myGen === generation) {
      speaking = false;
      options.onDone?.();
    }
  } catch (e: any) {
    if (myGen === generation) {
      speaking = false;
      options.onError?.(e);
    }
  }
}

export function stopGoogleArabic(): void {
  // Invalidate any in-flight call and tear down current playback.
  generation++;
  speaking = false;
  teardownCurrent();
}

export function isGoogleArabicSpeaking(): boolean {
  return speaking;
}
