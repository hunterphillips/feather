export interface AvailableModels {
  openai: string[];
  anthropic: string[];
  google: string[];
  ollama: string[];
}

export interface ConfigState {
  currentProvider: string;
  currentModel: string;
  availableModels: AvailableModels | null;
  setProvider: (provider: string) => void;
  setModel: (model: string) => void;
  setAvailableModels: (models: AvailableModels) => void;
  fetchModels: () => Promise<void>;
}
