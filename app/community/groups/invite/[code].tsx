import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { fetchGroupByInviteCode, joinGroup as joinGroupService } from '../../../../src/services/communitySocialService';
import { useCommunityStore } from '../../../../src/stores/communityStore';
import { useSettingsStore } from '../../../../src/stores/settingsStore';
import { StudyGroup } from '../../../../src/types/community';

export default function InviteLandingScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const { t } = useTranslation();
  const user = useSettingsStore((s) => s.user);
  const { joinGroup } = useCommunityStore();

  const [group, setGroup] = useState<StudyGroup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!code) return;
    (async () => {
      setIsLoading(true);
      const g = await fetchGroupByInviteCode(code);
      if (g) {
        setGroup(g);
      } else {
        setError(true);
      }
      setIsLoading(false);
    })();
  }, [code]);

  const handleJoin = async () => {
    if (!group || !user) return;
    setIsJoining(true);
    await joinGroup(group.id);
    if (user.id) {
      await joinGroupService(group.id, user.id);
    }
    setIsJoining(false);
    router.replace(`/community/groups/${group.id}` as any);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator color="#818cf8" size="large" />
          <Text style={styles.loadingText}>{t('community.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !group) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <View style={styles.errorIcon}>
            <Ionicons name="link-outline" size={48} color="#64748b" />
          </View>
          <Text style={styles.errorTitle}>{t('community.invalidInviteCode')}</Text>
          <Text style={styles.errorDesc}>{t('community.inviteExpired')}</Text>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>{t('common.goBack')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const isFull = group.memberCount >= group.maxMembers;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerBack}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </Pressable>
        <Text style={styles.headerTitle}>{t('community.joinViaInvite')}</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.content}>
        {/* Group card */}
        <View style={styles.card}>
          <View style={[styles.iconLarge, { backgroundColor: `${group.color}20` }]}>
            <Ionicons name={group.icon as any} size={40} color={group.color} />
          </View>
          <Text style={styles.groupName}>{group.name}</Text>
          <Text style={styles.groupTopic}>{group.topic}</Text>
          <Text style={styles.groupDesc}>{group.description}</Text>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Ionicons name="people" size={16} color="#818cf8" />
              <Text style={styles.statValue}>{group.memberCount}</Text>
              <Text style={styles.statLabel}>{t('community.membersLower')}</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="flag" size={16} color="#10b981" />
              <Text style={styles.statValue}>{group.maxMembers}</Text>
              <Text style={styles.statLabel}>{t('community.maxLower')}</Text>
            </View>
          </View>

          {group.goal && (
            <View style={styles.goalRow}>
              <Ionicons name="flag-outline" size={14} color={group.color} />
              <Text style={styles.goalText}>{group.goal}</Text>
            </View>
          )}
        </View>

        {/* Join button */}
        <Pressable
          style={[styles.joinBtn, { backgroundColor: group.color }, isFull && styles.joinBtnDisabled]}
          onPress={handleJoin}
          disabled={isFull || isJoining}
        >
          {isJoining ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Ionicons name="people" size={20} color="#ffffff" />
              <Text style={styles.joinBtnText}>
                {isFull ? 'Group is full' : t('community.joinGroup')}
              </Text>
            </>
          )}
        </Pressable>

        <Text style={styles.inviteHint}>
          Invited via code: {code}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  loadingText: { fontSize: 14, color: '#94a3b8', marginTop: 12 },
  errorIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  errorTitle: { fontSize: 18, fontWeight: '700', color: '#ffffff', marginBottom: 8, textAlign: 'center' },
  errorDesc: { fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  backBtn: { backgroundColor: '#818cf8', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  backBtnText: { fontSize: 14, fontWeight: '700', color: '#ffffff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
  headerBack: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#ffffff' },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 12, alignItems: 'center' },
  card: { backgroundColor: '#1e293b', borderRadius: 20, padding: 28, alignItems: 'center', borderWidth: 1, borderColor: '#334155', width: '100%', marginBottom: 24 },
  iconLarge: { width: 72, height: 72, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  groupName: { fontSize: 22, fontWeight: '800', color: '#ffffff', marginBottom: 6, textAlign: 'center' },
  groupTopic: { fontSize: 14, fontWeight: '600', color: '#94a3b8', marginBottom: 12 },
  groupDesc: { fontSize: 14, color: '#64748b', lineHeight: 21, textAlign: 'center', marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 24, marginBottom: 12 },
  stat: { alignItems: 'center', gap: 4 },
  statValue: { fontSize: 18, fontWeight: '800', color: '#ffffff' },
  statLabel: { fontSize: 11, color: '#64748b' },
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#0f172a', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  goalText: { fontSize: 13, fontWeight: '600', color: '#ffffff' },
  joinBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', paddingVertical: 16, borderRadius: 14 },
  joinBtnDisabled: { opacity: 0.5 },
  joinBtnText: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
  inviteHint: { fontSize: 12, color: '#475569', marginTop: 12 },
});
