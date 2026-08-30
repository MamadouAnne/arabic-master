import React from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';

// Matches runs of Arabic-script characters (same ranges used across the app).
export const ARABIC_REGEX = /[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]+(?:\s+[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]+)*/g;
const ARABIC_CHAR = /[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/g;
const LATIN_CHAR = /[A-Za-z]/g;

/** True when a message body is mostly Arabic → render the whole bubble RTL. */
export function isPredominantlyArabic(text: string): boolean {
  if (!text) return false;
  const arabic = (text.match(ARABIC_CHAR) || []).length;
  if (arabic === 0) return false;
  const latin = (text.match(LATIN_CHAR) || []).length;
  return arabic >= latin;
}

interface RenderOpts {
  arabicStyle?: StyleProp<TextStyle>;
  mentionStyle?: StyleProp<TextStyle>;
}

/**
 * Render a message body with:
 *  - Arabic runs in `arabicStyle` (larger, RTL-friendly font)
 *  - @mentions highlighted in `mentionStyle`
 * Returns inline <Text> nodes to drop inside a parent <Text>.
 */
export function renderMessageText(text: string, opts: RenderOpts = {}): React.ReactNode[] {
  if (!text) return [];
  // First split on mentions, then apply Arabic styling inside each non-mention chunk.
  const MENTION = /(@[\p{L}][\p{L}\p{N}._-]*)/gu;
  const parts = text.split(MENTION);
  const nodes: React.ReactNode[] = [];

  parts.forEach((part, i) => {
    if (!part) return;
    if (i % 2 === 1) {
      // mention token
      nodes.push(
        <Text key={`m${i}`} style={opts.mentionStyle}>{part}</Text>
      );
    } else {
      nodes.push(...splitArabic(part, `t${i}`, opts.arabicStyle));
    }
  });
  return nodes;
}

function splitArabic(text: string, keyBase: string, arabicStyle?: StyleProp<TextStyle>): React.ReactNode[] {
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
    seg.isArabic ? (
      <Text key={`${keyBase}-${i}`} style={arabicStyle}>{seg.text}</Text>
    ) : (
      <Text key={`${keyBase}-${i}`}>{seg.text}</Text>
    )
  );
}

/** Extract the @-token currently being typed at the caret, if any. */
export function activeMentionQuery(text: string): string | null {
  const m = text.match(/(?:^|\s)@([\p{L}\p{N}._-]*)$/u);
  return m ? m[1] : null;
}

/** Replace the trailing @query with a completed @name mention. */
export function applyMention(text: string, name: string): string {
  const handle = name.replace(/\s+/g, '');
  return text.replace(/(^|\s)@([\p{L}\p{N}._-]*)$/u, `$1@${handle} `);
}
