// Localize study-group goal strings. Goals are stored as free English text
// (from templates or user input) and have no per-language field, so we map the
// known template/seed goals to French, and for anything else translate the
// common goal words + cadence so they aren't half-English. Non-French returns
// the goal unchanged.

const GOAL_MAP_FR: Record<string, string> = {
  'Memorize 1 surah/week': 'Mémoriser 1 sourate/semaine',
  'Complete 2 lessons/week': 'Compléter 2 leçons/semaine',
  'Master 1 rule/week': 'Maîtriser 1 règle/semaine',
  '1 page/day': '1 page/jour',
  '5 words/day': '5 mots/jour',
  'Complete prayer guide': 'Terminer le guide de prière',
};

// Word-level fallback (applied in order; plurals before singulars).
const WORD_MAP_FR: [RegExp, string][] = [
  [/\bMemorize\b/gi, 'Mémoriser'],
  [/\bComplete\b/gi, 'Terminer'],
  [/\bMaster\b/gi, 'Maîtriser'],
  [/\bLearn\b/gi, 'Apprendre'],
  [/\bReview\b/gi, 'Réviser'],
  [/\bPractice\b/gi, 'Pratiquer'],
  [/\bsurahs\b/gi, 'sourates'],
  [/\bsurah\b/gi, 'sourate'],
  [/\blessons\b/gi, 'leçons'],
  [/\blesson\b/gi, 'leçon'],
  [/\brules\b/gi, 'règles'],
  [/\brule\b/gi, 'règle'],
  [/\bwords\b/gi, 'mots'],
  [/\bword\b/gi, 'mot'],
  [/\bpages\b/gi, 'pages'],
  [/\bpage\b/gi, 'page'],
  [/\bverbs\b/gi, 'verbes'],
  [/\bverb\b/gi, 'verbe'],
  [/\bprayer\b/gi, 'prière'],
  [/\/\s*weeks?\b/gi, '/semaine'],
  [/\/\s*days?\b/gi, '/jour'],
  [/\/\s*months?\b/gi, '/mois'],
  [/\bper week\b/gi, 'par semaine'],
  [/\bper day\b/gi, 'par jour'],
  [/\bper month\b/gi, 'par mois'],
];

export function localizeGoal(goal: string | undefined | null, language: string): string {
  if (!goal || language !== 'fr') return goal || '';
  if (GOAL_MAP_FR[goal]) return GOAL_MAP_FR[goal];
  let out = goal;
  for (const [re, fr] of WORD_MAP_FR) out = out.replace(re, fr);
  return out;
}
