import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, Pressable, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import type { LessonContent, LessonBlock } from '../../../types/classContent';
import { renderRichText } from './richText';
import { font, color, radius } from '../../../theme/tokens';

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
  info: { icon: 'information-circle', color: color.accent },
  tip: { icon: 'bulb', color: color.progress },
  warn: { icon: 'alert-circle', color: color.sacredBright },
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
  const { t } = useTranslation();
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaProvider style={{ flex: 1 }}><SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={8}><Ionicons name="chevron-down" size={26} color={color.text} /></Pressable>
          <Text style={styles.headerLabel}>{t('community.lesson')}</Text>
          {canEdit ? (
            <Pressable onPress={onEdit} hitSlop={8} style={styles.editBtn}>
              <Ionicons name="create-outline" size={18} color={groupColor} />
              <Text style={[styles.editText, { color: groupColor }]}>{t('community.edit')}</Text>
            </Pressable>
          ) : <View style={{ width: 40 }} />}
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={[styles.titleAccent, { backgroundColor: groupColor }]} />
          <Text style={styles.title}>{lesson.title}</Text>
          <Text style={styles.byline}>{t('community.byAuthor', { author: authorName })}</Text>

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
  container: { flex: 1, backgroundColor: color.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: color.borderSubtle },
  headerLabel: { fontSize: 13, fontWeight: '700', color: color.textFaint, textTransform: 'uppercase', letterSpacing: 1 },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  editText: { fontSize: 14, fontWeight: '600' },
  scroll: { paddingHorizontal: 22, paddingTop: 20 },
  titleAccent: { width: 44, height: 4, borderRadius: 2, marginBottom: 14 },
  title: { fontSize: 28, fontWeight: '700', color: color.text, lineHeight: 36 },
  byline: { fontSize: 13, color: color.textFaint, marginTop: 6 },
  blockWrap: { marginBottom: 14 },
  heading: { fontSize: 20, fontWeight: '700', lineHeight: 28, marginTop: 6 },
  paragraph: { fontSize: 16, color: color.text, lineHeight: 26 },
  bullets: { gap: 8 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  bulletDot: { width: 6, height: 6, borderRadius: 3, marginTop: 9 },
  bulletText: { flex: 1, fontSize: 16, color: color.text, lineHeight: 26 },
  arabicBlock: { backgroundColor: color.surface, borderRadius: radius.md, borderWidth: 1, borderColor: color.borderSubtle, padding: 16 },
  arabicText: {
    fontFamily: font.arabic, fontSize: 32, color: color.text, lineHeight: 56, textAlign: 'right', writingDirection: 'rtl' },
  arabicTranslation: { fontSize: 14, color: color.textMuted, marginTop: 10, lineHeight: 21 },
  callout: { flexDirection: 'row', gap: 10, borderWidth: 1, borderRadius: radius.md, padding: 14 },
  calloutText: { flex: 1, fontSize: 15, color: color.text, lineHeight: 23 },
  divider: { height: 1, backgroundColor: color.surface, marginVertical: 4 },
});
