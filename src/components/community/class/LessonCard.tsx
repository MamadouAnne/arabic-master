import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { LessonContent } from '../../../types/classContent';
import { LessonViewer } from './LessonViewer';
import { color, radius } from '../../../theme/tokens';

interface Props {
  lesson: LessonContent;
  groupColor: string;
  authorName: string;
  canEdit: boolean;
  onEdit?: () => void;
}

export const LessonCard = React.memo(function LessonCard({ lesson, groupColor, authorName, canEdit, onEdit }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const firstText = lesson.blocks.find((b) => b.type === 'paragraph' || b.type === 'heading') as any;
  const snippet = firstText?.text?.replace(/\*\*|==|__|\*/g, '') || '';
  const sections = lesson.blocks.filter((b) => b.type === 'heading').length;

  return (
    <>
      <Pressable style={styles.card} onPress={() => setOpen(true)}>
        <View style={[styles.band, { backgroundColor: `${groupColor}18` }]}>
          <View style={[styles.badge, { backgroundColor: groupColor }]}>
            <Ionicons name="book" size={13} color={color.text} />
            <Text style={styles.badgeText}>{t('community.badgeLesson')}</Text>
          </View>
          <Text style={styles.byline} numberOfLines={1}>{authorName}</Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={2}>{lesson.title}</Text>
          {snippet ? <Text style={styles.snippet} numberOfLines={2}>{snippet}</Text> : null}

          <View style={styles.footer}>
            <View style={styles.meta}>
              <Ionicons name="documents-outline" size={13} color={color.textMuted} />
              <Text style={styles.metaText}>
                {lesson.blocks.length} blocks{sections ? ` · ${sections} sections` : ''}
              </Text>
            </View>
            <View style={[styles.openBtn, { backgroundColor: groupColor }]}>
              <Text style={styles.openText}>{t('community.openLesson')}</Text>
              <Ionicons name="arrow-forward" size={13} color={color.text} />
            </View>
          </View>
        </View>
      </Pressable>

      {open && (
        <LessonViewer
          visible={open}
          lesson={lesson}
          groupColor={groupColor}
          authorName={authorName}
          canEdit={canEdit}
          onEdit={() => { setOpen(false); onEdit?.(); }}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
});

const styles = StyleSheet.create({
  card: { width: '100%', backgroundColor: color.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: color.border, overflow: 'hidden' },
  band: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 8 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.sm },
  badgeText: { fontSize: 10, fontWeight: '800', color: color.text, letterSpacing: 0.6 },
  byline: { fontSize: 12, color: color.textMuted, maxWidth: 130 },
  body: { padding: 14 },
  title: { fontSize: 18, fontWeight: '800', color: color.text, lineHeight: 24 },
  snippet: { fontSize: 14, color: color.textMuted, marginTop: 6, lineHeight: 20 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 12, color: color.textMuted },
  openBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.md },
  openText: { fontSize: 13, fontWeight: '700', color: color.text },
});
