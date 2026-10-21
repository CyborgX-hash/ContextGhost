import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WorkspaceProvider } from './context/WorkspaceContext';
import AppLayout from './layouts/AppLayout';
import OverviewDashboard from './pages/OverviewDashboard';
import WorkspacesPage from './pages/WorkspacesPage';
import CaptureSessionPage from './pages/CaptureSessionPage';
import SessionDetailPage from './pages/SessionDetailPage';
import SessionHistoryPage from './pages/SessionHistoryPage';
import SearchMemoryPage from './pages/SearchMemoryPage';
import SettingsPage from './pages/SettingsPage';
import UserGuidePage from './pages/UserGuidePage';

export default function App() {
  return (
    <WorkspaceProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<OverviewDashboard />} />
            <Route path="workspaces" element={<WorkspacesPage />} />
            <Route path="capture" element={<CaptureSessionPage />} />
            <Route path="sessions" element={<SessionHistoryPage />} />
            <Route path="sessions/:id" element={<SessionDetailPage />} />
            <Route path="search" element={<SearchMemoryPage />} />
            <Route path="guide" element={<UserGuidePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </WorkspaceProvider>
  );
}
