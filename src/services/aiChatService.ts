import { fetch } from 'expo/fetch';
import { useAIChatStore } from '../stores/aiChatStore';
import { useCreditStore } from '../stores/creditStore';
import { gatherAIContext } from './aiContextService';
import { buildSystemPrompt, buildStudyPlanDirective } from '../data/ai/systemPrompts';
import { ChatMessage, AIModelChoice, AI_MAX_TOKENS, ConversationSummary } from '../types/aiChat';
import { supabase } from '../lib/supabase';

const EDGE_FUNCTION_URL = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/ai-chat`;
/** After summarization, send summary + this many recent messages */
const MAX_HISTORY_MESSAGES = 12;
/** Trigger summarization when conversation exceeds this count */
const SUMMARIZE_THRESHOLD = 14;
/** Number of early messages to include in the summarization request */
const SUMMARIZE_BATCH = 8;

const STUDY_PLAN_PATTERNS = /\b(study\s*plan|learning\s*plan|revision\s*plan|weekly\s*plan|plan\s*d[''']?\s*[eé]tude|plan\s*d[''']?\s*apprentissage|plan\s*de\s*r[eé]vision|programme\s*d[''']?\s*[eé]tude)\b/i;

/** Detect if the user message is requesting a study plan */
function isStudyPlanRequest(message: string): boolean {
  return STUDY_PLAN_PATTERNS.test(message);
}

/** Max tokens for voice mode — shorter for faster, conversational responses */
const VOICE_MAX_TOKENS = 512;

const VOICE_SYSTEM_MODIFIER = `
[Voice Mode] Keep your response brief and conversational (3-5 sentences max). Speak naturally as if in a live tutoring session. Avoid bullet points, markdown formatting, numbered lists, or special characters. Use short, clear sentences that flow well when spoken aloud. Still include Arabic text with tashkeel when relevant.`;

interface SendMessageOptions {
  userMessage: string;
  model: AIModelChoice;
  abortController?: AbortController;
  /** When true, uses shorter token limit and conversational system prompt */
  isVoiceMode?: boolean;
  /** Called for each text chunk during streaming (used by voice mode to speak in real-time) */
  onChunk?: (text: string) => void;
}

/**
 * Summarize earlier messages via a Haiku call (Feature 2).
 * Fires asynchronously — no credit charge, stored in the chat store.
 * Cost: ~$0.001 per call (1 Haiku call per 14 messages).
 */
async function summarizeIfNeeded(
  module: string,
  messages: ChatMessage[],
  accessToken: string,
): Promise<void> {
  const store = useAIChatStore.getState();
  const existingSummary = store.getSummary(module as any);

  // Only summarize if we've crossed the threshold and haven't already summarized this batch
  const totalMessages = messages.length;
  if (totalMessages < SUMMARIZE_THRESHOLD) return;

  // Check if we already summarized up to this point
  if (existingSummary && existingSummary.messageCount >= totalMessages - MAX_HISTORY_MESSAGES) return;

  // Take the first batch of messages to summarize
  const messagesToSummarize = messages
    .filter((msg) => !msg.content.startsWith('__error:'))
    .slice(0, SUMMARIZE_BATCH)
    .map((msg) => ({ role: msg.role, content: msg.content }));

  if (messagesToSummarize.length < 4) return;

  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        messages: messagesToSummarize,
        summarize: true,
      }),
    });

    if (!response.ok) return;

    const result = await response.json();
    if (result.summary) {
      const summary: ConversationSummary = {
        text: result.summary,
        messageCount: SUMMARIZE_BATCH,
        createdAt: Date.now(),
      };
      useAIChatStore.getState().setSummary(module as any, summary);
    }
  } catch {
    // Summarization is non-critical — silently fail
  }
}

/**
 * Parse a single SSE line and extract the text delta if present.
 * Anthropic SSE format: `data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"..."}}`
 */
function extractTextDelta(line: string): string | null {
  if (!line.startsWith('data: ')) return null;
  const json = line.slice(6); // remove "data: "
  if (json === '[DONE]') return null;

  try {
    const parsed = JSON.parse(json);
    if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
      return parsed.delta.text;
    }
  } catch {
    // Not valid JSON, skip
  }
  return null;
}

/**
 * Sends a message to the AI chat Edge Function with streaming enabled.
 * Text chunks are pushed to the store incrementally so the UI
 * renders them as they arrive.
 */
export async function sendAIChatMessage({
  userMessage,
  model,
  abortController,
  isVoiceMode,
  onChunk,
}: SendMessageOptions): Promise<void> {
  const store = useAIChatStore.getState();
  const { activeModule, conversations } = store;

  // Get existing conversation summary (Feature 2)
  const existingSummary = store.getSummary(activeModule);
  const summaryText = existingSummary?.text;

  // Gather context
  const context = gatherAIContext(activeModule);
  let systemPrompt = buildSystemPrompt(context, model, userMessage, summaryText);

  // Append study plan directive if requested
  if (isStudyPlanRequest(userMessage)) {
    systemPrompt += '\n\n' + buildStudyPlanDirective(context);
  }

  // Append voice mode modifier for concise spoken responses
  if (isVoiceMode) {
    systemPrompt += '\n\n' + VOICE_SYSTEM_MODIFIER;
  }

  // Get conversation history — if we have a summary, use a larger recent window
  // since older context is captured in the summary
  const allMessages = (conversations[activeModule] || [])
    .filter((msg: ChatMessage) => !msg.content.startsWith('__error:'));
  const history = allMessages
    .slice(-MAX_HISTORY_MESSAGES)
    .map((msg: ChatMessage) => ({
      role: msg.role,
      content: msg.content,
    }));

  // Add the new user message
  store.addUserMessage(userMessage);
  store.setStreaming(true);

  try {
    // Get auth session for the Edge Function
    const session = await supabase?.auth.getSession();
    const accessToken = session?.data?.session?.access_token;
    if (!accessToken) {
      throw new Error('auth_required');
    }

    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        messages: [
          ...history,
          { role: 'user', content: userMessage },
        ],
        systemPrompt,
        model,
        maxTokens: isVoiceMode ? VOICE_MAX_TOKENS : AI_MAX_TOKENS[model],
      }),
      signal: abortController?.signal,
    });

    if (response.status === 401) {
      throw new Error('auth_required');
    }

    if (response.status === 402) {
      useCreditStore.getState().updateFromHeaders(response.headers);
      throw new Error('no_credits');
    }

    if (response.status === 429) {
      throw new Error('rate_limit');
    }

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      console.error('[AI Chat] API error:', response.status, errorBody);
      throw new Error(`server_error_${response.status}`);
    }

    // Read the SSE stream
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('no_stream');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Process complete lines from the buffer
      const lines = buffer.split('\n');
      // Keep the last (potentially incomplete) line in the buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        const text = extractTextDelta(trimmed);
        if (text) {
          useAIChatStore.getState().appendStreamChunk(text);
          onChunk?.(text);
        }
      }
    }

    // Process any remaining buffer
    if (buffer.trim()) {
      const text = extractTextDelta(buffer.trim());
      if (text) {
        useAIChatStore.getState().appendStreamChunk(text);
        onChunk?.(text);
      }
    }

    // Finalize the streamed message into a real conversation message
    useAIChatStore.getState().finalizeStreamedMessage();

    // Sync credit state from response headers
    useCreditStore.getState().updateFromHeaders(response.headers);

    // ── Async summarization (Feature 2) ──────────────────────────
    // Fire-and-forget: if conversation is long enough, summarize older messages.
    // Uses 1 Haiku call (~$0.001), no credit charge to the user.
    const updatedConversation = useAIChatStore.getState().conversations[activeModule] || [];
    if (updatedConversation.length >= SUMMARIZE_THRESHOLD && accessToken) {
      summarizeIfNeeded(activeModule, updatedConversation, accessToken).catch(() => {});
    }

  } catch (error: any) {
    if (error.name === 'AbortError' || error.message?.toLowerCase().includes('cancel')) {
      // User stopped — finalize whatever was streamed so far
      const { streamingContent } = useAIChatStore.getState();
      if (streamingContent) {
        useAIChatStore.getState().finalizeStreamedMessage();
      } else {
        useAIChatStore.getState().setStreaming(false);
      }
      return;
    }

    console.error('[AI Chat] Error:', error.message);

    // Create an error message for the user
    let errorContent: string;
    if (error.message === 'Network request failed' || error.message === 'no_stream') {
      errorContent = '__error:offline__';
    } else if (error.message === 'no_credits') {
      errorContent = '__error:no_credits__';
    } else if (error.message === 'rate_limit') {
      errorContent = '__error:rate_limit__';
    } else if (error.message === 'auth_required') {
      errorContent = '__error:auth__';
    } else {
      errorContent = '__error:generic__';
    }

    // Add error as assistant message so user sees it
    const currentState = useAIChatStore.getState();
    const errorMsg: ChatMessage = {
      id: `msg_${Date.now()}_err`,
      role: 'assistant',
      content: errorContent,
      timestamp: Date.now(),
    };
    useAIChatStore.setState({
      conversations: {
        ...currentState.conversations,
        [activeModule]: [...(currentState.conversations[activeModule] || []), errorMsg],
      },
      isStreaming: false,
      streamingContent: '',
    });
  }
}
