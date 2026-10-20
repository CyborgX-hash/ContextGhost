import { ollamaProvider } from '../ai/ollamaProvider.js';
import { buildAnalysisPrompt } from '../ai/promptBuilder.js';
import { validateAndNormalizeOutput } from '../ai/outputValidator.js';

export class AIService {
  /**
   * Synthesize developer workspace session into structured memory
   */
  static async analyzeSessionContext({ workspaceName, gitContext, notes, logs, previousAttempts }) {
    // 1. Check Ollama health
    const health = await ollamaProvider.checkHealth();

    if (!health.connected) {
      return {
        success: false,
        captureStatus: 'RAW_SNAPSHOT',
        modelName: null,
        error: `Ollama is offline (${health.error || 'Connection refused'}). Raw snapshot saved.`,
        analysis: this.generateRawFallback({ workspaceName, gitContext, notes, logs, previousAttempts })
      };
    }

    if (!health.modelAvailable) {
      return {
        success: false,
        captureStatus: 'RAW_SNAPSHOT',
        modelName: health.configuredModel,
        error: `Configured model "${health.configuredModel}" not found in Ollama. Run "ollama pull ${health.configuredModel}".`,
        analysis: this.generateRawFallback({ workspaceName, gitContext, notes, logs, previousAttempts })
      };
    }

    // 2. Build structured prompt
    const { system, prompt } = buildAnalysisPrompt({
      workspaceName,
      gitContext,
      notes,
      logs,
      previousAttempts
    });

    // 3. Execute generation with bounded retry (max 2 attempts)
    let lastError = null;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const result = await ollamaProvider.generate({
          prompt,
          system,
          format: 'json',
          temperature: attempt === 1 ? 0.2 : 0.1
        });

        const normalized = validateAndNormalizeOutput(result.response, {
          workspaceName,
          gitContext,
          notes,
          logs
        });

        return {
          success: true,
          captureStatus: 'SUCCESS',
          modelName: result.model || health.configuredModel,
          analysis: normalized
        };
      } catch (err) {
        lastError = err;
        console.warn(`[AIService] Generation attempt ${attempt} failed: ${err.message}`);
      }
    }

    // If both attempts fail, return raw snapshot with error details
    return {
      success: false,
      captureStatus: 'PARTIAL',
      modelName: health.configuredModel,
      error: `Model output parsing failed: ${lastError?.message}`,
      analysis: this.generateRawFallback({ workspaceName, gitContext, notes, logs, previousAttempts })
    };
  }

  /**
   * Deterministic raw fallback when AI is unavailable or failing
   */
  static generateRawFallback({ workspaceName, gitContext, notes, logs, previousAttempts }) {
    const files = (gitContext?.files || []).map((f) => ({
      path: f.path,
      changeType: f.changeType,
      evidenceSummary: 'Captured from Git status (Raw snapshot)'
    }));

    return {
      sessionTitle: gitContext?.branch ? `Work on ${gitContext.branch}` : `Session for ${workspaceName || 'Workspace'}`,
      mainObjective: notes || 'Development work session (Raw snapshot)',
      summary: `Captured ${files.length} changed files on branch "${gitContext?.branch || 'unknown'}". AI synthesis was skipped or offline.`,
      accomplishments: [
        `Captured ${files.length} modified/untracked files`,
        gitContext?.commit ? `Latest commit: ${gitContext.commit.subject}` : 'No commit information'
      ],
      modifiedFiles: files,
      unresolvedIssues: logs
        ? [
            {
              title: 'Terminal / test error recorded in logs',
              category: 'error',
              severity: 'medium',
              status: 'unresolved',
              evidence: logs.substring(0, 300),
              previousAttempts: previousAttempts || null
            }
          ]
        : [],
      nextActions: [
        {
          title: 'Review uncommitted changes',
          description: 'Inspect modified files and continue implementation.',
          priority: 1,
          status: 'pending',
          filePath: files[0]?.path || null,
          evidence: 'Identified uncommitted workspace changes'
        }
      ],
      openQuestions: [],
      confidenceNotes: 'Raw snapshot without AI synthesis.'
    };
  }
}
