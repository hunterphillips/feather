import { Router } from 'express';
import type { Chat } from '../types.js';
import {
  getChats,
  getChat,
  createChat,
  updateChat,
  deleteChat,
  getCurrentChatId,
  setCurrentChatId,
} from '../db/index.js';

const router = Router();

// Get all chats (sorted by updatedAt desc, no messages)
router.get('/', async (req, res) => {
  try {
    const chats = await getChats();
    // Return minimal data for list view (no messages)
    const chatList = chats
      .map(({ id, title, createdAt, updatedAt }) => ({
        id,
        title,
        createdAt,
        updatedAt,
      }))
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

    res.json(chatList);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
});

// Get full chat with messages
router.get('/:id', async (req, res) => {
  try {
    const chat = await getChat(req.params.id);
    if (!chat) {
      res.status(404).json({ error: 'Chat not found' });
      return;
    }
    res.json(chat);
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ error: 'Failed to fetch chat' });
  }
});

// Create new chat
router.post('/', async (req, res) => {
  try {
    const { title, provider, model, systemContext } = req.body;

    const now = new Date().toISOString();
    const newChat: Chat = {
      id: crypto.randomUUID(),
      title: title || 'New Chat',
      createdAt: now,
      updatedAt: now,
      messages: [],
      provider: provider || 'openai',
      model: model || 'gpt-4o-mini',
      systemContext,
    };

    await createChat(newChat);
    await setCurrentChatId(newChat.id);

    res.json(newChat);
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ error: 'Failed to create chat' });
  }
});

// Update chat (messages, title, etc.)
router.put('/:id', async (req, res) => {
  try {
    const { messages, title, provider, model, systemContext } = req.body;

    const updates: Partial<Chat> = {
      updatedAt: new Date().toISOString(),
    };

    if (messages !== undefined) updates.messages = messages;
    if (title !== undefined) updates.title = title;
    if (provider !== undefined) updates.provider = provider;
    if (model !== undefined) updates.model = model;
    if (systemContext !== undefined) updates.systemContext = systemContext;

    const updated = await updateChat(req.params.id, updates);

    if (!updated) {
      res.status(404).json({ error: 'Chat not found' });
      return;
    }

    res.json(updated);
  } catch (error) {
    console.error('Error updating chat:', error);
    res.status(500).json({ error: 'Failed to update chat' });
  }
});

// Delete chat
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await deleteChat(req.params.id);

    if (!deleted) {
      res.status(404).json({ error: 'Chat not found' });
      return;
    }

    // Clear current chat if it was deleted
    const currentId = await getCurrentChatId();
    if (currentId === req.params.id) {
      await setCurrentChatId(null);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ error: 'Failed to delete chat' });
  }
});

// Get current chat ID
router.get('/current/id', async (req, res) => {
  try {
    const id = await getCurrentChatId();
    res.json({ id });
  } catch (error) {
    console.error('Error fetching current chat ID:', error);
    res.status(500).json({ error: 'Failed to fetch current chat ID' });
  }
});

// Set as current chat
router.post('/:id/activate', async (req, res) => {
  try {
    const chat = await getChat(req.params.id);
    if (!chat) {
      res.status(404).json({ error: 'Chat not found' });
      return;
    }

    await setCurrentChatId(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error activating chat:', error);
    res.status(500).json({ error: 'Failed to activate chat' });
  }
});

export default router;
