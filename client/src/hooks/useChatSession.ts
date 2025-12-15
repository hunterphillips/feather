import { useCallback } from 'react';
import { useChat } from '@ai-sdk/react';
import { useConfigStore } from '../store/config-store';
import { useChatPersistence } from './useChatPersistence';

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
    pendingAttachments,
    clearAttachments,
  } = useConfigStore();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // 1. Identify Workflow Tool (Target Endpoint)
  const workflowTool = tools.find((tool) => tool.enabled && tool.endpoint);

  // 2. Aggregate Context from Client-Side Tools
  // Find all enabled tools that do NOT have an endpoint but include additional context
  const systemContext = tools
    .filter((t) => t.enabled && !t.endpoint && t.config?.prompt)
    .map((t) => t.config.prompt)
    .join('\n\n');

  // 3. Always use /api/chat endpoint (server routes internally based on workflowId)
  const apiEndpoint = `${API_URL}/api/chat`;

  const {
    messages,
    input,
    handleInputChange,
    isLoading,
    error,
    stop,
    setMessages,
    append,
    setInput,
  } = useChat({
    api: apiEndpoint,
    body: {
      toolConfig: (workflowTool || {})?.config,
      systemContext: systemContext,
      provider: currentProvider,
      model: currentModel,
      attachments: pendingAttachments, // Server will attach to last user message
      workflowId: workflowTool?.id, // Server uses this to route to workflow handler
    },
    id: currentChatId || undefined,
  });

  // Handle persistence (auto-save and auto-title)
  useChatPersistence({
    currentChatId,
    messages,
    saveMessages,
    updateChat,
  });

  // Handle new chat
  const handleNewChat = useCallback(() => {
    setMessages([]);
    setCurrentChat(null);
  }, [setMessages, setCurrentChat]);

  // Handle chat selection
  const handleSelectChat = useCallback(
    async (id: string) => {
      // dont reload if already viewing this chat
      if (id === currentChatId) return;

      const chat = await loadChat(id);
      if (!chat) {
        throw new Error('Chat not found');
      }

      // Map DB messages to SDK format, preserving attachments
      const loadedMessages = chat.messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: new Date(msg.createdAt),
        ...(msg.attachments &&
          msg.attachments.length > 0 && {
            attachments: msg.attachments,
          }),
      }));

      setCurrentChat(id);
      // Delay to allow useChat to process id change
      setTimeout(() => {
        setMessages(loadedMessages);
      }, 0);
    },
    [loadChat, setMessages, setCurrentChat, currentChatId, messages.length]
  );

  // Wrap handleSubmit to create chat if needed
  const handleSubmit = useCallback(
    async (e: React.FormEvent): Promise<{ newChatId?: string }> => {
      e.preventDefault();

      // Allow submission if there's either text or an attachment
      if (!input.trim() && pendingAttachments.length < 1) return {};

      let chatId = currentChatId;
      let newChatId: string | undefined;

      // Create chat if this is the first message
      if (!chatId) {
        const newChat = await createChat('New Chat');
        chatId = newChat.id;
        newChatId = newChat.id;
        setCurrentChat(chatId);
      }

      // Construct complete user message with attachments
      const userMessage = {
        role: 'user' as const,
        content: input,
        ...(pendingAttachments.length > 0 && {
          attachments: [...pendingAttachments],
        }),
      };

      // Append triggers API call with complete message
      await append(userMessage);

      // Clear input and attachments after successful append
      setInput('');
      clearAttachments();

      return { newChatId };
    },
    [
      input,
      currentChatId,
      pendingAttachments,
      createChat,
      setCurrentChat,
      append,
      setInput,
      clearAttachments,
    ]
  );

  return {
    // From useChat (attachments naturally included)
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
  };
}
