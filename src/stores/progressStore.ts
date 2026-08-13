import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';
import { ExerciseType, UserArabicProgress, ArabicLevel, VocabularyReviewItem, ReviewRating } from '../types/arabic';
import { ACHIEVEMENTS, Achievement } from '../data/achievements';
import * as communityService from '../services/communityService';
import { useSettingsStore } from './settingsStore';

// --- Debounced XP sync (30s flush) ---
const FLUSH_INTERVAL_MS = 30_000;
let _pendingXpDelta = 0;
let _flushTimer: ReturnType<typeof setTimeout> | null = null;

function _flushPendingSync() {
  if (_flushTimer) {
    clearTimeout(_flushTimer);
    _flushTimer = null;
  }
  const delta = _pendingXpDelta;
  _pendingXpDelta = 0;

  const user = useSettingsStore.getState().user;
  if (!user) return;

  const { totalXp, currentStreak, longestStreak } = useProgressStore.getState().progress;
  communityService.syncProgress(user.id, totalXp, currentStreak, longestStreak);

  if (delta > 0) {
    communityService.logDailyXp(user.id, delta);
  }
}

function _scheduleFlush() {
  if (_flushTimer) return; // already scheduled
  _flushTimer = setTimeout(_flushPendingSync, FLUSH_INTERVAL_MS);
}

// Flush immediately when app goes to background
AppState.addEventListener('change', (state: AppStateStatus) => {
  if ((state === 'background' || state === 'inactive') && _pendingXpDelta > 0) {
    _flushPendingSync();
  }
});

export type ModuleType = 'alphabet' | 'vocabulary' | 'grammar' | 'verbs' | 'reading' | 'practice' | 'numbers' | 'writing';

export interface LastAccessedInfo {
  module: ModuleType;
  moduleName: string;
  lessonId?: string;
  lessonTitle?: string;
  lessonTitleArabic?: string;
}

interface ProgressState {
  progress: UserArabicProgress;
  showVowels: boolean; // Default true for beginners
  unlockedAchievements: string[];
  newAchievement: Achievement | null; // For showing achievement popup
  vocabularyReviewSchedule: VocabularyReviewItem[]; // SRS review schedule
  lastAccessedModule: ModuleType | null; // Track last accessed module
  lastAccessed: LastAccessedInfo | null; // Track last accessed module with lesson details

  // Settings
  setShowVowels: (show: boolean) => void;
  setLastAccessedModule: (module: ModuleType) => void;
  setLastAccessed: (info: LastAccessedInfo) => void;

  // XP & Streaks
  addXp: (amount: number) => void;
  updateStreak: () => void;

  // Achievements
  checkAchievements: (quranSurahsCompleted?: number) => Achievement[];
  clearNewAchievement: () => void;
  getUnlockedAchievements: () => Achievement[];

  // Vocabulary SRS
  scheduleVocabularyReview: (wordId: string, themeId: string) => void;
  updateVocabularyReviewItem: (wordId: string, rating: ReviewRating) => void;
  getDueVocabularyReviews: () => VocabularyReviewItem[];
  getVocabularyReviewItem: (wordId: string) => VocabularyReviewItem | undefined;
  getVocabularyReviewStats: () => { dueToday: number; learned: number; mastered: number; newWords: number };

  // Alphabet progress
  markLetterLearned: (letterId: string) => void;
  markLetterPracticed: (letterId: string) => void;
  markLetterMastered: (letterId: string) => void;
  isLetterLearned: (letterId: string) => boolean;

  // Vocabulary progress
  startTheme: (themeId: string) => void;
  completeTheme: (themeId: string) => void;
  markWordLearned: (wordId: string) => void;
  markWordMastered: (wordId: string) => void;
  isWordLearned: (wordId: string) => boolean;

  // Grammar progress
  startLesson: (lessonId: string) => void;
  completeLesson: (lessonId: string) => void;

  // Verb progress
  markVerbLearned: (verbId: string) => void;
  markVerbMastered: (verbId: string) => void;
  incrementTenseReview: (tense: 'past' | 'present' | 'future') => void;

  // Reading progress
  startReading: (textId: string) => void;
  completeReading: (textId: string) => void;

  // Exercise results
  recordExerciseResult: (exerciseType: ExerciseType, isCorrect: boolean) => void;

