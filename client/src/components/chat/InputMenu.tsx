import { useState, useRef, useEffect } from 'react';
import { Plus, FileText, Users } from 'lucide-react';
import { useConfigStore } from '@/store/config-store';

interface InputMenuProps {
  onAddInstructions: () => void;
}

export function InputMenu({ onAddInstructions }: InputMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { toggleTool } = useConfigStore();

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
        <div className="absolute bottom-full left-0 mb-2 w-48 bg-secondary border border-border rounded-lg shadow-lg overflow-hidden">
          <button
            onClick={() => {
              onAddInstructions();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
          >
            <FileText className="h-4 w-4 text-foreground" />
            <span className="text-sm text-foreground">Add instructions</span>
          </button>
          <button
            onClick={() => {
              toggleTool('consensus', true);
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
          >
            <Users className="h-4 w-4 text-foreground" />
            <span className="text-sm text-foreground">Consensus</span>
          </button>
        </div>
      )}
    </div>
  );
}
