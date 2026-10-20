import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Ghost,
  LayoutDashboard,
  FolderGit2,
  Clock,
  Search,
  Settings,
  PlusCircle,
  Database,
  Cpu,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';

export default function AppLayout() {
  const { workspaces, activeWorkspace, selectWorkspace, systemStatus } = useWorkspace();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const navItems = [
    { name: 'Overview', path: '/', icon: LayoutDashboard },
    { name: 'Workspaces', path: '/workspaces', icon: FolderGit2 },
    { name: 'Session History', path: '/sessions', icon: Clock },
    { name: 'Search Memory', path: '/search', icon: Search },
    { name: 'Settings', path: '/settings', icon: Settings }
  ];

  const isDbConnected = systemStatus?.database?.connected;
  const isAiConnected = systemStatus?.aiEngine?.connected;
  const isModelReady = systemStatus?.aiEngine?.modelAvailable;

  return (
    <div className="flex h-screen bg-ghost-bg overflow-hidden text-slate-200">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-ghost-sidebar border-r border-ghost-border flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-ghost-border">
          <NavLink to="/" className="flex items-center gap-2.5 font-bold text-white tracking-wide group">
            <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-400 group-hover:scale-105 transition-transform shadow-lg shadow-violet-500/10">
              <Ghost className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-semibold tracking-tight text-white">ContextGhost</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 font-medium border border-violet-500/30">
                  v0.1
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-normal">Work Memory Assistant</p>
            </div>
          </NavLink>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workspace Selector Dropdown */}
        <div className="p-3 border-b border-ghost-border/80">
          <label className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 px-2 block mb-1">
            Current Workspace
          </label>
          <div className="relative">
            <button
              onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-ghost-surface hover:bg-slate-800 border border-ghost-border text-left transition-colors"
            >
              <div className="flex items-center gap-2 truncate">
                <FolderGit2 className="w-4 h-4 text-violet-400 shrink-0" />
                <span className="text-xs font-medium text-slate-200 truncate">
                  {activeWorkspace ? activeWorkspace.name : 'No workspace selected'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {workspaceMenuOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-ghost-card border border-ghost-border rounded-lg shadow-2xl py-1 z-50 max-h-56 overflow-y-auto">
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      selectWorkspace(ws);
                      setWorkspaceMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                      activeWorkspace?.id === ws.id ? 'bg-violet-600/15 text-violet-300 font-medium' : 'text-slate-300'
                    }`}
                  >
                    <span className="truncate">{ws.name}</span>
                    {activeWorkspace?.id === ws.id && (
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
                    )}
                  </button>
                ))}
                <div className="border-t border-ghost-border mt-1 pt-1">
                  <NavLink
                    to="/workspaces"
                    onClick={() => setWorkspaceMenuOpen(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-violet-400 hover:text-violet-300 hover:bg-slate-800/80"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Manage / Register Workspaces</span>
                  </NavLink>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-violet-600/20 text-violet-200 border border-violet-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-violet-400' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Quick Capture CTA inside Sidebar */}
        <div className="p-3">
          <NavLink
            to="/capture"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium text-xs shadow-lg shadow-violet-600/20 transition-all hover:shadow-violet-600/30 active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Capture Session</span>
          </NavLink>
        </div>

        {/* System Health Indicators */}
        <div className="p-3 mx-3 mb-3 rounded-lg bg-ghost-surface/60 border border-ghost-border space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              <span>PostgreSQL</span>
            </div>
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded ${
                isDbConnected
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isDbConnected ? 'bg-emerald-400' : 'bg-rose-400'}`} />
              {isDbConnected ? 'Connected' : 'Offline'}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Cpu className="w-3.5 h-3.5 text-slate-400" />
              <span>Ollama AI</span>
            </div>
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded ${
                isAiConnected && isModelReady
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : isAiConnected
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'bg-slate-700/50 text-slate-400 border border-slate-600'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isAiConnected && isModelReady
                    ? 'bg-emerald-400'
                    : isAiConnected
                    ? 'bg-amber-400'
                    : 'bg-slate-500'
                }`}
              />
              {isAiConnected && isModelReady
                ? 'Model Ready'
                : isAiConnected
                ? 'Pull Needed'
                : 'Offline'}
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navigation */}
        <header className="h-16 bg-ghost-bg/80 backdrop-blur-md border-b border-ghost-border flex items-center justify-between px-4 lg:px-8 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 hidden sm:inline">Active Project:</span>
              <span className="px-2.5 py-1 rounded-md bg-ghost-card border border-ghost-border text-xs font-medium text-slate-200">
                {activeWorkspace ? activeWorkspace.name : 'Select Workspace'}
              </span>
            </div>
          </div>

          {/* Quick Search and Action */}
          <div className="flex items-center gap-3">
            <form onSubmit={handleSearchSubmit} className="relative hidden md:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search work memory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 lg:w-72 pl-9 pr-3 py-1.5 text-xs bg-ghost-card border border-ghost-border rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
              />
            </form>

            <NavLink
              to="/capture"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium shadow-md shadow-violet-600/20 transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Capture</span>
            </NavLink>
          </div>
        </header>

        {/* Scrollable View Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
