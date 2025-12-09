import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { config } from './config.js';

// Create provider instances with API keys
const openaiProvider = createOpenAI({
  apiKey: config.openai.apiKey,
});

const anthropicProvider = createAnthropic({
  apiKey: config.anthropic.apiKey,
});

const googleProvider = createGoogleGenerativeAI({
  apiKey: config.google.apiKey,
});

export function getProvider(providerName: string, model: string) {
  switch (providerName) {
    case 'openai':
      return openaiProvider(model);
    case 'anthropic':
      return anthropicProvider(model);
    case 'google':
      return googleProvider(model);
    default:
      throw new Error(`Unsupported provider: ${providerName}`);
  }
}

export const AVAILABLE_MODELS = {
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
