// Teacher-authored class content posted into a group chat.
// Stored in group_messages.class_content (JSONB); message.type is the kind.

// ── Lesson ──────────────────────────────────────────────────────
// Text blocks carry inline markup: **bold** ==highlight== __underline__ *italic*
export type LessonBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'bullets'; items: string[] }
  | { type: 'arabic'; text: string; translation?: string }
  | { type: 'callout'; text: string; tone?: 'info' | 'tip' | 'warn' }
  | { type: 'divider' };

export interface LessonContent {
  kind: 'lesson';
  title: string;
  blocks: LessonBlock[];
}

// ── Quiz ────────────────────────────────────────────────────────
export type QuizQuestionType = 'multiple_choice' | 'fill_blank';

export interface QuizQuestion {
  id: string;
  type: QuizQuestionType;
  prompt: string;
  options?: string[];          // multiple_choice
  correctIndex?: number;       // multiple_choice → index into options
  correctText?: string;        // fill_blank → accepted answer (case-insensitive)
  explanation?: string;
}

export interface QuizContent {
  kind: 'quiz';
  title: string;
  questions: QuizQuestion[];
  passingScore: number;        // percentage, 0..100
}

// ── Poll ────────────────────────────────────────────────────────
export interface PollContent {
  kind: 'poll';
  question: string;
  options: string[];
  allowMultiple: boolean;
}

// ── Board (drawing canvas) ──────────────────────────────────────
export type BoardBackground = 'dark' | 'white' | 'cream' | 'chalk';
export type BoardGrid = 'none' | 'grid' | 'lines';

export interface BoardStroke {
  type: 'stroke';
  tool: 'pen' | 'highlighter';
  d: string;                             // SVG path data
  color: string;
  width: number;
  bbox: [number, number, number, number]; // minX, minY, maxX, maxY (for erase hit-test)
}
export interface BoardShape {
  type: 'line' | 'arrow' | 'rect' | 'circle';
  x1: number; y1: number; x2: number; y2: number;
  color: string;
  width: number;
  fill?: string;   // filled rect/circle (used by AI course layouts); default outline-only
  radius?: number; // rect corner radius override
}
export interface BoardText {
  type: 'text';
  x: number; y: number;
  text: string;
  color: string;
  size: number;
  align?: 'left' | 'center'; // text anchor (default left)
  weight?: '400' | '500' | '600' | '700' | '800'; // font weight (default 700)
}
export type BoardElement = BoardStroke | BoardShape | BoardText;

export interface BoardContent {
  kind: 'board';
  title?: string;
  background: BoardBackground;
  grid: BoardGrid;
  width: number;   // logical canvas size at authoring time
  height: number;
  elements: BoardElement[];
}

export type ClassContent = LessonContent | QuizContent | PollContent | BoardContent;
export type ClassContentKind = ClassContent['kind'];

export const BOARD_BG: Record<BoardBackground, string> = {
  dark: '#111827',
  white: '#ffffff',
  cream: '#f5efe1',
  chalk: '#123a2e',
};
// Ink color that reads well on each background (editor default).
export const BOARD_DEFAULT_INK: Record<BoardBackground, string> = {
  dark: '#f8fafc',
  white: '#0f172a',
  cream: '#1f2937',
  chalk: '#f8fafc',
};

// ── Responses ───────────────────────────────────────────────────
// quiz: { answers: { [questionId]: number | string } }
// poll: { choices: number[] }
export interface ClassResponse {
  id: string;
  messageId: string;
  userId: string;
  userName: string;
  response: { answers?: Record<string, number | string>; choices?: number[] };
  isCorrect?: boolean;
  score?: number;
  createdAt: string;
}
