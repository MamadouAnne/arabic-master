import { Exercise } from '../../../types/arabic';
import alphabetExercises from './alphabetExercises';
import vocabularyExercises from './vocabularyExercises';
import grammarExercises from './grammarExercises';
import verbExercises from './verbExercises';
import { grammarExercises2 } from './grammarExercises2';
import { grammarExercises3 } from './grammarExercises3';
import { additionalVerbExercises } from './additionalVerbExercises';

// Combine all exercises
export const exercises: Exercise[] = [
  ...alphabetExercises,
  ...vocabularyExercises,
  ...grammarExercises,
  ...grammarExercises2,
  ...grammarExercises3,
  ...verbExercises,
  ...additionalVerbExercises,
];

// Helper functions
export const getExerciseById = (id: string): Exercise | undefined => {
  return exercises.find(ex => ex.id === id);
};

export const getExercisesByModule = (moduleType: Exercise['moduleType']): Exercise[] => {
  return exercises.filter(ex => ex.moduleType === moduleType);
};

export const getExercisesByLevel = (level: 'beginner' | 'intermediate' | 'advanced'): Exercise[] => {
  return exercises.filter(ex => ex.level === level);
};

export const getExercisesByType = (type: Exercise['type']): Exercise[] => {
  return exercises.filter(ex => ex.type === type);
};

export const getExercisesByModuleAndLevel = (
  moduleType: Exercise['moduleType'],
  level: 'beginner' | 'intermediate' | 'advanced'
): Exercise[] => {
  return exercises.filter(ex => ex.moduleType === moduleType && ex.level === level);
};

