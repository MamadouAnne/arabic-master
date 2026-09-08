import React from 'react';
import { Text, StyleSheet, TextStyle, StyleProp } from 'react-native';
import { ARABIC_REGEX } from '../chatText';
import { color, font } from '../../../theme/tokens';

// Inline markup used by the lesson editor's formatting toolbar.
export const MARKERS = {
  bold: '**',
  highlight: '==',
  underline: '__',
  italic: '*',
} as const;
export type MarkerName = keyof typeof MARKERS;

// Matches (in priority order) bold, highlight, underline, italic spans.
const TOKEN = /(\*\*[^*\n]+\*\*|==[^=\n]+==|__[^_\n]+__|\*[^*\n]+\*)/g;

interface RenderOpts {
  color?: string;
  arabicSize?: number;
}

/** Render text with inline markup (bold/highlight/underline/italic) + Arabic runs. */
export function renderRichText(text: string, opts: RenderOpts = {}): React.ReactNode[] {
  if (!text) return [];
  const parts = text.split(TOKEN);
  const nodes: React.ReactNode[] = [];

  parts.forEach((part, i) => {
    if (!part) return;
    let style: StyleProp<TextStyle> = undefined;
    let inner = part;
    if (part.startsWith('**') && part.endsWith('**')) { style = styles.bold; inner = part.slice(2, -2); }
    else if (part.startsWith('==') && part.endsWith('==')) { style = styles.highlight; inner = part.slice(2, -2); }
    else if (part.startsWith('__') && part.endsWith('__')) { style = styles.underline; inner = part.slice(2, -2); }
    else if (part.startsWith('*') && part.endsWith('*') && part.length > 2) { style = styles.italic; inner = part.slice(1, -1); }

    nodes.push(
      <Text key={i} style={style}>{arabicSplit(inner, `s${i}`, opts.arabicSize)}</Text>
    );
  });
  return nodes;
}

function arabicSplit(text: string, keyBase: string, arabicSize?: number): React.ReactNode[] {
  const segments: { text: string; isArabic: boolean }[] = [];
  let lastIndex = 0;
  text.replace(ARABIC_REGEX, (match: string, offset: number) => {
    if (offset > lastIndex) segments.push({ text: text.slice(lastIndex, offset), isArabic: false });
    segments.push({ text: match, isArabic: true });
    lastIndex = offset + match.length;
    return match;
  });
  if (lastIndex < text.length) segments.push({ text: text.slice(lastIndex), isArabic: false });
  if (segments.length === 0) segments.push({ text, isArabic: false });

  return segments.map((seg, i) =>
    seg.isArabic
      ? <Text key={`${keyBase}-${i}`} style={[styles.arabic, arabicSize ? { fontSize: arabicSize, lineHeight: arabicSize * 1.6 } : null]}>{seg.text}</Text>
      : <Text key={`${keyBase}-${i}`}>{seg.text}</Text>
  );
}

/**
 * Wrap the current selection (or insert at the cursor) with a marker pair.
 * Returns the new text plus the caret/selection to restore.
 */
export function wrapSelection(
  text: string,
  selection: { start: number; end: number },
  marker: MarkerName
): { text: string; selection: { start: number; end: number } } {
  const m = MARKERS[marker];
  const { start, end } = selection;
  const before = text.slice(0, start);
  const middle = text.slice(start, end) || (marker === 'bold' ? 'bold' : marker === 'highlight' ? 'highlight' : marker === 'underline' ? 'underline' : 'italic');
  const after = text.slice(end);
  const newText = `${before}${m}${middle}${m}${after}`;
  const selStart = before.length + m.length;
  return { text: newText, selection: { start: selStart, end: selStart + middle.length } };
}

const styles = StyleSheet.create({
  bold: { fontWeight: '700' },
  italic: { fontStyle: 'italic' },
  underline: { textDecorationLine: 'underline' },
  highlight: { backgroundColor: 'rgba(250,204,21,0.28)', color: color.warning },
  arabic: {
    fontFamily: font.arabic, fontSize: 24, lineHeight: 38 },
});
