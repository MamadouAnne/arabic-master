import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, User } from '@supabase/supabase-js';

interface SettingsState {
  // Language
  language: 'en' | 'fr';
  setLanguage: (lang: 'en' | 'fr') => void;

  // Onboarding
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => void;

  // Learning goals
  learningGoals: string[];
  setLearningGoals: (goals: string[]) => void;

  // Arabic speech playback speed (1.0 = natural). Applies app-wide.
  arabicSpeechSpeed: number;
  setArabicSpeechSpeed: (speed: number) => void;

  // Which voice reads the stories aloud. Persisted, so a listener who
  // settles on one never has to choose again.
  narrationVoice: 'female' | 'male';
  setNarrationVoice: (voice: 'female' | 'male') => void;

  // Auth (NOT persisted - Supabase manages its own session)
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  setSession: (session: Session | null) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // Language
      language: 'en',
      setLanguage: (lang) => set({ language: lang }),

      // Onboarding
      hasCompletedOnboarding: false,
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),

      // Learning goals
      learningGoals: [],
      setLearningGoals: (goals) => set({ learningGoals: goals }),

      // Arabic speech speed
      arabicSpeechSpeed: 1.0,
      setArabicSpeechSpeed: (speed) => set({ arabicSpeechSpeed: speed }),

      // Story narration voice
      narrationVoice: 'female',
      setNarrationVoice: (voice) => set({ narrationVoice: voice }),

      // Auth
      session: null,
      user: null,
      isAuthenticated: false,
      setSession: (session) =>
        set({
          session,
          user: session?.user ?? null,
          isAuthenticated: !!session,
        }),
    }),
    {
      name: 'iqra-settings',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        language: state.language,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        learningGoals: state.learningGoals,
        arabicSpeechSpeed: state.arabicSpeechSpeed,
        narrationVoice: state.narrationVoice,
        // session, user, isAuthenticated are NOT persisted
      }),
    }
  )
);
