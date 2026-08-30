import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { color } from '../../theme/tokens';

export interface ReplyTarget {
  id: string;
  authorName: string;
  body: string;
  type?: string;
}

interface Props {
  target: ReplyTarget;
  groupColor: string;
  onCancel: () => void;
}

function snippet(t: ReplyTarget): string {
  if (t.type === 'voice') return '🎤 Voice note';
  if (t.type === 'image') return '📷 Photo';
  if (t.type === 'shared') return '📖 Shared content';
  return t.body || '';
}

export const ReplyPreviewBar = React.memo(function ReplyPreviewBar({ target, groupColor, onCancel }: Props) {
  return (
    <View style={styles.bar}>
      <View style={[styles.accent, { backgroundColor: groupColor }]} />
      <View style={styles.body}>
        <Text style={[styles.author, { color: groupColor }]} numberOfLines={1}>
          Replying to {target.authorName}
        </Text>
        <Text style={styles.snippet} numberOfLines={1}>{snippet(target)}</Text>
      </View>
      <Pressable onPress={onCancel} hitSlop={8} style={styles.close}>
        <Ionicons name="close" size={18} color={color.textMuted} />
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', backgroundColor: color.bg, paddingHorizontal: 12, paddingVertical: 8, borderTopWidth: 1, borderTopColor: color.borderSubtle, gap: 10 },
  accent: { width: 3, alignSelf: 'stretch', borderRadius: 2, minHeight: 30 },
  body: { flex: 1 },
  author: { fontSize: 12, fontWeight: '700', marginBottom: 2 },
  snippet: { fontSize: 13, color: color.textMuted },
  close: { padding: 2 },
});
