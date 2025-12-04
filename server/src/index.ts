import express from 'express';
import cors from 'cors';
import { streamText } from 'ai';
import { config, validateProviderConfig } from './config.js';
import { getProvider, AVAILABLE_MODELS } from './providers.js';
import type { ChatRequest } from './types.js';
import { initializeDatabase, getConfig, updateConfig } from './db.js';

const app = express();

app.use(cors());
app.use(express.json());

// Initialize database
await initializeDatabase();
console.log('✓ Database initialized');

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
    res.json(config);
  } catch (error) {
    console.error('Error fetching config:', error);
    res.status(500).json({ error: 'Failed to fetch configuration' });
  }
});

// Save configuration
app.post('/api/config', async (req, res) => {
  try {
    const { provider, model, systemPrompt } = req.body;

    // Validate at least one field is present
    if (!provider && !model && systemPrompt === undefined) {
      res.status(400).json({ error: 'No configuration provided' });
      return;
    }

    const updates: any = {};
    if (provider) updates.provider = provider;
    if (model) updates.model = model;
    if (systemPrompt !== undefined) updates.systemPrompt = systemPrompt;

    await updateConfig(updates);
    const config = await getConfig();
    res.json(config);
  } catch (error) {
    console.error('Error saving config:', error);
    res.status(500).json({ error: 'Failed to save configuration' });
  }
});

// Main chat endpoint with streaming
app.post('/api/chat', async (req, res) => {
  try {
    const { provider, model, messages, systemPrompt } = req.body as ChatRequest;

    // Validation
    if (!provider || !model || !messages) {
      res
        .status(400)
        .json({
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

    // Prepend system message if provided
    let processedMessages = messages;
    if (systemPrompt && systemPrompt.trim()) {
      processedMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...messages,
      ];
    }

    // Stream response using Vercel AI SDK
    const result = await streamText({
      model: providerInstance,
      messages: processedMessages,
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

app.listen(config.port, () => {
  console.log(`Feather server running on http://localhost:${config.port}`);
});
