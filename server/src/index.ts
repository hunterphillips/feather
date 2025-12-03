import express from 'express';
import cors from 'cors';
import { streamText } from 'ai';
import { config, validateProviderConfig } from './config.js';
import { getProvider, AVAILABLE_MODELS } from './providers.js';
import type { ChatRequest } from './types.js';

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Get available models
app.get('/api/models', (req, res) => {
  res.json(AVAILABLE_MODELS);
});

// Main chat endpoint with streaming
app.post('/api/chat', async (req, res) => {
  try {
    const { provider, model, messages } = req.body as ChatRequest;

    // Validation
    if (!provider || !model || !messages) {
      res.status(400).json({ error: 'Missing required fields: provider, model, or messages' });
      return;
    }

    if (!validateProviderConfig(provider)) {
      res.status(400).json({
        error: `Provider "${provider}" not configured. Check server environment variables.`,
      });
      return;
    }

    // Get provider instance
    const providerInstance = getProvider(provider, model);

    // Stream response using Vercel AI SDK
    const result = await streamText({
      model: providerInstance,
      messages: messages,
    });

    // Use Vercel Data Stream Protocol (compatible with useChat hook)
    result.pipeDataStreamToResponse(res);
  } catch (error) {
    console.error('Chat error:', error);

    if (!res.headersSent) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }
});

app.listen(config.port, () => {
  console.log(`Feather server running on http://localhost:${config.port}`);
  console.log('\nConfigured providers:');
  console.log(`  - OpenAI: ${config.openai.apiKey ? '✓' : '✗'}`);
  console.log(`  - Anthropic: ${config.anthropic.apiKey ? '✓' : '✗'}`);
  console.log(`  - Google: ${config.google.apiKey ? '✓' : '✗'}`);
  console.log(`  - Ollama: ${config.ollama.baseURL ? '✓' : '✗'}`);
});
