import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import healthRoutes from './routes/healthRoutes.js';
import workspaceRoutes from './routes/workspaceRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  // CORS configuration
  const allowedOrigins = (env.frontendUrl || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const normalized = origin.replace(/\/$/, '');
        if (
          allowedOrigins.includes('*') ||
          allowedOrigins.includes(normalized) ||
          normalized.endsWith('.vercel.app') ||
          normalized.includes('localhost')
        ) {
          return callback(null, true);
        }
        return callback(null, true);
      },
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
  app.use('/api/v1/ai', aiRoutes);

  // 404 & Centralized Error Handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export const app = createApp();
