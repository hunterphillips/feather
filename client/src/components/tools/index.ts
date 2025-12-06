import { toolRegistry } from '@/lib/tool-registry';
import { ToolPill } from '@/components/chat/ToolPill';

// Import tool components and metadata
import { InstructionsPanel, instructionsMetadata } from './instructions';
import { ConsensusConfig, consensusMetadata } from './consensus';

export function initializeToolRegistry() {
  // Register Instructions
  toolRegistry.registerMetadata('instructions', instructionsMetadata);
  toolRegistry.registerComponents('instructions', {
    pill: ToolPill,
    panel: InstructionsPanel,
  });

  // Register Consensus
  toolRegistry.registerMetadata('consensus', consensusMetadata);
  toolRegistry.registerComponents('consensus', {
    pill: ToolPill,
    config: ConsensusConfig,
  });
}
