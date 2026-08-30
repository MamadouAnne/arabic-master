import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as communityService from '../../src/services/communityService';
import { useProgressStore } from '../../src/stores/progressStore';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { GroupsTab } from '../../src/components/community/GroupsTab';
import { DiscussionsTab } from '../../src/components/community/DiscussionsTab';
import { ChallengesTab } from '../../src/components/community/ChallengesTab';
import { Txt, Arabic } from '../../src/components/ui/Primitives';
import { color, space, radius, gutter } from '../../src/theme/tokens';

type CommunityTab = 'groups' | 'discussions' | 'challenges';

const TABS: { key: CommunityTab; icon: keyof typeof Ionicons.glyphMap; labelKey: string }[] = [
  { key: 'groups', icon: 'people', labelKey: 'community.tabGroups' },
  { key: 'discussions', icon: 'chatbubbles', labelKey: 'community.tabDiscussions' },
  { key: 'challenges', icon: 'flag', labelKey: 'community.tabChallenges' },
];

export default function CommunityScreen() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<CommunityTab>('groups');

  const userId = useSettingsStore((s) => s.user?.id);
  const progress = useProgressStore((s) => s.progress);

  useEffect(() => {
    if (userId && progress.totalXp > 0) {
      communityService.syncProgress(userId, progress.totalXp, progress.currentStreak, progress.longestStreak);
    }
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Masthead. No illuminated rule here — the segmented control below
          already divides the page, and the mark stays rare by design. */}
      <View style={styles.header}>
        <Arabic size="title" align="left">المجتمع</Arabic>
        <Txt variant="caption" tone="faint" style={styles.headerLatin}>
          {t('community.title')}
        </Txt>
      </View>

      {/* Segmented control */}
      <View style={styles.segmented}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              style={[styles.segment, isActive && styles.segmentActive]}
              onPress={() => setActiveTab(tab.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={t(tab.labelKey)}
            >
              <Ionicons
                name={tab.icon}
                size={16}
                color={isActive ? color.textOnAccent : color.textMuted}
              />
              <Txt
                variant="caption"
                weight="semibold"
                style={isActive ? styles.segmentLabelActive : styles.segmentLabel}
              >
                {t(tab.labelKey)}
              </Txt>
            </Pressable>
          );
        })}
      </View>

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
    backgroundColor: color.bg,
  },
  header: {
    paddingHorizontal: gutter,
    paddingTop: space.sm,
    paddingBottom: space.lg,
  },
  headerLatin: {
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 1.6,
  },
  segmented: {
    flexDirection: 'row',
    marginHorizontal: gutter,
    marginBottom: space.lg,
    padding: space.xs,
    backgroundColor: color.surfaceSunken,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: color.border,
    gap: space.xs,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    paddingVertical: space.md,
    borderRadius: radius.sm,
  },
  segmentActive: {
    backgroundColor: color.accent,
  },
  segmentLabel: {
    color: color.textMuted,
  },
  segmentLabelActive: {
    color: color.textOnAccent,
  },
  tabContent: {
    flex: 1,
  },
});
