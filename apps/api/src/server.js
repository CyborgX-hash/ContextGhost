import { app } from './app.js';
import { env } from './config/env.js';
import { checkDatabaseConnection } from './db/prisma.js';
import { getActiveAiProvider } from './ai/providerFactory.js';

async function startServer() {
  console.log('👻 Initializing ContextGhost API server...');

  // Database check
  const dbHealth = await checkDatabaseConnection();
  if (dbHealth.connected) {
    console.log('✅ PostgreSQL connection verified.');
  } else {
    console.warn(`⚠️ PostgreSQL connection warning: ${dbHealth.error}`);
  }

  // Active AI Provider check
  const aiProvider = getActiveAiProvider();
  const aiHealth = await aiProvider.checkHealth();
  if (aiHealth.connected) {
    console.log(`✅ AI Provider (${aiHealth.provider}) ready. Model: ${aiHealth.configuredModel}`);
  } else {
    console.warn(`⚠️ AI Provider (${aiHealth.provider}) warning: ${aiHealth.error}`);
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
