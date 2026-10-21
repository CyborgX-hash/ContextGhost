import { env } from '../config/env.js';

/**
 * OpenRouter Hosted Open-Weight AI Provider
 * Communicates with OpenRouter OpenAI-compatible chat completions endpoint.
 * Ensures security: API keys are never logged, never exposed to clients.
 */
export class OpenRouterProvider {
  constructor({
    apiKey = env.openrouterApiKey,
    baseUrl = env.openrouterBaseUrl,
    defaultModel = env.openrouterModel,
    timeoutMs = env.aiTimeoutMs,
    maxRetries = env.aiMaxRetries
  } = {}) {
    this.apiKey = apiKey;
    this.baseUrl = (baseUrl || 'https://openrouter.ai/api/v1').replace(/\/$/, '');
    this.defaultModel = defaultModel || '';
    this.timeoutMs = timeoutMs || 60000;
    this.maxRetries = typeof maxRetries === 'number' ? maxRetries : 1;
    this.providerName = 'openrouter';
  }

  /**
   * Health and readiness verification without exposing secrets
   */
  async checkHealth() {
    if (!this.apiKey) {
      return {
        connected: false,
        provider: 'openrouter',
        configuredModel: this.defaultModel || 'Unconfigured',
        modelAvailable: false,
        error: 'OPENROUTER_API_KEY is not configured in backend environment variables.',
        instructions: 'Add OPENROUTER_API_KEY and OPENROUTER_MODEL to your environment variables (e.g. on Render).'
      };
    }

    if (!this.defaultModel) {
      return {
        connected: false,
        provider: 'openrouter',
        configuredModel: 'Unconfigured',
        modelAvailable: false,
        error: 'OPENROUTER_MODEL is not configured in backend environment variables.',
        instructions: 'Select an open-weight model (e.g. meta-llama/llama-3.3-70b-instruct, qwen/qwen-2.5-72b-instruct) and set OPENROUTER_MODEL.'
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'HTTP-Referer': 'https://github.com/CyborgX-hash/ContextGhost',
          'X-Title': 'ContextGhost'
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.status === 401) {
        return {
          connected: false,
          provider: 'openrouter',
          configuredModel: this.defaultModel,
          modelAvailable: false,
          error: 'Authentication failed: OPENROUTER_API_KEY is invalid or unauthorized.'
        };
      }

      if (response.status === 402) {
        return {
          connected: false,
          provider: 'openrouter',
          configuredModel: this.defaultModel,
          modelAvailable: false,
          error: 'Payment required: OpenRouter account has exhausted credits or has insufficient balance.'
        };
      }

      if (!response.ok) {
        const errorText = await response.text();
        return {
          connected: false,
          provider: 'openrouter',
          configuredModel: this.defaultModel,
          modelAvailable: false,
          error: `OpenRouter returned HTTP status ${response.status}: ${errorText.substring(0, 200)}`
        };
      }

      const data = await response.json();
      const availableModels = (data.data || []).map((m) => m.id);
      const isDefaultModelAvailable = availableModels.includes(this.defaultModel);

      return {
        connected: true,
        provider: 'openrouter',
        baseUrl: this.baseUrl,
        configuredModel: this.defaultModel,
        modelAvailable: isDefaultModelAvailable || availableModels.length > 0,
        availableModelsCount: availableModels.length
      };
    } catch (err) {
      return {
        connected: false,
        provider: 'openrouter',
        baseUrl: this.baseUrl,
        configuredModel: this.defaultModel,
        modelAvailable: false,
        error: err.name === 'AbortError' ? 'Connection timed out while verifying OpenRouter' : err.message
      };
    }
  }

  /**
   * Chat completions generation with bounded retries and timeout protection
   */
  async generate({ prompt, system, model = this.defaultModel, format = 'json', temperature = 0.2 }) {
    if (!this.apiKey) {
      throw new Error('OpenRouter generation failed: OPENROUTER_API_KEY is not configured in backend environment variables.');
    }

    if (!model) {
      throw new Error('OpenRouter generation failed: No model configured. Please set OPENROUTER_MODEL in environment variables.');
    }

    const payload = {
      model,
      messages: [
        ...(system ? [{ role: 'system', content: system }] : []),
        { role: 'user', content: prompt }
      ],
      temperature
    };

    // Note: Request JSON mode when supported; outputValidator.js handles server-side schema validation & repair
    if (format === 'json') {
      payload.response_format = { type: 'json_object' };
    }

    let lastError = null;
    const totalAttempts = 1 + Math.max(0, this.maxRetries);

    for (let attempt = 1; attempt <= totalAttempts; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'HTTP-Referer': 'https://github.com/CyborgX-hash/ContextGhost',
            'X-Title': 'ContextGhost',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorBody = await response.text();
          let parsedError;
          try {
            parsedError = JSON.parse(errorBody);
          } catch {
            parsedError = { error: { message: errorBody } };
          }

          const rawMsg = parsedError?.error?.message || errorBody || `HTTP ${response.status}`;

          if (response.status === 401) {
            throw new Error(`OpenRouter authentication error: Invalid or missing API key (${rawMsg})`);
          }
          if (response.status === 402) {
            throw new Error(`OpenRouter credit error: Account has exhausted credits or insufficient funds (${rawMsg})`);
          }
          if (response.status === 429) {
            throw new Error(`OpenRouter rate limit exceeded: ${rawMsg}`);
          }
          if (response.status === 404 || (response.status === 400 && /model/i.test(rawMsg))) {
            throw new Error(`OpenRouter model error: "${model}" is invalid, unavailable, or unsupported (${rawMsg})`);
          }
          if (response.status >= 500) {
            throw new Error(`OpenRouter service outage [HTTP ${response.status}]: ${rawMsg}`);
          }

          throw new Error(`OpenRouter request failed [HTTP ${response.status}]: ${rawMsg}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content || typeof content !== 'string') {
          throw new Error('OpenRouter returned an empty or malformed completion content.');
        }

        return {
          response: content,
          model: data.model || model,
          usage: data.usage
        };
      } catch (err) {
        clearTimeout(timeoutId);

        if (err.name === 'AbortError') {
          lastError = new Error(`OpenRouter request timed out after ${this.timeoutMs}ms`);
        } else {
          lastError = err;
        }

        // Bounded retry with exponential backoff on retryable network/server errors
        if (attempt < totalAttempts && !/authentication|credit error/i.test(lastError.message)) {
          await new Promise((r) => setTimeout(r, 1000 * attempt));
        } else {
          break;
        }
      }
    }

    throw lastError;
  }
}

export const openrouterProvider = new OpenRouterProvider();
