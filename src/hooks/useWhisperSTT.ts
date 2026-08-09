import { useState, useCallback, useEffect, useRef } from 'react';
import {
  useAudioRecorder,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  RecordingPresets,
} from 'expo-audio';
import { File, Paths } from 'expo-file-system';
import { useSettingsStore } from '../stores/settingsStore';

interface UseWhisperSTTReturn {
  startListening: () => Promise<void>;
  stopListening: () => Promise<string>;
  isListening: boolean;
  transcript: string;
  error: string | null;
}

export function useWhisperSTT(): UseWhisperSTTReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const startedRef = useRef(false); // guard: only stop a recorder we actually started

  useEffect(() => {
    requestRecordingPermissionsAsync()
      .then((result) => setHasPermission(result.granted))
      .catch(() => setHasPermission(false));
  }, []);

  const startListening = useCallback(async () => {
    try {
      setError(null);
      setTranscript('');

      if (!hasPermission) {
        const result = await requestRecordingPermissionsAsync();
        if (!result.granted) {
          setError('Microphone permission denied. Enable it in Settings.');
          return;
        }
        setHasPermission(true);
      }

      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      startedRef.current = true;
      setIsListening(true);
    } catch (err: any) {
      console.error('[WhisperSTT] startListening error:', err);
      setError('Failed to start recording.');
      setIsListening(false);
    }
  }, [recorder, hasPermission]);

  const stopListening = useCallback(async (): Promise<string> => {
    try {
      setIsListening(false);
      if (!startedRef.current) return ''; // nothing was recording; don't touch the recorder
      startedRef.current = false;
      await recorder.stop();
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });

      const recordingUri = recorder.uri;
      if (!recordingUri) {
        setError('No recording captured');
        return '';
      }

      // Save to a stable path before it gets cleaned up
      const stableName = `whisper-${Date.now()}.m4a`;
      const stableFile = new File(Paths.cache, stableName);

      try {
        const sourceFile = new File(recordingUri);
        sourceFile.copy(stableFile);
      } catch (copyErr) {
        console.error('[WhisperSTT] File copy failed:', copyErr);
        const result = await transcribeWithWhisper(recordingUri);
        setTranscript(result);
        return result;
      }

      if (!stableFile.exists) {
        setError('Recording file not saved');
        return '';
      }

      const result = await transcribeWithWhisper(stableFile.uri);
      setTranscript(result);

      try { stableFile.delete(); } catch {}
      return result;
    } catch (err: any) {
      console.error('[WhisperSTT] stopListening error:', err);
      setError('Failed to process recording');
      return '';
    }
  }, [recorder]);

  return { startListening, stopListening, isListening, transcript, error };
}

async function transcribeWithWhisper(audioUri: string): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) {
    return '[Set EXPO_PUBLIC_OPENAI_API_KEY in .env for voice mode]';
  }

  try {
    const language = useSettingsStore.getState().language;
    // Map UI language to Whisper language code
    // Whisper auto-detects Arabic even without specifying it
    const whisperLang = language === 'fr' ? 'fr' : 'en';

    const formData = new FormData();
    formData.append('file', {
      uri: audioUri,
      type: 'audio/m4a',
      name: 'recording.m4a',
    } as any);
    formData.append('model', 'whisper-1');
    formData.append('language', whisperLang);

    const response = await fetch(
      'https://api.openai.com/v1/audio/transcriptions',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}` },
        body: formData,
      },
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('[WhisperSTT] API error:', response.status, errText);
      throw new Error(`Whisper error: ${response.status}`);
    }

    const result = await response.json();
    return result.text || '';
  } catch (error) {
    console.error('[WhisperSTT] Transcription failed:', error);
    return '';
  }
}
