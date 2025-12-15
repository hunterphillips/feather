import { describe, it, expect } from 'vitest';
import type { Message } from '../src/types.js';
import {
  convertToMultimodalMessage,
  validateMessageAttachments,
} from '../src/lib/message-converter.js';

describe('convertToMultimodalMessage', () => {
  it('returns simple format for message without attachments', async () => {
    const message: Message = {
      role: 'user',
      content: 'Hello world',
    };

    const result = await convertToMultimodalMessage(message);

    expect(result).toEqual({
      role: 'user',
      content: 'Hello world',
    });
  });

  it('converts document attachment with extractedText to text part', async () => {
    const message: Message = {
      role: 'user',
      content: 'Review this file',
      attachments: [
        {
          id: 'test-id',
          name: 'document.txt',
          path: 'test-chat/document.txt',
          mimeType: 'text/plain',
          size: 100,
          createdAt: new Date().toISOString(),
          extractedText: 'This is the document content.',
        },
      ],
    };

    const result = await convertToMultimodalMessage(message);

    expect(result.role).toBe('user');
    expect(Array.isArray(result.content)).toBe(true);
    const parts = result.content as any[];
    expect(parts).toHaveLength(2);
    expect(parts[0]).toEqual({ type: 'text', text: 'Review this file' });
    expect(parts[1]).toEqual({
      type: 'text',
      text: '[document.txt]\nThis is the document content.',
    });
  });
});

describe('validateMessageAttachments', () => {
  it('returns valid for message without attachments', () => {
    const message: Message = { role: 'user', content: 'Hello' };
    const result = validateMessageAttachments(message, false);

    expect(result.valid).toBe(true);
  });

  it('rejects image attachment when vision not supported', () => {
    const message: Message = {
      role: 'user',
      content: 'What is this?',
      attachments: [
        {
          id: 'test-id',
          name: 'test.png',
          path: 'test-chat/test.png',
          mimeType: 'image/png',
          size: 1024,
          createdAt: new Date().toISOString(),
        },
      ],
    };

    const result = validateMessageAttachments(message, false);

    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/does not support image attachments/i);
  });

  it('allows image attachment when vision is supported', () => {
    const message: Message = {
      role: 'user',
      content: 'What is this?',
      attachments: [
        {
          id: 'test-id',
          name: 'test.png',
          path: 'test-chat/test.png',
          mimeType: 'image/png',
          size: 1024,
          createdAt: new Date().toISOString(),
        },
      ],
    };

    const result = validateMessageAttachments(message, true);

    expect(result.valid).toBe(true);
  });
});
