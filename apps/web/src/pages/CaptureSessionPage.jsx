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
  RefreshCw,
  Upload,
  X,
  FileUp,
  Globe
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { api } from '../services/api';

const ALLOWED_EXTS = ['.diff', '.patch', '.log', '.txt', '.md', '.json', '.yml', '.yaml'];

export default function CaptureSessionPage() {
  const { workspaces, activeWorkspace, selectWorkspace, systemStatus, refreshWorkspaces, refreshSystemStatus } = useWorkspace();
  const [gitInspection, setGitInspection] = useState(null);
  const [inspecting, setInspecting] = useState(false);
  const [notes, setNotes] = useState('');
  const [logs, setLogs] = useState('');
  const [gitDiff, setGitDiff] = useState('');
  const [customBranch, setCustomBranch] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const [contextFiles, setContextFiles] = useState([]);
  const [previousAttempts, setPreviousAttempts] = useState('');
  const [userConfirmedDisclosure, setUserConfirmedDisclosure] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [previewing, setPreviewing] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [captureStatusMessage, setCaptureStatusMessage] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const aiEngine = systemStatus?.aiEngine;
  const isAiReady = aiEngine?.connected && aiEngine?.modelAvailable;
  const isHostedAi = aiEngine?.provider === 'openrouter' || aiEngine?.provider === 'groq';

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
      if (res.gitContext?.branch && !customBranch) {
        setCustomBranch(res.gitContext.branch);
      }
    } catch (err) {
      console.warn('Inspection failed:', err);
      // Don't block user if workspace is remote or cloud
      setGitInspection(null);
    } finally {
      setInspecting(false);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    for (const file of files) {
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      if (!ALLOWED_EXTS.includes(ext)) {
        setError(`File "${file.name}" rejected: Only text-based context files (${ALLOWED_EXTS.join(', ')}) are supported.`);
        continue;
      }

      if (file.size > 1048576) {
        setError(`File "${file.name}" exceeds 1MB limit (${Math.round(file.size / 1024)} KB).`);
        continue;
      }

      if (file.name.toLowerCase().startsWith('.env')) {
        setError(`File "${file.name}" rejected: Credentials and .env files are strictly prohibited.`);
        continue;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result;
        if (typeof content === 'string') {
          setContextFiles((prev) => [
            ...prev.filter((f) => f.name !== file.name),
            { name: file.name, sizeBytes: file.size, content }
          ]);
        }
      };
      reader.readAsText(file);
    }
    e.target.value = '';
  };

  const removeFile = (filename) => {
    setContextFiles((prev) => prev.filter((f) => f.name !== filename));
  };

  const handlePreview = async () => {
    if (!activeWorkspace?.id) return;
    try {
      setPreviewing(true);
      setError(null);
      const preview = await api.previewCapture({
        workspaceId: activeWorkspace.id,
        notes,
        logs,
        gitDiff,
        branch: customBranch,
        commitMessage,
        contextFiles
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

    if (!forceRaw && isHostedAi && !userConfirmedDisclosure) {
      setError('Please review the context preview and confirm the hosted AI data transmission disclosure below.');
      return;
    }

    try {
      setCapturing(true);
      setError(null);
      setCaptureStatusMessage(
        forceRaw
          ? 'Saving raw snapshot without AI synthesis...'
          : isAiReady
          ? `Synthesizing work context with hosted open-weight model (${aiEngine?.configuredModel || 'AI'})...`
          : 'Connecting to AI engine...'
      );

      const session = await api.captureSession({
        workspaceId: activeWorkspace.id,
        notes,
        logs,
        previousAttempts,
        gitDiff,
        branch: customBranch,
        commitMessage,
        contextFiles,
        forceRawSnapshot: forceRaw
      });

      setCaptureStatusMessage('Session captured! Redirecting...');
      setTimeout(() => {
        navigate(`/sessions/${session.id}`);
      }, 500);
    } catch (err) {
      console.error('Capture failed:', err);
      setError(err.message || 'Capture failed. Your inputs have been preserved.');
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
          ContextGhost securely inspects your workspace changes, redacts detected secrets, and synthesizes your work state into persistent memory.
        </p>
      </div>

      {/* Workspace Selection Banner */}
      <div className="p-4 rounded-xl bg-ghost-card border border-ghost-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 shrink-0">Target Workspace:</span>
          <select
            value={activeWorkspace?.id || ''}
            onChange={(e) => {
              const ws = workspaces.find((w) => w.id === e.target.value);
              if (ws) selectWorkspace(ws);
            }}
            disabled={!workspaces.length}
            className="min-w-[260px] max-w-[480px] px-3 py-2 rounded-lg bg-ghost-surface border border-ghost-border text-sm text-slate-200 font-medium focus:outline-none focus:border-violet-500 disabled:opacity-50 disabled:cursor-not-allowed appearance-auto"
          >
            {workspaces.length === 0 && (
              <option value="" disabled>Loading workspaces…</option>
            )}
            {workspaces.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} — {w.rootPath}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {workspaces.length === 0 && (
            <button
              onClick={() => {
                refreshWorkspaces();
                refreshSystemStatus();
              }}
              className="px-2.5 py-1 rounded bg-violet-600/30 hover:bg-violet-600/50 text-violet-300 text-xs border border-violet-500/40 transition-colors font-medium"
            >
              Retry
            </button>
          )}
          <button
            onClick={() => {
              refreshWorkspaces();
              refreshSystemStatus();
              if (activeWorkspace) inspectWorkspace(activeWorkspace.id);
            }}
            disabled={inspecting}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-violet-300"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${inspecting ? 'animate-spin' : ''}`} />
            <span>Refresh Git Status</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Step 1: Git Context (Live or Pasted) */}
      <div className="rounded-xl bg-ghost-card border border-ghost-border p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-violet-400" />
            <h3 className="text-sm font-semibold text-white">Git Workspace Context</h3>
          </div>
          {gitInspection?.branch && (
            <span className="text-xs font-mono text-violet-300 bg-violet-500/15 px-2 py-0.5 rounded border border-violet-500/30">
              Local Branch: {gitInspection.branch}
            </span>
          )}
        </div>

        {/* Live status if available */}
        {gitInspection && gitInspection.isGitRepo ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-ghost-surface border border-ghost-border">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Local Changed Files</span>
                <span className="font-bold text-white text-base">{gitInspection.changedFilesCount || 0}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-ghost-surface border border-ghost-border">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Latest Commit</span>
                <span className="font-mono text-slate-300 truncate block text-xs" title={gitInspection.commit?.subject}>
                  {gitInspection.commit ? `${gitInspection.commit.hash} - ${gitInspection.commit.subject}` : 'No commit'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-ghost-surface border border-ghost-border col-span-2 sm:col-span-1">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Inspector Mode</span>
                <span className="text-emerald-400 font-medium">Safe Subprocess Verified</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-ghost-surface border border-ghost-border text-xs text-slate-400">
            <span className="text-violet-300 font-semibold block mb-0.5">Cloud / Remote Workspace Mode:</span>
            Backend cannot directly read your laptop hard drive. Paste a local Git diff below or attach an exported patch file.
          </div>
        )}

        {/* Optional Git Diff Input */}
        <div className="space-y-2 pt-2 border-t border-ghost-border">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <FileCode2 className="w-3.5 h-3.5 text-violet-400" />
              <span>Paste Git Diff or Patch (Optional)</span>
            </label>
            <span className="text-[10px] text-slate-500">Run `git diff` in your terminal and paste output</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={customBranch}
              onChange={(e) => setCustomBranch(e.target.value)}
              placeholder="Branch name (e.g. feature/auth-fix)"
              className="px-3 py-1.5 text-xs bg-ghost-surface border border-ghost-border rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500 font-mono"
            />
            <input
              type="text"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="Latest commit subject (optional)"
              className="px-3 py-1.5 text-xs bg-ghost-surface border border-ghost-border rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500"
            />
          </div>

          <textarea
            rows={4}
            value={gitDiff}
            onChange={(e) => setGitDiff(e.target.value)}
            placeholder="diff --git a/src/app.js b/src/app.js&#10;index 123..456 100644&#10;--- a/src/app.js&#10;+++ b/src/app.js&#10;@@ -10,3 +10,4 @@&#10;+ const token = verifyToken(req);"
            className="w-full px-3 py-2 text-xs font-mono bg-ghost-surface border border-ghost-border rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500"
          />
        </div>
      </div>

      {/* Step 2: Context Inputs (Notes, Logs, Attempts) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-xl bg-ghost-card border border-ghost-border p-5 space-y-2">
          <div className="flex items-center gap-2 text-white text-xs font-semibold">
            <FileText className="w-4 h-4 text-violet-400" />
            <span>Developer Session Notes (Optional)</span>
          </div>
          <p className="text-[11px] text-slate-400">
            What were you trying to build or fix? What was your immediate objective?
          </p>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Implemented payment webhook validation, testing error scenarios with invalid signatures..."
            className="w-full px-3 py-2 text-xs bg-ghost-surface border border-ghost-border rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500"
          />
        </div>

        <div className="rounded-xl bg-ghost-card border border-ghost-border p-5 space-y-2">
          <div className="flex items-center gap-2 text-white text-xs font-semibold">
            <Terminal className="w-4 h-4 text-amber-400" />
            <span>Terminal Errors or Test Output (Optional)</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Paste error stack traces, failing test logs, or build failures for automatic extraction.
          </p>
          <textarea
            rows={4}
            value={logs}
            onChange={(e) => setLogs(e.target.value)}
            placeholder="e.g. FAIL tests/auth.test.js > TypeError: Cannot read properties of undefined..."
            className="w-full px-3 py-2 text-xs font-mono bg-ghost-surface border border-ghost-border rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500"
          />
        </div>
      </div>

      {/* Step 3: Attach Context Files */}
      <div className="rounded-xl bg-ghost-card border border-ghost-border p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white text-xs font-semibold">
            <FileUp className="w-4 h-4 text-cyan-400" />
            <span>Attach Context Files (Optional)</span>
          </div>
          <span className="text-[10px] text-slate-400">Max 1MB per file (.diff, .patch, .log, .txt, .md)</span>
        </div>

        <div className="flex items-center gap-3">
          <label className="cursor-pointer px-3.5 py-2 rounded-lg bg-ghost-surface hover:bg-slate-800 border border-ghost-border text-xs text-slate-200 font-medium flex items-center gap-2 transition-colors">
            <Upload className="w-3.5 h-3.5 text-violet-400" />
            <span>Upload Text File</span>
            <input
              type="file"
              multiple
              accept=".diff,.patch,.log,.txt,.md,.json,.yml,.yaml"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          <span className="text-[11px] text-slate-500">
            {contextFiles.length} file(s) attached
          </span>
        </div>

        {contextFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {contextFiles.map((file, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-2.5 py-1 rounded bg-black/40 border border-ghost-border text-xs text-slate-300 font-mono"
              >
                <span>{file.name}</span>
                <span className="text-[10px] text-slate-500">({Math.round(file.sizeBytes / 1024)} KB)</span>
                <button
                  type="button"
                  onClick={() => removeFile(file.name)}
                  className="text-slate-500 hover:text-rose-400"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
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

      {/* Secret Redaction & Preview Action */}
      <div className="p-4 rounded-xl bg-violet-950/20 border border-violet-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-violet-400 shrink-0" />
          <div>
            <h4 className="text-xs font-semibold text-white">Multi-Layer Secret Redaction Active</h4>
            <p className="text-[11px] text-slate-400">
              API tokens, passwords, database URLs, and private keys will be automatically masked before transmission.
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

      {/* Sanitized Context Preview Dialog */}
      {previewData && (
        <div className="rounded-xl bg-ghost-surface border border-violet-500/30 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Sanitized Context Preview (Ready for Submission)</span>
            </div>
            <span className="text-[11px] text-slate-400">{previewData.disclosure}</span>
          </div>

          <div className="text-xs font-mono bg-black/40 p-3 rounded-lg border border-white/5 max-h-48 overflow-y-auto space-y-2 text-slate-300">
            <div>
              <span className="text-violet-400 font-bold">[Workspace]:</span> {previewData.workspace.name}
            </div>
            <div>
              <span className="text-violet-400 font-bold">[Branch]:</span> {previewData.gitContext?.branch || 'N/A'}
            </div>
            <div>
              <span className="text-violet-400 font-bold">[Changed Files]:</span> {previewData.gitContext?.changedFilesCount || 0}
            </div>
            {previewData.contextFiles?.length > 0 && (
              <div>
                <span className="text-violet-400 font-bold">[Attached Files]:</span>{' '}
                {previewData.contextFiles.map((f) => f.name).join(', ')}
              </div>
            )}
            <div>
              <span className="text-violet-400 font-bold">[Notes]:</span> {previewData.notes || 'None'}
            </div>
            <div>
              <span className="text-violet-400 font-bold">[Errors Identified]:</span>{' '}
              {previewData.extractedErrors?.length || 0} error pattern(s)
            </div>
          </div>
        </div>
      )}

      {/* Hosted AI Disclosure & Explicit Confirmation */}
      {isHostedAi && (
        <div className="p-4 rounded-xl bg-ghost-card border border-ghost-border space-y-3">
          <div className="flex items-start gap-3">
            <Globe className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-white">Hosted Open-Weight AI Disclosure</h4>
              <p className="text-[11px] text-slate-400">
                You are submitting approved context to a hosted open-weight inference provider (
                <strong className="text-slate-200">{aiEngine?.provider}</strong> with model{' '}
                <strong className="text-slate-200">{aiEngine?.configuredModel || 'open-weight'}</strong>).
                Only the sanitized preview shown above will be transmitted.
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={userConfirmedDisclosure}
              onChange={(e) => setUserConfirmedDisclosure(e.target.checked)}
              className="w-4 h-4 rounded border-ghost-border bg-ghost-surface text-violet-600 focus:ring-0"
            />
            <span>I approve sending the sanitized context above to the configured hosted AI model.</span>
          </label>
        </div>
      )}

      {/* Capture Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-ghost-border">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Cpu className="w-4 h-4 text-violet-400" />
          <span>
            Provider: <strong className="text-slate-200 uppercase">{aiEngine?.provider || 'AI'}</strong> | Model:{' '}
            <strong className="text-slate-200">{aiEngine?.configuredModel || 'Not configured'}</strong>{' '}
            <span className={isAiReady ? 'text-emerald-400' : 'text-amber-400'}>
              ({isAiReady ? 'Ready' : 'Offline / Unconfigured'})
            </span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleCapture(true)}
            disabled={capturing}
            className="px-4 py-2.5 rounded-xl bg-ghost-surface hover:bg-slate-800 text-slate-300 font-medium text-xs border border-ghost-border transition-colors disabled:opacity-50"
          >
            Save Raw Snapshot (No AI)
          </button>

          <button
            onClick={() => handleCapture(false)}
            disabled={capturing || (isHostedAi && !userConfirmedDisclosure)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-xl shadow-violet-600/30 transition-all disabled:opacity-50 active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>{capturing ? 'Capturing Session...' : 'Confirm & Capture'}</span>
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
