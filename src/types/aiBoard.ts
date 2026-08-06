// Compact course specification the AI produces; a deterministic layout engine
// (courseLayout.ts) turns this into a positioned board.

export interface CourseSection {
  heading: string;
  points: string[];        // 1–3 short explanation bullets
  arabic?: string;         // example in Arabic (with tashkeel)
  translit?: string;       // transliteration
  translation?: string;    // meaning (in the app language)
}

export interface CourseSpec {
  title: string;
  subtitle?: string;
  sections: CourseSection[];
  summary?: string;        // one-line key takeaway
}

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
