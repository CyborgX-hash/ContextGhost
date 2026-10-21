import { env } from '../config/env.js';
import { openrouterProvider } from './openrouterProvider.js';
import { groqProvider } from './groqProvider.js';
import { ollamaProvider } from './ollamaProvider.js';

/**
 * Returns the active AI provider based on environment configuration.
 * - 'openrouter': OpenRouter hosted open-weight models (Default for Render/Vercel)
 * - 'groq': Groq cloud AI provider
 * - 'ollama': Local offline Ollama provider
 */
export function getActiveAiProvider() {
  const providerType = env.aiProvider?.toLowerCase();

  if (providerType === 'groq') {
    return groqProvider;
  }

  if (providerType === 'ollama') {
    return ollamaProvider;
  }

  // Default is openrouter
  return openrouterProvider;
}

export const activeAiProvider = getActiveAiProvider();