export const getRandomExercises = (
  count: number,
  options?: {
    level?: 'beginner' | 'intermediate' | 'advanced';
    moduleType?: Exercise['moduleType'];
    type?: Exercise['type'];
  }
): Exercise[] => {
  let pool = [...exercises];

  if (options?.level) {
    pool = pool.filter(ex => ex.level === options.level);
  }
  if (options?.moduleType) {
    pool = pool.filter(ex => ex.moduleType === options.moduleType);
  }
  if (options?.type) {
    pool = pool.filter(ex => ex.type === options.type);
  }

  const shuffled = pool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

// Get exercise counts by module
export const getExerciseCountByModule = (): Record<string, number> => {
  const counts: Record<string, number> = {};
  exercises.forEach(ex => {
    counts[ex.moduleType] = (counts[ex.moduleType] || 0) + 1;
  });
  return counts;
};

// Get exercises for a specific grammar lesson
export const getExercisesForGrammarLesson = (lessonId: string): Exercise[] => {
  // Map lesson IDs to related exercises (including writing exercises)
  const lessonExerciseMap: Record<string, string[]> = {
    'grammar-1': [
      'ex-grammar-1-1', 'ex-grammar-1-2', 'ex-grammar-1-3', 'ex-grammar-1-4', 'ex-grammar-1-5',
      'ex-grammar-1-6', 'ex-grammar-1-7', 'ex-grammar-1-8', 'ex-grammar-1-9', 'ex-grammar-1-10',
      // Writing exercises (12)
      'ex-grammar-1-11', 'ex-grammar-1-12', 'ex-grammar-1-13', 'ex-grammar-1-14', 'ex-grammar-1-15',
      'ex-grammar-1-16', 'ex-grammar-1-17', 'ex-grammar-1-18', 'ex-grammar-1-19', 'ex-grammar-1-20',
      'ex-grammar-1-21', 'ex-grammar-1-22'
    ],
    'grammar-2': [
      'ex-grammar-2-1', 'ex-grammar-2-2', 'ex-grammar-2-3', 'ex-grammar-2-4', 'ex-grammar-2-5',
      'ex-grammar-2-6', 'ex-grammar-2-7', 'ex-grammar-2-8', 'ex-grammar-2-9', 'ex-grammar-2-10',
      // Writing exercises (12)
      'ex-grammar-2-11', 'ex-grammar-2-12', 'ex-grammar-2-13', 'ex-grammar-2-14', 'ex-grammar-2-15',
      'ex-grammar-2-16', 'ex-grammar-2-17', 'ex-grammar-2-18', 'ex-grammar-2-19', 'ex-grammar-2-20',
      'ex-grammar-2-21', 'ex-grammar-2-22'
    ],
    'grammar-3': [
      'ex-grammar-3-1', 'ex-grammar-3-2', 'ex-grammar-3-3', 'ex-grammar-3-4', 'ex-grammar-3-5',
      'ex-grammar-3-6', 'ex-grammar-3-7', 'ex-grammar-3-8', 'ex-grammar-3-9', 'ex-grammar-3-10',
      // Writing exercises (12)
      'ex-grammar-3-11', 'ex-grammar-3-12', 'ex-grammar-3-13', 'ex-grammar-3-14', 'ex-grammar-3-15',
      'ex-grammar-3-16', 'ex-grammar-3-17', 'ex-grammar-3-18', 'ex-grammar-3-19', 'ex-grammar-3-20',
      'ex-grammar-3-21', 'ex-grammar-3-22'
    ],
    'grammar-4': [
      'ex-grammar-4-1', 'ex-grammar-4-2', 'ex-grammar-4-3', 'ex-grammar-4-4', 'ex-grammar-4-5',
      'ex-grammar-4-6', 'ex-grammar-4-7', 'ex-grammar-4-8', 'ex-grammar-4-9', 'ex-grammar-4-10',
      // Writing exercises (12)
      'ex-grammar-4-11', 'ex-grammar-4-12', 'ex-grammar-4-13', 'ex-grammar-4-14', 'ex-grammar-4-15',
      'ex-grammar-4-16', 'ex-grammar-4-17', 'ex-grammar-4-18', 'ex-grammar-4-19', 'ex-grammar-4-20',
      'ex-grammar-4-21', 'ex-grammar-4-22'
    ],
    'grammar-5': [
      'ex-grammar-5-1', 'ex-grammar-5-2', 'ex-grammar-5-3', 'ex-grammar-5-4', 'ex-grammar-5-5',
      'ex-grammar-5-6', 'ex-grammar-5-7', 'ex-grammar-5-8', 'ex-grammar-5-9', 'ex-grammar-5-10',
      // Writing exercises (12)
      'ex-grammar-5-11', 'ex-grammar-5-12', 'ex-grammar-5-13', 'ex-grammar-5-14', 'ex-grammar-5-15',
      'ex-grammar-5-16', 'ex-grammar-5-17', 'ex-grammar-5-18', 'ex-grammar-5-19', 'ex-grammar-5-20',
      'ex-grammar-5-21', 'ex-grammar-5-22'
    ],
    'grammar-6': [
      'ex-grammar-6-1', 'ex-grammar-6-2', 'ex-grammar-6-3', 'ex-grammar-6-4', 'ex-grammar-6-5',
      'ex-grammar-6-6', 'ex-grammar-6-7', 'ex-grammar-6-8', 'ex-grammar-6-9', 'ex-grammar-6-10',
      // Writing exercises (12)
      'ex-grammar-6-11', 'ex-grammar-6-12', 'ex-grammar-6-13', 'ex-grammar-6-14', 'ex-grammar-6-15',
      'ex-grammar-6-16', 'ex-grammar-6-17', 'ex-grammar-6-18', 'ex-grammar-6-19', 'ex-grammar-6-20',
      'ex-grammar-6-21', 'ex-grammar-6-22'
    ],
    'grammar-7': [
      'ex-grammar-7-1', 'ex-grammar-7-2', 'ex-grammar-7-3', 'ex-grammar-7-4', 'ex-grammar-7-5',
      'ex-grammar-7-6', 'ex-grammar-7-7', 'ex-grammar-7-8', 'ex-grammar-7-9', 'ex-grammar-7-10',
      // Writing exercises (12)
      'ex-grammar-7-11', 'ex-grammar-7-12', 'ex-grammar-7-13', 'ex-grammar-7-14', 'ex-grammar-7-15',
      'ex-grammar-7-16', 'ex-grammar-7-17', 'ex-grammar-7-18', 'ex-grammar-7-19', 'ex-grammar-7-20',
      'ex-grammar-7-21', 'ex-grammar-7-22'
    ],
    'grammar-8': [
      'ex-grammar-8-1', 'ex-grammar-8-2', 'ex-grammar-8-3', 'ex-grammar-8-4', 'ex-grammar-8-5',
      'ex-grammar-8-6', 'ex-grammar-8-7', 'ex-grammar-8-8', 'ex-grammar-8-9', 'ex-grammar-8-10',
      // Writing exercises (12)
      'ex-grammar-8-11', 'ex-grammar-8-12', 'ex-grammar-8-13', 'ex-grammar-8-14', 'ex-grammar-8-15',
      'ex-grammar-8-16', 'ex-grammar-8-17', 'ex-grammar-8-18', 'ex-grammar-8-19', 'ex-grammar-8-20',
      'ex-grammar-8-21', 'ex-grammar-8-22'
    ],
    'grammar-9': [
      'ex-grammar-9-1', 'ex-grammar-9-2', 'ex-grammar-9-3', 'ex-grammar-9-4', 'ex-grammar-9-5',
      'ex-grammar-9-6', 'ex-grammar-9-7', 'ex-grammar-9-8', 'ex-grammar-9-9', 'ex-grammar-9-10',
      // Writing exercises (12)
      'ex-grammar-9-11', 'ex-grammar-9-12', 'ex-grammar-9-13', 'ex-grammar-9-14', 'ex-grammar-9-15',
      'ex-grammar-9-16', 'ex-grammar-9-17', 'ex-grammar-9-18', 'ex-grammar-9-19', 'ex-grammar-9-20',
      'ex-grammar-9-21', 'ex-grammar-9-22'
    ],
    'grammar-10': [
      'ex-grammar-10-1', 'ex-grammar-10-2', 'ex-grammar-10-3', 'ex-grammar-10-4', 'ex-grammar-10-5',
      'ex-grammar-10-6', 'ex-grammar-10-7', 'ex-grammar-10-8', 'ex-grammar-10-9', 'ex-grammar-10-10',
      'ex-grammar-10-11', 'ex-grammar-10-12',
      // Writing exercises (12)
      'ex-grammar-10-13', 'ex-grammar-10-14', 'ex-grammar-10-15', 'ex-grammar-10-16', 'ex-grammar-10-17',
      'ex-grammar-10-18', 'ex-grammar-10-19', 'ex-grammar-10-20', 'ex-grammar-10-21', 'ex-grammar-10-22',
      'ex-grammar-10-23', 'ex-grammar-10-24'
    ],
    'grammar-11': [
      'ex-grammar-11-1', 'ex-grammar-11-2', 'ex-grammar-11-3', 'ex-grammar-11-4', 'ex-grammar-11-5',
      'ex-grammar-11-6', 'ex-grammar-11-7', 'ex-grammar-11-8', 'ex-grammar-11-9', 'ex-grammar-11-10',
      'ex-grammar-11-11', 'ex-grammar-11-12',
      // Writing exercises (12)
      'ex-grammar-11-13', 'ex-grammar-11-14', 'ex-grammar-11-15', 'ex-grammar-11-16', 'ex-grammar-11-17',
      'ex-grammar-11-18', 'ex-grammar-11-19', 'ex-grammar-11-20', 'ex-grammar-11-21', 'ex-grammar-11-22',
      'ex-grammar-11-23', 'ex-grammar-11-24'
    ],
    'grammar-12': [
      'ex-grammar-12-1', 'ex-grammar-12-2', 'ex-grammar-12-3', 'ex-grammar-12-4', 'ex-grammar-12-5',
      'ex-grammar-12-6', 'ex-grammar-12-7', 'ex-grammar-12-8',
      // Writing exercises
      'ex-grammar-12-9', 'ex-grammar-12-10', 'ex-grammar-12-11', 'ex-grammar-12-12', 'ex-grammar-12-13',
      'ex-grammar-12-14', 'ex-grammar-12-15', 'ex-grammar-12-16', 'ex-grammar-12-17', 'ex-grammar-12-18'
    ],
    'grammar-13': [
      'ex-grammar-13-1', 'ex-grammar-13-2', 'ex-grammar-13-3', 'ex-grammar-13-4', 'ex-grammar-13-5',
      'ex-grammar-13-6',
      // Writing exercises
      'ex-grammar-13-7', 'ex-grammar-13-8', 'ex-grammar-13-9', 'ex-grammar-13-10', 'ex-grammar-13-11',
      'ex-grammar-13-12', 'ex-grammar-13-13', 'ex-grammar-13-14', 'ex-grammar-13-15', 'ex-grammar-13-16'
    ],
    'grammar-14': [
      'ex-grammar-14-1', 'ex-grammar-14-2', 'ex-grammar-14-3', 'ex-grammar-14-4', 'ex-grammar-14-5',
      'ex-grammar-14-6', 'ex-grammar-14-7', 'ex-grammar-14-8',
      // Writing exercises
      'ex-grammar-14-9', 'ex-grammar-14-10', 'ex-grammar-14-11', 'ex-grammar-14-12', 'ex-grammar-14-13',
      'ex-grammar-14-14', 'ex-grammar-14-15', 'ex-grammar-14-16', 'ex-grammar-14-17', 'ex-grammar-14-18'
    ],
    'grammar-15': [
      'ex-grammar-15-1', 'ex-grammar-15-2', 'ex-grammar-15-3', 'ex-grammar-15-4', 'ex-grammar-15-5',
      'ex-grammar-15-6', 'ex-grammar-15-7', 'ex-grammar-15-8',
      // Writing exercises
      'ex-grammar-15-9', 'ex-grammar-15-10', 'ex-grammar-15-11', 'ex-grammar-15-12', 'ex-grammar-15-13',
      'ex-grammar-15-14', 'ex-grammar-15-15', 'ex-grammar-15-16', 'ex-grammar-15-17', 'ex-grammar-15-18'
    ],
    'grammar-16': [
      'ex-grammar-16-1', 'ex-grammar-16-2', 'ex-grammar-16-3', 'ex-grammar-16-4', 'ex-grammar-16-5',
      'ex-grammar-16-6', 'ex-grammar-16-7', 'ex-grammar-16-8',
      // Writing exercises
      'ex-grammar-16-9', 'ex-grammar-16-10', 'ex-grammar-16-11', 'ex-grammar-16-12', 'ex-grammar-16-13',
      'ex-grammar-16-14', 'ex-grammar-16-15', 'ex-grammar-16-16', 'ex-grammar-16-17', 'ex-grammar-16-18'
    ],
    'grammar-17': [
      'ex-grammar-17-1', 'ex-grammar-17-2', 'ex-grammar-17-3', 'ex-grammar-17-4', 'ex-grammar-17-5',
      'ex-grammar-17-6', 'ex-grammar-17-7', 'ex-grammar-17-8',
      // Writing exercises
      'ex-grammar-17-9', 'ex-grammar-17-10', 'ex-grammar-17-11', 'ex-grammar-17-12', 'ex-grammar-17-13',
      'ex-grammar-17-14', 'ex-grammar-17-15', 'ex-grammar-17-16', 'ex-grammar-17-17', 'ex-grammar-17-18'
    ],
    'grammar-18': [
      'ex-grammar-18-1', 'ex-grammar-18-2', 'ex-grammar-18-3', 'ex-grammar-18-4', 'ex-grammar-18-5',
      'ex-grammar-18-6', 'ex-grammar-18-7', 'ex-grammar-18-8',
      // Writing exercises
      'ex-grammar-18-9', 'ex-grammar-18-10', 'ex-grammar-18-11', 'ex-grammar-18-12', 'ex-grammar-18-13',
      'ex-grammar-18-14', 'ex-grammar-18-15', 'ex-grammar-18-16', 'ex-grammar-18-17', 'ex-grammar-18-18'
    ],
    'grammar-19': [
      'ex-grammar-19-1', 'ex-grammar-19-2', 'ex-grammar-19-3', 'ex-grammar-19-4', 'ex-grammar-19-5',
      'ex-grammar-19-6', 'ex-grammar-19-7', 'ex-grammar-19-8',
      // Writing exercises
      'ex-grammar-19-9', 'ex-grammar-19-10', 'ex-grammar-19-11', 'ex-grammar-19-12', 'ex-grammar-19-13',
      'ex-grammar-19-14', 'ex-grammar-19-15', 'ex-grammar-19-16', 'ex-grammar-19-17', 'ex-grammar-19-18'
    ],
    'grammar-20': [
      'ex-grammar-20-1', 'ex-grammar-20-2', 'ex-grammar-20-3', 'ex-grammar-20-4', 'ex-grammar-20-5',
      'ex-grammar-20-6', 'ex-grammar-20-7', 'ex-grammar-20-8',
      // Writing exercises
      'ex-grammar-20-9', 'ex-grammar-20-10', 'ex-grammar-20-11', 'ex-grammar-20-12', 'ex-grammar-20-13',
      'ex-grammar-20-14', 'ex-grammar-20-15', 'ex-grammar-20-16', 'ex-grammar-20-17', 'ex-grammar-20-18'
    ],
    // Lessons 21-40 (5 exercises each)
    'grammar-21': ['ex-grammar-21-1', 'ex-grammar-21-2', 'ex-grammar-21-3', 'ex-grammar-21-4', 'ex-grammar-21-5'],
    'grammar-22': ['ex-grammar-22-1', 'ex-grammar-22-2', 'ex-grammar-22-3', 'ex-grammar-22-4', 'ex-grammar-22-5'],
    'grammar-23': ['ex-grammar-23-1', 'ex-grammar-23-2', 'ex-grammar-23-3', 'ex-grammar-23-4', 'ex-grammar-23-5'],
    'grammar-24': ['ex-grammar-24-1', 'ex-grammar-24-2', 'ex-grammar-24-3', 'ex-grammar-24-4', 'ex-grammar-24-5'],
    'grammar-25': ['ex-grammar-25-1', 'ex-grammar-25-2', 'ex-grammar-25-3', 'ex-grammar-25-4', 'ex-grammar-25-5'],
    'grammar-26': ['ex-grammar-26-1', 'ex-grammar-26-2', 'ex-grammar-26-3', 'ex-grammar-26-4', 'ex-grammar-26-5'],
    'grammar-27': ['ex-grammar-27-1', 'ex-grammar-27-2', 'ex-grammar-27-3', 'ex-grammar-27-4', 'ex-grammar-27-5'],
    'grammar-28': ['ex-grammar-28-1', 'ex-grammar-28-2', 'ex-grammar-28-3', 'ex-grammar-28-4', 'ex-grammar-28-5'],
    'grammar-29': ['ex-grammar-29-1', 'ex-grammar-29-2', 'ex-grammar-29-3', 'ex-grammar-29-4', 'ex-grammar-29-5'],
    'grammar-30': ['ex-grammar-30-1', 'ex-grammar-30-2', 'ex-grammar-30-3', 'ex-grammar-30-4', 'ex-grammar-30-5'],
    'grammar-31': ['ex-grammar-31-1', 'ex-grammar-31-2', 'ex-grammar-31-3', 'ex-grammar-31-4', 'ex-grammar-31-5'],
    'grammar-32': ['ex-grammar-32-1', 'ex-grammar-32-2', 'ex-grammar-32-3', 'ex-grammar-32-4', 'ex-grammar-32-5'],
    'grammar-33': ['ex-grammar-33-1', 'ex-grammar-33-2', 'ex-grammar-33-3', 'ex-grammar-33-4', 'ex-grammar-33-5'],
    'grammar-34': ['ex-grammar-34-1', 'ex-grammar-34-2', 'ex-grammar-34-3', 'ex-grammar-34-4', 'ex-grammar-34-5'],
    'grammar-35': ['ex-grammar-35-1', 'ex-grammar-35-2', 'ex-grammar-35-3', 'ex-grammar-35-4', 'ex-grammar-35-5'],
    'grammar-36': ['ex-grammar-36-1', 'ex-grammar-36-2', 'ex-grammar-36-3', 'ex-grammar-36-4', 'ex-grammar-36-5'],
    'grammar-37': ['ex-grammar-37-1', 'ex-grammar-37-2', 'ex-grammar-37-3', 'ex-grammar-37-4', 'ex-grammar-37-5'],
    'grammar-38': ['ex-grammar-38-1', 'ex-grammar-38-2', 'ex-grammar-38-3', 'ex-grammar-38-4', 'ex-grammar-38-5'],
    'grammar-39': ['ex-grammar-39-1', 'ex-grammar-39-2', 'ex-grammar-39-3', 'ex-grammar-39-4', 'ex-grammar-39-5'],
    'grammar-40': ['ex-grammar-40-1', 'ex-grammar-40-2', 'ex-grammar-40-3', 'ex-grammar-40-4', 'ex-grammar-40-5'],
    'grammar-indefinite': ['ex-grammar-indefinite-1', 'ex-grammar-indefinite-2', 'ex-grammar-indefinite-3', 'ex-grammar-indefinite-4'],
    'grammar-kana': ['ex-grammar-kana-1', 'ex-grammar-kana-2', 'ex-grammar-kana-3', 'ex-grammar-kana-4'],
    'grammar-inna': ['ex-grammar-inna-1', 'ex-grammar-inna-2', 'ex-grammar-inna-3', 'ex-grammar-inna-4'],
    'grammar-weak-verbs': ['ex-grammar-weak-verbs-1', 'ex-grammar-weak-verbs-2', 'ex-grammar-weak-verbs-3', 'ex-grammar-weak-verbs-4'],
    'grammar-hal': ['ex-grammar-hal-1', 'ex-grammar-hal-2', 'ex-grammar-hal-3', 'ex-grammar-hal-4'],
    'grammar-tamyiz': ['ex-grammar-tamyiz-1', 'ex-grammar-tamyiz-2', 'ex-grammar-tamyiz-3', 'ex-grammar-tamyiz-4'],
    'grammar-five-nouns': ['ex-grammar-five-nouns-1', 'ex-grammar-five-nouns-2', 'ex-grammar-five-nouns-3', 'ex-grammar-five-nouns-4'],
    'grammar-diptote': ['ex-grammar-diptote-1', 'ex-grammar-diptote-2', 'ex-grammar-diptote-3', 'ex-grammar-diptote-4'],
    // Verb conjugation lessons (rendered through the grammar lesson screen)
    'verb-lesson-1': ['ex-verb-conj-1', 'ex-verb-conj-2', 'ex-verb-conj-3'],
    'verb-lesson-2': ['ex-verb-past-1', 'ex-verb-past-2', 'ex-verb-past-3', 'ex-verb-past-4', 'ex-verb-past-5'],
    'verb-lesson-3': ['ex-verb-present-1', 'ex-verb-present-2', 'ex-verb-present-3', 'ex-verb-present-4', 'ex-verb-present-5'],
    'verb-lesson-4': ['ex-verb-future-1', 'ex-verb-future-2', 'ex-verb-future-3', 'ex-verb-future-4'],
    'verb-lesson-5': ['ex-verb-imp-1', 'ex-verb-imp-2', 'ex-verb-imp-3'],
    'verb-lesson-6': ['ex-verb-mean-1', 'ex-verb-mean-2', 'ex-verb-mean-3', 'ex-verb-mean-4', 'ex-verb-fill-1', 'ex-verb-fill-2', 'ex-verb-fill-3'],
    'verb-lesson-7': ['ex-verb-l7-1', 'ex-verb-l7-2', 'ex-verb-l7-3', 'ex-verb-l7-4'],
    'verb-lesson-8': ['ex-verb-l8-1', 'ex-verb-l8-2', 'ex-verb-l8-3', 'ex-verb-l8-4'],
    'verb-lesson-9': ['ex-verb-l9-1', 'ex-verb-l9-2', 'ex-verb-l9-3', 'ex-verb-l9-4'],
    'verb-lesson-10': ['ex-verb-l10-1', 'ex-verb-l10-2', 'ex-verb-l10-3', 'ex-verb-l10-4'],
    'verb-lesson-11': ['ex-verb-l11-1', 'ex-verb-l11-2', 'ex-verb-l11-3', 'ex-verb-l11-4'],
    'verb-lesson-12': ['ex-verb-l12-1', 'ex-verb-l12-2', 'ex-verb-l12-3', 'ex-verb-l12-4'],
    'verb-lesson-13': ['ex-verb-l13-1', 'ex-verb-l13-2', 'ex-verb-l13-3', 'ex-verb-l13-4'],
  };

  const exerciseIds = lessonExerciseMap[lessonId] || [];
  return exercises.filter(ex => exerciseIds.includes(ex.id));
};

// Get exercises for a specific vocabulary theme
export const getExercisesForVocabularyTheme = (themeId: string): Exercise[] => {
  // Map theme IDs to exercise ID prefixes
  const themePrefixMap: Record<string, string> = {
    'greetings': 'ex-vocab-greet',
    'numbers': 'ex-vocab-num',
    'family': 'ex-vocab-fam',
    'colors': 'ex-vocab-color',
    'food': 'ex-vocab-food',
    'body': 'ex-vocab-body',
    'animals': 'ex-vocab-animal',
    'time': 'ex-vocab-time',
    'places': 'ex-vocab-place',
    'objects': 'ex-vocab-obj',
  };

  const prefix = themePrefixMap[themeId];
  if (!prefix) return [];

  return exercises.filter(ex =>
    ex.moduleType === 'vocabulary' && ex.id.startsWith(prefix)
  );
};

// Get writing exercises for a specific vocabulary theme
export const getWritingExercisesForVocabularyTheme = (themeId: string): Exercise[] => {
  const themeExercises = getExercisesForVocabularyTheme(themeId);
  return themeExercises.filter(ex => ex.type === 'writing');
};

// Get quiz exercises (non-writing) for a specific vocabulary theme
export const getQuizExercisesForVocabularyTheme = (themeId: string): Exercise[] => {
  const themeExercises = getExercisesForVocabularyTheme(themeId);
  return themeExercises.filter(ex => ex.type !== 'writing');
};

// Export individual modules for direct access
export { alphabetExercises } from './alphabetExercises';
export { vocabularyExercises } from './vocabularyExercises';
export { grammarExercises } from './grammarExercises';
export { verbExercises } from './verbExercises';
export { grammarExercises2 } from './grammarExercises2';
