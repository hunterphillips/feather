export interface AvailableModels {
  openai: string[];
  anthropic: string[];
  google: string[];
  ollama: string[];
}

export interface Tool {
  id: string;
  label: string;
  enabled: boolean;
  config: Record<string, unknown>;
  endpoint?: string; // Relative path
}

export interface ConfigState {
  currentProvider: string;
  currentModel: string;
  availableModels: AvailableModels | null;
  isConfigLoaded: boolean;
  tools: Tool[];

  setProvider: (provider: string) => void;
  setModel: (model: string) => void;
  setAvailableModels: (models: AvailableModels) => void;

  getToolById: (id: string) => Tool | undefined;
  updateToolConfig: (
    id: string,
    config: Record<string, unknown>
  ) => Promise<void>;
  toggleTool: (id: string, enabled: boolean) => Promise<void>;

  fetchModels: () => Promise<void>;
  loadConfig: () => Promise<void>;
  saveConfig: (updates: {
    provider?: string;
    model?: string;
    tools?: Tool[];
  }) => Promise<void>;
}
