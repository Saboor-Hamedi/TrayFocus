// DeepSeek API provider
// Docs: https://api-docs.deepseek.com/

const ENDPOINT = 'https://api.deepseek.com/v1/chat/completions';

export async function chat(messages, apiKey, { model = 'deepseek-chat', temperature = 0.7, maxTokens = 2048, signal } = {}) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: false,
    }),
    signal,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `DeepSeek API error ${res.status}`);
  }

  const data = await res.json();
  return {
    content: data.choices[0].message.content,
    usage: data.usage,
  };
}

export const name = 'DeepSeek';
export const defaultModel = 'deepseek-chat';
export const models = ['deepseek-chat', 'deepseek-reasoner'];
