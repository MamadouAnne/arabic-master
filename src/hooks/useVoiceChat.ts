import { useState, useCallback, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { useWhisperSTT } from './useWhisperSTT';
import { useAIChatStore } from '../stores/aiChatStore';
import { sendAIChatMessage } from '../services/aiChatService';
import {
  speakWithOpenAI,
  stopOpenAITTS,
  prefetchOpenAIAudio,
  OpenAIVoice,
} from '../services/speech/openaiTTS';

export type VoiceStatus = 'idle' | 'listening' | 'processing' | 'thinking' | 'speaking';

// Split streamed text into complete sentences for incremental TTS
function extractSentences(buffer: string): { sentences: string[]; remaining: string } {
  const sentences: string[] = [];
  // Match sentence-ending punctuation followed by whitespace (including Arabic)
  const regex = /[.!?\u061F\u06D4]\s+/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(buffer)) !== null) {
    const sentence = buffer.slice(lastIndex, match.index + 1).trim();
    if (sentence.length > 8) sentences.push(sentence);
    lastIndex = match.index + match[0].length;
  }
  return { sentences, remaining: buffer.slice(lastIndex) };
}

interface UseVoiceChatOptions {
  voice?: OpenAIVoice;
  speed?: number;
}

export function useVoiceChat(options: UseVoiceChatOptions = {}) {
  const { voice = 'nova', speed = 1.0 } = options;
  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [lastTranscript, setLastTranscript] = useState('');
  const [lastResponse, setLastResponse] = useState('');
  const statusRef = useRef<VoiceStatus>('idle');
  const cancelledRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  const stt = useWhisperSTT();

  const pendingRef = useRef<string[]>([]);
  const isSpeakingOneRef = useRef(false);

  const updateStatus = useCallback((newStatus: VoiceStatus) => {
    statusRef.current = newStatus;
    setStatus(newStatus);
  }, []);

  const speakOne = useCallback(
    (text: string): Promise<void> => {
      if (!text || text.length < 3) return Promise.resolve();
      isSpeakingOneRef.current = true;
      return new Promise((resolve) => {
        if (cancelledRef.current) {
          isSpeakingOneRef.current = false;
          resolve();
          return;
        }
        speakWithOpenAI(text, {
          voice,
          speed,
          onDone: () => { isSpeakingOneRef.current = false; resolve(); },
          onError: () => { isSpeakingOneRef.current = false; resolve(); },
        });
      });
    },
    [voice, speed],
  );

  const killSpeech = useCallback(() => {
    cancelledRef.current = true;
    pendingRef.current = [];
    abortRef.current?.abort();
    stopOpenAITTS();
    setTimeout(() => stopOpenAITTS(), 50);
  }, []);

  const startListeningFlow = useCallback(async () => {
    cancelledRef.current = false;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    updateStatus('listening');
    setLastTranscript('');
    setLastResponse('');
    await stt.startListening();
  }, [stt, updateStatus]);

  const processAndSpeak = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateStatus('processing');

    const transcript = await stt.stopListening();
    setLastTranscript(transcript);

    if (cancelledRef.current) return;
    if (!transcript || transcript.startsWith('[')) {
      updateStatus('idle');
      return;
    }

    updateStatus('thinking');

    // Stream AI response — speak sentences as they arrive
    pendingRef.current = [];
    let buffer = '';
    let speakingStarted = false;

    const controller = new AbortController();
    abortRef.current = controller;

    const { preferredModel } = useAIChatStore.getState();

    // Send message through the existing AI pipeline with streaming callback
    await sendAIChatMessage({
      userMessage: transcript,
      model: preferredModel,
      abortController: controller,
      isVoiceMode: true,
      onChunk: (token) => {
        if (cancelledRef.current) return;

        buffer += token;
        const { sentences, remaining } = extractSentences(buffer);
        buffer = remaining;

        if (sentences.length > 0) {
          pendingRef.current.push(...sentences);

          if (!speakingStarted) {
            speakingStarted = true;
            updateStatus('speaking');

            // Start the sequential speech playback loop
            (async () => {
              while (pendingRef.current.length > 0 && !cancelledRef.current) {
                const s = pendingRef.current.shift()!;
                if (cancelledRef.current) break;
                // Prefetch next sentence while current plays
                if (pendingRef.current.length > 0) {
                  prefetchOpenAIAudio(pendingRef.current[0], { voice, speed });
                }
                await speakOne(s);
                if (cancelledRef.current) break;
              }
            })();
          }
        }
      },
    });

    if (cancelledRef.current) return;

    // Flush remaining buffer
    if (buffer.trim().length > 5) {
      pendingRef.current.push(buffer.trim());
    }

    // Get the final response from the store
    const conversations = useAIChatStore.getState().conversations;
    const activeModule = useAIChatStore.getState().activeModule;
    const msgs = conversations[activeModule] || [];
    const lastMsg = msgs[msgs.length - 1];
    if (lastMsg?.role === 'assistant' && !lastMsg.content.startsWith('__error:')) {
      setLastResponse(lastMsg.content);
    }

    // Wait for all speech to finish
    if (speakingStarted || pendingRef.current.length > 0) {
      if (!speakingStarted && pendingRef.current.length > 0) {
        updateStatus('speaking');
        for (let i = 0; i < pendingRef.current.length; i++) {
          if (cancelledRef.current) break;
          if (i + 1 < pendingRef.current.length) {
            prefetchOpenAIAudio(pendingRef.current[i + 1], { voice, speed });
          }
          await speakOne(pendingRef.current[i]);
        }
        pendingRef.current = [];
      } else {
        await new Promise<void>((resolve) => {
          let resolved = false;
          const done = () => {
            if (!resolved) { resolved = true; clearInterval(check); resolve(); }
          };
          const check = setInterval(() => {
            if ((pendingRef.current.length === 0 && !isSpeakingOneRef.current) || cancelledRef.current) {
              done();
            }
          }, 100);
          setTimeout(done, 60000);
        });
      }
    }

    if (!cancelledRef.current) {
      updateStatus('idle');
    }
  }, [stt, speakOne, voice, speed, updateStatus]);

  const toggleListening = useCallback(async () => {
    const current = statusRef.current;

    if (current === 'idle') {
      await startListeningFlow();
    } else if (current === 'listening') {
      processAndSpeak().catch(() => {});
    } else {
      await killSpeech();
      updateStatus('idle');
      await new Promise((r) => setTimeout(r, 300));
      await startListeningFlow();
    }
  }, [startListeningFlow, processAndSpeak, killSpeech, updateStatus]);

  const cancel = useCallback(async () => {
    killSpeech();
    if (statusRef.current === 'listening') {
      stt.stopListening().catch(() => {});
    }
    updateStatus('idle');
  }, [killSpeech, stt, updateStatus]);

  return {
    status,
    lastTranscript,
    lastResponse,
    toggleListening,
    cancel,
    error: stt.error,
  };
}
