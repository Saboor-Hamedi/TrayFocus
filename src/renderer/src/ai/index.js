import * as DeepSeek from './DeepSeek.js';
import * as Gemini from './Gemini.js';

export const providers = {
  deepseek: DeepSeek,
  gemini: Gemini,
};

export const defaultProvider = 'deepseek';

export function getProvider(id) {
  return providers[id] || providers[defaultProvider];
}

export async function sendMessage(providerId, messages, apiKey, options = {}) {
  const provider = getProvider(providerId);
  return provider.chat(messages, apiKey, options);
}
