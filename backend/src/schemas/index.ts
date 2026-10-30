/**
 * schemas/index.ts — Zod validation schemas for all API request bodies.
 * Each schema matches the corresponding frontend type exactly.
 */
import { z } from 'zod';

// ── Profile ────────────────────────────────────────────────────────────────
export const UpdateProfileSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or fewer')
    .trim()
    .optional(),
  location: z
    .string()
    .max(100, 'Location must be 100 characters or fewer')
    .trim()
    .optional(),
  timezone: z
    .string()
    .max(50, 'Timezone must be 50 characters or fewer')
    .trim()
    .optional(),
  hasOnboarded: z.boolean().optional(),
});

// ── Task completion ────────────────────────────────────────────────────────
export const CompleteTaskSchema = z.object({
  verificationNote: z
    .string()
    .max(500, 'Verification note must be 500 characters or fewer')
    .optional()
    .default(''),
});

// ── Quiz submission ────────────────────────────────────────────────────────
export const QuizSubmitSchema = z.object({
  answers: z
    .array(z.number().int().min(0))
    .min(1, 'At least one answer is required')
    .max(20, 'Too many answers'),
});

// ── Settings ───────────────────────────────────────────────────────────────
export const UpdateSettingsSchema = z.object({
  notificationEnabled: z.boolean().optional(),
  timezone: z
    .string()
    .max(50, 'Timezone must be 50 characters or fewer')
    .trim()
    .optional(),
  dailyGoalPoints: z.union([
    z.literal(25),
    z.literal(50),
    z.literal(75),
    z.literal(100),
  ]).optional(),
});

// ── Leaderboard query ──────────────────────────────────────────────────────
export const LeaderboardQuerySchema = z.object({
  period: z.enum(['weekly', 'all-time']).default('all-time'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

// ── Pagination query ───────────────────────────────────────────────────────
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ── Task filter query ──────────────────────────────────────────────────────
export const TaskFilterQuerySchema = z.object({
  category: z
    .enum(['energy', 'water', 'waste', 'food', 'commute', 'habits'])
    .optional(),
  difficulty: z.enum(['Easy', 'Medium', 'Challenging']).optional(),
});
