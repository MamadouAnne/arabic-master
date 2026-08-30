import { View, Text, StyleSheet } from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import ArabicKeyboard from './ArabicKeyboard';
import { color, radius } from '../../theme/tokens';
import { withAlpha } from '../ui/Primitives';

interface ArabicWritingInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
  isCorrect?: boolean | null;
  showResult?: boolean;
  accentColor?: string;
}

export default function ArabicWritingInput({
  value,
  onChange,
  onSubmit,
  placeholder = 'اكتب إجابتك هنا...',
  disabled = false,
  isCorrect = null,
  showResult = false,
  accentColor = '#6366f1',
}: ArabicWritingInputProps) {
  const handleKeyPress = useCallback(
    (key: string) => {
      if (!disabled) {
        onChange(value + key);
      }
    },
    [disabled, onChange, value]
  );

  const handleBackspace = useCallback(() => {
    if (!disabled) {
      onChange(value.slice(0, -1));
    }
  }, [disabled, onChange, value]);

  const handleSpace = useCallback(() => {
    if (!disabled) {
      onChange(value + ' ');
    }
  }, [disabled, onChange, value]);

  const handleSubmit = useCallback(() => {
    if (!disabled && value.trim()) {
      onSubmit();
    }
  }, [disabled, onSubmit, value]);

  const getDisplayStyle = () => {
    if (showResult && isCorrect === true) {
      return styles.displayCorrect;
    }
    if (showResult && isCorrect === false) {
      return styles.displayWrong;
    }
    return { borderColor: accentColor + '40' };
  };

  return (
    <View style={styles.container}>
      {/* Answer Display */}
      <View style={[styles.answerDisplay, getDisplayStyle()]}>
        {value ? (
          <Text style={styles.answerText}>{value}</Text>
        ) : (
          <Text style={styles.placeholderText}>{placeholder}</Text>
        )}
      </View>

      {/* Arabic Keyboard */}
      {!disabled && (
        <ArabicKeyboard
          onKeyPress={handleKeyPress}
          onBackspace={handleBackspace}
          onSpace={handleSpace}
          onSubmit={handleSubmit}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
  },
  answerDisplay: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    padding: 18,
    minHeight: 70,
    borderWidth: 2,
    borderColor: color.border,
    marginHorizontal: 20,
    marginBottom: 16,
    justifyContent: 'center',
  },
  displayCorrect: {
    borderColor: color.progress,
    backgroundColor: withAlpha(color.progress, 0.13),
  },
  displayWrong: {
    borderColor: color.danger,
    backgroundColor: withAlpha(color.danger, 0.13),
  },
  answerText: {
    fontSize: 24,
    color: color.text,
    textAlign: 'right',
  },
  placeholderText: {
    fontSize: 20,
    color: color.textFaint,
    textAlign: 'right',
  },
});
