import Anthropic from '@anthropic-ai/sdk';

const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514';

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return client;
}

// KIDO organizational context included in all generation prompts
export const KIDO_CONTEXT = `KIDO (Kitchenuhmaykoosib Inninuwug Dibenjikewin Onaakonikewin) is an Indigenous child and family services organization exercising jurisdiction under Bill C-92 (An Act respecting First Nations, Inuit and Métis children, youth and families).

KIDO serves Kitchenuhmaykoosib Inninuwug (KI) First Nation, a remote fly-in community in Northern Ontario within Treaty 9 territory. KI is a member of Nishnawbe Aski Nation (NAN), which represents 49 First Nation communities.

Key principles:
- Indigenous self-governance in child and family services
- The inherent right of self-government (affirmed by the Supreme Court of Canada in 2024)
- Cultural continuity and substantive equality for First Nations children
- Community-based approaches to child welfare
- The rights affirmed in UNDRIP and Bill C-92

Always use respectful, culturally informed language. Reference relevant legislation where appropriate. Maintain KIDO's organizational voice — professional, authoritative, grounded in Indigenous rights and self-determination.`;

export interface GenerateContentOptions {
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
}

/**
 * Generate content using Claude API (non-streaming).
 * All AI calls go through this client — never call the API directly from routes.
 */
export async function generateContent(options: GenerateContentOptions): Promise<string> {
  const anthropic = getClient();
  const { systemPrompt, userPrompt, maxTokens = 4096 } = options;

  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  return textBlock?.text || '';
}

/**
 * Generate content using Claude API with streaming.
 * Returns a ReadableStream for real-time output.
 */
export function generateContentStream(options: GenerateContentOptions): ReadableStream<Uint8Array> {
  const anthropic = getClient();
  const { systemPrompt, userPrompt, maxTokens = 4096 } = options;
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        const stream = anthropic.messages.stream({
          model: CLAUDE_MODEL,
          max_tokens: maxTokens,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        });

        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }

        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}
