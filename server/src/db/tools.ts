import type { Tool } from '../types.js';
import { db } from './core.js';

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
