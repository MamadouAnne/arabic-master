import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useLocalizedContent } from '../../hooks/useLocalizedContent';
import { useCommunityStore } from '../../stores/communityStore';
import { Challenge } from '../../types/community';
import { font, color, radius } from '../../theme/tokens';
import { withAlpha } from '../ui/Primitives';

const ChallengeCard = ({ challenge }: { challenge: Challenge }) => {
  const { t } = useTranslation();
  const { lc } = useLocalizedContent();
  const progress = Math.min(challenge.currentValue / challenge.targetValue, 1);
  const progressPercent = Math.round(progress * 100);

  const getTypeIcon = () => {
    switch (challenge.type) {
      case 'daily': return 'today';
      case 'weekly': return 'calendar';
      case 'weekend': return 'sunny';
      default: return 'flag';
    }
  };

  const getTypeLabel = () => {
    switch (challenge.type) {
      case 'daily': return t('community.dailyChallenge');
      case 'weekly': return t('community.weeklyChallenge');
      case 'weekend': return t('community.weekendSprint');
      default: return t('community.challenge');
    }
  };

  const getTargetLabel = () => {
    switch (challenge.targetType) {
      case 'words': return t('community.words');
      case 'lessons': return t('community.lessons');
      case 'xp': return 'XP';
      case 'exercises': return t('community.exercises');
      default: return '';
    }
  };

  return (
    <View
      style={[styles.challengeCard, challenge.isCompleted && styles.challengeCardCompleted]}
    >
      <View style={styles.challengeHeader}>
        <View style={styles.challengeType}>
          <Ionicons name={getTypeIcon() as any} size={16} color={color.sacred} />
          <Text style={styles.challengeTypeText}>{getTypeLabel()}</Text>
        </View>
        {challenge.isCompleted && (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-circle" size={16} color={color.progress} />
            <Text style={styles.completedText}>{t('community.done')}</Text>
          </View>
        )}
      </View>

      <Text style={styles.challengeTitle}>{lc(challenge.title, challenge.titleFr)}</Text>
      <Text style={styles.challengeTitleArabic}>{challenge.titleArabic}</Text>
      <Text style={styles.challengeDescription}>{lc(challenge.description, challenge.descriptionFr)}</Text>

      <View style={styles.progressSection}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${progressPercent}%` },
              challenge.isCompleted && styles.progressFillComplete,
            ]}
          />
        </View>
        <View style={styles.progressStats}>
          <Text style={styles.progressText}>
            {challenge.currentValue.toLocaleString()}/{challenge.targetValue.toLocaleString()} {getTargetLabel()}
          </Text>
          <Text style={styles.progressPercent}>{progressPercent}%</Text>
        </View>
      </View>

      <View style={styles.challengeFooter}>
        <View style={styles.contributionBox}>
          <Ionicons name="person" size={14} color={color.accent} />
          <Text style={styles.contributionText}>
            {t('community.yourContribution', { value: challenge.userContribution, label: getTargetLabel() })}
          </Text>
        </View>
        <View style={styles.rewardBox}>
          <Ionicons name="star" size={14} color={color.sacred} />
          <Text style={styles.rewardText}>+{challenge.xpReward} XP</Text>
        </View>
      </View>

      {!challenge.isCompleted && (
        <View style={styles.actionButtons}>
          <Pressable
            style={styles.actionButton}
            onPress={() => router.push('/quiz/arabic-quiz')}
          >
            <Ionicons name="book" size={18} color={color.text} />
            <Text style={styles.actionButtonText}>{t('community.vocabulary')}</Text>
          </Pressable>
          <Pressable
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={() => router.push('/quiz/grammar-quiz')}
          >
            <Ionicons name="school" size={18} color={color.sacred} />
            <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>{t('community.grammar')}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

export function ChallengesTab() {
  const { t } = useTranslation();
  const { dailyChallenge, weeklyChallenge, initializeChallenges } = useCommunityStore();

  useEffect(() => {
    initializeChallenges();
  }, []);

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {dailyChallenge && <ChallengeCard challenge={dailyChallenge} />}
      {weeklyChallenge && <ChallengeCard challenge={weeklyChallenge} />}

      {!dailyChallenge && !weeklyChallenge && (
        <View style={styles.emptyState}>
          <Ionicons name="flag-outline" size={48} color={color.textFaint} />
          <Text style={styles.emptyText}>{t('community.noChallenges')}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 40,
    gap: 16,
  },

  // Challenge Card
  challengeCard: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: color.border,
  },
  challengeCardCompleted: {
    borderColor: withAlpha(color.progress, 0.25),
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  challengeType: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  challengeTypeText: {
    fontSize: 12,
    color: color.sacred,
    fontWeight: '600',
    marginLeft: 6,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  completedText: {
    fontSize: 12,
    color: color.progress,
    fontWeight: '600',
    marginLeft: 4,
  },
  challengeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: color.text,
    marginBottom: 4,
  },
  challengeTitleArabic: {
    fontFamily: font.arabic,
    lineHeight: 34,
    fontSize: 20,
    color: color.sacred,
    marginBottom: 8,
  },
  challengeDescription: {
    fontSize: 14,
    color: color.textMuted,
    marginBottom: 16,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressBar: {
    height: 10,
    backgroundColor: color.bg,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: color.accentStrong,
    borderRadius: 5,
  },
  progressFillComplete: {
    backgroundColor: color.progress,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 14,
    color: color.text,
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 14,
    color: color.accent,
    fontWeight: '600',
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  contributionBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contributionText: {
    fontSize: 13,
    color: color.accent,
    marginLeft: 6,
  },
  rewardBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  rewardText: {
    fontSize: 13,
    color: color.sacred,
    fontWeight: '600',
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.accentStrong,
    borderRadius: radius.md,
    paddingVertical: 12,
    gap: 6,
  },
  actionButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: color.sacred,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: color.text,
  },
  actionButtonTextSecondary: {
    color: color.sacred,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: color.textFaint,
    marginTop: 12,
  },
});
