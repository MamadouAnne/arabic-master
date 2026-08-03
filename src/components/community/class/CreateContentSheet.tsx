import React from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ClassContentKind } from '../../../types/classContent';

interface Props {
  visible: boolean;
  groupColor: string;
  onSelect: (kind: ClassContentKind) => void;
  onClose: () => void;
}

const ITEMS: { kind: ClassContentKind; icon: string; label: string; desc: string; color: string }[] = [
  { kind: 'quiz', icon: 'help-circle', label: 'Quiz', desc: 'Questions students answer & get graded on', color: '#6366f1' },
  { kind: 'poll', icon: 'stats-chart', label: 'Poll', desc: 'A quick question with a live tally', color: '#f59e0b' },
  { kind: 'board', icon: 'brush', label: 'Board', desc: 'Draw, write, highlight & annotate on a canvas', color: '#ec4899' },
];

export function CreateContentSheet({ visible, groupColor, onSelect, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.handle} />
            <Text style={styles.title}>Create class content</Text>
            {ITEMS.map((it) => (
              <Pressable key={it.kind} style={styles.row} onPress={() => { onSelect(it.kind); onClose(); }}>
                <View style={[styles.icon, { backgroundColor: `${it.color}22` }]}>
                  <Ionicons name={it.icon as any} size={22} color={it.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>{it.label}</Text>
                  <Text style={styles.desc}>{it.desc}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#64748b" />
              </Pressable>
            ))}
            <Pressable style={styles.cancel} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#0f172a', borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingHorizontal: 16, paddingBottom: 32, borderTopWidth: 1, borderColor: '#1e293b' },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#334155', alignSelf: 'center', marginTop: 10, marginBottom: 10 },
  title: { fontSize: 18, fontWeight: '700', color: '#f8fafc', marginBottom: 12, paddingHorizontal: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, paddingHorizontal: 6, borderRadius: 14 },
  icon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 16, fontWeight: '700', color: '#e2e8f0' },
  desc: { fontSize: 12.5, color: '#94a3b8', marginTop: 2 },
  cancel: { marginTop: 8, paddingVertical: 14, borderRadius: 12, backgroundColor: '#1e293b', alignItems: 'center' },
  cancelText: { fontSize: 16, color: '#94a3b8', fontWeight: '600' },
});
