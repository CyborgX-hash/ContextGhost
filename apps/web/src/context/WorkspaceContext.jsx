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
      setWorkspaces(data);

      // Restore saved active workspace or pick first available
      const savedId = localStorage.getItem('contextghost_active_ws');
      const found = data.find((w) => w.id === savedId) || data[0] || null;
      setActiveWorkspace(found);
      if (found) {
        localStorage.setItem('contextghost_active_ws', found.id);
      }
      setError(null);
    } catch (err) {
      console.error('Failed to load workspaces:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshSystemStatus = useCallback(async () => {
    try {
      const status = await api.getSystemStatus();
      setSystemStatus(status);
    } catch (err) {
      console.warn('System status check failed:', err);
      setSystemStatus({
        status: 'offline',
        database: { connected: false },
        aiEngine: { connected: false }
      });
    }
  }, []);

  useEffect(() => {
    refreshWorkspaces();
    refreshSystemStatus();

    // Periodic status poll every 20 seconds
    const interval = setInterval(refreshSystemStatus, 20000);
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
