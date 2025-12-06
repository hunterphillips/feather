import type {
  ToolPillComponent,
  ToolPanelComponent,
  ToolConfigComponent,
  ToolUIMetadata,
} from './types';

interface ToolComponentRegistry {
  pill?: ToolPillComponent;
  panel?: ToolPanelComponent;
  config?: ToolConfigComponent;
}

class ToolRegistry {
  private components = new Map<string, ToolComponentRegistry>();
  private metadata = new Map<string, ToolUIMetadata>();

  registerComponents(toolId: string, components: ToolComponentRegistry) {
    this.components.set(toolId, components);
  }

  registerMetadata(toolId: string, metadata: ToolUIMetadata) {
    this.metadata.set(toolId, metadata);
  }

  getPillComponent(toolId: string): ToolPillComponent | undefined {
    return this.components.get(toolId)?.pill;
  }

  getPanelComponent(toolId: string): ToolPanelComponent | undefined {
    return this.components.get(toolId)?.panel;
  }

  getConfigComponent(toolId: string): ToolConfigComponent | undefined {
    return this.components.get(toolId)?.config;
  }

  getMetadata(toolId: string): ToolUIMetadata {
    return this.metadata.get(toolId) || {
      icon: 'FileText', // Default fallback
    };
  }
}

export const toolRegistry = new ToolRegistry();
