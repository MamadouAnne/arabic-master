import { VocabularyTheme, VocabularyWord } from '../../../types/arabic';
import { greetingsTheme, greetingsWords } from './themes/greetings';
import { numbersTheme, numbersWords } from './themes/numbers';
import { familyTheme, familyWords } from './themes/family';
import { colorsTheme, colorsWords } from './themes/colors';
import { foodTheme, foodWords } from './themes/food';
import { bodyTheme, bodyWords } from './themes/body';
import { animalsTheme, animalsWords } from './themes/animals';
import { timeTheme, timeWords } from './themes/time';
import { placesTheme, placesWords } from './themes/places';
import { objectsTheme, objectsWords } from './themes/objects';
import { additionalThemes, additionalWords } from './themes/additional';

// Export all themes
export const vocabularyThemes: VocabularyTheme[] = [
  greetingsTheme,
  numbersTheme,
  familyTheme,
  colorsTheme,
  foodTheme,
  bodyTheme,
  animalsTheme,
  timeTheme,
  placesTheme,
  objectsTheme,
  ...additionalThemes,
].sort((a, b) => a.order - b.order);

// Export all words
export const vocabularyWords: VocabularyWord[] = [
  ...greetingsWords,
  ...numbersWords,
  ...familyWords,
  ...colorsWords,
  ...foodWords,
  ...bodyWords,
  ...animalsWords,
  ...timeWords,
  ...placesWords,
  ...objectsWords,
  ...additionalWords,
];

// Helper functions
export const getThemeById = (id: string): VocabularyTheme | undefined => {
  return vocabularyThemes.find(theme => theme.id === id);
};

export const getWordsByTheme = (themeId: string): VocabularyWord[] => {
  return vocabularyWords
    .filter(word => word.themeId === themeId)
    .sort((a, b) => a.order - b.order);
};

export const getWordById = (id: string): VocabularyWord | undefined => {
  return vocabularyWords.find(word => word.id === id);
};

export const getThemesByLevel = (level: 'beginner' | 'intermediate' | 'advanced'): VocabularyTheme[] => {
  return vocabularyThemes.filter(theme => theme.level === level);
};

// Re-export individual themes and words
export {
  greetingsTheme,
  greetingsWords,
  numbersTheme,
  numbersWords,
  familyTheme,
  familyWords,
  colorsTheme,
  colorsWords,
  foodTheme,
  foodWords,
  bodyTheme,
  bodyWords,
  animalsTheme,
  animalsWords,
  timeTheme,
  timeWords,
  placesTheme,
  placesWords,
  objectsTheme,
  objectsWords,
};
