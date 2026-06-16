// Google Gemini API provider with streaming support
// Docs: https://ai.google.dev/gemini-api/docs

const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

export async function chat(messages, apiKey, { model = 'gemini-2.0-flash', temperature = 0.7, maxTokens = 2048, signal } = {}) {
  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : m.role === 'system' ? 'user' : m.role,
    parts: [{ text: m.role === 'system' ? `[System: ${m.content}]` : m.content }],
  }));

  const res = await fetch(`${ENDPOINT}/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: { temperature, maxOutputTokens: maxTokens },
    }),
    signal,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gemini API error ${res.status}`);
  }

  const data = await res.json();
  return {
    content: data.candidates[0].content.parts[0].text,
    usage: data.usageMetadata || {},
  };
}

export async function* stream(messages, apiKey, { model = 'gemini-2.0-flash', temperature = 0.7, maxTokens = 2048, signal } = {}) {
  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : m.role === 'system' ? 'user' : m.role,
    parts: [{ text: m.role === 'system' ? `[System: ${m.content}]` : m.content }],
  }));

  const res = await fetch(`${ENDPOINT}/${model}:streamGenerateContent?alt=sse&key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: { temperature, maxOutputTokens: maxTokens },
    }),
    signal,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gemini API error ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;
      const data = trimmed.slice(6);

      try {
        const parsed = JSON.parse(data);
        const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) yield text;
      } catch { /* skip */ }
    }
  }
}

export const name = 'Gemini';
export const defaultModel = 'gemini-2.0-flash';
export const models = ['gemini-2.0-flash', 'gemini-2.0-pro', 'gemini-1.5-pro'];
