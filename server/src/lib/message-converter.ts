import type {
  Message,
  ChatMessage,
  MultimodalMessage,
  MessagePart,
  Attachment,
} from '../types.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_BASE = path.join(__dirname, '../../data/uploads');

type MessageWithAttachments = Message | ChatMessage;

export async function convertToMultimodalMessage(
  message: MessageWithAttachments
): Promise<MultimodalMessage> {
  // No attachments - return simple format
  if (!message.attachments || message.attachments.length === 0) {
    return {
      role: message.role as 'user' | 'assistant' | 'system',
      content: message.content,
    };
  }

  // Has attachments - build parts array
  const parts: MessagePart[] = [];

  // Add text content if present
  if (message.content.trim()) {
    parts.push({
      type: 'text',
      text: message.content,
    });
  }

  // Add attachments
  for (const attachment of message.attachments) {
    const filePath = path.join(UPLOADS_BASE, attachment.path);

    if (attachment.mimeType.startsWith('image/')) {
      // Read image and convert to base64 data URL
      try {
        const imageBuffer = await fs.readFile(filePath);
        const base64 = imageBuffer.toString('base64');
        const dataUrl = `data:${attachment.mimeType};base64,${base64}`;

        parts.push({
          type: 'image',
          image: dataUrl,
        });
      } catch (error) {
        console.error(`Failed to read image file ${filePath}:`, error);
        // Add error message as text
        parts.push({
          type: 'text',
          text: `[Error loading image: ${attachment.name}]`,
        });
      }
    } else if (attachment.extractedText) {
      // For documents with extracted text
      parts.push({
        type: 'text',
        text: `[${attachment.name}]\n${attachment.extractedText}`,
      });
    }
  }

  return {
    role: message.role as 'user' | 'assistant' | 'system',
    content: parts,
  };
}

export async function convertMessagesForAI(
  messages: MessageWithAttachments[]
): Promise<MultimodalMessage[]> {
  return Promise.all(messages.map(convertToMultimodalMessage));
}

// Validate if model supports attachments in message
export function validateMessageAttachments(
  message: MessageWithAttachments,
  supportsVision: boolean
): { valid: boolean; error?: string } {
  if (!message.attachments || message.attachments.length === 0) {
    return { valid: true };
  }

  for (const attachment of message.attachments) {
    if (attachment.mimeType.startsWith('image/') && !supportsVision) {
      return {
        valid: false,
        error: `Model does not support image attachments. Please select a vision-capable model.`,
      };
    }
    // Note: Document attachments (PDF, TXT, MD, code files) are converted to text
  }

  return { valid: true };
}
