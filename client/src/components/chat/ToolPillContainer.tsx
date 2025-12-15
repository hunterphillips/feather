import { useState } from 'react';
import { ToolPill } from './ToolPill';
import { toolRegistry } from '@/lib/tool-registry';
import { useConfigStore } from '@/store/config-store';

export function ToolPillContainer() {
  const [activeConfigToolId, setActiveConfigToolId] = useState<string | null>(
    null
  );

  const { tools, toggleTool } = useConfigStore();
  const enabledTools = tools.filter((t) => t.enabled);

  const handleRemoveTool = (toolId: string) => {
    toggleTool(toolId, false);
  };

  const handleOpenConfig = (toolId: string) => {
    setActiveConfigToolId(toolId);
  };

  return (
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
  );
}
