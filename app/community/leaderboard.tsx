import React, { useState, useEffect, memo } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useCommunityStore } from '../../src/stores/communityStore';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { useProgressStore } from '../../src/stores/progressStore';
import { LeaderboardType, LeaderboardEntry } from '../../src/types/community';
import * as communityService from '../../src/services/communityService';
import { font, color, radius } from '../../src/theme/tokens';

const TAB_KEYS: { type: LeaderboardType; labelKey: string; icon: string }[] = [
  { type: 'weekly', labelKey: 'community.weekly', icon: 'calendar' },
  { type: 'streaks', labelKey: 'community.streaks', icon: 'flame' },
  { type: 'allTime', labelKey: 'community.allTime', icon: 'trophy' },
];

// Memoized row component to prevent unnecessary re-renders
const LeaderboardRow = memo(function LeaderboardRow({
  entry,
  type,
}: {
  entry: LeaderboardEntry;
  type: LeaderboardType;
}) {
  const { t } = useTranslation();

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return { emoji: '🥇', color: '#FFD700' };
    if (rank === 2) return { emoji: '🥈', color: '#C0C0C0' };
    if (rank === 3) return { emoji: '🥉', color: '#CD7F32' };
    return { emoji: null, color: color.textFaint };
  };

  const rankInfo = getRankDisplay(entry.rank);

  const getValue = () => {
    if (type === 'streaks') return t('community.days', { count: entry.streak });
    return `${entry.xp.toLocaleString()} XP`;
  };

  return (
    <View style={[styles.row, entry.isCurrentUser && styles.rowCurrent]}>
      <View style={[styles.rankBadge, entry.rank <= 3 && { backgroundColor: `${rankInfo.color}20` }]}>
        {rankInfo.emoji ? (
          <Text style={styles.rankEmoji}>{rankInfo.emoji}</Text>
        ) : (
          <Text style={styles.rankNumber}>{entry.rank}</Text>
        )}
      </View>
      <View style={styles.userInfo}>
        <Text style={[styles.userName, entry.isCurrentUser && styles.userNameCurrent]}>
          {entry.isCurrentUser ? t('community.you') : entry.name}
        </Text>
        {!entry.isCurrentUser && (
          <Text style={styles.userNameArabic}>{entry.nameArabic}</Text>
        )}
      </View>
      <View style={styles.valueContainer}>
        <Text style={[styles.valueText, entry.isCurrentUser && styles.valueTextCurrent]}>
          {getValue()}
        </Text>
        {entry.isCurrentUser && entry.rank > 1 && (
          <Text style={styles.rankDiff}>↑ {t('community.keepGoing')}</Text>
        )}
      </View>
    </View>
  );
});

// Shimmer skeleton row for loading state
const SkeletonRow = ({ delay = 0 }: { delay?: number }) => {
  const opacity = React.useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, delay, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity, delay]);

  return (
    <Animated.View style={[styles.row, { opacity }]}>
      <View style={[styles.rankBadge, styles.skeletonCircle]} />
      <View style={styles.userInfo}>
        <View style={[styles.skeletonBlock, { width: 100 }]} />
        <View style={[styles.skeletonBlock, { width: 60, marginTop: 6 }]} />
      </View>
      <View style={[styles.skeletonBlock, { width: 50 }]} />
    </Animated.View>
  );
};

const LeaderboardSkeleton = () => (
  <View style={styles.rankingsCard}>
    {[0, 1, 2, 3, 4].map((i) => (
      <SkeletonRow key={i} delay={i * 100} />
    ))}
  </View>
);

