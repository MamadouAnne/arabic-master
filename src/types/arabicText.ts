// Saved Arabic text for the memorization feature (poems, verses, any Arabic text).
// Stored locally via Zustand + AsyncStorage — no backend required.

export interface SavedArabicText {
  id: string;
  title: string;
  content: string; // raw Arabic text, newlines separate verses/lines
  createdAt: number;
  updatedAt: number;
}
