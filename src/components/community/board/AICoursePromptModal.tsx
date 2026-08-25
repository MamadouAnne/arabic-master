import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, Pressable, Modal, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { CourseLevel } from '../../../types/aiBoard';
import type { CurriculumItem } from '../../../data/arabic/curriculumSource';

export type CourseGenRequest =
  | { mode: 'draft'; source: 'lesson'; lessonId: string; title: string }
  | { mode: 'draft'; source: 'topic'; topic: string; level: CourseLevel }
  | { mode: 'refine'; instruction: string };

interface Props {
  visible: boolean;
  mode: 'draft' | 'refine';
  groupColor: string;
  loading: boolean;
  curriculum: CurriculumItem[];
  onSubmit: (req: CourseGenRequest) => void;
  onClose: () => void;
}

const LEVELS: { v: CourseLevel; label: string }[] = [
  { v: 'beginner', label: 'Beginner' },
  { v: 'intermediate', label: 'Intermediate' },
  { v: 'advanced', label: 'Advanced' },
];
const REFINE_IDEAS = ['Make it simpler', 'Add more examples', 'More detail', 'Shorten it'];

export function AICoursePromptModal({ visible, mode, groupColor, loading, curriculum, onSubmit, onClose }: Props) {
  const { t } = useTranslation();
  const draft = mode === 'draft';
  const [tab, setTab] = useState<'lesson' | 'topic'>('lesson');
  const [search, setSearch] = useState('');
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState<CourseLevel>('beginner');
  const [refineText, setRefineText] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? curriculum.filter((c) => c.title.toLowerCase().includes(q)) : curriculum;
  }, [curriculum, search]);

  const canSubmit = mode === 'refine' ? !!refineText.trim() : tab === 'lesson' ? !!lessonId : !!topic.trim();

  const submit = () => {
    if (!canSubmit || loading) return;
    if (mode === 'refine') { onSubmit({ mode: 'refine', instruction: refineText.trim() }); return; }
    if (tab === 'lesson' && lessonId) {
      const item = curriculum.find((c) => c.id === lessonId)!;
      onSubmit({ mode: 'draft', source: 'lesson', lessonId, title: item.title.replace(/\s*\(vocabulary\)$/, '') });
    } else {
      onSubmit({ mode: 'draft', source: 'topic', topic: topic.trim(), level });
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={loading ? undefined : onClose}>
      <KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={StyleSheet.absoluteFill} onPress={loading ? undefined : onClose} />
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={[styles.badge, { backgroundColor: `${groupColor}22` }]}><Ionicons name="sparkles" size={16} color={groupColor} /></View>
            <Text style={styles.title}>{draft ? 'Draft a course with AI' : 'Refine with AI'}</Text>
            {!loading && <Pressable onPress={onClose} hitSlop={8}><Ionicons name="close" size={22} color="#94a3b8" /></Pressable>}
          </View>

          {mode === 'refine' ? (
            <>
              <Text style={styles.label}>{t('community.aiHowChange')}</Text>
              <TextInput style={styles.input} value={refineText} onChangeText={setRefineText} placeholder={t('community.aiChangePlaceholder')} placeholderTextColor="#64748b" autoFocus multiline editable={!loading} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
                {REFINE_IDEAS.map((idea) => (
                  <Pressable key={idea} style={styles.chip} onPress={() => setRefineText(idea)} disabled={loading}><Text style={styles.chipText}>{idea}</Text></Pressable>
                ))}
              </ScrollView>
            </>
          ) : (
            <>
              {/* Source tabs */}
              <View style={styles.tabs}>
                <Pressable style={[styles.tab, tab === 'lesson' && { backgroundColor: `${groupColor}20`, borderColor: groupColor }]} onPress={() => setTab('lesson')} disabled={loading}>
                  <Ionicons name="library" size={15} color={tab === 'lesson' ? groupColor : '#94a3b8'} />
                  <Text style={[styles.tabText, tab === 'lesson' && { color: groupColor }]}>{t('community.fromAppLesson')}</Text>
                </Pressable>
                <Pressable style={[styles.tab, tab === 'topic' && { backgroundColor: `${groupColor}20`, borderColor: groupColor }]} onPress={() => setTab('topic')} disabled={loading}>
                  <Ionicons name="bulb" size={15} color={tab === 'topic' ? groupColor : '#94a3b8'} />
                  <Text style={[styles.tabText, tab === 'topic' && { color: groupColor }]}>{t('community.customTopic')}</Text>
                </Pressable>
              </View>

              {tab === 'lesson' ? (
                <>
                  <View style={styles.searchBar}>
                    <Ionicons name="search" size={15} color="#64748b" />
                    <TextInput style={styles.searchInput} value={search} onChangeText={setSearch} placeholder={t('community.searchLessons')} placeholderTextColor="#64748b" editable={!loading} />
                  </View>
                  <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
                    {filtered.map((c) => (
                      <Pressable key={c.id} style={[styles.lessonRow, lessonId === c.id && { backgroundColor: `${groupColor}18`, borderColor: groupColor }]} onPress={() => setLessonId(c.id)} disabled={loading}>
                        <Ionicons name={c.kind === 'grammar' ? 'book' : 'language'} size={16} color={lessonId === c.id ? groupColor : '#64748b'} />
                        <Text style={styles.lessonTitle} numberOfLines={1}>{c.title}</Text>
                        <Text style={styles.lessonLevel}>{c.level}</Text>
                      </Pressable>
                    ))}
                    {filtered.length === 0 && <Text style={styles.empty}>{t('community.noLessonsMatch')}</Text>}
                  </ScrollView>
                </>
              ) : (
                <>
                  <TextInput style={styles.input} value={topic} onChangeText={setTopic} placeholder={t('community.topicPlaceholder')} placeholderTextColor="#64748b" autoFocus editable={!loading} />
                  <View style={styles.levels}>
                    {LEVELS.map((l) => (
                      <Pressable key={l.v} style={[styles.levelBtn, level === l.v && { backgroundColor: `${groupColor}25`, borderColor: groupColor }]} onPress={() => setLevel(l.v)} disabled={loading}>
                        <Text style={[styles.levelText, level === l.v && { color: groupColor }]}>{l.label}</Text>
                      </Pressable>
                    ))}
                  </View>
                </>
              )}
            </>
          )}

          <Pressable style={[styles.generateBtn, { backgroundColor: groupColor }, (!canSubmit || loading) && { opacity: 0.5 }]} onPress={submit} disabled={!canSubmit || loading}>
            {loading ? (
              <><ActivityIndicator color="#ffffff" size="small" /><Text style={styles.generateText}>{t('community.generating')}</Text></>
            ) : (
              <><Ionicons name="sparkles" size={17} color="#ffffff" /><Text style={styles.generateText}>{draft ? 'Generate course' : 'Update course'}</Text></>
            )}
          </Pressable>
          <Text style={styles.hint}>{draft && tab === 'lesson' ? 'Built from our curriculum · uses AI credits' : 'Uses AI credits · Arabic with tashkeel'}</Text>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', paddingHorizontal: 20 },
  card: { backgroundColor: '#1e293b', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#334155' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  badge: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontSize: 17, fontWeight: '800', color: '#f8fafc' },
  label: { fontSize: 13, fontWeight: '600', color: '#94a3b8', marginBottom: 8 },
  input: { backgroundColor: '#0f172a', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: '#f8fafc', borderWidth: 1, borderColor: '#334155' },
  chips: { flexDirection: 'row', gap: 8, paddingVertical: 12 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155' },
  chipText: { fontSize: 12.5, color: '#cbd5e1', fontWeight: '500' },
  tabs: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 11, backgroundColor: '#0f172a', borderWidth: 1.5, borderColor: 'transparent' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#94a3b8' },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#0f172a', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#334155', marginBottom: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#f8fafc' },
  list: { maxHeight: 240 },
  lessonRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 11, borderRadius: 10, borderWidth: 1.5, borderColor: 'transparent', backgroundColor: '#0f172a', marginBottom: 6 },
  lessonTitle: { flex: 1, fontSize: 14, color: '#e2e8f0', fontWeight: '500' },
  lessonLevel: { fontSize: 11, color: '#64748b', textTransform: 'capitalize' },
  empty: { fontSize: 13, color: '#64748b', textAlign: 'center', paddingVertical: 16 },
  levels: { flexDirection: 'row', gap: 8, marginTop: 12 },
  levelBtn: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 10, backgroundColor: '#0f172a', borderWidth: 1.5, borderColor: 'transparent' },
  levelText: { fontSize: 13, fontWeight: '600', color: '#94a3b8' },
  generateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 13, borderRadius: 13, marginTop: 16 },
  generateText: { color: '#ffffff', fontWeight: '800', fontSize: 15 },
  hint: { fontSize: 11, color: '#64748b', textAlign: 'center', marginTop: 10 },
});
