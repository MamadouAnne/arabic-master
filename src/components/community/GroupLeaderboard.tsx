import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { medal, color, radius } from '../../theme/tokens';

export interface LeaderboardEntry {
  userId: string;
  name: string;
  avatar: string;
  xp: number;
  streak: number;
  messageCount: number;
}

type Metric = 'xp' | 'streak' | 'messages';

interface Props {
  entries: LeaderboardEntry[];
  groupColor: string;
  currentUserId?: string;
}

export function GroupLeaderboard({ entries, groupColor, currentUserId }: Props) {
  const { t } = useTranslation();
  const [metric, setMetric] = useState<Metric>('xp');

  const sorted = [...entries].sort((a, b) => {
    if (metric === 'xp') return b.xp - a.xp;
    if (metric === 'streak') return b.streak - a.streak;
    return b.messageCount - a.messageCount;
  });

  const getValue = (entry: LeaderboardEntry) => {
    if (metric === 'xp') return `${entry.xp.toLocaleString()} XP`;
    if (metric === 'streak') return `${entry.streak}d streak`;
    return `${entry.messageCount} msgs`;
  };

  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);
  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;
  const podiumHeights = [70, 90, 55];

  return (
    <View style={styles.container}>
      {/* Metric toggle */}
      <View style={styles.toggleRow}>
        {(['xp', 'streak', 'messages'] as Metric[]).map((m) => (
          <Pressable key={m} style={[styles.toggleBtn, metric === m && { backgroundColor: `${groupColor}25` }]} onPress={() => setMetric(m)}>
            <Ionicons name={m === 'xp' ? 'star' : m === 'streak' ? 'flame' : 'chatbubble'} size={14} color={metric === m ? groupColor: color.textFaint} />
            <Text style={[styles.toggleText, metric === m && { color: groupColor }]}>{m === 'xp' ? 'XP' : m === 'streak' ? 'Streak' : 'Messages'}</Text>
          </Pressable>
        ))}
      </View>

      {/* Podium */}
      {top3.length >= 3 && (
        <View style={styles.podium}>
          {podiumOrder.map((entry, idx) => {
            const rank = idx === 0 ? 2 : idx === 1 ? 1 : 3;
            const medalColors = ['', medal.gold, medal.silver, medal.bronze];
            return (
              <View key={entry.userId} style={styles.podiumItem}>
                <View style={[styles.podiumAvatar, rank === 1 && { borderColor: color.warning, borderWidth: 2, width: 52, height: 52, borderRadius: 26 }]}>
                  <Text style={[styles.podiumAvatarText, rank === 1 && { fontSize: 22 }]}>{entry.avatar}</Text>
                </View>
                {rank <= 3 && (
                  <View style={[styles.medalBadge, { backgroundColor: `${medalColors[rank]}30` }]}>
                    <Text style={[styles.medalText, { color: medalColors[rank] }]}>#{rank}</Text>
                  </View>
                )}
                <Text style={styles.podiumName} numberOfLines={1}>{entry.name}</Text>
                <Text style={[styles.podiumValue, rank === 1 && { color: groupColor }]}>{getValue(entry)}</Text>
                <View style={[styles.podiumBar, { height: podiumHeights[idx], backgroundColor: `${groupColor}${rank === 1 ? '40' : '20'}` }]} />
              </View>
            );
          })}
        </View>
      )}

      {/* Rest of list */}
      {rest.map((entry, idx) => {
        const rank = idx + 4;
        const isCurrentUser = entry.userId === currentUserId;
        return (
          <View key={entry.userId} style={[styles.rankRow, isCurrentUser && { backgroundColor: `${groupColor}15`, borderColor: `${groupColor}30` }]}>
            <Text style={styles.rankNum}>#{rank}</Text>
            <View style={styles.rankAvatar}>
              <Text style={styles.rankAvatarText}>{entry.avatar}</Text>
            </View>
            <View style={styles.rankInfo}>
              <Text style={[styles.rankName, isCurrentUser && { color: groupColor }]}>{entry.name}</Text>
              <Text style={styles.rankValue}>{getValue(entry)}</Text>
            </View>
          </View>
        );
      })}

      {entries.length === 0 && (
        <Text style={styles.emptyText}>{t('community.noLeaderboardData')}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 8 },
  toggleRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  toggleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: radius.sm, backgroundColor: color.surface },
  toggleText: { fontSize: 13, fontWeight: '600', color: color.textFaint },
  podium: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 8, marginBottom: 20, paddingTop: 10 },
  podiumItem: { alignItems: 'center', flex: 1 },
  podiumAvatar: { width: 44, height: 44, borderRadius: radius.xl, backgroundColor: color.surfaceRaised, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  podiumAvatarText: { fontSize: 18, fontWeight: '700', color: color.text },
  medalBadge: { borderRadius: radius.sm, paddingHorizontal: 6, paddingVertical: 2, marginBottom: 4 },
  medalText: { fontSize: 11, fontWeight: '700' },
  podiumName: { fontSize: 12, fontWeight: '600', color: color.text, marginBottom: 2, maxWidth: 80, textAlign: 'center' },
  podiumValue: { fontSize: 11, color: color.textMuted, fontWeight: '600', marginBottom: 6 },
  podiumBar: { width: '80%', borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: color.surface, borderRadius: radius.md, padding: 12, marginBottom: 6, borderWidth: 1, borderColor: color.border },
  rankNum: { fontSize: 14, fontWeight: '700', color: color.textFaint, width: 30, textAlign: 'center' },
  rankAvatar: { width: 36, height: 36, borderRadius: radius.lg, backgroundColor: color.surfaceRaised, alignItems: 'center', justifyContent: 'center' },
  rankAvatarText: { fontSize: 15, fontWeight: '700', color: color.text },
  rankInfo: { flex: 1 },
  rankName: { fontSize: 14, fontWeight: '700', color: color.text, marginBottom: 2 },
  rankValue: { fontSize: 12, color: color.textMuted },
  emptyText: { fontSize: 13, color: color.textFaint, textAlign: 'center', paddingVertical: 20 },
});
