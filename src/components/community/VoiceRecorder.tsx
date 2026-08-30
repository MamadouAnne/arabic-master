import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
  AudioModule,
  setAudioModeAsync,
} from 'expo-audio';
import { color, radius } from '../../theme/tokens';
import { withAlpha } from '../ui/Primitives';

interface Props {
  onSend: (uri: string, durationMs: number, waveform: number[]) => void;
  onCancel: () => void;
}

// Downsample raw metering samples to a fixed number of bars for display.
function buildWaveform(samples: number[], bars = 32): number[] {
  if (samples.length === 0) return [];
  const out: number[] = [];
  const step = samples.length / bars;
  for (let i = 0; i < bars; i++) {
    const start = Math.floor(i * step);
    const end = Math.max(start + 1, Math.floor((i + 1) * step));
    let sum = 0;
    for (let j = start; j < end; j++) sum += samples[j];
    out.push(Math.min(1, Math.max(0.08, sum / (end - start))));
  }
  return out;
}

export function VoiceRecorder({ onSend, onCancel }: Props) {
  const recorder = useAudioRecorder({ ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true });
  const recorderState = useAudioRecorderState(recorder, 100);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const meterSamples = useRef<number[]>([]);
  const finishedRef = useRef(false);

  const durationMs = recorderState.durationMillis || 0;

  // Start recording on mount, clean up on unmount.
  useEffect(() => {
    (async () => {
      try {
        const perm = await AudioModule.requestRecordingPermissionsAsync();
        if (!perm.granted) { onCancel(); return; }
        await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
        meterSamples.current = [];
        await recorder.prepareToRecordAsync();
        recorder.record();
      } catch {
        onCancel();
      }
    })();
    return () => {
      if (!finishedRef.current) {
        try { recorder.stop(); } catch {}
      }
    };
  }, []);

  // Pulse the record dot while recording.
  useEffect(() => {
    if (!recorderState.isRecording) return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [recorderState.isRecording]);

  // Collect metering samples (dBFS → 0..1) for the waveform.
  useEffect(() => {
    if (typeof recorderState.metering === 'number') {
      const norm = Math.max(0, Math.min(1, (recorderState.metering + 60) / 60));
      meterSamples.current.push(norm);
    }
  }, [recorderState.metering]);

  const finish = useCallback(async (discard: boolean) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    let uri: string | null = null;
    try {
      await recorder.stop();
      uri = recorder.uri;
    } catch { /* ignore */ }
    await setAudioModeAsync({ allowsRecording: false }).catch(() => {});
    if (discard || !uri) { onCancel(); return; }
    onSend(uri, durationMs, buildWaveform(meterSamples.current));
  }, [recorder, durationMs, onSend, onCancel]);

  // Auto-stop at 60s.
  useEffect(() => {
    if (durationMs >= 60000 && !finishedRef.current) finish(false);
  }, [durationMs, finish]);

  const secs = Math.floor(durationMs / 1000);
  const timeStr = `${Math.floor(secs / 60)}:${(secs % 60).toString().padStart(2, '0')}`;
  const maxReached = durationMs >= 55000;

  return (
    <View style={styles.container}>
      <Pressable style={styles.cancelBtn} onPress={() => finish(true)}>
        <Ionicons name="trash" size={20} color={color.danger} />
      </Pressable>

      <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }] }]}>
        <View style={styles.recordDot} />
      </Animated.View>

      <Text style={[styles.timer, maxReached && { color: color.danger }]}>{timeStr}</Text>
      <Text style={styles.maxLabel}>{maxReached ? 'Max reached' : '/1:00'}</Text>

      <Pressable style={styles.sendBtn} onPress={() => finish(false)}>
        <Ionicons name="send" size={18} color={color.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: color.surface, borderTopWidth: 1, borderTopColor: color.border },
  cancelBtn: { width: 42, height: 42, borderRadius: radius.xl, backgroundColor: withAlpha(color.danger, 0.13), alignItems: 'center', justifyContent: 'center' },
  pulseCircle: { width: 16, height: 16, borderRadius: radius.sm, backgroundColor: withAlpha(color.danger, 0.25), alignItems: 'center', justifyContent: 'center' },
  recordDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: color.danger },
  timer: { fontSize: 18, fontWeight: '700', color: color.text, fontVariant: ['tabular-nums'] },
  maxLabel: { fontSize: 12, color: color.textFaint, flex: 1 },
  sendBtn: { width: 42, height: 42, borderRadius: radius.xl, backgroundColor: color.accent, alignItems: 'center', justifyContent: 'center' },
});