export default function LeaderboardScreen() {
  const { t } = useTranslation();
  const [currentType, setCurrentType] = useState<LeaderboardType>('weekly');
  const { fetchLeaderboard, leaderboardEntries: entries, isLoadingLeaderboard } = useCommunityStore();
  const userId = useSettingsStore((s) => s.user?.id);
  const { progress } = useProgressStore();

  // Sync existing local progress to Supabase on first load
  useEffect(() => {
    if (userId && progress.totalXp > 0) {
      communityService.syncProgress(userId, progress.totalXp, progress.currentStreak, progress.longestStreak);
    }
  }, [userId]);

  useEffect(() => {
    fetchLeaderboard(currentType, userId);
  }, [currentType, userId]);

  const currentUserEntry = entries.find((e) => e.isCurrentUser);
  const topEntries = entries.slice(0, 10);
  const showUserBelowTop = currentUserEntry && currentUserEntry.rank > 10;
  const isEmpty = !isLoadingLeaderboard && entries.length === 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={color.text} />
        </Pressable>
        <View style={styles.headerTitles}>
          <Text style={styles.headerTitle}>{t('community.leaderboard')}</Text>
          <Text style={styles.headerTitleArabic}>الترتيب</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        {TAB_KEYS.map((tab) => (
          <Pressable
            key={tab.type}
            style={[styles.tab, currentType === tab.type && styles.tabActive]}
            onPress={() => setCurrentType(tab.type)}
          >
            <Ionicons
              name={tab.icon as any}
              size={16}
              color={currentType === tab.type ? '#ffffff' : '#64748b'}
            />
            <Text style={[styles.tabText, currentType === tab.type && styles.tabTextActive]}>
              {t(tab.labelKey)}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {isLoadingLeaderboard ? (
          <LeaderboardSkeleton />
        ) : isEmpty ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="trophy-outline" size={48} color={color.textFaint} />
            <Text style={styles.emptyTitle}>{t('community.noLearnersYet', { defaultValue: 'No learners yet' })}</Text>
            <Text style={styles.emptySubtitle}>{t('community.startLearning', { defaultValue: 'Start learning to appear on the leaderboard!' })}</Text>
          </View>
        ) : (
          <>
            {/* Top 3 Podium */}
            {entries.length >= 3 && (
              <View style={styles.podium}>
                {/* 2nd Place */}
                <View style={styles.podiumItem}>
                  <View style={[styles.podiumAvatar, styles.podiumSecond]}>
                    <Text style={styles.podiumEmoji}>🥈</Text>
                  </View>
                  <Text style={styles.podiumName} numberOfLines={1}>
                    {entries[1].isCurrentUser ? t('community.you') : entries[1].name}
                  </Text>
                  <Text style={styles.podiumValue}>
                    {currentType === 'streaks' ? `${entries[1].streak}d` : `${entries[1].xp}`}
                  </Text>
                </View>

                {/* 1st Place */}
                <View style={[styles.podiumItem, styles.podiumFirst]}>
                  <View style={[styles.podiumAvatar, styles.podiumGold]}>
                    <Text style={styles.podiumEmoji}>🥇</Text>
                  </View>
                  <Text style={styles.podiumName} numberOfLines={1}>
                    {entries[0].isCurrentUser ? t('community.you') : entries[0].name}
                  </Text>
                  <Text style={styles.podiumValue}>
                    {currentType === 'streaks' ? `${entries[0].streak}d` : `${entries[0].xp}`}
                  </Text>
                </View>

                {/* 3rd Place */}
                <View style={styles.podiumItem}>
                  <View style={[styles.podiumAvatar, styles.podiumThird]}>
                    <Text style={styles.podiumEmoji}>🥉</Text>
                  </View>
                  <Text style={styles.podiumName} numberOfLines={1}>
                    {entries[2].isCurrentUser ? t('community.you') : entries[2].name}
                  </Text>
                  <Text style={styles.podiumValue}>
                    {currentType === 'streaks' ? `${entries[2].streak}d` : `${entries[2].xp}`}
                  </Text>
                </View>
              </View>
            )}

            {/* Rankings List */}
            <View style={styles.rankingsCard}>
              {topEntries.slice(3).map((entry) => (
                <LeaderboardRow key={entry.id} entry={entry} type={currentType} />
              ))}

              {showUserBelowTop && currentUserEntry && (
                <>
                  <View style={styles.separator}>
                    <View style={styles.separatorLine} />
                    <Text style={styles.separatorText}>• • •</Text>
                    <View style={styles.separatorLine} />
                  </View>
                  <LeaderboardRow entry={currentUserEntry} type={currentType} />
                </>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.xl,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitles: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: color.text,
  },
  headerTitleArabic: {
    fontFamily: font.arabic,
    lineHeight: 24,
    fontSize: 14,
    color: color.sacred,
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: color.surface,
    borderRadius: radius.md,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: radius.sm,
    gap: 6,
  },
  tabActive: {
    backgroundColor: color.accentStrong,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: color.textFaint,
  },
  tabTextActive: {
    color: color.text,
  },

  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },

  // Podium
  podium: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 24,
    paddingTop: 20,
  },
  podiumItem: {
    alignItems: 'center',
    width: 100,
  },
  podiumFirst: {
    marginBottom: 16,
  },
  podiumAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  podiumGold: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  podiumSecond: {
    backgroundColor: 'rgba(192, 192, 192, 0.2)',
    borderWidth: 2,
    borderColor: '#C0C0C0',
  },
  podiumThird: {
    backgroundColor: 'rgba(205, 127, 50, 0.2)',
    borderWidth: 2,
    borderColor: '#CD7F32',
  },
  podiumEmoji: {
    fontSize: 28,
  },
  podiumName: {
    fontSize: 14,
    fontWeight: '600',
    color: color.text,
    textAlign: 'center',
  },
  podiumValue: {
    fontSize: 12,
    color: color.textMuted,
    marginTop: 2,
  },

  // Rankings
  rankingsCard: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: color.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.bg,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 8,
  },
  rowCurrent: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderWidth: 1,
    borderColor: color.accentStrong,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.surface,
  },
  rankEmoji: {
    fontSize: 18,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: color.textFaint,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: color.text,
  },
  userNameCurrent: {
    color: color.accent,
  },
  userNameArabic: {
    fontFamily: font.arabic,
    lineHeight: 20,
    fontSize: 12,
    color: color.textFaint,
    marginTop: 2,
  },
  valueContainer: {
    alignItems: 'flex-end',
  },
  valueText: {
    fontSize: 14,
    fontWeight: '600',
    color: color.textMuted,
  },
  valueTextCurrent: {
    color: color.accent,
  },
  rankDiff: {
    fontSize: 10,
    color: color.progress,
    marginTop: 2,
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: color.surfaceRaised,
  },
  separatorText: {
    color: color.textFaint,
    paddingHorizontal: 12,
    fontSize: 12,
  },

  // Skeleton
  skeletonCircle: {
    backgroundColor: color.surfaceRaised,
  },
  skeletonBlock: {
    height: 14,
    backgroundColor: color.surfaceRaised,
    borderRadius: 7,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: color.textMuted,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: color.textFaint,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
