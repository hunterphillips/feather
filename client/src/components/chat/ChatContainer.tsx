import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { LoadingIndicator } from './LoadingIndicator';
import type { Message } from '@ai-sdk/react';

interface ChatContainerProps {
  messages: Message[];
  isLoading: boolean;
}

export function ChatContainer({ messages, isLoading }: ChatContainerProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const shouldShowLoadingIndicator =
    isLoading &&
    (messages.length === 0 || messages[messages.length - 1]?.role === 'user');

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto p-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Start a conversation...
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {shouldShowLoadingIndicator && <LoadingIndicator />}
            <div ref={endRef} />
          </>
        )}
      </div>
    </div>
  );
}
