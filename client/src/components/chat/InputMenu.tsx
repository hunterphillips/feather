import { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useConfigStore } from '@/store/config-store';
import { ToolMenuItem } from './ToolMenuItem';
import { toolRegistry } from '@/lib/tool-registry';

interface InputMenuProps {
  onOpenPanel?: (toolId: string) => void;
}

export function InputMenu({ onOpenPanel }: InputMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { tools, toggleTool } = useConfigStore();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleToolActivate = (toolId: string) => {
    const tool = tools.find((t) => t.id === toolId);
    const hasPanel = toolRegistry.getPanelComponent(toolId);

    // If tool is already enabled and has a panel, open it
    if (tool?.enabled && hasPanel && onOpenPanel) {
      onOpenPanel(toolId);
    } else {
      // Enable the tool if not already enabled
      if (!tool?.enabled) {
        toggleTool(toolId, true);
      }

      // If tool has a panel, open it explicitly
      if (hasPanel && onOpenPanel) {
        onOpenPanel(toolId);
      }
    }

    setIsOpen(false);
  };

  // Show all available tools in menu
  const availableTools = tools;

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-accent rounded transition-colors"
      >
        <Plus className="h-5 w-5 text-foreground" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-48 bg-secondary border border-border rounded-lg shadow-lg">
          {availableTools.map((tool) => (
            <ToolMenuItem
              key={tool.id}
              tool={tool}
              onClick={() => handleToolActivate(tool.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
