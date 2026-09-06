import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LeaderboardEntry, LeaderboardType } from '../../types/community';
import { font, color, radius } from '../../theme/tokens';

interface LeaderboardCardProps {
  entries: LeaderboardEntry[];
  currentType: LeaderboardType;
  onTypeChange: (type: LeaderboardType) => void;
}

const TAB_OPTIONS: { type: LeaderboardType; label: string }[] = [
  { type: 'weekly', label: 'Weekly XP' },
  { type: 'streaks', label: 'Streaks' },
  { type: 'allTime', label: 'All-Time' },
];

const getRankIcon = (rank: number): string | null => {
  switch (rank) {
    case 1:
      return '🥇';
    case 2:
      return '🥈';
    case 3:
      return '🥉';
    default:
      return null;
  }
};

export const LeaderboardCard: React.FC<LeaderboardCardProps> = ({
  entries,
  currentType,
  onTypeChange,
}) => {
  const { t } = useTranslation();
  // Find current user's entry
  const currentUserEntry = entries.find((e) => e.isCurrentUser);
  const currentUserRank = currentUserEntry?.rank || 0;

  // Get top 5 entries
  const topEntries = entries.slice(0, 5);

  // Get entries around user if not in top 5
  const showUserSection = currentUserRank > 5;
  const nearbyEntries = showUserSection
    ? entries.slice(Math.max(currentUserRank - 2, 5), Math.min(currentUserRank + 1, entries.length))
    : [];

  const getValueDisplay = (entry: LeaderboardEntry) => {
    if (currentType === 'streaks') {
      return `${entry.streak} days`;
    }
    return `${entry.xp.toLocaleString()} XP`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{t('community.leaderboards')}</Text>
          <Text style={styles.titleArabic}>الترتيب</Text>
        </View>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabs}>
        {TAB_OPTIONS.map((tab) => (
          <Pressable
            key={tab.type}
            style={[styles.tab, currentType === tab.type && styles.tabActive]}
            onPress={() => onTypeChange(tab.type)}
          >
            <Text
              style={[
                styles.tabText,
                currentType === tab.type && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Top 5 Rankings */}
      <View style={styles.rankings}>
        {topEntries.map((entry) => (
          <View
            key={entry.id}
            style={[styles.rankRow, entry.isCurrentUser && styles.rankRowCurrent]}
          >
            <View style={styles.rankBadge}>
              {getRankIcon(entry.rank) ? (
                <Text style={styles.rankEmoji}>{getRankIcon(entry.rank)}</Text>
              ) : (
                <Text style={styles.rankNumber}>{entry.rank}</Text>
              )}
            </View>
            <View style={styles.userInfo}>
              <Text
                style={[styles.userName, entry.isCurrentUser && styles.userNameCurrent]}
              >
                {entry.isCurrentUser ? 'You' : entry.name}
              </Text>
              {!entry.isCurrentUser && (
                <Text style={styles.userNameArabic}>{entry.nameArabic}</Text>
              )}
            </View>
            <Text
              style={[styles.xpValue, entry.isCurrentUser && styles.xpValueCurrent]}
            >
              {getValueDisplay(entry)}
            </Text>
          </View>
        ))}
      </View>

      {/* User's position if not in top 5 */}
      {showUserSection && (
        <>
          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>...</Text>
            <View style={styles.separatorLine} />
          </View>
          <View style={styles.rankings}>
            {nearbyEntries.map((entry) => (
              <View
                key={entry.id}
                style={[styles.rankRow, entry.isCurrentUser && styles.rankRowCurrent]}
              >
                <View style={styles.rankBadge}>
                  <Text style={styles.rankNumber}>{entry.rank}</Text>
                </View>
                <View style={styles.userInfo}>
                  <Text
                    style={[
                      styles.userName,
                      entry.isCurrentUser && styles.userNameCurrent,
                    ]}
                  >
                    {entry.isCurrentUser ? 'You' : entry.name}
                  </Text>
                  {!entry.isCurrentUser && (
                    <Text style={styles.userNameArabic}>{entry.nameArabic}</Text>
                  )}
                </View>
                <Text
                  style={[styles.xpValue, entry.isCurrentUser && styles.xpValueCurrent]}
                >
                  {getValueDisplay(entry)}
                </Text>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: color.border,
  },
  header: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: color.text,
  },
  titleArabic: {
    fontFamily: font.arabic,
    lineHeight: 38,
    fontSize: 22,
    color: color.sacred,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: color.bg,
    borderRadius: radius.sm,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: color.accentStrong,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: color.textFaint,
  },
  tabTextActive: {
    color: color.text,
  },
  rankings: {
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    backgroundColor: color.bg,
    marginBottom: 8,
  },
  rankRowCurrent: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderWidth: 1,
    borderColor: color.accentStrong,
  },
  rankBadge: {
    width: 32,
    alignItems: 'center',
  },
  rankEmoji: {
    fontSize: 18,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: '600',
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
    lineHeight: 26,
    fontSize: 16,
    color: color.textFaint,
    marginTop: 2,
  },
  xpValue: {
    fontSize: 14,
    fontWeight: '600',
    color: color.textMuted,
  },
  xpValueCurrent: {
    color: color.accent,
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
    fontSize: 14,
  },
});
