import { create } from 'zustand';
import type { ConfigState, AvailableModels } from '@/lib/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const useConfigStore = create<ConfigState>((set) => ({
  currentProvider: 'openai',
  currentModel: 'gpt-4o-mini',
  availableModels: null,

  setProvider: (provider) => set({ currentProvider: provider }),

  setModel: (model) => set({ currentModel: model }),

  setAvailableModels: (models) => set({ availableModels: models }),

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
}));
