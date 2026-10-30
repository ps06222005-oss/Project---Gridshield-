/**
 * integration/health.test.ts — Integration test for health endpoint.
 * Requires no database connection.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../app';

// Stub Firebase init for tests (no real Firebase in tests)
import * as firebase from '../../config/firebase';
import { vi } from 'vitest';

beforeAll(() => {
  vi.spyOn(firebase, 'initFirebase').mockImplementation(() => undefined);
});

describe('GET /api/v1/health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('GRIDSHIELD AI Backend');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('returns 200 with OpenAPI specification on /api/v1/docs', async () => {
    const res = await request(app).get('/api/v1/docs');
    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe('3.0.3');
    expect(res.body.info.title).toBe('GRIDSHIELD AI Backend API');
  });

  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/v1/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Not Found');
  });
});

describe('GET /api/v1/me — auth guard', () => {
  it('returns 401 without Authorization header', async () => {
    const res = await request(app).get('/api/v1/me');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  it('returns 401 with malformed Bearer token', async () => {
    const res = await request(app)
      .get('/api/v1/me')
      .set('Authorization', 'Bearer invalid-token-here');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/v1/tasks/:taskId/complete — auth guard', () => {
  it('returns 401 without Authorization header', async () => {
    const res = await request(app)
      .post('/api/v1/tasks/task-ac-temp/complete')
      .send({});
    expect(res.status).toBe(401);
  });
});

describe('POST /api/v1/rewards/:rewardId/redeem — auth guard', () => {
  it('returns 401 without Authorization header', async () => {
    const res = await request(app)
      .post('/api/v1/rewards/rew-tree-1/redeem')
      .send({});
    expect(res.status).toBe(401);
  });
});

describe('POST /api/v1/lessons/:lessonId/quiz/submit — auth guard', () => {
  it('returns 401 without Authorization header', async () => {
    const res = await request(app)
      .post('/api/v1/lessons/lesson-vampire-power/quiz/submit')
      .send({ answers: [1, 0, 1] });
    expect(res.status).toBe(401);
  });
});
