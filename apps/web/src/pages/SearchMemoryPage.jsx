import React, { useState, useEffect } from 'react';
import { useSearchParams, NavLink } from 'react-router-dom';
import {
  Search,
  FolderGit2,
  Clock,
  Sparkles,
  ChevronRight,
  FileCode2,
  Tag,
  AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';
import { useWorkspace } from '../context/WorkspaceContext';

export default function SearchMemoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const { activeWorkspace } = useWorkspace();

  const handleSearch = async (targetQuery = query) => {
    if (!targetQuery.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    try {
      setSearching(true);
      setSearchParams({ q: targetQuery });
      const data = await api.searchMemory(targetQuery.trim());
      setResults(data || []);
      setSearched(true);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Search className="w-6 h-6 text-violet-400" />
          <span>Search Work Memory</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Perform natural queries across all previous session titles, summaries, modified filenames, and unresolved errors.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSubmit} className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by keywords, error messages, modified files (e.g. auth, Prisma, migration, token)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-28 py-3.5 text-sm bg-ghost-card border border-ghost-border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 shadow-lg"
          autoFocus
        />
        <button
          type="submit"
          disabled={searching}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs transition-colors disabled:opacity-50"
        >
          {searching ? 'Searching...' : 'Search'}
        </button>
      </form>

      {/* Suggested Quick Searches */}
      <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
        <span className="text-[11px] uppercase font-semibold text-slate-500">Quick queries:</span>
        {['Initial Architecture', 'Prisma', 'PostgreSQL', 'Auth', 'Modified files'].map((tag) => (
          <button
            key={tag}
            onClick={() => {
              setQuery(tag);
              handleSearch(tag);
            }}
            className="px-2.5 py-1 rounded-md bg-ghost-card hover:bg-slate-800 border border-ghost-border text-slate-300 text-xs transition-colors"
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Results */}
      {searching ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : searched ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Found <strong className="text-white">{results.length}</strong> matching memory record
              {results.length !== 1 ? 's' : ''}
            </span>
          </div>

          {results.length > 0 ? (
            <div className="space-y-3">
              {results.map((sess) => (
                <NavLink
                  key={sess.id}
                  to={`/sessions/${sess.id}`}
                  className="p-5 rounded-xl bg-ghost-card border border-ghost-border hover:border-violet-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 block group"
                >
                  <div className="space-y-2 flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-violet-400 flex items-center gap-1">
                        <FolderGit2 className="w-3.5 h-3.5" />
                        {sess.workspace?.name}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-xs text-slate-500 font-mono">
                        {new Date(sess.capturedAt).toLocaleDateString()}
                      </span>
                      {sess.matchReasons && (
                        <div className="flex items-center gap-1">
                          {sess.matchReasons.map((reason, i) => (
                            <span
                              key={i}
                              className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/15 text-violet-300 border border-violet-500/30"
                            >
                              {reason}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors">
                      {sess.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2">{sess.summary}</p>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white shrink-0 self-end md:self-auto" />
                </NavLink>
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-ghost-card border border-ghost-border p-12 text-center space-y-2">
              <Search className="w-8 h-8 text-slate-600 mx-auto" />
              <h3 className="text-sm font-semibold text-white">No memory matches found</h3>
              <p className="text-xs text-slate-400">
                Try searching for a different keyword, error trace, or filename.
              </p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
