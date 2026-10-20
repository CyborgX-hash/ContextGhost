# ContextGhost — Implementation Task Tracker

Authoritative implementation tracker for ContextGhost (Hacktoberfest Week 3 theme: "Slow and Steady").

## Legend
- `[ ]` Not started
- `[/]` In progress
- `[x]` Completed and verified

---

## Phase 0 — Repository, Planning & Monorepo Setup
- [x] **TASK-001**: Inspect existing workspace, runtime dependencies, tools (Node, Git, Ollama, PostgreSQL) and remote repository.
  - *Criteria*: Confirm clean environment, local database access, Ollama responsiveness, empty GitHub remote.
- [x] **TASK-002**: Initialize Git repository with `main` branch and configure GitHub remote `https://github.com/CyborgX-hash/ContextGhost.git`.
  - *Criteria*: Git initialized, branch `main`, remote origin set.
- [x] **TASK-003**: Create root `.gitignore`, `.env.example`, `LICENSE`, and `TASKS.md`.
  - *Criteria*: Sensitive files ignored, environment template documented with safe defaults, task tracker active.
- [x] **TASK-004**: Initialize root monorepo `package.json` with workspace configuration (`apps/web`, `apps/api`) and unified scripts (`dev`, `build`, `test`, `lint`).
  - *Criteria*: Workspaces defined, root commands dispatch to apps cleanly.
- [x] **TASK-005**: Write initial `README.md` introducing ContextGhost, architecture, Hacktoberfest alignment, and setup prerequisites.
  - *Criteria*: Clean documentation with project vision, architecture diagram, and prerequisites.

---

## Phase 1 — Foundation & Backend Setup
- [x] **TASK-101**: Initialize `apps/api` Express application with ES modules, error middleware, cors, and environment validation.
  - *Criteria*: Server starts on configured PORT (5001), validates environment, handles 404/500 cleanly with JSON.
- [x] **TASK-102**: Set up Prisma ORM with PostgreSQL database schema in `apps/api/prisma/schema.prisma`.
  - *Criteria*: Normalized models (`Workspace`, `Session`, `SessionFile`, `Issue`, `NextAction`, `SessionNote`) with relations, indexes, timestamps.
- [x] **TASK-103**: Create and run initial Prisma migration `init` against local PostgreSQL `contextghost` database.
  - *Criteria*: Migration applied cleanly, tables verified in PostgreSQL.
- [x] **TASK-104**: Implement database seed script in `apps/api/prisma/seed.js` with realistic demo workspaces and sessions.
  - *Criteria*: `npm run seed` executes without errors and inserts verifiable sample records.
- [x] **TASK-105**: Implement REST API health, readiness, and system status endpoints under `/api/v1/health` and `/api/v1/system/status`.
  - *Criteria*: Returns 200 OK with database connection status, Ollama reachability, timestamp, and version.

---

## Phase 2 — Frontend Foundation & Dashboard UI
- [ ] **TASK-201**: Initialize `apps/web` with Vite, React, Tailwind CSS, Lucide icons, and React Router.
  - *Criteria*: Modern responsive frontend runs on port 5173 with dark mode theme tokens and typography.
- [ ] **TASK-202**: Build App Shell layout: collapsible sidebar with logo, navigation links, workspace selector, and real-time backend/model status pills.
  - *Criteria*: Responsive sidebar, mobile toggle, active link indicators, persistent selected workspace.
- [ ] **TASK-203**: Build Top Navigation with current project badge, quick capture CTA, search trigger, and model indicator.
  - *Criteria*: Clean header with breadcrumb/active project context and quick actions.
- [ ] **TASK-204**: Build Overview Dashboard page (`/`):
  - "Welcome back" banner with prominent "Resume My Work" CTA.
  - "Where You Left Off" card (latest AI briefing, primary task, modified files, timestamp).
  - "Unresolved Issues" card (errors, failed tests, attempts).
  - "Next Actions" card (top 3 prioritized suggestions with reasoning & file links).
  - "Recent Sessions" list with real data from backend.
  - *Criteria*: Dark charcoal aesthetics, accurate counts, no hardcoded fake statistics.
