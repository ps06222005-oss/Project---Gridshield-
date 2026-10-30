/**
 * env.ts — Validate and export all environment variables at startup.
 * The process exits immediately if any required variable is missing.
 */
import { config } from 'dotenv';
import path from 'path';

// Load .env from the backend root directory
config({ path: path.resolve(__dirname, '../../.env') });

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    console.error(`[config] FATAL: Missing required environment variable: ${key}`);
    process.exit(1);
  }
  return value;
}

function optionalEnv(key: string, defaultValue: string = ''): string {
  return process.env[key] ?? defaultValue;
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
