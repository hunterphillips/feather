import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
  },
  google: {
    apiKey: process.env.GOOGLE_API_KEY,
  },
  ollama: {
    baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  },
};

export function validateProviderConfig(provider: string): boolean {
  switch (provider) {
    case 'openai':
      return !!config.openai.apiKey;
    case 'anthropic':
      return !!config.anthropic.apiKey;
    case 'google':
      return !!config.google.apiKey;
    case 'ollama':
      return !!config.ollama.baseURL;
    default:
      return false;
  }
}
