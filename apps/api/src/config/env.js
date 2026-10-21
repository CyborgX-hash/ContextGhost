import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from root or api folder
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

export function validateEnv() {
  const errors = [];

  const required = ['DATABASE_URL'];
  for (const key of required) {
    if (!process.env[key]) {
      errors.push(`Missing required environment variable: ${key}`);
    }
  }

  if (errors.length > 0) {
    const errorMsg = [
      '❌ Configuration Error in ContextGhost API:',
      ...errors.map((e) => `   - ${e}`),
      '👉 Please check your .env file or copy from .env.example.'
    ].join('\n');
    console.error(errorMsg);
    if (process.env.NODE_ENV !== 'test') {
      throw new Error(errorMsg);
    }
  }

  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '5001', 10),
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    databaseUrl: process.env.DATABASE_URL || 'postgresql://sakshamsontakke:@localhost:5432/contextghost?schema=public',
    // AI Provider selection: 'openrouter' (default hosted), 'groq', or 'ollama' (local)
    aiProvider: (process.env.AI_PROVIDER || 'openrouter').toLowerCase(),
    aiTimeoutMs: parseInt(process.env.AI_TIMEOUT_MS || '60000', 10),
    aiMaxRetries: parseInt(process.env.AI_MAX_RETRIES || '1', 10),

    // OpenRouter Hosted AI Engine
    openrouterApiKey: process.env.OPENROUTER_API_KEY || '',
    openrouterModel: process.env.OPENROUTER_MODEL || '',
    openrouterBaseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',

    // Groq Cloud AI Engine (optional alternative)
    groqApiKey: process.env.GROQ_API_KEY || '',
    groqModel: process.env.GROQ_MODEL || 'qwen/qwen3.8-27b',

    // Local Ollama AI Engine (optional local)
    ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    ollamaModel: process.env.OLLAMA_MODEL || 'qwen2.5:1.5b',
    ollamaTimeoutMs: parseInt(process.env.OLLAMA_TIMEOUT_MS || '120000', 10),

    maxContextChars: parseInt(process.env.SESSION_MAX_CONTEXT_CHARS || '30000', 10),
    maxLogBytes: parseInt(process.env.SESSION_MAX_LOG_BYTES || '1048576', 10),
    secretRedaction: process.env.SESSION_SECRET_REDACTION !== 'false'
  };
}

export const env = validateEnv();
