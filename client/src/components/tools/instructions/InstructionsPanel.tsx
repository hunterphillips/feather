import { createToolTextModal } from '@/components/chat/ToolTextModal';

export const InstructionsPanel = createToolTextModal({
  title: 'Custom Instructions',
  description:
    'Add instructions that will be included with every message you send.',
  placeholder: 'Enter your instructions here...',
  configKey: 'prompt',
});
