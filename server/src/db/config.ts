import { db, type Database } from './core.js';

export async function getConfig() {
  return db.data.config;
}

export async function updateConfig(updates: Partial<Database['config']>) {
  db.data.config = { ...db.data.config, ...updates };
  await db.write();
}
