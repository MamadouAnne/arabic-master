import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CommunityStats } from '../../types/community';
import { font, color, radius } from '../../theme/tokens';

interface CommunityHeaderProps {
  stats: CommunityStats;
}

export const CommunityHeader: React.FC<CommunityHeaderProps> = ({ stats }) => {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{t('community.title')}</Text>
        <Text style={styles.titleArabic}>المجتمع</Text>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="people" size={16} color={color.progress} />
          <Text style={styles.statValue}>
            {stats.activeLearnersTodayCount.toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>{t('community.activeToday')}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Ionicons name="flame" size={16} color={color.warning} />
          <Text style={styles.statValue}>
            {stats.activeStreaksCount.toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>{t('community.streaks')}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: color.text,
  },
  titleArabic: {
    fontFamily: font.arabic,
    lineHeight: 41,
    fontSize: 24,
    color: color.sacred,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.surface,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: color.text,
    marginLeft: 6,
  },
  statLabel: {
    fontSize: 12,
    color: color.textMuted,
    marginLeft: 6,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: color.surfaceRaised,
    marginHorizontal: 12,
  },
});
