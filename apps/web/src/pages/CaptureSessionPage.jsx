import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  GitBranch,
  FileCode2,
  FileText,
  Terminal,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  ArrowRight,
  Eye,
  RefreshCw
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { api } from '../services/api';

export default function CaptureSessionPage() {
  const { workspaces, activeWorkspace, selectWorkspace, systemStatus } = useWorkspace();
  const [gitInspection, setGitInspection] = useState(null);
  const [inspecting, setInspecting] = useState(false);
  const [notes, setNotes] = useState('');
  const [logs, setLogs] = useState('');
  const [previousAttempts, setPreviousAttempts] = useState('');
  const [previewData, setPreviewData] = useState(null);
  const [previewing, setPreviewing] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [captureStatusMessage, setCaptureStatusMessage] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const isAiReady = systemStatus?.aiEngine?.connected && systemStatus?.aiEngine?.modelAvailable;

  // Inspect git status when active workspace changes
  useEffect(() => {
    if (activeWorkspace?.id) {
      inspectWorkspace(activeWorkspace.id);
    }
  }, [activeWorkspace?.id]);

  const inspectWorkspace = async (id) => {
    try {
      setInspecting(true);
      setError(null);
      const res = await api.inspectWorkspace(id);
      setGitInspection(res.gitContext);
    } catch (err) {
      console.error('Inspection failed:', err);
      setError(err.message);
    } finally {
      setInspecting(false);
    }
  };

  const handlePreview = async () => {
    if (!activeWorkspace?.id) return;
    try {
      setPreviewing(true);
      setError(null);
      const preview = await api.previewCapture({
        workspaceId: activeWorkspace.id,
        notes,
        logs
      });
      setPreviewData(preview);
    } catch (err) {
      setError(err.message || 'Failed to generate preview.');
    } finally {
      setPreviewing(false);
    }
  };

  const handleCapture = async (forceRaw = false) => {
    if (!activeWorkspace?.id) return;

    try {
      setCapturing(true);
      setError(null);
      setCaptureStatusMessage(
        forceRaw
          ? 'Saving raw snapshot without AI synthesis...'
          : isAiReady
          ? 'Synthesizing work context with local Ollama model...'
          : 'Connecting to local AI engine...'
      );

      const session = await api.captureSession({
        workspaceId: activeWorkspace.id,
        notes,
        logs,
        previousAttempts,
        forceRawSnapshot: forceRaw
      });

      setCaptureStatusMessage('Session captured! Redirecting...');
      setTimeout(() => {
        navigate(`/sessions/${session.id}`);
      }, 500);
    } catch (err) {
      console.error('Capture failed:', err);
      setError(err.message || 'Capture failed.');
    } finally {
      setCapturing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <Sparkles className="w-6 h-6 text-violet-400" />
          <span>Capture Work Session</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          ContextGhost will securely inspect your workspace changes, redact any detected credentials, and synthesize your work state into persistent memory.
        </p>
      </div>

      {/* Workspace Selection Banner */}
      <div className="p-4 rounded-xl bg-ghost-card border border-ghost-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Target Workspace:</span>
          <select
            value={activeWorkspace?.id || ''}
            onChange={(e) => {
              const ws = workspaces.find((w) => w.id === e.target.value);
              if (ws) selectWorkspace(ws);
            }}
            className="px-3 py-1.5 rounded-lg bg-ghost-surface border border-ghost-border text-xs text-slate-200 font-medium focus:outline-none focus:border-violet-500"
          >
            {workspaces.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.rootPath})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => activeWorkspace && inspectWorkspace(activeWorkspace.id)}
          disabled={inspecting}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-violet-300 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${inspecting ? 'animate-spin' : ''}`} />
          <span>Refresh Git Status</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Step 1: Git Context Preview */}
      <div className="rounded-xl bg-ghost-card border border-ghost-border p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-violet-400" />
            <h3 className="text-sm font-semibold text-white">Live Git Repository Status</h3>
          </div>
          {gitInspection?.branch && (
            <span className="text-xs font-mono text-violet-300 bg-violet-500/15 px-2 py-0.5 rounded border border-violet-500/30">
              Branch: {gitInspection.branch}
            </span>
          )}
        </div>

        {gitInspection ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-ghost-surface border border-ghost-border">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Changed Files</span>
                <span className="font-bold text-white text-base">{gitInspection.changedFilesCount || 0}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-ghost-surface border border-ghost-border">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Latest Commit</span>
                <span className="font-mono text-slate-300 truncate block text-xs" title={gitInspection.commit?.subject}>
                  {gitInspection.commit ? `${gitInspection.commit.hash} - ${gitInspection.commit.subject}` : 'No commit'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-ghost-surface border border-ghost-border col-span-2 sm:col-span-1">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Repository State</span>
                <span className="text-emerald-400 font-medium">Safe Subprocess Verified</span>
              </div>
            </div>

            {/* Files list */}
            {gitInspection.files && gitInspection.files.length > 0 ? (
              <div className="max-h-36 overflow-y-auto space-y-1 p-2 rounded-lg bg-black/30 border border-ghost-border font-mono text-xs">
                {gitInspection.files.map((f, i) => (
                  <div key={i} className="flex items-center justify-between text-slate-300 px-2 py-0.5">
                    <span className="truncate">{f.path}</span>
                    <span
                      className={`text-[10px] uppercase px-1.5 py-0.2 rounded font-semibold ${
                        f.changeType === 'added' || f.changeType === 'untracked'
                          ? 'text-emerald-400 bg-emerald-500/10'
                          : f.changeType === 'deleted'
                          ? 'text-rose-400 bg-rose-500/10'
                          : 'text-cyan-400 bg-cyan-500/10'
                      }`}
                    >
                      {f.changeType}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-slate-500">
                Working tree is clean. You can still capture session notes or terminal logs below!
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-slate-500">
            {inspecting ? 'Inspecting workspace repository...' : 'Unable to inspect Git context.'}
          </div>
        )}
      </div>

      {/* Step 2: Context Inputs (Notes, Logs, Attempts) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-xl bg-ghost-card border border-ghost-border p-5 space-y-2">
          <div className="flex items-center gap-2 text-white text-xs font-semibold">
            <FileText className="w-4 h-4 text-violet-400" />
            <span>Developer Session Notes (Optional)</span>
          </div>
          <p className="text-[11px] text-slate-400">
            What were you trying to build or fix? What are your immediate thoughts?
          </p>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Working on the checkout payment webhook. Added HMAC verification, testing event handling..."
            className="w-full px-3 py-2 text-xs bg-ghost-surface border border-ghost-border rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500"
          />
        </div>

        <div className="rounded-xl bg-ghost-card border border-ghost-border p-5 space-y-2">
          <div className="flex items-center gap-2 text-white text-xs font-semibold">
            <Terminal className="w-4 h-4 text-amber-400" />
            <span>Terminal Errors or Test Output (Optional)</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Paste error stack traces, failing test logs, or build errors for AI extraction.
          </p>
          <textarea
            rows={4}
            value={logs}
            onChange={(e) => setLogs(e.target.value)}
            placeholder="e.g., FAIL src/auth.test.js > TypeError: Cannot read property 'id' of undefined..."
            className="w-full px-3 py-2 text-xs font-mono bg-ghost-surface border border-ghost-border rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500"
          />
        </div>
      </div>

      {/* Optional: Previous Attempts */}
      <div className="rounded-xl bg-ghost-card border border-ghost-border p-4 space-y-1">
        <label className="text-xs font-semibold text-slate-300 block">
          Previous Debugging Attempts (Optional)
        </label>
        <input
          type="text"
          value={previousAttempts}
          onChange={(e) => setPreviousAttempts(e.target.value)}
          placeholder="e.g. Already tried restarting Redis, updating JWT secret, clearing browser cache..."
          className="w-full px-3 py-2 text-xs bg-ghost-surface border border-ghost-border rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500"
        />
      </div>

      {/* Privacy Guarantee & Preview Action */}
      <div className="p-4 rounded-xl bg-violet-950/20 border border-violet-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-violet-400 shrink-0" />
          <div>
            <h4 className="text-xs font-semibold text-white">Local-First & Secret Redaction Protected</h4>
            <p className="text-[11px] text-slate-400">
              API tokens, passwords, and private keys will be automatically masked before AI processing.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePreview}
          disabled={previewing}
          className="px-3.5 py-2 rounded-lg bg-ghost-surface hover:bg-slate-800 border border-ghost-border text-xs text-slate-200 font-medium flex items-center gap-1.5 transition-colors shrink-0"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{previewing ? 'Scanning...' : 'Inspect Sanitized Payload'}</span>
        </button>
      </div>

      {/* Sanitized Preview Dialog/Block */}
      {previewData && (
        <div className="rounded-xl bg-ghost-surface border border-violet-500/30 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Sanitized Context Preview</span>
            </div>
            <span className="text-[11px] text-slate-400">Safe for local inference</span>
          </div>

          <div className="text-xs font-mono bg-black/40 p-3 rounded-lg border border-white/5 max-h-48 overflow-y-auto space-y-2 text-slate-300">
            <div>
              <span className="text-violet-400 font-bold">[Workspace]:</span> {previewData.workspace.name}
            </div>
            <div>
              <span className="text-violet-400 font-bold">[Branch]:</span> {previewData.gitContext?.branch || 'N/A'}
            </div>
            <div>
              <span className="text-violet-400 font-bold">[Notes]:</span> {previewData.notes || 'None'}
            </div>
            <div>
              <span className="text-violet-400 font-bold">[Errors Extracted]:</span>{' '}
              {previewData.extractedErrors?.length || 0} error patterns identified
            </div>
          </div>
        </div>
      )}

      {/* Capture Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-ghost-border">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Cpu className="w-4 h-4 text-violet-400" />
          <span>
            Model: <strong className="text-slate-200">{systemStatus?.aiEngine?.configuredModel || 'qwen2.5:1.5b'}</strong>{' '}
            ({isAiReady ? 'Ready' : 'Ollama Offline'})
          </span>
        </div>

        <div className="flex items-center gap-3">
          {!isAiReady && (
            <button
              onClick={() => handleCapture(true)}
              disabled={capturing}
              className="px-4 py-2.5 rounded-xl bg-ghost-surface hover:bg-slate-800 text-slate-300 font-medium text-xs border border-ghost-border transition-colors disabled:opacity-50"
            >
              Save Raw Snapshot (No AI)
            </button>
          )}

          <button
            onClick={() => handleCapture(false)}
            disabled={capturing}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-xl shadow-violet-600/30 transition-all disabled:opacity-50 active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>{capturing ? 'Capturing Session...' : 'Capture Session'}</span>
          </button>
        </div>
      </div>

      {capturing && (
        <div className="p-4 rounded-xl bg-violet-950/30 border border-violet-500/30 text-center space-y-2">
          <div className="w-6 h-6 border-2 border-violet-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-violet-300 font-medium">{captureStatusMessage}</p>
        </div>
      )}
    </div>
  );
}
