import React from 'react';
import { Text, Pressable, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { color, radius } from '../../theme/tokens';

interface QuizPrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: string;
  style?: StyleProp<ViewStyle>;
}

const GOLD = color.sacred;

/** Shared gold CTA used for Next / Continue / See results across quizzes. */
export function QuizPrimaryButton({ label, onPress, disabled, icon = 'arrow-forward', style }: QuizPrimaryButtonProps) {
  return (
    <Pressable
      style={[styles.button, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.text}>{label}</Text>
      {icon ? <Ionicons name={icon as any} size={20} color={color.textOnAccent} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: GOLD,
    paddingVertical: 17,
    borderRadius: radius.lg,
    marginHorizontal: 24,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 18,
    fontWeight: '700',
    color: color.textOnAccent,
  },
});
