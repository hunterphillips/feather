import type { Chat } from '../types.js';
import { db } from './core.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_BASE = path.join(__dirname, '../../data/uploads');

export async function getChats() {
  return db.data.chats || [];
}

export async function getChat(id: string) {
  return db.data.chats.find((chat) => chat.id === id);
}

export async function createChat(chat: Chat) {
  db.data.chats.push(chat);
  await db.write();
  return chat;
}

export async function updateChat(id: string, updates: Partial<Chat>) {
  const index = db.data.chats.findIndex((chat) => chat.id === id);
  if (index !== -1) {
    db.data.chats[index] = { ...db.data.chats[index], ...updates };
    await db.write();
    return db.data.chats[index];
  }
  return null;
}

export async function deleteChat(id: string) {
  const index = db.data.chats.findIndex((chat) => chat.id === id);
  if (index !== -1) {
    // Delete associated files
    const chatUploadDir = path.join(UPLOADS_BASE, id);
    try {
      await fs.rm(chatUploadDir, { recursive: true, force: true });
    } catch (error) {
      console.warn(`Failed to delete files for chat ${id}:`, error);
    }

    db.data.chats.splice(index, 1);
    await db.write();
    return true;
  }
  return false;
}

export async function getCurrentChatId() {
  return db.data.currentChatId;
}

export async function setCurrentChatId(id: string | null) {
  db.data.currentChatId = id;
  await db.write();
}
