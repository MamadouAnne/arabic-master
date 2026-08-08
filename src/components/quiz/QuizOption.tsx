import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type QuizOptionState = 'idle' | 'selected' | 'correct' | 'wrong';

interface QuizOptionProps {
  /** 0-based index → A/B/C/D badge (unless `label` is given). */
  index: number;
  label?: string;
  /** Main answer text. */
  primary: string;
  /** Render the primary text large + RTL (for Arabic answers). */
  primaryArabic?: boolean;
  /** Optional supporting line under the primary text (e.g. a translation). */
  secondary?: string;
  secondaryArabic?: boolean;
  state?: QuizOptionState;
  disabled?: boolean;
  onPress: () => void;
  /** When provided, shows a gold audio button on the trailing edge (idle only). */
  onAudio?: () => void;
}

const GOLD = '#D4AF37';
const GREEN = '#22c55e';
const RED = '#ef4444';

/**
 * Shared multiple-choice option card used across every quiz and exercise so
 * they all match the challenge-quiz format: A/B/C/D badge, roomy RTL Arabic,
 * and solid green/red feedback.
 */
export const QuizOption = React.memo(function QuizOption({
  index,
  label,
  primary,
  primaryArabic,
  secondary,
  secondaryArabic,
  state = 'idle',
  disabled,
  onPress,
  onAudio,
}: QuizOptionProps) {
  const isCorrect = state === 'correct';
  const isWrong = state === 'wrong';
  const isSelected = state === 'selected';

  return (
    <Pressable
      style={[
        styles.card,
        isSelected && styles.cardSelected,
        isCorrect && styles.cardCorrect,
        isWrong && styles.cardWrong,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <View
        style={[
          styles.badge,
          isSelected && styles.badgeSelected,
          isCorrect && styles.badgeCorrect,
          isWrong && styles.badgeWrong,
        ]}
      >
        {isCorrect ? (
          <Ionicons name="checkmark" size={20} color="#ffffff" />
        ) : isWrong ? (
          <Ionicons name="close" size={20} color="#ffffff" />
        ) : (
          <Text style={[styles.badgeText, isSelected && styles.badgeTextSelected]}>
            {label ?? String.fromCharCode(65 + index)}
          </Text>
        )}
      </View>

      <View style={styles.textCol}>
        <Text
          style={[
            primaryArabic ? styles.primaryArabic : styles.primary,
            isCorrect && styles.textCorrect,
            isWrong && styles.textWrong,
          ]}
          numberOfLines={primaryArabic ? 2 : 3}
        >
          {primary}
        </Text>
        {secondary ? (
          <Text
            style={secondaryArabic ? styles.secondaryArabic : styles.secondary}
            numberOfLines={2}
          >
            {secondary}
          </Text>
        ) : null}
      </View>

      {onAudio && state === 'idle' ? (
        <Pressable
          style={styles.audioButton}
          onPress={(e) => {
            e.stopPropagation?.();
            onAudio();
          }}
          hitSlop={8}
        >
          <Ionicons name="volume-high" size={18} color={GOLD} />
        </Pressable>
      ) : null}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 66,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  cardSelected: {
    borderColor: GOLD,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
  },
  cardCorrect: {
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    borderColor: GREEN,
  },
  cardWrong: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: RED,
  },

  badge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeSelected: {
    borderColor: GOLD,
  },
  badgeCorrect: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  badgeWrong: {
    backgroundColor: RED,
    borderColor: RED,
  },
  badgeText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#94a3b8',
  },
  badgeTextSelected: {
    color: GOLD,
  },

  textCol: {
    flex: 1,
    gap: 2,
  },
  primary: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'left',
  },
  primaryArabic: {
    fontSize: 26,
    lineHeight: 44,
    color: '#ffffff',
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  secondary: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'left',
  },
  secondaryArabic: {
    fontSize: 20,
    lineHeight: 34,
    color: '#cbd5e1',
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  textCorrect: {
    color: GREEN,
  },
  textWrong: {
    color: RED,
  },

  audioButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
