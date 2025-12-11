import { MessageSquare, MoreHorizontal } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { ChatListItem } from '@/lib/types';

interface ChatListItemProps {
  chat: ChatListItem;
  isActive: boolean;
  isEditing: boolean;
  onClick: () => void;
  onMenuClick: (
    e: React.MouseEvent,
    chatId: string,
    buttonEl: HTMLButtonElement
  ) => void;
  onRename: (chatId: string, newTitle: string) => void;
  onCancelEdit: () => void;
}

export function ChatListItem({
  chat,
  isActive,
  isEditing,
  onClick,
  onMenuClick,
  onRename,
  onCancelEdit,
}: ChatListItemProps) {
  const [title, setTitle] = useState(chat.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmedTitle = title.trim();
    if (trimmedTitle && trimmedTitle !== chat.title) {
      onRename(chat.id, trimmedTitle);
    } else {
      onCancelEdit();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setTitle(chat.title);
      onCancelEdit();
    }
  };

  return (
    <div
      onClick={isEditing ? undefined : onClick}
      className={cn(
        'group flex items-center gap-3 p-3 rounded-lg transition-colors',
        !isEditing && 'cursor-pointer',
        isActive ? 'bg-accent/70' : 'hover:bg-border'
      )}
    >
      <MessageSquare className="h-4 w-4 text-foreground flex-shrink-0" />

      {isEditing ? (
        <div className="flex-1 flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className="flex-1 bg-background border border-border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      ) : (
        <>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground truncate">{chat.title}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMenuClick(e, chat.id, e.currentTarget);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-accent rounded transition-opacity"
            aria-label="Chat options"
          >
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </button>
        </>
      )}
    </div>
  );
}
