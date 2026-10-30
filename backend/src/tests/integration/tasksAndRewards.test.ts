/**
 * integration/tasksAndRewards.test.ts — Comprehensive API integration tests.
 * Verifies public catalogs, question answer stripping, and authorization guards.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../app';
import * as firebase from '../../config/firebase';
import { Task } from '../../models/Task';
import { Reward } from '../../models/Reward';
import { Badge } from '../../models/Badge';
import { Lesson } from '../../models/Lesson';
import { vi } from 'vitest';

beforeAll(() => {
  vi.spyOn(firebase, 'initFirebase').mockImplementation(() => undefined);

  // Mock model queries so tests run deterministically without requiring a live MongoDB instance
  vi.spyOn(Task, 'find').mockReturnValue({
    sort: vi.fn().mockResolvedValue([
      { taskId: 'task-ac-temp', title: 'Set AC to 24°C', category: 'energy', points: 20 },
    ]),
  } as any);

  vi.spyOn(Reward, 'find').mockReturnValue({
    sort: vi.fn().mockResolvedValue([
      { rewardId: 'rew-tree-1', title: 'Plant a Mangrove', costPoints: 200 },
    ]),
  } as any);

  vi.spyOn(Badge, 'find').mockReturnValue({
    sort: vi.fn().mockResolvedValue([
      { badgeId: 'badge-first-action', title: 'First Step' },
    ]),
  } as any);

  vi.spyOn(Lesson, 'find').mockResolvedValue([
    {
      lessonId: 'lesson-vampire-power',
      title: 'Vampire Power',
      toObject: () => ({
        lessonId: 'lesson-vampire-power',
        title: 'Vampire Power',
        quiz: [
          { question: 'Q1', options: ['A', 'B'], correctAnswerIndex: 1, explanation: 'Exp' },
        ],
      }),
    },
  ] as any);

  vi.spyOn(Lesson, 'findOne').mockResolvedValue({
    lessonId: 'lesson-vampire-power',
    quiz: [
      { question: 'Q1', options: ['A', 'B'], correctAnswerIndex: 1, explanation: 'Exp' },
    ],
    toObject: () => ({
      lessonId: 'lesson-vampire-power',
      quiz: [
        { question: 'Q1', options: ['A', 'B'], correctAnswerIndex: 1, explanation: 'Exp' },
      ],
    }),
  } as any);
});

describe('Public Task Catalog (/api/v1/tasks)', () => {
  it('returns 200 and accepts category filtering query', async () => {
    const res = await request(app).get('/api/v1/tasks?category=energy');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].taskId).toBe('task-ac-temp');
  });

  it('rejects invalid category with validation error', async () => {
    const res = await request(app).get('/api/v1/tasks?category=invalid_category');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation Error');
  });
});

describe('Public Rewards Catalog (/api/v1/rewards)', () => {
  it('returns 200 and is an array', async () => {
    const res = await request(app).get('/api/v1/rewards');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].rewardId).toBe('rew-tree-1');
  });
});

describe('Public Badges Catalog (/api/v1/badges)', () => {
  it('returns 200 and is an array', async () => {
    const res = await request(app).get('/api/v1/badges');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].badgeId).toBe('badge-first-action');
  });
});

describe('Lessons Catalog & Quiz Security (/api/v1/lessons)', () => {
  it('returns 200 for lessons list and strips correctAnswerIndex from lesson quizzes', async () => {
    const res = await request(app).get('/api/v1/lessons');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    for (const lesson of res.body) {
      if (lesson.quiz) {
        for (const q of lesson.quiz) {
          expect(q).not.toHaveProperty('correctAnswerIndex');
        }
      }
    }
  });

  it('never leaks correctAnswerIndex on GET /lessons/:lessonId/quiz', async () => {
    const res = await request(app).get('/api/v1/lessons/lesson-vampire-power/quiz');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    for (const question of res.body) {
      expect(question).not.toHaveProperty('correctAnswerIndex');
      expect(question).toHaveProperty('question');
      expect(question).toHaveProperty('options');
    }
  });
});

describe('Strict Authentication & Authorization Guards', () => {
  const privateEndpoints: Array<{ method: 'get' | 'post' | 'patch' | 'delete'; path: string; body?: any }> = [
    { method: 'get', path: '/api/v1/me' },
    { method: 'patch', path: '/api/v1/me', body: { name: 'New Name' } },
    { method: 'delete', path: '/api/v1/me' },
    { method: 'get', path: '/api/v1/me/points' },
    { method: 'get', path: '/api/v1/me/points/history' },
    { method: 'get', path: '/api/v1/me/tasks' },
    { method: 'post', path: '/api/v1/tasks/task-ac-temp/complete', body: {} },
    { method: 'get', path: '/api/v1/me/badges' },
    { method: 'get', path: '/api/v1/me/vouchers' },
    { method: 'post', path: '/api/v1/rewards/rew-tree-1/redeem' },
    { method: 'post', path: '/api/v1/lessons/lesson-vampire-power/quiz/submit', body: { answers: [1, 0, 1] } },
    { method: 'get', path: '/api/v1/dashboard' },
    { method: 'get', path: '/api/v1/leaderboard' },
    { method: 'get', path: '/api/v1/me/activity' },
    { method: 'get', path: '/api/v1/me/settings' },
    { method: 'patch', path: '/api/v1/me/settings', body: { notificationEnabled: false } },
  ];

  for (const ep of privateEndpoints) {
    it(`blocks unauthenticated request to ${ep.method.toUpperCase()} ${ep.path} with 401`, async () => {
      const req = (request(app) as any)[ep.method](ep.path);
      if (ep.body) req.send(ep.body);
      const res = await req;
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Unauthorized');
    });

    it(`blocks malformed/invalid bearer token to ${ep.method.toUpperCase()} ${ep.path} with 401`, async () => {
      const req = (request(app) as any)[ep.method](ep.path).set('Authorization', 'Bearer invalid-token');
      if (ep.body) req.send(ep.body);
      const res = await req;
      expect(res.status).toBe(401);
    });
  }
});
