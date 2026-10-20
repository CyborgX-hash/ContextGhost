import React, { useState } from 'react';
import {
  Settings,
  Cpu,
  Database,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Info,
  Terminal,
  ExternalLink
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { api } from '../services/api';

export default function SettingsPage() {
  const { systemStatus, refreshSystemStatus } = useWorkspace();
  const [testing, setTesting] = useState(false);
  const [testMessage, setTestMessage] = useState(null);

  const handleTestConnection = async () => {
    try {
      setTesting(true);
      setTestMessage(null);
      await refreshSystemStatus();
      setTestMessage('System diagnostics refreshed successfully.');
    } catch (err) {
      setTestMessage(`Diagnostics failed: ${err.message}`);
    } finally {
      setTesting(false);
    }
  };

  const dbStatus = systemStatus?.database;
  const aiStatus = systemStatus?.aiEngine;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-violet-400" />
            <span>Settings & Diagnostics</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Verify local Ollama model availability, PostgreSQL health, and privacy configuration.
          </p>
        </div>

        <button
          onClick={handleTestConnection}
          disabled={testing}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-ghost-card hover:bg-slate-800 border border-ghost-border text-xs text-slate-200 font-medium transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
          <span>Refresh Diagnostics</span>
        </button>
      </div>

      {testMessage && (
        <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs flex items-center gap-2">
          <Info className="w-4 h-4" />
          <span>{testMessage}</span>
        </div>
      )}

      {/* 1. Local AI Engine (Ollama) */}
      <div className="rounded-xl bg-ghost-card border border-ghost-border p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-ghost-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Local Ollama AI Inference</h3>
              <p className="text-[11px] text-slate-400">Open-weight model running entirely on local hardware</p>
            </div>
          </div>

          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
              aiStatus?.connected && aiStatus?.modelAvailable
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : aiStatus?.connected
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
            }`}
          >
            {aiStatus?.connected && aiStatus?.modelAvailable
              ? 'Model Ready'
              : aiStatus?.connected
              ? 'Model Missing'
              : 'Offline'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-lg bg-ghost-surface border border-ghost-border space-y-1">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Ollama Base URL</span>
            <span className="font-mono text-slate-200">{aiStatus?.baseUrl || 'http://localhost:11434'}</span>
          </div>
          <div className="p-3 rounded-lg bg-ghost-surface border border-ghost-border space-y-1">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Configured Model</span>
            <span className="font-mono text-violet-300 font-bold">{aiStatus?.configuredModel || 'qwen2.5:1.5b'}</span>
          </div>
        </div>

        {aiStatus?.availableModels && aiStatus.availableModels.length > 0 && (
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">
              Locally Installed Models ({aiStatus.availableModels.length}):
            </span>
            <div className="flex flex-wrap gap-2">
              {aiStatus.availableModels.map((model) => (
                <span
                  key={model}
                  className="px-2 py-0.5 rounded bg-ghost-surface border border-ghost-border text-[11px] font-mono text-slate-300"
                >
                  {model}
                </span>
              ))}
            </div>
          </div>
        )}

        {(!aiStatus?.connected || !aiStatus?.modelAvailable) && (
          <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-2">
            <p className="font-medium">Ollama Setup Required:</p>
            <div className="bg-black/40 p-2.5 rounded font-mono text-[11px] space-y-1 text-slate-200">
              <div># Start Ollama service</div>
              <div className="text-violet-400">ollama serve</div>
              <div className="pt-1"># Pull configured model</div>
              <div className="text-violet-400">ollama pull {aiStatus?.configuredModel || 'qwen2.5:1.5b'}</div>
            </div>
          </div>
        )}
      </div>

      {/* 2. PostgreSQL Persistence */}
      <div className="rounded-xl bg-ghost-card border border-ghost-border p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-ghost-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">PostgreSQL Persistence Engine</h3>
              <p className="text-[11px] text-slate-400">Relational work memory managed via Prisma ORM</p>
            </div>
          </div>

          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
              dbStatus?.connected
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
            }`}
          >
            {dbStatus?.connected ? 'Connected' : 'Connection Error'}
          </span>
        </div>

        <div className="p-3 rounded-lg bg-ghost-surface border border-ghost-border text-xs flex items-center justify-between">
          <span className="text-slate-400">Database Name:</span>
          <span className="font-mono text-slate-200 font-semibold">contextghost</span>
        </div>
      </div>

      {/* 3. Privacy & Redaction Policy */}
      <div className="rounded-xl bg-ghost-card border border-ghost-border p-6 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-ghost-border pb-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Privacy & Local-First Guarantees</h3>
            <p className="text-[11px] text-slate-400">Zero cloud dependencies for your source code and logs</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-ghost-surface border border-ghost-border space-y-1">
            <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Secret Redaction</span>
            </span>
            <p className="text-slate-400 text-[11px]">
              AWS credentials, GitHub tokens, database passwords, and private keys are masked before processing.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-ghost-surface border border-ghost-border space-y-1">
            <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>No Telemetry</span>
            </span>
            <p className="text-slate-400 text-[11px]">
              ContextGhost never uploads developer code, session notes, or diffs to external hosted APIs.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Hacktoberfest Week 3 Context */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-violet-950/30 to-indigo-950/30 border border-violet-500/20 text-xs space-y-2">
        <span className="text-[10px] uppercase font-bold tracking-wider text-violet-400">
          Hacktoberfest 2026 Week 3
        </span>
        <h4 className="text-sm font-bold text-white">Theme: "Slow and Steady"</h4>
        <p className="text-slate-400 text-xs leading-relaxed">
          ContextGhost exemplifies the "Slow and Steady" ethos: instead of frantically explaining context repeatedly to generic chatbots, developers rely on local-first, privacy-respecting work memory that reconstructs their progress deterministically.
        </p>
      </div>
    </div>
  );
}
