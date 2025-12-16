import { useCallback } from 'react';
import { useChat } from '@ai-sdk/react';
import { useConfigStore } from '../store/config-store';
import { useChatPersistence } from './useChatPersistence';
import { useFileUpload } from './useFileUpload';
import type { Attachment } from '@/lib/types';

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
    pendingFiles,
    clearPendingFiles,
    currentAttachments,
    setCurrentAttachments,
  } = useConfigStore();

  const { uploadFilesToChat, isUploading: isUploadingFiles } = useFileUpload();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const workflowTool = tools.find((tool) => tool.enabled && tool.isWorkflow);

  // Aggregate Context from Tools
  // Any enabled tool can provide system context via config.prompt
  const systemContext = tools
    .filter((t) => t.enabled && t.config?.prompt)
    .map((t) => t.config.prompt)
    .join('\n\n');

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
      attachments: currentAttachments, // Server will attach to last user message
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

      // Allow submission if there's either text or files
      if (!input.trim() && pendingFiles.length < 1) return {};

      let chatId = currentChatId;
      let newChatId: string | undefined;

      // Create chat FIRST if this is the first message
      if (!chatId) {
        const newChat = await createChat('New Chat');
        chatId = newChat.id;
        newChatId = newChat.id;
        setCurrentChat(chatId);
      }

      // Upload files now that we have a chatId
      let uploadedAttachments: Attachment[] = [];
      if (pendingFiles.length > 0) {
        uploadedAttachments = await uploadFilesToChat(pendingFiles, chatId);

        // Warn if some files failed to upload
        if (uploadedAttachments.length < pendingFiles.length) {
          const failedCount = pendingFiles.length - uploadedAttachments.length;
          console.warn(`${failedCount} file(s) failed to upload`);
        }
      }

      // Set attachments in state so they're included in the next request body
      setCurrentAttachments(uploadedAttachments);

      // Note: AI SDK will strip attachments from HTTP request but keep them in client stat
      const userMessage = {
        role: 'user' as const,
        content: input,
        ...(uploadedAttachments.length > 0 && {
          attachments: uploadedAttachments,
        }),
      };

      // Append triggers API call with attachments in body
      await append(userMessage);

      // Clear state after successful append
      setInput('');
      clearPendingFiles();
      setCurrentAttachments([]);

      return { newChatId };
    },
    [
      input,
      currentChatId,
      pendingFiles,
      createChat,
      setCurrentChat,
      uploadFilesToChat,
      append,
      setInput,
      clearPendingFiles,
      setCurrentAttachments,
    ]
  );

  return {
    // From useChat (attachments naturally included)
    messages,
    input,
    handleInputChange,
    isLoading: isLoading || isUploadingFiles, // Combined busy state
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
