import { app } from './app.js';
import { env } from './config/env.js';
import { checkDatabaseConnection } from './db/prisma.js';
import { ollamaProvider } from './ai/ollamaProvider.js';

async function startServer() {
  console.log('👻 Initializing ContextGhost API server...');

  // Database check
  const dbHealth = await checkDatabaseConnection();
  if (dbHealth.connected) {
    console.log('✅ PostgreSQL connection verified.');
  } else {
    console.warn(`⚠️ PostgreSQL connection warning: ${dbHealth.error}`);
  }

  // Ollama check
  const aiHealth = await ollamaProvider.checkHealth();
  if (aiHealth.connected) {
    console.log(`✅ Local Ollama engine reachable at ${aiHealth.baseUrl}`);
    if (aiHealth.modelAvailable) {
      console.log(`✅ Configured model ready: ${aiHealth.configuredModel}`);
    } else {
      console.warn(`⚠️ Model "${aiHealth.configuredModel}" not found in Ollama library. Available models: ${aiHealth.availableModels.join(', ') || 'none'}`);
    }
  } else {
    console.warn(`⚠️ Ollama offline or unreachable at ${aiHealth.baseUrl}. Run "ollama serve" to enable local AI.`);
  }

  app.listen(env.port, () => {
    console.log(`🚀 ContextGhost API running at http://localhost:${env.port}`);
    console.log(`   Health check: http://localhost:${env.port}/api/v1/health`);
    console.log(`   System status: http://localhost:${env.port}/api/v1/system/status`);
  });
}

startServer().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
