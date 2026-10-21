import React, { useState } from 'react';
import {
  FolderGit2,
  PlusCircle,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  Clock,
  Sparkles
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { api } from '../services/api';

export default function WorkspacesPage() {
  const { workspaces, activeWorkspace, selectWorkspace, refreshWorkspaces } = useWorkspace();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', rootPath: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.rootPath.trim()) {
      setFormError('Workspace directory root path is required.');
      return;
    }

    try {
      setSubmitting(true);
      const newWs = await api.createWorkspace({
        name: formData.name.trim(),
        rootPath: formData.rootPath.trim(),
        description: formData.description.trim()
      });

      await refreshWorkspaces();
      selectWorkspace(newWs);
      setShowModal(false);
      setFormData({ name: '', rootPath: '', description: '' });
    } catch (err) {
      setFormError(err.message || 'Failed to register workspace.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete workspace "${name}" and all its saved session memories?`)) {
      return;
    }

    try {
      await api.deleteWorkspace(id);
      await refreshWorkspaces();
    } catch (err) {
      alert(`Failed to delete workspace: ${err.message}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Workspaces</h1>
          <p className="text-xs text-slate-400 mt-1">
            Register and manage local directories for ContextGhost to monitor and summarize.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs shadow-lg shadow-violet-600/20 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Register Workspace</span>
        </button>
      </div>

      {/* Workspace Cards Grid or Empty State */}
      {workspaces.length === 0 ? (
        <div className="rounded-xl bg-ghost-card border border-ghost-border p-12 text-center space-y-4">
          <FolderGit2 className="w-12 h-12 text-violet-400/60 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-white">No Workspaces Registered Yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Workspaces represent your projects or code repositories. Register your first project below to start capturing work sessions.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs shadow-lg shadow-violet-600/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Register Your First Workspace</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {workspaces.map((ws) => {
          const isActive = activeWorkspace?.id === ws.id;
          const sessionCount = ws._count?.sessions || 0;
          const lastSession = ws.sessions?.[0];

          return (
            <div
              key={ws.id}
              className={`rounded-xl bg-ghost-card border p-5 flex flex-col justify-between transition-all ${
                isActive
                  ? 'border-violet-500/50 shadow-lg shadow-violet-500/10'
                  : 'border-ghost-border hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                      <FolderGit2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white tracking-tight">{ws.name}</h3>
                      {isActive && (
                        <span className="text-[10px] font-medium text-violet-300 bg-violet-500/15 px-1.5 py-0.5 rounded border border-violet-500/30">
                          Active Workspace
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(ws.id, ws.name)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="Delete workspace"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="p-2 rounded bg-ghost-surface border border-ghost-border text-[11px] font-mono text-slate-400 truncate" title={ws.rootPath}>
                    {ws.rootPath}
                  </div>
                  {ws.description && (
                    <p className="text-xs text-slate-400 line-clamp-2">{ws.description}</p>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-ghost-border">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{sessionCount} sessions</span>
                  </div>
                  {lastSession && (
                    <span>Last: {new Date(lastSession.capturedAt).toLocaleDateString()}</span>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-ghost-border flex items-center justify-between gap-2">
                {!isActive ? (
                  <button
                    onClick={() => selectWorkspace(ws)}
                    className="w-full py-1.5 px-3 rounded-lg bg-ghost-surface hover:bg-slate-800 text-xs text-slate-200 font-medium border border-ghost-border transition-colors text-center"
                  >
                    Set as Active
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium py-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Currently Active</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Modal: Register Workspace */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-ghost-card border border-ghost-border rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-ghost-border pb-3">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-violet-400" />
                <h3 className="text-base font-bold text-white">Register Workspace</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Provide a Git repository URL (e.g. <code className="text-violet-300">https://github.com/org/repo</code>), project slug, or local directory path.
            </p>

            {formError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Repository URL or Path *
                </label>
                <input
                  type="text"
                  placeholder="https://github.com/org/repo or /path/to/project"
                  value={formData.rootPath}
                  onChange={(e) => setFormData({ ...formData, rootPath: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono bg-ghost-surface border border-ghost-border rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Workspace Display Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Defaults to directory name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-ghost-surface border border-ghost-border rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Primary project focus or purpose"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-ghost-surface border border-ghost-border rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-ghost-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Validating & Registering...' : 'Register Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
