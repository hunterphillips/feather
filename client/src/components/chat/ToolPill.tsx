import { X, Settings } from 'lucide-react';
import { getIconComponent } from '@/lib/icon-utils';
import type { ToolPillProps } from '@/lib/types';
import { toolRegistry } from '@/lib/tool-registry';

export function ToolPill({ tool, onRemove, onConfigClick }: ToolPillProps) {
  const metadata = toolRegistry.getMetadata(tool.id);
  const IconComponent = getIconComponent(metadata.icon);
  const showConfig = metadata.showConfigButton && onConfigClick;

  return (
    <div className="flex gap-2">
      {/* Main pill with hover-to-X behavior */}
      <button
        type="button"
        onClick={onRemove}
        className="group inline-flex items-center gap-2 px-3 py-1.5 bg-accent border border-border rounded-full text-xs text-foreground hover:bg-accent/80 transition-colors"
      >
        <div className="relative w-3 h-3">
          <IconComponent className="h-3 w-3 absolute inset-0 opacity-100 group-hover:opacity-0 transition-opacity" />
          <X className="h-3 w-3 absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <span>{tool.label}</span>
      </button>

      {/* Optional config button */}
      {showConfig && (
        <button
          type="button"
          onClick={onConfigClick}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent border border-border rounded-full text-xs text-foreground hover:bg-accent/80 transition-colors"
        >
          <Settings className="h-3 w-3" />
          <span>{metadata.configButtonLabel}</span>
        </button>
      )}
    </div>
  );
}
