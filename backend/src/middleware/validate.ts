/**
 * validate.ts — Zod-based request validation middleware factory.
 *
 * Usage:
 *   router.patch('/me', requireAuth, validate(UpdateProfileSchema), controller);
 */
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

type RequestPart = 'body' | 'query' | 'params';

export function validate(schema: ZodSchema, part: RequestPart = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[part]);
    if (!result.success) {
      next(result.error);
      return;
    }
    // Replace with parsed (coerced + stripped) data
    (req as unknown as Record<string, unknown>)[part] = result.data;
    next();
  };
}
