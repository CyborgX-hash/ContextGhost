import { describe, it, expect, vi } from 'vitest';
import { GroqProvider } from '../src/ai/groqProvider.js';

describe('GroqProvider', () => {
  it('returns offline status if apiKey is missing', async () => {
    const provider = new GroqProvider('', 'qwen/qwen3.8-27b');
    const health = await provider.checkHealth();
    expect(health.connected).toBe(false);
    expect(health.error).toContain('GROQ_API_KEY is not set');
  });

  it('handles simulated successful generation', async () => {
    const fakeFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        model: 'qwen/qwen3.8-27b',
        choices: [
          {
            message: {
              content: JSON.stringify({ sessionTitle: 'Groq Synthesized Work' })
            }
          }
        ]
      })
    });

    globalThis.fetch = fakeFetch;

    const provider = new GroqProvider('fake-key', 'qwen/qwen3.8-27b');
    const result = await provider.generate({
      prompt: 'Summarize work',
      system: 'Output JSON',
      format: 'json'
    });

    expect(result.model).toBe('qwen/qwen3.8-27b');
    expect(result.response).toContain('Groq Synthesized Work');
  });
});
