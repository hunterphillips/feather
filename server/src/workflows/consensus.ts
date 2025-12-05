import { streamText } from 'ai';
import { getProvider } from '../providers.js';
import type { Message, WorkflowChatRequest } from '../types.js';
import type { Request, Response } from 'express';

interface ModelConfig {
  provider: string;
  model: string;
}

/**
 * Query a single model and return its complete response
 */
async function queryModel(
  provider: string,
  model: string,
  messages: Message[]
): Promise<string> {
  const providerInstance = getProvider(provider, model);

  const result = await streamText({
    model: providerInstance,
    messages: messages,
  });

  // Collect the full text
  const parts = [];
  for await (const part of result.textStream) {
    parts.push(part);
  }

  return parts.join('');
}

/**
 * Handle consensus chat requests:
 * 1. Query multiple models in parallel
 * 2. Synthesize responses using one of the models
 * 3. Stream synthesized response back to client
 */
export async function handleConsensusChat(req: Request, res: Response) {
  try {
    const { messages, toolConfig, systemContext } = req.body;

    // Extract models from tool config
    const models = (toolConfig.models as ModelConfig[]) || [];

    // Validation
    if (!messages || models.length < 2) {
      res.status(400).json({
        error:
          'Missing required fields or insufficient models (minimum 2 required)',
      });
      return;
    }

    // Prepend system context if provided
    let finalMessages = messages;
    if (systemContext) {
      finalMessages = [
        { role: 'system', content: systemContext },
        ...messages,
      ];
    }

    console.log(
      `Consensus query with ${models.length} models:`,
      models.map((m) => `${m.provider}:${m.model}`).join(', ')
    );

    // 1. Query all selected models in parallel (with system context)
    const queries = models.map(({ provider, model }) =>
      queryModel(provider, model, finalMessages)
    );

    const results = await Promise.allSettled(queries);

    // 2. Extract successful responses
    const responses = results
      .map((result, index) => {
        if (result.status === 'fulfilled') {
          return {
            provider: models[index].provider,
            model: models[index].model,
            content: result.value,
          };
        } else {
          console.error(
            `Model ${models[index].provider}:${models[index].model} failed:`,
            result.reason
          );
          return null;
        }
      })
      .filter((r) => r !== null);

    // 3. Handle failures gracefully
    if (responses.length === 0) {
      res.status(500).json({
        error: 'All models failed to respond',
      });
      return;
    }

    console.log(`${responses.length} models responded successfully`);

    // 4. Create synthesis prompt
    const synthesisPrompt = `You are synthesizing responses from multiple AI models. Your task is to create a single, coherent answer that captures the best insights from all responses.

Multiple AI models answered the user's question. Synthesize their responses into one clear, comprehensive answer:

${responses
  .map(
    (r, i) => `### Response ${i + 1} (${r.provider}:${r.model}):\n${r.content}`
  )
  .join('\n\n')}

Provide a synthesized answer that:
- Combines the best insights from all responses
- Resolves any contradictions or differences
- Maintains clarity and coherence
- Doesn't explicitly mention that you're synthesizing (write naturally)`;

    // 5. Use first successful model as synthesizer
    const synthesizer = getProvider(responses[0].provider, responses[0].model);

    // 6. Stream synthesized response
    const result = await streamText({
      model: synthesizer,
      messages: [{ role: 'user', content: synthesisPrompt }],
    });

    // Use Vercel Data Stream Protocol (compatible with useChat hook)
    result.pipeDataStreamToResponse(res);
  } catch (error) {
    console.error('Consensus chat error:', error);

    if (!res.headersSent) {
      res.status(500).json({
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }
}
