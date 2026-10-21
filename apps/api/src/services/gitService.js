import { execFile } from 'child_process';
import util from 'util';
import path from 'path';
import { redactSecrets } from '../utils/redactor.js';
import { env } from '../config/env.js';

const execFileAsync = util.promisify(execFile);

// Files and directories to strictly exclude from diff analysis
const EXCLUDED_PATTERNS = [
  /node_modules/i,
  /\.env(\..+)?$/i,
  /\.git/i,
  /package-lock\.json$/i,
  /yarn\.lock$/i,
  /pnpm-lock\.yaml$/i,
  /\.png$/i,
  /\.jpg$/i,
  /\.jpeg$/i,
  /\.gif$/i,
  /\.ico$/i,
  /\.pdf$/i,
  /\.zip$/i,
  /\.tar/i,
  /\.dylib$/i,
  /\.so$/i,
  /\.dll$/i,
  /\.exe$/i,
  /dist\//i,
  /build\//i,
  /coverage\//i
];

export class GitService {
  /**
   * Safe execution wrapper for git CLI using execFile with argument array
   */
  static async executeGit(args, cwd, timeout = 5000) {
    try {
      const { stdout, stderr } = await execFileAsync('git', args, {
        cwd,
        timeout,
        maxBuffer: 2 * 1024 * 1024,
        env: { ...process.env, PAGER: 'cat' }
      });
      return { stdout: stdout.trim(), stderr: stderr.trim(), success: true };
    } catch (err) {
      return {
        stdout: err.stdout?.trim() || '',
        stderr: err.stderr?.trim() || err.message,
        success: false,
        code: err.code
      };
    }
  }

  /**
   * Check if directory is inside a git repository
   */
  static async isGitRepository(workspacePath) {
    const res = await this.executeGit(['rev-parse', '--is-inside-work-tree'], workspacePath);
    return res.success && res.stdout === 'true';
  }

  /**
   * Collect git context from workspace safely
   */
  static async getGitContext(workspacePath) {
    const isRepo = await this.isGitRepository(workspacePath);
    if (!isRepo) {
      return {
        isGitRepo: false,
        branch: null,
        status: 'not_a_git_repo',
        files: [],
        commit: null,
        diffSummary: null,
        diffSnippet: ''
      };
    }

    // 1. Current Branch
    const branchRes = await this.executeGit(['branch', '--show-current'], workspacePath);
    const branch = branchRes.stdout || 'HEAD (detached)';

    // 2. Latest Commit Metadata
    let commit = null;
    const logRes = await this.executeGit(
      ['log', '-1', '--pretty=format:%H|%an|%ad|%s', '--date=iso'],
      workspacePath
    );
    if (logRes.success && logRes.stdout) {
      const [hash, author, date, subject] = logRes.stdout.split('|');
      commit = { hash: hash?.substring(0, 8), fullHash: hash, author, date, subject };
    }

    // 3. Porcelain status
    const statusRes = await this.executeGit(['status', '--porcelain=v1', '-uall'], workspacePath);
    const files = [];

    if (statusRes.success && statusRes.stdout) {
      const lines = statusRes.stdout.split('\n');
      for (const line of lines) {
        if (!line.trim()) continue;
        const statusCode = line.substring(0, 2);
        const filePath = line.substring(3).trim();

        // Check if file should be excluded
        const isExcluded = EXCLUDED_PATTERNS.some((p) => p.test(filePath));
        if (isExcluded) continue;

        let changeType = 'modified';
        if (statusCode.includes('?')) changeType = 'untracked';
        else if (statusCode.includes('A')) changeType = 'added';
        else if (statusCode.includes('D')) changeType = 'deleted';
        else if (statusCode.includes('R')) changeType = 'renamed';

        files.push({
          path: filePath,
          changeType,
          statusCode: statusCode.trim()
        });
      }
    }

    // 4. Safe Diff Summary (--stat)
    const statRes = await this.executeGit(['diff', '--stat'], workspacePath);
    const stagedStatRes = await this.executeGit(['diff', '--cached', '--stat'], workspacePath);
    const diffSummary = [statRes.stdout, stagedStatRes.stdout].filter(Boolean).join('\n') || 'No uncommitted changes';

    // 5. Limited excerpt of unstaged + staged diff
    let diffSnippet = '';
    const diffRes = await this.executeGit(['diff', '-U2'], workspacePath);
    const stagedDiffRes = await this.executeGit(['diff', '--cached', '-U2'], workspacePath);

    let rawDiff = [diffRes.stdout, stagedDiffRes.stdout].filter(Boolean).join('\n');

    // Filter out excluded file chunks from diff if any
    rawDiff = rawDiff
      .split('\n')
      .filter((line) => !EXCLUDED_PATTERNS.some((p) => p.test(line)))
      .join('\n');

    // Redact secrets if enabled
    if (env.secretRedaction) {
      rawDiff = redactSecrets(rawDiff);
    }

    // Enforce max context character limit
    const maxChars = env.maxContextChars || 30000;
    if (rawDiff.length > maxChars) {
      diffSnippet = rawDiff.substring(0, maxChars) + '\n\n[...Diff truncated for size limit...]';
    } else {
      diffSnippet = rawDiff;
    }

    return {
      isGitRepo: true,
      branch,
      commit,
      files,
      changedFilesCount: files.length,
      diffSummary: env.secretRedaction ? redactSecrets(diffSummary) : diffSummary,
      diffSnippet
    };
  }

  /**
   * Parse user-provided git diff or patch text (e.g. pasted into web UI or uploaded as a diff file)
   */
  static parsePastedDiff(diffText, branch = 'main', commitMessage = null) {
    if (!diffText || typeof diffText !== 'string' || !diffText.trim()) {
      return null;
    }

    const maxChars = env.maxContextChars || 30000;
    let sanitizedDiff = env.secretRedaction ? redactSecrets(diffText) : diffText;
    if (sanitizedDiff.length > maxChars) {
      sanitizedDiff = sanitizedDiff.substring(0, maxChars) + '\n\n[...Diff truncated for size limit...]';
    }

    const lines = sanitizedDiff.split('\n');
    const filesMap = new Map();
    let insertions = 0;
    let deletions = 0;

    for (const line of lines) {
      if (line.startsWith('diff --git a/') || line.startsWith('diff --git ')) {
        const parts = line.split(' ');
        const pathB = parts[parts.length - 1]?.replace(/^b\//, '').trim();
        if (pathB && !filesMap.has(pathB)) {
          filesMap.set(pathB, { path: pathB, changeType: 'modified' });
        }
      } else if (line.startsWith('+++ b/')) {
        const filePath = line.substring(6).trim();
        if (filePath && !filesMap.has(filePath)) {
          filesMap.set(filePath, { path: filePath, changeType: 'modified' });
        }
      } else if (line.startsWith('+') && !line.startsWith('+++')) {
        insertions++;
      } else if (line.startsWith('-') && !line.startsWith('---')) {
        deletions++;
      }
    }

    const files = Array.from(filesMap.values());
    const fileCount = files.length > 0 ? files.length : 1;

    return {
      isGitRepo: true,
      branch: branch || 'main',
      status: 'pasted_context',
      files: files.length > 0 ? files : [{ path: 'pasted_changes.diff', changeType: 'modified' }],
      changedFilesCount: fileCount,
      commit: commitMessage ? { subject: commitMessage } : null,
      diffSummary: `${fileCount} file(s) identified (+${insertions} / -${deletions})`,
      diffSnippet: sanitizedDiff
    };
  }
}

