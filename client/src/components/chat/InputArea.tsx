import React from 'react';
import { Button } from '@/components/ui/button';
import { Square } from 'lucide-react';
import { InputMenu } from './InputMenu';
import { ToolPill } from './ToolPill';
import { toolRegistry } from '@/lib/tool-registry';
import { useConfigStore } from '@/store/config-store';
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
  const [activePanelToolId, setActivePanelToolId] = React.useState<
    string | null
  >(null);
  const [activeConfigToolId, setActiveConfigToolId] = React.useState<
    string | null
  >(null);
  const { tools, toggleTool } = useConfigStore();

  const enabledTools = tools.filter((t) => t.enabled);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleRemoveTool = (toolId: string) => {
    toggleTool(toolId, false);
  };

  const handleOpenConfig = (toolId: string) => {
    setActiveConfigToolId(toolId);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="p-4 bg-background">
        <div className="max-w-3xl mx-auto space-y-2">
          <div className="flex gap-2 bg-accent/50 rounded-lg p-4 items-end">
            {/* Plus Menu */}
            <InputMenu onOpenPanel={setActivePanelToolId} />

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
            {enabledTools.map((tool) => {
              const PillComponent =
                toolRegistry.getPillComponent(tool.id) || ToolPill;
              const hasConfig = !!toolRegistry.getConfigComponent(tool.id);

              return (
                <div key={tool.id} className="relative">
                  <PillComponent
                    tool={tool}
                    onRemove={() => handleRemoveTool(tool.id)}
                    onConfigClick={
                      hasConfig ? () => handleOpenConfig(tool.id) : undefined
                    }
                  />

                  {/* Render config dropdown if active */}
                  {activeConfigToolId === tool.id &&
                    (() => {
                      const ConfigComponent = toolRegistry.getConfigComponent(
                        tool.id
                      );
                      return ConfigComponent ? (
                        <ConfigComponent
                          tool={tool}
                          isOpen={true}
                          onClose={() => setActiveConfigToolId(null)}
                        />
                      ) : null;
                    })()}
                </div>
              );
            })}
          </div>
        </div>
      </form>

      {/* Render active panel */}
      {activePanelToolId &&
        (() => {
          const tool = tools.find((t) => t.id === activePanelToolId);
          const PanelComponent =
            tool && toolRegistry.getPanelComponent(tool.id);
          return PanelComponent ? (
            <PanelComponent
              tool={tool}
              isOpen={true}
              onClose={() => setActivePanelToolId(null)}
            />
          ) : null;
        })()}
    </>
  );
}
