import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

const MODEL_MAP: Record<string, string> = {
  haiku: 'claude-haiku-4-5-20251001',
  sonnet: 'claude-sonnet-4-5-20250929',
};

const EXPOSE_HEADERS = 'X-Credit-Type, X-Credits-Remaining, X-Free-Remaining';

// ── In-memory rate limiter (per edge function instance) ─────────
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 20; // max 20 requests per minute per user
const rateLimitMap = new Map<string, number[]>();

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(userId) || [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  rateLimitMap.set(userId, recent);
  return recent.length > RATE_LIMIT_MAX;
}

// Periodic cleanup of stale entries (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [uid, timestamps] of rateLimitMap) {
    const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    if (recent.length === 0) rateLimitMap.delete(uid);
    else rateLimitMap.set(uid, recent);
  }
}, 5 * 60_000);

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Expose-Headers': EXPOSE_HEADERS,
      },
    });
  }

  try {
    // 1. Authenticate
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Rate limit check (per user, per instance)
    if (isRateLimited(user.id)) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please slow down.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', 'Retry-After': '60' },
      });
    }

    // 2. Parse and validate request body (needed for model before credit check)
    const { messages, systemPrompt, model: modelKey, maxTokens, summarize } = await req.json();

    // ── Summarization mode (Feature 2) ─────────────────────────
    // Summarize earlier messages using Haiku — no credit charge.
    // Returns a JSON response (not SSE) with the summary text.
    if (summarize === true) {
      const summaryMessages = messages?.slice(0, 20) || [];
      if (summaryMessages.length < 4) {
        return new Response(JSON.stringify({ summary: '' }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      const summaryPrompt = 'Summarize this conversation in 3-5 concise sentences. Capture: the main topics discussed, any mistakes the student made, what they learned, and where they left off. Write in the same language the student is using (English or French). Be factual and brief.';

      const summaryResponse = await fetch(ANTHROPIC_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: MODEL_MAP.haiku,
          max_tokens: 256,
          system: summaryPrompt,
          messages: summaryMessages.map((m: { role: string; content: string }) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!summaryResponse.ok) {
        console.error('Summarization failed:', summaryResponse.status);
        return new Response(JSON.stringify({ summary: '' }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      const summaryResult = await summaryResponse.json();
      const summaryText = summaryResult.content?.[0]?.text || '';

      return new Response(JSON.stringify({ summary: summaryText }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Input validation
    const MAX_MESSAGES = 50;
    const MAX_MESSAGE_LENGTH = 4000;
    const MAX_SYSTEM_PROMPT_LENGTH = 10000;

    if (messages.length > MAX_MESSAGES) {
      return new Response(JSON.stringify({ error: 'Too many messages' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    for (const msg of messages) {
      if (!msg || typeof msg.role !== 'string' || typeof msg.content !== 'string') {
        return new Response(JSON.stringify({ error: 'Invalid message format' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      if (msg.role !== 'user' && msg.role !== 'assistant') {
        return new Response(JSON.stringify({ error: 'Invalid message role' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      if (msg.content.length > MAX_MESSAGE_LENGTH) {
        return new Response(JSON.stringify({ error: 'Message too long' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    if (systemPrompt && typeof systemPrompt === 'string' && systemPrompt.length > MAX_SYSTEM_PROMPT_LENGTH) {
      return new Response(JSON.stringify({ error: 'System prompt too long' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 3. Credit check + deduction (atomic RPC, model-aware cost)
    const { data: creditCheck, error: creditError } = await supabase
      .rpc('check_and_deduct_credit', { p_user_id: user.id, p_model: modelKey || 'haiku' })
      .single();

    if (creditError) {
      console.error('Credit check error:', creditError);
      return new Response(JSON.stringify({ error: 'Credit check failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (creditCheck.result === 'insufficient') {
      return new Response(JSON.stringify({ error: 'no_credits' }), {
        status: 402,
        headers: {
          'Content-Type': 'application/json',
          'X-Credit-Type': 'empty',
          'X-Credits-Remaining': String(creditCheck.remaining_credits ?? 0),
          'X-Free-Remaining': '0',
          'Access-Control-Expose-Headers': EXPOSE_HEADERS,
        },
      });
    }

    // Credit headers to return with response
    const creditHeaders: Record<string, string> = {
      'X-Credit-Type': creditCheck.result,
      'X-Credits-Remaining': String(creditCheck.remaining_credits ?? 0),
      'X-Free-Remaining': String(creditCheck.free_remaining ?? 0),
    };

    const modelId = MODEL_MAP[modelKey] || MODEL_MAP.haiku;

    // Resolve max tokens with server-side cap (sonnet raised to fit AI course boards)
    const MAX_LIMITS: Record<string, number> = { haiku: 1024, sonnet: 2048 };
    const resolvedMaxTokens = Math.min(maxTokens || 768, MAX_LIMITS[modelKey] || 1024);

    // 4. Call Anthropic API with streaming
    const anthropicResponse = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: modelId,
        max_tokens: resolvedMaxTokens,
        system: systemPrompt,
        messages: messages.map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        })),
        stream: true,
      }),
    });

    if (!anthropicResponse.ok) {
      const errorBody = await anthropicResponse.text();
      console.error('Anthropic API error:', anthropicResponse.status, errorBody);

      // Refund: reverse the deduction so the user isn't charged for a failed response
      if (creditCheck.result === 'free' || creditCheck.result === 'credit') {
        const cost = modelKey === 'sonnet' ? 3 : 1;
        supabase
          .rpc('refund_message_credit', {
            p_user_id: user.id,
            p_credit_type: creditCheck.result,
            p_cost: cost,
          })
          .then(() => {});
      }

      return new Response(JSON.stringify({ error: 'AI service error' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 5. Track usage for analytics (fire-and-forget, no longer gates access)
    const today = new Date().toISOString().split('T')[0];
    supabase
      .from('ai_chat_usage')
      .select('message_count')
      .eq('user_id', user.id)
      .eq('usage_date', today)
      .single()
      .then(({ data: usage }) => {
        supabase
          .from('ai_chat_usage')
          .upsert(
            {
              user_id: user.id,
              usage_date: today,
              message_count: (usage?.message_count || 0) + 1,
            },
            { onConflict: 'user_id,usage_date' }
          )
          .then(() => {});
      });

    // 6. Stream the response back with credit headers
    return new Response(anthropicResponse.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Expose-Headers': EXPOSE_HEADERS,
        ...creditHeaders,
      },
    });
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
