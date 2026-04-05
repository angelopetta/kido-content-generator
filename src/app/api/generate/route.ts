import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';
import { PromptTemplate, GeneratedContent, Document } from '@/lib/db/models';
import { generateContentStream } from '@/lib/ai/client';
import { renderTemplate, formatDocumentsContext } from '@/lib/templates/engine';
import { requireSession } from '@/lib/auth/session';
import { errorResponse } from '@/lib/utils/api-response';
import type { GenerateRequest } from '@/types';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const user = await requireSession();
    if (user.role === 'viewer') {
      return errorResponse('Viewers cannot generate content', 403);
    }

    const body = (await req.json()) as GenerateRequest;
    const {
      contentType,
      parameters,
      sources,
      templateId,
      additionalContext,
      socialPlatform,
    } = body;

    if (!contentType || !parameters) {
      return errorResponse('contentType and parameters are required', 400);
    }

    await connectToDatabase();

    // Load template
    const template = templateId
      ? await PromptTemplate.findById(templateId)
      : await PromptTemplate.findOne({ contentType, isDefault: true });

    if (!template) {
      return errorResponse(`No template found for content type: ${contentType}`, 404);
    }

    // Load selected documents
    let sourceDocumentsText = '';
    if (sources?.documentIds && sources.documentIds.length > 0) {
      const docs = await Document.find({ _id: { $in: sources.documentIds } });
      sourceDocumentsText = formatDocumentsContext(
        docs.map((d) => ({
          name: d.name,
          category: d.category,
          extractedText: d.extractedText,
        }))
      );
    }

    // TODO: Fetch articles and digests from Intelligence Platform API (Phase 2)
    const sourceArticlesText = '';
    const sourceDigestsText = '';

    const context = {
      parameters,
      contentType,
      sourceArticles: sourceArticlesText,
      sourceDigests: sourceDigestsText,
      sourceDocuments: sourceDocumentsText,
      additionalContext,
      socialPlatform,
    };

    const systemPrompt = renderTemplate(template.systemPrompt, context);
    const userPrompt = renderTemplate(template.userPromptTemplate, context);

    // Stream the response
    const stream = generateContentStream({
      systemPrompt,
      userPrompt,
      maxTokens: parameters.lengthLevel === 'detailed' ? 8192 : parameters.lengthLevel === 'standard' ? 4096 : 2048,
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'X-Content-Type': contentType,
        'X-Template-Id': template._id.toString(),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }
    console.error('Generation error:', error);
    return errorResponse('Content generation failed');
  }
}
