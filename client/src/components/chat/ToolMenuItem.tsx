import { getIconComponent } from '@/lib/icon-utils';
import type { Tool } from '@/lib/types';
import { toolRegistry } from '@/lib/tool-registry';

interface ToolMenuItemProps {
  tool: Tool;
  onClick: () => void;
}

export function ToolMenuItem({ tool, onClick }: ToolMenuItemProps) {
  const metadata = toolRegistry.getMetadata(tool.id);
  const IconComponent = getIconComponent(metadata.icon);

  return (
    <button
      onClick={onClick}
      className="group w-full flex flex-col items-start gap-1 px-4 py-3 hover:bg-border transition-colors text-left"
    >
      <div className="flex items-center gap-3">
        <IconComponent className="h-4 w-4 text-foreground" />
        <span className="text-sm text-foreground">{tool.label}</span>
      </div>
      {metadata.description && (
        <p className="text-xs text-muted-foreground text-left max-h-0 opacity-0 overflow-hidden transition-all duration-500 ease-in-out group-hover:max-h-20 group-hover:opacity-100 group-hover:delay-1000 delay-0">
          {metadata.description}
        </p>
      )}
    </button>
  );
}
