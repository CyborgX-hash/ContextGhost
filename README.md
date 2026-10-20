# ContextGhost 👻
> **Forget where you left off. ContextGhost remembers.**

[![Hacktoberfest 2026](https://img.shields.io/badge/Hacktoberfest-2026%20Week%203-blueviolet?style=for-the-badge)](https://hacktoberfest.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)](LICENSE)
[![Local First](https://img.shields.io/badge/AI-Local--First%20(Ollama)-blue?style=for-the-badge)](https://ollama.ai)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20%2B%20Prisma-336791?style=for-the-badge)](https://www.prisma.io/)

ContextGhost is a privacy-first, local-first developer productivity assistant that captures relevant information from your active development workspace, uses open-weight local AI (powered by Ollama) to reconstruct your session state, saves persistent memory in PostgreSQL, and generates instant, actionable briefings whenever you return.

Built for **Hacktoberfest 2026 Week 3 ("Slow and Steady")**, ContextGhost puts real open-weight models to work on deterministic developer context—with zero telemetry, zero paid API keys, and complete data privacy.

---

## ⚡ The Problem

Developers face constant interruptions and context switching:
- *What was I implementing right before the meeting?*
- *Which files did I touch, and why?*
- *Which unit tests or build commands were failing?*
- *What debugging attempts have I already ruled out?*
- *What are the next 3 concrete actions to take?*

ContextGhost eliminates the cognitive overhead of re-orienting yourself by transforming ephemeral Git state, notes, and error logs into persistent, structured work memory.

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
 │   Full-Text Search       │  │   e.g., qwen2.5)       │
 └──────────────────────────┘  └────────────────────────┘
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v22)
- **PostgreSQL**: v14+ running locally on port `5432`
- **Ollama**: running locally on `http://localhost:11434` with `qwen2.5:1.5b` (or preferred model)

### 2. Clone & Install
```bash
git clone https://github.com/CyborgX-hash/ContextGhost.git
cd ContextGhost
npm install
```

### 3. Environment Setup
```bash
cp .env.example .env
```
Ensure your `DATABASE_URL` in `.env` matches your local PostgreSQL credentials.

### 4. Database Setup
```bash
npm run prisma:migrate
npm run prisma:seed
```

### 5. Start Development
```bash
# Starts both frontend (5173) and backend API (5001)
npm run dev
```

---

## 🛡️ Privacy & Local-First Guarantees
- **No Remote AI Calls**: Your code, diffs, and notes never leave your machine.
- **Strict Secret Redaction**: AWS keys, GitHub tokens, passwords, and private keys are masked before context leaves the safe engine.
- **No Background Surveillance**: ContextGhost only inspects authorized workspace directories upon explicit user capture.
- **Safe Subprocess Execution**: Strict argument arrays with path boundary enforcement, zero shell string concatenation.

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
