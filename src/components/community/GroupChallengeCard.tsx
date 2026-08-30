import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GroupChallenge } from '../../types/community';
import { color, radius } from '../../theme/tokens';
import { withAlpha } from '../ui/Primitives';

interface Props {
  challenge: GroupChallenge;
  groupColor: string;
}

export function GroupChallengeCard({ challenge, groupColor }: Props) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const update = () => {
      const diff = new Date(challenge.endDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('Ended');
        return;
      }
      const days = Math.floor(diff / (24 * 3600000));
      const hours = Math.floor((diff % (24 * 3600000)) / 3600000);
      if (days > 0) setTimeLeft(`${days}d ${hours}h left`);
      else setTimeLeft(`${hours}h left`);
    };
    update();
    const timer = setInterval(update, 60000);
    return () => clearInterval(timer);
  }, [challenge.endDate]);

  const progress = Math.min((challenge.currentValue / challenge.targetValue) * 100, 100);
  const isCompleted = challenge.currentValue >= challenge.targetValue;

  const targetTypeIcons: Record<string, string> = {
    surah: 'book',
    words: 'text',
    xp: 'star',
    lessons: 'school',
    custom: 'flag',
  };

  return (
    <View style={[styles.card, isCompleted && { borderColor: withAlpha(color.progress, 0.25) }]}>
      <View style={styles.topRow}>
        <View style={[styles.iconCircle, { backgroundColor: isCompleted ? '#10b98120' : `${groupColor}20` }]}>
          <Ionicons name={(targetTypeIcons[challenge.targetType] || 'flag') as any} size={18} color={isCompleted ? '#10b981' : groupColor} />
        </View>
        <View style={styles.info}>
          <Text style={styles.title}>{challenge.title}</Text>
          <Text style={styles.creator}>by {challenge.creatorName}</Text>
        </View>
        <View style={[styles.timeBadge, isCompleted && { backgroundColor: withAlpha(color.progress, 0.13) }]}>
          <Ionicons name={isCompleted ? 'checkmark-circle' : 'time'} size={12} color={isCompleted ? '#10b981' : '#f59e0b'} />
          <Text style={[styles.timeText, isCompleted && { color: color.progress }]}>{isCompleted ? 'Done!' : timeLeft}</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>{challenge.currentValue} of {challenge.targetValue} {challenge.targetType}</Text>
          <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: isCompleted ? '#10b981' : groupColor }]} />
        </View>
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.metaItem}>
          <Ionicons name="people" size={13} color={color.textFaint} />
          <Text style={styles.metaText}>{challenge.participantCount === 0 ? 'No participants yet' : `${challenge.participantCount} working on it`}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: color.surface, borderRadius: radius.md, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: color.border },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  iconCircle: { width: 36, height: 36, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  title: { fontSize: 14, fontWeight: '700', color: color.text, marginBottom: 2 },
  creator: { fontSize: 12, color: color.textFaint },
  timeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: withAlpha(color.warning, 0.08), borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 4 },
  timeText: { fontSize: 11, fontWeight: '700', color: color.warning },
  progressSection: { marginBottom: 10 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontSize: 12, color: color.textMuted },
  progressPercent: { fontSize: 12, fontWeight: '700', color: color.text },
  progressBar: { height: 6, backgroundColor: color.bg, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  bottomRow: { flexDirection: 'row', alignItems: 'center' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: color.textFaint },
});
