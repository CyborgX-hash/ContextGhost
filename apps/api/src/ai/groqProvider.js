import { env } from '../config/env.js';

/**
 * Groq Cloud AI Provider abstraction (Ultra-fast, Free-tier inference)
 */
export class GroqProvider {
  constructor(apiKey = env.groqApiKey, defaultModel = env.groqModel, timeoutMs = 30000) {
    this.apiKey = apiKey;
    this.defaultModel = defaultModel || 'qwen/qwen3.8-27b';
    this.timeoutMs = timeoutMs;
    this.baseUrl = 'https://api.groq.com/openai/v1';
  }

  /**
   * Check connection to Groq API
   */
  async checkHealth() {
    if (!this.apiKey) {
      return {
        connected: false,
        provider: 'groq',
        configuredModel: this.defaultModel,
        modelAvailable: false,
        error: 'GROQ_API_KEY is not set.'
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        return {
          connected: false,
          provider: 'groq',
          configuredModel: this.defaultModel,
          modelAvailable: false,
          error: `Groq authentication error [HTTP ${response.status}]: ${errorText}`
        };
      }

      const data = await response.json();
      const availableModels = (data.data || []).map((m) => m.id);
      const isDefaultModelAvailable = availableModels.includes(this.defaultModel);

      return {
        connected: true,
        provider: 'groq',
        baseUrl: this.baseUrl,
        configuredModel: this.defaultModel,
        modelAvailable: isDefaultModelAvailable || availableModels.length > 0,
        availableModels
      };
    } catch (err) {
      return {
        connected: false,
        provider: 'groq',
        baseUrl: this.baseUrl,
        configuredModel: this.defaultModel,
        modelAvailable: false,
        error: err.name === 'AbortError' ? 'Groq connection timed out' : err.message
      };
    }
  }

  /**
   * Call Groq chat completion API (OpenAI-compatible)
   */
  async generate({ prompt, system, model = this.defaultModel, format = 'json', temperature = 0.2 }) {
    if (!this.apiKey) {
      throw new Error('Groq generation failed: GROQ_API_KEY is not configured.');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const messages = [];
      if (system) {
        messages.push({ role: 'system', content: system });
      }
      messages.push({ role: 'user', content: prompt });

      const payload = {
        model,
        messages,
        temperature,
        ...(format === 'json' ? { response_format: { type: 'json_object' } } : {})
      };

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq generation failed [HTTP ${response.status}]: ${errorText}`);
      }

      const result = await response.json();
      const content = result.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('Groq returned an empty response choice.');
      }

      return {
        response: content,
        model: result.model || model,
        usage: result.usage
      };
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error(`Groq request timed out after ${this.timeoutMs}ms`);
      }
      throw err;
    }
  }
}

export const groqProvider = new GroqProvider();
