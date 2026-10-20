import { describe, it, expect } from 'vitest';
import { extractAndParseJSON, validateAndNormalizeOutput } from '../src/ai/outputValidator.js';
import { buildAnalysisPrompt } from '../src/ai/promptBuilder.js';

describe('AI PromptBuilder & OutputValidator', () => {
  it('builds prompt wrapping untrusted evidence in tags', () => {
    const { system, prompt } = buildAnalysisPrompt({
      workspaceName: 'TestApp',
      gitContext: { branch: 'feature/auth', changedFilesCount: 2, files: [{ path: 'auth.js', changeType: 'modified' }] },
      notes: 'Implemented login flow',
      logs: 'TypeError: undefined is not a function'
    });

    expect(system).toContain('ContextGhost');
    expect(prompt).toContain('<developer_evidence>');
    expect(prompt).toContain('feature/auth');
    expect(prompt).toContain('TypeError');
  });

  it('extracts JSON from markdown code block', () => {
    const markdown = 'Here is the analysis:\n```json\n{"sessionTitle": "Refactored Database"}\n```\nDone.';
    const parsed = extractAndParseJSON(markdown);
    expect(parsed.sessionTitle).toBe('Refactored Database');
  });

  it('normalizes valid output with full fields', () => {
    const raw = {
      sessionTitle: 'Auth API Setup',
      mainObjective: 'Set up JWT authentication',
      summary: 'Added JWT validation middleware and token generation routes.',
      accomplishments: ['Created auth route', 'Added token validator'],
      modifiedFiles: [{ path: 'src/auth.js', changeType: 'modified' }],
      unresolvedIssues: [{ title: 'Missing refresh token', category: 'unresolved_todo' }],
      nextActions: [{ title: 'Add refresh endpoint', priority: 1 }]
    };

    const normalized = validateAndNormalizeOutput(raw);
    expect(normalized.sessionTitle).toBe('Auth API Setup');
    expect(normalized.accomplishments.length).toBe(2);
    expect(normalized.modifiedFiles[0].path).toBe('src/auth.js');
    expect(normalized.unresolvedIssues[0].category).toBe('unresolved_todo');
    expect(normalized.nextActions[0].priority).toBe(1);
  });

  it('applies grounded fallback when fields are missing', () => {
    const normalized = validateAndNormalizeOutput({}, {
      gitContext: { branch: 'fix/login', changedFilesCount: 1, files: [{ path: 'login.js', changeType: 'modified' }] }
    });

    expect(normalized.sessionTitle).toContain('fix/login');
    expect(normalized.modifiedFiles.length).toBe(1);
    expect(normalized.nextActions.length).toBeGreaterThan(0);
  });
});
