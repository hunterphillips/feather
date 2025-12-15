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

export interface ModelCapabilities {
  supportsVision: boolean;
  maxFileSize: number; // in bytes
}

export const MODEL_CAPABILITIES: Record<
  string,
  Record<string, ModelCapabilities>
> = {
  openai: {
    'gpt-5.1': {
      supportsVision: true,
      maxFileSize: 20_000_000,
    },
    'gpt-5-mini': {
      supportsVision: true,
      maxFileSize: 20_000_000,
    },
    'gpt-4.1': {
      supportsVision: true,
      maxFileSize: 20_000_000,
    },
    'gpt-4.1-mini': {
      supportsVision: true,
      maxFileSize: 20_000_000,
    },
  },
  anthropic: {
    'claude-opus-4-5': {
      supportsVision: true,
      maxFileSize: 10_000_000,
    },
    'claude-opus-4-1': {
      supportsVision: true,
      maxFileSize: 10_000_000,
    },
    'claude-sonnet-4': {
      supportsVision: true,
      maxFileSize: 10_000_000,
    },
    'claude-haiku-4-5': {
      supportsVision: true,
      maxFileSize: 10_000_000,
    },
  },
  google: {
    'gemini-3-pro-preview': {
      supportsVision: true,
      maxFileSize: 20_000_000,
    },
    'gemini-2.5-pro': {
      supportsVision: true,
      maxFileSize: 20_000_000,
    },
    'gemini-2.5-flash': {
      supportsVision: true,
      maxFileSize: 10_000_000,
    },
    'gemini-2.5-flash-lite': {
      supportsVision: false,
      maxFileSize: 0,
    },
  },
};

export function getModelCapabilities(
  provider: string,
  model: string
): ModelCapabilities {
  return (
    MODEL_CAPABILITIES[provider]?.[model] || {
      supportsVision: false,
      maxFileSize: 0,
    }
  );
}
