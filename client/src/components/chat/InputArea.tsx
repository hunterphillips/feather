import { useState, ChangeEvent, FormEvent, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Square } from 'lucide-react';
import { ToolMenu } from './ToolMenu';
import { AttachmentPreview } from './AttachmentPreview';
import { FilePicker } from './FilePicker';
import { ToolPillContainer } from './ToolPillContainer';
import { toolRegistry } from '@/lib/tool-registry';
import { useConfigStore } from '@/store/config-store';
import birdIcon from '@/assets/bird.png';

interface InputAreaProps {
  input: string;
  handleInputChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
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
  const [activePanelToolId, setActivePanelToolId] = useState<string | null>(
    null
  );
  const { tools, pendingFiles, addPendingFile, removePendingFile } =
    useConfigStore();

  const hasFiles = pendingFiles.length > 0;

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleFilesSelected = (files: FileList) => {
    Array.from(files).forEach((file) => addPendingFile(file));
  };

  const getFileId = (file: File) => `${file.name}-${file.lastModified}`;

  return (
    <>
      <form onSubmit={handleSubmit} className="p-4 bg-background">
        <div className="max-w-3xl mx-auto space-y-2">
          <div className="flex flex-col gap-2 bg-accent/50 rounded-lg p-4">
            {/* File Previews */}
            {hasFiles && (
              <div className="flex flex-wrap gap-2 pb-2">
                {pendingFiles.map((file) => (
                  <AttachmentPreview
                    key={getFileId(file)}
                    file={file}
                    onRemove={() => removePendingFile(getFileId(file))}
                  />
                ))}
              </div>
            )}
            <div className="flex gap-2 items-end">
              {/* Tool Menu and File Picker */}
              <div className="flex">
                <FilePicker
                  onFilesSelected={handleFilesSelected}
                  disabled={isLoading}
                />
                <ToolMenu onOpenPanel={setActivePanelToolId} />
              </div>

              <textarea
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                disabled={isLoading}
                rows={1}
                className={`${
                  hasFiles && 'mt-2'
                } flex-1 leading-none resize-none border-0 bg-transparent focus-visible:outline-none text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 min-h-[24px] max-h-[200px] overflow-y-auto`}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${Math.min(
                    target.scrollHeight,
                    200
                  )}px`;
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
                  disabled={!input.trim() && !hasFiles}
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
          </div>

          {/* Active Tools Pills */}
          <ToolPillContainer />
        </div>
      </form>

      {/* Render selected tool panel (popup) */}
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
