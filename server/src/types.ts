export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  provider: string;
  model: string;
  messages: Message[];
  systemContext?: string;
}

export interface Tool {
  id: string;
  label: string;
  enabled: boolean;
  config: Record<string, unknown>;
  endpoint?: string; // Relative path from API base (e.g., 'workflow/consensus')
}

export interface WorkflowChatRequest {
  messages: Message[];
  toolConfig: Record<string, unknown>;
  systemContext?: string;
}

export interface ProviderConfig {
  apiKey?: string;
  baseURL?: string;
}
