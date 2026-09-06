import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, Pressable, TextInput, Modal, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { color, radius } from '../../theme/tokens';

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreate: (title: string, description: string, scheduledAt: string, durationMinutes: number) => void;
  groupColor: string;
}

const DURATION_OPTIONS = [30, 45, 60, 90, 120];

export function CreateSessionModal({ visible, onClose, onCreate, groupColor }: Props) {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [selectedDay, setSelectedDay] = useState(1); // days from now

  const handleCreate = () => {
    if (!title.trim()) return;
    const scheduledAt = new Date(Date.now() + selectedDay * 24 * 3600000);
    scheduledAt.setHours(10, 0, 0, 0);
    onCreate(title.trim(), description.trim(), scheduledAt.toISOString(), selectedDuration);
    setTitle('');
    setDescription('');
    setSelectedDuration(60);
    setSelectedDay(1);
    onClose();
  };

  const dayOptions = [
    { key: 'tomorrow', label: 'Tomorrow', value: 1 },
    { key: 'in2days', label: 'In 2 days', value: 2 },
    { key: 'in3days', label: 'In 3 days', value: 3 },
    { key: 'weekend', label: 'This weekend', value: Math.max(1, (6 - new Date().getDay()) % 7) },
    { key: 'nextweek', label: 'Next week', value: 7 },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={24} color={color.textMuted} />
            </Pressable>
            <Text style={styles.headerTitle}>{t('community.sessionTitle')}</Text>
            <Pressable style={[styles.createBtn, !title.trim() && { opacity: 0.4 }]} onPress={handleCreate} disabled={!title.trim()}>
              <Text style={styles.createBtnText}>{t('community.create')}</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.hint}>{t('community.sessionHint')}</Text>
            <TextInput style={styles.input} placeholder='e.g. "Juz 30 Review" or "Tajweed Practice"' placeholderTextColor={color.textFaint} value={title} onChangeText={setTitle} maxLength={80} />
            <TextInput style={[styles.input, { minHeight: 60 }]} placeholder={t('community.sessionTopicPlaceholder')} placeholderTextColor={color.textFaint} value={description} onChangeText={setDescription} multiline maxLength={300} />

            <Text style={styles.label}>{t('community.when')}</Text>
            <View style={styles.optionRow}>
              {dayOptions.map((opt) => (
                <Pressable key={opt.key} style={[styles.optionBtn, selectedDay === opt.value && { backgroundColor: `${groupColor}25`, borderColor: groupColor }]} onPress={() => setSelectedDay(opt.value)}>
                  <Text style={[styles.optionText, selectedDay === opt.value && { color: groupColor }]}>{opt.label}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>{t('community.duration')}</Text>
            <View style={styles.optionRow}>
              {DURATION_OPTIONS.map((dur) => (
                <Pressable key={dur} style={[styles.optionBtn, selectedDuration === dur && { backgroundColor: `${groupColor}25`, borderColor: groupColor }]} onPress={() => setSelectedDuration(dur)}>
                  <Text style={[styles.optionText, selectedDuration === dur && { color: groupColor }]}>{dur}min</Text>
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
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.45)', justifyContent: 'flex-end' },
  content: { backgroundColor: color.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: color.text },
  createBtn: { backgroundColor: color.accent, paddingHorizontal: 20, paddingVertical: 8, borderRadius: radius.md },
  createBtnText: { fontSize: 14, fontWeight: '700', color: color.text },
  hint: { fontSize: 13, color: color.textFaint, lineHeight: 19, marginBottom: 14 },
  input: { backgroundColor: color.bg, borderRadius: radius.md, padding: 14, fontSize: 15, color: color.text, marginBottom: 12, borderWidth: 1, borderColor: color.border },
  label: { fontSize: 13, fontWeight: '600', color: color.textMuted, marginBottom: 8, marginTop: 4 },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  optionBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.sm, borderWidth: 1, borderColor: color.border, backgroundColor: color.bg },
  optionText: { fontSize: 13, fontWeight: '600', color: color.textFaint },
});
