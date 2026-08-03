/**
 * Client-side keyword matching for course content retrieval (Feature 3).
 * Scores the student's message against the static topic index and returns
 * the top 2 matching topics with excerpts for injection into the system prompt.
 *
 * Cost: $0.00 — purely client-side string matching.
 */

import { TOPIC_INDEX, TopicEntry } from '../data/ai/topicIndex';

interface TopicMatch {
  entry: TopicEntry;
  score: number;
}

/**
 * Scores a message against the topic index and returns the top N matches.
 * Uses simple keyword frequency scoring — no API calls.
 */
export function matchTopics(message: string, maxResults: number = 2): TopicEntry[] {
  const lower = message.toLowerCase();
  const words = lower.split(/\s+/);

  const scored: TopicMatch[] = [];

  for (const entry of TOPIC_INDEX) {
    let score = 0;

    for (const keyword of entry.keywords) {
      // Exact keyword match in the full message (handles multi-word keywords)
      if (lower.includes(keyword)) {
        // Longer keywords are more specific, so score them higher
        score += keyword.length > 5 ? 3 : 2;
      }

      // Individual word match (for single-word keywords)
      if (keyword.indexOf(' ') === -1 && words.includes(keyword)) {
        score += 1;
      }
    }

    if (score > 0) {
      scored.push({ entry, score });
    }
  }

  // Sort by score descending, take top N
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, maxResults).map((s) => s.entry);
}

/**
 * Formats matched topics into a string for injection into the system prompt.
 * Returns empty string if no matches.
 */
export function formatTopicsForPrompt(matches: TopicEntry[]): string {
  if (matches.length === 0) return '';

  const parts = [
    'RELEVANT COURSE CONTENT (IMPORTANT — you MUST reference these in your answer):',
    'When answering, naturally mention where the student can find this topic in the app. Use a line like:',
    '"You can practice this in [Module] > [Lesson] in the app!" or "This is covered in the [Lesson] lesson."',
    'Use the excerpt below to give an accurate, specific answer grounded in the actual course content.',
    '',
  ];

  for (const match of matches) {
    parts.push(`📍 ${match.module} > ${match.lesson}: ${match.excerpt}`);
  }

  return parts.join('\n');
}
