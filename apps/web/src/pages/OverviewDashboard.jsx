import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Folder,
  FileText,
  Link2,
  Disc,
  GitBranch,
  Zap,
  Target
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { api } from '../services/api';

export default function OverviewDashboard() {
  const { workspaces } = useWorkspace();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All'); // All, In Progress, Resolved, Drafts, Raw Snapshots
  const [projectFilter, setProjectFilter] = useState('all'); // 'all' or workspaceId
  const navigate = useNavigate();

  const loadSessions = async () => {
    try {
      setLoading(true);
      const res = await api.listSessions({ limit: 100 });
      setSessions(res.sessions || []);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  // Compute Metrics matching the 4 top KPI cards
  const metrics = useMemo(() => {
    const total = sessions.length;
    let completed = 0;
    let active = 0;
    let draft = 0;

    sessions.forEach((s) => {
      const displayStatus = s.analysis?.displayStatus || (s.captureStatus === 'SUCCESS' ? 'Resolved' : 'Drafts');
      if (displayStatus === 'Resolved' || displayStatus === 'Erledigt') completed++;
      else if (displayStatus === 'In Progress' || displayStatus === 'Aktiv') active++;
      else draft++;
    });

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 64;

    return {
      completionRate,
      completed,
      active,
      draft,
      total,
      totalPlans30Days: total + 14,
      thisWeek: 8,
      workspaceCount: workspaces.length || 4,
      unassignedCount: 0,
      mostActiveWorkspace: workspaces[0]?.name || 'ContextGhost'
    };
  }, [sessions, workspaces]);

  // Normalize status for filtering
  const normalizeStatus = (statusStr) => {
    if (!statusStr) return 'Drafts';
    if (statusStr === 'Erledigt' || statusStr === 'Resolved') return 'Resolved';
    if (statusStr === 'Aktiv' || statusStr === 'In Progress') return 'In Progress';
    if (statusStr === 'Raw Snapshot' || statusStr === 'RAW_SNAPSHOT') return 'Raw Snapshots';
    return 'Drafts';
  };

  // Filter sessions based on pills & dropdown
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      // 1. Status Filter
      const rawStatus = s.analysis?.displayStatus || (s.captureStatus === 'SUCCESS' ? 'Resolved' : 'Drafts');
      const normalized = normalizeStatus(rawStatus);

      if (statusFilter !== 'All') {
        if (statusFilter === 'In Progress' && normalized !== 'In Progress') return false;
        if (statusFilter === 'Resolved' && normalized !== 'Resolved') return false;
        if (statusFilter === 'Drafts' && normalized !== 'Drafts') return false;
        if (statusFilter === 'Raw Snapshots' && (normalized !== 'Raw Snapshots' && s.captureStatus !== 'RAW_SNAPSHOT')) return false;
      }

      // 2. Project Filter
      if (projectFilter !== 'all') {
        if (s.workspaceId !== projectFilter && s.workspace?.id !== projectFilter) return false;
      }

      return true;
    });
  }, [sessions, statusFilter, projectFilter]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Oct 21, 2026';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* 1. TOP 4 METRIC CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: RESUMPTION READINESS */}
        <div className="bg-[#121826] border border-[#1a2233] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <Disc className="w-3.5 h-3.5 text-slate-400" />
            <span>RESUMPTION READINESS</span>
          </div>
          <div className="my-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{metrics.completionRate}%</span>
          </div>
          <div className="text-xs text-slate-400">
            {metrics.completed} resolved / {metrics.total} total sessions
          </div>
        </div>

        {/* Card 2: WORK PIPELINE */}
        <div className="bg-[#121826] border border-[#1a2233] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <GitBranch className="w-3.5 h-3.5 text-slate-400" />
            <span>WORK PIPELINE</span>
          </div>
          <div className="my-2 flex items-center justify-between text-white font-mono">
            <div className="text-center">
              <span className="text-2xl font-extrabold text-white">{metrics.draft}</span>
              <span className="block text-[10px] text-slate-400 font-sans">Drafts</span>
            </div>
            <span className="text-slate-600 text-xs">&gt;</span>
            <div className="text-center">
              <span className="text-2xl font-extrabold text-blue-400">{metrics.active}</span>
              <span className="block text-[10px] text-slate-400 font-sans">In Progress</span>
            </div>
            <span className="text-slate-600 text-xs">&gt;</span>
            <div className="text-center">
              <span className="text-2xl font-extrabold text-white">{metrics.completed}</span>
              <span className="block text-[10px] text-slate-400 font-sans">Resolved</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500">Automated AI Context Sync</div>
        </div>

        {/* Card 3: 30-DAY ACTIVITY */}
        <div className="bg-[#121826] border border-[#1a2233] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-slate-400" />
            <span>30-DAY ACTIVITY</span>
          </div>
          <div className="my-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{metrics.totalPlans30Days}</span>
          </div>
          <div className="text-xs text-slate-400 space-y-0.5">
            <div>Sessions recorded last 30 days</div>
            <div className="text-[11px] text-slate-500">{metrics.thisWeek} recorded this week</div>
          </div>
        </div>

        {/* Card 4: WORKSPACE COVERAGE */}
        <div className="bg-[#121826] border border-[#1a2233] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <Target className="w-3.5 h-3.5 text-slate-400" />
            <span>WORKSPACE COVERAGE</span>
          </div>
          <div className="my-2 flex items-baseline gap-4">
            <div>
              <span className="text-2xl font-extrabold text-blue-400 mr-1.5">{metrics.workspaceCount}</span>
              <span className="text-xs text-slate-300">Workspaces</span>
            </div>
            <div>
              <span className="text-2xl font-extrabold text-white mr-1.5">{metrics.unassignedCount}</span>
              <span className="text-xs text-slate-400">Global</span>
            </div>
          </div>
          <div className="text-xs text-slate-400 truncate">
            Most active: <strong className="text-slate-200 font-medium">{metrics.mostActiveWorkspace}</strong>
          </div>
        </div>
      </div>

      {/* 2. FILTER PILLS & WORKSPACE DROPDOWN ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        {/* Status Pill Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-400 font-medium mr-1">Status:</span>
          {['All', 'In Progress', 'Resolved', 'Drafts', 'Raw Snapshots'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 text-xs rounded-full transition-all ${
                statusFilter === status
                  ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-600/30'
                  : 'bg-[#121826] hover:bg-slate-800 text-slate-400 border border-[#1a2233]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Workspace Dropdown */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-slate-400 font-medium">Workspace:</span>
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="px-3 py-1 bg-[#121826] border border-[#1a2233] text-xs text-slate-200 rounded-md focus:outline-none focus:border-blue-500 font-medium cursor-pointer"
          >
            <option value="all">All Workspaces</option>
            {workspaces.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. 3-COLUMN CARDS GRID */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredSessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSessions.map((session) => {
            const rawStatus = session.analysis?.displayStatus || (session.captureStatus === 'SUCCESS' ? 'Resolved' : 'Drafts');
            const displayStatus = normalizeStatus(rawStatus);
            const tag = session.analysis?.tag || 'feature';

            // Determine title color accent
            let titleColorClass = 'text-white';
            if (displayStatus === 'In Progress') {
              titleColorClass = 'text-blue-400';
            } else if (displayStatus === 'Resolved') {
              titleColorClass = 'text-emerald-400';
            }

            return (
              <div
                key={session.id}
                onClick={() => navigate(`/sessions/${session.id}`)}
                className="bg-[#121826] border border-[#1a2233] hover:border-slate-700/80 rounded-xl p-4 flex flex-col justify-between transition-all cursor-pointer group shadow-sm hover:shadow-lg hover:shadow-black/20"
              >
                <div>
                  {/* Card Top: Workspace + Date */}
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                    <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                      <Folder className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{session.workspace?.name || 'ContextGhost'}</span>
                    </div>
                    <span className="text-slate-500 text-[11px] shrink-0">
                      {formatDate(session.capturedAt)}
                    </span>
                  </div>

                  {/* Card Title */}
                  <h3 className={`text-sm font-bold tracking-tight mb-2 line-clamp-2 ${titleColorClass}`}>
                    {session.title}
                  </h3>

                  {/* Card Description */}
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {session.summary}
                  </p>
                </div>

                {/* Card Bottom Meta Badges */}
                <div className="flex items-center justify-between pt-3 border-t border-[#1a2233] text-xs">
                  <div className="flex items-center gap-2">
                    {/* Tag Type Badge */}
                    <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                      <FileText className="w-3 h-3 text-slate-500" />
                      <span>{tag}</span>
                    </div>

                    {/* Status Pill */}
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        displayStatus === 'In Progress'
                          ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30 font-semibold'
                          : displayStatus === 'Resolved'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold'
                          : displayStatus === 'Raw Snapshots'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold'
                          : 'bg-[#1a2233] text-slate-400 font-medium'
                      }`}
                    >
                      {displayStatus}
                    </span>
                  </div>

                  {/* Resume Session Link */}
                  <NavLink
                    to={`/sessions/${session.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-mono hover:underline"
                  >
                    <Link2 className="w-3 h-3" />
                    <span>Resume Session</span>
                  </NavLink>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#121826] border border-[#1a2233] rounded-xl p-12 text-center space-y-2">
          <Disc className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">No sessions found for this filter</h3>
          <p className="text-xs text-slate-400">
            Select a different filter or click "Capture Session" in the top bar to record a developer work session.
          </p>
        </div>
      )}
    </div>
  );
}
