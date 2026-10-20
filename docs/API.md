# ContextGhost — REST API Reference (`/api/v1`)

All endpoints return a standardized JSON structure:

```json
{
  "success": true,
  "message": "Success description",
  "data": {},
  "timestamp": "2026-10-20T10:00:00.000Z"
}
```

---

## 1. System & Health

### `GET /api/v1/health`
Basic liveness check.
- **Response**: `200 OK`
  ```json
  { "status": "ok", "uptime": 124.5 }
  ```

### `GET /api/v1/system/status`
Readiness check reporting database connection and Ollama AI engine readiness.
- **Response**: `200 OK`
  ```json
  {
    "version": "0.1.0",
    "status": "ready",
    "database": { "connected": true },
    "aiEngine": {
      "connected": true,
      "baseUrl": "http://localhost:11434",
      "configuredModel": "qwen2.5:1.5b",
      "modelAvailable": true,
      "availableModels": ["qwen2.5:1.5b"]
    }
  }
  ```

---

## 2. Workspaces

### `GET /api/v1/workspaces`
List all registered workspaces with recent session counts.

### `POST /api/v1/workspaces`
Register a new local workspace directory.
- **Body**:
  ```json
  {
    "name": "My Project",
    "rootPath": "/Users/sakshamsontakke/Desktop/Context-Ghost",
    "description": "Optional workspace notes"
  }
  ```

### `GET /api/v1/workspaces/:id`
Get single workspace details with recent sessions.

### `PUT /api/v1/workspaces/:id`
Update workspace display name or description.

### `DELETE /api/v1/workspaces/:id`
Delete a workspace and cascade-delete its sessions.

### `GET /api/v1/workspaces/:id/inspect`
Inspect live Git status for the workspace (branch, uncommitted changes, latest commit).

### `GET /api/v1/workspaces/:id/resume`
Generate an actionable "Resume My Work" briefing based on the latest saved session, unresolved errors, and staleness notice.

---

## 3. Sessions

### `GET /api/v1/sessions`
List saved sessions with pagination and filtering.
- **Query Parameters**:
  - `workspaceId`: filter by workspace ID
  - `status`: filter by status (`SUCCESS`, `RAW_SNAPSHOT`, `PARTIAL`)
  - `search`: search query
  - `limit`: number of records (default: 20)
  - `offset`: page offset (default: 0)

### `POST /api/v1/sessions/preview`
Preview the sanitized context before saving or passing to Ollama.
- **Body**:
  ```json
  {
    "workspaceId": "uuid-here",
    "notes": "Developer notes with token ghp_xxx",
    "logs": "Terminal error log"
  }
  ```

### `POST /api/v1/sessions/capture`
Capture a complete work session. Collects Git status, redacts secrets, invokes Ollama AI synthesis, and saves transactional records.
- **Body**:
  ```json
  {
    "workspaceId": "uuid-here",
    "notes": "Optional notes",
    "logs": "Optional terminal logs",
    "previousAttempts": "Optional tried steps",
    "forceRawSnapshot": false
  }
  ```

### `GET /api/v1/sessions/:id`
Retrieve full session details with modified files, unresolved issues, next actions, notes, and raw snapshot.

### `POST /api/v1/sessions/:id/notes`
Add a note or update to an existing session record.
- **Body**:
  ```json
  {
    "content": "Fixed unit test by updating config mock."
  }
  ```

### `DELETE /api/v1/sessions/:id`
Delete a session record.

---

## 4. Search Memory

### `GET /api/v1/search?q={query}&workspaceId={id}`
Query across previous session titles, summaries, modified filenames, and unresolved errors.
- **Response**: List of matching sessions with annotated `matchReasons`.
