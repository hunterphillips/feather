import { createToolTextPanel } from '@/components/chat/ToolTextPanel';

export const InstructionsPanel = createToolTextPanel({
  title: 'Custom Instructions',
  description:
    "Add instructions to adjust the model's tone or behavior for this chat.",
  placeholder: 'Enter your instructions here...',
  configKey: 'prompt',
});
