import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { font, color, radius } from '../../theme/tokens';
import { withAlpha } from '../ui/Primitives';

interface ReactionGroup {
  emoji: string;
  count: number;
  hasReacted: boolean;
}

interface Props {
  reactions: ReactionGroup[];
  onToggle: (emoji: string) => void;
}

export function ReactionBadges({ reactions, onToggle }: Props) {
  if (reactions.length === 0) return null;

  return (
    <View style={styles.container}>
      {reactions.map((r) => {
        const isArabic = r.emoji.length > 2;
        return (
          <Pressable
            key={r.emoji}
            style={[styles.badge, r.hasReacted && styles.badgeActive]}
            onPress={() => onToggle(r.emoji)}
          >
            <Text style={[styles.emoji, isArabic && styles.arabicEmoji]}>{r.emoji}</Text>
            <Text style={[styles.count, r.hasReacted && styles.countActive]}>{r.count}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: color.surface, borderRadius: radius.md, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: color.border },
  badgeActive: { backgroundColor: withAlpha(color.accent, 0.13), borderColor: withAlpha(color.accent, 0.31) },
  emoji: { fontSize: 14 },
  arabicEmoji: {
    fontFamily: font.arabic,
    lineHeight: 15, fontSize: 9, fontWeight: '700', color: color.warning },
  count: { fontSize: 12, color: color.textFaint, fontWeight: '600' },
  countActive: { color: color.accent },
});
