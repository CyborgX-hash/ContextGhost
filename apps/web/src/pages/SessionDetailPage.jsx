import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import {
  Sparkles,
  Clock,
  FolderGit2,
  AlertTriangle,
  CheckCircle2,
  ListTodo,
  FileCode2,
  Trash2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Send,
  Terminal,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { api } from '../services/api';

export default function SessionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showRawSnapshot, setShowRawSnapshot] = useState(false);
  const [activeTab, setActiveTab] = useState('briefing'); // briefing, files, issues, actions

  const loadSession = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getSession(id);
      setSession(data);
    } catch (err) {
      console.error('Failed to load session:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSession();
  }, [id]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      setAddingNote(true);
      await api.addSessionNote(id, newNote.trim());
      setNewNote('');
      await loadSession();
    } catch (err) {
      alert(`Failed to add note: ${err.message}`);
    } finally {
      setAddingNote(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this captured session memory?')) {
      return;
    }

    try {
      await api.deleteSession(id);
      navigate('/sessions');
    } catch (err) {
      alert(`Failed to delete session: ${err.message}`);
    }
  };

  const copyBriefing = () => {
    if (!session) return;
    const text = `
# ContextGhost Briefing: ${session.title}
**Workspace**: ${session.workspace?.name}
**Captured**: ${new Date(session.capturedAt).toLocaleString()}
**Model**: ${session.modelName || 'Raw Snapshot'}

## Summary
${session.summary}

## Main Objective
${session.mainObjective || 'N/A'}

## Key Accomplishments
${(session.analysis?.accomplishments || []).map((a) => `- ${a}`).join('\n')}

## Unresolved Issues
${(session.issues || []).map((iss) => `- [${iss.severity.toUpperCase()}] ${iss.title} (${iss.evidence || 'No evidence'})`).join('\n') || 'None'}

## Recommended Next Actions
${(session.nextActions || []).map((a) => `${a.priority}. ${a.title} - ${a.description} (${a.filePath || 'General'})`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white">Session Not Found</h2>
        <p className="text-xs text-slate-400">{error || 'The requested session memory does not exist.'}</p>
        <NavLink
          to="/sessions"
          className="inline-block px-4 py-2 rounded-lg bg-ghost-card border border-ghost-border text-xs text-slate-200"
        >
          Back to Sessions
        </NavLink>
      </div>
    );
  }

  const analysis = session.analysis || {};
  const accomplishments = analysis.accomplishments || [];
  const openQuestions = analysis.openQuestions || [];
  const files = session.files || [];
  const issues = session.issues || [];
  const nextActions = session.nextActions || [];
  const notes = session.notes || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Session Header Card */}
      <div className="rounded-2xl bg-ghost-card border border-ghost-border p-6 shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-violet-400 font-semibold flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5" />
                {session.workspace?.name}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5" />
                {new Date(session.capturedAt).toLocaleString()}
              </span>
              <span className="text-slate-600">•</span>
              <span
                className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-semibold ${
                  session.captureStatus === 'SUCCESS'
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                }`}
              >
                {session.captureStatus}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{session.title}</h1>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={copyBriefing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-ghost-surface hover:bg-slate-800 border border-ghost-border text-xs text-slate-200 font-medium transition-colors"
              title="Copy markdown briefing"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Briefing'}</span>
            </button>
            <button
              onClick={handleDelete}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg border border-ghost-border transition-colors"
              title="Delete session"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* AI Confidence / Model Pill */}
        <div className="flex items-center gap-2 pt-2 border-t border-ghost-border text-xs text-slate-400">
          <Cpu className="w-4 h-4 text-violet-400 shrink-0" />
          <span>Synthesized using: <strong className="text-slate-200 font-mono">{session.modelName || 'Raw Snapshot'}</strong></span>
          {session.confidenceNotes && (
            <span className="text-slate-500 text-[11px] truncate">({session.confidenceNotes})</span>
          )}
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-ghost-border gap-1 overflow-x-auto">
        {[
          { key: 'briefing', label: 'Executive Briefing', icon: Sparkles },
          { key: 'files', label: `Modified Files (${files.length})`, icon: FileCode2 },
          { key: 'issues', label: `Issues & Debugging (${issues.length})`, icon: AlertTriangle },
          { key: 'actions', label: `Next Actions (${nextActions.length})`, icon: ListTodo }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-violet-500 text-violet-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Executive Briefing */}
      {activeTab === 'briefing' && (
        <div className="space-y-6">
          <div className="rounded-xl bg-ghost-card border border-ghost-border p-6 space-y-4">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Executive Synthesis
              </span>
              <p className="text-sm text-slate-200 leading-relaxed font-normal">{session.summary}</p>
            </div>

            {session.mainObjective && (
              <div className="p-4 rounded-xl bg-ghost-surface/80 border border-ghost-border">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Primary Objective
                </span>
                <p className="text-xs text-white font-medium">{session.mainObjective}</p>
              </div>
            )}

            {accomplishments.length > 0 && (
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                  Known Accomplishments Grounded in Evidence
                </span>
                <ul className="space-y-1.5">
                  {accomplishments.map((acc, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{acc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {openQuestions.length > 0 && (
              <div className="pt-3 border-t border-ghost-border">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400 block mb-2">
                  Open Questions / Decisions Needed
                </span>
                <ul className="space-y-1">
                  {openQuestions.map((q, i) => (
                    <li key={i} className="text-xs text-slate-300 font-mono">
                      • {q}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Modified Files */}
      {activeTab === 'files' && (
        <div className="rounded-xl bg-ghost-card border border-ghost-border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Modified Files in Session</h3>
            <span className="text-xs text-slate-400 font-mono">{files.length} total</span>
          </div>

          {files.length > 0 ? (
            <div className="divide-y divide-ghost-border">
              {files.map((file) => (
                <div key={file.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileCode2 className="w-4 h-4 text-violet-400 shrink-0" />
                    <span className="text-xs font-mono text-slate-200 truncate">{file.path}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {file.evidenceSummary && (
                      <span className="text-[11px] text-slate-400 truncate max-w-xs">{file.evidenceSummary}</span>
                    )}
                    <span
                      className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold ${
                        file.changeType === 'added' || file.changeType === 'untracked'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : file.changeType === 'deleted'
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                      }`}
                    >
                      {file.changeType}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">No changed files recorded in this session.</p>
          )}
        </div>
      )}

      {/* Tab 3: Issues & Debugging */}
      {activeTab === 'issues' && (
        <div className="rounded-xl bg-ghost-card border border-ghost-border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Unresolved Errors & Debugging History</h3>
            <span className="text-xs font-mono text-amber-400">{issues.length} Recorded</span>
          </div>

          {issues.length > 0 ? (
            <div className="space-y-4">
              {issues.map((iss) => (
                <div key={iss.id} className="p-4 rounded-xl bg-ghost-surface border border-ghost-border space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white">{iss.title}</h4>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold">
                      {iss.category}
                    </span>
                  </div>

                  {iss.description && iss.description !== iss.title && (
                    <p className="text-xs text-slate-300">{iss.description}</p>
                  )}

                  {iss.evidence && (
                    <div className="bg-black/50 p-2.5 rounded-lg border border-white/5 font-mono text-[11px] text-slate-300 overflow-x-auto">
                      <span className="text-slate-500 block mb-0.5">Supporting Evidence:</span>
                      {iss.evidence}
                    </div>
                  )}

                  {iss.previousAttempts && (
                    <p className="text-xs text-slate-400">
                      <strong className="text-slate-300">Previous Attempts:</strong> {iss.previousAttempts}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">No unresolved issues recorded in this session.</p>
          )}
        </div>
      )}

      {/* Tab 4: Next Actions */}
      {activeTab === 'actions' && (
        <div className="rounded-xl bg-ghost-card border border-ghost-border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Prioritized Next Actions</h3>
            <span className="text-xs font-mono text-cyan-400">Action Plan</span>
          </div>

          {nextActions.length > 0 ? (
            <div className="space-y-3">
              {nextActions.map((act) => (
                <div
                  key={act.id}
                  className="p-4 rounded-xl bg-ghost-surface border border-ghost-border flex items-start gap-3.5"
                >
                  <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {act.priority}
                  </span>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-white">{act.title}</h4>
                    {act.description && <p className="text-xs text-slate-300 mt-1">{act.description}</p>}
                    {act.filePath && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs font-mono text-cyan-400">
                        <FileCode2 className="w-3.5 h-3.5" />
                        <span>{act.filePath}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">No pending action items recorded.</p>
          )}
        </div>
      )}

      {/* Notes Section */}
      <div className="rounded-xl bg-ghost-card border border-ghost-border p-6 space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-violet-400" />
          <h3 className="text-sm font-semibold text-white">Session Notes & Follow-ups</h3>
        </div>

        {/* Existing notes */}
        <div className="space-y-2">
          {notes.map((n) => (
            <div key={n.id} className="p-3 rounded-lg bg-ghost-surface border border-ghost-border text-xs text-slate-300 flex justify-between items-start gap-3">
              <p className="whitespace-pre-wrap">{n.content}</p>
              <span className="text-[10px] text-slate-500 shrink-0">
                {new Date(n.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>

        {/* Add Note Form */}
        <form onSubmit={handleAddNote} className="flex gap-2">
          <input
            type="text"
            placeholder="Add an update or note to this session..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="flex-1 px-3 py-2 text-xs bg-ghost-surface border border-ghost-border rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500"
          />
          <button
            type="submit"
            disabled={addingNote || !newNote.trim()}
            className="px-3.5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Add Note</span>
          </button>
        </form>
      </div>

      {/* Raw Snapshot Inspection Expandable */}
      <div className="rounded-xl bg-ghost-card border border-ghost-border overflow-hidden">
        <button
          onClick={() => setShowRawSnapshot(!showRawSnapshot)}
          className="w-full p-4 flex items-center justify-between text-left text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <span>Raw Captured Context Snapshot</span>
          {showRawSnapshot ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showRawSnapshot && (
          <div className="p-4 bg-black/60 border-t border-ghost-border">
            <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(session.rawSnapshot || session.analysis, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
