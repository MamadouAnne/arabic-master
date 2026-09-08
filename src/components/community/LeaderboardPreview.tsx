import React, { useEffect, memo } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { LeaderboardEntry, LeaderboardType } from '../../types/community';
import { medal, color, radius } from '../../theme/tokens';

const TAB_KEYS: { type: LeaderboardType; labelKey: string; icon: string }[] = [
  { type: 'allTime', labelKey: 'community.allTime', icon: 'trophy' },
  { type: 'weekly', labelKey: 'community.weekly', icon: 'calendar' },
  { type: 'streaks', labelKey: 'community.streaks', icon: 'flame' },
];

const InlineLeaderboardRow = memo(function InlineLeaderboardRow({
  entry,
  type,
}: {
  entry: LeaderboardEntry;
  type: LeaderboardType;
}) {
  const { t } = useTranslation();

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return { emoji: '🥇', color: medal.gold };
    if (rank === 2) return { emoji: '🥈', color: medal.silver };
    if (rank === 3) return { emoji: '🥉', color: medal.bronze };
    return { emoji: null, color: color.textFaint };
  };

  const rankInfo = getRankDisplay(entry.rank);

  const getValue = () => {
    if (type === 'streaks') return t('community.days', { count: entry.streak });
    return `${entry.xp.toLocaleString()} XP`;
  };

  return (
    <View style={[styles.lbRow, entry.isCurrentUser && styles.lbRowCurrent]}>
      <View style={[styles.lbRankBadge, entry.rank <= 3 && { backgroundColor: `${rankInfo.color}20` }]}>
        {rankInfo.emoji ? (
          <Text style={styles.lbRankEmoji}>{rankInfo.emoji}</Text>
        ) : (
          <Text style={styles.lbRankNumber}>{entry.rank}</Text>
        )}
      </View>
      <View style={styles.lbUserInfo}>
        <Text style={[styles.lbUserName, entry.isCurrentUser && styles.lbUserNameCurrent]} numberOfLines={1}>
          {entry.isCurrentUser ? t('community.you') : entry.name}
        </Text>
      </View>
      <Text style={[styles.lbValue, entry.isCurrentUser && styles.lbValueCurrent]}>
        {getValue()}
      </Text>
    </View>
  );
});

const LeaderboardRowSkeleton = () => {
  const opacity = React.useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <>
      {[0, 1, 2, 3, 4].map((i) => (
        <Animated.View key={i} style={[styles.lbRow, { opacity }]}>
          <View style={[styles.lbRankBadge, { backgroundColor: color.surfaceRaised }]} />
          <View style={styles.lbUserInfo}>
            <View style={{ width: 90, height: 13, backgroundColor: color.surfaceRaised, borderRadius: 6 }} />
          </View>
          <View style={{ width: 50, height: 13, backgroundColor: color.surfaceRaised, borderRadius: 6 }} />
        </Animated.View>
      ))}
    </>
  );
};

interface LeaderboardPreviewProps {
  entries: LeaderboardEntry[];
  isLoading: boolean;
  currentType: LeaderboardType;
  onTypeChange: (type: LeaderboardType) => void;
}

export function LeaderboardPreview({ entries, isLoading, currentType, onTypeChange }: LeaderboardPreviewProps) {
  const { t } = useTranslation();
  const topEntries = entries.slice(0, 5);

  return (
    <View style={styles.lbSection}>
      {/* Section header */}
      <View style={styles.lbSectionHeader}>
        <Text style={styles.lbSectionTitle}>{t('community.leaderboard')}</Text>
        <Pressable onPress={() => router.push('/community/leaderboard')}>
          <Text style={styles.lbSeeAll}>{t('community.seeAll', { defaultValue: 'See all' })}</Text>
        </Pressable>
      </View>

      {/* Tab selector */}
      <View style={styles.lbTabContainer}>
        {TAB_KEYS.map((tab) => (
          <Pressable
            key={tab.type}
            style={[styles.lbTab, currentType === tab.type && styles.lbTabActive]}
            onPress={() => onTypeChange(tab.type)}
          >
            <Ionicons
              name={tab.icon as any}
              size={14}
              color={currentType === tab.type ? color.textOnAccent : color.textMuted}
            />
            <Text style={[styles.lbTabText, currentType === tab.type && styles.lbTabTextActive]}>
              {t(tab.labelKey)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Rankings */}
      <View style={styles.lbCard}>
        {isLoading ? (
          <LeaderboardRowSkeleton />
        ) : topEntries.length === 0 ? (
          <View style={styles.lbEmpty}>
            <Ionicons name="trophy-outline" size={32} color={color.textFaint} />
            <Text style={styles.lbEmptyText}>{t('community.noLearnersYet', { defaultValue: 'No learners yet' })}</Text>
          </View>
        ) : (
          topEntries.map((entry) => (
            <InlineLeaderboardRow key={entry.id} entry={entry} type={currentType} />
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  lbSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  lbSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  lbSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: color.text,
  },
  lbSeeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: color.warning,
  },
  lbTabContainer: {
    flexDirection: 'row',
    backgroundColor: color.surface,
    borderRadius: radius.sm,
    padding: 3,
    marginBottom: 12,
  },
  lbTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: radius.sm,
    gap: 4,
  },
  lbTabActive: {
    backgroundColor: color.warning,
  },
  lbTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: color.textFaint,
  },
  lbTabTextActive: {
    color: color.text,
  },
  lbCard: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    padding: 10,
    borderWidth: 1,
    borderColor: color.border,
  },
  lbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.bg,
    borderRadius: radius.sm,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  lbRowCurrent: {
    backgroundColor: 'rgba(249, 115, 22, 0.12)',
    borderWidth: 1,
    borderColor: color.warning,
  },
  lbRankBadge: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.surface,
  },
  lbRankEmoji: {
    fontSize: 16,
  },
  lbRankNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: color.textFaint,
  },
  lbUserInfo: {
    flex: 1,
    marginLeft: 10,
  },
  lbUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: color.text,
  },
  lbUserNameCurrent: {
    color: color.warning,
  },
  lbValue: {
    fontSize: 13,
    fontWeight: '600',
    color: color.textMuted,
  },
  lbValueCurrent: {
    color: color.warning,
  },
  lbEmpty: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  lbEmptyText: {
    fontSize: 14,
    color: color.textFaint,
  },
});
