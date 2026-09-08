import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, Modal, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import type { QuizContent, QuizQuestion } from '../../../types/classContent';
import { AIQuizPromptModal, QuizGenRequest } from './AIQuizPromptModal';
import { generateQuiz } from '../../../services/aiQuizService';
import { listCurriculum, getCurriculumDigest } from '../../../data/arabic/curriculumSource';
import { useSettingsStore } from '../../../stores/settingsStore';
import { color, radius } from '../../../theme/tokens';

interface Props {
  visible: boolean;
  groupColor: string;
  initial?: QuizContent | null;
  chatContext?: string;   // recent chat text, enables "generate from chat"
  onSave: (content: QuizContent) => void;
  onClose: () => void;
}

let qid = 0;
const newQid = () => `q${Date.now()}_${qid++}`;

function blankQuestion(type: QuizQuestion['type']): QuizQuestion {
  return type === 'multiple_choice'
    ? { id: newQid(), type, prompt: '', options: ['', ''], correctIndex: 0, explanation: '' }
    : { id: newQid(), type, prompt: '', correctText: '', explanation: '' };
}

export function QuizEditor({ visible, groupColor, initial, chatContext, onSave, onClose }: Props) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(initial?.title || '');
  const [questions, setQuestions] = useState<QuizQuestion[]>(initial?.questions?.length ? initial.questions : [blankQuestion('multiple_choice')]);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const language = useSettingsStore((s) => s.language);
  const curriculum = useMemo(() => listCurriculum(language), [language]);
  const isEmpty = questions.length === 1 && !questions[0].prompt.trim() && !title.trim();

  const handleAiGenerate = async (req: QuizGenRequest) => {
    setAiLoading(true);
    try {
      const quiz = await generateQuiz({
        topic: req.source === 'lesson' ? req.title : req.topic,
        chatContext: req.source === 'chat' ? chatContext : undefined,
        sourceMaterial: req.source === 'lesson' && req.lessonId ? getCurriculumDigest(req.lessonId, language) : undefined,
        count: req.count,
        level: req.level,
        language,
        model: 'sonnet',
      });
      setTitle((t) => t || quiz.title);
      setQuestions((prev) => {
        const existing = prev.filter((q) => q.prompt.trim());
        return [...existing, ...quiz.questions];
      });
      setAiOpen(false);
    } catch (e: any) {
      const msg = e?.message === 'no_credits' ? 'You are out of AI credits.'
        : e?.message === 'auth_required' ? 'Please sign in to use AI.'
        : e?.message === 'rate_limit' ? 'Too many requests — try again shortly.'
        : e?.message === 'bad_response' ? 'The AI response could not be read. Try again or rephrase.'
        : 'Could not generate the quiz. Please try again.';
      Alert.alert('AI quiz', msg);
    } finally {
      setAiLoading(false);
    }
  };

  const patch = (i: number, p: Partial<QuizQuestion>) =>
    setQuestions((prev) => prev.map((q, idx) => (idx === i ? { ...q, ...p } : q)));

  const setOption = (qi: number, oi: number, val: string) =>
    setQuestions((prev) => prev.map((q, idx) => idx === qi ? { ...q, options: (q.options || []).map((o, k) => k === oi ? val : o) } : q));

  const addOption = (qi: number) =>
    setQuestions((prev) => prev.map((q, idx) => idx === qi && (q.options || []).length < 6 ? { ...q, options: [...(q.options || []), ''] } : q));

  const removeOption = (qi: number, oi: number) =>
    setQuestions((prev) => prev.map((q, idx) => {
      if (idx !== qi) return q;
      const options = (q.options || []).filter((_, k) => k !== oi);
      let correctIndex = q.correctIndex || 0;
      if (correctIndex >= options.length) correctIndex = options.length - 1;
      return { ...q, options, correctIndex };
    }));

  const handleSave = () => {
    if (!title.trim()) { Alert.alert('Add a title', 'Give your quiz a title.'); return; }
    const cleaned: QuizQuestion[] = [];
    for (const q of questions) {
      if (!q.prompt.trim()) continue;
      if (q.type === 'multiple_choice') {
        const options = (q.options || []).map((o) => o.trim()).filter(Boolean);
        if (options.length < 2) { Alert.alert('Question needs options', `"${q.prompt.slice(0, 30)}" needs at least 2 options.`); return; }
        cleaned.push({ ...q, prompt: q.prompt.trim(), options, correctIndex: Math.min(q.correctIndex || 0, options.length - 1), explanation: q.explanation?.trim() || undefined });
      } else {
        if (!q.correctText?.trim()) { Alert.alert('Missing answer', `"${q.prompt.slice(0, 30)}" needs an answer.`); return; }
        cleaned.push({ ...q, prompt: q.prompt.trim(), correctText: q.correctText.trim(), explanation: q.explanation?.trim() || undefined });
      }
    }
    if (cleaned.length === 0) { Alert.alert('Add a question', 'Add at least one question.'); return; }
    onSave({ kind: 'quiz', title: title.trim(), questions: cleaned, passingScore: 70 });
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaProvider style={{ flex: 1 }}><SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={8}><Ionicons name="close" size={24} color={color.text} /></Pressable>
          <Text style={styles.headerTitle}>{initial ? 'Edit quiz' : 'New quiz'}</Text>
          <Pressable onPress={() => setAiOpen(true)} style={styles.aiBtn} hitSlop={6}>
            <Ionicons name="sparkles" size={18} color={groupColor} />
            <Text style={[styles.aiBtnText, { color: groupColor }]}>{t('community.ai')}</Text>
          </Pressable>
          <Pressable onPress={handleSave} style={[styles.saveBtn, { backgroundColor: groupColor }]}>
            <Text style={styles.saveText}>{initial ? 'Update' : 'Post'}</Text>
          </Pressable>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            {isEmpty && (
              <Pressable style={[styles.aiCta, { borderColor: `${groupColor}66` }]} onPress={() => setAiOpen(true)}>
                <Ionicons name="sparkles" size={18} color={groupColor} />
                <Text style={[styles.aiCtaText, { color: groupColor }]}>{t('community.generateQuizAI')}</Text>
                <Text style={styles.aiCtaSub}>{t('community.fromChatOrTopic')}</Text>
              </Pressable>
            )}
            <TextInput style={styles.titleInput} placeholder={t('community.quizTitlePlaceholder')} placeholderTextColor={color.textFaint} value={title} onChangeText={setTitle} multiline />

            {questions.map((q, qi) => (
              <View key={q.id} style={styles.qCard}>
                <View style={styles.qBar}>
                  <Text style={[styles.qNum, { color: groupColor }]}>{t('community.qNum', { num: qi + 1 })}</Text>
                  <View style={styles.qTypeToggle}>
                    <Pressable onPress={() => patch(qi, blankQuestion('multiple_choice'))} style={[styles.qTypeBtn, q.type === 'multiple_choice' && { backgroundColor: `${groupColor}30` }]}>
                      <Text style={[styles.qTypeText, q.type === 'multiple_choice' && { color: groupColor }]}>{t('community.choice')}</Text>
                    </Pressable>
                    <Pressable onPress={() => patch(qi, blankQuestion('fill_blank'))} style={[styles.qTypeBtn, q.type === 'fill_blank' && { backgroundColor: `${groupColor}30` }]}>
                      <Text style={[styles.qTypeText, q.type === 'fill_blank' && { color: groupColor }]}>{t('community.fillBlank')}</Text>
                    </Pressable>
                  </View>
                  {questions.length > 1 && (
                    <Pressable onPress={() => setQuestions((prev) => prev.filter((_, k) => k !== qi))} hitSlop={6}>
                      <Ionicons name="trash-outline" size={16} color={color.danger} />
                    </Pressable>
                  )}
                </View>

                <TextInput style={styles.promptInput} placeholder={t('community.questionPlaceholder')} placeholderTextColor={color.textFaint} value={q.prompt} onChangeText={(t) => patch(qi, { prompt: t })} multiline />

                {q.type === 'multiple_choice' ? (
                  <View style={styles.options}>
                    {(q.options || []).map((opt, oi) => (
                      <View key={oi} style={styles.optRow}>
                        <Pressable onPress={() => patch(qi, { correctIndex: oi })} hitSlop={6}>
                          <Ionicons name={q.correctIndex === oi ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={q.correctIndex === oi ? color.progress : color.borderStrong} />
                        </Pressable>
                        <TextInput style={styles.optInput} placeholder={`Option ${oi + 1}`} placeholderTextColor={color.textFaint} value={opt} onChangeText={(t) => setOption(qi, oi, t)} />
                        {(q.options || []).length > 2 && (
                          <Pressable onPress={() => removeOption(qi, oi)} hitSlop={6}><Ionicons name="close" size={18} color={color.textFaint} /></Pressable>
                        )}
                      </View>
                    ))}
                    {(q.options || []).length < 6 && (
                      <Pressable onPress={() => addOption(qi)} style={styles.addOpt}>
                        <Ionicons name="add" size={16} color={groupColor} />
                        <Text style={[styles.addOptText, { color: groupColor }]}>{t('community.addOption')}</Text>
                      </Pressable>
                    )}
                    <Text style={styles.hintText}>{t('community.markCorrectHint')}</Text>
                  </View>
                ) : (
                  <TextInput style={styles.answerInput} placeholder={t('community.correctAnswerPlaceholder')} placeholderTextColor={color.textFaint} value={q.correctText || ''} onChangeText={(t) => patch(qi, { correctText: t })} />
                )}

                <TextInput style={styles.explInput} placeholder={t('community.explanationPlaceholder')} placeholderTextColor={color.textFaint} value={q.explanation || ''} onChangeText={(t) => patch(qi, { explanation: t })} multiline />
              </View>
            ))}

            <Pressable style={styles.addQ} onPress={() => setQuestions((prev) => [...prev, blankQuestion('multiple_choice')])}>
              <Ionicons name="add-circle" size={20} color={groupColor} />
              <Text style={[styles.addQText, { color: groupColor }]}>{t('community.addQuestion')}</Text>
            </Pressable>
            <View style={{ height: 30 }} />
          </ScrollView>
        </KeyboardAvoidingView>

        {aiOpen && (
          <AIQuizPromptModal
            visible
            groupColor={groupColor}
            hasChat={!!chatContext && chatContext.trim().length > 0}
            curriculum={curriculum}
            loading={aiLoading}
            onSubmit={handleAiGenerate}
            onClose={() => { if (!aiLoading) setAiOpen(false); }}
          />
        )}
      </SafeAreaView></SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: color.bg },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: color.borderSubtle },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: color.text },
  aiBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 7, borderRadius: radius.md, backgroundColor: color.surface, borderWidth: 1, borderColor: color.border, marginRight: 8 },
  aiBtnText: { fontWeight: '700', fontSize: 13 },
  aiCta: { alignItems: 'center', gap: 3, paddingVertical: 16, borderRadius: radius.md, borderWidth: 1.5, borderStyle: 'dashed', marginBottom: 16, backgroundColor: color.surface },
  aiCtaText: { fontSize: 15, fontWeight: '700' },
  aiCtaSub: { fontSize: 12, color: color.textFaint },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.md },
  saveText: { color: color.text, fontWeight: '700', fontSize: 14 },
  scroll: { padding: 16 },
  titleInput: { fontSize: 24, fontWeight: '700', color: color.text, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: color.borderSubtle, marginBottom: 16 },
  qCard: { backgroundColor: color.surface, borderRadius: radius.md, borderWidth: 1, borderColor: color.borderSubtle, padding: 12, marginBottom: 14 },
  qBar: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  qNum: { fontSize: 14, fontWeight: '700' },
  qTypeToggle: { flex: 1, flexDirection: 'row', gap: 4 },
  qTypeBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.sm, backgroundColor: color.surface },
  qTypeText: { fontSize: 12, fontWeight: '600', color: color.textFaint },
  promptInput: { fontSize: 16, fontWeight: '600', color: color.text, lineHeight: 22, marginBottom: 10, padding: 0 },
  options: { gap: 8 },
  optRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  optInput: { flex: 1, backgroundColor: color.bg, borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 8, fontSize: 15, color: color.text, borderWidth: 1, borderColor: color.border },
  addOpt: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4 },
  addOptText: { fontSize: 13, fontWeight: '600' },
  hintText: { fontSize: 11, color: color.textFaint, marginTop: 2 },
  answerInput: { backgroundColor: color.bg, borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: color.text, borderWidth: 1, borderColor: color.border },
  explInput: { fontSize: 13, color: color.textMuted, marginTop: 10, backgroundColor: color.bg, borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: color.borderSubtle },
  addQ: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: radius.md, borderWidth: 1, borderColor: color.border, borderStyle: 'dashed' },
  addQText: { fontSize: 14, fontWeight: '700' },
});
