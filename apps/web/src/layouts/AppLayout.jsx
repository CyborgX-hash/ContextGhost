import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutGrid,
  BarChart2,
  Folder,
  MessageSquare,
  Clock,
  Sparkles,
  GitFork,
  Terminal,
  FileText,
  Layers,
  Cpu,
  Database,
  Sliders,
  Menu,
  X,
  Search,
  Bell,
  RotateCw,
  PlusCircle,
  Activity
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';

export default function AppLayout() {
  const { workspaces, activeWorkspace, selectWorkspace, systemStatus, refreshSystemStatus, refreshWorkspaces } = useWorkspace();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refreshSystemStatus(), refreshWorkspaces()]);
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  const isDbConnected = systemStatus?.database?.connected;
  const isAiConnected = systemStatus?.aiEngine?.connected;
  const isModelReady = systemStatus?.aiEngine?.modelAvailable;

  return (
    <div className="flex h-screen bg-[#0b0f19] overflow-hidden text-slate-200 font-sans">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 bg-[#090d16] border-r border-[#1a2233] flex flex-col justify-between transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 overflow-y-auto">
          {/* Brand Header */}
          <div className="flex items-center justify-between h-14 px-5 border-b border-[#1a2233]">
            <NavLink to="/" className="flex items-center gap-2.5 font-bold text-white tracking-wide">
              <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                <LayoutGrid className="w-4 h-4" />
              </div>
              <span className="text-base font-bold tracking-tight text-white">ContextGhost</span>
            </NavLink>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Sections */}
          <div className="py-2 space-y-4">
            {/* WORK MEMORY Section */}
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 py-1.5">
                WORK MEMORY
              </div>
              <div className="space-y-0.5 px-2">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      isActive && location.pathname === '/'
                        ? 'text-white bg-slate-800/60'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`
                  }
                >
                  <BarChart2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Dashboard</span>
                </NavLink>

                <NavLink
                  to="/workspaces"
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'text-white bg-slate-800/60'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`
                  }
                >
                  <Folder className="w-3.5 h-3.5 text-slate-400" />
                  <span>Workspaces</span>
                </NavLink>

                <NavLink
                  to="/capture"
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'text-white bg-slate-800/60'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`
                  }
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>Capture Session</span>
                </NavLink>

                <NavLink
                  to="/sessions"
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'text-white bg-slate-800/60'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`
                  }
                >
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Session History</span>
                </NavLink>

                <NavLink
                  to="/search"
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'text-white bg-slate-800/60'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`
                  }
                >
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  <span>Search Memory</span>
                </NavLink>
              </div>
            </div>

            {/* DEVELOPER CONTEXT Section */}
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 py-1.5">
                DEVELOPER CONTEXT
              </div>
              <div className="space-y-0.5 px-2">
                <NavLink
                  to="/"
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-blue-600/15 text-blue-400 border-l-2 border-blue-500 shadow-sm transition-all"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  <span>Active Plans</span>
                </NavLink>

                <NavLink
                  to="/sessions"
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 transition-colors"
                >
                  <GitFork className="w-3.5 h-3.5 text-slate-400" />
                  <span>Git Diffs & Patches</span>
                </NavLink>

                <NavLink
                  to="/sessions"
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 transition-colors"
                >
                  <Terminal className="w-3.5 h-3.5 text-slate-400" />
                  <span>Terminal Logs</span>
                </NavLink>
              </div>
            </div>

            {/* SYSTEM HEALTH Section */}
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 py-1.5">
                SYSTEM HEALTH
              </div>
              <div className="space-y-0.5 px-2">
                <div className="flex items-center justify-between px-3 py-1.5 rounded-md text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2.5">
                    <Cpu className="w-3.5 h-3.5 text-slate-400" />
                    <span>AI ({systemStatus?.aiEngine?.provider?.toUpperCase() || 'HOSTED'})</span>
                  </div>
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isAiConnected && isModelReady ? 'bg-emerald-400' : isAiConnected ? 'bg-amber-400' : 'bg-slate-600'
                    }`}
                  />
                </div>

                <div className="flex items-center justify-between px-3 py-1.5 rounded-md text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2.5">
                    <Database className="w-3.5 h-3.5 text-slate-400" />
                    <span>PostgreSQL DB</span>
                  </div>
                  <span className={`w-1.5 h-1.5 rounded-full ${isDbConnected ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer Settings */}
        <div className="p-3 border-t border-[#1a2233]">
          <NavLink
            to="/settings"
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span>Settings & Diagnostics</span>
          </NavLink>
        </div>
      </aside>

      {/* Main Content View */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#0b0f19]">
        {/* Top Navigation Bar */}
        <header className="h-14 bg-[#0b0f19] border-b border-[#1a2233] flex items-center justify-between px-4 lg:px-6 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 text-xs">
              <Menu className="w-4 h-4 text-slate-500 hidden lg:block" />
              <span className="text-slate-400">Workspace</span>
              <span className="text-slate-600">/</span>
              <span className="text-white font-medium">Work Memory</span>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Search Input with Ctrl+K */}
            <form onSubmit={handleSearchSubmit} className="relative hidden md:block">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search memory, diffs, notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 lg:w-64 pl-8 pr-12 py-1.5 text-xs bg-[#121826] border border-[#1a2233] rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-500 bg-[#090d16] px-1.5 py-0.5 rounded border border-[#1a2233]">
                Ctrl+K
              </span>
            </form>

            {/* Notification Bell with 99+ */}
            <div className="relative">
              <button className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                <Bell className="w-4 h-4" />
              </button>
              <span className="absolute -top-1 -right-1 text-[9px] font-bold text-white bg-blue-600 rounded-full px-1 py-0.2 leading-tight">
                3
              </span>
            </div>

            {/* Primary Blue Button: Capture Session */}
            <NavLink
              to="/capture"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Capture Session</span>
            </NavLink>

            {/* Secondary Button: Refresh */}
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#121826] hover:bg-slate-800 border border-[#1a2233] text-slate-300 text-xs font-medium transition-colors"
            >
              <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-400' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </header>

        {/* Main Scrollable View */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-[#0b0f19]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
