import type { AvailableModels, Tool } from './types';

export const DEMO_MODELS: AvailableModels = {
  openai: ['gpt-5.1', 'gpt-5-mini', 'gpt-4.1', 'gpt-4.1-mini'],
  anthropic: [
    'claude-opus-4-5',
    'claude-opus-4-1',
    'claude-sonnet-4',
    'claude-haiku-4-5',
  ],
  google: [
    'gemini-3-pro-preview',
    'gemini-2.5-pro',
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
  ],
};

export const DEMO_TOOLS: Tool[] = [
  {
    id: 'instructions',
    label: 'Instructions',
    enabled: false,
    config: {
      prompt: "you're in a bad mood",
    },
  },
  {
    id: 'consensus',
    label: 'Consensus',
    enabled: false,
    isWorkflow: true,
    config: {
      models: [
        {
          provider: 'anthropic',
          model: 'claude-opus-4-5',
        },
        {
          provider: 'google',
          model: 'gemini-3-pro-preview',
        },
        {
          provider: 'openai',
          model: 'gpt-5.1',
        },
      ],
    },
  },
];
