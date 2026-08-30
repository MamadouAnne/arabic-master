import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { color, radius } from '../../theme/tokens';
import { withAlpha } from '../ui/Primitives';

interface PinnedMessage {
  id: string;
  authorName: string;
  body: string;
}

interface Props {
  messages: PinnedMessage[];
  onDismiss: () => void;
}

export function PinnedBanner({ messages, onDismiss }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (messages.length === 0) return null;

  const current = messages[currentIndex % messages.length];

  const handleNext = () => {
    if (messages.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }
  };

  return (
    <Pressable style={styles.banner} onPress={handleNext}>
      <Ionicons name="pin" size={14} color={color.accent} />
      <View style={styles.content}>
        <Text style={styles.author}>{current.authorName}</Text>
        <Text style={styles.body} numberOfLines={1}>{current.body}</Text>
      </View>
      {messages.length > 1 && (
        <Text style={styles.counter}>{currentIndex + 1}/{messages.length}</Text>
      )}
      <Pressable onPress={onDismiss} hitSlop={8}>
        <Ionicons name="close" size={16} color={color.textFaint} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 12, marginTop: 4, marginBottom: 4, backgroundColor: color.surface, borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: withAlpha(color.accent, 0.19) },
  content: { flex: 1 },
  author: { fontSize: 11, fontWeight: '700', color: color.accent, marginBottom: 1 },
  body: { fontSize: 12, color: color.textMuted },
  counter: { fontSize: 11, color: color.textFaint, fontWeight: '600' },
});
