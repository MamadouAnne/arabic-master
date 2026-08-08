// Localize study-group goal strings. Goals are stored as free English text
// (from templates or user input) and have no per-language field, so we map the
// known template/seed goals to French and normalize the cadence suffix for the
// rest. Non-French languages return the goal unchanged.

const GOAL_MAP_FR: Record<string, string> = {
  'Memorize 1 surah/week': 'Mémoriser 1 sourate/semaine',
  'Complete 2 lessons/week': 'Compléter 2 leçons/semaine',
  'Master 1 rule/week': 'Maîtriser 1 règle/semaine',
  '1 page/day': '1 page/jour',
  '5 words/day': '5 mots/jour',
  'Complete prayer guide': 'Terminer le guide de prière',
};

export function localizeGoal(goal: string | undefined | null, language: string): string {
  if (!goal || language !== 'fr') return goal || '';
  if (GOAL_MAP_FR[goal]) return GOAL_MAP_FR[goal];
  // Fallback: translate the cadence suffix so custom goals aren't half-English.
  return goal
    .replace(/\/\s*weeks?\b/gi, '/semaine')
    .replace(/\/\s*days?\b/gi, '/jour')
    .replace(/\/\s*months?\b/gi, '/mois')
    .replace(/\bper week\b/gi, 'par semaine')
    .replace(/\bper day\b/gi, 'par jour')
    .replace(/\bper month\b/gi, 'par mois');
}
