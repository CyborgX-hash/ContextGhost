import { describe, it, expect } from 'vitest';
import path from 'path';
import { GitService } from '../src/services/gitService.js';

describe('GitService', () => {
  it('detects git repository in root workspace', async () => {
    const rootPath = path.resolve('../..');
    const isRepo = await GitService.isGitRepository(rootPath);
    expect(isRepo).toBe(true);
  });

  it('collects branch, commit, and status from git repository', async () => {
    const rootPath = path.resolve('../..');
    const context = await GitService.getGitContext(rootPath);
    expect(context.isGitRepo).toBe(true);
    expect(context.branch).toBe('main');
    expect(context.commit).toBeDefined();
    expect(Array.isArray(context.files)).toBe(true);
  });

  it('returns graceful fallback for non-git directory', async () => {
    const context = await GitService.getGitContext('/tmp');
    expect(context.isGitRepo).toBe(false);
    expect(context.branch).toBeNull();
  });
});
