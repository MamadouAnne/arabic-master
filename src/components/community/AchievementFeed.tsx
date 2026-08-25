import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CommunityAchievement } from '../../types/community';

interface AchievementFeedProps {
  achievements: CommunityAchievement[];
}

const getTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now.getTime() - time.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

const getIconColor = (icon: string, isUser: boolean): string => {
  if (isUser) return '#818cf8';
  switch (icon) {
    case 'flame':
      return '#f97316';
    case 'trophy':
      return '#D4AF37';
    case 'star':
      return '#eab308';
    case 'book':
      return '#22c55e';
    default:
      return '#94a3b8';
  }
};

export const AchievementFeed: React.FC<AchievementFeedProps> = ({ achievements }) => {
  const { t } = useTranslation();
  if (achievements.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('community.recentAchievements')}</Text>
          <Text style={styles.titleArabic}>الإنجازات</Text>
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="trophy-outline" size={40} color="#334155" />
          <Text style={styles.emptyText}>{t('community.noAchievementsYet')}</Text>
          <Text style={styles.emptySubtext}>{t('community.keepLearningAchievements')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('community.recentAchievements')}</Text>
        <Text style={styles.titleArabic}>الإنجازات</Text>
      </View>

      <View style={styles.feed}>
        {achievements.map((achievement) => {
          const isUser = achievement.type === 'user';
          const iconColor = getIconColor(achievement.icon, isUser);

          return (
            <View
              key={achievement.id}
              style={[styles.feedItem, isUser && styles.feedItemUser]}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
                <Ionicons
                  name={achievement.icon as any}
                  size={18}
                  color={iconColor}
                />
              </View>
              <View style={styles.content}>
                <Text style={styles.userName}>
                  {achievement.userName === 'You' ? (
                    <Text style={styles.userNameHighlight}>{t('community.you')}</Text>
                  ) : (
                    achievement.userName
                  )}
                  <Text style={styles.achievementText}>
                    {' '}earned "{achievement.achievementTitle}"
                  </Text>
                </Text>
                <Text style={styles.achievementArabic}>
                  {achievement.achievementTitleArabic}
                </Text>
              </View>
              <Text style={styles.timestamp}>{getTimeAgo(achievement.timestamp)}</Text>
            </View>
          );
        })}
      </View>
    </View>
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
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  titleArabic: {
    fontSize: 18,
    color: '#D4AF37',
  },
  feed: {
  },
  feedItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#0f172a',
    borderRadius: 10,
    marginBottom: 12,
  },
  feedItemUser: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
  },
  userNameHighlight: {
    color: '#818cf8',
    fontWeight: '600',
  },
  achievementText: {
    color: '#94a3b8',
  },
  achievementArabic: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  timestamp: {
    fontSize: 11,
    color: '#64748b',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#475569',
    marginTop: 4,
  },
});
