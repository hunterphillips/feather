import React, { useEffect, useState } from 'react';
import { PenSquare, PanelLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useConfigStore } from '@/store/config-store';
import { ChatListItem } from './chat/ChatListItem';
import { Button } from './ui/button';
import { Dialog } from './ui/dialog';
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
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const { chats, currentChatId, loadChats, deleteChat } = useConfigStore();

  // Load chats on mount
  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChatToDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (chatToDelete) {
      await deleteChat(chatToDelete);
    }
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
            {isOpen && (
              <span className="text-sm text-foreground">New chat</span>
            )}
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!chatToDelete}
        onClose={() => setChatToDelete(null)}
        title="Delete chat?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        variant="destructive"
      />
    </>
  );
}
