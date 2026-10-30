/**
 * unit/securityAndEnv.test.ts — Unit tests for environment variable loading,
 * URI structure inspection, and security validation without real credentials.
 */
import { describe, it, expect } from 'vitest';
import { requireEnv, optionalEnv } from '../../config/env';
import { inspectMongoUri } from '../../config/db';

describe('Security & Environment Configuration', () => {
  describe('requireEnv and optionalEnv validators', () => {
    it('returns the configured value when required variable is present', () => {
      const mockEnv = { TEST_REQUIRED_KEY: 'valid-value' };
      const val = requireEnv('TEST_REQUIRED_KEY', mockEnv);
      expect(val).toBe('valid-value');
    });

    it('throws error when a required variable is missing', () => {
      const mockEnv: Record<string, string | undefined> = {};
      expect(() => requireEnv('NON_EXISTENT_KEY', mockEnv)).toThrow(
        /Missing required environment variable: NON_EXISTENT_KEY/
      );
    });

    it('returns default value when optional variable is not set', () => {
      const mockEnv: Record<string, string | undefined> = {};
      const val = optionalEnv('OPTIONAL_KEY', 'default-val', mockEnv);
      expect(val).toBe('default-val');
    });

    it('returns configured value when optional variable is set', () => {
      const mockEnv = { OPTIONAL_KEY: 'configured-val' };
      const val = optionalEnv('OPTIONAL_KEY', 'default-val', mockEnv);
      expect(val).toBe('configured-val');
    });
  });

  describe('inspectMongoUri — Safe URI Metadata Parser', () => {
    it('safely inspects a mongodb+srv URI without exposing passwords', () => {
      const meta = inspectMongoUri(
        'mongodb+srv://sample-user:mySecretPassword123@cluster0.example.com/gridshield?retryWrites=true&w=majority'
      );

      expect(meta.isConfigured).toBe(true);
      expect(meta.isValidStructure).toBe(true);
      expect(meta.isSrv).toBe(true);
      expect(meta.protocol).toBe('mongodb+srv');
      expect(meta.hostname).toBe('cluster0.example.com');
      expect(meta.hasUsername).toBe(true);
      expect(meta.username).toBe('sample-user');
      expect(meta.hasPassword).toBe(true);
      expect(meta.database).toBe('gridshield');

      // Crucial security guarantee: inspectMongoUri must NEVER include the password field
      expect((meta as any).password).toBeUndefined();
    });

    it('safely handles standard mongodb:// URIs', () => {
      const meta = inspectMongoUri('mongodb://testuser:testpass@localhost:27017/testdb');
      expect(meta.isConfigured).toBe(true);
      expect(meta.isValidStructure).toBe(true);
      expect(meta.isSrv).toBe(false);
      expect(meta.protocol).toBe('mongodb');
      expect(meta.hostname).toBe('localhost');
      expect(meta.hasUsername).toBe(true);
      expect(meta.hasPassword).toBe(true);
      expect(meta.database).toBe('testdb');
      expect((meta as any).password).toBeUndefined();
    });

    it('flags URIs missing username and password', () => {
      const meta = inspectMongoUri('mongodb://localhost:27017/gridshield');
      expect(meta.isConfigured).toBe(true);
      expect(meta.isValidStructure).toBe(true);
      expect(meta.hasUsername).toBe(false);
      expect(meta.hasPassword).toBe(false);
      expect(meta.hostname).toBe('localhost');
    });

    it('correctly handles empty or missing URIs', () => {
      const meta = inspectMongoUri('');
      expect(meta.isConfigured).toBe(false);
      expect(meta.isValidStructure).toBe(false);
      expect(meta.hostname).toBeNull();
      expect(meta.error).toBeDefined();
    });

    it('detects URL-encoded special characters without double-encoding', () => {
      const meta = inspectMongoUri(
        'mongodb+srv://sample-user:p%40ssword%21@cluster0.example.org/gridshield'
      );
      expect(meta.hasUrlEncodedSpecialChars).toBe(true);
      expect(meta.hasPassword).toBe(true);
      expect(meta.hostname).toBe('cluster0.example.org');
      expect((meta as any).password).toBeUndefined();
    });

    it('rejects invalid non-mongodb protocols', () => {
      const meta = inspectMongoUri('http://user:pass@evil-server.example.com/db');
      expect(meta.isValidStructure).toBe(false);
      expect(meta.protocol).toBe('unknown');
    });
  });
});
