import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Challenge } from '../../types/community';

interface ChallengeCardProps {
  challenge: Challenge;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge }) => {
  const { t } = useTranslation();
  const progress = Math.min(challenge.currentValue / challenge.targetValue, 1);
  const progressPercent = Math.round(progress * 100);

  const getTypeIcon = () => {
    switch (challenge.type) {
      case 'daily':
        return 'today';
      case 'weekly':
        return 'calendar';
      case 'weekend':
        return 'sunny';
      default:
        return 'flag';
    }
  };

  const getTypeLabel = () => {
    switch (challenge.type) {
      case 'daily':
        return "Today's Challenge";
      case 'weekly':
        return 'Weekly Challenge';
      case 'weekend':
        return 'Weekend Sprint';
      default:
        return 'Challenge';
    }
  };

  const getTargetTypeLabel = () => {
    switch (challenge.targetType) {
      case 'words':
        return 'words';
      case 'lessons':
        return 'lessons';
      case 'xp':
        return 'XP';
      case 'exercises':
        return 'exercises';
      case 'minutes':
        return 'minutes';
      default:
        return '';
    }
  };

  const getNavigationRoute = (): string => {
    // All challenges navigate to the Arabic vocabulary quiz
    return '/quiz/arabic-quiz';
  };

  const getActionText = () => {
    if (challenge.isCompleted) {
      return 'Challenge Complete!';
    }
    return 'Take Arabic Quiz';
  };

  const handlePress = () => {
    if (!challenge.isCompleted) {
      router.push(getNavigationRoute() as any);
    }
  };

  return (
    <Pressable
      style={styles.container}
      onPress={handlePress}
    >
      <View style={styles.header}>
        <View style={styles.typeTag}>
          <Ionicons name={getTypeIcon() as any} size={14} color="#D4AF37" />
          <Text style={styles.typeText}>{getTypeLabel()}</Text>
        </View>
        {challenge.isCompleted && (
          <View style={styles.completedTag}>
            <Ionicons name="checkmark-circle" size={14} color="#22c55e" />
            <Text style={styles.completedText}>{t('community.completedExclaim')}</Text>
          </View>
        )}
      </View>

      <Text style={styles.title}>{challenge.title}</Text>
      <Text style={styles.titleArabic}>{challenge.titleArabic}</Text>
      <Text style={styles.description}>{challenge.description}</Text>

      <View style={styles.progressContainer}>
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
            {challenge.currentValue.toLocaleString()}/{challenge.targetValue.toLocaleString()} {getTargetTypeLabel()}
          </Text>
          <Text style={styles.progressPercent}>{progressPercent}%</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.contributionBox}>
          <Ionicons name="person" size={14} color="#818cf8" />
          <Text style={styles.contributionText}>
            Your contribution: {challenge.userContribution} {getTargetTypeLabel()}
          </Text>
        </View>
        <View style={styles.rewardBox}>
          <Ionicons name="star" size={14} color="#D4AF37" />
          <Text style={styles.rewardText}>+{challenge.xpReward} XP</Text>
        </View>
      </View>

      {/* Action Button */}
      <View style={[styles.actionButton, challenge.isCompleted && styles.actionButtonCompleted]}>
        <Ionicons
          name={challenge.isCompleted ? 'checkmark-circle' : 'arrow-forward-circle'}
          size={18}
          color={challenge.isCompleted ? '#22c55e' : '#ffffff'}
          style={styles.actionIcon}
        />
        <Text style={[styles.actionText, challenge.isCompleted && styles.actionTextCompleted]}>
          {getActionText()}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    color: '#D4AF37',
    fontWeight: '600',
    marginLeft: 6,
  },
  completedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedText: {
    fontSize: 12,
    color: '#22c55e',
    fontWeight: '600',
    marginLeft: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  titleArabic: {
    fontSize: 18,
    color: '#94a3b8',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#0f172a',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 6,
  },
  progressFillComplete: {
    backgroundColor: '#22c55e',
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 14,
    color: '#818cf8',
    fontWeight: '600',
  },
  footer: {
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
    color: '#818cf8',
    marginLeft: 6,
  },
  rewardBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  rewardText: {
    fontSize: 13,
    color: '#D4AF37',
    fontWeight: '600',
    marginLeft: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 12,
  },
  actionButtonCompleted: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  actionIcon: {
    marginRight: 8,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  actionTextCompleted: {
    color: '#22c55e',
  },
});
