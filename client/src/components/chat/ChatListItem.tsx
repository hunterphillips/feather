import { Trash2, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChatListItem } from '@/lib/types';

interface ChatListItemProps {
  chat: ChatListItem;
  isActive: boolean;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

export function ChatListItem({
  chat,
  isActive,
  onClick,
  onDelete,
}: ChatListItemProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors',
        isActive ? 'bg-accent/70' : 'hover:bg-border'
      )}
    >
      <MessageSquare className="h-4 w-4 text-foreground flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground truncate">{chat.title}</p>
      </div>
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-accent rounded transition-opacity"
        aria-label="Delete chat"
      >
        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
      </button>
    </div>
  );
}
