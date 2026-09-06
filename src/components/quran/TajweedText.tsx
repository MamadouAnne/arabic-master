import React from 'react';
import { Text, View, Pressable, StyleSheet } from 'react-native';
import { TajweedOccurrence, TajweedRuleId } from '../../types/quran';
import { TAJWEED_COLORS } from '../../data/arabic/quran/tajweed/colors';
import { getTajweedRuleById } from '../../data/arabic/quran/tajweed/rules';
import { color, font, radius, space } from '../../theme/tokens';

interface TajweedTextProps {
  text: string;
  tajweedRules?: TajweedOccurrence[];
  showTajweed?: boolean;
  fontSize?: number;
  highlightWordIndex?: number;
  onWordPress?: (wordIndex: number) => void;
  onTajweedPress?: (ruleId: TajweedRuleId) => void;
}

/**
 * Uthmani text carries stacked harakat, so it needs far more leading than
 * Latin copy. 2.0 clears the marks; the previous 1.8 crowded them.
 */
const QURAN_LINE_HEIGHT = 2.0;

interface TextSegment {
  text: string;
  ruleId?: TajweedRuleId;
  color?: string;
  startIndex: number;
  endIndex: number;
}

export function TajweedText({
  text,
  tajweedRules = [],
  showTajweed = true,
  fontSize = 32,
  highlightWordIndex,
  onWordPress,
  onTajweedPress,
}: TajweedTextProps) {
  // Handle undefined or empty text
  const safeText = text || '';

  // Parse text into segments with tajweed colors
  const getSegments = (): TextSegment[] => {
    if (!safeText || !showTajweed || tajweedRules.length === 0) {
      return [{ text: safeText, startIndex: 0, endIndex: safeText.length }];
    }

    // Sort rules by start index
    const sortedRules = [...tajweedRules].sort((a, b) => a.startIndex - b.startIndex);
    const segments: TextSegment[] = [];
    let currentIndex = 0;

    for (const rule of sortedRules) {
      // Add plain text before this rule
      if (rule.startIndex > currentIndex) {
        segments.push({
          text: safeText.substring(currentIndex, rule.startIndex),
          startIndex: currentIndex,
          endIndex: rule.startIndex,
        });
      }

      // Add tajweed segment
      const ruleColor = TAJWEED_COLORS[rule.ruleId as keyof typeof TAJWEED_COLORS];
      segments.push({
        text: safeText.substring(rule.startIndex, rule.endIndex),
        ruleId: rule.ruleId,
        color: ruleColor || color.text,
        startIndex: rule.startIndex,
        endIndex: rule.endIndex,
      });

      currentIndex = rule.endIndex;
    }

    // Add remaining text
    if (currentIndex < safeText.length) {
      segments.push({
        text: safeText.substring(currentIndex),
        startIndex: currentIndex,
        endIndex: safeText.length,
      });
    }

    return segments;
  };

  const segments = getSegments();

  const handleSegmentPress = (segment: TextSegment) => {
    if (segment.ruleId && onTajweedPress) {
      onTajweedPress(segment.ruleId);
    }
  };

  return (
    // Nested segments inherit fontFamily from this parent, which keeps the
    // script shaping consistent across tajweed colour boundaries.
    <Text style={[styles.container, { fontSize, lineHeight: fontSize * QURAN_LINE_HEIGHT }]}>
      {segments.map((segment, index) => {
        if (segment.ruleId && showTajweed) {
          return (
            <Text
              key={index}
              style={[
                styles.tajweedText,
                { color: segment.color, fontSize },
              ]}
              onPress={() => handleSegmentPress(segment)}
            >
              {segment.text}
            </Text>
          );
        }
        return (
          <Text
            key={index}
            style={[styles.plainText, { fontSize }]}
          >
            {segment.text}
          </Text>
        );
      })}
    </Text>
  );
}

// Component for word-by-word display with highlighting
interface WordByWordTextProps {
  words: Array<{ text: string; transliteration: string; translation: string }>;
  currentWordIndex?: number;
  showTransliteration?: boolean;
  showTranslation?: boolean;
  fontSize?: number;
  onWordPress?: (index: number) => void;
}

export function WordByWordText({
  words,
  currentWordIndex,
  showTransliteration = true,
  showTranslation = true,
  fontSize = 24,
  onWordPress,
}: WordByWordTextProps) {
  return (
    <View style={styles.wordContainer}>
      {words.map((word, index) => {
        const isHighlighted = currentWordIndex === index;
        return (
          <Pressable
            key={index}
            style={[
              styles.wordItem,
              isHighlighted && styles.wordHighlighted,
            ]}
            onPress={() => onWordPress?.(index)}
          >
            <Text
              style={[
                styles.wordArabic,
                { fontSize },
                isHighlighted && styles.wordArabicHighlighted,
              ]}
            >
              {word.text}
            </Text>
            {showTransliteration && (
              <Text style={[styles.wordTransliteration, isHighlighted && styles.textHighlighted]}>
                {word.transliteration}
              </Text>
            )}
            {showTranslation && (
              <Text style={[styles.wordTranslation, isHighlighted && styles.textHighlighted]}>
                {word.translation}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // The AmiriQuran cut — spaced so dense vocalisation does not collide.
    // Previously unset, so the Quran rendered in the system face.
    fontFamily: font.quran,
    color: color.text,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  plainText: {
    color: color.text,
  },
  tajweedText: {
    // No fontWeight: AmiriQuran ships a single weight, and asking for one it
    // does not have makes Android fall back to the default face mid-verse.
    // Colour alone distinguishes the rule.
  },
  wordContainer: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: space.md,
    paddingVertical: space.lg,
  },
  wordItem: {
    alignItems: 'center',
    padding: space.sm,
    borderRadius: radius.md,
    backgroundColor: color.surface,
    minWidth: 60,
  },
  wordHighlighted: {
    backgroundColor: color.accent,
  },
  wordArabic: {
    fontFamily: font.arabic,
    color: color.text,
    marginBottom: space.xs,
  },
  wordArabicHighlighted: {
    color: color.textOnAccent,
  },
  wordTransliteration: {
    color: color.textMuted,
    fontSize: 12,
    marginBottom: 2,
  },
  wordTranslation: {
    color: color.textFaint,
    fontSize: 10,
    textAlign: 'center',
    maxWidth: 80,
  },
  textHighlighted: {
    color: color.textOnAccent,
  },
});

export default TajweedText;
