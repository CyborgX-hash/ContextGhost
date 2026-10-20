/**
 * ContextGhost AI Output Validator & Normalizer
 * Safely parses, validates, and normalizes AI-generated JSON analysis.
 */

export function extractAndParseJSON(rawResponse) {
  if (!rawResponse || typeof rawResponse !== 'string') {
    throw new Error('AI response is empty or not a string');
  }

  let cleaned = rawResponse.trim();

  // Strip Markdown JSON codeblocks if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  // Find first '{' and last '}'
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');

  if (start === -1 || end === -1 || start >= end) {
    throw new Error('AI response does not contain a valid JSON object');
  }

  const jsonSubstring = cleaned.substring(start, end + 1);

  try {
    return JSON.parse(jsonSubstring);
  } catch (err) {
    throw new Error(`Failed to parse AI JSON response: ${err.message}`);
  }
}

export function validateAndNormalizeOutput(rawJson, fallbackContext = {}) {
  const result = typeof rawJson === 'string' ? extractAndParseJSON(rawJson) : rawJson;

  // Title normalization
  const sessionTitle =
    (typeof result.sessionTitle === 'string' && result.sessionTitle.trim()) ||
    (fallbackContext.gitContext?.branch ? `Work on branch ${fallbackContext.gitContext.branch}` : 'Work Session Snapshot');

  // Main Objective
  const mainObjective =
    (typeof result.mainObjective === 'string' && result.mainObjective.trim()) ||
    fallbackContext.notes ||
    'Continue development on active workspace changes.';

  // Summary
  const summary =
    (typeof result.summary === 'string' && result.summary.trim()) ||
    `Captured ${fallbackContext.gitContext?.changedFilesCount || 0} modified/untracked files.`;

  // Accomplishments array
  const accomplishments = Array.isArray(result.accomplishments)
    ? result.accomplishments.filter((a) => typeof a === 'string' && a.trim())
    : [];

  // Modified Files array
  let modifiedFiles = [];
  if (Array.isArray(result.modifiedFiles)) {
    modifiedFiles = result.modifiedFiles
      .filter((f) => f && (f.path || f.filePath))
      .map((f) => ({
        path: String(f.path || f.filePath).trim(),
        changeType: String(f.changeType || 'modified').toLowerCase(),
        evidenceSummary: f.evidenceSummary || 'Identified in session changes',
        lineReferences: f.lineReferences ? String(f.lineReferences) : null
      }));
  } else if (fallbackContext.gitContext?.files) {
    modifiedFiles = fallbackContext.gitContext.files.map((f) => ({
      path: f.path,
      changeType: f.changeType,
      evidenceSummary: 'Captured from git status',
      lineReferences: null
    }));
  }

  // Unresolved Issues array
  let unresolvedIssues = [];
  if (Array.isArray(result.unresolvedIssues)) {
    unresolvedIssues = result.unresolvedIssues
      .filter((iss) => iss && iss.title)
      .map((iss) => ({
        title: String(iss.title).trim(),
        description: iss.description || iss.title,
        category: ['error', 'test_failure', 'build_failure', 'unresolved_todo'].includes(iss.category)
          ? iss.category
          : 'error',
        severity: ['critical', 'high', 'medium', 'low'].includes(iss.severity)
          ? iss.severity
          : 'medium',
        status: ['unresolved', 'attempted', 'resolved'].includes(iss.status)
          ? iss.status
          : 'unresolved',
        evidence: iss.evidence || null,
        previousAttempts: iss.previousAttempts || null
      }));
  }

  // Next Actions array (top 3 prioritized)
  let nextActions = [];
  if (Array.isArray(result.nextActions)) {
    nextActions = result.nextActions
      .filter((act) => act && act.title)
      .slice(0, 5)
      .map((act, index) => ({
        title: String(act.title).trim(),
        description: act.description || act.title,
        priority: typeof act.priority === 'number' ? act.priority : index + 1,
        status: 'pending',
        filePath: act.filePath || null,
        evidence: act.evidence || null
      }));
  }

  // If no next actions were provided, supply sensible grounded fallback
  if (nextActions.length === 0) {
    nextActions = [
      {
        title: 'Review and verify pending changes',
        description: 'Check modified files and run test suite before committing.',
        priority: 1,
        status: 'pending',
        filePath: modifiedFiles[0]?.path || null,
        evidence: 'Default next step for uncommitted workspace state.'
      }
    ];
  }

  // Confidence Notes
  const confidenceNotes =
    (typeof result.confidenceNotes === 'string' && result.confidenceNotes.trim()) ||
    'Synthesized from local workspace context.';

  return {
    sessionTitle,
    mainObjective,
    summary,
    accomplishments,
    modifiedFiles,
    unresolvedIssues,
    nextActions,
    openQuestions: Array.isArray(result.openQuestions) ? result.openQuestions : [],
    confidenceNotes
  };
}
