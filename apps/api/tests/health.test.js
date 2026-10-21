import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

describe('API Health Endpoints', () => {
  it('GET /api/v1/health returns 200 and status ok', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ok');
  });

  it('GET /api/v1/system/status returns database and AI status', async () => {
    const res = await request(app).get('/api/v1/system/status');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('database');
    expect(res.body.data).toHaveProperty('aiEngine');
    expect(res.body.data.database.connected).toBe(true);
  });

  it('GET /api/v1/ai/status returns provider readiness without exposing secrets', async () => {
    const res = await request(app).get('/api/v1/ai/status');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('provider');
    expect(res.body.data).toHaveProperty('configured');
    expect(res.body.data).toHaveProperty('configuredModel');
    expect(res.body.data).toHaveProperty('connected');

    // Security check: Must never leak API keys or authorization headers
    const jsonStr = JSON.stringify(res.body);
    expect(jsonStr).not.toContain('Bearer');
    expect(jsonStr).not.toContain('apiKey');
    expect(jsonStr).not.toContain('sk-');
  });

  it('GET /unknown-route returns 404 with structured error', async () => {
    const res = await request(app).get('/api/v1/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Route not found');
  });
});
