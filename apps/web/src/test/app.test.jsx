import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../App';

describe('ContextGhost App Frontend', () => {
  beforeEach(() => {
    // Mock global fetch for API calls
    global.fetch = vi.fn((url) => {
      if (url.includes('/api/v1/workspaces') && !url.includes('/resume')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: [
                {
                  id: 'ws-123',
                  name: 'ContextGhost Core',
                  rootPath: '/Users/test/Context-Ghost',
                  _count: { sessions: 1 },
                  sessions: []
                }
              ]
            })
        });
      }

      if (url.includes('/api/v1/system/status')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: {
                status: 'ready',
                database: { connected: true },
                aiEngine: { connected: true, modelAvailable: true, configuredModel: 'qwen2.5:1.5b' }
              }
            })
        });
      }

      if (url.includes('/resume')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: {
                hasSession: true,
                session: {
                  id: 'sess-123',
                  title: 'Demo Work Session',
                  summary: 'Working on architecture setup',
                  capturedAt: new Date().toISOString(),
                  files: [],
                  issues: [],
                  nextActions: []
                },
                staleness: { notice: 'Recently captured', level: 'fresh' }
              }
            })
        });
      }

      if (url.includes('/api/v1/sessions')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: { total: 1, sessions: [] }
            })
        });
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: {} })
      });
    });
  });

  it('renders application brand and navigation links', async () => {
    render(<App />);

    expect(screen.getByText('ContextGhost')).toBeInTheDocument();
    expect(screen.getByText('Work Memory Assistant')).toBeInTheDocument();
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Workspaces')).toBeInTheDocument();
    expect(screen.getByText('Session History')).toBeInTheDocument();
  });

  it('loads active workspace and displays welcome header', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Welcome back to/i)).toBeInTheDocument();
      const workspaceElements = screen.getAllByText('ContextGhost Core');
      expect(workspaceElements.length).toBeGreaterThan(0);
    });
  });
});
