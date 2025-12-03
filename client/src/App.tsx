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

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
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
    <div className="flex flex-col h-screen">
      <header className="border-b p-4">
        <h1 className="text-2xl font-bold">Feather</h1>
      </header>

      <ModelSelector />

      <ChatContainer messages={messages} />

      <InputArea
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
      />

      {toast && <Toast message={toast.message} variant={toast.variant} onClose={hideToast} />}
    </div>
  );
}

export default App;
