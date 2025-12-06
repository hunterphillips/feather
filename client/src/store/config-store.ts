import { create } from 'zustand';
import type { ConfigState, AvailableModels } from '@/lib/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const useConfigStore = create<ConfigState>((set, get) => ({
  currentProvider: 'openai',
  currentModel: 'gpt-4o-mini',
  availableModels: null,
  isConfigLoaded: false,
  tools: [],

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
        // When disabling a tool, clear its config
        return { ...tool, enabled, config: enabled ? tool.config : {} };
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
}));
