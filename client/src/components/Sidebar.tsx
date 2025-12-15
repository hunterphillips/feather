import { useEffect, useState } from 'react';
import { PenSquare, PanelLeft, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useConfigStore } from '@/store/config-store';
import { ChatListItem } from './chat/ChatListItem';
import { Dialog } from './ui/dialog';
import { DropdownMenu } from './ui/dropdown-menu';
import featherLogo from '@/assets/feather-logo-b.svg';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteCurrentChat?: () => void;
  currentChatId: string | null;
}

export function Sidebar({
  isOpen,
  onToggle,
  onNewChat,
  onSelectChat,
  onDeleteCurrentChat,
  currentChatId,
}: SidebarProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [dropdownMenu, setDropdownMenu] = useState<{
    chatId: string;
    anchorEl: HTMLElement;
  } | null>(null);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);

  const { chats, loadChats, deleteChat, updateChat } = useConfigStore();

  // Load chats on mount
  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const handleMenuClick = (
    _e: React.MouseEvent,
    chatId: string,
    buttonEl: HTMLButtonElement
  ) => {
    setDropdownMenu({
      chatId,
      anchorEl: buttonEl,
    });
  };

  const handleRename = (chatId: string) => {
    setEditingChatId(chatId);
    setDropdownMenu(null);
  };

  const handleSaveRename = async (chatId: string, newTitle: string) => {
    await updateChat(chatId, { title: newTitle });
    setEditingChatId(null);
  };

  const handleDeleteClick = (chatId: string) => {
    setChatToDelete(chatId);
    setDropdownMenu(null);
  };

  const handleConfirmDelete = async () => {
    if (chatToDelete) {
      const wasCurrentChat = chatToDelete === currentChatId;
      await deleteChat(chatToDelete);
      if (wasCurrentChat) {
        onDeleteCurrentChat?.();
      }
    }
    setChatToDelete(null);
  };

  const dropdownMenuItems = dropdownMenu
    ? [
        {
          label: 'Rename',
          icon: <Pencil className="h-4 w-4" />,
          onClick: () => handleRename(dropdownMenu.chatId),
        },
        {
          label: 'Delete',
          icon: <Trash2 className="h-4 w-4" />,
          onClick: () => handleDeleteClick(dropdownMenu.chatId),
          className: 'hover:text-red-400',
        },
      ]
    : [];

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
          <div className="flex-1 overflow-y-auto p-2">
            {chats.map((chat) => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                isActive={chat.id === currentChatId}
                isEditing={chat.id === editingChatId}
                onClick={() => onSelectChat(chat.id)}
                onMenuClick={handleMenuClick}
                onRename={handleSaveRename}
                onCancelEdit={() => setEditingChatId(null)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dropdown Menu */}
      <DropdownMenu
        open={!!dropdownMenu}
        onClose={() => setDropdownMenu(null)}
        anchorEl={dropdownMenu?.anchorEl || null}
        items={dropdownMenuItems}
      />

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
