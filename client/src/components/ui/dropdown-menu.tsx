import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface DropdownMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'destructive';
  className?: string;
}

interface DropdownMenuProps {
  open: boolean;
  onClose: () => void;
  anchorEl: HTMLElement | null;
  items: DropdownMenuItem[];
}

export function DropdownMenu({
  open,
  onClose,
  anchorEl,
  items,
}: DropdownMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        anchorEl &&
        !anchorEl.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose, anchorEl]);

  if (!open || !anchorEl) return null;

  // Position menu below and aligned with the trigger button
  const rect = anchorEl.getBoundingClientRect();
  const top = rect.bottom + 4; // 4px gap below button
  const right = window.innerWidth - rect.right; // Align right edge

  return (
    <div
      ref={menuRef}
      className="fixed bg-background border border-border rounded-lg shadow-lg py-1 min-w-[160px] z-50"
      style={{
        top: `${top}px`,
        right: `${right}px`,
      }}
    >
      {items.map((item, index) => (
        <button
          key={index}
          onClick={() => {
            item.onClick();
            onClose();
          }}
          className={cn(
            `w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors text-left ${item.className}`,
            item.variant === 'destructive'
              ? 'text-destructive hover:bg-destructive/10'
              : 'text-foreground hover:bg-accent'
          )}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}
