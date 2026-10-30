/**
 * errorHandler.ts — Centralized Express error handler.
 * Must be registered LAST: app.use(errorHandler)
 *
 * - Never leaks stack traces to the client in production.
 * - Handles Zod validation errors, Mongoose errors, and generic errors.
 */
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Error as MongooseError } from 'mongoose';

const IS_PROD = process.env.NODE_ENV === 'production';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // ── Zod validation errors ──────────────────────────────────────────────────
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation Error',
      issues: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  // ── Mongoose validation errors ─────────────────────────────────────────────
  if (err instanceof MongooseError.ValidationError) {
    res.status(400).json({
      error: 'Validation Error',
      issues: Object.values(err.errors).map((e) => ({
        field: e.path,
        message: e.message,
      })),
    });
    return;
  }

  // ── Mongoose duplicate key errors ──────────────────────────────────────────
  if (
    typeof err === 'object' &&
    err !== null &&
    (err as { code?: number }).code === 11000
  ) {
    res.status(409).json({
      error: 'Conflict',
      message: 'A record with this identifier already exists.',
    });
    return;
  }

  // ── Generic / unexpected errors ────────────────────────────────────────────
  const statusCode =
    typeof err === 'object' && err !== null && 'statusCode' in err
      ? (err as { statusCode: number }).statusCode
      : 500;

  const message =
    err instanceof Error ? err.message : 'An unexpected error occurred.';

  console.error('[error]', err);

  res.status(statusCode).json({
    error: statusCode === 500 ? 'Internal Server Error' : 'Error',
    message: IS_PROD && statusCode === 500 ? 'An unexpected error occurred.' : message,
    ...(!IS_PROD && err instanceof Error && { stack: err.stack }),
  });
}

/** Helper: create a typed HTTP error with a statusCode */
export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'HttpError';
  }
}
