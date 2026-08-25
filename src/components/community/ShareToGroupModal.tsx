import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, Pressable, Modal, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCommunityStore } from '../../stores/communityStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { sendSharedContentMessage } from '../../services/communitySocialService';
import type { SharedContent } from '../../data/community/socialData';

interface Props {
  visible: boolean;
  content: SharedContent | null;
  onClose: () => void;
  onShared?: (groupId: string) => void;
}

/**
 * Reusable "Share to a study group" sheet. Lists the groups the user has
 * joined and posts the given content as a rich shared-content message.
 */
export function ShareToGroupModal({ visible, content, onClose, onShared }: Props) {
  const { t } = useTranslation();
  const groups = useCommunityStore((s) => s.groups);
  const loadGroups = useCommunityStore((s) => s.loadGroups);
  const user = useSettingsStore((s) => s.user);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const joined = groups.filter((g) => g.isJoined);

  useEffect(() => {
    if (visible && groups.length === 0) loadGroups();
  }, [visible]);

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'You';

  const handleShare = async (groupId: string) => {
    if (!content || !user || sendingId) return;
    setSendingId(groupId);
    await sendSharedContentMessage(groupId, user.id, displayName, content as any);
    setSendingId(null);
    onShared?.(groupId);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.sheet} edges={['bottom']}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>{t('community.shareToAGroup')}</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={22} color="#94a3b8" />
            </Pressable>
          </View>

          {joined.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={40} color="#475569" />
              <Text style={styles.emptyText}>{t('community.joinGroupToShare')}</Text>
            </View>
          ) : (
            <FlatList
              data={joined}
              keyExtractor={(g) => g.id}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item: g }) => (
                <Pressable style={styles.row} onPress={() => handleShare(g.id)} disabled={!!sendingId}>
                  <View style={[styles.icon, { backgroundColor: `${g.color}20` }]}>
                    <Ionicons name={g.icon as any} size={20} color={g.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.groupName} numberOfLines={1}>{g.name}</Text>
                    <Text style={styles.groupMeta} numberOfLines={1}>{g.memberCount} members</Text>
                  </View>
                  {sendingId === g.id ? (
                    <ActivityIndicator color={g.color} size="small" />
                  ) : (
                    <Ionicons name="send" size={18} color={g.color} />
                  )}
                </Pressable>
              )}
            />
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#0f172a', borderTopLeftRadius: 22, borderTopRightRadius: 22, maxHeight: '70%', paddingHorizontal: 16, borderTopWidth: 1, borderColor: '#1e293b' },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#334155', alignSelf: 'center', marginTop: 10, marginBottom: 6 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  title: { fontSize: 18, fontWeight: '700', color: '#f8fafc' },
  empty: { alignItems: 'center', gap: 12, paddingVertical: 50, paddingHorizontal: 30 },
  emptyText: { fontSize: 14, color: '#64748b', textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  icon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  groupName: { fontSize: 15, fontWeight: '600', color: '#e2e8f0' },
  groupMeta: { fontSize: 12, color: '#64748b', marginTop: 2 },
});
