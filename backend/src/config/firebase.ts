/**
 * firebase.ts — Firebase Admin SDK initialization.
 *
 * Priority order for credentials:
 *  1. FIREBASE_SERVICE_ACCOUNT_JSON env var (full JSON string — production)
 *  2. Application Default Credentials (Cloud Run, CI, gcloud auth)
 *  3. Project ID mode (public key cryptographic verification of Google ID tokens)
 *
 * Never import this from frontend code. This file is backend-only.
 */
import admin from 'firebase-admin';
import { ENV } from './env';

let initialized = false;

export function initFirebase(): void {
  if (initialized || admin.apps.length > 0) {
    initialized = true;
    return;
  }

  try {
    if (ENV.FIREBASE_SERVICE_ACCOUNT_JSON) {
      // Option A: Service account JSON provided as env var string
      const serviceAccount = JSON.parse(ENV.FIREBASE_SERVICE_ACCOUNT_JSON) as admin.ServiceAccount;
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: ENV.FIREBASE_PROJECT_ID,
      });
      console.log(`[firebase] Initialized with Service Account credentials for project "${ENV.FIREBASE_PROJECT_ID}"`);
    } else {
      // Option B: Try Application Default Credentials (ADC) if available (e.g. Cloud Run)
      // Otherwise initialize with projectId for public certificate verification mode
      try {
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
          projectId: ENV.FIREBASE_PROJECT_ID,
        });
        console.log(`[firebase] Initialized with Application Default Credentials for project "${ENV.FIREBASE_PROJECT_ID}"`);
      } catch {
        admin.initializeApp({
          projectId: ENV.FIREBASE_PROJECT_ID,
        });
        console.log(`[firebase] Initialized for project "${ENV.FIREBASE_PROJECT_ID}" (public key verification mode)`);
      }
    }
    initialized = true;
  } catch (err) {
    console.error('[firebase] Failed to initialize Firebase Admin SDK:', err);
    process.exit(1);
  }
}

/**
 * Verify a Firebase ID token and return the decoded payload.
 * When running with a service account, checks revocation.
 * When running in public key mode, cryptographically verifies the token signature,
 * audience, issuer, and expiration against Google's public x509 certificates.
 */
export async function verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
  const hasServiceAccount = Boolean(ENV.FIREBASE_SERVICE_ACCOUNT_JSON);

  if (hasServiceAccount) {
    try {
      return await admin.auth().verifyIdToken(idToken, true /* checkRevoked */);
    } catch (err: any) {
      if (err.code === 'auth/id-token-revoked') {
        throw err;
      }
      // If revocation check could not be performed, verify token signature
      return admin.auth().verifyIdToken(idToken, false);
    }
  }

  // Cryptographic signature and audience verification against Google's public certificates
  return admin.auth().verifyIdToken(idToken, false);
}
