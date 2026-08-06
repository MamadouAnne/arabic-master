import { fetch } from 'expo/fetch';
import { supabase } from '../lib/supabase';
import { useCreditStore } from '../stores/creditStore';
import { AIModelChoice } from '../types/aiChat';

const EDGE_FUNCTION_URL = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/ai-chat`;

function extractTextDelta(line: string): string | null {
  if (!line.startsWith('data: ')) return null;
  const json = line.slice(6);
  if (json === '[DONE]') return null;
  try {
    const parsed = JSON.parse(json);
    if (parsed.type === 'content_block_delta' && parsed.delta?.text) return parsed.delta.text;
  } catch { /* skip */ }
  return null;
}

/** Slice a model reply down to the JSON object it contains. */
export function stripToJson(raw: string): string {
  let s = raw.trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) s = fence[1].trim();
  const first = s.indexOf('{');
  const last = s.lastIndexOf('}');
  if (first >= 0 && last > first) s = s.slice(first, last + 1);
  return s;
}

interface StreamOpts {
  userContent: string;
  systemPrompt: string;
  model?: AIModelChoice;
  maxTokens?: number;
  signal?: AbortSignal;
}

/**
 * Call the ai-chat edge function (auth + credits + streaming) and return the
 * full text. Throws: 'auth_required' | 'no_credits' | 'rate_limit' |
 * 'server_error_*' | 'no_stream'.
 */
export async function streamAiText({ userContent, systemPrompt, model = 'sonnet', maxTokens = 2048, signal }: StreamOpts): Promise<string> {
  const session = await supabase?.auth.getSession();
  const accessToken = session?.data?.session?.access_token;
  if (!accessToken) throw new Error('auth_required');

  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
    body: JSON.stringify({
      messages: [{ role: 'user', content: userContent }],
      systemPrompt,
      model,
      maxTokens,
    }),
    signal,
  });

  if (response.status === 401) throw new Error('auth_required');
  if (response.status === 402) { useCreditStore.getState().updateFromHeaders(response.headers); throw new Error('no_credits'); }
  if (response.status === 429) throw new Error('rate_limit');
  if (!response.ok) throw new Error(`server_error_${response.status}`);

  const reader = response.body?.getReader();
  if (!reader) throw new Error('no_stream');
  const decoder = new TextDecoder();
  let buffer = '';
  let full = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) { const t = extractTextDelta(line.trim()); if (t) full += t; }
  }
  if (buffer.trim()) { const t = extractTextDelta(buffer.trim()); if (t) full += t; }

  useCreditStore.getState().updateFromHeaders(response.headers);
  return full;
}
