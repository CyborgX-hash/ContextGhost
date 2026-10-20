# ContextGhost — Architecture & Security Specification

## 1. System Overview

ContextGhost is designed around a **local-first, privacy-preserving paradigm**. It bridges local Git developer context and open-weight language models running via Ollama without leaking sensitive code, API keys, or tokens to third-party cloud APIs.

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

## 2. Security Boundaries & Protections

### A. Subprocess Execution Safety
- Subprocesses are spawned using `child_process.execFile` with explicit argument arrays (e.g. `['status', '--porcelain=v1']`).
- **Zero shell interpolation**: No user-supplied strings are concatenated into shell command lines, eliminating shell injection vulnerabilities.
- Subprocess execution enforces explicit working directory boundaries and 5-second timeouts.

### B. Path Traversal Defense
- All workspace registration requests pass through `WorkspaceService.validatePath()`.
- Paths with null bytes (`\0`) or relative path traversal sequences (`../`) are resolved and rejected.
- Direct operating system root paths (`/`, `/etc`, `/bin`, `C:\`, etc.) are explicitly blocked.
- Read permissions and directory status are verified before registration.

### C. Multi-Layer Secret Redaction
Before any diff or log content is passed to the AI prompt or stored in database snapshots, it passes through `redactSecrets()`:
- **Private Keys**: `-----BEGIN [A-Z]+ PRIVATE KEY-----`
- **AWS Keys**: `AKIA...`, `ABIA...`, `ACCA...`, `ASIA...`
- **GitHub Tokens**: `ghp_...`, `github_pat_...`, `gho_...`
- **Database Connection URIs**: `postgresql://user:password@host` -> passwords replaced with `[REDACTED_PASSWORD]`
- **JWTs**: `eyJ...`
- **Generic API Keys & Bearer Tokens**: key-value patterns and auth headers.

### D. Untrusted Evidence Isolation (Prompt Injection Defense)
Imported terminal logs, test output, and developer notes are treated as **untrusted data**.
- The prompt builder wraps all developer-supplied artifacts inside delimited `<developer_evidence>` blocks.
- The system instructions instruct the AI model to treat everything inside this block as evidence to summarize, never instructions to execute.

---

## 3. Data Model

The PostgreSQL schema is fully normalized:

```mermaid
erDiagram
    Workspace ||--o{ Session : "has many"
    Session ||--o{ SessionFile : "tracks"
    Session ||--o{ Issue : "records"
    Session ||--o{ NextAction : "suggests"
    Session ||--o{ SessionNote : "annotates"

    Workspace {
        string id PK
        string name
        string rootPath UK
        string description
        datetime createdAt
        datetime updatedAt
    }

    Session {
        string id PK
        string workspaceId FK
        string title
        string mainObjective
        string summary
        string captureStatus
        string modelName
        json rawSnapshot
        json analysis
        string confidenceNotes
        datetime capturedAt
    }

    SessionFile {
        string id PK
        string sessionId FK
        string path
        string changeType
        string evidenceSummary
        string lineReferences
    }

    Issue {
        string id PK
        string sessionId FK
        string title
        string description
        string category
        string severity
        string status
        string evidence
        string previousAttempts
    }

    NextAction {
        string id PK
        string sessionId FK
        string title
        string description
        int priority
        string status
        string evidence
        string filePath
    }

    SessionNote {
        string id PK
        string sessionId FK
        string content
        datetime createdAt
    }
```

---

## 4. Local AI Synthesis Workflow

1. **Inspection**: Express backend queries local Git repository using `GitService`.
2. **Sanitization**: Secret Redactor masks sensitive credentials.
3. **Health Validation**: Ollama provider tests `/api/tags` to ensure local inference service is responsive.
4. **Prompt Construction**: Grounded prompt specifying JSON schema is generated.
5. **Bounded Retry**: If generation produces slightly malformed JSON, a recovery parser normalizes missing attributes.
6. **Graceful Fallback**: If Ollama is offline, a structured `RAW_SNAPSHOT` is saved so the developer never loses work.
