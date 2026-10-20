import { env } from '../config/env.js';

/**
 * Ollama Local AI Provider abstraction
 */
export class OllamaProvider {
  constructor(baseUrl = env.ollamaBaseUrl, defaultModel = env.ollamaModel, timeoutMs = env.ollamaTimeoutMs) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.defaultModel = defaultModel;
    this.timeoutMs = timeoutMs;
  }

  /**
   * Check connection to Ollama instance
   */
  async checkHealth() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(`${this.baseUrl}/api/tags`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          connected: false,
          error: `Ollama returned HTTP status ${response.status}`
        };
      }

      const data = await response.json();
      const availableModels = (data.models || []).map((m) => m.name);
      const isDefaultModelAvailable = availableModels.some(
        (name) => name === this.defaultModel || name.startsWith(`${this.defaultModel}:`)
      );

      return {
        connected: true,
        baseUrl: this.baseUrl,
        configuredModel: this.defaultModel,
        modelAvailable: isDefaultModelAvailable,
        availableModels
      };
    } catch (err) {
      return {
        connected: false,
        baseUrl: this.baseUrl,
        configuredModel: this.defaultModel,
        modelAvailable: false,
        availableModels: [],
        error: err.name === 'AbortError' ? 'Connection timed out' : err.message
      };
    }
  }

  /**
   * Call Ollama generate API
   */
  async generate({ prompt, system, model = this.defaultModel, format = 'json', temperature = 0.2 }) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const payload = {
        model,
        prompt,
        system,
        stream: false,
        format,
        options: {
          temperature
        }
      };

      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama generation failed [HTTP ${response.status}]: ${errorText}`);
      }

      const result = await response.json();
      return {
        response: result.response,
        model: result.model,
        totalDuration: result.total_duration,
        evalCount: result.eval_count
      };
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error(`Ollama request timed out after ${this.timeoutMs}ms`);
      }
      throw err;
    }
  }
}

export const ollamaProvider = new OllamaProvider();
