import { useEffect, useRef } from 'react';
import type { Chat } from '@/lib/types';

interface UseChatPersistenceOptions {
  currentChatId: string | null;
  messages: any[];
  saveMessages: (chatId: string, messages: any[]) => Promise<void>;
  updateChat: (chatId: string, updates: Partial<Chat>) => Promise<void>;
}

export function useChatPersistence({
  currentChatId,
  messages,
  saveMessages,
  updateChat,
}: UseChatPersistenceOptions) {
  const autoTitledRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (currentChatId && messages.length > 0) {
      const timeoutId = setTimeout(async () => {
        // Save messages
        await saveMessages(currentChatId, messages);

        // Auto-title if needed
        if (!autoTitledRef.current.has(currentChatId)) {
          const firstUserMsg = messages.find((m) => m.role === 'user');
          if (firstUserMsg) {
            autoTitledRef.current.add(currentChatId);
            const title = firstUserMsg.content.trim().substring(0, 50);
            await updateChat(currentChatId, {
              title: title.length < 50 ? title : title + '...',
            });
          }
        }
      }, 750);

      return () => clearTimeout(timeoutId);
    }
  }, [currentChatId, messages, saveMessages, updateChat]);
}
