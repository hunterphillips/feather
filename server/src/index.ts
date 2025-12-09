import express from 'express';
import cors from 'cors';
import { streamText } from 'ai';
import { config, validateProviderConfig } from './config.js';
import { getProvider, AVAILABLE_MODELS } from './providers.js';
import type { ChatRequest } from './types.js';
import {
  initializeDatabase,
  getConfig,
  updateConfig,
  getTools,
  updateTools,
} from './db/index.js';
import { handleConsensusChat } from './workflows/consensus.js';
import chatsRouter from './routes/chats.js';

export const app = express();

app.use(cors());
app.use(express.json());

// Initialize database
await initializeDatabase();

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Get available models
app.get('/api/models', (req, res) => {
  res.json(AVAILABLE_MODELS);
});

// Get saved configuration
app.get('/api/config', async (req, res) => {
  try {
    const config = await getConfig();
    const tools = await getTools();
    res.json({ ...config, tools });
  } catch (error) {
    console.error('Error fetching config:', error);
    res.status(500).json({ error: 'Failed to fetch configuration' });
  }
});

// Save configuration
app.post('/api/config', async (req, res) => {
  try {
    const { provider, model, tools } = req.body;

    // Validate at least one field is present
    if (!provider && !model && !tools) {
      res.status(400).json({ error: 'No configuration provided' });
      return;
    }

    const updates: any = {};
    if (provider) updates.provider = provider;
    if (model) updates.model = model;

    await updateConfig(updates);

    // Update tools if provided
    if (tools) {
      await updateTools(tools);
    }

    const config = await getConfig();
    const updatedTools = await getTools();
    res.json({ ...config, tools: updatedTools });
  } catch (error) {
    console.error('Error saving config:', error);
    res.status(500).json({ error: 'Failed to save configuration' });
  }
});

// Mount chat routes
app.use('/api/chats', chatsRouter);

// Main chat endpoint with streaming
app.post('/api/chat', async (req, res) => {
  try {
    const { provider, model, messages, systemContext } =
      req.body as ChatRequest;

    // Validation
    if (!provider || !model || !messages) {
      res.status(400).json({
        error: 'Missing required fields: provider, model, or messages',
      });
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
      ...(systemContext && { system: systemContext }),
    });

    // Use Vercel Data Stream Protocol (compatible with useChat hook)
    result.pipeDataStreamToResponse(res);
  } catch (error) {
    console.error('Chat error:', error);

    if (!res.headersSent) {
      res.status(500).json({
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }
});

// Consensus workflow endpoint
app.post('/api/workflow/consensus', handleConsensusChat);

// Only start server if not imported by tests
if (import.meta.url === `file://${process.argv[1]}`) {
  app.listen(config.port, () => {
    console.log(`Feather server running on http://localhost:${config.port}`);
  });
}
