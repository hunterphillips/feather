import { createToolTextPanel } from '@/components/chat/ToolTextPanel';

export const InstructionsPanel = createToolTextPanel({
  title: 'Custom Instructions',
  description:
    'Add instructions that will be included with every message you send.',
  placeholder: 'Enter your instructions here...',
  configKey: 'prompt',
});