- [ ] **TASK-205**: Build Workspaces Management view (`/workspaces`): list, register local directory, edit, delete, inspect.
  - *Criteria*: Full CRUD UI with path validation feedback.
- [ ] **TASK-206**: Build Session Capture modal/view (`/capture`):
  - Workspace selector, Git status inspector, changed files preview, optional notes input, terminal/test log import, secret preview warning, and "Capture Session" action.
  - *Criteria*: Transparent preview of captured payload before AI processing.
- [ ] **TASK-207**: Build Session Detail / Resume View (`/sessions/:id`):
  - Header, AI briefing tabs (Executive Briefing, Changed Files, Issues & Failures, Next Actions, Raw Snapshot), add note, recapture, delete.
  - *Criteria*: Formatted evidence links, stale-age badges, copy-to-clipboard, export markdown.
- [ ] **TASK-208**: Build Session History list page (`/sessions`):
  - Filter by workspace, date range, search query, status badge.
  - *Criteria*: Paginated/searchable list of persistent sessions.
- [ ] **TASK-209**: Build Search Memory page (`/search`):
  - Real-time search across sessions, notes, changed files, and action items with matching highlights.
  - *Criteria*: Accurate search results returned from database.
- [ ] **TASK-210**: Build Settings page (`/settings`):
  - Ollama base URL & model configuration, model ping test, PostgreSQL connection health, data retention & privacy controls.
  - *Criteria*: Tests live connections and updates preferences without exposing credentials.

---

## Phase 3 — Workspace & Git Context Engine
- [ ] **TASK-301**: Implement Workspace service in `apps/api/src/services/workspaceService.js`:
  - Path existence validation, directory permission checks, path traversal prevention, safe boundaries.
  - *Criteria*: Blocks paths outside server-accessible allowed directories; rejects relative traversal.
- [ ] **TASK-302**: Implement Git context collector in `apps/api/src/services/gitService.js`:
  - Current branch, commit hash/author/date, repository status (modified, staged, untracked).
  - Safe subprocess execution with array arguments (`child_process.execFile`), timeouts, and no shell concatenation.
  - *Criteria*: Collects Git status without modifying working tree; handles non-Git directories gracefully.
- [ ] **TASK-303**: Implement Git diff summarizer and file excerpt extractor:
  - Concise diff summaries, changed line counts, relevant snippet previews.
  - Respect `.gitignore`, exclude binary files, lockfiles, `.env`, dependency folders.
  - *Criteria*: Avoids huge diffs; truncates at configurable character limit.
- [ ] **TASK-304**: Implement Secret Redactor in `apps/api/src/utils/redactor.js`:
  - Detect and mask API keys, tokens, passwords, private keys, JWTs, connection strings in git diffs, notes, and imported logs.
  - *Criteria*: Verified against common secret patterns (AWS, GitHub, Generic API keys, DB URIs).
- [ ] **TASK-305**: Implement Log & Test result parser:
  - File size limits (max 1MB), text validation, extraction of error traces and failing test names.
  - *Criteria*: Safely isolates error blocks as untrusted input.

---

## Phase 4 — Local AI Synthesis Engine (Ollama)
- [ ] **TASK-401**: Implement Ollama AI client provider in `apps/api/src/ai/ollamaProvider.js`:
  - Health check endpoint, model list retrieval, model readiness verification, timeout handling.
  - *Criteria*: Clear diagnostic messages when Ollama is offline or model is missing.
- [ ] **TASK-402**: Build Prompt Synthesis engine in `apps/api/src/ai/promptBuilder.js`:
  - Synthesize system instructions, developer workspace context, Git status, diff excerpts, test logs, and notes.
  - Enforce untrusted data boundaries (protect against prompt injection inside code/logs).
  - *Criteria*: Deterministic prompt requesting structured JSON output conforming to strict schema.
