import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import type { Tool, Chat } from '../types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Storage schema
export interface Database {
  config: {
    provider: string;
    model: string;
  };
  tools: Tool[];
  chats: Chat[];
  currentChatId: string | null;
}

// Default data
const defaultData: Database = {
  config: {
    provider: 'openai',
    model: 'gpt-4o-mini',
  },
  tools: [
    {
      id: 'instructions',
      label: 'Instructions',
      enabled: false,
      config: {
        prompt: '',
      },
    },
    {
      id: 'consensus',
      label: 'Consensus',
      enabled: false,
      config: {
        models: [
          { provider: 'openai', model: 'gpt-5.1' },
          { provider: 'anthropic', model: 'claude-opus-4-5' },
          { provider: 'google', model: 'gemini-3-pro-preview' },
        ],
      },
      isWorkflow: true,
    },
  ],
  chats: [],
  currentChatId: null,
};

// Initialize database
const dataDir = path.join(__dirname, '../../data');
const file = path.join(dataDir, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const adapter = new JSONFile<Database>(file);
export const db = new Low<Database>(adapter, defaultData);

// Initialize database (one-time read)
export async function initializeDatabase() {
  await db.read();
  db.data ||= defaultData;
  await db.write();
}
