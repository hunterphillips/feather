import React from 'react';
import { Button } from '@/components/ui/button';
import { Square, X, FileText, Users, Settings } from 'lucide-react';
import { InputMenu } from './InputMenu';
import { SystemPromptPanel } from './SystemPromptPanel';
import { ModelSelectorDropdown } from './ModelSelectorDropdown';
import { useConfigStore } from '@/store/config-store';
// import featherLogo from '@/assets/feather-logo-b.svg';
import birdIcon from '@/assets/bird.png';

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
  const [showModelSelector, setShowModelSelector] = React.useState(false);
  const {
    toggleTool,
    updateToolConfig,
    getToolById,
  } = useConfigStore();

  const consensusTool = getToolById('consensus');
  const instructionsTool = getToolById('instructions');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleRemoveInstructions = async () => {
    // Clear the prompt content and disable the tool
    await updateToolConfig('instructions', { prompt: '' });
    await toggleTool('instructions', false);
  };

  const handleToggleModel = (provider: string, model: string) => {
    if (!consensusTool) return;

    const currentModels =
      (consensusTool.config.models as Array<{
        provider: string;
        model: string;
      }>) || [];
    const modelIndex = currentModels.findIndex(
      (m) => m.provider === provider && m.model === model
    );

    let updatedModels;
    if (modelIndex > -1) {
      // Remove model
      updatedModels = currentModels.filter((_, i) => i !== modelIndex);
    } else {
      // Add model
      updatedModels = [...currentModels, { provider, model }];
    }

    updateToolConfig('consensus', {
      ...consensusTool.config,
      models: updatedModels,
    });
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
              className="flex-1 leading-none resize-none border-0 bg-transparent focus-visible:outline-none text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 min-h-[24px] max-h-[200px] overflow-y-auto"
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
              <Button
                type="submit"
                disabled={!input.trim()}
                className="rounded-full p-0"
              >
                {/* <img src={featherLogo} alt="Send" className="opacity-90 w-[28px]" /> */}
                <img
                  src={birdIcon}
                  alt="Send"
                  className="opacity-90 w-[38px]"
                />
              </Button>
            )}
          </div>

          {/* Active Tools Pills */}
          <div className="flex gap-2">
            {instructionsTool?.enabled && (
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
            )}

            {consensusTool?.enabled && (
              <>
                <button
                  type="button"
                  onClick={() => toggleTool('consensus', false)}
                  className="group inline-flex items-center gap-2 px-3 py-1.5 bg-accent border border-border rounded-full text-xs text-foreground hover:bg-accent/80 transition-colors"
                >
                  <div className="relative w-3 h-3">
                    <Users className="h-3 w-3 absolute inset-0 opacity-100 group-hover:opacity-0 transition-opacity" />
                    <X className="h-3 w-3 absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span>Consensus</span>
                </button>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowModelSelector(!showModelSelector)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent border border-border rounded-full text-xs text-foreground hover:bg-accent/80 transition-colors"
                  >
                    <Settings className="h-3 w-3" />
                    <span>
                      Models (
                      {((consensusTool.config.models as any[]) || []).length})
                    </span>
                  </button>

                  {showModelSelector && (
                    <ModelSelectorDropdown
                      selectedModels={
                        (consensusTool.config.models as any[]) || []
                      }
                      onToggleModel={handleToggleModel}
                      onClose={() => setShowModelSelector(false)}
                    />
                  )}
                </div>
              </>
            )}
          </div>
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
