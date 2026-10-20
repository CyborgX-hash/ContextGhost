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
                  name: 'project_dashboard',
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
                aiEngine: { connected: true, modelAvailable: true, configuredModel: 'qwen2.5:1.5b' }
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
                    title: 'Scheduled Tasks - Dashboard-Seite + RemoteTrigger',
                    summary: 'Das Project Dashboard soll eine neue Seite Scheduled Tasks bekommen.',
                    capturedAt: new Date().toISOString(),
                    captureStatus: 'SUCCESS',
                    analysis: {
                      displayStatus: 'Aktiv',
                      tag: 'feature'
                    },
                    workspace: { name: 'project_dashboard' }
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

    expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0);
    expect(screen.getByText('WORKSPACE')).toBeInTheDocument();
    expect(screen.getByText('DEVOPS')).toBeInTheDocument();
    expect(screen.getAllByText('Projekte').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Plans').length).toBeGreaterThan(0);
    expect(screen.getByText('Importieren')).toBeInTheDocument();
  });

  it('renders top KPI metric cards and session card in grid', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('UMSETZUNG')).toBeInTheDocument();
      expect(screen.getByText('PIPELINE')).toBeInTheDocument();
      expect(screen.getByText('AKTIVITAET')).toBeInTheDocument();
      expect(screen.getByText('ABDECKUNG')).toBeInTheDocument();
      expect(screen.getByText(/Scheduled Tasks - Dashboard-Seite/i)).toBeInTheDocument();
    });
  });
});
