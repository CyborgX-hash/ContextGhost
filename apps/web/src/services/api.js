/**
 * ContextGhost Frontend API Client
 * Wraps REST calls to Express backend (/api/v1)
 */

const RAW_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || '/api/v1';
const BASE_URL = RAW_BASE.replace(/\/$/, '');

async function request(endpoint, options = {}) {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}${normalizedEndpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  try {
    const res = await fetch(url, { ...options, headers });
    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.message || `Request failed with status ${res.status}`);
    }

    return json.data;
  } catch (err) {
    console.error(`[API Error] ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // System & Health
  getHealth: () => request('/health'),
  getSystemStatus: () => request('/system/status'),
  getAiStatus: () => request('/ai/status'),

  // Workspaces
  listWorkspaces: () => request('/workspaces'),
  getWorkspace: (id) => request(`/workspaces/${id}`),
  createWorkspace: (data) => request('/workspaces', { method: 'POST', body: JSON.stringify(data) }),
  updateWorkspace: (id, data) => request(`/workspaces/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteWorkspace: (id) => request(`/workspaces/${id}`, { method: 'DELETE' }),
  inspectWorkspace: (id) => request(`/workspaces/${id}/inspect`),
  getResumeBriefing: (workspaceId) => request(`/workspaces/${workspaceId}/resume`),

  // Sessions
  listSessions: (params = {}) => {
    const query = new URLSearchParams();
    if (params.workspaceId) query.append('workspaceId', params.workspaceId);
    if (params.status) query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    if (params.limit) query.append('limit', params.limit);
    if (params.offset) query.append('offset', params.offset);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request(`/sessions${qs}`);
  },
  getSession: (id) => request(`/sessions/${id}`),
  previewCapture: (data) => request('/sessions/preview', { method: 'POST', body: JSON.stringify(data) }),
  captureSession: (data) => request('/sessions/capture', { method: 'POST', body: JSON.stringify(data) }),
  addSessionNote: (id, content) => request(`/sessions/${id}/notes`, { method: 'POST', body: JSON.stringify({ content }) }),
  deleteSession: (id) => request(`/sessions/${id}`, { method: 'DELETE' }),

  // Search Memory
  searchMemory: (query, workspaceId = '') => {
    const qs = new URLSearchParams({ q: query, ...(workspaceId ? { workspaceId } : {}) });
    return request(`/search?${qs.toString()}`);
  }
};
