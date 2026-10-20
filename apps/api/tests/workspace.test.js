import { describe, it, expect } from 'vitest';
import path from 'path';
import { WorkspaceService } from '../src/services/workspaceService.js';

describe('WorkspaceService Path Validation', () => {
  it('validates existing absolute directory path', () => {
    const currentDir = path.resolve('.');
    const validated = WorkspaceService.validatePath(currentDir);
    expect(validated).toBe(currentDir);
  });

  it('rejects non-existent directory path', () => {
    expect(() => {
      WorkspaceService.validatePath('/path/to/some/random/nonexistent/directory/xyz999');
    }).toThrow('does not exist');
  });

  it('rejects dangerous system root paths', () => {
    expect(() => {
      WorkspaceService.validatePath('/');
    }).toThrow('Direct system root path is not permitted');
  });

  it('rejects paths with null bytes', () => {
    expect(() => {
      WorkspaceService.validatePath('/tmp/evil\0path');
    }).toThrow('contains null bytes');
  });
});
