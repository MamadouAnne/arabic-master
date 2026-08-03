import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { File, Paths } from 'expo-file-system';
import type { AudioPlayer } from 'expo-audio/build/AudioModule.types';

export type OpenAIVoice = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';

let currentPlayer: AudioPlayer | null = null;
let cleanupListener: (() => void) | null = null;
let stopped = false;

const prefetchMap = new Map<string, Promise<string | null>>();

function cleanInput(text: string): string {
  // Keep printable ASCII + Arabic + French accented chars
  let clean = '';
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    // ASCII printable, Arabic block (0x0600-0x06FF), Latin Extended (accents)
    if (
      (code >= 32 && code <= 126) ||
      (code >= 0x0600 && code <= 0x06ff) ||
      (code >= 0x00c0 && code <= 0x024f) ||
      code === 0x2019 // right single quote
    ) {
      clean += text[i];
    }
  }
  return clean.replace(/\s{2,}/g, ' ').trim();
}

async function fetchAudioToFile(
  clean: string,
  voice: OpenAIVoice,
  speed: number,
): Promise<string | null> {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        voice,
        input: clean,
        speed: Math.max(0.25, Math.min(4.0, speed)),
        response_format: 'mp3',
      }),
    });

    if (!response.ok) {
      console.error('[OpenAI TTS] API error:', response.status);
      return null;
    }

    const blob = await response.blob();

    return new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        if (!base64) { resolve(null); return; }

        try {
          const tempFile = new File(
            Paths.cache,
            `tts-${Date.now()}-${Math.random().toString(36).slice(2)}.mp3`,
          );
          const binaryString = atob(base64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          tempFile.write(bytes);
          resolve(tempFile.uri);
        } catch {
          // Fallback: data URI (works on iOS)
          resolve(reader.result as string);
        }
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.error('[OpenAI TTS] fetch failed:', err);
    return null;
  }
}

export function prefetchOpenAIAudio(
  text: string,
  options: { voice?: OpenAIVoice; speed?: number } = {},
): void {
  const clean = cleanInput(text);
  if (!clean || prefetchMap.has(clean)) return;
  const { voice = 'nova', speed = 1.0 } = options;
  prefetchMap.set(clean, fetchAudioToFile(clean, voice, speed));
}

function playUri(
  uri: string,
  options: { onDone?: () => void; onError?: () => void },
): void {
  if (stopped) { options.onDone?.(); return; }

  try {
    if (cleanupListener) { cleanupListener(); cleanupListener = null; }
    if (currentPlayer) {
      try { currentPlayer.pause(); currentPlayer.remove(); } catch {}
      currentPlayer = null;
    }

    const player = createAudioPlayer(uri);
    currentPlayer = player;

    const subscription = player.addListener('playbackStatusUpdate', (status) => {
      if (status.didJustFinish) {
        subscription.remove();
        player.remove();
        currentPlayer = null;
        cleanupListener = null;
        if (!uri.startsWith('data:')) {
          try { new File(uri).delete(); } catch {}
        }
        options.onDone?.();
      }
    });

    cleanupListener = () => {
      subscription.remove();
      if (!uri.startsWith('data:')) {
        try { new File(uri).delete(); } catch {}
      }
    };

    player.play();
  } catch {
    options.onError?.();
  }
}

export async function speakWithOpenAI(
  text: string,
  options: {
    voice?: OpenAIVoice;
    speed?: number;
    onDone?: () => void;
    onError?: () => void;
  } = {},
): Promise<void> {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) { options.onError?.(); return; }

  const { voice = 'nova', speed = 1.0 } = options;
  const clean = cleanInput(text);
  if (!clean) { options.onDone?.(); return; }

  stopped = false;
  await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });

  // Use prefetched audio if available
  const cached = prefetchMap.get(clean);
  if (cached) {
    prefetchMap.delete(clean);
    const uri = await cached;
    if (uri && !stopped) { playUri(uri, options); return; }
    if (stopped) { options.onDone?.(); return; }
  }

  const uri = await fetchAudioToFile(clean, voice, speed);
  if (stopped) { options.onDone?.(); return; }
  if (!uri) { options.onError?.(); return; }
  playUri(uri, options);
}

export function stopOpenAITTS(): void {
  stopped = true;
  prefetchMap.clear();
  if (cleanupListener) { cleanupListener(); cleanupListener = null; }
  if (currentPlayer) {
    try { currentPlayer.pause(); currentPlayer.remove(); } catch {}
    currentPlayer = null;
  }
}
