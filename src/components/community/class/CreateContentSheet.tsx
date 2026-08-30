import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ClassContentKind } from '../../../types/classContent';
import { color, radius } from '../../../theme/tokens';

interface Props {
  visible: boolean;
  groupColor: string;
  onSelect: (kind: ClassContentKind) => void;
  onClose: () => void;
}

const ITEMS: { kind: ClassContentKind; icon: string; label: string; desc: string; color: string }[] = [
  { kind: 'quiz', icon: 'help-circle', label: 'Quiz', desc: 'Questions students answer & get graded on', color: color.accentStrong },
  { kind: 'poll', icon: 'stats-chart', label: 'Poll', desc: 'A quick question with a live tally', color: color.warning },
  { kind: 'board', icon: 'brush', label: 'Board', desc: 'Draw, write, highlight & annotate on a canvas', color: color.accent },
];

export function CreateContentSheet({ visible, groupColor, onSelect, onClose }: Props) {
  const { t } = useTranslation();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.handle} />
            <Text style={styles.title}>{t('community.createClassContent')}</Text>
            {ITEMS.map((it) => (
              <Pressable key={it.kind} style={styles.row} onPress={() => { onSelect(it.kind); onClose(); }}>
                <View style={[styles.icon, { backgroundColor: `${it.color}22` }]}>
                  <Ionicons name={it.icon as any} size={22} color={it.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>{it.label}</Text>
                  <Text style={styles.desc}>{it.desc}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={color.textFaint} />
              </Pressable>
            ))}
            <Pressable style={styles.cancel} onPress={onClose}>
              <Text style={styles.cancelText}>{t('common.cancel')}</Text>
            </Pressable>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: color.bg, borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingHorizontal: 16, paddingBottom: 32, borderTopWidth: 1, borderColor: color.borderSubtle },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: color.surfaceRaised, alignSelf: 'center', marginTop: 10, marginBottom: 10 },
  title: { fontSize: 18, fontWeight: '700', color: color.text, marginBottom: 12, paddingHorizontal: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, paddingHorizontal: 6, borderRadius: radius.md },
  icon: { width: 46, height: 46, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 16, fontWeight: '700', color: color.text },
  desc: { fontSize: 12.5, color: color.textMuted, marginTop: 2 },
  cancel: { marginTop: 8, paddingVertical: 14, borderRadius: radius.md, backgroundColor: color.surface, alignItems: 'center' },
  cancelText: { fontSize: 16, color: color.textMuted, fontWeight: '600' },
});
