# ContextGhost 👻
> **Forget where you left off. ContextGhost remembers.**

[![Hacktoberfest 2026](https://img.shields.io/badge/Hacktoberfest-2026%20Week%203-blueviolet?style=for-the-badge)](https://hacktoberfest.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)](LICENSE)
[![Hosted Open-Weight AI](https://img.shields.io/badge/AI-Open--Weight%20(OpenRouter)-blue?style=for-the-badge)](https://openrouter.ai/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20%2B%20Prisma-336791?style=for-the-badge)](https://www.prisma.io/)

ContextGhost is a **developer work-memory assistant** that helps software engineers resume interrupted work without reconstructing their entire mental context. It captures your active Git state, modified files, terminal errors, test results, and notes, uses a **hosted open-weight AI model** (via OpenRouter or Groq) or a local Ollama instance to synthesize a grounded session summary, persists relational records in **PostgreSQL**, and generates actionable **"Resume My Work"** briefings whenever you return to your codebase.

Built for **Hacktoberfest 2026 Week 3 ("Slow and Steady")**, ContextGhost demonstrates that open-weight AI models can eliminate mental fatigue and repetitive context-switching without requiring heavy local server installations or proprietary closed APIs.

---

## ⚡ The Problem: Context Switching Fatigue

Developers lose up to 40% of their daily productive hours recovering from interruptions:
- *What was I implementing right before that 2-hour meeting?*
- *Which files did I touch, and why?*
- *Which unit tests or build commands were failing?*
- *What debugging attempts have I already ruled out?*
- *What are the top 3 concrete actions I need to take right now?*

Writing manual markdown worklogs is tedious and rarely maintained. Chatbots require pasting files and explaining project context repeatedly.

**ContextGhost solves this deterministically**:
1. Click **Capture Session** before stepping away.
2. ContextGhost securely inspects Git status, accepts pasted diffs or uploaded context files, masks credentials, parses error logs, and displays a sanitized preview.
3. Review and confirm the transmission disclosure to synthesize structured work memory via the configured hosted open-weight model.
4. Return hours or days later and click **Resume My Work** for an instant briefing with prioritized next steps and evidence references.

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────┐
│           ContextGhost React Frontend (Vercel)         │
│          (Vite + Tailwind CSS + Lucide Icons)          │
│                 https://app.vercel.app                 │
└───────────────────────────┬────────────────────────────┘
                            │ REST API (/api/v1)
┌───────────────────────────▼────────────────────────────┐
│            ContextGhost Express API (Render)           │
│       Safe Git Inspector & Secret Redaction Engine     │
│             https://contextghost-api.onrender.com      │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
               ▼                          ▼
 ┌──────────────────────────┐  ┌────────────────────────┐
 │   Prisma ORM + Postgres  │  │ Hosted Open-Weight AI  │
 │   Relational Memory &    │  │ (OpenRouter / Groq /   │
 │   Full-Text Search       │  │  Optional Local Ollama)│
 └──────────────────────────┘  └────────────────────────┘
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for full design, security boundaries, and data flow.

---

## 🤖 Hosted Open-Weight AI Models & Licenses

ContextGhost is committed to **open-weight architectures**. Rather than locking into closed proprietary models, ContextGhost connects to open-weight models hosted on **[OpenRouter](https://openrouter.ai/)**:

| Model Identifier | Architecture / Family | Published License | Recommended Use |
| :--- | :--- | :--- | :--- |
| `meta-llama/llama-3.3-70b-instruct` | Meta Llama 3.3 | Llama 3.3 Community License | Complex debugging, multi-file diff synthesis |
| `qwen/qwen-2.5-72b-instruct` | Alibaba Qwen 2.5 | Apache 2.0 | Ultra-fast structured JSON generation |
| `mistralai/mistral-small-24b-instruct-2501` | Mistral NeMo | Apache 2.0 | Balanced speed, precision, and low latency |

### Privacy & Hosted Data Handling
- **Multi-Layer Secret Redaction:** AWS keys, GitHub tokens, database connection URLs, JWTs, and private keys are scrubbed on the server before transmitting anything to OpenRouter.
- **Explicit User Consent:** Context is only sent to the external provider when you explicitly click **Confirm & Capture**.
- **Untrusted Input Isolation:** Imported code, diffs, and logs are wrapped inside XML evidence tags to neutralize prompt injection attempts.
- **Offline Fallback:** If the AI provider is unconfigured or unavailable, ContextGhost saves an unanalyzed **`RAW_SNAPSHOT`** directly in PostgreSQL so no work is ever lost.

---

## ✨ Core Features

| Feature | Description |
| :--- | :--- |
| **Grounded AI Synthesis** | Synthesizes accomplishments, unresolved errors, and actionable next steps without hallucinating. |
| **Instant "Resume My Work"** | One-click briefing highlighting where you left off, elapsed time, staleness level, and top 3 next steps. |
| **Flexible Context Capture** | Inspects local Git repos or accepts pasted diffs (`git diff`) and uploaded context files (`.diff`, `.patch`, `.log`, `.txt`, `.md`). |
| **Multi-Layer Secret Redactor** | Masks AWS keys, GitHub tokens, database connection URLs, JWTs, and private keys before AI processing. |
| **Normalized PostgreSQL Storage** | Structured relational tables (`Workspace`, `Session`, `SessionFile`, `Issue`, `NextAction`, `SessionNote`) via Prisma ORM. |
| **Searchable Memory** | Fast PostgreSQL-backed search across session titles, summaries, modified filenames, and error traces. |
| **Multi-Provider Architecture** | Supports **OpenRouter** (hosted open-weight), **Groq** (fast cloud), and **Ollama** (offline local). |
| **Dark Developer Aesthetic** | Custom dark charcoal theme, responsive sidebar, status pills for DB/AI, and clear typography. |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v20/v22)
- **PostgreSQL**: v14+ (Local instance or cloud provider like Prisma Postgres, Supabase, Neon)
- **OpenRouter API Key** (or Groq, or local Ollama)

### 2. Clone & Install Dependencies
```bash
git clone https://github.com/CyborgX-hash/ContextGhost.git
cd ContextGhost
npm install
```

### 3. Configure Environment Variables
```bash
cp .env.example .env
```
Edit `.env` to configure your database and AI provider:
```dotenv
# Database Connection
DATABASE_URL="postgresql://user:password@localhost:5432/contextghost?schema=public"

# AI Provider: 'openrouter' (default hosted), 'groq', or 'ollama'
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
```

### 4. Run Database Schema Sync & Seed
```bash
npm run prisma:migrate
npm run prisma:seed
```

### 5. Start Development Servers
```bash
# Starts both Express API (port 5001) and Vite Frontend (port 5173)
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser!

---

## ☁️ Deployment Guide

### Deploying Backend to Render
1. Create a **Web Service** on [Render](https://dashboard.render.com/) and connect your GitHub repository `ContextGhost`.
2. Configure:
   - **Root Directory:** `apps/api`
   - **Build Command:** `npm install && npx prisma migrate deploy`
   - **Start Command:** `node src/server.js`
3. Set the following **Environment Variables** in Render:
   - `DATABASE_URL`: *(Your PostgreSQL connection string)*
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `FRONTEND_URL`: `https://your-contextghost-frontend.vercel.app`
   - `AI_PROVIDER`: `openrouter`
   - `OPENROUTER_API_KEY`: *(Your OpenRouter API key)*
   - `OPENROUTER_MODEL`: `meta-llama/llama-3.3-70b-instruct`
   - `OPENROUTER_BASE_URL`: `https://openrouter.ai/api/v1`

### Deploying Frontend to Vercel
1. Create a **New Project** on [Vercel](https://vercel.com/) and import your `ContextGhost` repository.
2. Configure:
   - **Root Directory:** `apps/web`
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Add the **Environment Variable**:
   - `VITE_API_BASE_URL`: `https://your-contextghost-api.onrender.com/api/v1`

---

## 🧪 Automated Testing

ContextGhost includes comprehensive unit, integration, and UI test suites:
```bash
# Run all tests (API + Frontend)
npm test

# Run backend test suite (45 tests covering OpenRouter, redactor, git, workspaces, sessions)
npm run test --workspace=apps/api

# Run frontend UI tests
npm run test --workspace=apps/web
```

---

## 🛡️ Security & Privacy Architecture

- **Zero Secret Leakage:** Backend API keys and credentials are never sent to the browser or stored in session records.
- **Subprocess Safety:** Local Git commands run via `child_process.execFile` with array arguments and 5s timeouts (zero shell injection risk).
- **Upload Restrictions:** File uploads are restricted to text-based context files (`.diff`, `.patch`, `.log`, `.txt`, `.md`) under 1MB. Credentials like `.env` and `id_rsa` are rejected outright.
- **Prompt Injection Defense:** Untrusted code and logs are strictly wrapped in XML boundary tags and analyzed as evidence rather than executable instructions.

---

## 📖 Documentation
- [Architecture & Security Specification](docs/ARCHITECTURE.md)
- [REST API Reference](docs/API.md)
- [Task Implementation Tracker](TASKS.md)

---

## 🎃 Hacktoberfest Week 3: "Slow and Steady"

Hacktoberfest 2026 Week 3 celebrates deliberate, high-quality development that creates sustainable value. ContextGhost embodies this ethos:
- Grounded, evidence-backed summaries over flashy hallucinatory chat.
- Relational PostgreSQL storage instead of volatile local state.
- Hosted open-weight AI over closed proprietary lock-in.

---

## 📄 License

Licensed under the [MIT License](LICENSE).
