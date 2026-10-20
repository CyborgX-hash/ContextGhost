import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ListTodo,
  FileCode2,
  FolderGit2,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { api } from '../services/api';

export default function OverviewDashboard() {
  const { activeWorkspace, systemStatus } = useWorkspace();
  const [resumeData, setResumeData] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loadDashboardData = async () => {
    if (!activeWorkspace?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [briefing, sessionsRes] = await Promise.all([
        api.getResumeBriefing(activeWorkspace.id),
        api.listSessions({ workspaceId: activeWorkspace.id, limit: 5 })
      ]);

      setResumeData(briefing);
      setRecentSessions(sessionsRes.sessions || []);
    } catch (err) {
      console.error('Failed to load overview data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [activeWorkspace?.id]);

  if (!activeWorkspace) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
          <FolderGit2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">No Workspace Selected</h2>
        <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
          Register or select a local workspace directory to start capturing work memories and AI briefings.
        </p>
        <NavLink
          to="/workspaces"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs shadow-lg shadow-violet-600/20 transition-all"
        >
          <FolderGit2 className="w-4 h-4" />
          <span>Register Workspace</span>
        </NavLink>
      </div>
    );
  }

  const latestSession = resumeData?.session;
  const staleness = resumeData?.staleness;
  const issues = latestSession?.issues || [];
  const nextActions = latestSession?.nextActions || [];
  const modifiedFiles = latestSession?.files || [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Banner & Quick Resume Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-900/30 via-ghost-card to-ghost-surface border border-violet-500/20 p-6 lg:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-violet-400 text-xs font-semibold tracking-wider uppercase mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Workspace Memory Engine</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              Welcome back to <span className="text-violet-300">{activeWorkspace.name}</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              {latestSession
                ? `Last memory snapshot captured ${staleness?.notice || 'recently'}. Everything you were working on is preserved below.`
                : 'No work session captured yet for this workspace. Click "Capture Session" to save your current working context.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {latestSession && (
              <button
                onClick={() => navigate(`/sessions/${latestSession.id}`)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm shadow-xl shadow-violet-600/25 hover:shadow-violet-600/40 transition-all active:scale-95"
              >
                <span>Resume My Work</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            <NavLink
              to="/capture"
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-ghost-surface hover:bg-slate-800 border border-ghost-border text-slate-200 font-medium text-sm transition-colors"
            >
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span>New Capture</span>
            </NavLink>
          </div>
        </div>

        {/* Subtle background glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />
      </div>

      {/* Real Workspace Activity Counts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-ghost-card border border-ghost-border">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Saved Sessions</span>
            <Clock className="w-4 h-4 text-violet-400" />
          </div>
          <p className="text-2xl font-bold text-white">{recentSessions.length}</p>
          <span className="text-[11px] text-slate-500">Persistent snapshots</span>
        </div>

        <div className="p-4 rounded-xl bg-ghost-card border border-ghost-border">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Unresolved Issues</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400">{issues.length}</p>
          <span className="text-[11px] text-slate-500">Failing tests & errors</span>
        </div>

        <div className="p-4 rounded-xl bg-ghost-card border border-ghost-border">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Next Action Items</span>
            <ListTodo className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-cyan-400">{nextActions.length}</p>
          <span className="text-[11px] text-slate-500">Prioritized next steps</span>
        </div>

        <div className="p-4 rounded-xl bg-ghost-card border border-ghost-border">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Files Modified</span>
            <FileCode2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400">{modifiedFiles.length}</p>
          <span className="text-[11px] text-slate-500">In latest snapshot</span>
        </div>
      </div>

      {/* 2-Column Core Briefing Layout */}
      {latestSession ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Where You Left Off & Next Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Where You Left Off */}
            <div className="rounded-xl bg-ghost-card border border-ghost-border p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                  <h2 className="text-base font-semibold text-white">Where You Left Off</h2>
                </div>
                {staleness && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                      staleness.level === 'stale'
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        : 'bg-violet-500/15 text-violet-300 border border-violet-500/30'
                    }`}
                  >
                    {staleness.notice}
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white tracking-tight">{latestSession.title}</h3>
                  <p className="text-sm text-slate-300 mt-1 leading-relaxed">{latestSession.summary}</p>
                </div>

                {latestSession.mainObjective && (
                  <div className="p-3.5 rounded-lg bg-ghost-surface/80 border border-ghost-border">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Main Objective
                    </span>
                    <p className="text-xs text-slate-200 font-medium">{latestSession.mainObjective}</p>
                  </div>
                )}

                {/* Modified Files Chips */}
                {modifiedFiles.length > 0 && (
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                      Changed Files in Session ({modifiedFiles.length})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {modifiedFiles.slice(0, 6).map((f) => (
                        <div
                          key={f.id || f.path}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-ghost-surface border border-ghost-border text-xs font-mono text-slate-300"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              f.changeType === 'added' || f.changeType === 'untracked'
                                ? 'bg-emerald-400'
                                : f.changeType === 'deleted'
                                ? 'bg-rose-400'
                                : 'bg-cyan-400'
                            }`}
                          />
                          <span className="truncate max-w-[220px]">{f.path}</span>
                        </div>
                      ))}
                      {modifiedFiles.length > 6 && (
                        <span className="text-xs text-slate-500 self-center">
                          +{modifiedFiles.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Next Prioritized Actions */}
            <div className="rounded-xl bg-ghost-card border border-ghost-border p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ListTodo className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-base font-semibold text-white">Recommended Next Actions</h2>
                </div>
                <span className="text-xs text-slate-500 font-mono">Prioritized by AI</span>
              </div>

              {nextActions.length > 0 ? (
                <div className="space-y-3">
                  {nextActions.slice(0, 3).map((act, index) => (
                    <div
                      key={act.id || index}
                      className="p-3.5 rounded-lg bg-ghost-surface/60 border border-ghost-border hover:border-cyan-500/40 transition-colors flex items-start gap-3"
                    >
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {act.priority || index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-white">{act.title}</h4>
                        {act.description && (
                          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{act.description}</p>
                        )}
                        {act.filePath && (
                          <div className="mt-1.5 flex items-center gap-1 text-[11px] font-mono text-cyan-400">
                            <FileCode2 className="w-3 h-3" />
                            <span>{act.filePath}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No pending action items recorded.
                </div>
              )}
            </div>
          </div>

          {/* Right Col: Unresolved Issues & Recent Sessions */}
          <div className="space-y-6">
            {/* Unresolved Issues Card */}
            <div className="rounded-xl bg-ghost-card border border-ghost-border p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <h2 className="text-base font-semibold text-white">Unresolved Issues</h2>
                </div>
                <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {issues.length} Active
                </span>
              </div>

              {issues.length > 0 ? (
                <div className="space-y-3">
                  {issues.map((iss) => (
                    <div
                      key={iss.id}
                      className="p-3 rounded-lg bg-ghost-surface/80 border border-amber-500/20 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white truncate max-w-[200px]">
                          {iss.title}
                        </span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300">
                          {iss.category}
                        </span>
                      </div>
                      {iss.evidence && (
                        <p className="text-[11px] text-slate-400 font-mono bg-black/40 p-1.5 rounded border border-white/5 truncate">
                          {iss.evidence}
                        </p>
                      )}
                      {iss.previousAttempts && (
                        <p className="text-[11px] text-slate-400">
                          <span className="text-slate-500">Tried: </span>
                          {iss.previousAttempts}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs flex flex-col items-center gap-1.5">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400/60" />
                  <span>No blocking errors or failing tests recorded.</span>
                </div>
              )}
            </div>

            {/* Recent Sessions List */}
            <div className="rounded-xl bg-ghost-card border border-ghost-border p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <h2 className="text-base font-semibold text-white">Recent Captures</h2>
                </div>
                <NavLink to="/sessions" className="text-xs text-violet-400 hover:text-violet-300">
                  View all
                </NavLink>
              </div>

              <div className="divide-y divide-ghost-border">
                {recentSessions.map((s) => (
                  <NavLink
                    key={s.id}
                    to={`/sessions/${s.id}`}
                    className="py-3 flex items-center justify-between hover:bg-slate-800/40 px-2 -mx-2 rounded transition-colors group"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-medium text-slate-200 group-hover:text-violet-300 truncate">
                        {s.title}
                      </p>
                      <span className="text-[11px] text-slate-500">
                        {new Date(s.capturedAt).toLocaleDateString()} at{' '}
                        {new Date(s.capturedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 shrink-0" />
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-xl bg-ghost-card border border-ghost-border p-12 text-center">
          <Clock className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white mb-1">No captured sessions yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            ContextGhost will analyze your git diffs, notes, and errors to build your personal memory log.
          </p>
          <NavLink
            to="/capture"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Capture First Session</span>
          </NavLink>
        </div>
      )}
    </div>
  );
}
