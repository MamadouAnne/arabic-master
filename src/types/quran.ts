// Quran Types for Iqra2.0 App
// Comprehensive types for Quran learning, Tajweed, and memorization

import { ArabicLevel } from './arabic';

// ============ Core Quran Types ============

export interface Surah {
  id: string;
  surahNumber: number;
  nameArabic: string;
  nameEnglish: string;
  nameTransliteration: string;
  meaning: string;
  meaningFr?: string;
  revelationType: 'Meccan' | 'Medinan';
  ayahCount: number;
  wordCount: number;
  difficulty: ArabicLevel;
  order: number; // Order for learning sequence
  juz: number;
  hizb: number;
}

export interface Ayah {
  id: string;
  surahId: string;
  ayahNumber: number;
  textUthmani: string; // Standard Uthmani script
  textSimple: string; // Simplified without vowels
  words: QuranWord[];
  tajweedRules: TajweedOccurrence[];
  transliteration: string;
  translation: string;
  translationFr?: string;
  audioUrl?: string;
  audioTimestamps?: WordTimestamp[];
}

export interface QuranWord {
  id: string;
  text: string;
  textWithTajweed?: string;
  transliteration: string;
  translation: string;
  position: number;
  audioTimestamp?: WordTimestamp;
}

export interface WordTimestamp {
  start: number; // milliseconds
  end: number;
}

// ============ Tajweed Types ============

export type TajweedCategory =
  | 'noon_sakinah'
  | 'meem_sakinah'
  | 'madd'
  | 'qalqalah'
  | 'ghunnah'
  | 'lam_shamsiyyah'
  | 'recitation_styles'
  | 'other';

export type TajweedRuleId =
  | 'izhar'
  | 'ikhfa'
  | 'iqlab'
  | 'idgham_with_ghunnah'
  | 'idgham_without_ghunnah'
  | 'ikhfa_shafawi'
  | 'idgham_shafawi'
  | 'izhar_shafawi'
  | 'madd_tabii'
  | 'madd_wajib'
  | 'madd_jaiz'
  | 'madd_lazim'
  | 'madd_arid'
  | 'madd_leen'
  | 'qalqalah_sughra'
  | 'qalqalah_kubra'
  | 'ghunnah'
  | 'lam_shamsiyyah'
  | 'lam_qamariyyah'
  | 'recitation_tahqiq'
  | 'recitation_tartil'
  | 'recitation_tadwir'
  | 'recitation_hadr';

export interface TajweedRule {
  id: TajweedRuleId;
  nameArabic: string;
  nameEnglish: string;
  nameFrench?: string;
  category: TajweedCategory;
  colorCode: string;
  description: string;
  descriptionFr?: string;
  descriptionArabic?: string;
  letters?: string[]; // Letters involved in the rule
  duration?: number; // Duration in harakat (for madd)
  examples: TajweedExample[];
  audioExampleUrl?: string;
}

export interface TajweedExample {
  text: string; // The phrase/excerpt showing the rule
  fullAyahText: string; // Complete ayah text (matches the audio)
  transliteration: string;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  highlightText?: string; // The specific letters demonstrating the rule
  explanation?: string;
  explanationFr?: string;
}

export interface TajweedOccurrence {
  ruleId: TajweedRuleId;
  startIndex: number; // Character index in the ayah text
  endIndex: number;
  wordIndex: number; // Which word contains this rule
}

// ============ Progress Types ============

export type MemorizationStatus = 'not_started' | 'learning' | 'reviewing' | 'memorized';
export type LearningStatus = 'not_started' | 'in_progress' | 'completed';

export interface QuranProgress {
  surahProgress: Record<string, SurahProgress>;
  tajweedProgress: TajweedProgress;
  memorizationProgress: MemorizationProgressData;
  settings: QuranSettings;
  lastStudyDate?: string;
  totalStudyTime: number; // minutes
}

export interface SurahProgress {
  surahId: string;
  status: LearningStatus;
  ayahsLearned: string[]; // Ayah IDs that have been learned
  ayahsMemorized: string[]; // Ayah IDs that have been memorized
  completionPercent: number;
  lastStudiedAt?: string;
  timeSpent: number; // minutes
  bookmarkedAyahs: string[];
}

export interface TajweedProgress {
  rulesLearned: TajweedRuleId[];
  rulesMastered: TajweedRuleId[];
  practiceCount: Record<TajweedRuleId, number>;
  accuracy: Record<TajweedRuleId, number>; // 0-100
}

export interface MemorizationProgressData {
  totalAyahsMemorized: number;
  totalSurahsMemorized: number;
  currentStreak: number;
  longestStreak: number;
  reviewSchedule: ReviewItem[];
  lastReviewDate?: string;
}

// ============ Spaced Repetition Types ============

