import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavedArabicText } from '../types/arabicText';

interface ArabicTextsState {
  texts: SavedArabicText[];
  addText: (input: { title: string; content: string }) => string;
  updateText: (id: string, patch: { title?: string; content?: string }) => void;
  deleteText: (id: string) => void;
  getText: (id: string) => SavedArabicText | undefined;
}

function genId(): string {
  return `ar-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useArabicTextsStore = create<ArabicTextsState>()(
  persist(
    (set, get) => ({
      texts: [],

      addText: ({ title, content }) => {
        const id = genId();
        const now = Date.now();
        const item: SavedArabicText = {
          id,
          title: title.trim() || 'Sans titre',
          content: content.trim(),
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ texts: [item, ...s.texts] }));
        return id;
      },

      updateText: (id, patch) =>
        set((s) => ({
          texts: s.texts.map((t) =>
            t.id === id
              ? {
                  ...t,
                  title:
                    patch.title !== undefined ? patch.title.trim() || t.title : t.title,
                  content: patch.content !== undefined ? patch.content : t.content,
                  updatedAt: Date.now(),
                }
              : t
          ),
        })),

      deleteText: (id) =>
        set((s) => ({ texts: s.texts.filter((t) => t.id !== id) })),

      getText: (id) => get().texts.find((t) => t.id === id),
    }),
    {
      name: 'arabic-texts-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
