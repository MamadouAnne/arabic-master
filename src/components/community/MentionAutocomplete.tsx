import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import type { GroupMember } from '../../data/community/socialData';
import { color, radius } from '../../theme/tokens';

interface Props {
  members: GroupMember[];
  query: string;
  groupColor: string;
  onSelect: (member: GroupMember) => void;
}

export function MentionAutocomplete({ members, query, groupColor, onSelect }: Props) {
  const q = query.toLowerCase();
  const matches = members
    .filter((m) => m.name.toLowerCase().includes(q))
    .slice(0, 6);

  if (matches.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 220 }}>
        {matches.map((m) => (
          <Pressable key={m.id} style={styles.row} onPress={() => onSelect(m)}>
            <View style={[styles.avatar, { backgroundColor: `${groupColor}25` }]}>
              <Text style={[styles.avatarText, { color: groupColor }]}>{m.avatar}</Text>
            </View>
            <Text style={styles.name} numberOfLines={1}>{m.name}</Text>
            {m.role !== 'member' && (
              <Text style={[styles.role, { color: groupColor }]}>{m.role}</Text>
            )}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: color.bg, borderTopWidth: 1, borderTopColor: color.borderSubtle },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: color.borderSubtle },
  avatar: { width: 30, height: 30, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 13, fontWeight: '700' },
  name: { flex: 1, fontSize: 14, color: color.text, fontWeight: '500' },
  role: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
});
