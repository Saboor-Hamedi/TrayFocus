// Google Gemini API provider
// Docs: https://ai.google.dev/gemini-api/docs

const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export async function chat(messages, apiKey, { temperature = 0.7, maxTokens = 2048 } = {}) {
  // Convert OpenAI-style messages to Gemini format
  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const res = await fetch(`${ENDPOINT}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: { temperature, maxOutputTokens: maxTokens },
    }),
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

export const name = 'Gemini';
export const defaultModel = 'gemini-2.0-flash';
export const models = ['gemini-2.0-flash', 'gemini-2.0-pro', 'gemini-1.5-pro'];
