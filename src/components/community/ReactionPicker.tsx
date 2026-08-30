import React from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { font, color, radius } from '../../theme/tokens';

const REACTIONS = ['❤️', '👍', '🤲', '🔥', 'ماشاءالله', 'بارك الله'];

interface Props {
  onSelect: (emoji: string) => void;
  onClose: () => void;
  inline?: boolean;
}

export function ReactionPicker({ onSelect, onClose, inline }: Props) {
  const row = (
    <View style={[styles.container, inline && styles.containerInline]}>
      {REACTIONS.map((emoji) => (
        <ReactionButton key={emoji} emoji={emoji} onPress={() => { onSelect(emoji); if (!inline) onClose(); }} />
      ))}
    </View>
  );

  if (inline) return row;

  return (
    <Pressable style={styles.overlay} onPress={onClose}>
      {row}
    </Pressable>
  );
}

function ReactionButton({ emoji, onPress }: { emoji: string; onPress: () => void }) {
  const scale = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 1.3, useNativeDriver: true, friction: 5 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 5 }).start();
  };

  const isArabic = emoji.length > 2;

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onPress}>
      <Animated.View style={[styles.emojiBtn, { transform: [{ scale }] }]}>
        <Text style={[styles.emoji, isArabic && styles.arabicEmoji]}>{emoji}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 },
  container: { flexDirection: 'row', backgroundColor: color.surface, borderRadius: 28, paddingHorizontal: 8, paddingVertical: 6, borderWidth: 1, borderColor: color.border, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8, position: 'absolute', top: '40%', alignSelf: 'center', gap: 4 },
  containerInline: { position: 'relative', top: 0, shadowOpacity: 0, elevation: 0, borderWidth: 0, backgroundColor: 'transparent' },
  emojiBtn: { width: 44, height: 44, borderRadius: radius.xl, alignItems: 'center', justifyContent: 'center', backgroundColor: color.bg },
  emoji: { fontSize: 22 },
  arabicEmoji: {
    fontFamily: font.arabic,
    lineHeight: 19, fontSize: 11, fontWeight: '700', color: color.warning },
});

export { REACTIONS };
