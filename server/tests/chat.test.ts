import { describe, it, expect, vi, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';
import * as ai from 'ai';

// Mock environment variables
beforeAll(() => {
  process.env.OPENAI_API_KEY = 'test-key';
  process.env.ANTHROPIC_API_KEY = 'test-key';
  process.env.GOOGLE_API_KEY = 'test-key';
});

// Mock streamText
vi.mock('ai', () => ({
  streamText: vi.fn(),
}));

describe('POST /api/chat', () => {
  it('streams chat responses', async () => {
    vi.mocked(ai.streamText).mockResolvedValue({
      pipeDataStreamToResponse: (res: any) => {
        res.write('Test response');
        res.end();
      },
    } as any);

    const res = await request(app)
      .post('/api/chat')
      .send({
        provider: 'openai',
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Hello' }],
      });

    expect(res.status).toBe(200);
    expect(res.text).toContain('Test response');
    expect(ai.streamText).toHaveBeenCalledWith(
      expect.objectContaining({
        model: expect.anything(),
        messages: expect.arrayContaining([
          { role: 'user', content: 'Hello' },
        ]),
      })
    );
  });

  it('validates required fields', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ provider: 'openai' }); // Missing model and messages

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/missing/i);
  });

  it('prepends system context when provided', async () => {
    vi.mocked(ai.streamText).mockResolvedValue({
      pipeDataStreamToResponse: (res: any) => {
        res.write('Response');
        res.end();
      },
    } as any);

    await request(app)
      .post('/api/chat')
      .send({
        provider: 'openai',
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Hello' }],
        systemContext: 'You are helpful',
      });

    expect(ai.streamText).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: expect.arrayContaining([
          { role: 'system', content: 'You are helpful' },
          { role: 'user', content: 'Hello' },
        ]),
      })
    );
  });
});
