import { redactSecrets } from '../utils/redactor.js';
import { env } from '../config/env.js';

export class LogService {
  /**
   * Validate and sanitize imported terminal or test logs
   */
  static processLog(rawLog) {
    if (!rawLog || typeof rawLog !== 'string') {
      return { raw: '', sanitized: '', extractedErrors: [] };
    }

    const byteLength = Buffer.byteLength(rawLog, 'utf8');
    if (byteLength > env.maxLogBytes) {
      throw new Error(
        `Imported log exceeds size limit of ${Math.round(env.maxLogBytes / 1024)}KB (received ${Math.round(byteLength / 1024)}KB)`
      );
    }

    // Redact secrets
    const sanitized = env.secretRedaction ? redactSecrets(rawLog) : rawLog;

    // Extract notable errors and failing test patterns
    const extractedErrors = this.extractErrors(sanitized);

    return {
      rawLength: rawLog.length,
      sanitized,
      extractedErrors
    };
  }

  /**
   * Extract error lines or failed test indicators
   */
  static extractErrors(logText) {
    const lines = logText.split('\n');
    const errors = [];

    const errorRegex = /\b(error|fail|failed|failure|fatal|exception|uncaught|syntaxerror|typeerror|referenceerror)\b/i;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (errorRegex.test(line) && line.length > 5 && line.length < 300) {
        // Collect snippet around the error
        const contextLines = lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 3)).join('\n');
        errors.push({
          lineContent: line,
          lineNumber: i + 1,
          context: contextLines
        });

        if (errors.length >= 8) break; // keep most relevant top 8 error occurrences
      }
    }

    return errors;
  }
}
