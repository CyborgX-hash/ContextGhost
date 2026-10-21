import React from 'react';
import {
  BookOpen,
  FolderGit2,
  Sparkles,
  History,
  Search,
  ShieldCheck,
  Cpu,
  Database,
  ArrowRight,
  CheckCircle2,
  Terminal,
  FileCode2,
  Layers,
  HelpCircle
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function UserGuidePage() {
  const sections = [
    {
      title: 'Workspaces',
      path: '/workspaces',
      icon: FolderGit2,
      badge: 'Core Setup',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      description: 'Your project codebases and repositories.',
      details: [
        'Organizes sessions, diffs, and notes under specific projects so they never get mixed up.',
        'Register local directory paths or GitHub repository URLs.',
        'Set any workspace as "Active" to make it your current focus.',
        'Delete or edit workspaces and their associated memories anytime.'
      ]
    },
    {
      title: 'Capture Session',
      path: '/capture',
      icon: Sparkles,
      badge: 'Main Workflow',
      badgeColor: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
      description: 'Record messy uncommitted work, errors, and mental context.',
      details: [
        'Git Context: Inspect local uncommitted diffs automatically or paste `git diff` output.',
        'Developer Notes: Jot down what you were trying to build or test right before stopping.',
        'Terminal Logs: Paste error stack traces, build failures, or failing test output.',
        'Previous Attempts: Record what you already tried so you never repeat failed experiments.',
        'Secret Redaction: Automatically masks passwords, API tokens, and credentials into [REDACTED_SECRET].',
        'AI Synthesis: Uses open-weight model (Qwen 3.8 27B on Groq) to synthesize a structured resumption briefing.'
      ]
    },
    {
      title: 'Overview Dashboard',
      path: '/',
      icon: Layers,
      badge: 'Cockpit',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      description: 'High-level metrics, pipeline status, and quick resumption.',
      details: [
        'Resumption Readiness Score: Visual percentage of how ready your project is to be resumed.',
        'Work Pipeline: Tracks sessions categorized as Drafts, In Progress, or Resolved.',
        'Recent Sessions Grid: Filter by status pills or workspace dropdown.',
        'One-Click Resume: Direct link to any session\'s step-by-step action plan.'
      ]
    },
    {
      title: 'Session History',
      path: '/sessions',
      icon: History,
      badge: 'Audit Trail',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      description: 'Complete chronological archive of all captured work sessions.',
      details: [
        'Full timeline of past debugging sessions and development snapshots.',
        'View unfinished task checklists and mark items completed as you finish them.',
        'Inspect raw captured snapshots and AI-generated confidence scores.'
      ]
    },
    {
      title: 'Search Memory',
      path: '/search',
      icon: Search,
      badge: 'Memory Retrieval',
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      description: 'Search across notes, terminal logs, and previous code changes.',
      details: [
        'Query past errors (e.g., "webhook signature", "JWT expiry", "Prisma timeout").',
        'Filter memory retrieval by specific workspace or across all repositories.',
        'Instant retrieval of historical solutions without re-debugging from scratch.'
      ]
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 text-xs font-medium">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Documentation & Guide</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">ContextGhost User Manual</h1>
        <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
          Forget where you left off? ContextGhost captures your messy, uncommitted developer context and uses open-weight AI to synthesize structured resumption briefings.
        </p>
      </div>

      {/* Quick 3-Step Workflow Banner */}
      <div className="bg-[#121826] border border-[#1a2233] rounded-2xl p-6">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-400" />
          <span>The 3-Step ContextGhost Workflow</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <span className="w-6 h-6 rounded-full bg-violet-600/30 text-violet-300 font-bold flex items-center justify-center text-xs">1</span>
            <h3 className="font-semibold text-white text-sm">Register Workspace</h3>
            <p className="text-slate-400 leading-relaxed">
              Add your project folder or GitHub repository in <NavLink to="/workspaces" className="text-violet-400 hover:underline">Workspaces</NavLink> so memories are organized by project.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <span className="w-6 h-6 rounded-full bg-blue-600/30 text-blue-300 font-bold flex items-center justify-center text-xs">2</span>
            <h3 className="font-semibold text-white text-sm">Capture On Interruption</h3>
            <p className="text-slate-400 leading-relaxed">
              Before a meeting or closing your laptop, hit <NavLink to="/capture" className="text-blue-400 hover:underline">Capture Session</NavLink>. Paste your diffs, terminal errors, and quick notes.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <span className="w-6 h-6 rounded-full bg-emerald-600/30 text-emerald-300 font-bold flex items-center justify-center text-xs">3</span>
            <h3 className="font-semibold text-white text-sm">Resume Tomorrow in Seconds</h3>
            <p className="text-slate-400 leading-relaxed">
              Open your <NavLink to="/" className="text-emerald-400 hover:underline">Dashboard</NavLink>. Review your AI-generated Resumption Steps and pick up right where you left off.
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Section Breakdown */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight">Section Guide & Features</h2>
        <div className="grid grid-cols-1 gap-4">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div
                key={section.title}
                className="bg-[#121826] border border-[#1a2233] hover:border-slate-700/80 rounded-2xl p-6 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-600/15 border border-violet-500/30 flex items-center justify-center text-violet-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">{section.title}</h3>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${section.badgeColor}`}>
                          {section.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{section.description}</p>
                    </div>
                  </div>
                  <NavLink
                    to={section.path}
                    className="inline-flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 font-medium self-start sm:self-auto"
                  >
                    <span>Open Section</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </NavLink>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#1a2233]">
                  {section.details.map((detail, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Security & System Health */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#121826] border border-[#1a2233] rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-violet-400 font-semibold text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>Multi-Layer Secret Redaction</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Every session capture is scanned before storage or transmission. API keys (OpenAI, Groq, Stripe, AWS), passwords, and private tokens are masked into <code className="text-violet-300 bg-violet-500/10 px-1 py-0.5 rounded font-mono">[REDACTED_SECRET]</code> to protect credentials.
          </p>
        </div>

        <div className="bg-[#121826] border border-[#1a2233] rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
            <Cpu className="w-4 h-4" />
            <span>Hosted Open-Weight AI</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Powered by open-weight models (<strong className="text-slate-200">Qwen 3.8 27B</strong> on Groq LPUs or OpenRouter) with local <strong className="text-slate-200">Ollama</strong> offline fallback support. No closed-source vendor lock-in.
          </p>
        </div>
      </div>
    </div>
  );
}
