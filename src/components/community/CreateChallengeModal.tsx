import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Modal, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreate: (title: string, targetType: string, targetValue: number, startDate: string, endDate: string) => void;
  groupColor: string;
}

const TARGET_TYPES = [
  { key: 'surah', label: 'Surahs memorized', icon: 'book' },
  { key: 'words', label: 'New words learned', icon: 'text' },
  { key: 'xp', label: 'XP earned', icon: 'star' },
  { key: 'lessons', label: 'Lessons completed', icon: 'school' },
  { key: 'custom', label: 'Custom goal', icon: 'flag' },
];

const DURATION_OPTIONS = [
  { label: '1 week', days: 7 },
  { label: '2 weeks', days: 14 },
  { label: '1 month', days: 30 },
];

export function CreateChallengeModal({ visible, onClose, onCreate, groupColor }: Props) {
  const [title, setTitle] = useState('');
  const [targetType, setTargetType] = useState('surah');
  const [targetValue, setTargetValue] = useState('');
  const [durationDays, setDurationDays] = useState(7);

  const handleCreate = () => {
    const val = parseInt(targetValue, 10);
    if (!title.trim() || !val || val <= 0) return;
    const start = new Date().toISOString();
    const end = new Date(Date.now() + durationDays * 24 * 3600000).toISOString();
    onCreate(title.trim(), targetType, val, start, end);
    setTitle('');
    setTargetValue('');
    setTargetType('surah');
    setDurationDays(7);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={24} color="#94a3b8" />
            </Pressable>
            <Text style={styles.headerTitle}>Group Challenge</Text>
            <Pressable style={[styles.createBtn, (!title.trim() || !targetValue) && { opacity: 0.4 }]} onPress={handleCreate} disabled={!title.trim() || !targetValue}>
              <Text style={styles.createBtnText}>Create</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.hint}>Set a shared goal for the group to reach before the deadline. Everyone contributes to the same target.</Text>
            <TextInput style={styles.input} placeholder='e.g. "Memorize Surah Al-Mulk" or "Earn 500 XP"' placeholderTextColor="#64748b" value={title} onChangeText={setTitle} maxLength={80} />

            <Text style={styles.label}>What are you tracking?</Text>
            <View style={styles.optionRow}>
              {TARGET_TYPES.map((t) => (
                <Pressable key={t.key} style={[styles.typeBtn, targetType === t.key && { backgroundColor: `${groupColor}25`, borderColor: groupColor }]} onPress={() => setTargetType(t.key)}>
                  <Ionicons name={t.icon as any} size={16} color={targetType === t.key ? groupColor : '#64748b'} />
                  <Text style={[styles.typeText, targetType === t.key && { color: groupColor }]}>{t.label}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>How much?</Text>
            <TextInput style={styles.input} placeholder={targetType === 'xp' ? 'e.g. 500' : targetType === 'words' ? 'e.g. 50' : 'e.g. 5'} placeholderTextColor="#64748b" value={targetValue} onChangeText={setTargetValue} keyboardType="number-pad" maxLength={6} />

            <Text style={styles.label}>Time limit</Text>
            <View style={styles.optionRow}>
              {DURATION_OPTIONS.map((opt) => (
                <Pressable key={opt.days} style={[styles.optionBtn, durationDays === opt.days && { backgroundColor: `${groupColor}25`, borderColor: groupColor }]} onPress={() => setDurationDays(opt.days)}>
                  <Text style={[styles.optionText, durationDays === opt.days && { color: groupColor }]}>{opt.label}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  content: { backgroundColor: '#1e293b', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#ffffff' },
  createBtn: { backgroundColor: '#818cf8', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 12 },
  createBtnText: { fontSize: 14, fontWeight: '700', color: '#ffffff' },
  hint: { fontSize: 13, color: '#64748b', lineHeight: 19, marginBottom: 14 },
  input: { backgroundColor: '#0f172a', borderRadius: 12, padding: 14, fontSize: 15, color: '#ffffff', marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  label: { fontSize: 13, fontWeight: '600', color: '#94a3b8', marginBottom: 8, marginTop: 4 },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  typeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#334155', backgroundColor: '#0f172a' },
  typeText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  optionBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#334155', backgroundColor: '#0f172a' },
  optionText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
});
