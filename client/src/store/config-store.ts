import { create } from 'zustand';
import type { ConfigState, AvailableModels, Chat, ChatListItem } from '@/lib/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const useConfigStore = create<ConfigState>((set, get) => ({
  currentProvider: 'openai',
  currentModel: 'gpt-4o-mini',
  availableModels: null,
  isConfigLoaded: false,
  tools: [],
  chats: [],
  currentChatId: null,

  setProvider: (provider) => {
    set({ currentProvider: provider });
    if (get().isConfigLoaded) {
      get().saveConfig({ provider }); // Auto-save model selection
    }
  },

  setModel: (model) => {
    set({ currentModel: model });
    if (get().isConfigLoaded) {
      get().saveConfig({ model });
    }
  },

  setAvailableModels: (models) => set({ availableModels: models }),

  getToolById: (id) => {
    return get().tools.find((tool) => tool.id === id);
  },

  updateToolConfig: async (id, config) => {
    const tools = get().tools.map((tool) =>
      tool.id === id ? { ...tool, config } : tool
    );
    set({ tools });
    if (get().isConfigLoaded) {
      await get().saveConfig({ tools });
    }
  },

  toggleTool: async (id, enabled) => {
    // Client-side tools (no endpoint) can be enabled alongside workflow tools
    // Workflow tools (with endpoints) are mutually exclusive
    const targetTool = get().tools.find((t) => t.id === id);

    const tools = get().tools.map((tool) => {
      if (tool.id === id) {
        return { ...tool, enabled };
      }
      // If enabling a workflow tool, disable other workflow tools
      if (enabled && targetTool?.endpoint && tool.endpoint) {
        return { ...tool, enabled: false };
      }
      return tool;
    });
    set({ tools });
    if (get().isConfigLoaded) {
      await get().saveConfig({ tools });
    }
  },

  fetchModels: async () => {
    try {
      const response = await fetch(`${API_URL}/api/models`);
      if (!response.ok) {
        console.error('Failed to fetch models');
        return;
      }
      const models: AvailableModels = await response.json();
      set({ availableModels: models });
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  },

  loadConfig: async () => {
    try {
      const response = await fetch(`${API_URL}/api/config`);
      if (response.ok) {
        const config = await response.json();
        set({
          currentProvider: config.provider,
          currentModel: config.model,
          tools: config.tools || [],
          isConfigLoaded: true,
        });
      }
    } catch (error) {
      console.error('Failed to load config:', error);
      set({ isConfigLoaded: true }); // Mark as loaded even on error
    }
  },

  saveConfig: async (updates) => {
    try {
      const response = await fetch(`${API_URL}/api/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error('Failed to save config');
      }
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  },

  // Chat methods
  loadChats: async () => {
    try {
      const response = await fetch(`${API_URL}/api/chats`);
      if (response.ok) {
        const chats = await response.json();
        set({ chats });
      }
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  },

  loadChat: async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/api/chats/${id}`);
      if (response.ok) {
        const chat = await response.json();
        return chat;
      }
      return null;
    } catch (error) {
      console.error('Failed to load chat:', error);
      return null;
    }
  },

  createChat: async (title?: string) => {
    try {
      const { currentProvider, currentModel } = get();
      const systemContext = get()
        .tools.filter((t) => t.enabled && !t.endpoint && t.config?.prompt)
        .map((t) => t.config.prompt)
        .join('\n\n');

      const response = await fetch(`${API_URL}/api/chats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          provider: currentProvider,
          model: currentModel,
          systemContext,
        }),
      });

      if (response.ok) {
        const chat = await response.json();
        set({
          currentChatId: chat.id,
          chats: [
            {
              id: chat.id,
              title: chat.title,
              createdAt: chat.createdAt,
              updatedAt: chat.updatedAt,
            },
            ...get().chats,
          ],
        });
        return chat;
      }
      throw new Error('Failed to create chat');
    } catch (error) {
      console.error('Failed to create chat:', error);
      throw error;
    }
  },

  updateChat: async (id: string, updates: Partial<Chat>) => {
    try {
      const response = await fetch(`${API_URL}/api/chats/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updated = await response.json();
        // Update list item
        set({
          chats: get().chats.map((chat) =>
            chat.id === id
              ? {
                  id: updated.id,
                  title: updated.title,
                  createdAt: updated.createdAt,
                  updatedAt: updated.updatedAt,
                }
              : chat
          ),
        });
      }
    } catch (error) {
      console.error('Failed to update chat:', error);
    }
  },

  deleteChat: async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/api/chats/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        set({
          chats: get().chats.filter((chat) => chat.id !== id),
          currentChatId:
            get().currentChatId === id ? null : get().currentChatId,
        });
      }
    } catch (error) {
      console.error('Failed to delete chat:', error);
    }
  },

  setCurrentChat: (id: string | null) => {
    set({ currentChatId: id });
    if (id) {
      fetch(`${API_URL}/api/chats/${id}/activate`, { method: 'POST' });
    }
  },

  saveMessages: async (chatId: string, messages: any[]) => {
    try {
      // Convert AI SDK Message to ChatMessage
      const chatMessages = messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: msg.createdAt?.toISOString?.() || new Date().toISOString(),
      }));

      await get().updateChat(chatId, { messages: chatMessages });
    } catch (error) {
      console.error('Failed to save messages:', error);
    }
  },
}));
