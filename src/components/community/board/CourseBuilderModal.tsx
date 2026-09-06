import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, Modal, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import type { CourseSpec, CourseSection } from '../../../types/aiBoard';
import { font, color, radius } from '../../../theme/tokens';

interface EditSection {
  id: string;
  heading: string;
  points: string[];
  arabic: string;
  translit: string;
  translation: string;
}

interface Props {
  visible: boolean;
  groupColor: string;
  initial?: CourseSpec | null;
  onSave: (spec: CourseSpec) => void;
  onClose: () => void;
}

let sid = 0;
const newId = () => `s${Date.now()}_${sid++}`;

function toEdit(initial?: CourseSpec | null): EditSection[] {
  if (!initial?.sections?.length) return [{ id: newId(), heading: '', points: [''], arabic: '', translit: '', translation: '' }];
  return initial.sections.map((s) => ({
    id: newId(),
    heading: s.heading || '',
    points: s.points?.length ? [...s.points] : [''],
    arabic: s.arabic || '',
    translit: s.translit || '',
    translation: s.translation || '',
  }));
}

export function CourseBuilderModal({ visible, groupColor, initial, onSave, onClose }: Props) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(initial?.title || '');
  const [subtitle, setSubtitle] = useState(initial?.subtitle || '');
  const [summary, setSummary] = useState(initial?.summary || '');
  const [sections, setSections] = useState<EditSection[]>(toEdit(initial));

  const patch = (i: number, p: Partial<EditSection>) => setSections((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...p } : s)));
  const setPoint = (si: number, pi: number, v: string) => setSections((prev) => prev.map((s, idx) => idx === si ? { ...s, points: s.points.map((p, k) => (k === pi ? v : p)) } : s));
  const addPoint = (si: number) => setSections((prev) => prev.map((s, idx) => idx === si && s.points.length < 4 ? { ...s, points: [...s.points, ''] } : s));
  const removePoint = (si: number, pi: number) => setSections((prev) => prev.map((s, idx) => idx === si ? { ...s, points: s.points.filter((_, k) => k !== pi) } : s));
  const addSection = () => setSections((prev) => [...prev, { id: newId(), heading: '', points: [''], arabic: '', translit: '', translation: '' }]);
  const removeSection = (i: number) => setSections((prev) => prev.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => setSections((prev) => {
    const j = i + dir; if (j < 0 || j >= prev.length) return prev;
    const n = [...prev]; [n[i], n[j]] = [n[j], n[i]]; return n;
  });

  const apply = () => {
    if (!title.trim()) { Alert.alert('Add a title', 'Give your course a title.'); return; }
    const outSections: CourseSection[] = [];
    for (const s of sections) {
      const points = s.points.map((p) => p.trim()).filter(Boolean);
      const heading = s.heading.trim();
      const arabic = s.arabic.trim();
      if (!heading && !arabic && !points.length) continue;
      outSections.push({
        heading,
        points,
        arabic: arabic || undefined,
        translit: s.translit.trim() || undefined,
        translation: s.translation.trim() || undefined,
      });
    }
    if (!outSections.length) { Alert.alert('Add a section', 'Add at least one section with content.'); return; }
    onSave({ title: title.trim(), subtitle: subtitle.trim() || undefined, sections: outSections, summary: summary.trim() || undefined });
  };

  const inputProps = { placeholderTextColor: color.textFaint };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaProvider style={{ flex: 1 }}>
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.header}>
            <Pressable onPress={onClose} hitSlop={8}><Ionicons name="close" size={24} color={color.text} /></Pressable>
            <Text style={styles.headerTitle}>{t('community.courseContent')}</Text>
            <Pressable onPress={apply} style={[styles.applyBtn, { backgroundColor: groupColor }]}>
              <Text style={styles.applyText}>{t('community.apply')}</Text>
            </Pressable>
          </View>

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
              {/* Title */}
              <TextInput style={styles.titleInput} value={title} onChangeText={setTitle} placeholder={t('community.courseTitlePlaceholder')} {...inputProps} multiline />
              <TextInput style={styles.subtitleInput} value={subtitle} onChangeText={setSubtitle} placeholder={t('community.subtitlePlaceholder')} {...inputProps} />

              {sections.map((s, i) => (
                <View key={s.id} style={styles.card}>
                  <View style={styles.cardBar}>
                    <View style={[styles.badge, { backgroundColor: groupColor }]}><Text style={styles.badgeText}>{i + 1}</Text></View>
                    <Text style={styles.cardLabel}>{t('community.section')}</Text>
                    <View style={{ flex: 1 }} />
                    <Pressable onPress={() => move(i, -1)} hitSlop={6}><Ionicons name="chevron-up" size={18} color={color.textFaint} /></Pressable>
                    <Pressable onPress={() => move(i, 1)} hitSlop={6}><Ionicons name="chevron-down" size={18} color={color.textFaint} /></Pressable>
                    {sections.length > 1 && <Pressable onPress={() => removeSection(i)} hitSlop={6}><Ionicons name="trash-outline" size={17} color={color.danger} /></Pressable>}
                  </View>

                  <TextInput style={styles.headingInput} value={s.heading} onChangeText={(t) => patch(i, { heading: t })} placeholder={t('community.sectionHeadingPlaceholder')} {...inputProps} />

                  <Text style={styles.miniLabel}>{t('community.points')}</Text>
                  {s.points.map((p, pi) => (
                    <View key={pi} style={styles.pointRow}>
                      <View style={styles.dot} />
                      <TextInput style={styles.pointInput} value={p} onChangeText={(t) => setPoint(i, pi, t)} placeholder={`Point ${pi + 1}`} {...inputProps} multiline />
                      {s.points.length > 1 && <Pressable onPress={() => removePoint(i, pi)} hitSlop={6}><Ionicons name="close" size={16} color={color.textFaint} /></Pressable>}
                    </View>
                  ))}
                  {s.points.length < 4 && (
                    <Pressable style={styles.addRow} onPress={() => addPoint(i)}><Ionicons name="add" size={15} color={groupColor} /><Text style={[styles.addRowText, { color: groupColor }]}>{t('community.addPoint')}</Text></Pressable>
                  )}

                  <Text style={styles.miniLabel}>{t('community.arabicExampleOptional')}</Text>
                  <TextInput style={styles.arabicInput} value={s.arabic} onChangeText={(t) => patch(i, { arabic: t })} placeholder="النص العربي مع الحركات" {...inputProps} />
                  <TextInput style={styles.smallInput} value={s.translit} onChangeText={(t) => patch(i, { translit: t })} placeholder={t('community.transliterationPlaceholder')} {...inputProps} />
                  <TextInput style={styles.smallInput} value={s.translation} onChangeText={(t) => patch(i, { translation: t })} placeholder={t('community.translationPlaceholder')} {...inputProps} />
                </View>
              ))}

              <Pressable style={styles.addSection} onPress={addSection}>
                <Ionicons name="add-circle" size={20} color={groupColor} />
                <Text style={[styles.addSectionText, { color: groupColor }]}>{t('community.addSection')}</Text>
              </Pressable>

              <Text style={styles.blockLabel}>{t('community.summary')}</Text>
              <TextInput style={styles.summaryInput} value={summary} onChangeText={setSummary} placeholder={t('community.summaryPlaceholder')} {...inputProps} multiline />
              <View style={{ height: 40 }} />
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: color.bg },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: color.borderSubtle },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: color.text },
  applyBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.md },
  applyText: { color: color.text, fontWeight: '700', fontSize: 14 },
  scroll: { padding: 16 },
  titleInput: { fontSize: 24, fontWeight: '800', color: color.text, paddingBottom: 6 },
  subtitleInput: { fontSize: 15, color: color.textMuted, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: color.borderSubtle, marginBottom: 16 },
  card: { backgroundColor: color.surface, borderRadius: radius.md, borderWidth: 1, borderColor: color.borderSubtle, padding: 12, marginBottom: 14 },
  cardBar: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  badge: { width: 24, height: 24, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: color.text, fontWeight: '800', fontSize: 12 },
  cardLabel: { fontSize: 12, fontWeight: '700', color: color.textFaint, textTransform: 'uppercase', letterSpacing: 0.5 },
  headingInput: { fontSize: 17, fontWeight: '700', color: color.text, backgroundColor: color.bg, borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: color.border },
  miniLabel: { fontSize: 11, fontWeight: '700', color: color.textFaint, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 12, marginBottom: 6 },
  pointRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: color.textFaint },
  pointInput: { flex: 1, fontSize: 14.5, color: color.text, backgroundColor: color.bg, borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: color.border },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, marginLeft: 13 },
  addRowText: { fontSize: 13, fontWeight: '600' },
  arabicInput: {
    fontFamily: font.arabic,
    lineHeight: 40, fontSize: 24, color: color.text, textAlign: 'right', writingDirection: 'rtl', backgroundColor: color.bg, borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: color.border, marginBottom: 6 },
  smallInput: { fontSize: 14, color: color.textMuted, backgroundColor: color.bg, borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: color.border, marginBottom: 6 },
  addSection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: radius.md, borderWidth: 1, borderColor: color.border, borderStyle: 'dashed', marginBottom: 18 },
  addSectionText: { fontSize: 14, fontWeight: '700' },
  blockLabel: { fontSize: 12, fontWeight: '700', color: color.textFaint, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  summaryInput: { fontSize: 15, color: color.text, backgroundColor: color.surface, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: color.border, minHeight: 60 },
});
