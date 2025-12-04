export interface AvailableModels {
  openai: string[];
  anthropic: string[];
  google: string[];
  ollama: string[];
}

export interface ConfigState {
  currentProvider: string;
  currentModel: string;
  systemPrompt: string;
  availableModels: AvailableModels | null;
  isConfigLoaded: boolean;
  setProvider: (provider: string) => void;
  setModel: (model: string) => void;
  setSystemPrompt: (prompt: string) => void;
  setAvailableModels: (models: AvailableModels) => void;
  fetchModels: () => Promise<void>;
  loadConfig: () => Promise<void>;
  saveConfig: (updates: { provider?: string; model?: string; systemPrompt?: string }) => Promise<void>;
}
