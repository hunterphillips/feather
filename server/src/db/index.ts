// Domain types from types.ts
export type { Tool, ChatMessage, Chat } from '../types.js';

// Storage schema and core from db layer
export type { Database } from './core.js';
export { db, initializeDatabase } from './core.js';

// config operations
export { getConfig, updateConfig } from './config.js';

// tool operations
export { getTools, getTool, updateTool, updateTools } from './tools.js';

// chat operations
export {
  getChats,
  getChat,
  createChat,
  updateChat,
  deleteChat,
  getCurrentChatId,
  setCurrentChatId,
} from './chats.js';
