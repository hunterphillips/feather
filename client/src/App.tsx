import { useEffect, useState } from 'react';
import { Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { ChatContainer } from './components/chat/ChatContainer';
import { InputArea } from './components/chat/InputArea';
import { ModelSelector } from './components/chat/ModelSelector';
import { Sidebar } from './components/Sidebar';
import { Toast, useToast } from './components/ui/toast';
import { useConfigStore } from './store/config-store';
import { initializeToolRegistry } from './components/tools';
import { useChatSession } from './hooks/useChatSession';

function ChatView() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();
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

  // Load chat when URL changes
  useEffect(() => {
    const loadChatById = async (chatId: string) => {
      try {
        await handleSelectChat(chatId);
      } catch (error) {
        showToast('Chat not found', 'error');
        navigate('/');
      }
    };

    if (id) {
      loadChatById(id);
    } else {
      handleNewChat();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Show toast on error
  useEffect(() => {
    if (error) {
      showToast(error.message, 'error');
    }
  }, [error, showToast]);

  // Navigation handlers (passed as props to children)
  const onSelectChat = (chatId: string) => {
    navigate(`/c/${chatId}`);
  };

  const onNewChat = () => {
    navigate('/');
  };

  const onDeleteCurrentChat = () => {
    navigate('/');
  };

  // Wrap handleSubmit to navigate to new chats
  const onSubmit = async (e: React.FormEvent) => {
    const result = await handleSubmit(e);
    if (result?.newChatId) {
      navigate(`/c/${result.newChatId}`);
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onNewChat={onNewChat}
        onSelectChat={onSelectChat}
        onDeleteCurrentChat={onDeleteCurrentChat}
        currentChatId={id || null}
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
                handleSubmit={onSubmit}
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
              handleSubmit={onSubmit}
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

function App() {
  const { loadConfig } = useConfigStore();

  // Initialize tool registry once on mount
  useEffect(() => {
    initializeToolRegistry();
  }, []);

  // Load config on mount
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  return (
    <Routes>
      <Route path="/" element={<ChatView />} />
      <Route path="/c/:id" element={<ChatView />} />
    </Routes>
  );
}

export default App;
