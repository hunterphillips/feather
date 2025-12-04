import React from 'react';
import { Button } from '@/components/ui/button';
import { Send, Square, X, FileText } from 'lucide-react';
import { InputMenu } from './InputMenu';
import { SystemPromptPanel } from './SystemPromptPanel';
import { useConfigStore } from '@/store/config-store';

interface InputAreaProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  onStop: () => void;
}

export function InputArea({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  onStop,
}: InputAreaProps) {
  const [showPromptPanel, setShowPromptPanel] = React.useState(false);
  const { systemPrompt, setSystemPrompt, saveConfig } = useConfigStore();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleRemoveInstructions = async () => {
    setSystemPrompt('');
    await saveConfig({ systemPrompt: '' });
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="p-4 bg-background">
        <div className="max-w-3xl mx-auto space-y-2">
          <div className="flex gap-2 bg-accent/50 rounded-lg p-4 items-end">
            {/* Plus Menu */}
            <InputMenu onAddInstructions={() => setShowPromptPanel(true)} />

            <textarea
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={isLoading}
            rows={1}
            className="flex-1 resize-none border-0 bg-transparent focus-visible:outline-none text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 min-h-[24px] max-h-[200px] overflow-y-auto"
            style={{
              height: 'auto',
              minHeight: '24px',
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
            }}
          />
          {isLoading ? (
            <Button
              type="button"
              onClick={onStop}
              variant="outline"
              className="px-3"
            >
              <Square className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={!input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>

          {/* Active Tools Pills */}
          {systemPrompt && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleRemoveInstructions}
                className="group inline-flex items-center gap-2 px-3 py-1.5 bg-accent border border-border rounded-full text-xs text-foreground hover:bg-accent/80 transition-colors"
              >
                <div className="relative w-3 h-3">
                  <FileText className="h-3 w-3 absolute inset-0 opacity-100 group-hover:opacity-0 transition-opacity" />
                  <X className="h-3 w-3 absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <span>Instructions</span>
              </button>
            </div>
          )}
        </div>
      </form>

      {/* System Prompt Panel */}
      <SystemPromptPanel
        isOpen={showPromptPanel}
        onClose={() => setShowPromptPanel(false)}
      />
    </>
  );
}
