import React, { memo } from 'react';
import { Text, TextStyle } from 'react-native';
import { color } from '../../../src/theme/tokens';

interface HighlightedTextProps {
  text: string;
  style?: TextStyle;
  highlightColor?: string;
}

/**
 * Renders text with [[highlighted]] terms in a different color
 * Used throughout the app for grammar explanations and vocabulary
 */
const HighlightedText = memo(function HighlightedText({
  text,
  style,
  highlightColor = color.progress,
}: HighlightedTextProps) {
  // Parse [[text]] patterns for highlighting
  const parts = text.split(/(\[\[[^\]]+\]\])/g);

  return (
    <Text style={style}>
      {parts.map((part, index) => {
        if (part.startsWith('[[') && part.endsWith(']]')) {
          const highlightedText = part.slice(2, -2);
          return (
            <Text
              key={index}
              style={{
                color: highlightColor,
                fontWeight: 'bold',
                fontSize: style?.fontSize ? (style.fontSize as number) + 2 : 18,
              }}
            >
              {highlightedText}
            </Text>
          );
        }
        return <Text key={index}>{part}</Text>;
      })}
    </Text>
  );
});

export default HighlightedText;
