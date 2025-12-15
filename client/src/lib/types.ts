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

// Icon type (lucide-react icon names)
export type ToolIcon = 'FileText' | 'Users' | 'Settings' | 'Plus' | string;

// Tool UI metadata (client-side only, not persisted)
export interface ToolUIMetadata {
  icon: ToolIcon;
  description?: string;
  showConfigButton?: boolean; // Show config button in pill (e.g., "Models (3)")
  configButtonLabel?: string; // Label for config button
}

// Component prop interfaces
export interface ToolPillProps {
  tool: Tool;
  onRemove: () => void;
  onConfigClick?: () => void;
}

export interface ToolPanelProps {
  tool: Tool;
  isOpen: boolean;
  onClose: () => void;
}

export interface ToolConfigProps {
  tool: Tool;
  isOpen: boolean;
  onClose: () => void;
}

// Component types for registry
export type ToolPillComponent = React.ComponentType<ToolPillProps>;
export type ToolPanelComponent = React.ComponentType<ToolPanelProps>;
export type ToolConfigComponent = React.ComponentType<ToolConfigProps>;

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

export interface ChatListItem {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConfigState {
  currentProvider: string;
  currentModel: string;
  availableModels: AvailableModels | null;
  isConfigLoaded: boolean;
  tools: Tool[];

  // Chat state
  chats: ChatListItem[];
  currentChatId: string | null;

  // File state (files selected but not yet uploaded)
  pendingFiles: File[];

  // Current attachments being submitted (uploaded files)
  currentAttachments: Attachment[];

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

  // Chat methods
  loadChats: () => Promise<void>;
  loadChat: (id: string) => Promise<Chat | null>;
  createChat: (title?: string) => Promise<Chat>;
  updateChat: (id: string, updates: Partial<Chat>) => Promise<void>;
  deleteChat: (id: string) => Promise<void>;
  setCurrentChat: (id: string | null) => void;
  saveMessages: (chatId: string, messages: any[]) => Promise<void>;

  // File methods
  addPendingFile: (file: File) => void;
  removePendingFile: (fileId: string) => void;
  clearPendingFiles: () => void;

  // Current attachments methods (for active submission)
  setCurrentAttachments: (attachments: Attachment[]) => void;
}
