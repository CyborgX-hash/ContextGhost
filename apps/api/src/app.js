import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import healthRoutes from './routes/healthRoutes.js';
import workspaceRoutes from './routes/workspaceRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  // CORS configuration
  app.use(
    cors({
      origin: env.frontendUrl,
      credentials: true
    })
  );

  // Body parser with safe payload limits
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));

  // API v1 routes
  app.use('/api/v1', healthRoutes);
  app.use('/api/v1/workspaces', workspaceRoutes);
  app.use('/api/v1/sessions', sessionRoutes);
  app.use('/api/v1/search', searchRoutes);

  // 404 & Centralized Error Handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export const app = createApp();
