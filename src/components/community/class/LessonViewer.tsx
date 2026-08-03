import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import type { LessonContent, LessonBlock } from '../../../types/classContent';
import { renderRichText } from './richText';

interface Props {
  visible: boolean;
  lesson: LessonContent;
  groupColor: string;
  authorName: string;
  canEdit: boolean;
  onEdit?: () => void;
  onClose: () => void;
}

const CALLOUT_META = {
  info: { icon: 'information-circle', color: '#38bdf8' },
  tip: { icon: 'bulb', color: '#34d399' },
  warn: { icon: 'alert-circle', color: '#fbbf24' },
} as const;

function Block({ block, groupColor }: { block: LessonBlock; groupColor: string }) {
  switch (block.type) {
    case 'heading':
      return <Text style={[styles.heading, { color: groupColor }]}>{renderRichText(block.text)}</Text>;
    case 'paragraph':
      return <Text style={styles.paragraph}>{renderRichText(block.text)}</Text>;
    case 'bullets':
      return (
        <View style={styles.bullets}>
          {block.items.map((it, i) => (
            <View key={i} style={styles.bulletRow}>
              <View style={[styles.bulletDot, { backgroundColor: groupColor }]} />
              <Text style={styles.bulletText}>{renderRichText(it)}</Text>
            </View>
          ))}
        </View>
      );
    case 'arabic':
      return (
        <View style={styles.arabicBlock}>
          <Text style={styles.arabicText}>{block.text}</Text>
          {block.translation ? <Text style={styles.arabicTranslation}>{block.translation}</Text> : null}
        </View>
      );
    case 'callout': {
      const meta = CALLOUT_META[block.tone || 'info'];
      return (
        <View style={[styles.callout, { borderColor: `${meta.color}55`, backgroundColor: `${meta.color}14` }]}>
          <Ionicons name={meta.icon as any} size={18} color={meta.color} style={{ marginTop: 1 }} />
          <Text style={styles.calloutText}>{renderRichText(block.text)}</Text>
        </View>
      );
    }
    case 'divider':
      return <View style={styles.divider} />;
    default:
      return null;
  }
}

export function LessonViewer({ visible, lesson, groupColor, authorName, canEdit, onEdit, onClose }: Props) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaProvider style={{ flex: 1 }}><SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={8}><Ionicons name="chevron-down" size={26} color="#e2e8f0" /></Pressable>
          <Text style={styles.headerLabel}>Lesson</Text>
          {canEdit ? (
            <Pressable onPress={onEdit} hitSlop={8} style={styles.editBtn}>
              <Ionicons name="create-outline" size={18} color={groupColor} />
              <Text style={[styles.editText, { color: groupColor }]}>Edit</Text>
            </Pressable>
          ) : <View style={{ width: 40 }} />}
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={[styles.titleAccent, { backgroundColor: groupColor }]} />
          <Text style={styles.title}>{lesson.title}</Text>
          <Text style={styles.byline}>by {authorName}</Text>

          <View style={{ height: 12 }} />
          {lesson.blocks.map((b, i) => (
            <View key={i} style={styles.blockWrap}>
              <Block block={b} groupColor={groupColor} />
            </View>
          ))}
          <View style={{ height: 60 }} />
        </ScrollView>
      </SafeAreaView></SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  headerLabel: { fontSize: 13, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  editText: { fontSize: 14, fontWeight: '600' },
  scroll: { paddingHorizontal: 22, paddingTop: 20 },
  titleAccent: { width: 44, height: 4, borderRadius: 2, marginBottom: 14 },
  title: { fontSize: 28, fontWeight: '800', color: '#f8fafc', lineHeight: 36 },
  byline: { fontSize: 13, color: '#64748b', marginTop: 6 },
  blockWrap: { marginBottom: 14 },
  heading: { fontSize: 20, fontWeight: '800', lineHeight: 28, marginTop: 6 },
  paragraph: { fontSize: 16, color: '#e2e8f0', lineHeight: 26 },
  bullets: { gap: 8 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  bulletDot: { width: 6, height: 6, borderRadius: 3, marginTop: 9 },
  bulletText: { flex: 1, fontSize: 16, color: '#e2e8f0', lineHeight: 26 },
  arabicBlock: { backgroundColor: '#131c2e', borderRadius: 14, borderWidth: 1, borderColor: '#1e293b', padding: 16 },
  arabicText: { fontSize: 26, color: '#f8fafc', lineHeight: 46, textAlign: 'right', writingDirection: 'rtl' },
  arabicTranslation: { fontSize: 14, color: '#94a3b8', marginTop: 10, lineHeight: 21 },
  callout: { flexDirection: 'row', gap: 10, borderWidth: 1, borderRadius: 14, padding: 14 },
  calloutText: { flex: 1, fontSize: 15, color: '#e2e8f0', lineHeight: 23 },
  divider: { height: 1, backgroundColor: '#1e293b', marginVertical: 4 },
});
