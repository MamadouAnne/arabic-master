// Community/Social Feature Types for Iqra2.0 App

export interface LeaderboardEntry {
  id: string;
  name: string;
  nameArabic: string;
  avatarUrl?: string;
  xp: number;
  streak: number;
  rank: number;
  isCurrentUser: boolean;
  rankChange?: number; // positive = moved up, negative = moved down
}

export type LeaderboardType = 'weekly' | 'streaks' | 'allTime';

export interface Challenge {
  id: string;
  title: string;
  titleFr?: string;
  titleArabic: string;
  description: string;
  descriptionFr?: string;
  descriptionArabic: string;
  type: 'daily' | 'weekly' | 'weekend';
  targetType: 'words' | 'lessons' | 'xp' | 'minutes' | 'exercises';
  targetValue: number;
  currentValue: number; // Community progress
  userContribution: number; // User's contribution
  xpReward: number;
  startDate: string; // ISO date
  endDate: string; // ISO date
  isCompleted: boolean;
}

export interface CommunityStats {
  activeLearnersTodayCount: number;
  totalWordsLearnedToday: number;
  totalXpEarnedToday: number;
  activeStreaksCount: number;
}

export interface CommunityAchievement {
  id: string;
  type: 'user' | 'community';
  userId?: string;
  userName: string;
  achievementTitle: string;
  achievementTitleArabic: string;
  icon: string;
  timestamp: string; // ISO date
}

export interface SimulatedUser {
  id: string;
  name: string;
  nameArabic: string;
  baseXp: number;
  streakDays: number;
  activeLevel: 'casual' | 'regular' | 'dedicated'; // Affects how they "progress"
  joinedDaysAgo: number;
}

// ── Social features ─────────────────────────────────────────────

export type DiscussionCategory = 'general' | 'quran' | 'arabic' | 'prayer' | 'tips';

export interface DiscussionThread {
  id: string;
  title: string;
  titleFr?: string;
  body: string;
  bodyFr?: string;
  authorName: string;
  authorAvatar?: string;
  category: DiscussionCategory;
  replyCount: number;
  likeCount: number;
  isPinned: boolean;
  isHot: boolean;
  createdAt: string; // ISO date
}

export interface StudyGroup {
  id: string;
  name: string;
  nameFr?: string;
  description: string;
  descriptionFr?: string;
  topic: string;
  topicFr?: string;
  memberCount: number;
  maxMembers: number;
  isActive: boolean;
  isJoined: boolean;
  goal: string;
  goalFr?: string;
  icon: string;
  color: string;
  createdAt: string;
  inviteCode?: string;
  invitesEnabled?: boolean;
}

// ── Group Social Upgrade Types ──────────────────────────────────

export interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: string;
}

export interface StudySession {
  id: string;
  groupId: string;
  creatorId: string;
  creatorName: string;
  title: string;
  description: string;
  scheduledAt: string;
  durationMinutes: number;
  attendeeCount: number;
  userRsvp?: 'going' | 'not_going' | null;
  createdAt: string;
}

export interface SessionRsvp {
  sessionId: string;
  userId: string;
  status: 'going' | 'not_going';
  createdAt: string;
}

export interface GroupChallenge {
  id: string;
  groupId: string;
  creatorId: string;
  creatorName: string;
  title: string;
  targetType: 'surah' | 'words' | 'xp' | 'lessons' | 'custom';
  targetValue: number;
  currentValue: number;
  participantCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface ChallengeProgress {
  challengeId: string;
  userId: string;
  userName: string;
  progress: number;
  updatedAt: string;
}

export interface GroupTemplate {
  id: string;
  name: string;
  nameKey: string;
  description: string;
  descriptionKey: string;
  icon: string;
  color: string;
  topic: string;
  goal: string;
  goalKey: string;
}

export interface StudyPartner {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  streak: number;
  xp: number;
  interests: string[];
  matchScore: number; // 0-100
  isConnected: boolean;
  lastActive: string; // ISO date
}

export interface DiscussionReply {
  id: string;
  threadId: string;
  userId: string;
  authorName: string;
  body: string;
  likeCount: number;
  isLiked: boolean;
  createdAt: string;
}

export type ActivityType = 'completed_surah' | 'streak' | 'joined_group' | 'earned_xp' | 'discussion_post';

export interface ActivityFeedItem {
  id: string;
  userName: string;
  type: ActivityType;
  detail: string; // e.g. surah name, streak count, group name
  timeAgo: string;
  icon: string;
  color: string;
}
