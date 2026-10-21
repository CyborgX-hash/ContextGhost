import { describe, it, expect } from 'vitest';
import { validateAndProcessContextFiles } from '../src/utils/contextUploadValidator.js';
import { GitService } from '../src/services/gitService.js';
import { WorkspaceService } from '../src/services/workspaceService.js';

describe('Context Upload & Cloud Workspace Ingestion', () => {
  it('accepts and sanitizes valid text context files', () => {
    const rawFiles = [
      {
        name: 'test_output.log',
        content: 'FAIL tests/login.test.js: API_KEY="sk_live_12345abcdef"'
      },
      {
        name: 'architecture_notes.md',
        content: '# Architecture\nUsing hosted open-weight models.'
      }
    ];

    const result = validateAndProcessContextFiles(rawFiles);
    expect(result.length).toBe(2);
    expect(result[0].name).toBe('test_output.log');
    expect(result[0].content).not.toContain('sk_live_12345abcdef');
    expect(result[0].content).toContain('[REDACTED_SECRET]');
  });

  it('rejects files exceeding 1MB limit', () => {
    const hugeContent = 'a'.repeat(1048576 + 10);
    const oversized = [{ name: 'huge.log', content: hugeContent }];

    expect(() => validateAndProcessContextFiles(oversized)).toThrow(/exceeds the maximum allowed size/i);
  });

  it('strictly rejects .env and credential files', () => {
    const envFiles = [
      { name: '.env', content: 'SECRET=123' },
      { name: '.env.production', content: 'KEY=456' },
      { name: 'id_rsa', content: 'PRIVATE KEY' }
    ];

    for (const file of envFiles) {
      expect(() => validateAndProcessContextFiles([file])).toThrow(/Security violation|forbidden/i);
    }
  });

  it('rejects unsupported binary or executable file extensions', () => {
    const badFiles = [
      { name: 'malware.exe', content: 'echo bad' },
      { name: 'archive.zip', content: 'PK' }
    ];

    for (const file of badFiles) {
      expect(() => validateAndProcessContextFiles([file])).toThrow(/Unsupported file type/i);
    }
  });

  it('rejects path traversal and unsafe filenames', () => {
    const unsafe = [{ name: '../../etc/passwd', content: 'root' }];
    expect(() => validateAndProcessContextFiles(unsafe)).toThrow(/Unsafe filename rejected/i);
  });

  it('correctly parses pasted unified git diff in GitService', () => {
    const diff = `diff --git a/src/auth.js b/src/auth.js
index abc..def 100644
--- a/src/auth.js
+++ b/src/auth.js
@@ -10,3 +10,4 @@
+const jwt = require('jsonwebtoken');
-const oldAuth = true;
diff --git a/src/db.js b/src/db.js
--- a/src/db.js
+++ b/src/db.js
@@ -1,2 +1,3 @@
+const pool = new Pool();`;

    const parsed = GitService.parsePastedDiff(diff, 'feature/jwt-auth', 'Implement JWT verification');
    expect(parsed.isGitRepo).toBe(true);
    expect(parsed.branch).toBe('feature/jwt-auth');
    expect(parsed.commit?.subject).toBe('Implement JWT verification');
    expect(parsed.changedFilesCount).toBe(2);
    expect(parsed.files.map((f) => f.path)).toContain('src/auth.js');
    expect(parsed.files.map((f) => f.path)).toContain('src/db.js');
    expect(parsed.diffSummary).toContain('2 file(s) identified');
  });

  it('validates repository URLs and virtual paths in WorkspaceService', () => {
    const repoUrl = 'https://github.com/CyborgX-hash/ContextGhost.git';
    const validatedUrl = WorkspaceService.validatePath(repoUrl);
    expect(validatedUrl).toBe(repoUrl);

    const slug = 'CyborgX-hash/ContextGhost';
    const validatedSlug = WorkspaceService.validatePath(slug);
    expect(validatedSlug).toBe(slug);

    expect(() => WorkspaceService.validatePath('/')).toThrow(/Direct system root path is not permitted/i);
    expect(() => WorkspaceService.validatePath('path\0withnull')).toThrow(/contains null bytes/i);
  });
});
