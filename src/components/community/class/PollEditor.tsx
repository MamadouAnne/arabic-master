import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, Modal, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import type { PollContent } from '../../../types/classContent';

interface Props {
  visible: boolean;
  groupColor: string;
  initial?: PollContent | null;
  onSave: (content: PollContent) => void;
  onClose: () => void;
}

export function PollEditor({ visible, groupColor, initial, onSave, onClose }: Props) {
  const [question, setQuestion] = useState(initial?.question || '');
  const [options, setOptions] = useState<string[]>(initial?.options?.length ? initial.options : ['', '']);
  const [allowMultiple, setAllowMultiple] = useState(initial?.allowMultiple || false);

  const setOpt = (i: number, v: string) => setOptions((prev) => prev.map((o, k) => (k === i ? v : o)));
  const addOpt = () => setOptions((prev) => (prev.length < 6 ? [...prev, ''] : prev));
  const removeOpt = (i: number) => setOptions((prev) => (prev.length > 2 ? prev.filter((_, k) => k !== i) : prev));

  const handleSave = () => {
    if (!question.trim()) { Alert.alert('Add a question', 'Give your poll a question.'); return; }
    const opts = options.map((o) => o.trim()).filter(Boolean);
    if (opts.length < 2) { Alert.alert('Add options', 'A poll needs at least 2 options.'); return; }
    onSave({ kind: 'poll', question: question.trim(), options: opts, allowMultiple });
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaProvider style={{ flex: 1 }}><SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={8}><Ionicons name="close" size={24} color="#e2e8f0" /></Pressable>
          <Text style={styles.headerTitle}>{initial ? 'Edit poll' : 'New poll'}</Text>
          <Pressable onPress={handleSave} style={[styles.saveBtn, { backgroundColor: groupColor }]}>
            <Text style={styles.saveText}>{initial ? 'Update' : 'Post'}</Text>
          </Pressable>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <TextInput style={styles.questionInput} placeholder="Ask a question…" placeholderTextColor="#475569" value={question} onChangeText={setQuestion} multiline />

            <Text style={styles.label}>Options</Text>
            {options.map((opt, i) => (
              <View key={i} style={styles.optRow}>
                <TextInput style={styles.optInput} placeholder={`Option ${i + 1}`} placeholderTextColor="#475569" value={opt} onChangeText={(t) => setOpt(i, t)} />
                {options.length > 2 && (
                  <Pressable onPress={() => removeOpt(i)} hitSlop={6}><Ionicons name="close" size={20} color="#64748b" /></Pressable>
                )}
              </View>
            ))}
            {options.length < 6 && (
              <Pressable style={styles.addOpt} onPress={addOpt}>
                <Ionicons name="add" size={16} color={groupColor} />
                <Text style={[styles.addOptText, { color: groupColor }]}>Add option</Text>
              </Pressable>
            )}

            <Pressable style={styles.multiRow} onPress={() => setAllowMultiple((v) => !v)}>
              <Ionicons name={allowMultiple ? 'checkbox' : 'square-outline'} size={22} color={allowMultiple ? groupColor : '#475569'} />
              <Text style={styles.multiText}>Allow multiple selections</Text>
            </Pressable>
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
  questionInput: { fontSize: 20, fontWeight: '700', color: '#f8fafc', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#1e293b', marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  optRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  optInput: { flex: 1, backgroundColor: '#131c2e', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, fontSize: 15, color: '#e2e8f0', borderWidth: 1, borderColor: '#334155' },
  addOpt: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6 },
  addOptText: { fontSize: 14, fontWeight: '600' },
  multiRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 20 },
  multiText: { fontSize: 15, color: '#e2e8f0' },
});