export interface ReviewItem {
  ayahId: string;
  surahId: string;
  nextReviewDate: string;
  easeFactor: number; // SM-2 algorithm factor (default 2.5)
  interval: number; // Days until next review
  repetitions: number; // Number of successful reviews
  lastRating?: ReviewRating;
  lastReviewedAt?: string;
}

export type ReviewRating = 0 | 1 | 2 | 3 | 4 | 5;
// 0 - Complete blackout
// 1 - Incorrect; serious difficulty
// 2 - Incorrect; remembered with significant difficulty
// 3 - Correct; significant difficulty
// 4 - Correct; some hesitation
// 5 - Perfect response

export interface ReviewSession {
  id: string;
  startedAt: string;
  completedAt?: string;
  items: ReviewSessionItem[];
  totalItems: number;
  completedItems: number;
}

export interface ReviewSessionItem {
  ayahId: string;
  rating?: ReviewRating;
  timeSpent: number; // seconds
  completedAt?: string;
}

// ============ Settings Types ============

export interface QuranSettings {
  reciterId: string;
  playbackSpeed: 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75;
  repeatCount: 1 | 3 | 5 | 10 | 0; // 0 = infinite
  showTransliteration: boolean;
  showTranslation: boolean;
  showTajweedColors: boolean;
  autoAdvance: boolean;
  wordByWordMode: boolean;
  lastSelectedMethod?: string;
}

export interface Reciter {
  id: string;
  nameArabic: string;
  nameEnglish: string;
  style: 'murattal' | 'mujawwad'; // Teaching vs melodic
  audioBaseUrl: string;
  hasWordTimestamps: boolean;
}

// ============ Audio Types ============

export type PlaybackMode = 'ayah' | 'word' | 'continuous';
export type PlaybackState = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

export interface QuranPlayerState {
  currentSurahId?: string;
  currentAyahId?: string;
  currentWordIndex: number;
  playbackMode: PlaybackMode;
  playbackState: PlaybackState;
  speed: number;
  repeatCount: number;
  currentRepeat: number;
}

// ============ Learning Mode Types ============

export type LearningMode = 'learn' | 'practice' | 'test';

export interface LearnModeState {
  surahId: string;
  currentAyahIndex: number;
  phase: 'listen_full' | 'listen_word' | 'repeat' | 'complete';
  wordIndex: number;
  repetitionCount: number;
}

export interface PracticeModeState {
  surahId: string;
  currentAyahIndex: number;
  hintsUsed: number;
  selfRating?: 1 | 2 | 3 | 4 | 5;
}

export interface TestModeState {
  surahId: string;
  testType: 'fill_blank' | 'continue_from' | 'what_next';
  currentQuestion: number;
  totalQuestions: number;
  correctAnswers: number;
  answers: TestAnswer[];
}

export interface TestAnswer {
  questionId: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
}

// ============ Exercise Types for Quran ============

export type QuranExerciseType =
  | 'fill_blank'
  | 'continue_ayah'
  | 'identify_tajweed'
  | 'word_meaning'
  | 'ayah_order'
  | 'recitation_check';

export interface QuranExercise {
  id: string;
  type: QuranExerciseType;
  surahId: string;
  ayahId?: string;
  difficulty: ArabicLevel;
  question: string;
  questionArabic?: string;
  options?: string[];
  correctAnswer: string | string[];
  hint?: string;
  explanation?: string;
  xpReward: number;
}

// ============ Quiz Types ============

export type QuizCategory =
  | 'surah_structure'    // Surah names, numbers, order
  | 'juz'                // Juz-related questions
  | 'makki_madani'       // Revelation location
  | 'tajweed';           // Tajweed rules

export type QuizFormat =
  | 'multiple_choice'
  | 'true_false'
  | 'fill_blank'
  | 'ordering'
  | 'matching';

export interface QuizCategoryInfo {
  id: QuizCategory;
  nameEnglish: string;
  nameFrench?: string;
  nameArabic: string;
  description: string;
  descriptionFr?: string;
  icon: string;
  color: string;
  questionCount: number;
}

export interface QuizQuestion {
  id: string;
  category: QuizCategory;
  format: QuizFormat;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  questionFr?: string;
  questionArabic?: string;
  options?: string[];
  optionsFr?: string[];
  correctAnswer: string | string[] | number;
  explanation?: string;
  explanationFr?: string;
  relatedSurah?: string;
  relatedAyah?: number;
}

export interface QuizSession {
  id: string;
  category: QuizCategory;
  questions: QuizQuestion[];
  currentIndex: number;
  answers: QuizAnswer[];
  score: number;
  startedAt: string;
  completedAt?: string;
}

export interface QuizAnswer {
  questionId: string;
  userAnswer: string | string[] | number;
  isCorrect: boolean;
  timeSpent: number; // seconds
}

export interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  score: number; // percentage
  timeSpent: number;
  category: QuizCategory;
  completedAt: string;
}
