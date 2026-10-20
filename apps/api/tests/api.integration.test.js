import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

describe('ContextGhost Core REST API Integration', () => {
  let createdWorkspaceId = null;
  let createdSessionId = null;

  it('GET /api/v1/workspaces returns workspaces array', async () => {
    const res = await request(app).get('/api/v1/workspaces');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    createdWorkspaceId = res.body.data[0].id;
  });

  it('GET /api/v1/workspaces/:id returns single workspace details', async () => {
    const res = await request(app).get(`/api/v1/workspaces/${createdWorkspaceId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(createdWorkspaceId);
  });

  it('GET /api/v1/workspaces/:id/inspect returns workspace git context', async () => {
    const res = await request(app).get(`/api/v1/workspaces/${createdWorkspaceId}/inspect`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('gitContext');
  });

  it('GET /api/v1/workspaces/:id/resume returns resume briefing', async () => {
    const res = await request(app).get(`/api/v1/workspaces/${createdWorkspaceId}/resume`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.hasSession).toBe(true);
    expect(res.body.data.session).toBeDefined();
    createdSessionId = res.body.data.session.id;
  });

  it('POST /api/v1/sessions/preview returns capture preview with sanitized fields', async () => {
    const res = await request(app)
      .post('/api/v1/sessions/preview')
      .send({
        workspaceId: createdWorkspaceId,
        notes: 'Working with token ghp_1234567890abcdefghijklmnopqrstuvwxyz',
        logs: 'Error: Connection failed'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.notes).toContain('[REDACTED_GITHUB_TOKEN]');
    expect(res.body.data.readyToCapture).toBe(true);
  });

  it('GET /api/v1/sessions returns paginated session list', async () => {
    const res = await request(app).get('/api/v1/sessions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('total');
    expect(Array.isArray(res.body.data.sessions)).toBe(true);
  });

  it('GET /api/v1/sessions/:id returns detailed session with relations', async () => {
    const res = await request(app).get(`/api/v1/sessions/${createdSessionId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(createdSessionId);
    expect(Array.isArray(res.body.data.files)).toBe(true);
    expect(Array.isArray(res.body.data.issues)).toBe(true);
    expect(Array.isArray(res.body.data.nextActions)).toBe(true);
  });

  it('POST /api/v1/sessions/:id/notes adds a new note to the session', async () => {
    const res = await request(app)
      .post(`/api/v1/sessions/${createdSessionId}/notes`)
      .send({ content: 'Tested auth flow and confirmed it succeeds.' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.content).toContain('Tested auth flow');
  });

  it('GET /api/v1/search queries sessions and returns matches', async () => {
    const res = await request(app).get('/api/v1/search?q=Demo');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
