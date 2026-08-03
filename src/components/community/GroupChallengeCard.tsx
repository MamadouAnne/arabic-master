import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GroupChallenge } from '../../types/community';

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
    <View style={[styles.card, isCompleted && { borderColor: '#10b98140' }]}>
      <View style={styles.topRow}>
        <View style={[styles.iconCircle, { backgroundColor: isCompleted ? '#10b98120' : `${groupColor}20` }]}>
          <Ionicons name={(targetTypeIcons[challenge.targetType] || 'flag') as any} size={18} color={isCompleted ? '#10b981' : groupColor} />
        </View>
        <View style={styles.info}>
          <Text style={styles.title}>{challenge.title}</Text>
          <Text style={styles.creator}>by {challenge.creatorName}</Text>
        </View>
        <View style={[styles.timeBadge, isCompleted && { backgroundColor: '#10b98120' }]}>
          <Ionicons name={isCompleted ? 'checkmark-circle' : 'time'} size={12} color={isCompleted ? '#10b981' : '#f59e0b'} />
          <Text style={[styles.timeText, isCompleted && { color: '#10b981' }]}>{isCompleted ? 'Done!' : timeLeft}</Text>
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
          <Ionicons name="people" size={13} color="#64748b" />
          <Text style={styles.metaText}>{challenge.participantCount === 0 ? 'No participants yet' : `${challenge.participantCount} working on it`}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#1e293b', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#334155' },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  iconCircle: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  title: { fontSize: 14, fontWeight: '700', color: '#ffffff', marginBottom: 2 },
  creator: { fontSize: 12, color: '#64748b' },
  timeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#f59e0b15', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  timeText: { fontSize: 11, fontWeight: '700', color: '#f59e0b' },
  progressSection: { marginBottom: 10 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontSize: 12, color: '#94a3b8' },
  progressPercent: { fontSize: 12, fontWeight: '700', color: '#ffffff' },
  progressBar: { height: 6, backgroundColor: '#0f172a', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  bottomRow: { flexDirection: 'row', alignItems: 'center' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: '#64748b' },
});
