import { streamText } from 'ai';
import { getProvider } from '../providers.js';
import {
  registerWorkflow,
  type WorkflowHandler,
} from '../lib/workflow-router.js';
import type { Message } from '../types.js';

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
 * Execute consensus workflow:
 * 1. Query multiple models in parallel
 * 2. Synthesize responses using one of the models
 * 3. Return streaming result
 * Note: Messages are already converted to multimodal format by the router
 */
export async function executeConsensusWorkflow(params: {
  messages: any[];
  toolConfig: Record<string, unknown>;
  systemContext?: string;
  provider: string;
  model: string;
}) {
  const { messages, toolConfig, systemContext, provider, model } = params;

  // Extract models from tool config
  const models = (toolConfig?.models as ModelConfig[]) || [];

  // Validation
  if (!messages || models.length < 2) {
    throw new Error(
      'Missing required fields or insufficient models (minimum 2 required)'
    );
  }

  if (!provider || !model) {
    throw new Error('Missing synthesizer provider or model');
  }

  // Prepend system context if provided
  let finalMessages = messages;
  if (systemContext) {
    finalMessages = [{ role: 'system', content: systemContext }, ...messages];
  }

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
    throw new Error('All models failed to respond');
  }

  console.log(`${responses.length} models responded successfully`);

  // 4. Extract original user query for context
  const userQuery =
    messages.filter((m: Message) => m.role === 'user').slice(-1)[0]?.content ||
    'Unknown query';

  // 5. Create synthesis prompt with enhanced guidelines
  const synthesisPrompt = `You are synthesizing responses from multiple AI models to provide the best possible answer to the user's query.

<user_query>
${userQuery}
</user_query>

<model_responses>
${responses
  .map(
    (r) => `<model name="${r.provider}:${r.model}">
${r.content}
</model>
`
  )
  .join('\n')}
</model_responses>

Your task: Deliver the BEST answer to the CURRENT user query (shown above in the <user_query> tags) by synthesizing the model responses above.

Guidelines:
- Write as ONE cohesive expert response, not "Model X says... Model Y says..."
- Eliminate redundancy - if models agree on something, state it once (not multiple times with different attributions)
- Only mention a specific model when it provided an insight that was truly unique to that one model (none of the others mentioned it)
- Use model mentions conservatively - if there are many unique insights, only highlight the most valuable ones to avoid overwhelming with references
- Use short names when referring to models (e.g., "GPT-4o", "Claude", "Gemini")
- Be concise and actionable - avoid lengthy preambles, excessive explanations, or filler text
- Your response should generally not be significantly longer than the longest individual model response
- Use clear structure (bullets, headings) when presenting multiple points
- Focus on delivering actionable value - unique model insights should demonstrate why consulting multiple AI perspectives adds value

Provide your synthesized response now.`;

  // 6. Use configured synthesizer model (from ModelSelector)
  const synthesizer = getProvider(provider, model);

  // 7. Stream synthesized response
  const result = await streamText({
    model: synthesizer,
    messages: [{ role: 'user', content: synthesisPrompt }],
  });

  return result;
}

// Register the workflow
registerWorkflow('consensus', executeConsensusWorkflow);
