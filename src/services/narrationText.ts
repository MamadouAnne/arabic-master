/**
 * Turning story prose into something a speech engine reads well.
 *
 * Two jobs, kept apart from the audio service so they can be reasoned about
 * on their own:
 *
 *   1. `prepareForSpeech` — remove what cannot be spoken, and nothing else.
 *
 *      English used to go through thirty-five phonetic respellings tuned by
 *      ear for the old compact voice: Allah as "Ollah", honored as
 *      "honnerd", Yusuf as "Yoosuf". French had none, and French was
 *      noticeably the smoother of the two.
 *
 *      That is not a coincidence. A neural voice reads real words from a
 *      learned model of how they sound in a sentence. Hand it an invented
 *      spelling and it falls back to sounding the letters out, which carries
 *      no rhythm, so the word lands flat and drags the phrase around it out
 *      of shape. On common words like "honored" that happened constantly.
 *      "Allah's" also lost its possessive, and "Satan" was quietly swapped
 *      for a different word altogether.
 *
 *      The voices we ask for now say these names perfectly well on their
 *      own. So English is left alone, exactly as French always was. Resist
 *      re-adding a respelling here: if a name really is mispronounced, it is
 *      one name, and it is worth less than the rhythm of every sentence.
 *   2. `splitSentences` — cut a paragraph into utterances. Short utterances
 *      are what make pause, skip and highlight feel immediate, and they keep
 *      the cost of an interrupted sentence to a single sentence.
 */
export type NarrationLang = 'en' | 'fr';

const HONORIFIC = /ﷺ|صلى الله عليه وسلم/g;

const EN_EXPAND: Array<[RegExp, string]> = [
  [/\(?\bPBUH\b\)?/gi, 'peace be upon him'],
  [/\(?\bSWT\b\)?/gi, 'glorified and exalted'],
  [/\bAS\b(?= *\))/g, 'peace be upon him'],
];

const FR_EXPAND: Array<[RegExp, string]> = [
  [/\(?\bPSL\b\)?/gi, 'paix et bénédictions sur lui'],
];

/** Arabic script has no place in an English or French narration track. */
const ARABIC_RANGE = /[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/g;

export function prepareForSpeech(input: string, lang: NarrationLang): string {
  if (!input) return '';
  let t = input;

  t = t.replace(HONORIFIC, lang === 'fr' ? ', paix et bénédictions sur lui, ' : ', peace be upon him, ');

  for (const [re, to] of lang === 'fr' ? FR_EXPAND : EN_EXPAND) t = t.replace(re, to);

  t = t.replace(ARABIC_RANGE, '');

  // Verse and hadith references read as noise mid-sentence.
  t = t.replace(/\(\s*\d+:\d+(\s*[-–]\s*\d+)?\s*\)/g, '');
  t = t.replace(/#\s*\d+/g, '');

  // Quote marks make some engines pause oddly; the prose reads fine without.
  t = t.replace(/["“”«»]/g, '');

  // A hyphen inside a word (Dhul-Kifl, Al-Yasa) makes some engines stop
  // short. Twice, so the middle of a doubly-hyphenated name is caught too.
  t = t.replace(/([A-Za-zÀ-ÖØ-öø-ÿ])-([A-Za-zÀ-ÖØ-öø-ÿ])/g, '$1 $2');
  t = t.replace(/([A-Za-zÀ-ÖØ-öø-ÿ])-([A-Za-zÀ-ÖØ-öø-ÿ])/g, '$1 $2');

  // Dashes and brackets are typography, not speech. Keep . , ! ? ; :
  t = t.replace(/[—–]/g, ', ');
  t = t.replace(/[()[\]{}<>*_~`|\\/]/g, ' ');

  t = t.replace(/\s+([.,!?;:])/g, '$1');
  t = t.replace(/,\s*,/g, ',');
  t = t.replace(/\s+/g, ' ').trim();

  return t;
}

/**
 * Split prepared prose into utterances. Sentence-sized, with very long
 * sentences broken at a clause boundary so that no single utterance runs long
 * enough to make pausing feel unresponsive.
 */
export function splitSentences(text: string, maxWords = 34): string[] {
  const prepared = text.trim();
  if (!prepared) return [];

  const sentences = prepared
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const out: string[] = [];
  for (const sentence of sentences) {
    if (sentence.split(/\s+/).length <= maxWords) {
      out.push(sentence);
      continue;
    }
    // Too long: break on commas/semicolons, never mid-clause.
    const parts = sentence.split(/(?<=[,;:])\s+/);
    let buffer = '';
    for (const part of parts) {
      const candidate = buffer ? `${buffer} ${part}` : part;
      if (candidate.split(/\s+/).length > maxWords && buffer) {
        out.push(buffer);
        buffer = part;
      } else {
        buffer = candidate;
      }
    }
    if (buffer) out.push(buffer);
  }

  return out;
}

/**
 * Cut one sentence into clips short enough for a URL-based voice.
 *
 * Each clip is a separate piece of audio, so a boundary in the middle of a
 * clause is audible as a stumble. Prefer a sentence end, then a clause end,
 * then any space, and only fall back to a hard cut.
 */
export function chunkForUrl(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text];

  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxLen) {
      chunks.push(remaining);
      break;
    }
    let splitAt = -1;
    for (const mark of ['. ', '! ', '? ', '; ', ', ']) {
      const at = remaining.lastIndexOf(mark, maxLen);
      if (at > splitAt) splitAt = at;
    }
    if (splitAt === -1 || splitAt < maxLen / 2) splitAt = remaining.lastIndexOf(' ', maxLen);
    if (splitAt === -1) splitAt = maxLen;

    chunks.push(remaining.substring(0, splitAt + 1).trim());
    remaining = remaining.substring(splitAt + 1).trim();
  }

  return chunks.filter(Boolean);
}

/** Comparison key for "have we already said this?". */
export function speechKey(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
