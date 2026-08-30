import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettingsStore } from '../stores/settingsStore';
import { ARABIC_SPEECH_SPEEDS } from '../hooks/useArabicSpeech';
import { color, radius } from '../theme/tokens';

const BRAND = '#10b981';

// A compact numbered speed selector (0.75× / 1× / 1.25× / 1.5×) that drives the
// app-wide Arabic speech speed. Drop it in wherever a Slow/Normal toggle used to be.
export default function SpeechSpeedControl({ showIcon = true }: { showIcon?: boolean }) {
  const speed = useSettingsStore((s) => s.arabicSpeechSpeed);
  const setSpeed = useSettingsStore((s) => s.setArabicSpeechSpeed);

  return (
    <View style={styles.row}>
      {showIcon && <Ionicons name="speedometer-outline" size={14} color={color.textMuted} />}
      <View style={styles.segment}>
        {ARABIC_SPEECH_SPEEDS.map((v) => {
          const active = Math.abs(v - speed) < 0.001;
          return (
            <Pressable
              key={v}
              onPress={() => setSpeed(v)}
              style={[styles.pill, active && styles.pillActive]}
            >
              <Text style={[styles.text, active && styles.textActive]}>{v}×</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  segment: {
    flexDirection: 'row',
    backgroundColor: color.surface,
    borderRadius: radius.sm,
    padding: 3,
  },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 7 },
  pillActive: { backgroundColor: color.surfaceRaised },
  text: { fontSize: 13, fontWeight: '600', color: color.textMuted },
  textActive: { color: BRAND },
});
