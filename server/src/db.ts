import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface Database {
  config: {
    provider: string;
    model: string;
    systemPrompt: string;
  };
}

const defaultData: Database = {
  config: {
    provider: 'openai',
    model: 'gpt-4o-mini',
    systemPrompt: '',
  },
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
