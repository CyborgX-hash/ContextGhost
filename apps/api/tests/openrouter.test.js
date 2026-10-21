import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpenRouterProvider } from '../src/ai/openrouterProvider.js';

describe('OpenRouterProvider', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('reports offline and instructions if OPENROUTER_API_KEY is missing', async () => {
    const provider = new OpenRouterProvider({
      apiKey: '',
      defaultModel: 'meta-llama/llama-3.3-70b-instruct'
    });

    const health = await provider.checkHealth();
    expect(health.connected).toBe(false);
    expect(health.provider).toBe('openrouter');
    expect(health.error).toContain('OPENROUTER_API_KEY is not configured');
    expect(health.instructions).toBeDefined();
  });

  it('reports offline if OPENROUTER_MODEL is missing', async () => {
    const provider = new OpenRouterProvider({
      apiKey: 'sk-or-v1-valid-key',
      defaultModel: ''
    });

    const health = await provider.checkHealth();
    expect(health.connected).toBe(false);
    expect(health.error).toContain('OPENROUTER_MODEL is not configured');
  });

  it('handles 401 authentication error gracefully', async () => {
    const fakeFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => 'Unauthorized: Invalid API key'
    });
    globalThis.fetch = fakeFetch;

    const provider = new OpenRouterProvider({
      apiKey: 'sk-or-v1-invalid-key',
      defaultModel: 'meta-llama/llama-3.3-70b-instruct'
    });

    const health = await provider.checkHealth();
    expect(health.connected).toBe(false);
    expect(health.error).toContain('Authentication failed');
  });

  it('handles 402 payment required / credit exhaustion', async () => {
    const fakeFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 402,
      text: async () => '{"error":{"message":"Credit balance is too low"}}'
    });
    globalThis.fetch = fakeFetch;

    const provider = new OpenRouterProvider({
      apiKey: 'sk-or-v1-no-credits',
      defaultModel: 'meta-llama/llama-3.3-70b-instruct'
    });

    const health = await provider.checkHealth();
    expect(health.connected).toBe(false);
    expect(health.error).toContain('Payment required');
  });

  it('handles 429 rate limit during generation', async () => {
    const fakeFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      text: async () => JSON.stringify({ error: { message: 'Rate limit exceeded' } })
    });
    globalThis.fetch = fakeFetch;

    const provider = new OpenRouterProvider({
      apiKey: 'sk-or-v1-key',
      defaultModel: 'meta-llama/llama-3.3-70b-instruct',
      maxRetries: 0
    });

    await expect(
      provider.generate({
        prompt: 'Summarize work',
        system: 'You are ContextGhost'
      })
    ).rejects.toThrow(/rate limit exceeded/i);
  });

  it('handles 400/404 invalid model ID error', async () => {
    const fakeFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      text: async () => JSON.stringify({ error: { message: 'Model not found' } })
    });
    globalThis.fetch = fakeFetch;

    const provider = new OpenRouterProvider({
      apiKey: 'sk-or-v1-key',
      defaultModel: 'nonexistent-model',
      maxRetries: 0
    });

    await expect(
      provider.generate({
        prompt: 'Summarize work',
        system: 'You are ContextGhost'
      })
    ).rejects.toThrow(/model error/i);
  });

  it('handles timeout when OpenRouter does not respond within timeoutMs', async () => {
    const abortError = new Error('The operation was aborted');
    abortError.name = 'AbortError';

    const fakeFetch = vi.fn().mockRejectedValue(abortError);
    globalThis.fetch = fakeFetch;

    const provider = new OpenRouterProvider({
      apiKey: 'sk-or-v1-key',
      defaultModel: 'meta-llama/llama-3.3-70b-instruct',
      timeoutMs: 100,
      maxRetries: 0
    });

    await expect(
      provider.generate({
        prompt: 'Summarize work',
        system: 'You are ContextGhost'
      })
    ).rejects.toThrow(/timed out/i);
  });

  it('successfully generates structured response with valid OpenRouter completion', async () => {
    const fakeResponse = {
      id: 'gen-12345',
      model: 'meta-llama/llama-3.3-70b-instruct',
      choices: [
        {
          message: {
            role: 'assistant',
            content: JSON.stringify({
              sessionTitle: 'OpenRouter Work Session',
              mainObjective: 'Implement hosted open-weight AI integration',
              summary: 'Added OpenRouterProvider with timeout protection and schema validation.',
              accomplishments: ['Created provider', 'Handled 401/402/429'],
              modifiedFiles: [{ path: 'openrouterProvider.js', changeType: 'added' }],
              unresolvedIssues: [],
              nextActions: [{ title: 'Deploy on Render', priority: 1 }]
            })
          }
        }
      ],
      usage: { prompt_tokens: 150, completion_tokens: 95 }
    };

    const fakeFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => fakeResponse
    });
    globalThis.fetch = fakeFetch;

    const provider = new OpenRouterProvider({
      apiKey: 'sk-or-v1-valid-key',
      defaultModel: 'meta-llama/llama-3.3-70b-instruct',
      maxRetries: 0
    });

    const result = await provider.generate({
      prompt: 'Synthesize context',
      system: 'Output JSON schema',
      format: 'json'
    });

    expect(result.model).toBe('meta-llama/llama-3.3-70b-instruct');
    expect(result.response).toContain('OpenRouter Work Session');
    expect(fakeFetch).toHaveBeenCalledTimes(1);

    const callArgs = fakeFetch.mock.calls[0];
    const headers = callArgs[1].headers;
    expect(headers.Authorization).toBe('Bearer sk-or-v1-valid-key');
    expect(headers['HTTP-Referer']).toBe('https://github.com/CyborgX-hash/ContextGhost');
    expect(headers['X-Title']).toBe('ContextGhost');
  });
});
