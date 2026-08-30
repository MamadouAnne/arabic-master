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
import { color, radius } from '../../../../src/theme/tokens';

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
          <ActivityIndicator color={color.accent} size="large" />
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
            <Ionicons name="link-outline" size={48} color={color.textFaint} />
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
          <Ionicons name="arrow-back" size={24} color={color.text} />
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
              <Ionicons name="people" size={16} color={color.accent} />
              <Text style={styles.statValue}>{group.memberCount}</Text>
              <Text style={styles.statLabel}>{t('community.membersLower')}</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="flag" size={16} color={color.progress} />
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
            <ActivityIndicator color={color.text} />
          ) : (
            <>
              <Ionicons name="people" size={20} color={color.text} />
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
  container: { flex: 1, backgroundColor: color.bg },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  loadingText: { fontSize: 14, color: color.textMuted, marginTop: 12 },
  errorIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: color.surface, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  errorTitle: { fontSize: 18, fontWeight: '700', color: color.text, marginBottom: 8, textAlign: 'center' },
  errorDesc: { fontSize: 14, color: color.textFaint, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  backBtn: { backgroundColor: color.accent, paddingHorizontal: 24, paddingVertical: 12, borderRadius: radius.md },
  backBtnText: { fontSize: 14, fontWeight: '700', color: color.text },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
  headerBack: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: color.text },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 12, alignItems: 'center' },
  card: { backgroundColor: color.surface, borderRadius: radius.xl, padding: 28, alignItems: 'center', borderWidth: 1, borderColor: color.border, width: '100%', marginBottom: 24 },
  iconLarge: { width: 72, height: 72, borderRadius: radius.xl, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  groupName: { fontSize: 22, fontWeight: '800', color: color.text, marginBottom: 6, textAlign: 'center' },
  groupTopic: { fontSize: 14, fontWeight: '600', color: color.textMuted, marginBottom: 12 },
  groupDesc: { fontSize: 14, color: color.textFaint, lineHeight: 21, textAlign: 'center', marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 24, marginBottom: 12 },
  stat: { alignItems: 'center', gap: 4 },
  statValue: { fontSize: 18, fontWeight: '800', color: color.text },
  statLabel: { fontSize: 11, color: color.textFaint },
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: color.bg, borderRadius: radius.sm, paddingHorizontal: 14, paddingVertical: 8 },
  goalText: { fontSize: 13, fontWeight: '600', color: color.text },
  joinBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', paddingVertical: 16, borderRadius: radius.md },
  joinBtnDisabled: { opacity: 0.5 },
  joinBtnText: { fontSize: 16, fontWeight: '700', color: color.text },
  inviteHint: { fontSize: 12, color: color.textFaint, marginTop: 12 },
});
