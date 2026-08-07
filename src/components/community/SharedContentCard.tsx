import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useArabicSpeech } from '../../hooks/useArabicSpeech';
import type { SharedContent } from '../../data/community/socialData';

interface Props {
  content: SharedContent;
  groupColor: string;
  isMe: boolean;
  onPractice?: () => void;
}

const KIND_META: Record<SharedContent['kind'], { icon: string; label: string }> = {
  word: { icon: 'language', label: 'Vocabulary' },
  letter: { icon: 'text', label: 'Letter' },
  phrase: { icon: 'chatbubbles', label: 'Phrase' },
  lesson: { icon: 'school', label: 'Lesson' },
  verse: { icon: 'book', label: 'Quran' },
  dua: { icon: 'heart', label: 'Dua' },
  tajweed: { icon: 'color-wand', label: 'Tajweed' },
  prayer: { icon: 'moon', label: 'Prayer' },
};

export const SharedContentCard = React.memo(function SharedContentCard({ content, groupColor, isMe, onPractice }: Props) {
  const meta = KIND_META[content.kind] || KIND_META.word;
  const { speak, isSpeaking } = useArabicSpeech();
  const audioText = content.audioText || content.arabic;

  return (
    <View style={[styles.card, isMe ? styles.cardMe : styles.cardOther]}>
      {/* Header: kind + reference + audio */}
      <View style={styles.header}>
        <Ionicons name={meta.icon as any} size={14} color={groupColor} />
        <Text style={[styles.kind, { color: groupColor }]}>{meta.label}</Text>
        {content.ref ? <Text style={styles.ref} numberOfLines={1}>{content.ref}</Text> : null}
      </View>

      {content.arabic ? (
        <Pressable style={styles.arabicRow} onPress={() => audioText && speak(audioText)}>
          <Text style={styles.arabic} numberOfLines={3}>{content.arabic}</Text>
          {audioText ? (
            <View style={[styles.audioBtn, { backgroundColor: `${groupColor}22` }]}>
              <Ionicons name={isSpeaking ? 'volume-high' : 'volume-medium'} size={16} color={groupColor} />
            </View>
          ) : null}
        </Pressable>
      ) : null}

      {content.translit ? <Text style={styles.translit} numberOfLines={2}>{content.translit}</Text> : null}
      {content.translation ? <Text style={styles.translation} numberOfLines={3}>{content.translation}</Text> : null}

      {content.example ? (
        <View style={styles.exampleBox}>
          <Text style={styles.exampleArabic} numberOfLines={2}>{content.example}</Text>
          {content.exampleTranslation ? <Text style={styles.exampleTr} numberOfLines={2}>{content.exampleTranslation}</Text> : null}
        </View>
      ) : null}

      <View style={styles.actionsRow}>
        {content.route ? (
          <Pressable style={styles.openRow} onPress={() => router.push(content.route as any)}>
            <Ionicons name="open-outline" size={13} color={groupColor} />
            <Text style={[styles.openText, { color: groupColor }]}>Open</Text>
          </Pressable>
        ) : null}
        {onPractice ? (
          <Pressable style={[styles.practiceBtn, { backgroundColor: groupColor }]} onPress={onPractice}>
            <Ionicons name="people" size={13} color="#ffffff" />
            <Text style={styles.practiceText}>Practice together</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: 14, maxWidth: 290, borderWidth: 1 },
  cardMe: { backgroundColor: 'rgba(16,185,129,0.18)', borderColor: 'rgba(16,185,129,0.4)', borderBottomRightRadius: 4 },
  cardOther: { backgroundColor: '#1e293b', borderColor: '#334155', borderBottomLeftRadius: 4 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  kind: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  ref: { fontSize: 11, color: '#94a3b8', marginLeft: 'auto', maxWidth: 130 },
  arabicRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  arabic: { flex: 1, fontSize: 26, color: '#f8fafc', lineHeight: 42, textAlign: 'right', writingDirection: 'rtl' },
  audioBtn: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  translit: { fontSize: 13, color: '#cbd5e1', fontStyle: 'italic', marginTop: 4 },
  translation: { fontSize: 15, color: '#e2e8f0', lineHeight: 21, marginTop: 4 },
  exampleBox: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#33415580' },
  exampleArabic: { fontSize: 17, color: '#f1f5f9', lineHeight: 28, textAlign: 'right', writingDirection: 'rtl' },
  exampleTr: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  actionsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12, flexWrap: 'wrap' },
  openRow: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4 },
  openText: { fontSize: 12, fontWeight: '600' },
  practiceBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14 },
  practiceText: { fontSize: 12, fontWeight: '700', color: '#ffffff' },
});
