import { describe, it, expect } from 'vitest';
import { redactSecrets } from '../src/utils/redactor.js';

describe('Secret Redactor', () => {
  it('redacts AWS access keys', () => {
    const input = 'export AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE';
    const output = redactSecrets(input);
    expect(output).not.toContain('AKIAIOSFODNN7EXAMPLE');
    expect(output).toContain('[REDACTED_AWS_ACCESS_KEY]');
  });

  it('redacts GitHub Personal Access Tokens', () => {
    const input = 'const token = "ghp_1234567890abcdefghijklmnopqrstuvwxyz";';
    const output = redactSecrets(input);
    expect(output).not.toContain('ghp_1234567890abcdefghijklmnopqrstuvwxyz');
    expect(output).toContain('[REDACTED_GITHUB_TOKEN]');
  });

  it('redacts database passwords in URLs', () => {
    const input = 'DATABASE_URL="postgresql://postgres:SuperSecretPassword123@localhost:5432/mydb"';
    const output = redactSecrets(input);
    expect(output).not.toContain('SuperSecretPassword123');
    expect(output).toContain('[REDACTED_PASSWORD]');
  });

  it('redacts private keys', () => {
    const input = '-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA0...\n-----END RSA PRIVATE KEY-----';
    const output = redactSecrets(input);
    expect(output).not.toContain('MIIEowIBAAKCAQEA0');
    expect(output).toContain('[REDACTED_PRIVATE_KEY]');
  });
});
