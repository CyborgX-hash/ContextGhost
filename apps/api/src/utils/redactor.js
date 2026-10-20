/**
 * ContextGhost Secret Redaction Utility
 * Detects and masks sensitive credentials, tokens, and keys from git diffs, notes, and logs.
 */

const REDACTION_RULES = [
  // Private Keys (RSA, EC, OpenSSH, etc.)
  {
    name: 'private_key',
    pattern: /-----BEGIN(?: [A-Z]+)? PRIVATE KEY-----[\s\S]*?-----END(?: [A-Z]+)? PRIVATE KEY-----/g,
    replacement: '[REDACTED_PRIVATE_KEY]'
  },
  // AWS Access Key ID
  {
    name: 'aws_access_key',
    pattern: /\b(AKIA|ABIA|ACCA|ASIA)[0-9A-Z]{16}\b/g,
    replacement: '[REDACTED_AWS_ACCESS_KEY]'
  },
  // GitHub Personal Access Token (classic & fine-grained)
  {
    name: 'github_token',
    pattern: /\b(ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]{82}|gho_[a-zA-Z0-9]{36})\b/g,
    replacement: '[REDACTED_GITHUB_TOKEN]'
  },
  // Generic API Keys / Secrets in key-value pairs (e.g. api_key="...", secret_token: "...")
  {
    name: 'key_value_secret',
    pattern: /(?<=(?:api[_-]?key|secret|token|password|auth|bearer)["']?\s*[:=]\s*["']?)[a-zA-Z0-9_\-.]{16,}(?=["']?)/gi,
    replacement: '[REDACTED_SECRET]'
  },
  // Bearer Tokens in headers or text
  {
    name: 'bearer_token',
    pattern: /Bearer\s+([a-zA-Z0-9_.\-~+/=]{20,})/gi,
    replacement: 'Bearer [REDACTED_BEARER_TOKEN]'
  },
  // Database connection URLs containing passwords (postgres://user:pass@host...)
  {
    name: 'db_connection_url',
    pattern: /((?:postgres|postgresql|mysql|mongodb|redis):\/\/[a-zA-Z0-9_.-]+:)[^@/\s]+(@[a-zA-Z0-9_.-]+(?::[0-9]+)?\/?[^\s]*)/gi,
    replacement: '$1[REDACTED_PASSWORD]$2'
  },
  // JSON Web Tokens (JWT)
  {
    name: 'jwt_token',
    pattern: /\beyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_\-.]{10,}\b/g,
    replacement: '[REDACTED_JWT_TOKEN]'
  }
];

/**
 * Redacts secrets from a string
 * @param {string} input - Text to sanitize
 * @returns {string} Sanitized text
 */
export function redactSecrets(input) {
  if (typeof input !== 'string' || !input) {
    return input;
  }

  let sanitized = input;
  for (const rule of REDACTION_RULES) {
    sanitized = sanitized.replace(rule.pattern, rule.replacement);
  }

  return sanitized;
}

/**
 * Deep redaction for structured objects (logs, snapshots, file contents)
 */
export function deepRedact(obj) {
  if (!obj) return obj;
  if (typeof obj === 'string') return redactSecrets(obj);
  if (Array.isArray(obj)) return obj.map(deepRedact);
  if (typeof obj === 'object') {
    const redactedObj = {};
    for (const [key, value] of Object.entries(obj)) {
      redactedObj[key] = deepRedact(value);
    }
    return redactedObj;
  }
  return obj;
}
