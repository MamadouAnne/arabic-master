import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GroupChallenge } from '../../types/community';
import { color, radius } from '../../theme/tokens';

interface Props {
  challenge: GroupChallenge;
  groupColor: string;
}

export function ChallengeBanner({ challenge, groupColor }: Props) {
  const progress = Math.min((challenge.currentValue / challenge.targetValue) * 100, 100);

  return (
    <View style={[styles.banner, { borderColor: `${groupColor}30` }]}>
      <Ionicons name="flash" size={14} color={color.warning} />
      <Text style={styles.title} numberOfLines={1}>{challenge.title}</Text>
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: `${groupColor}20` }]}>
          <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: groupColor }]} />
        </View>
        <Text style={[styles.progressText, { color: groupColor }]}>{Math.round(progress)}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 12, marginTop: 4, marginBottom: 4, backgroundColor: color.surface, borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1 },
  title: { fontSize: 12, fontWeight: '600', color: color.text, flex: 1 },
  progressContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  progressBar: { width: 50, height: 4, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  progressText: { fontSize: 11, fontWeight: '700' },
});
