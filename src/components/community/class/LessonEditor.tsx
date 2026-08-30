import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, Modal, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import type { LessonBlock, LessonContent } from '../../../types/classContent';
import { wrapSelection, MarkerName } from './richText';
import { font, color, radius } from '../../../theme/tokens';

interface EditBlock {
  id: string;
  type: LessonBlock['type'];
  text: string;         // heading/paragraph/callout/arabic; bullets = newline-separated
  translation?: string; // arabic only
  tone?: 'info' | 'tip' | 'warn';
}

interface Props {
  visible: boolean;
  groupColor: string;
  initial?: LessonContent | null;
  onSave: (content: LessonContent) => void;
  onClose: () => void;
}

let uid = 0;
const newId = () => `b${Date.now()}_${uid++}`;

function toEditBlocks(content?: LessonContent | null): EditBlock[] {
  if (!content) return [{ id: newId(), type: 'paragraph', text: '' }];
  return content.blocks.map((b) => {
    if (b.type === 'bullets') return { id: newId(), type: 'bullets', text: b.items.join('\n') };
    if (b.type === 'arabic') return { id: newId(), type: 'arabic', text: b.text, translation: b.translation };
    if (b.type === 'callout') return { id: newId(), type: 'callout', text: b.text, tone: b.tone };
    if (b.type === 'divider') return { id: newId(), type: 'divider', text: '' };
    return { id: newId(), type: b.type, text: (b as any).text || '' };
  });
}

const BLOCK_MENU: { type: LessonBlock['type']; icon: string; label: string }[] = [
  { type: 'heading', icon: 'text', label: 'Heading' },
  { type: 'paragraph', icon: 'reorder-four', label: 'Text' },
  { type: 'bullets', icon: 'list', label: 'List' },
  { type: 'arabic', icon: 'language', label: 'Arabic' },
  { type: 'callout', icon: 'bulb', label: 'Callout' },
  { type: 'divider', icon: 'remove', label: 'Divider' },
];

