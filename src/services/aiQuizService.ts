import { AIModelChoice } from '../types/aiChat';
import type { QuizContent, QuizQuestion } from '../types/classContent';
import type { CourseLevel } from '../types/aiBoard';
import { streamAiText, stripToJson } from './aiJson';

const LANG_NAME: Record<string, string> = { en: 'English', fr: 'French' };

const SCHEMA = `{
  "title": string,                       // short quiz title
  "questions": [                         // the questions
    {
      "type": "multiple_choice",
      "prompt": string,                  // the question
      "options": [string, string, ...],  // 3 or 4 options
      "correctIndex": number,            // index (0-based) of the correct option
      "explanation": string              // why it's correct
    },
    {
      "type": "fill_blank",
      "prompt": string,                  // question with a blank (use ___ for the blank)
      "correctText": string,             // the exact accepted answer
      "explanation": string
    }
  ]
}`;

function buildSystemPrompt(language: string, count: number, level?: CourseLevel, grounded = false): string {
  const lang = LANG_NAME[language] || 'English';
  const groundingRule = grounded
    ? `\n- You will be given SOURCE MATERIAL from our curriculum. Base every question and correct answer STRICTLY on it — use its vocabulary, rules and examples. Do NOT invent facts or test anything not covered by the source.`
    : '';
  return `You are an expert Arabic teacher creating a quiz for students.

Return ONLY a valid JSON object (no markdown, no code fences, no commentary) matching EXACTLY this schema:
${SCHEMA}

Rules:
- Create exactly ${count} questions${level ? ` at ${level} level` : ''}. Use a MIX of "multiple_choice" and "fill_blank" types.
- multiple_choice: 3 to 4 plausible options, with exactly ONE correct answer indicated by "correctIndex".
- fill_blank: put a blank in the prompt using ___ , and give the single accepted answer in "correctText".
- Write prompts, options and explanations in ${lang}. Include Arabic (with full tashkeel) wherever relevant to test.
- Every question needs a short "explanation" of the correct answer.
- Stay strictly on the given topic / conversation. Output only the JSON object.${groundingRule}`;
}

function clampQuiz(spec: any): QuizContent {
  const trim = (v: any, n: number) => (typeof v === 'string' ? v.trim().slice(0, n) : '');
  const rawQs = Array.isArray(spec?.questions) ? spec.questions.slice(0, 12) : [];
  let qid = 0;
  const questions: QuizQuestion[] = [];
  for (const q of rawQs) {
    const prompt = trim(q?.prompt, 240);
    const explanation = trim(q?.explanation, 240) || undefined;
    if (!prompt) continue;
    if (q?.type === 'fill_blank') {
      const correctText = trim(q?.correctText, 120);
      if (!correctText) continue;
      questions.push({ id: `q${Date.now()}_${qid++}`, type: 'fill_blank', prompt, correctText, explanation });
    } else {
      const options = (Array.isArray(q?.options) ? q.options : []).map((o: any) => trim(o, 120)).filter(Boolean).slice(0, 4);
      if (options.length < 2) continue;
      let correctIndex = Number.isInteger(q?.correctIndex) ? q.correctIndex : 0;
      if (correctIndex < 0 || correctIndex >= options.length) correctIndex = 0;
      questions.push({ id: `q${Date.now()}_${qid++}`, type: 'multiple_choice', prompt, options, correctIndex, explanation });
    }
  }
  return { kind: 'quiz', title: trim(spec?.title, 90) || 'Quiz', questions, passingScore: 70 };
}

interface GenerateQuizOpts {
  topic?: string;
  chatContext?: string;   // recent chat, when generating "from the conversation"
  sourceMaterial?: string; // curated curriculum content, when generating from a lesson
  count?: number;
  level?: CourseLevel;
  language: string;
  model?: AIModelChoice;
  signal?: AbortSignal;
}

/**
 * Generate a quiz (mix of multiple-choice + fill-in-the-blank) from a topic or
 * from recent chat. Throws the same error codes as streamAiText, plus 'bad_response'.
 */
export async function generateQuiz(opts: GenerateQuizOpts): Promise<QuizContent> {
  const { topic, chatContext, sourceMaterial, count = 5, level, language, model = 'sonnet', signal } = opts;

  const userContent = sourceMaterial
    ? `Create a quiz that tests this lesson${topic ? ` ("${topic}")` : ''}, based ONLY on the following source material from our curriculum. Test its vocabulary, rules and examples — do not test anything outside it.\n\nSOURCE MATERIAL:\n${sourceMaterial}`
    : chatContext
      ? `Create a quiz based on this class conversation (test what was taught/discussed):\n\n${chatContext}`
      : `Create a quiz on this Arabic topic: ${topic}`;

  const full = await streamAiText({
    userContent,
    systemPrompt: buildSystemPrompt(language, Math.min(12, Math.max(1, count)), level, !!sourceMaterial),
    model,
    maxTokens: 2048,
    signal,
  });

  try {
    const quiz = clampQuiz(JSON.parse(stripToJson(full)));
    if (!quiz.questions.length) throw new Error('empty');
    return quiz;
  } catch {
    if (__DEV__) console.warn('[aiQuiz] failed to parse quiz JSON:', full.slice(0, 300));
    throw new Error('bad_response');
  }
}
