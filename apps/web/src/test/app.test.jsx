import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../App';

describe('ContextGhost App Frontend', () => {
  beforeEach(() => {
    // Mock global fetch for API calls
    global.fetch = vi.fn((url) => {
      if (url.includes('/api/v1/workspaces')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: [
                {
                  id: 'ws-123',
                  name: 'ContextGhost',
                  rootPath: '/Users/test/Context-Ghost',
                  _count: { sessions: 2 },
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
                aiEngine: { connected: true, modelAvailable: true, configuredModel: 'qwen/qwen3.8-27b' }
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
              data: {
                total: 1,
                sessions: [
                  {
                    id: 'sess-1',
                    workspaceId: 'ws-123',
                    title: 'Hosted Open-Weight AI Provider Integration',
                    summary: 'Added OpenRouterProvider with support for open-weight models on Render.',
                    capturedAt: new Date().toISOString(),
                    captureStatus: 'SUCCESS',
                    analysis: {
                      displayStatus: 'In Progress',
                      tag: 'feature'
                    },
                    workspace: { name: 'ContextGhost' }
                  }
                ]
              }
            })
        });
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: {} })
      });
    });
  });

  it('renders dashboard brand and sidebar sections', async () => {
    render(<App />);

    expect(screen.getAllByText('ContextGhost').length).toBeGreaterThan(0);
    expect(screen.getByText('WORK MEMORY')).toBeInTheDocument();
    expect(screen.getByText('DEVELOPER CONTEXT')).toBeInTheDocument();
    expect(screen.getAllByText('Workspaces').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Active Plans').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Capture Session').length).toBeGreaterThan(0);
  });

  it('renders top KPI metric cards and session card in grid', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('RESUMPTION READINESS')).toBeInTheDocument();
      expect(screen.getByText('WORK PIPELINE')).toBeInTheDocument();
      expect(screen.getByText('30-DAY ACTIVITY')).toBeInTheDocument();
      expect(screen.getByText('WORKSPACE COVERAGE')).toBeInTheDocument();
      expect(screen.getByText(/Hosted Open-Weight AI Provider Integration/i)).toBeInTheDocument();
    });
  });
});