export function LessonEditor({ visible, groupColor, initial, onSave, onClose }: Props) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(initial?.title || '');
  const [blocks, setBlocks] = useState<EditBlock[]>(toEditBlocks(initial));
  const focusRef = useRef<{ index: number; sel: { start: number; end: number } } | null>(null);

  const updateBlock = (i: number, patch: Partial<EditBlock>) =>
    setBlocks((prev) => prev.map((b, idx) => (idx === i ? { ...b, ...patch } : b)));

  const addBlock = (type: LessonBlock['type']) =>
    setBlocks((prev) => [...prev, { id: newId(), type, text: '', tone: type === 'callout' ? 'info' : undefined }]);

  const removeBlock = (i: number) => setBlocks((prev) => prev.filter((_, idx) => idx !== i));

  const moveBlock = (i: number, dir: -1 | 1) =>
    setBlocks((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const applyFormat = (marker: MarkerName) => {
    const f = focusRef.current;
    if (!f) return;
    const b = blocks[f.index];
    if (!b || b.type === 'divider') return;
    const res = wrapSelection(b.text, f.sel, marker);
    updateBlock(f.index, { text: res.text });
  };

  const handleSave = () => {
    if (!title.trim()) { Alert.alert('Add a title', 'Give your lesson a title.'); return; }
    const outBlocks: LessonBlock[] = [];
    for (const b of blocks) {
      if (b.type === 'divider') { outBlocks.push({ type: 'divider' }); continue; }
      if (b.type === 'bullets') {
        const items = b.text.split('\n').map((s) => s.trim()).filter(Boolean);
        if (items.length) outBlocks.push({ type: 'bullets', items });
        continue;
      }
      if (!b.text.trim()) continue;
      if (b.type === 'arabic') outBlocks.push({ type: 'arabic', text: b.text.trim(), translation: b.translation?.trim() || undefined });
      else if (b.type === 'callout') outBlocks.push({ type: 'callout', text: b.text.trim(), tone: b.tone });
      else outBlocks.push({ type: b.type as 'heading' | 'paragraph', text: b.text.trim() });
    }
    if (outBlocks.length === 0) { Alert.alert('Add content', 'Add at least one block.'); return; }
    onSave({ kind: 'lesson', title: title.trim(), blocks: outBlocks });
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaProvider style={{ flex: 1 }}><SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={8}><Ionicons name="close" size={24} color={color.text} /></Pressable>
          <Text style={styles.headerTitle}>{initial ? 'Edit lesson' : 'New lesson'}</Text>
          <Pressable onPress={handleSave} style={[styles.saveBtn, { backgroundColor: groupColor }]}>
            <Text style={styles.saveText}>{initial ? 'Update' : 'Post'}</Text>
          </Pressable>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex} keyboardVerticalOffset={0}>
          <ScrollView style={styles.flex} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <TextInput
              style={styles.titleInput}
              placeholder={t('community.lessonTitlePlaceholder')}
              placeholderTextColor={color.textFaint}
              value={title}
              onChangeText={setTitle}
              multiline
            />

            {blocks.map((b, i) => (
              <View key={b.id} style={styles.block}>
                <View style={styles.blockBar}>
                  <Text style={[styles.blockType, { color: groupColor }]}>{b.type}</Text>
                  <View style={{ flex: 1 }} />
                  <Pressable onPress={() => moveBlock(i, -1)} hitSlop={6}><Ionicons name="chevron-up" size={16} color={color.textFaint} /></Pressable>
                  <Pressable onPress={() => moveBlock(i, 1)} hitSlop={6}><Ionicons name="chevron-down" size={16} color={color.textFaint} /></Pressable>
                  <Pressable onPress={() => removeBlock(i)} hitSlop={6}><Ionicons name="trash-outline" size={16} color={color.danger} /></Pressable>
                </View>

                {b.type === 'divider' ? (
                  <View style={styles.dividerPreview} />
                ) : (
                  <>
                    <TextInput
                      style={[
                        styles.blockInput,
                        b.type === 'heading' && styles.headingInput,
                        b.type === 'arabic' && styles.arabicInput,
                        b.type === 'callout' && styles.calloutInput,
                      ]}
                      placeholder={
                        b.type === 'heading' ? 'Section heading' :
                        b.type === 'bullets' ? 'One item per line' :
                        b.type === 'arabic' ? 'النص العربي' :
                        b.type === 'callout' ? 'Callout / tip' : 'Write here…'
                      }
                      placeholderTextColor={color.textFaint}
                      value={b.text}
                      onChangeText={(t) => updateBlock(i, { text: t })}
                      onFocus={() => { focusRef.current = { index: i, sel: { start: b.text.length, end: b.text.length } }; }}
                      onSelectionChange={(e) => { focusRef.current = { index: i, sel: e.nativeEvent.selection }; }}
                      multiline
                    />
                    {b.type === 'arabic' && (
                      <TextInput
                        style={styles.translationInput}
                        placeholder={t('community.translationOptionalPlaceholder')}
                        placeholderTextColor={color.textFaint}
                        value={b.translation || ''}
                        onChangeText={(t) => updateBlock(i, { translation: t })}
                        multiline
                      />
                    )}
                    {b.type === 'callout' && (
                      <View style={styles.toneRow}>
                        {(['info', 'tip', 'warn'] as const).map((tone) => (
                          <Pressable key={tone} onPress={() => updateBlock(i, { tone })} style={[styles.tonePill, b.tone === tone && { backgroundColor: `${groupColor}30` }]}>
                            <Text style={[styles.toneText, b.tone === tone && { color: groupColor }]}>{tone}</Text>
                          </Pressable>
                        ))}
                      </View>
                    )}
                  </>
                )}
              </View>
            ))}

            {/* Add block menu */}
            <Text style={styles.addLabel}>{t('community.addBlock')}</Text>
            <View style={styles.addRow}>
              {BLOCK_MENU.map((m) => (
                <Pressable key={m.type} style={styles.addBtn} onPress={() => addBlock(m.type)}>
                  <Ionicons name={m.icon as any} size={18} color={color.textMuted} />
                  <Text style={styles.addBtnText}>{m.label}</Text>
                </Pressable>
              ))}
            </View>
            <View style={{ height: 20 }} />
          </ScrollView>

          {/* Formatting toolbar (applies to the focused block) */}
          <View style={styles.formatBar}>
            <Text style={styles.formatHint}>{t('community.formatSelection')}</Text>
            {([['bold', 'B'], ['italic', 'I'], ['underline', 'U'], ['highlight', 'H']] as [MarkerName, string][]).map(([m, lbl]) => (
              <Pressable key={m} style={styles.formatBtn} onPress={() => applyFormat(m)}>
                <Text style={[
                  styles.formatBtnText,
                  m === 'bold' && { fontWeight: '900' },
                  m === 'italic' && { fontStyle: 'italic' },
                  m === 'underline' && { textDecorationLine: 'underline' },
                  m === 'highlight' && { backgroundColor: 'rgba(250,204,21,0.3)', color: '#fde68a', paddingHorizontal: 4, borderRadius: 3 },
                ]}>{lbl}</Text>
              </Pressable>
            ))}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView></SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: color.bg },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: color.borderSubtle },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: color.text },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.md },
  saveText: { color: color.text, fontWeight: '700', fontSize: 14 },
  scroll: { padding: 16 },
  titleInput: { fontSize: 24, fontWeight: '800', color: color.text, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: color.borderSubtle, marginBottom: 16 },
  block: { backgroundColor: color.surface, borderRadius: radius.md, borderWidth: 1, borderColor: color.borderSubtle, padding: 10, marginBottom: 12 },
  blockBar: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 6 },
  blockType: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  blockInput: { fontSize: 15, color: color.text, lineHeight: 22, minHeight: 24, padding: 0 },
  headingInput: { fontSize: 19, fontWeight: '700', color: color.text },
  arabicInput: {
    fontFamily: font.arabic, fontSize: 22, lineHeight: 38, color: color.text, textAlign: 'right', writingDirection: 'rtl' },
  calloutInput: { fontSize: 15, color: color.text, fontStyle: 'italic' },
  translationInput: { fontSize: 13, color: color.textMuted, marginTop: 6, padding: 0 },
  dividerPreview: { height: 2, backgroundColor: color.surfaceRaised, borderRadius: 1, marginVertical: 8 },
  toneRow: { flexDirection: 'row', gap: 6, marginTop: 8 },
  tonePill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.sm, backgroundColor: color.surface },
  toneText: { fontSize: 11, fontWeight: '600', color: color.textFaint, textTransform: 'capitalize' },
  addLabel: { fontSize: 12, fontWeight: '700', color: color.textFaint, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4, marginBottom: 8 },
  addRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.sm, backgroundColor: color.surface, borderWidth: 1, borderColor: color.border },
  addBtnText: { fontSize: 13, color: color.textMuted, fontWeight: '600' },
  formatBar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 8, borderTopWidth: 1, borderTopColor: color.borderSubtle, backgroundColor: color.surface },
  formatHint: { fontSize: 12, color: color.textFaint, marginRight: 4 },
  formatBtn: { width: 34, height: 34, borderRadius: radius.sm, backgroundColor: color.surface, alignItems: 'center', justifyContent: 'center' },
  formatBtnText: { fontSize: 15, color: color.text, fontWeight: '700' },
});
