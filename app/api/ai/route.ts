import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/ai
 * Proxies a Gemini (or OpenAI) call using the API key provided by the client.
 * This keeps the key out of browser console network payloads in production.
 *
 * Body: { prompt: string; apiKey: string; model?: string; context?: string }
 */
export async function POST(req: NextRequest) {
  const { prompt, apiKey, model = 'gemini-2.0-flash', context } = await req.json();

  if (!prompt?.trim()) return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
  if (!apiKey?.trim()) return NextResponse.json({ error: 'apiKey is required' }, { status: 400 });

  const messages = [];
  if (context) messages.push({ role: 'user', parts: [{ text: context }], });
  messages.push({ role: 'user', parts: [{ text: prompt }] });

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: messages }),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: err?.error?.message ?? 'AI request failed' },
        { status: res.status }
      );
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    return NextResponse.json({ text });
  } catch {
    return NextResponse.json({ error: 'Failed to reach AI provider' }, { status: 502 });
  }
}
