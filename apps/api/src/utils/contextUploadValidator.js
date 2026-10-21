import path from 'path';
import { redactSecrets } from './redactor.js';

const ALLOWED_EXTENSIONS = new Set(['.diff', '.patch', '.log', '.txt', '.md', '.json', '.yml', '.yaml']);
const FORBIDDEN_FILENAMES = new Set([
  '.env',
  '.env.local',
  '.env.development',
  '.env.production',
  '.env.test',
  'id_rsa',
  'id_dsa',
  'id_ecdsa',
  'id_ed25519',
  'credentials',
  'secrets.json',
  'secret.key'
]);

const MAX_FILE_BYTES = 1048576; // 1 MB

/**
 * Validate and process uploaded text-based context files
 */
export function validateAndProcessContextFiles(files) {
  if (!files) return [];
  if (!Array.isArray(files)) {
    throw new Error('contextFiles must be an array of files');
  }

  const processed = [];

  for (const file of files) {
    if (!file || typeof file !== 'object') {
      throw new Error('Invalid file item in contextFiles');
    }

    const originalName = String(file.name || file.filename || '').trim();
    if (!originalName) {
      throw new Error('Uploaded file is missing a filename');
    }

    // Check for null bytes or path traversal
    if (originalName.includes('\0') || originalName.includes('..') || originalName.includes('/') || originalName.includes('\\')) {
      throw new Error(`Unsafe filename rejected: "${originalName}"`);
    }

    const baseName = path.basename(originalName).toLowerCase();
    const ext = path.extname(baseName).toLowerCase();

    // Reject explicitly forbidden credential files
    if (FORBIDDEN_FILENAMES.has(baseName) || baseName.startsWith('.env')) {
      throw new Error(`Security violation: uploading credential/env files like "${originalName}" is strictly forbidden.`);
    }

    // Check allowed extension
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      throw new Error(
        `Unsupported file type for "${originalName}". Only text-based context files are allowed: ${Array.from(ALLOWED_EXTENSIONS).join(', ')}`
      );
    }

    const content = typeof file.content === 'string' ? file.content : '';
    const byteSize = Buffer.byteLength(content, 'utf8');

    if (byteSize > MAX_FILE_BYTES) {
      throw new Error(`File "${originalName}" exceeds the maximum allowed size of 1MB (${Math.round(byteSize / 1024)} KB)`);
    }

    // Check for binary content (null bytes or excessive control characters)
    if (content.includes('\0')) {
      throw new Error(`Binary file rejected: "${originalName}" appears to be a binary file.`);
    }

    // Redact any secrets before storing or sending to AI
    const sanitizedContent = redactSecrets(content);

    processed.push({
      name: originalName,
      extension: ext,
      sizeBytes: byteSize,
      content: sanitizedContent
    });
  }

  return processed;
}