  // Getters
  getAlphabetCompletionPercent: () => number;
  getVocabularyCompletionPercent: () => number;
  getGrammarCompletionPercent: () => number;
  getOverallLevel: () => ArabicLevel;
  getAccuracy: () => number;

  // Reset
  resetProgress: () => void;
}

const initialProgress: UserArabicProgress = {
  id: '',
  userId: '',
  totalXp: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastStudyDate: '',

  alphabetProgress: {
    lettersLearned: [],
    writingPracticed: [],
    masteredLetters: [],
  },

  vocabularyProgress: {
    themesStarted: [],
    themesCompleted: [],
    wordsLearned: [],
    wordsMastered: [],
  },

  grammarProgress: {
    lessonsStarted: [],
    lessonsCompleted: [],
  },

  verbProgress: {
    verbsLearned: [],
    verbsMastered: [],
    tensesReviewed: {
      past: 0,
      present: 0,
      future: 0,
    },
  },

  readingProgress: {
    textsStarted: [],
    textsCompleted: [],
  },

  exerciseResults: {
    totalCompleted: 0,
    totalCorrect: 0,
    byType: {
      multiple_choice: { completed: 0, correct: 0 },
      fill_blank: { completed: 0, correct: 0 },
      matching: { completed: 0, correct: 0 },
      writing: { completed: 0, correct: 0 },
      listening: { completed: 0, correct: 0 },
      reading: { completed: 0, correct: 0 },
      letter_recognition: { completed: 0, correct: 0 },
      vowel_placement: { completed: 0, correct: 0 },
    },
  },
};

