import { X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import type { ToolPanelProps } from '@/lib/types';
import { useConfigStore } from '@/store/config-store';

interface ToolModalConfig {
  title: string;
  description: string;
  placeholder: string;
  configKey: string; // Which key in tool.config to edit
}

export function createToolTextModal(config: ToolModalConfig) {
  return function GenericTextPanel({ tool, isOpen, onClose }: ToolPanelProps) {
    const { updateToolConfig, toggleTool } = useConfigStore();
    const [localValue, setLocalValue] = useState(
      (tool.config[config.configKey] as string) || ''
    );

    // Track the initial value to revert on cancel
    const initialValueRef = useRef(
      (tool.config[config.configKey] as string) || ''
    );

    useEffect(() => {
      const value = (tool.config[config.configKey] as string) || '';
      setLocalValue(value);
      initialValueRef.current = value; // Update ref when tool config changes
    }, [tool]);

    const handleSave = async () => {
      await updateToolConfig(tool.id, {
        [config.configKey]: localValue,
      });
      await toggleTool(tool.id, localValue.trim().length > 0);
      onClose();
    };

    const handleCancel = async () => {
      const initialValue = initialValueRef.current;

      // Revert to initial value
      setLocalValue(initialValue);

      // If initial value was empty (new tool activation), disable the tool
      if (initialValue.trim().length === 0) {
        await toggleTool(tool.id, false);
      }

      onClose();
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-background border border-border rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {config.title}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {config.description}
              </p>
            </div>
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-accent rounded transition-colors"
            >
              <X className="h-4 w-4 text-foreground" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <textarea
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              placeholder={config.placeholder}
              className="w-full h-64 bg-background border border-border rounded-lg p-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-border"
            />
          </div>

          <div className="flex justify-end gap-2 p-4 border-t border-border">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm text-foreground hover:bg-accent rounded transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm bg-foreground text-background rounded hover:opacity-90 transition-opacity"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  };
}
