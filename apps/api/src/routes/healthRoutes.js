import express from 'express';
import { checkDatabaseConnection } from '../db/prisma.js';
import { getActiveAiProvider } from '../ai/providerFactory.js';
import { successResponse, errorResponse } from '../utils/response.js';

const router = express.Router();

/**
 * Basic liveness check
 */
router.get('/health', async (req, res) => {
  return successResponse(res, { status: 'ok', uptime: process.uptime() }, 'ContextGhost API is live');
});

/**
 * Detailed readiness check for database and AI model
 */
router.get('/system/status', async (req, res) => {
  try {
    const dbStatus = await checkDatabaseConnection();
    const activeProvider = getActiveAiProvider();
    const aiStatus = await activeProvider.checkHealth();

    const overallHealthy = dbStatus.connected;

    const systemInfo = {
      version: '0.1.0',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      aiEngine: aiStatus,
      status: overallHealthy ? 'ready' : 'degraded'
    };

    return successResponse(res, systemInfo, 'System status retrieved');
  } catch (err) {
    return errorResponse(res, 'Failed to retrieve system status', 500, err.message);
  }
});

export default router;
