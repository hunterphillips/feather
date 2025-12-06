import React from 'react';
import { PenSquare, PanelLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import featherLogo from '@/assets/feather-logo-b.svg';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const [isHovering, setIsHovering] = React.useState(false);

  const handleNewChat = () => {
    // Simple approach: reload page to start fresh
    window.location.reload();
  };

  return (
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
          {/* Feather Logo - shows PanelLeft icon on hover when collapsed */}
          {isOpen || !isHovering ? (
            <img src={featherLogo} alt="Feather" className="opacity-90" />
          ) : (
            <PanelLeft className="h-5 w-5 text-foreground" />
          )}
        </div>

        {/* Toggle Button (only when expanded) */}
        {isOpen && (
          <button
            onClick={onToggle}
            className="p-1 hover:bg-border rounded transition-colors"
          >
            <PanelLeft className="h-5 w-5 text-foreground" />
          </button>
        )}
      </div>

      {/* Menu Items */}
      <div className="flex-1 p-2 space-y-1">
        {/* New Chat Button */}
        <button
          onClick={handleNewChat}
          className={cn(
            'w-full flex items-center gap-3 p-3 rounded-lg hover:bg-border transition-colors',
            !isOpen && 'justify-center'
          )}
        >
          <PenSquare className="h-5 w-5 text-foreground flex-shrink-0" />
          {isOpen && <span className="text-sm text-foreground">New chat</span>}
        </button>
      </div>
    </div>
  );
}
