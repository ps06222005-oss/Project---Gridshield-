/**
 * auth.ts — Express middleware that verifies Firebase ID tokens.
 *
 * Usage: apply to any route that requires an authenticated user.
 *
 *   router.get('/me', requireAuth, meController.getMe);
 *
 * On success: attaches req.user = { uid, email, name } and calls next().
 * On failure: returns 401 with a safe error message.
 */
import { Request, Response, NextFunction } from 'express';
import { verifyIdToken } from '../config/firebase';

export interface AuthUser {
  uid: string;       // Firebase UID — used as the stable identity key
  email?: string;
  name?: string;
}

// Extend Express Request to carry the authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or malformed Authorization header. Expected: Bearer <token>',
    });
    return;
  }

  const idToken = authHeader.slice(7); // strip "Bearer "

  try {
    const decoded = await verifyIdToken(idToken);
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name as string | undefined,
    };
    next();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Token verification failed';
    if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
      console.warn(`[auth] Token verification rejected: ${message}`);
    }
    // Do not expose internal Firebase error details in production
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired authentication token.',
      ...(process.env.NODE_ENV !== 'production' && { detail: message }),
    });
  }
}
