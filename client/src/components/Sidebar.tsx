import React, { useEffect, useState } from 'react';
import { PenSquare, PanelLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useConfigStore } from '@/store/config-store';
import { ChatListItem } from './chat/ChatListItem';
import { Button } from './ui/button';
import featherLogo from '@/assets/feather-logo-b.svg';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
}

export function Sidebar({
  isOpen,
  onToggle,
  onNewChat,
  onSelectChat,
}: SidebarProps) {
  const [isHovering, setIsHovering] = React.useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const {
    chats,
    currentChatId,
    loadChats,
    deleteChat,
  } = useConfigStore();

  // Load chats on mount
  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChatToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (chatToDelete) {
      await deleteChat(chatToDelete);
    }
    setDeleteModalOpen(false);
    setChatToDelete(null);
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setChatToDelete(null);
  };

  return (
    <>
      <div
        className={cn(
          'h-screen bg-secondary border-r border-border flex flex-col transition-all duration-300',
          isOpen ? 'w-64' : 'w-16'
        )}
      >
        {/* Header with Logo and Toggle */}
        <div
          className={cn(
            'p-3 flex items-center',
            isOpen ? 'justify-between' : 'justify-center'
          )}
        >
          <div
            className="flex items-center justify-center w-8 h-8 cursor-pointer hover:bg-border rounded"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onClick={!isOpen ? onToggle : undefined}
          >
            {isOpen || !isHovering ? (
              <img src={featherLogo} alt="Feather" className="opacity-90" />
            ) : (
              <PanelLeft className="h-5 w-5 text-foreground" />
            )}
          </div>

          {isOpen && (
            <button
              onClick={onToggle}
              className="p-1 hover:bg-border rounded transition-colors"
            >
              <PanelLeft className="h-5 w-5 text-foreground" />
            </button>
          )}
        </div>

        {/* New Chat Button */}
        <div className="p-2">
          <button
            onClick={onNewChat}
            className={cn(
              'w-full flex items-center gap-3 p-3 rounded-lg hover:bg-border transition-colors',
              !isOpen && 'justify-center'
            )}
          >
            <PenSquare className="h-5 w-5 text-foreground flex-shrink-0" />
            {isOpen && <span className="text-sm text-foreground">New chat</span>}
          </button>
        </div>

        {/* Chat List */}
        {isOpen && (
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {chats.map((chat) => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                isActive={chat.id === currentChatId}
                onClick={() => onSelectChat(chat.id)}
                onDelete={(e) => handleDeleteClick(chat.id, e)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={cancelDelete}
        >
          <div
            className="bg-background border border-border rounded-lg p-6 max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-2">Delete chat?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={cancelDelete}>
                Cancel
              </Button>
              <Button variant="default" onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
