import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useConfigStore } from '@/store/config-store';

interface SystemPromptPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SystemPromptPanel({ isOpen, onClose }: SystemPromptPanelProps) {
  const { getToolById, updateToolConfig, toggleTool } = useConfigStore();
  const instructionsTool = getToolById('instructions');
  const [localPrompt, setLocalPrompt] = useState(
    (instructionsTool?.config.prompt as string) || ''
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && instructionsTool) {
      setLocalPrompt((instructionsTool.config.prompt as string) || '');
    }
  }, [isOpen, instructionsTool]);

  const handleSave = async () => {
    setIsSaving(true);
    await updateToolConfig('instructions', { prompt: localPrompt });
    // Enable the tool if prompt is not empty, disable if empty
    await toggleTool('instructions', localPrompt.trim().length > 0);
    setIsSaving(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
      <div className="bg-secondary border border-border rounded-lg w-full max-w-2xl mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Custom Instructions
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent rounded transition-colors"
          >
            <X className="h-5 w-5 text-foreground" />
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4">
          Add instructions that will be included with every message you send.
        </p>

        {/* Textarea */}
        <textarea
          value={localPrompt}
          onChange={(e) => setLocalPrompt(e.target.value)}
          placeholder="e.g., You are a helpful assistant that always responds in a friendly tone..."
          className="w-full min-h-[200px] p-3 bg-background border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
        />

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
}
