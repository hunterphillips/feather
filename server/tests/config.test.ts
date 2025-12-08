import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';

beforeAll(() => {
  process.env.OPENAI_API_KEY = 'test-key';
  process.env.ANTHROPIC_API_KEY = 'test-key';
  process.env.GOOGLE_API_KEY = 'test-key';
});

describe('Config endpoints', () => {
  it('gets current config', async () => {
    const res = await request(app).get('/api/config');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('provider');
    expect(res.body).toHaveProperty('model');
    expect(res.body).toHaveProperty('tools');
  });

  it('updates config', async () => {
    const res = await request(app)
      .post('/api/config')
      .send({ provider: 'anthropic', model: 'claude-opus-4-5' });

    expect(res.status).toBe(200);
    expect(res.body.provider).toBe('anthropic');
    expect(res.body.model).toBe('claude-opus-4-5');
  });
});
