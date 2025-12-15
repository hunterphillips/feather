import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';

beforeAll(() => {
  process.env.OPENAI_API_KEY = 'test-key';
  process.env.ANTHROPIC_API_KEY = 'test-key';
  process.env.GOOGLE_API_KEY = 'test-key';
});

describe('POST /api/uploads', () => {
  it('rejects upload without chatId', async () => {
    const res = await request(app)
      .post('/api/uploads')
      .attach('file', Buffer.from('test'), 'test.txt');

    expect(res.status).toBe(500);
  });

  it('rejects chatId with path traversal attempt', async () => {
    const res = await request(app)
      .post('/api/uploads')
      .field('chatId', '../../../etc')
      .attach('file', Buffer.from('test'), 'test.txt');

    expect(res.status).toBe(500);
  });
});

describe('GET /api/uploads/:chatId/:filename', () => {
  it('blocks path traversal in filename', async () => {
    const res = await request(app).get(
      '/api/uploads/test/../../etc/passwd'
    );

    expect(res.status).toBe(404);
  });
});
