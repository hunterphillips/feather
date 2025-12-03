export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  provider: string;
  model: string;
  messages: Message[];
}

export interface ProviderConfig {
  apiKey?: string;
  baseURL?: string;
}
