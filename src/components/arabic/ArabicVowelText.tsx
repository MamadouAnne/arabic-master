import React, { memo } from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { font, color } from '../../theme/tokens';

interface ArabicVowelTextProps {
  text: string;
  style?: TextStyle;
  vowelColor?: string;
  showVowelHighlight?: boolean;
}

// Arabic vowel/diacritical marks (harakat) Unicode characters
const ARABIC_VOWELS = [
  '\u064E', // Fatha (ـَ)
  '\u064F', // Damma (ـُ)
  '\u0650', // Kasra (ـِ)
  '\u0651', // Shadda (ـّ)
  '\u0652', // Sukun (ـْ)
  '\u064B', // Fathatan (ـً)
  '\u064C', // Dammatan (ـٌ)
  '\u064D', // Kasratan (ـٍ)
  '\u0653', // Maddah (ـٓ)
  '\u0654', // Hamza above (ـٔ)
  '\u0655', // Hamza below (ـٕ)
  '\u0670', // Superscript Alef (ـٰ)
];

/**
 * Renders Arabic text with vowel marks (harakat) highlighted in a different color.
 * This makes it easier to see and learn the diacritical marks.
 */
const ArabicVowelText = memo(function ArabicVowelText({
  text,
  style,
  vowelColor = color.warning, // Yellow/gold color for vowels
  showVowelHighlight = true,
}: ArabicVowelTextProps) {
  if (!showVowelHighlight) {
    return <Text style={[styles.arabicText, style]}>{text}</Text>;
  }

  // Parse the text and separate vowels from base letters
  const elements: React.ReactNode[] = [];
  let currentBase = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (ARABIC_VOWELS.includes(char)) {
      // If we have accumulated base text, add it first
      if (currentBase) {
        elements.push(
          <Text key={`base-${i}`} style={[styles.arabicText, style]}>
            {currentBase}
          </Text>
        );
        currentBase = '';
      }
      // Add the vowel with highlight color
      elements.push(
        <Text
          key={`vowel-${i}`}
          style={[
            styles.arabicText,
            style,
            { color: vowelColor },
          ]}
        >
          {char}
        </Text>
      );
    } else {
      currentBase += char;
    }
  }

  // Add any remaining base text
  if (currentBase) {
    elements.push(
      <Text key="base-final" style={[styles.arabicText, style]}>
        {currentBase}
      </Text>
    );
  }

  return <Text style={[styles.arabicText, style]}>{elements}</Text>;
});

const styles = StyleSheet.create({
  arabicText: {
    fontFamily: font.arabic,
    lineHeight: 48,
    fontSize: 28,
    color: color.text,
  },
});

export default ArabicVowelText;
