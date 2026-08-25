import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface MemberRowData {
  id: string;
  userId?: string;
  name: string;
  avatar: string;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: string;
  streak: number;
  xp: number;
  isTopContributor?: boolean;
}

interface Props {
  member: MemberRowData;
  groupColor: string;
  getDaysAgo: (d: string) => string;
  canManage: boolean;
  onAction: () => void;
}

export function MemberRow({ member, groupColor, getDaysAgo, canManage, onAction }: Props) {
  const { t } = useTranslation();
  const roleConfig: Record<string, { label: string; color: string; icon: string }> = {
    admin: { label: 'Admin', color: '#f59e0b', icon: 'shield' },
    moderator: { label: 'Mod', color: '#818cf8', icon: 'shield-half' },
    member: { label: '', color: '', icon: '' },
  };
  const rc = roleConfig[member.role] || roleConfig.member;

  return (
    <Pressable style={styles.memberRow} onPress={canManage ? onAction : undefined}>
      <View style={[styles.memberAvatar, member.role !== 'member' && { borderColor: rc.color, borderWidth: 2 }]}>
        <Text style={styles.memberAvatarText}>{member.avatar}</Text>
      </View>
      <View style={styles.memberInfo}>
        <View style={styles.memberNameRow}>
          <Text style={styles.memberName}>{member.name}</Text>
          {member.role !== 'member' && (
            <View style={[styles.roleBadge, { backgroundColor: `${rc.color}20` }]}>
              <Ionicons name={rc.icon as any} size={10} color={rc.color} style={{ marginRight: 3 }} />
              <Text style={[styles.roleBadgeText, { color: rc.color }]}>{rc.label}</Text>
            </View>
          )}
          {member.isTopContributor && (
            <View style={[styles.roleBadge, { backgroundColor: '#f59e0b20' }]}>
              <Ionicons name="trophy" size={10} color="#f59e0b" style={{ marginRight: 3 }} />
              <Text style={[styles.roleBadgeText, { color: '#f59e0b' }]}>{t('community.top')}</Text>
            </View>
          )}
        </View>
        <View style={styles.memberStats}>
          <Ionicons name="flame" size={12} color="#f59e0b" />
          <Text style={styles.memberStatText}>{member.streak}d</Text>
          <Ionicons name="star" size={12} color="#f97316" />
          <Text style={styles.memberStatText}>{member.xp.toLocaleString()} XP</Text>
          <Text style={styles.memberJoined}>{'\u00b7'} {getDaysAgo(member.joinedAt)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#1e293b', borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#334155' },
  memberAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#334155', alignItems: 'center', justifyContent: 'center' },
  memberAvatarText: { fontSize: 18, fontWeight: '700', color: '#ffffff' },
  memberInfo: { flex: 1 },
  memberNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  memberName: { fontSize: 15, fontWeight: '700', color: '#ffffff' },
  roleBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  roleBadgeText: { fontSize: 11, fontWeight: '600' },
  memberStats: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  memberStatText: { fontSize: 12, color: '#64748b', marginRight: 4 },
  memberJoined: { fontSize: 11, color: '#475569' },
});
