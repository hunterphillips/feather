import React, { useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { ChatContainer } from './components/chat/ChatContainer';
import { InputArea } from './components/chat/InputArea';
import { ModelSelector } from './components/chat/ModelSelector';
import { Toast, useToast } from './components/ui/toast';
import { useConfigStore } from './store/config-store';

function App() {
  const { currentProvider, currentModel } = useConfigStore();
  const { toast, showToast, hideToast } = useToast();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const { messages, input, handleInputChange, handleSubmit, isLoading, error, stop } =
    useChat({
      api: `${API_URL}/api/chat`,
      body: {
        provider: currentProvider,
        model: currentModel,
      },
    });

  // Show toast on error
  useEffect(() => {
    if (error) {
      showToast(error.message, 'error');
    }
  }, [error, showToast]);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <ModelSelector />

      {messages.length === 0 ? (
        // Empty state: centered input
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-3xl">
            <h2 className="text-3xl font-normal text-center mb-8 text-foreground">
              What can I help you with?
            </h2>
            <InputArea
              input={input}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              onStop={stop}
            />
          </div>
        </div>
      ) : (
        // Chat view: normal layout
        <>
          <ChatContainer messages={messages} />
          <InputArea
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            onStop={stop}
          />
        </>
      )}

      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onClose={hideToast}
        />
      )}
    </div>
  );
}

export default App;