const TOTAL_LETTERS = 28;
const TOTAL_THEMES = 6;
const TOTAL_GRAMMAR_LESSONS = 10;

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      progress: initialProgress,
      showVowels: true, // Always show vowels by default for beginners
      unlockedAchievements: [],
      newAchievement: null,
      vocabularyReviewSchedule: [],
      lastAccessedModule: null,
      lastAccessed: null,

      setShowVowels: (show) => set({ showVowels: show }),
      setLastAccessedModule: (module) => set({ lastAccessedModule: module }),
      setLastAccessed: (info) => set({ lastAccessed: info, lastAccessedModule: info.module }),

      // Achievement Methods
      checkAchievements: (quranSurahsCompleted = 0) => {
        const state = get();
        const { progress, unlockedAchievements } = state;
        const newlyUnlocked: Achievement[] = [];

        for (const achievement of ACHIEVEMENTS) {
          if (unlockedAchievements.includes(achievement.id)) continue;

          let conditionMet = false;
          const { type, value } = achievement.condition;

          switch (type) {
            case 'letters_learned':
              conditionMet = progress.alphabetProgress.lettersLearned.length >= value;
              break;
            case 'words_learned':
              conditionMet = progress.vocabularyProgress.wordsLearned.length >= value;
              break;
            case 'lessons_completed':
              conditionMet = progress.grammarProgress.lessonsCompleted.length >= value;
              break;
            case 'streak_days':
              conditionMet = progress.currentStreak >= value || progress.longestStreak >= value;
              break;
            case 'total_xp':
              conditionMet = progress.totalXp >= value;
              break;
            case 'exercises_completed':
              conditionMet = progress.exerciseResults.totalCompleted >= value;
              break;
            case 'accuracy':
              const accuracy = progress.exerciseResults.totalCompleted > 0
                ? (progress.exerciseResults.totalCorrect / progress.exerciseResults.totalCompleted) * 100
                : 0;
              conditionMet = accuracy >= value && progress.exerciseResults.totalCompleted >= 10;
              break;
            case 'surahs_completed':
              conditionMet = quranSurahsCompleted >= value;
              break;
            case 'verbs_learned':
              conditionMet = progress.verbProgress.verbsLearned.length >= value;
              break;
          }

          if (conditionMet) {
            newlyUnlocked.push(achievement);
          }
        }

        if (newlyUnlocked.length > 0) {
          const totalXpReward = newlyUnlocked.reduce((sum, a) => sum + a.xpReward, 0);
          set((state) => ({
            unlockedAchievements: [
              ...state.unlockedAchievements,
              ...newlyUnlocked.map((a) => a.id),
            ],
            newAchievement: newlyUnlocked[0], // Show the first new achievement
            progress: {
              ...state.progress,
              totalXp: state.progress.totalXp + totalXpReward,
            },
          }));
        }

        return newlyUnlocked;
      },

      clearNewAchievement: () => set({ newAchievement: null }),

      getUnlockedAchievements: () => {
        const { unlockedAchievements } = get();
        return ACHIEVEMENTS.filter((a) => unlockedAchievements.includes(a.id));
      },

      addXp: (amount) => {
        set((state) => ({
          progress: {
            ...state.progress,
            totalXp: state.progress.totalXp + amount,
          },
        }));
        get().checkAchievements();

        // Accumulate and debounce Supabase sync (flushes every 30s or on background)
        _pendingXpDelta += amount;
        _scheduleFlush();
      },

      updateStreak: () => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        const lastDate = state.progress.lastStudyDate;

        if (lastDate === today) {
          return;
        }

        // Flush any pending XP before streak sync to avoid stale totals
        if (_pendingXpDelta > 0) {
          _flushPendingSync();
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        let newStreak = 1;
        if (lastDate === yesterdayStr) {
          newStreak = state.progress.currentStreak + 1;
        }

        const updatedLongestStreak = Math.max(newStreak, state.progress.longestStreak);
        set({
          progress: {
            ...state.progress,
            currentStreak: newStreak,
            longestStreak: updatedLongestStreak,
            lastStudyDate: today,
          },
        });
        get().checkAchievements();

        // Sync streak to Supabase immediately (fires once per day)
        const user = useSettingsStore.getState().user;
        if (user) {
          const { totalXp } = get().progress;
          communityService.syncProgress(user.id, totalXp, newStreak, updatedLongestStreak);
        }
      },

      markLetterLearned: (letterId) => {
        const state = get();
        if (state.progress.alphabetProgress.lettersLearned.includes(letterId)) {
          return;
        }
        set({
          progress: {
            ...state.progress,
            alphabetProgress: {
              ...state.progress.alphabetProgress,
              lettersLearned: [...state.progress.alphabetProgress.lettersLearned, letterId],
            },
          },
        });
        get().checkAchievements();
      },

      markLetterPracticed: (letterId) => set((state) => {
        if (state.progress.alphabetProgress.writingPracticed.includes(letterId)) {
          return state;
        }
        return {
          progress: {
            ...state.progress,
            alphabetProgress: {
              ...state.progress.alphabetProgress,
              writingPracticed: [...state.progress.alphabetProgress.writingPracticed, letterId],
            },
          },
        };
      }),

      markLetterMastered: (letterId) => set((state) => {
        if (state.progress.alphabetProgress.masteredLetters.includes(letterId)) {
          return state;
        }
        return {
          progress: {
            ...state.progress,
            alphabetProgress: {
              ...state.progress.alphabetProgress,
              masteredLetters: [...state.progress.alphabetProgress.masteredLetters, letterId],
            },
          },
        };
      }),

      isLetterLearned: (letterId) => {
        return get().progress.alphabetProgress.lettersLearned.includes(letterId);
      },

      startTheme: (themeId) => set((state) => {
        if (state.progress.vocabularyProgress.themesStarted.includes(themeId)) {
          return state;
        }
        return {
          progress: {
            ...state.progress,
            vocabularyProgress: {
              ...state.progress.vocabularyProgress,
              themesStarted: [...state.progress.vocabularyProgress.themesStarted, themeId],
            },
          },
        };
      }),

      completeTheme: (themeId) => set((state) => {
        if (state.progress.vocabularyProgress.themesCompleted.includes(themeId)) {
          return state;
        }
        return {
          progress: {
            ...state.progress,
            vocabularyProgress: {
              ...state.progress.vocabularyProgress,
              themesCompleted: [...state.progress.vocabularyProgress.themesCompleted, themeId],
            },
          },
        };
      }),

      markWordLearned: (wordId) => {
        const state = get();
        if (state.progress.vocabularyProgress.wordsLearned.includes(wordId)) {
          return;
        }
        set({
          progress: {
            ...state.progress,
            vocabularyProgress: {
              ...state.progress.vocabularyProgress,
              wordsLearned: [...state.progress.vocabularyProgress.wordsLearned, wordId],
            },
          },
        });
        get().checkAchievements();
      },

      markWordMastered: (wordId) => set((state) => {
        if (state.progress.vocabularyProgress.wordsMastered.includes(wordId)) {
          return state;
        }
        return {
          progress: {
            ...state.progress,
            vocabularyProgress: {
              ...state.progress.vocabularyProgress,
              wordsMastered: [...state.progress.vocabularyProgress.wordsMastered, wordId],
            },
          },
        };
      }),

      isWordLearned: (wordId) => {
        return get().progress.vocabularyProgress.wordsLearned.includes(wordId);
      },

      startLesson: (lessonId) => set((state) => {
        if (state.progress.grammarProgress.lessonsStarted.includes(lessonId)) {
          return state;
        }
        return {
          progress: {
            ...state.progress,
            grammarProgress: {
              ...state.progress.grammarProgress,
              lessonsStarted: [...state.progress.grammarProgress.lessonsStarted, lessonId],
            },
          },
        };
      }),

      completeLesson: (lessonId) => {
        const state = get();
        if (state.progress.grammarProgress.lessonsCompleted.includes(lessonId)) {
          return;
        }
        set({
          progress: {
            ...state.progress,
            grammarProgress: {
              ...state.progress.grammarProgress,
              lessonsCompleted: [...state.progress.grammarProgress.lessonsCompleted, lessonId],
            },
          },
        });
        get().checkAchievements();
      },

      markVerbLearned: (verbId) => {
        const state = get();
        if (state.progress.verbProgress.verbsLearned.includes(verbId)) {
          return;
        }
        set({
          progress: {
            ...state.progress,
            verbProgress: {
              ...state.progress.verbProgress,
              verbsLearned: [...state.progress.verbProgress.verbsLearned, verbId],
            },
          },
        });
        get().checkAchievements();
      },

      markVerbMastered: (verbId) => set((state) => {
        if (state.progress.verbProgress.verbsMastered.includes(verbId)) {
          return state;
        }
        return {
          progress: {
            ...state.progress,
            verbProgress: {
              ...state.progress.verbProgress,
              verbsMastered: [...state.progress.verbProgress.verbsMastered, verbId],
            },
          },
        };
      }),

      incrementTenseReview: (tense) => set((state) => ({
        progress: {
          ...state.progress,
          verbProgress: {
            ...state.progress.verbProgress,
            tensesReviewed: {
              ...state.progress.verbProgress.tensesReviewed,
              [tense]: state.progress.verbProgress.tensesReviewed[tense] + 1,
            },
          },
        },
      })),

      startReading: (textId) => set((state) => {
        if (state.progress.readingProgress.textsStarted.includes(textId)) {
          return state;
        }
        return {
          progress: {
            ...state.progress,
            readingProgress: {
              ...state.progress.readingProgress,
              textsStarted: [...state.progress.readingProgress.textsStarted, textId],
            },
          },
        };
      }),

      completeReading: (textId) => set((state) => {
        if (state.progress.readingProgress.textsCompleted.includes(textId)) {
          return state;
        }
        return {
          progress: {
            ...state.progress,
            readingProgress: {
              ...state.progress.readingProgress,
              textsCompleted: [...state.progress.readingProgress.textsCompleted, textId],
            },
          },
        };
      }),

      recordExerciseResult: (exerciseType, isCorrect) => {
        set((state) => ({
          progress: {
            ...state.progress,
            exerciseResults: {
              totalCompleted: state.progress.exerciseResults.totalCompleted + 1,
              totalCorrect: state.progress.exerciseResults.totalCorrect + (isCorrect ? 1 : 0),
              byType: {
                ...state.progress.exerciseResults.byType,
                [exerciseType]: {
                  completed: state.progress.exerciseResults.byType[exerciseType].completed + 1,
                  correct: state.progress.exerciseResults.byType[exerciseType].correct + (isCorrect ? 1 : 0),
                },
              },
            },
          },
        }));
        // Check for new achievements after recording exercise result
        get().checkAchievements();
      },

      // Vocabulary SRS Methods (SM-2 Algorithm)
      scheduleVocabularyReview: (wordId, themeId) => {
        const state = get();
        const existing = state.vocabularyReviewSchedule.find((item) => item.wordId === wordId);

        if (existing) return; // Already scheduled

        const today = new Date().toISOString().split('T')[0];
        const newItem: VocabularyReviewItem = {
          wordId,
          themeId,
          nextReviewDate: today, // Due immediately for first review
          easeFactor: 2.5, // Default SM-2 ease factor
          interval: 0,
          repetitions: 0,
        };

        set({
          vocabularyReviewSchedule: [...state.vocabularyReviewSchedule, newItem],
        });
      },

      updateVocabularyReviewItem: (wordId, rating) => {
        const state = get();
        const schedule = [...state.vocabularyReviewSchedule];
        const index = schedule.findIndex((item) => item.wordId === wordId);

        if (index === -1) return;

        const item = { ...schedule[index] };
        const today = new Date().toISOString().split('T')[0];

        // SM-2 Algorithm implementation
        if (rating < 3) {
          // Failed review - reset
          item.repetitions = 0;
          item.interval = 1;
        } else {
          // Successful review
          if (item.repetitions === 0) {
            item.interval = 1;
          } else if (item.repetitions === 1) {
            item.interval = 6;
          } else {
            item.interval = Math.round(item.interval * item.easeFactor);
          }
          item.repetitions += 1;
        }

        // Update ease factor (minimum 1.3)
        item.easeFactor = Math.max(
          1.3,
          item.easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02))
        );

        // Calculate next review date
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + item.interval);
        item.nextReviewDate = nextDate.toISOString().split('T')[0];
        item.lastRating = rating;
        item.lastReviewedAt = today;

        schedule[index] = item;

        set({ vocabularyReviewSchedule: schedule });

        // Mark as learned if first successful review, mastered if interval >= 21 days
        if (rating >= 3 && item.repetitions === 1) {
          get().markWordLearned(wordId);
        }
        if (item.interval >= 21) {
          get().markWordMastered(wordId);
        }

        get().checkAchievements();
      },

      getDueVocabularyReviews: () => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];

        return state.vocabularyReviewSchedule.filter(
          (item) => item.nextReviewDate <= today
        );
      },

      getVocabularyReviewItem: (wordId) => {
        const state = get();
        return state.vocabularyReviewSchedule.find((item) => item.wordId === wordId);
      },

      getVocabularyReviewStats: () => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        const schedule = state.vocabularyReviewSchedule;

        const dueToday = schedule.filter((item) => item.nextReviewDate <= today).length;
        const learned = schedule.filter((item) => item.repetitions >= 1 && item.interval < 21).length;
        const mastered = schedule.filter((item) => item.interval >= 21).length;
        const newWords = schedule.filter((item) => item.repetitions === 0).length;

        return { dueToday, learned, mastered, newWords };
      },

      getAlphabetCompletionPercent: () => {
        const state = get();
        return Math.round((state.progress.alphabetProgress.lettersLearned.length / TOTAL_LETTERS) * 100);
      },

      getVocabularyCompletionPercent: () => {
        const state = get();
        return Math.round((state.progress.vocabularyProgress.themesCompleted.length / TOTAL_THEMES) * 100);
      },

      getGrammarCompletionPercent: () => {
        const state = get();
        return Math.round((state.progress.grammarProgress.lessonsCompleted.length / TOTAL_GRAMMAR_LESSONS) * 100);
      },

      getOverallLevel: (): ArabicLevel => {
        const state = get();
        const alphabetPercent = state.progress.alphabetProgress.lettersLearned.length / TOTAL_LETTERS;
        const vocabPercent = state.progress.vocabularyProgress.themesCompleted.length / TOTAL_THEMES;
        const grammarPercent = state.progress.grammarProgress.lessonsCompleted.length / TOTAL_GRAMMAR_LESSONS;

        const average = (alphabetPercent + vocabPercent + grammarPercent) / 3;

        if (average >= 0.7) return 'advanced';
        if (average >= 0.3) return 'intermediate';
        return 'beginner';
      },

      getAccuracy: () => {
        const state = get();
        const { totalCompleted, totalCorrect } = state.progress.exerciseResults;
        if (totalCompleted === 0) return 0;
        return Math.round((totalCorrect / totalCompleted) * 100);
      },

      resetProgress: () => set({ progress: initialProgress, showVowels: true, unlockedAchievements: [], newAchievement: null, vocabularyReviewSchedule: [] }),
    }),
    {
      name: 'arabic-progress-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
