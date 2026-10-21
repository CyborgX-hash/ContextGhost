import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children }) {
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshWorkspaces = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.listWorkspaces();
      if (Array.isArray(data) && data.length > 0) {
        setWorkspaces(data);

        // Restore saved active workspace or pick first available
        const savedId = localStorage.getItem('contextghost_active_ws');
        const found = data.find((w) => w.id === savedId) || data[0] || null;
        setActiveWorkspace(found);
        if (found) {
          localStorage.setItem('contextghost_active_ws', found.id);
        }
        setError(null);
      } else {
        setWorkspaces([]);
      }
    } catch (err) {
      console.warn('Failed to load workspaces:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshSystemStatus = useCallback(async () => {
    try {
      const status = await api.getSystemStatus();
      setSystemStatus(status);
      setError(null);
      // Auto-recover workspaces if they haven't loaded yet
      setWorkspaces((current) => {
        if (!current || current.length === 0) {
          refreshWorkspaces();
        }
        return current;
      });
    } catch (err) {
      console.warn('System status check failed:', err.message);
      setSystemStatus({
        status: 'offline',
        database: { connected: false },
        aiEngine: { connected: false }
      });
    }
  }, [refreshWorkspaces]);

  useEffect(() => {
    refreshWorkspaces();
    refreshSystemStatus();

    // Auto-poll health & workspaces every 5 seconds until connected, then every 15s
    const interval = setInterval(() => {
      refreshSystemStatus();
    }, 10000);
    return () => clearInterval(interval);
  }, [refreshWorkspaces, refreshSystemStatus]);

  const selectWorkspace = (workspace) => {
    setActiveWorkspace(workspace);
    if (workspace?.id) {
      localStorage.setItem('contextghost_active_ws', workspace.id);
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        selectWorkspace,
        refreshWorkspaces,
        systemStatus,
        refreshSystemStatus,
        loading,
        error
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
