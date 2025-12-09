import { useEffect, useState } from 'react';
import { ChatContainer } from './components/chat/ChatContainer';
import { InputArea } from './components/chat/InputArea';
import { ModelSelector } from './components/chat/ModelSelector';
import { Sidebar } from './components/Sidebar';
import { Toast, useToast } from './components/ui/toast';
import { useConfigStore } from './store/config-store';
import { initializeToolRegistry } from './components/tools';
import { useChatSession } from './hooks/useChatSession';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { loadConfig } = useConfigStore();
  const { toast, showToast, hideToast } = useToast();

  // Get all chat state and handlers from custom hook
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    stop,
    handleNewChat,
    handleSelectChat,
  } = useChatSession();

  // Initialize tool registry once on mount
  useEffect(() => {
    initializeToolRegistry();
  }, []);

  // Load config on mount
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // Show toast on error
  useEffect(() => {
    if (error) {
      showToast(error.message, 'error');
    }
  }, [error, showToast]);

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
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
                handleInputChange={handleInputChange as any}
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
              handleInputChange={handleInputChange as any}
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
    </div>
  );
}

export default App;
