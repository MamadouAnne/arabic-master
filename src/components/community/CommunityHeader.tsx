import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CommunityStats } from '../../types/community';

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
          <Ionicons name="people" size={16} color="#22c55e" />
          <Text style={styles.statValue}>
            {stats.activeLearnersTodayCount.toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>{t('community.activeToday')}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Ionicons name="flame" size={16} color="#f97316" />
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
    color: '#ffffff',
  },
  titleArabic: {
    fontSize: 24,
    color: '#D4AF37',
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
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
    color: '#ffffff',
    marginLeft: 6,
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginLeft: 6,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#334155',
    marginHorizontal: 12,
  },
});
