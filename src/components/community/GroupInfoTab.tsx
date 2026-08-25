import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, Pressable, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StudyGroup, StudySession, GroupChallenge } from '../../types/community';
import { useLocalizedContent } from '../../hooks/useLocalizedContent';
import { localizeGoal } from '../../data/community/goalLocalization';
import { SessionCard } from './SessionCard';
import { GroupChallengeCard } from './GroupChallengeCard';

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
          <Ionicons name="people" size={20} color="#818cf8" />
          <Text style={styles.statValue}>{group.memberCount}</Text>
          <Text style={styles.statLabel}>{t('community.groupMembers')}</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="trophy" size={20} color="#f59e0b" />
          <Text style={styles.statValue}>{group.maxMembers}</Text>
          <Text style={styles.statLabel}>{t('community.max')}</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="flag" size={20} color="#10b981" />
          <Text style={styles.statValue}>{messages.filter((m) => m.type === 'milestone').length}</Text>
          <Text style={styles.statLabel}>{t('community.groupMilestone')}</Text>
        </View>
      </View>

      {/* Invite Link */}
      <Pressable style={styles.inviteCard} onPress={handleShareInvite}>
        <Ionicons name="link" size={20} color="#818cf8" />
        <View style={{ flex: 1 }}>
          <Text style={styles.inviteTitle}>{t('community.shareInvite', { defaultValue: 'Share Invite Link' })}</Text>
          <Text style={styles.inviteSubtitle}>
            {inviteCode || group.inviteCode
              ? `Code: ${inviteCode || group.inviteCode}`
              : t('community.tapToGenerate', { defaultValue: 'Tap to generate invite link' })}
          </Text>
        </View>
        <Ionicons name="share-outline" size={20} color="#64748b" />
      </Pressable>

      {/* Sessions */}
      <View style={styles.sectionHeader}>
        <Ionicons name="calendar" size={18} color="#818cf8" />
        <Text style={styles.sectionTitle}>{t('community.sessions', { defaultValue: 'Study Sessions' })}</Text>
        {canManage && onCreateSession && (
          <Pressable style={styles.addBtn} onPress={onCreateSession}>
            <Ionicons name="add" size={18} color="#818cf8" />
          </Pressable>
        )}
      </View>
      <Text style={styles.sectionDesc}>{t('community.scheduleStudyDesc')}</Text>
      {upcomingSessions.length === 0 && pastSessions.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="calendar-outline" size={28} color="#475569" />
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
        <Ionicons name="flash" size={18} color="#f59e0b" />
        <Text style={styles.sectionTitle}>{t('community.groupChallenges', { defaultValue: 'Group Challenges' })}</Text>
        {canManage && onCreateChallenge && (
          <Pressable style={styles.addBtn} onPress={onCreateChallenge}>
            <Ionicons name="add" size={18} color="#f59e0b" />
          </Pressable>
        )}
      </View>
      <Text style={styles.sectionDesc}>{t('community.setGoalDesc')}</Text>
      {challenges.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="flash-outline" size={28} color="#475569" />
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
  infoCard: { backgroundColor: '#1e293b', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#334155' },
  infoIconLarge: { width: 64, height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  infoName: { fontSize: 20, fontWeight: '800', color: '#ffffff', marginBottom: 4, textAlign: 'center' },
  infoTopic: { fontSize: 14, fontWeight: '600', color: '#94a3b8', marginBottom: 10 },
  infoDesc: { fontSize: 14, color: '#64748b', lineHeight: 20, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: '#1e293b', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  statValue: { fontSize: 22, fontWeight: '800', color: '#ffffff', marginTop: 6 },
  statLabel: { fontSize: 11, color: '#64748b', marginTop: 2 },
  inviteCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#1e293b', borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#334155' },
  inviteTitle: { fontSize: 14, fontWeight: '700', color: '#ffffff', marginBottom: 2 },
  inviteSubtitle: { fontSize: 12, color: '#64748b' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#ffffff', flex: 1 },
  sectionDesc: { fontSize: 13, color: '#64748b', lineHeight: 18, marginBottom: 12, marginTop: -4 },
  addBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#334155' },
  emptyCard: { backgroundColor: '#1e293b', borderRadius: 14, padding: 20, alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#334155', borderStyle: 'dashed' },
  emptyTitle: { fontSize: 14, fontWeight: '700', color: '#94a3b8', marginTop: 8, marginBottom: 4 },
  emptyDesc: { fontSize: 13, color: '#64748b', textAlign: 'center', lineHeight: 19 },
  goalCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#1e293b', borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#334155' },
  goalInfo: { flex: 1 },
  goalTitle: { fontSize: 12, color: '#64748b', fontWeight: '600', marginBottom: 2 },
  goalValue: { fontSize: 15, fontWeight: '700', color: '#ffffff' },
  progressSection: { backgroundColor: '#1e293b', borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#334155' },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 13, color: '#94a3b8' },
  progressPercent: { fontSize: 13, fontWeight: '700', color: '#ffffff' },
  progressBar: { height: 6, backgroundColor: '#0f172a', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981' },
  activeText: { fontSize: 13, color: '#10b981', fontWeight: '600' },
  createdText: { fontSize: 12, color: '#475569' },
});
