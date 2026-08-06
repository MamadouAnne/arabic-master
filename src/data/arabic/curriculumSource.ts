// Bridges the app's curated Arabic curriculum (grammar lessons + vocabulary
// themes) to the AI course generator, so AI boards are grounded in our own
// designed content instead of invented from scratch.

import { grammarLessons } from './grammar';
import { vocabularyThemes, getWordsByTheme } from './vocabulary';

export interface CurriculumItem {
  id: string;             // prefixed: "g:<lessonId>" or "v:<themeId>"
  title: string;
  subtitle?: string;
  level: string;
  kind: 'grammar' | 'vocabulary';
}

const pick = (en: any, fr: any, lang: string): string => {
  const v = lang === 'fr' ? (fr || en) : en;
  return typeof v === 'string' ? v : '';
};

/** All pickable curriculum entries (grammar lessons first, then vocab themes). */
export function listCurriculum(lang: string): CurriculumItem[] {
  const grammar: CurriculumItem[] = [...grammarLessons]
    .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
    .map((l: any) => ({
      id: `g:${l.id}`,
      title: pick(l.title, l.titleFr, lang) || l.title,
      subtitle: pick(l.description, l.descriptionFr, lang) || undefined,
      level: l.level || 'beginner',
      kind: 'grammar' as const,
    }));

  const vocab: CurriculumItem[] = [...vocabularyThemes]
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((t) => ({
      id: `v:${t.id}`,
      title: `${pick(t.name, t.nameFr, lang) || t.name} (vocabulary)`,
      subtitle: pick(t.description, t.descriptionFr, lang) || undefined,
      level: t.level || 'beginner',
      kind: 'vocabulary' as const,
    }));

  return [...grammar, ...vocab];
}

/** Plain-title (without the "(vocabulary)" suffix) for a curriculum id. */
export function curriculumTitle(id: string, lang: string): string {
  const item = listCurriculum(lang).find((c) => c.id === id);
  if (!item) return 'lesson';
  return item.title.replace(/\s*\(vocabulary\)$/, '');
}

/** A compact text digest of the selected lesson, used as AI source material. */
export function getCurriculumDigest(id: string, lang: string): string {
  const [kind, rawId] = id.split(':');
  if (kind === 'v') return vocabDigest(rawId, lang);
  return grammarDigest(rawId, lang);
}

function grammarDigest(lessonId: string, lang: string): string {
  const lesson: any = grammarLessons.find((l: any) => l.id === lessonId);
  if (!lesson) return '';
  const out: string[] = [];
  out.push(`Lesson: ${pick(lesson.title, lesson.titleFr, lang) || lesson.title} — ${lesson.titleArabic || ''}`);
  if (lesson.description) out.push(pick(lesson.description, lesson.descriptionFr, lang));

  for (const b of lesson.content || []) {
    const text = pick(b.content, b.contentFr, lang);
    if (text) out.push(`• ${text}`);
    if (b.arabicDescription) out.push(`  ${b.arabicDescription} — ${pick(b.arabicTranslation, b.arabicTranslationFr, lang)}`);
    if (Array.isArray(b.examples)) {
      for (const e of b.examples) out.push(`  ${e.arabic} — ${pick(e.english, e.french, lang)}${e.transliteration ? ` (${e.transliteration})` : ''}`);
    }
    if (Array.isArray(b.comparisons)) {
      for (const c of b.comparisons) out.push(`  ${c.left?.arabic} (${pick(c.left?.label, c.left?.labelFr, lang)}) -> ${c.right?.arabic} (${pick(c.right?.label, c.right?.labelFr, lang)})`);
    }
    if (Array.isArray(b.letters)) out.push(`  Letters: ${b.letters.join(' ')}`);
    if (Array.isArray(b.rows)) {
      for (const r of b.rows) out.push(`  ${Array.isArray(r) ? r.join(' | ') : JSON.stringify(r)}`);
    }
  }
  return out.join('\n').slice(0, 2200);
}

function vocabDigest(themeId: string, lang: string): string {
  const theme = vocabularyThemes.find((t) => t.id === themeId);
  if (!theme) return '';
  const words = getWordsByTheme(themeId).slice(0, 40);
  const out: string[] = [];
  out.push(`Vocabulary theme: ${pick(theme.name, theme.nameFr, lang) || theme.name} — ${theme.nameArabic || ''}`);
  if (theme.description) out.push(pick(theme.description, theme.descriptionFr, lang));
  for (const w of words) {
    out.push(`  ${w.arabicWithVowels || w.arabic} (${w.transliteration}) — ${pick(w.english, w.french, lang)}`);
  }
  return out.join('\n').slice(0, 2200);
}
