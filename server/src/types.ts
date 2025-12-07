export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  provider: string;
  model: string;
  messages: Message[];
  systemContext?: string;
  toolConfig?: Record<string, unknown>;
}

export interface Tool {
  id: string;
  label: string;
  enabled: boolean;
  config: Record<string, unknown>;
  endpoint?: string; // Relative path from API base (e.g., 'workflow/consensus')
}

export interface ProviderConfig {
  apiKey?: string;
  baseURL?: string;
}
