/**
 * env.ts — Validate and export all environment variables at startup.
 * The process exits immediately if any required variable is missing.
 */
import { config } from 'dotenv';
import path from 'path';
import fs from 'fs';

// Deterministic backend-relative path: C:\Hackathon\backend\.env
const backendDir = path.resolve(__dirname, '../..');
const envPath = path.resolve(backendDir, '.env');

// When running under Vitest, preserve test mode so rate limiters and test configs are honored
const isTestRunner = process.env.NODE_ENV === 'test' || Boolean(process.env.VITEST);

if (fs.existsSync(envPath)) {
  config({ path: envPath, override: !isTestRunner });
} else {
  // Fallback to default dotenv resolution
  config({ override: !isTestRunner });
}

if (isTestRunner) {
  process.env.NODE_ENV = 'test';
}

export function requireEnv(key: string, customEnv: Record<string, string | undefined> = process.env): string {
  const value = customEnv[key];
  if (!value || value.trim().length === 0) {
    if (process.env.NODE_ENV === 'test' || process.env.VITEST || customEnv !== process.env) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    console.error(`[config] FATAL: Missing required environment variable: ${key}`);
    process.exit(1);
  }
  return value;
}

export function optionalEnv(key: string, defaultValue: string = '', customEnv: Record<string, string | undefined> = process.env): string {
  const value = customEnv[key];
  return value !== undefined && value.trim().length > 0 ? value : defaultValue;
}

export const ENV = {
  PORT: parseInt(optionalEnv('PORT', '4000'), 10),
  NODE_ENV: optionalEnv('NODE_ENV', 'development') as 'development' | 'production' | 'test',
  MONGODB_URI: requireEnv('MONGODB_URI'),
  FRONTEND_ORIGIN: optionalEnv('FRONTEND_ORIGIN', 'http://localhost:3000'),
  FIREBASE_PROJECT_ID: requireEnv('FIREBASE_PROJECT_ID'),
  FIREBASE_SERVICE_ACCOUNT_JSON: optionalEnv('FIREBASE_SERVICE_ACCOUNT_JSON', ''),
  DNS_SERVERS: optionalEnv('DNS_SERVERS', ''),
  RATE_LIMIT_WINDOW_MS: parseInt(optionalEnv('RATE_LIMIT_WINDOW_MS', '900000'), 10),
  RATE_LIMIT_MAX: parseInt(optionalEnv('RATE_LIMIT_MAX', '100'), 10),
  IS_PRODUCTION: optionalEnv('NODE_ENV', 'development') === 'production',
  IS_TEST: optionalEnv('NODE_ENV', 'development') === 'test',
} as const;
