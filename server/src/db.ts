import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface Tool {
  id: string;
  label: string;
  enabled: boolean;
  config: Record<string, unknown>;
  endpoint?: string; // Relative path from API base (ex. 'workflow/consensus')
}

export interface Database {
  config: {
    provider: string;
    model: string;
  };
  tools: Tool[];
}

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
          { provider: 'google', model: 'gemini-3-pro' },
        ],
      },
      endpoint: 'workflow/consensus',
    },
  ],
};

// Initialize database
const dataDir = path.join(__dirname, '../data');
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

// Helper functions
export async function getConfig() {
  return db.data.config;
}

export async function updateConfig(updates: Partial<Database['config']>) {
  db.data.config = { ...db.data.config, ...updates };
  await db.write();
}

export async function getTools() {
  return db.data.tools;
}

export async function getTool(id: string) {
  return db.data.tools.find((tool) => tool.id === id);
}

export async function updateTool(id: string, updates: Partial<Tool>) {
  const toolIndex = db.data.tools.findIndex((tool) => tool.id === id);
  if (toolIndex !== -1) {
    db.data.tools[toolIndex] = { ...db.data.tools[toolIndex], ...updates };
    await db.write();
  }
}

export async function updateTools(tools: Tool[]) {
  db.data.tools = tools;
  await db.write();
}
