/**
 * integration/liveHttpServer.test.ts — Live HTTP network listener verification.
 * Starts a real Node.js HTTP server on an ephemeral port and tests real network requests,
 * CORS policy headers, and response formats using native fetch.
 */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import http from 'http';
import app from '../../app';
import * as firebase from '../../config/firebase';

describe('Live HTTP Server & CORS Network Verification', () => {
  let server: http.Server;
  let baseUrl: string;

  beforeAll(async () => {
    vi.spyOn(firebase, 'initFirebase').mockImplementation(() => undefined);

    await new Promise<void>((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const addr = server.address() as { port: number; address: string };
        baseUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it('GET /api/v1/health responds over live HTTP socket with 200 and healthy JSON', async () => {
    const res = await fetch(`${baseUrl}/api/v1/health`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body.service).toBe('GRIDSHIELD AI Backend');
    expect(body.version).toBe('1.0.0');
    expect(body).toHaveProperty('timestamp');
    expect(['connected', 'connecting', 'disconnected']).toContain(body.database);
  });

  it('GET /api/v1/docs serves valid OpenAPI 3.0 specification over live HTTP', async () => {
    const res = await fetch(`${baseUrl}/api/v1/docs`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.openapi).toBe('3.0.3');
    expect(body.info.title).toBe('GRIDSHIELD AI Backend API');
  });

  it('allows requests from configured FRONTEND_ORIGIN (http://localhost:3000) with proper CORS headers', async () => {
    const res = await fetch(`${baseUrl}/api/v1/health`, {
      headers: {
        Origin: 'http://localhost:3000',
      },
    });
    expect(res.status).toBe(200);
    expect(res.headers.get('access-control-allow-origin')).toBe('http://localhost:3000');
    expect(res.headers.get('access-control-allow-credentials')).toBe('true');
  });

  it('handles CORS preflight OPTIONS request correctly for allowed origin', async () => {
    const res = await fetch(`${baseUrl}/api/v1/tasks`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type,Authorization',
      },
    });
    expect(res.status).toBe(204);
    expect(res.headers.get('access-control-allow-origin')).toBe('http://localhost:3000');
    expect(res.headers.get('access-control-allow-methods')).toContain('POST');
  });

  it('blocks or rejects disallowed origin in CORS middleware', async () => {
    const res = await fetch(`${baseUrl}/api/v1/health`, {
      headers: {
        Origin: 'http://evil-attacker-site.com',
      },
    });
    // Express cors middleware returns 500 when callback(new Error(...)) is invoked, or omits CORS header
    expect(
      res.status === 500 ||
      res.headers.get('access-control-allow-origin') !== 'http://evil-attacker-site.com'
    ).toBe(true);
  });

  it('404 for unknown endpoints returns structured error format', async () => {
    const res = await fetch(`${baseUrl}/api/v1/unknown-route-probe`);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('Not Found');
  });
});
