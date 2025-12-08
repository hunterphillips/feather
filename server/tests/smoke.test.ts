import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';

beforeAll(() => {
  process.env.OPENAI_API_KEY = 'test-key';
  process.env.ANTHROPIC_API_KEY = 'test-key';
  process.env.GOOGLE_API_KEY = 'test-key';
});

describe('Smoke tests', () => {
  it('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /api/models returns available models', async () => {
    const res = await request(app).get('/api/models');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('openai');
    expect(res.body).toHaveProperty('anthropic');
    expect(res.body).toHaveProperty('google');
  });
});
