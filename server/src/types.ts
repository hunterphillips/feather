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

export interface ChatMessage {
  id: string;
  role: 'system' | 'user' | 'assistant' | 'data';
  content: string;
  createdAt: string;
}

export interface Chat {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  provider: string;
  model: string;
  systemContext?: string;
}

export interface ProviderConfig {
  apiKey?: string;
  baseURL?: string;
}
