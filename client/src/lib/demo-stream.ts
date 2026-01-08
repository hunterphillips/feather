import type { Message } from '@ai-sdk/react';

/**
 * Generates fake streaming responses that mimic AI SDK format
 * Returns canned responses based on message content
 */

const DEMO_RESPONSES = [
  {
    trigger: ['hello', 'hi', 'hey', 'greet'],
    response: `Hi! 👋

I'm a **demo version** of Feather - a lightweight chat interface for AI workflows.

To use a model provider, download Feather from GitHub and run it locally with your own API keys.

**[Get Feather on GitHub →](https://github.com/hunterphillips/feather)**`,
  },
  {
    trigger: ['what', 'how', 'can you', 'features', 'capabilities'],
    response: `Great question! In the full version of Feather, you can:

- Chat with OpenAI, Anthropic, and Google models
- Use custom system prompts (Instructions tool)
- Upload files and images (vision models)
- Run workflows like consensus mode (query multiple models at once)
- Store chat history locally with LowDB

**[Get Feather on GitHub →](https://github.com/hunterphillips/feather)**`,
  },
  {
    trigger: ['consensus', 'workflow', 'multiple models', 'tools'],
    response: `Feather's **Consensus Mode** is really cool! It:

1. Queries multiple AI models in parallel
2. Collects all their responses
3. Uses a synthesizer model to combine insights
4. Gives you the best answer from all perspectives

You can try it yourself by downloading Feather and adding your API keys.

**[Get Feather on GitHub →](https://github.com/hunterphillips/feather)**`,
  },
  {
    trigger: ['default'],
    response: `Thanks for trying Feather! This is a **demo version** with simulated responses.

The real version lets you chat with models from OpenAI, Anthropic, and Google using your own API keys.  

**Features:**
- 📋 Instructions: per chat custom instructions modifier
- 👥 Consensus: multi-model query with synthesized response 
- 💾 Local data storage   

**[Download Feather on GitHub →](https://github.com/hunterphillips/feather)**

Try asking me about features or custom tools included with Feather!`,
  },
];

export function getDemoResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();

  // Find matching response based on triggers
  for (const { trigger, response } of DEMO_RESPONSES) {
    if (trigger.some((t) => lowerMessage.includes(t))) {
      return response;
    }
  }

  // Default response
  return DEMO_RESPONSES.find((r) => r.trigger.includes('default'))!.response;
}

/**
 * Creates a fake readable stream that mimics AI SDK streaming format
 */
export function createFakeStream(message: string): ReadableStream<Uint8Array> {
  const response = getDemoResponse(message);
  const encoder = new TextEncoder();
  let index = 0;

  return new ReadableStream({
    async start(controller) {
      // Simulate typing effect - send chunks character by character
      while (index < response.length) {
        // Send 2-5 characters at a time for more natural typing
        const chunkSize = Math.floor(Math.random() * 4) + 2;
        const chunk = response.slice(index, index + chunkSize);

        // Format as AI SDK data stream protocol
        const dataChunk = `0:${JSON.stringify(chunk)}\n`;
        controller.enqueue(encoder.encode(dataChunk));

        index += chunkSize;

        // Random delay between 20-80ms for natural typing
        await new Promise((resolve) =>
          setTimeout(resolve, Math.random() * 60 + 20)
        );
      }

      // Send completion message (AI SDK format)
      controller.enqueue(encoder.encode('d:{"finishReason":"stop"}\n'));
      controller.close();
    },
  });
}

/**
 * Handles demo mode message submission
 * Creates user message, streams fake assistant response, and updates message state
 */
export async function handleDemoSubmit(
  input: string,
  setMessages: (updater: (prev: Message[]) => Message[]) => void,
  setInput: (value: string) => void
): Promise<void> {
  if (!input.trim()) return;

  const userMessage = {
    id: crypto.randomUUID(),
    role: 'user' as const,
    content: input,
    createdAt: new Date(),
  };

  const assistantMessage = {
    id: crypto.randomUUID(),
    role: 'assistant' as const,
    content: '',
    createdAt: new Date(),
  };

  // Add user message immediately
  setMessages((prev) => [...prev, userMessage]);
  setInput('');

  // Stream fake response
  const stream = createFakeStream(input);
  const reader = stream.getReader();
  const decoder = new TextDecoder();

  try {
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.startsWith('0:')) {
          // Extract text content and unescape
          try {
            const jsonString = line.slice(2); // Get the part after "0:"
            const text = JSON.parse(jsonString); // Parse as JSON string
            assistantMessage.content += text;
          } catch (e) {
            // Fallback if JSON.parse fails
            const text = line.slice(2).replace(/^"|"$/g, '');
            assistantMessage.content += text;
          }
          // Update messages to show streaming effect
          setMessages((prev) => {
            const existing = prev.find((m) => m.id === assistantMessage.id);
            if (existing) {
              return prev.map((m) =>
                m.id === assistantMessage.id ? { ...assistantMessage } : m
              );
            } else {
              return [...prev, assistantMessage];
            }
          });
        }
      }
    }
  } catch (error) {
    console.error('Demo stream error:', error);

    // Fallback: Set the full response immediately without streaming
    if (!assistantMessage.content) {
      assistantMessage.content = getDemoResponse(input);
    }

    // Ensure the message is added/updated
    setMessages((prev) => {
      const existing = prev.find((m) => m.id === assistantMessage.id);
      if (existing) {
        return prev.map((m) =>
          m.id === assistantMessage.id ? { ...assistantMessage } : m
        );
      } else {
        return [...prev, assistantMessage];
      }
    });
  }
}
