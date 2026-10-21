import express from 'express';
import { getActiveAiProvider } from '../ai/providerFactory.js';
import { successResponse, errorResponse } from '../utils/response.js';

const router = express.Router();

/**
 * GET /api/v1/ai/status
 * Check configuration and readiness of the active AI provider without exposing keys or headers
 */
router.get('/status', async (req, res) => {
  try {
    const provider = getActiveAiProvider();
    const health = await provider.checkHealth();

    const safeStatus = {
      provider: health.provider,
      configured: Boolean(health.connected || health.configuredModel !== 'Unconfigured'),
      configuredModel: health.configuredModel || 'Not configured',
      connected: Boolean(health.connected),
      modelAvailable: Boolean(health.modelAvailable),
      error: health.error || null,
      instructions: health.instructions || null
    };

    return successResponse(res, safeStatus, 'AI provider status checked');
  } catch (err) {
    return errorResponse(res, 'Failed to inspect AI provider readiness', 500, err.message);
  }
});

export default router;
