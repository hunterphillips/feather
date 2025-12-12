import { useEffect, useCallback, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import type { Message } from '@ai-sdk/react';
import { useConfigStore } from '../store/config-store';

export function useChatSession() {
  const {
    currentProvider,
    currentModel,
    tools,
    currentChatId,
    setCurrentChat,
    createChat,
    loadChat,
    saveMessages,
    updateChat,
  } = useConfigStore();

  // Track if we've auto-generated a title for this chat
  const autoTitledRef = useRef<Set<string>>(new Set());

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // 1. Identify Workflow Tool (Target Endpoint)
  const workflowTool = tools.find((tool) => tool.enabled && tool.endpoint);

  // 2. Aggregate Context from Client-Side Tools
  // Find all enabled tools that do NOT have an endpoint but include additional context
  const systemContext = tools
    .filter((t) => t.enabled && !t.endpoint && t.config?.prompt)
    .map((t) => t.config.prompt)
    .join('\n\n');

  // 3. Construct Dynamic Endpoint
  const apiEndpoint = workflowTool
    ? `${API_URL}/api/${workflowTool.endpoint}`
    : `${API_URL}/api/chat`;

  // 4. Construct Request Body
  const requestBody = {
    toolConfig: (workflowTool || {})?.config,
    systemContext: systemContext,
    provider: currentProvider,
    model: currentModel,
  };

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: originalHandleSubmit,
    isLoading,
    error,
    stop,
    setMessages,
  } = useChat({
    api: apiEndpoint,
    body: requestBody,
    id: currentChatId || undefined,
  });

  // Auto-save messages when they change
  useEffect(() => {
    if (currentChatId && messages.length > 0) {
      const timeoutId = setTimeout(() => {
        saveMessages(currentChatId, messages);

        // Auto-generate title from first user message (once per chat)
        if (messages.length >= 1 && !autoTitledRef.current.has(currentChatId)) {
          const firstUserMsg = messages.find((m) => m.role === 'user');
          if (firstUserMsg) {
            autoTitledRef.current.add(currentChatId);
            const title = firstUserMsg.content.trim().substring(0, 50);
            updateChat(currentChatId, {
              title: title.length < 50 ? title : title + '...',
            });
          }
        }
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [messages, currentChatId, saveMessages, updateChat]);

  // Handle new chat
  const handleNewChat = useCallback(() => {
    setMessages([]);
    setCurrentChat(null);
  }, [setMessages, setCurrentChat, currentChatId, messages]);

  // Handle chat selection
  const handleSelectChat = useCallback(
    async (id: string) => {
      const chat = await loadChat(id);
      if (!chat) {
        throw new Error('Chat not found');
      }

      const loadedMessages: Message[] = chat.messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: new Date(msg.createdAt),
      }));

      setCurrentChat(id);
      // set messages after a delay so useChat has processed the id change
      setTimeout(() => {
        setMessages(loadedMessages);
      }, 0);
    },
    [loadChat, setMessages, setCurrentChat, currentChatId]
  );

  // Wrap handleSubmit to create chat if needed
  const handleSubmit = useCallback(
    async (e: React.FormEvent): Promise<{ newChatId?: string }> => {
      if (!currentChatId && input.trim()) {
        const newChat = await createChat('New Chat');
        setCurrentChat(newChat.id);
        autoTitledRef.current.delete(newChat.id);
        originalHandleSubmit(e);
        return { newChatId: newChat.id };
      }
      originalHandleSubmit(e);
      return {};
    },
    [currentChatId, input, createChat, setCurrentChat, originalHandleSubmit]
  );

  return {
    // From useChat
    messages,
    input,
    handleInputChange,
    isLoading,
    error,
    stop,

    // Custom handlers
    handleNewChat,
    handleSelectChat,
    handleSubmit,

    // Computed values (for debugging/reference)
    apiEndpoint,
    requestBody,
  };
}
