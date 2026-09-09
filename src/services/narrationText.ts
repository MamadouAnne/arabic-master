/**
 * Turning story prose into something a speech engine reads well.
 *
 * Two jobs, kept apart from the audio service so they can be reasoned about
 * on their own:
 *
 *   1. `prepareForSpeech` — spell names the way they should sound. Left as
 *      written, engines say "Allah" with a flat English 'a' and read "ﷺ" as
 *      nothing at all. These substitutions are deliberate and were tuned by
 *      ear; they are not general-purpose transliteration.
 *   2. `splitSentences` — cut a paragraph into utterances. Short utterances
 *      are what make pause, skip and highlight feel immediate, and they keep
 *      the cost of an interrupted sentence to a single sentence.
 */
export type NarrationLang = 'en' | 'fr';

const HONORIFIC = /ﷺ|صلى الله عليه وسلم/g;

/** Sound-alike spellings for English voices. Order matters: longest first. */
const EN_PHONETIC: Array<[RegExp, string]> = [
  [/\bAllah's\b/g, 'Ollahs'],
  [/\bAllah\b/g, 'Ollah'],
  [/\bIblis\b/gi, 'Iblees'],
  [/\bkhalifah\b/gi, 'khaleefah'],
  [/\bQuran\b/gi, 'Quraan'],
  [/\bSurah\b/gi, 'Soorah'],
  [/\bayah\b/gi, 'aayah'],
  [/\bayat\b/gi, 'aayaat'],
  [/\bIbrahim\b/gi, 'Ibraheem'],
  [/\bIsmail\b/gi, 'Ismaeel'],
  [/\bIshaq\b/gi, 'Is-haaq'],
  [/\bYaqub\b/gi, 'Yaqoob'],
  [/\bYusuf\b/gi, 'Yoosuf'],
  [/\bYunus\b/gi, 'Yoonus'],
  [/\bYahya\b/gi, 'Yahyaa'],
  [/\bZakariya\b/gi, 'Zakariyyah'],
  [/\bMusa\b/gi, 'Moosa'],
  [/\bHarun\b/gi, 'Haaroon'],
  [/\bIsa\b/g, 'Eesa'],
  [/\bNuh\b/gi, 'Nooh'],
  [/\bHud\b/g, 'Hood'],
  [/\bSalih\b/gi, 'Saalih'],
  [/\bShu'ayb\b/gi, 'Shuayb'],
  [/\bDawud\b/gi, 'Dawood'],
  [/\bSulayman\b/gi, 'Sulaymaan'],
  [/\bAyyub\b/gi, 'Ayyoob'],
  [/\bIdris\b/gi, 'Idrees'],
  [/\bLut\b/g, 'Loot'],
  [/\bMaryam\b/gi, 'Maryam'],
  [/\bAdam\b/g, 'Aadam'],
  [/\bHawwa\b/gi, 'Hawwah'],
  [/\bshaytan\b/gi, 'shaytaan'],
  [/\bSatan\b/g, 'Shaytaan'],
  [/\bhonored\b/gi, 'honnerd'],
  [/\bhonour(ed)?\b/gi, 'honnerd'],
];

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
  if (lang === 'en') for (const [re, to] of EN_PHONETIC) t = t.replace(re, to);

  t = t.replace(ARABIC_RANGE, '');

  // Verse and hadith references read as noise mid-sentence.
  t = t.replace(/\(\s*\d+:\d+(\s*[-–]\s*\d+)?\s*\)/g, '');
  t = t.replace(/#\s*\d+/g, '');

  // Quote marks make some engines pause oddly; the prose reads fine without.
  t = t.replace(/["“”«»]/g, '');

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
