import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ChatView } from './components/chat/ChatView';
import { useConfigStore } from './store/config-store';
import { initializeToolRegistry } from './components/tools';

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
