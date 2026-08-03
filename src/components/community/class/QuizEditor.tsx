import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, Modal, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import type { QuizContent, QuizQuestion } from '../../../types/classContent';

interface Props {
  visible: boolean;
  groupColor: string;
  initial?: QuizContent | null;
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

export function QuizEditor({ visible, groupColor, initial, onSave, onClose }: Props) {
  const [title, setTitle] = useState(initial?.title || '');
  const [questions, setQuestions] = useState<QuizQuestion[]>(initial?.questions?.length ? initial.questions : [blankQuestion('multiple_choice')]);

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
          <Pressable onPress={onClose} hitSlop={8}><Ionicons name="close" size={24} color="#e2e8f0" /></Pressable>
          <Text style={styles.headerTitle}>{initial ? 'Edit quiz' : 'New quiz'}</Text>
          <Pressable onPress={handleSave} style={[styles.saveBtn, { backgroundColor: groupColor }]}>
            <Text style={styles.saveText}>{initial ? 'Update' : 'Post'}</Text>
          </Pressable>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <TextInput style={styles.titleInput} placeholder="Quiz title" placeholderTextColor="#475569" value={title} onChangeText={setTitle} multiline />

            {questions.map((q, qi) => (
              <View key={q.id} style={styles.qCard}>
                <View style={styles.qBar}>
                  <Text style={[styles.qNum, { color: groupColor }]}>Q{qi + 1}</Text>
                  <View style={styles.qTypeToggle}>
                    <Pressable onPress={() => patch(qi, blankQuestion('multiple_choice'))} style={[styles.qTypeBtn, q.type === 'multiple_choice' && { backgroundColor: `${groupColor}30` }]}>
                      <Text style={[styles.qTypeText, q.type === 'multiple_choice' && { color: groupColor }]}>Choice</Text>
                    </Pressable>
                    <Pressable onPress={() => patch(qi, blankQuestion('fill_blank'))} style={[styles.qTypeBtn, q.type === 'fill_blank' && { backgroundColor: `${groupColor}30` }]}>
                      <Text style={[styles.qTypeText, q.type === 'fill_blank' && { color: groupColor }]}>Fill blank</Text>
                    </Pressable>
                  </View>
                  {questions.length > 1 && (
                    <Pressable onPress={() => setQuestions((prev) => prev.filter((_, k) => k !== qi))} hitSlop={6}>
                      <Ionicons name="trash-outline" size={16} color="#ef4444" />
                    </Pressable>
                  )}
                </View>

                <TextInput style={styles.promptInput} placeholder="Question…" placeholderTextColor="#475569" value={q.prompt} onChangeText={(t) => patch(qi, { prompt: t })} multiline />

                {q.type === 'multiple_choice' ? (
                  <View style={styles.options}>
                    {(q.options || []).map((opt, oi) => (
                      <View key={oi} style={styles.optRow}>
                        <Pressable onPress={() => patch(qi, { correctIndex: oi })} hitSlop={6}>
                          <Ionicons name={q.correctIndex === oi ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={q.correctIndex === oi ? '#10b981' : '#475569'} />
                        </Pressable>
                        <TextInput style={styles.optInput} placeholder={`Option ${oi + 1}`} placeholderTextColor="#475569" value={opt} onChangeText={(t) => setOption(qi, oi, t)} />
                        {(q.options || []).length > 2 && (
                          <Pressable onPress={() => removeOption(qi, oi)} hitSlop={6}><Ionicons name="close" size={18} color="#64748b" /></Pressable>
                        )}
                      </View>
                    ))}
                    {(q.options || []).length < 6 && (
                      <Pressable onPress={() => addOption(qi)} style={styles.addOpt}>
                        <Ionicons name="add" size={16} color={groupColor} />
                        <Text style={[styles.addOptText, { color: groupColor }]}>Add option</Text>
                      </Pressable>
                    )}
                    <Text style={styles.hintText}>Tap the circle to mark the correct answer.</Text>
                  </View>
                ) : (
                  <TextInput style={styles.answerInput} placeholder="Correct answer" placeholderTextColor="#475569" value={q.correctText || ''} onChangeText={(t) => patch(qi, { correctText: t })} />
                )}

                <TextInput style={styles.explInput} placeholder="Explanation (optional)" placeholderTextColor="#475569" value={q.explanation || ''} onChangeText={(t) => patch(qi, { explanation: t })} multiline />
              </View>
            ))}

            <Pressable style={styles.addQ} onPress={() => setQuestions((prev) => [...prev, blankQuestion('multiple_choice')])}>
              <Ionicons name="add-circle" size={20} color={groupColor} />
              <Text style={[styles.addQText, { color: groupColor }]}>Add question</Text>
            </Pressable>
            <View style={{ height: 30 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView></SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: '#f8fafc' },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  saveText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
  scroll: { padding: 16 },
  titleInput: { fontSize: 24, fontWeight: '800', color: '#f8fafc', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#1e293b', marginBottom: 16 },
  qCard: { backgroundColor: '#131c2e', borderRadius: 14, borderWidth: 1, borderColor: '#1e293b', padding: 12, marginBottom: 14 },
  qBar: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  qNum: { fontSize: 14, fontWeight: '800' },
  qTypeToggle: { flex: 1, flexDirection: 'row', gap: 4 },
  qTypeBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: '#1e293b' },
  qTypeText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  promptInput: { fontSize: 16, fontWeight: '600', color: '#f1f5f9', lineHeight: 22, marginBottom: 10, padding: 0 },
  options: { gap: 8 },
  optRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  optInput: { flex: 1, backgroundColor: '#0f172a', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, fontSize: 15, color: '#e2e8f0', borderWidth: 1, borderColor: '#334155' },
  addOpt: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4 },
  addOptText: { fontSize: 13, fontWeight: '600' },
  hintText: { fontSize: 11, color: '#64748b', marginTop: 2 },
  answerInput: { backgroundColor: '#0f172a', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: '#e2e8f0', borderWidth: 1, borderColor: '#334155' },
  explInput: { fontSize: 13, color: '#94a3b8', marginTop: 10, backgroundColor: '#0f172a', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#1e293b' },
  addQ: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#334155', borderStyle: 'dashed' },
  addQText: { fontSize: 14, fontWeight: '700' },
});
