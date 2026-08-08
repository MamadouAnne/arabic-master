import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useCommunityStore } from '../../src/stores/communityStore';
import * as communityService from '../../src/services/communityService';
import { useProgressStore } from '../../src/stores/progressStore';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { CommunityStatsBar } from '../../src/components/community/CommunityStatsBar';
import { GroupsTab } from '../../src/components/community/GroupsTab';
import { DiscussionsTab } from '../../src/components/community/DiscussionsTab';
import { ChallengesTab } from '../../src/components/community/ChallengesTab';

type CommunityTab = 'groups' | 'discussions' | 'challenges';

const TABS: { key: CommunityTab; icon: string; labelKey: string }[] = [
  { key: 'groups', icon: 'people', labelKey: 'community.tabGroups' },
  { key: 'discussions', icon: 'chatbubbles', labelKey: 'community.tabDiscussions' },
  { key: 'challenges', icon: 'flag', labelKey: 'community.tabChallenges' },
];

export default function CommunityScreen() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<CommunityTab>('groups');

  const userId = useSettingsStore((s) => s.user?.id);
  const progress = useProgressStore((s) => s.progress);

  const {
    fetchCommunityStats,
    communityStatsData,
    isLoadingStats,
  } = useCommunityStore();

  useEffect(() => {
    fetchCommunityStats();
    if (userId && progress.totalXp > 0) {
      communityService.syncProgress(userId, progress.totalXp, progress.currentStreak, progress.longestStreak);
    }
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>{t('community.title')}</Text>
          <Text style={styles.headerTitleArabic}>{'المجتمع'}</Text>
        </View>
      </View>

      {/* Stats bar */}
      <View style={styles.statsSection}>
        <CommunityStatsBar stats={communityStatsData} isLoading={isLoadingStats} />
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Ionicons
                name={tab.icon as any}
                size={17}
                color={isActive ? '#ffffff' : '#94a3b8'}
              />
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {t(tab.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Tab content */}
      <View style={styles.tabContent}>
        {activeTab === 'groups' && <GroupsTab />}
        {activeTab === 'discussions' && <DiscussionsTab />}
        {activeTab === 'challenges' && <ChallengesTab />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerTitleArabic: {
    fontSize: 24,
    color: '#D4AF37',
    fontWeight: '600',
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 4,
    backgroundColor: '#1e293b',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#6366f1',
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
  },
  tabLabelActive: {
    color: '#ffffff',
  },
  tabContent: {
    flex: 1,
  },
});
