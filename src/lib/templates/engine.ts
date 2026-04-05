import { KIDO_CONTEXT } from '@/lib/ai/client';
import type { GenerationParameters, ContentType, SocialPlatform } from '@/types';

interface TemplateContext {
  parameters: GenerationParameters;
  contentType: ContentType;
  sourceArticles: string;
  sourceDigests: string;
  sourceDocuments: string;
  additionalContext?: string;
  socialPlatform?: SocialPlatform;
}

/**
 * Render a prompt template by replacing {{variable}} placeholders with actual values.
 */
export function renderTemplate(template: string, context: TemplateContext): string {
  const variables: Record<string, string> = {
    kidoContext: KIDO_CONTEXT,
    contentType: context.contentType,
    tone: context.parameters.tone,
    audience: context.parameters.audience,
    lengthLevel: context.parameters.lengthLevel,
    keyMessages: context.parameters.keyMessages.length > 0
      ? context.parameters.keyMessages.map((m, i) => `${i + 1}. ${m}`).join('\n')
      : 'None specified',
    position: context.parameters.position || 'Not specified',
    sourceArticles: context.sourceArticles || 'No articles selected.',
    sourceDigests: context.sourceDigests || 'No digests selected.',
    sourceDocuments: context.sourceDocuments || 'No documents selected.',
    additionalContext: context.additionalContext || 'None provided.',
    socialPlatform: context.socialPlatform || 'all platforms',
  };

  let rendered = template;
  for (const [key, value] of Object.entries(variables)) {
    rendered = rendered.replaceAll(`{{${key}}}`, value);
  }

  return rendered;
}

/**
 * Format Intelligence Platform articles into context text for prompts.
 */
export function formatArticlesContext(articles: Array<{
  title: string;
  source: string;
  publishedAt: string;
  summary: string;
  categories?: string[];
  relevanceScore?: number;
}>): string {
  if (articles.length === 0) return '';

  return articles.map((article, i) => {
    const parts = [
      `### Article ${i + 1}: ${article.title}`,
      `**Source:** ${article.source} | **Published:** ${article.publishedAt}`,
    ];
    if (article.relevanceScore !== undefined) {
      parts.push(`**Relevance:** ${article.relevanceScore}/100`);
    }
    if (article.categories && article.categories.length > 0) {
      parts.push(`**Categories:** ${article.categories.join(', ')}`);
    }
    parts.push(`\n${article.summary}`);
    return parts.join('\n');
  }).join('\n\n---\n\n');
}

/**
 * Format uploaded documents into context text for prompts.
 */
export function formatDocumentsContext(documents: Array<{
  name: string;
  category: string;
  extractedText: string;
}>): string {
  if (documents.length === 0) return '';

  return documents.map((doc, i) => {
    return [
      `### Document ${i + 1}: ${doc.name}`,
      `**Category:** ${doc.category}`,
      `\n${doc.extractedText}`,
    ].join('\n');
  }).join('\n\n---\n\n');
}