- [ ] **TASK-403**: Implement Structured Output Validator & Parser in `apps/api/src/ai/outputValidator.js`:
  - Parse JSON response, validate schema (`sessionTitle`, `mainObjective`, `summary`, `accomplishments`, `modifiedFiles`, `unresolvedIssues`, `previousAttempts`, `nextActions`, `evidence`, `confidenceNotes`).
  - Fallback repair mechanism for slightly malformed JSON; safe fallback to raw snapshot if generation fails.
  - *Criteria*: Never crashes on unexpected model output; strictly validates fields.
- [ ] **TASK-404**: Implement AI Session Analysis service orchestrator in `apps/api/src/services/aiService.js`:
  - Integrates provider, prompt builder, validator, and bounded retry.
  - *Criteria*: End-to-end unit and integration testable with both live Ollama and mocked fallback.

---

## Phase 5 — Persistence, Session Capture & Resume Workflow
- [ ] **TASK-501**: Implement Session Capture API endpoint (`POST /api/v1/sessions/capture`):
  - Validates input, collects git context, redacts secrets, invokes AI analysis, saves relational records (Session, SessionFile, Issue, NextAction) inside Prisma transaction.
  - *Criteria*: Complete session saved in PostgreSQL with full audit trail and status.
- [ ] **TASK-502**: Implement Session CRUD and retrieval endpoints:
  - `GET /api/v1/sessions` (list with filters), `GET /api/v1/sessions/:id` (full details with relations), `PATCH /api/v1/sessions/:id/notes`, `DELETE /api/v1/sessions/:id`.
  - *Criteria*: Fully verified with database persistence.
- [ ] **TASK-503**: Implement "Resume My Work" briefing endpoint (`GET /api/v1/workspaces/:id/resume`):
  - Fetches the most recent session for workspace, calculates elapsed time, identifies unresolved issues, prioritized next actions, and staleness warning.
  - *Criteria*: Returns instant actionable briefing for developer resumption.
- [ ] **TASK-504**: Implement Database-backed Search Memory endpoint (`GET /api/v1/search`):
  - PostgreSQL full-text search across session titles, summaries, issues, next actions, and notes.
  - *Criteria*: Fast, multi-field search with ranked results.

---

## Phase 6 — Testing & Quality Assurance
- [ ] **TASK-601**: Add backend unit and integration tests using Vitest & Supertest:
  - Secret redactor tests, Git service tests, path traversal tests, health check tests, session API tests.
  - *Criteria*: All automated test suites pass with high confidence.
- [ ] **TASK-602**: Add frontend component and page tests:
  - App shell, dashboard rendering, session detail tabs, capture flow empty/loading/error states.
  - *Criteria*: Frontend test suite executes cleanly.
- [ ] **TASK-603**: Perform end-to-end integration verification:
  - Full flow: workspace creation -> git inspection -> secret redaction -> session capture -> AI briefing -> resume -> search -> note update.
  - *Criteria*: Zero console errors, responsive UI, database state validated.

---

## Phase 7 — Documentation, Hacktoberfest Release & Polish
- [ ] **TASK-701**: Create comprehensive `README.md`:
  - Hero overview, architecture diagrams, Hacktoberfest Week 3 theme highlights ("Slow and Steady"), step-by-step installation, PostgreSQL setup, Ollama model setup, API reference.
  - *Criteria*: Clear, professional, reproducible documentation.
- [ ] **TASK-702**: Create `docs/ARCHITECTURE.md` and `docs/API.md`:
  - In-depth design documentation, security boundaries, and data flow.
- [ ] **TASK-703**: Final clean Git verification, license verification, and release commit.
  - *Criteria*: Clean git tree, pushed to GitHub repository, passing tests.
