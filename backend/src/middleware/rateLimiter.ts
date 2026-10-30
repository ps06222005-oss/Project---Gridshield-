/**
 * rateLimiter.ts — Express rate limiting middleware.
 *
 * Two tiers:
 *  - `generalLimiter`  : applied globally to all /api/v1 routes
 *  - `authLimiter`     : tighter limit on auth-sensitive endpoints
 */
import rateLimit from 'express-rate-limit';
import { ENV } from '../config/env';

/** General limiter: 100 requests / 15 min per IP */
export const generalLimiter = rateLimit({
  windowMs: ENV.RATE_LIMIT_WINDOW_MS,
  max: ENV.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too Many Requests',
    message: 'You have exceeded the request limit. Please try again later.',
  },
  skip: () => ENV.IS_TEST, // Disable in test environment
});

/** Auth limiter: 20 requests / 15 min per IP — applied to POST /complete, /redeem, /submit */
export const authLimiter = rateLimit({
  windowMs: ENV.RATE_LIMIT_WINDOW_MS,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too Many Requests',
    message: 'Too many write requests. Please slow down.',
  },
  skip: () => ENV.IS_TEST,
});
