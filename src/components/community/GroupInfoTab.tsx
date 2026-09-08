import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, Pressable, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StudyGroup, StudySession, GroupChallenge } from '../../types/community';
import { useLocalizedContent } from '../../hooks/useLocalizedContent';
import { localizeGoal } from '../../data/community/goalLocalization';
import { SessionCard } from './SessionCard';
import { GroupChallengeCard } from './GroupChallengeCard';
import { color, radius } from '../../theme/tokens';

interface Props {
  group: StudyGroup;
  messages: { type: string }[];
  sessions: StudySession[];
  challenges: GroupChallenge[];
  getDaysAgo: (d: string) => string;
  t: any;
  canManage: boolean;
  inviteCode: string | null;
  onGenerateInvite: () => void;
  onRsvpSession: (sessionId: string, status: 'going' | 'not_going') => void;
  onCreateSession?: () => void;
  onCreateChallenge?: () => void;
}

export function GroupInfoTab({
  group, messages, sessions, challenges, getDaysAgo, t, canManage, inviteCode,
  onGenerateInvite, onRsvpSession, onCreateSession, onCreateChallenge,
}: Props) {
  const { lc, language } = useLocalizedContent();
  const handleShareInvite = async () => {
    const code = inviteCode || group.inviteCode;
    if (!code) {
      onGenerateInvite();
      return;
    }
    try {
      await Share.share({
        message: `Join my study group "${group.name}" on Iqra! Use invite code: ${code}\n\niqra2://group/invite/${code}`,
      });
    } catch {}
  };

  const upcomingSessions = sessions.filter((s) => new Date(s.scheduledAt) > new Date());
  const pastSessions = sessions.filter((s) => new Date(s.scheduledAt) <= new Date());

  return (
    <>
      {/* Group description card */}
      <View style={styles.infoCard}>
        <View style={[styles.infoIconLarge, { backgroundColor: `${group.color}20` }]}>
          <Ionicons name={group.icon as any} size={36} color={group.color} />
        </View>
        <Text style={styles.infoName}>{lc(group.name, group.nameFr)}</Text>
        <Text style={styles.infoTopic}>{lc(group.topic, group.topicFr)}</Text>
        <Text style={styles.infoDesc}>{lc(group.description, group.descriptionFr)}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="people" size={20} color={color.accent} />
          <Text style={styles.statValue}>{group.memberCount}</Text>
          <Text style={styles.statLabel}>{t('community.groupMembers')}</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="trophy" size={20} color={color.warning} />
          <Text style={styles.statValue}>{group.maxMembers}</Text>
          <Text style={styles.statLabel}>{t('community.max')}</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="flag" size={20} color={color.progress} />
          <Text style={styles.statValue}>{messages.filter((m) => m.type === 'milestone').length}</Text>
          <Text style={styles.statLabel}>{t('community.groupMilestone')}</Text>
        </View>
      </View>

      {/* Invite Link */}
      <Pressable style={styles.inviteCard} onPress={handleShareInvite}>
        <Ionicons name="link" size={20} color={color.accent} />
        <View style={{ flex: 1 }}>
          <Text style={styles.inviteTitle}>{t('community.shareInvite', { defaultValue: 'Share Invite Link' })}</Text>
          <Text style={styles.inviteSubtitle}>
            {inviteCode || group.inviteCode
              ? `Code: ${inviteCode || group.inviteCode}`
              : t('community.tapToGenerate', { defaultValue: 'Tap to generate invite link' })}
          </Text>
        </View>
        <Ionicons name="share-outline" size={20} color={color.textFaint} />
      </Pressable>

      {/* Sessions */}
      <View style={styles.sectionHeader}>
        <Ionicons name="calendar" size={18} color={color.accent} />
        <Text style={styles.sectionTitle}>{t('community.sessions', { defaultValue: 'Study Sessions' })}</Text>
        {canManage && onCreateSession && (
          <Pressable style={styles.addBtn} onPress={onCreateSession}>
            <Ionicons name="add" size={18} color={color.accent} />
          </Pressable>
        )}
      </View>
      <Text style={styles.sectionDesc}>{t('community.scheduleStudyDesc')}</Text>
      {upcomingSessions.length === 0 && pastSessions.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="calendar-outline" size={28} color={color.textFaint} />
          <Text style={styles.emptyTitle}>{t('community.noSessionsYet')}</Text>
          <Text style={styles.emptyDesc}>
            {canManage
              ? 'Create a study session to pick a time for the group to learn together. Members will be able to RSVP.'
              : 'When an admin schedules a group study session, it will appear here. You can RSVP to join.'}
          </Text>
        </View>
      ) : (
        <>
          {upcomingSessions.map((session) => (
            <SessionCard key={session.id} session={session} groupColor={group.color} onRsvp={onRsvpSession} />
          ))}
          {pastSessions.map((session) => (
            <SessionCard key={session.id} session={session} groupColor={group.color} onRsvp={onRsvpSession} isPast />
          ))}
        </>
      )}

      {/* Challenges */}
      <View style={styles.sectionHeader}>
        <Ionicons name="flash" size={18} color={color.warning} />
        <Text style={styles.sectionTitle}>{t('community.groupChallenges', { defaultValue: 'Group Challenges' })}</Text>
        {canManage && onCreateChallenge && (
          <Pressable style={styles.addBtn} onPress={onCreateChallenge}>
            <Ionicons name="add" size={18} color={color.warning} />
          </Pressable>
        )}
      </View>
      <Text style={styles.sectionDesc}>{t('community.setGoalDesc')}</Text>
      {challenges.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="flash-outline" size={28} color={color.textFaint} />
          <Text style={styles.emptyTitle}>{t('community.noChallengesYet')}</Text>
          <Text style={styles.emptyDesc}>
            {canManage
              ? 'Start a challenge to motivate the group — e.g. "Memorize Surah Al-Mulk in 7 days". Everyone works toward the same goal.'
              : 'When an admin creates a group challenge, it will appear here. Work together to reach the goal before time runs out!'}
          </Text>
        </View>
      ) : (
        challenges.map((challenge) => (
          <GroupChallengeCard key={challenge.id} challenge={challenge} groupColor={group.color} />
        ))
      )}

      {/* Goal */}
      <View style={styles.goalCard}>
        <Ionicons name="flag-outline" size={18} color={group.color} />
        <View style={styles.goalInfo}>
          <Text style={styles.goalTitle}>{t('community.groupGoal', { goal: '' }).replace(': ', '')}</Text>
          <Text style={styles.goalValue}>{localizeGoal(lc(group.goal, group.goalFr), language)}</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>{t('community.members', { count: group.memberCount })}</Text>
          <Text style={styles.progressPercent}>{Math.round((group.memberCount / group.maxMembers) * 100)}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${Math.min((group.memberCount / group.maxMembers) * 100, 100)}%`, backgroundColor: group.color }]} />
        </View>
      </View>

      {/* Status */}
      <View style={styles.statusRow}>
        {group.isActive && (
          <View style={styles.statusBadge}>
            <View style={styles.activeDot} />
            <Text style={styles.activeText}>{t('community.activeNow')}</Text>
          </View>
        )}
        <Text style={styles.createdText}>{t('community.createdAgo', { time: getDaysAgo(group.createdAt) })}</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  infoCard: { backgroundColor: color.surface, borderRadius: radius.lg, padding: 24, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: color.border },
  infoIconLarge: { width: 64, height: 64, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  infoName: { fontSize: 20, fontWeight: '700', color: color.text, marginBottom: 4, textAlign: 'center' },
  infoTopic: { fontSize: 14, fontWeight: '600', color: color.textMuted, marginBottom: 10 },
  infoDesc: { fontSize: 14, color: color.textFaint, lineHeight: 20, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: color.surface, borderRadius: radius.md, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: color.border },
  statValue: { fontSize: 22, fontWeight: '700', color: color.text, marginTop: 6 },
  statLabel: { fontSize: 11, color: color.textFaint, marginTop: 2 },
  inviteCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: color.surface, borderRadius: radius.md, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: color.border },
  inviteTitle: { fontSize: 14, fontWeight: '700', color: color.text, marginBottom: 2 },
  inviteSubtitle: { fontSize: 12, color: color.textFaint },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: color.text, flex: 1 },
  sectionDesc: { fontSize: 13, color: color.textFaint, lineHeight: 18, marginBottom: 12, marginTop: -4 },
  addBtn: { width: 32, height: 32, borderRadius: radius.sm, backgroundColor: color.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: color.border },
  emptyCard: { backgroundColor: color.surface, borderRadius: radius.md, padding: 20, alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: color.border, borderStyle: 'dashed' },
  emptyTitle: { fontSize: 14, fontWeight: '700', color: color.textMuted, marginTop: 8, marginBottom: 4 },
  emptyDesc: { fontSize: 13, color: color.textFaint, textAlign: 'center', lineHeight: 19 },
  goalCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: color.surface, borderRadius: radius.md, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: color.border },
  goalInfo: { flex: 1 },
  goalTitle: { fontSize: 12, color: color.textFaint, fontWeight: '600', marginBottom: 2 },
  goalValue: { fontSize: 15, fontWeight: '700', color: color.text },
  progressSection: { backgroundColor: color.surface, borderRadius: radius.md, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: color.border },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 13, color: color.textMuted },
  progressPercent: { fontSize: 13, fontWeight: '700', color: color.text },
  progressBar: { height: 6, backgroundColor: color.bg, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: color.progress },
  activeText: { fontSize: 13, color: color.progress, fontWeight: '600' },
  createdText: { fontSize: 12, color: color.textFaint },
});
