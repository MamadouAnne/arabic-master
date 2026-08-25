import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReactionPicker } from './ReactionPicker';

export interface MessageActions {
  canReply: boolean;
  canReact: boolean;
  canCopy: boolean;
  canBoard: boolean;
  canPin: boolean;
  isPinned: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

interface Props {
  visible: boolean;
  actions: MessageActions;
  groupColor: string;
  onReact: (emoji: string) => void;
  onReply: () => void;
  onCopy: () => void;
  onBoard: () => void;
  onPinToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export function MessageActionSheet({
  visible, actions, groupColor, onReact, onReply, onCopy, onBoard, onPinToggle, onEdit, onDelete, onClose,
}: Props) {
  const { t } = useTranslation();
  const item = (icon: string, label: string, onPress: () => void, danger = false) => (
    <Pressable
      style={styles.row}
      onPress={() => { onPress(); onClose(); }}
    >
      <Ionicons name={icon as any} size={20} color={danger ? '#ef4444' : '#cbd5e1'} />
      <Text style={[styles.rowText, danger && { color: '#ef4444' }]}>{label}</Text>
    </Pressable>
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          {actions.canReact && (
            <View style={styles.reactionRow}>
              <ReactionPicker
                inline
                onSelect={(emoji) => { onReact(emoji); onClose(); }}
                onClose={onClose}
              />
            </View>
          )}
          {actions.canReply && item('arrow-undo', 'Reply', onReply)}
          {actions.canCopy && item('copy-outline', 'Copy', onCopy)}
          {actions.canBoard && item('brush-outline', 'Open on board', onBoard)}
          {actions.canPin && item(actions.isPinned ? 'remove-circle-outline' : 'pin', actions.isPinned ? 'Unpin' : 'Pin', onPinToggle)}
          {actions.canEdit && item('create-outline', 'Edit', onEdit)}
          {actions.canDelete && item('trash-outline', 'Delete', onDelete, true)}
          <Pressable style={styles.cancel} onPress={onClose}>
            <Text style={styles.cancelText}>{t('common.cancel')}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#1e293b', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 8, paddingBottom: 34, paddingHorizontal: 8, borderTopWidth: 1, borderColor: '#334155' },
  reactionRow: { alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#334155', marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12 },
  rowText: { fontSize: 16, color: '#e2e8f0', fontWeight: '500' },
  cancel: { marginTop: 8, marginHorizontal: 8, paddingVertical: 14, borderRadius: 12, backgroundColor: '#0f172a', alignItems: 'center' },
  cancelText: { fontSize: 16, color: '#94a3b8', fontWeight: '600' },
});
