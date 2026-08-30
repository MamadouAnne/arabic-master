import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, Pressable, Modal, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { CourseLevel } from '../../../types/aiBoard';
import type { CurriculumItem } from '../../../data/arabic/curriculumSource';
import { color, radius } from '../../../theme/tokens';

export interface QuizGenRequest {
  source: 'topic' | 'chat' | 'lesson';
  topic?: string;
  lessonId?: string;
  title?: string;
  count: number;
  level: CourseLevel;
}

interface Props {
  visible: boolean;
  groupColor: string;
  hasChat: boolean;
  curriculum: CurriculumItem[];
  loading: boolean;
  onSubmit: (req: QuizGenRequest) => void;
  onClose: () => void;
}

const COUNTS = [3, 5, 8, 10];
const LEVELS: { v: CourseLevel; label: string }[] = [
  { v: 'beginner', label: 'Beginner' },
  { v: 'intermediate', label: 'Intermediate' },
  { v: 'advanced', label: 'Advanced' },
];

export function AIQuizPromptModal({ visible, groupColor, hasChat, curriculum, loading, onSubmit, onClose }: Props) {
  const { t } = useTranslation();
  const [source, setSource] = useState<'lesson' | 'chat' | 'topic'>('lesson');
  const [search, setSearch] = useState('');
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(5);
  const [level, setLevel] = useState<CourseLevel>('beginner');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? curriculum.filter((c) => c.title.toLowerCase().includes(q)) : curriculum;
  }, [curriculum, search]);

  const canSubmit = source === 'chat' ? true : source === 'lesson' ? !!lessonId : !!topic.trim();
  const submit = () => {
    if (!canSubmit || loading) return;
    if (source === 'lesson' && lessonId) {
      const item = curriculum.find((c) => c.id === lessonId)!;
      onSubmit({ source: 'lesson', lessonId, title: item.title.replace(/\s*\(vocabulary\)$/, ''), count, level });
    } else if (source === 'chat') {
      onSubmit({ source: 'chat', count, level });
    } else {
      onSubmit({ source: 'topic', topic: topic.trim(), count, level });
    }
  };

  const srcBtn = (key: 'lesson' | 'chat' | 'topic', icon: string, label: string, disabled = false) => (
    <Pressable
      style={[styles.sourceBtn, source === key && { backgroundColor: `${groupColor}20`, borderColor: groupColor }, disabled && { opacity: 0.4 }]}
      onPress={() => !disabled && setSource(key)}
      disabled={disabled || loading}
    >
      <Ionicons name={icon as any} size={15} color={source === key ? groupColor: color.textMuted} />
      <Text style={[styles.sourceText, source === key && { color: groupColor }]}>{label}</Text>
    </Pressable>
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={loading ? undefined : onClose}>
      <KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={StyleSheet.absoluteFill} onPress={loading ? undefined : onClose} />
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={[styles.badge, { backgroundColor: `${groupColor}22` }]}><Ionicons name="sparkles" size={16} color={groupColor} /></View>
            <Text style={styles.title}>{t('community.generateQuizAI')}</Text>
            {!loading && <Pressable onPress={onClose} hitSlop={8}><Ionicons name="close" size={22} color={color.textMuted} /></Pressable>}
          </View>

          {/* Source */}
          <View style={styles.sourceRow}>
            {srcBtn('lesson', 'library', 'App lesson')}
            {srcBtn('chat', 'chatbubbles', 'This chat', !hasChat)}
            {srcBtn('topic', 'bulb', 'Topic')}
          </View>

          {source === 'lesson' ? (
            <>
              <View style={styles.searchBar}>
                <Ionicons name="search" size={15} color={color.textFaint} />
                <TextInput style={styles.searchInput} value={search} onChangeText={setSearch} placeholder={t('community.searchLessons')} placeholderTextColor={color.textFaint} editable={!loading} />
              </View>
              <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
                {filtered.map((c) => (
                  <Pressable key={c.id} style={[styles.lessonRow, lessonId === c.id && { backgroundColor: `${groupColor}18`, borderColor: groupColor }]} onPress={() => setLessonId(c.id)} disabled={loading}>
                    <Ionicons name={c.kind === 'grammar' ? 'book' : 'language'} size={16} color={lessonId === c.id ? groupColor: color.textFaint} />
                    <Text style={styles.lessonTitle} numberOfLines={1}>{c.title}</Text>
                    <Text style={styles.lessonLevel}>{c.level}</Text>
                  </Pressable>
                ))}
                {filtered.length === 0 && <Text style={styles.empty}>{t('community.noLessonsMatch')}</Text>}
              </ScrollView>
            </>
          ) : source === 'chat' ? (
            <Text style={styles.chatHint}>{t('community.aiQuizFromChat')}</Text>
          ) : (
            <TextInput style={styles.input} value={topic} onChangeText={setTopic} placeholder={t('community.quizTopicPlaceholder')} placeholderTextColor={color.textFaint} autoFocus editable={!loading} />
          )}

          <Text style={styles.label}>{t('community.questions')}</Text>
          <View style={styles.pills}>
            {COUNTS.map((n) => (
              <Pressable key={n} style={[styles.pill, count === n && { backgroundColor: `${groupColor}25`, borderColor: groupColor }]} onPress={() => setCount(n)} disabled={loading}>
                <Text style={[styles.pillText, count === n && { color: groupColor }]}>{n}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>{t('community.level')}</Text>
          <View style={styles.pills}>
            {LEVELS.map((l) => (
              <Pressable key={l.v} style={[styles.levelPill, level === l.v && { backgroundColor: `${groupColor}25`, borderColor: groupColor }]} onPress={() => setLevel(l.v)} disabled={loading}>
                <Text style={[styles.pillText, level === l.v && { color: groupColor }]}>{l.label}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable style={[styles.generateBtn, { backgroundColor: groupColor }, (!canSubmit || loading) && { opacity: 0.5 }]} onPress={submit} disabled={!canSubmit || loading}>
            {loading ? (
              <><ActivityIndicator color={color.text} size="small" /><Text style={styles.generateText}>{t('community.generating')}</Text></>
            ) : (
              <><Ionicons name="sparkles" size={17} color={color.text} /><Text style={styles.generateText}>{t('community.generateQuiz')}</Text></>
            )}
          </Pressable>
          <Text style={styles.hint}>{source === 'lesson' ? 'Built from our curriculum · uses AI credits' : 'Uses AI credits · mix of question types'}</Text>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', paddingHorizontal: 20 },
  card: { backgroundColor: color.surface, borderRadius: radius.xl, padding: 18, borderWidth: 1, borderColor: color.border },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  badge: { width: 34, height: 34, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontSize: 17, fontWeight: '800', color: color.text },
  sourceRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  sourceBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 10, borderRadius: radius.md, backgroundColor: color.bg, borderWidth: 1.5, borderColor: 'transparent' },
  sourceText: { fontSize: 12.5, fontWeight: '600', color: color.textMuted },
  input: { backgroundColor: color.bg, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: color.text, borderWidth: 1, borderColor: color.border },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: color.bg, borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: color.border, marginBottom: 8 },
  searchInput: { flex: 1, fontSize: 14, color: color.text },
  list: { maxHeight: 200 },
  lessonRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 11, borderRadius: radius.sm, borderWidth: 1.5, borderColor: 'transparent', backgroundColor: color.bg, marginBottom: 6 },
  lessonTitle: { flex: 1, fontSize: 14, color: color.text, fontWeight: '500' },
  lessonLevel: { fontSize: 11, color: color.textFaint, textTransform: 'capitalize' },
  empty: { fontSize: 13, color: color.textFaint, textAlign: 'center', paddingVertical: 16 },
  chatHint: { fontSize: 13, color: color.textMuted, lineHeight: 19 },
  label: { fontSize: 12, fontWeight: '700', color: color.textFaint, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 14, marginBottom: 8 },
  pills: { flexDirection: 'row', gap: 8 },
  pill: { width: 44, alignItems: 'center', paddingVertical: 8, borderRadius: radius.sm, backgroundColor: color.bg, borderWidth: 1.5, borderColor: 'transparent' },
  levelPill: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: radius.sm, backgroundColor: color.bg, borderWidth: 1.5, borderColor: 'transparent' },
  pillText: { fontSize: 13, fontWeight: '700', color: color.textMuted },
  generateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 13, borderRadius: radius.md, marginTop: 18 },
  generateText: { color: color.text, fontWeight: '800', fontSize: 15 },
  hint: { fontSize: 11, color: color.textFaint, textAlign: 'center', marginTop: 10 },
});
