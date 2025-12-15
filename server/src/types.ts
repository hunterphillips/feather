export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  attachments?: Attachment[];
}

export interface ChatRequest {
  provider: string;
  model: string;
  messages: Message[];
  systemContext?: string;
  toolConfig?: Record<string, unknown>;
  attachments?: Attachment[]; // Pending attachments for the last user message
  workflowId?: string; // workflow identifier for routing
}

export interface Tool {
  id: string;
  label: string;
  enabled: boolean;
  config: Record<string, unknown>;
  endpoint?: string; // Relative path from API base (e.g., 'workflow/consensus')
}

export interface Attachment {
  id: string;
  name: string;
  path: string; // Relative path from data/uploads/
  mimeType: string;
  size: number;
  createdAt: string;
  extractedText?: string; // For PDFs/docs
}

export interface ChatMessage {
  id: string;
  role: 'system' | 'user' | 'assistant' | 'data';
  content: string;
  createdAt: string;
  attachments?: Attachment[];
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

export interface MessagePart {
  type: 'text' | 'image' | 'file';
  text?: string;
  image?: string; // data URL or base64
  mimeType?: string;
  data?: string; // For file content
}

export interface MultimodalMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | MessagePart[];
}
