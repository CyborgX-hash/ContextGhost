# ContextGhost 👻
> **Forget where you left off. ContextGhost remembers.**

[![Hacktoberfest 2026](https://img.shields.io/badge/Hacktoberfest-2026%20Week%203-blueviolet?style=for-the-badge)](https://hacktoberfest.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)](LICENSE)
[![Local First](https://img.shields.io/badge/AI-Local--First%20(Ollama)-blue?style=for-the-badge)](https://ollama.ai)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20%2B%20Prisma-336791?style=for-the-badge)](https://www.prisma.io/)

ContextGhost is a **local-first, privacy-preserving AI work memory assistant** for software engineers. It captures your active Git state, modified files, terminal errors, test results, and notes, uses an open-weight model running locally on your hardware via Ollama to synthesize a grounded session summary, persists relational records in PostgreSQL, and generates actionable "Resume My Work" briefings whenever you return to your codebase.

Built for **Hacktoberfest 2026 Week 3 ("Slow and Steady")**, ContextGhost demonstrates that open-weight local AI can eliminate mental fatigue and repetitive context-switching without sending your proprietary code to third-party cloud APIs.

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
2. ContextGhost securely inspects Git status, masks credentials, parses error logs, and synthesizes structured work memory via local Ollama.
3. Return hours or days later and click **Resume My Work** for an instant briefing with prioritized next steps and evidence references.

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────┐
│              ContextGhost React Frontend               │
│          (Vite + Tailwind CSS + Lucide Icons)          │
│               http://localhost:5173                    │
└───────────────────────────┬────────────────────────────┘
                            │ REST API (/api/v1)
┌───────────────────────────▼────────────────────────────┐
│              ContextGhost Express API                  │
│       Safe Git Inspector & Secret Redaction Engine     │
│               http://localhost:5001                    │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
               ▼                          ▼
 ┌──────────────────────────┐  ┌────────────────────────┐
 │   Prisma ORM + Postgres  │  │  Local Ollama Engine   │
 │   Relational Memory &    │  │  (Open-weight Models   │
 │   Full-Text Search       │  │   e.g., qwen2.5:1.5b)  │
 └──────────────────────────┘  └────────────────────────┘
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for full design, security boundaries, and data flow.

---

## ✨ Core Features

| Feature | Description |
| :--- | :--- |
| **Grounded AI Synthesis** | Uses local open-weight models (`qwen2.5`) to extract accomplishments, unresolved errors, and actionable next steps without hallucinating. |
| **Instant "Resume My Work"** | One-click briefing highlighting where you left off, elapsed time, staleness level, and top 3 next steps. |
| **Safe Git Inspector** | Safe subprocess execution with array arguments (`execFile`), 5s timeouts, and zero shell concatenation. |
| **Multi-Layer Secret Redactor** | Masks AWS keys, GitHub tokens, database connection URLs, JWTs, and private keys before AI processing. |
| **Normalized PostgreSQL Storage** | Structured relational tables (`Workspace`, `Session`, `SessionFile`, `Issue`, `NextAction`, `SessionNote`) via Prisma ORM. |
| **Searchable Memory** | Fast PostgreSQL-backed search across session titles, summaries, modified filenames, and error traces. |
| **Offline Resilience** | If Ollama is offline or a model is missing, ContextGhost saves a deterministic `RAW_SNAPSHOT` so no work is lost. |
| **Dark Developer Aesthetic** | Custom dark charcoal theme, responsive sidebar, status pills for DB/AI, and clear typography. |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v22)
- **PostgreSQL**: v14+ running locally on port `5432`
- **Ollama**: running locally on `http://localhost:11434`

### 2. Install Ollama Model
```bash
ollama serve
ollama pull qwen2.5:1.5b
```

### 3. Clone & Install Dependencies
```bash
git clone https://github.com/CyborgX-hash/ContextGhost.git
cd ContextGhost
npm install
```

### 4. Configure Environment
```bash
cp .env.example .env
```
Ensure your `DATABASE_URL` in `.env` points to your local PostgreSQL instance:
```dotenv
DATABASE_URL="postgresql://username:password@localhost:5432/contextghost?schema=public"
OLLAMA_BASE_URL="http://localhost:11434"
OLLAMA_MODEL="qwen2.5:1.5b"
```

### 5. Run Database Migrations & Seed
```bash
npm run prisma:migrate
npm run prisma:seed
```

### 6. Start Development Servers
```bash
# Starts both Express API (port 5001) and Vite Frontend (port 5173)
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser!

---

## 🧪 Testing

Run automated tests across the monorepo:
```bash
# Run all tests (API + Frontend)
npm test

# Run backend unit & integration tests
npm run test --workspace=apps/api

# Run frontend UI tests
npm run test --workspace=apps/web
```

---

## 🛡️ Security & Privacy Guarantees

- **No Hosted AI Dependency**: Zero telemetry, zero external AI API keys needed.
- **Path Traversal Protection**: Rejects null bytes, relative traversal, and direct system roots.
- **Secret Redaction**: Diffs, terminal logs, and notes are sanitized with regular expressions prior to prompt creation.
- **Untrusted Input Isolation**: Imported code and logs are strictly enclosed in `<developer_evidence>` blocks to neutralize prompt injection attempts.

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
- Privacy-first open-weight AI over vendor lock-in.

---

## 📄 License

Licensed under the [MIT License](LICENSE).
