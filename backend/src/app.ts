/**
 * app.ts — Express application factory.
 * Registers middleware, routes, and error handling.
 * Kept separate from server.ts so tests can import the app without starting a real server.
 */
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import { ENV } from './config/env';
import { generalLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';

import healthRouter from './routes/health';
import meRouter from './routes/me';
import tasksRouter from './routes/tasks';
import rewardsRouter from './routes/rewards';
import badgesRouter from './routes/badges';
import lessonsRouter from './routes/lessons';
import dashboardRouter from './routes/dashboard';
import leaderboardRouter from './routes/leaderboard';

const app = express();

// ── Security headers ─────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS — explicit allowlist from env ───────────────────────────────────────
const allowedOrigins = ENV.FRONTEND_ORIGIN.split(',').map((o) => o.trim().replace(/\/+$/, ''));
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: Origin not allowed: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ── Body parsing + request size limit ───────────────────────────────────────
app.use(express.json({ limit: '64kb' }));
app.use(express.urlencoded({ extended: true, limit: '64kb' }));

// ── General rate limiter ─────────────────────────────────────────────────────
app.use('/api/v1', generalLimiter);

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/v1/health', healthRouter);
app.get('/api/v1/docs', (_req, res) => {
  res.sendFile(path.resolve(__dirname, '../openapi.json'));
});
app.use('/api/v1/me', meRouter);
app.use('/api/v1/tasks', tasksRouter);
app.use('/api/v1/rewards', rewardsRouter);
app.use('/api/v1/badges', badgesRouter);
app.use('/api/v1/lessons', lessonsRouter);
app.use('/api/v1/dashboard', dashboardRouter);
app.use('/api/v1/leaderboard', leaderboardRouter);

// ── 404 handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found', message: 'The requested endpoint does not exist.' });
});

// ── Centralized error handler (must be last) ─────────────────────────────────
app.use(errorHandler);

export default app;
