import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Clock,
  FolderGit2,
  Search,
  Filter,
  FileCode2,
  AlertTriangle,
  ChevronRight,
  Trash2,
  Sparkles
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { api } from '../services/api';

export default function SessionHistoryPage() {
  const { workspaces, activeWorkspace } = useWorkspace();
  const [sessions, setSessions] = useState([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await api.listSessions({
        workspaceId: selectedWorkspaceId,
        status: selectedStatus,
        search: searchQuery
      });
      setSessions(data.sessions || []);
    } catch (err) {
      console.error('Failed to load session history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [selectedWorkspaceId, selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadSessions();
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Delete this session record?')) return;

    try {
      await api.deleteSession(id);
      await loadSessions();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-violet-400" />
            <span>Session History</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse and resume all persistent work memories captured across your workspaces.
          </p>
        </div>

        <NavLink
          to="/capture"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs shadow-lg shadow-violet-600/20 transition-all self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Capture Session</span>
        </NavLink>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-ghost-card border border-ghost-border flex flex-col md:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search sessions by title, objective, or summary..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-ghost-surface border border-ghost-border rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500"
          />
        </form>

        <div className="flex items-center gap-2">
          <select
            value={selectedWorkspaceId}
            onChange={(e) => setSelectedWorkspaceId(e.target.value)}
            className="px-3 py-2 text-xs bg-ghost-surface border border-ghost-border rounded-lg text-slate-300 focus:outline-none focus:border-violet-500"
          >
            <option value="">All Workspaces</option>
            {workspaces.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-ghost-surface border border-ghost-border rounded-lg text-slate-300 focus:outline-none focus:border-violet-500"
          >
            <option value="">All Statuses</option>
            <option value="SUCCESS">AI Synthesized</option>
            <option value="RAW_SNAPSHOT">Raw Snapshot</option>
            <option value="PARTIAL">Partial</option>
          </select>
        </div>
      </div>

      {/* Session Cards */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : sessions.length > 0 ? (
        <div className="space-y-3">
          {sessions.map((sess) => (
            <NavLink
              key={sess.id}
              to={`/sessions/${sess.id}`}
              className="p-5 rounded-xl bg-ghost-card border border-ghost-border hover:border-violet-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group shadow-sm hover:shadow-violet-600/5 block"
            >
              <div className="space-y-1.5 flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-semibold text-violet-400 flex items-center gap-1">
                    <FolderGit2 className="w-3.5 h-3.5" />
                    {sess.workspace?.name}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {new Date(sess.capturedAt).toLocaleDateString()} at{' '}
                    {new Date(sess.capturedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span
                    className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded font-bold ${
                      sess.captureStatus === 'SUCCESS'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {sess.captureStatus}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors truncate">
                  {sess.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-1">{sess.summary}</p>
              </div>

              <div className="flex items-center gap-4 self-end md:self-auto shrink-0">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <FileCode2 className="w-3.5 h-3.5" />
                    {sess._count?.files || 0} files
                  </span>
                  <span className="flex items-center gap-1 text-amber-400/80">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {sess._count?.issues || 0} issues
                  </span>
                </div>

                <button
                  onClick={(e) => handleDelete(e, sess.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Delete session"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              </div>
            </NavLink>
          ))}
        </div>
      ) : (
        <div className="rounded-xl bg-ghost-card border border-ghost-border p-12 text-center space-y-2">
          <Clock className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">No sessions match your filter</h3>
          <p className="text-xs text-slate-400">Try clearing your search query or capturing a new session.</p>
        </div>
      )}
    </div>
  );
}
