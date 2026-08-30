import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { color, radius } from '../../theme/tokens';
import { withAlpha } from '../ui/Primitives';

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
    admin: { label: 'Admin', color: color.warning, icon: 'shield' },
    moderator: { label: 'Mod', color: color.accent, icon: 'shield-half' },
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
            <View style={[styles.roleBadge, { backgroundColor: withAlpha(color.warning, 0.13) }]}>
              <Ionicons name="trophy" size={10} color={color.warning} style={{ marginRight: 3 }} />
              <Text style={[styles.roleBadgeText, { color: color.warning }]}>{t('community.top')}</Text>
            </View>
          )}
        </View>
        <View style={styles.memberStats}>
          <Ionicons name="flame" size={12} color={color.warning} />
          <Text style={styles.memberStatText}>{member.streak}d</Text>
          <Ionicons name="star" size={12} color={color.warning} />
          <Text style={styles.memberStatText}>{member.xp.toLocaleString()} XP</Text>
          <Text style={styles.memberJoined}>{'\u00b7'} {getDaysAgo(member.joinedAt)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: color.surface, borderRadius: radius.md, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: color.border },
  memberAvatar: { width: 44, height: 44, borderRadius: radius.xl, backgroundColor: color.surfaceRaised, alignItems: 'center', justifyContent: 'center' },
  memberAvatarText: { fontSize: 18, fontWeight: '700', color: color.text },
  memberInfo: { flex: 1 },
  memberNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  memberName: { fontSize: 15, fontWeight: '700', color: color.text },
  roleBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  roleBadgeText: { fontSize: 11, fontWeight: '600' },
  memberStats: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  memberStatText: { fontSize: 12, color: color.textFaint, marginRight: 4 },
  memberJoined: { fontSize: 11, color: color.textFaint },
});
