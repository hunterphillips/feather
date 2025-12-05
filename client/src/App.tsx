import { useEffect, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { ChatContainer } from './components/chat/ChatContainer';
import { InputArea } from './components/chat/InputArea';
import { ModelSelector } from './components/chat/ModelSelector';
import { Sidebar } from './components/Sidebar';
import { Toast, useToast } from './components/ui/toast';
import { useConfigStore } from './store/config-store';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { currentProvider, currentModel, tools, loadConfig } = useConfigStore();
  const { toast, showToast, hideToast } = useToast();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Load config on mount
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

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
  const requestBody = workflowTool
    ? {
        toolConfig: workflowTool.config,
        systemContext: systemContext,
      }
    : {
        provider: currentProvider,
        model: currentModel,
        systemContext: systemContext,
      };

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    stop,
  } = useChat({
    api: apiEndpoint,
    body: requestBody,
  });

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
