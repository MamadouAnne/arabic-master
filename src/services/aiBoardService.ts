import { AIModelChoice } from '../types/aiChat';
import { CourseSpec, CourseLevel } from '../types/aiBoard';
import { streamAiText, stripToJson } from './aiJson';

const LANG_NAME: Record<string, string> = { en: 'English', fr: 'French' };

const SCHEMA = `{
  "title": string,                      // course title (in the explanation language)
  "subtitle": string,                   // optional one-line subtitle
  "sections": [                         // 4 to 6 sections
    {
      "heading": string,                // short section heading
      "points": [string, ...],          // 1 to 3 short explanation bullets
      "arabic": string,                 // OPTIONAL example in Arabic WITH full tashkeel
      "translit": string,               // OPTIONAL transliteration
      "translation": string             // OPTIONAL meaning
    }
  ],
  "summary": string                     // one-line key takeaway
}`;

function buildSystemPrompt(language: string, grounded = false): string {
  const lang = LANG_NAME[language] || 'English';
  const groundingRule = grounded
    ? `\nGROUNDING — you will be given SOURCE MATERIAL from our curriculum:
- Base the lesson STRICTLY on that source material. Use its rules, explanations and examples faithfully.
- Do NOT invent facts, add topics, or include anything not supported by the source. You may reorganize, condense and clarify it for a whiteboard.`
    : '';
  return `You are an expert Arabic teacher creating ONE focused, in-depth whiteboard lesson about the SINGLE topic the user requests.

Return ONLY a valid JSON object (no markdown, no code fences, no commentary) matching EXACTLY this schema:
${SCHEMA}

CRITICAL — stay on topic:
- The ENTIRE lesson must be about the ONE requested topic ONLY. Every section must directly teach an aspect of THAT topic.
- Do NOT add unrelated grammar, general background about the Arabic language, or any "related/other topics" section. No tangents.
- Be EXPLICIT and thorough about the topic: state the rule(s) clearly, explain how and when it applies, give concrete examples, and include a common mistake or key note — all strictly within the topic.${groundingRule}

Format:
- "title" should name the topic. 4 to 6 sections, each a clear heading + 1 to 3 short bullet points.
- Prefer sections that include a concrete Arabic example (fill "arabic", "translit", "translation").
- Write ALL headings, points, subtitle, translation and summary in ${lang}.
- Every Arabic string MUST include full tashkeel (harakat); keep Arabic examples short.
- Keep every string tight (aim under ~90 characters). Output the JSON object and nothing else.`;
}

function clampSpec(spec: any): CourseSpec {
  const trim = (v: any, n: number) => (typeof v === 'string' ? v.trim().slice(0, n) : undefined);
  const sections = Array.isArray(spec?.sections) ? spec.sections.slice(0, 6) : [];
  return {
    title: trim(spec?.title, 90) || 'Untitled lesson',
    subtitle: trim(spec?.subtitle, 120),
    summary: trim(spec?.summary, 160),
    sections: sections.map((s: any) => ({
      heading: trim(s?.heading, 80) || '',
      points: (Array.isArray(s?.points) ? s.points : []).slice(0, 3).map((p: any) => trim(p, 140)).filter(Boolean),
      arabic: trim(s?.arabic, 90),
      translit: trim(s?.translit, 120),
      translation: trim(s?.translation, 140),
    })).filter((s: any) => s.heading || s.arabic || s.points.length),
  };
}

interface GenerateOpts {
  topic: string;
  level?: CourseLevel;
  language: string;              // 'en' | 'fr'
  model?: AIModelChoice;
  sourceMaterial?: string;       // curated curriculum content to ground the lesson
  refineInstruction?: string;    // when refining an existing course
  priorSpec?: CourseSpec;        // the course being refined
  signal?: AbortSignal;
}

/**
 * Ask the AI to produce a compact CourseSpec (draft or refine).
 * Reuses the ai-chat edge function (auth + credits + streaming) but collects
 * the full text and parses it as JSON. Throws: 'auth_required' | 'no_credits'
 * | 'rate_limit' | 'server_error_*' | 'bad_response'.
 */
export async function generateCourseSpec(opts: GenerateOpts): Promise<CourseSpec> {
  const { topic, level, language, model = 'sonnet', sourceMaterial, refineInstruction, priorSpec, signal } = opts;

  let userContent: string;
  if (refineInstruction && priorSpec) {
    userContent = `Here is the current lesson as JSON:\n${JSON.stringify(priorSpec)}\n\nApply this change and return the FULL updated JSON, still strictly about the same single topic: ${refineInstruction}`;
  } else if (sourceMaterial) {
    userContent = `Create a focused, explicit whiteboard lesson titled about "${topic}", using ONLY the following source material from our curriculum. Base every rule, explanation and example on it — do NOT invent facts or add anything beyond it. You may reorganize and simplify it for the board.\n\nSOURCE MATERIAL:\n${sourceMaterial}`;
  } else {
    userContent = `Create a focused, explicit whiteboard lesson strictly about this ONE Arabic topic${level ? ` (level: ${level})` : ''} — do not drift to any other topic: ${topic}`;
  }

  const full = await streamAiText({ userContent, systemPrompt: buildSystemPrompt(language, !!sourceMaterial), model, maxTokens: 2048, signal });

  try {
    const parsed = JSON.parse(stripToJson(full));
    const spec = clampSpec(parsed);
    if (!spec.sections.length) throw new Error('empty');
    return spec;
  } catch {
    if (__DEV__) console.warn('[aiBoard] failed to parse course JSON:', full.slice(0, 300));
    throw new Error('bad_response');
  }
}
