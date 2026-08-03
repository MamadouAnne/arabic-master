import { useState, useCallback, useEffect } from 'react';
import { audioService, VoiceGender } from '../services/audioService';
import { useSettingsStore } from '../stores/settingsStore';

// Speed options offered by the numbered speed control.
export const ARABIC_SPEECH_SPEEDS = [0.75, 1.0, 1.25, 1.5] as const;

interface UseArabicSpeechReturn {
  speak: (text: string) => Promise<void>;
  speakSlow: (text: string) => Promise<void>;
  stop: () => Promise<void>;
  isSpeaking: boolean;
  speed: number;
  setSpeed: (speed: number) => void;
  voiceGender: VoiceGender;
  setVoiceGender: (gender: VoiceGender) => void;
  swapVoices: () => void;
  hasMultipleVoices: boolean;
}

export function useArabicSpeech(): UseArabicSpeechReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceGender, setVoiceGenderState] = useState<VoiceGender>(audioService.getVoiceGender());
  const [hasMultipleVoices, setHasMultipleVoices] = useState(true);

  // Global, persisted playback speed (1.0 = natural).
  const speed = useSettingsStore((s) => s.arabicSpeechSpeed);
  const setSpeed = useSettingsStore((s) => s.setArabicSpeechSpeed);

  // Initialize and check voice availability
  useEffect(() => {
    audioService.initializeAndGetVoiceInfo().then(info => {
      setHasMultipleVoices(info.hasMultipleVoices);
    });
  }, []);

  const setVoiceGender = useCallback((gender: VoiceGender) => {
    audioService.setVoiceGender(gender);
    setVoiceGenderState(gender);
  }, []);

  const swapVoices = useCallback(() => {
    audioService.swapVoices();
    setVoiceGenderState(prev => prev);
  }, []);

  const speak = useCallback(async (text: string) => {
    if (!text) return;
    setIsSpeaking(true);
    await audioService.speakArabic({
      text,
      rate: speed,
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  }, [speed]);

  // Kept for backward compatibility — a touch slower than the chosen speed.
  const speakSlow = useCallback(async (text: string) => {
    if (!text) return;
    setIsSpeaking(true);
    await audioService.speakArabic({
      text,
      rate: Math.max(0.5, speed * 0.7),
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  }, [speed]);

  const stop = useCallback(async () => {
    await audioService.stop();
    setIsSpeaking(false);
  }, []);

  return {
    speak,
    speakSlow,
    stop,
    isSpeaking,
    speed,
    setSpeed,
    voiceGender,
    setVoiceGender,
    swapVoices,
    hasMultipleVoices,
  };
}

export default useArabicSpeech;
export type { VoiceGender };
