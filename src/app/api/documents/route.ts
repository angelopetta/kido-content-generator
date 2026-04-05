import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';
import { Document } from '@/lib/db/models';
import { parseDocument, validateFileType } from '@/lib/parsers';
import { requireSession } from '@/lib/auth/session';
import { successResponse, errorResponse } from '@/lib/utils/api-response';

export async function GET(req: NextRequest) {
  try {
    await requireSession();
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    const filter: Record<string, unknown> = {};
    if (category) filter.category = category;

    const documents = await Document.find(filter)
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'name email')
      .lean();

    return successResponse(documents);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }
    console.error('Documents list error:', error);
    return errorResponse('Failed to fetch documents');
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireSession();
    if (user.role === 'viewer') {
      return errorResponse('Viewers cannot upload documents', 403);
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const category = (formData.get('category') as string) || 'other';
    const name = formData.get('name') as string;
    const tags = formData.get('tags') as string;

    if (!file) {
      return errorResponse('No file provided', 400);
    }

    if (!validateFileType(file.name)) {
      return errorResponse('Unsupported file type. Supported: PDF, DOCX, TXT', 400);
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const parsed = await parseDocument(buffer, file.name);

    await connectToDatabase();

    // Store extracted text in MongoDB (file content stored as text, not binary)
    const doc = await Document.create({
      name: name || file.name.replace(/\.[^.]+$/, ''),
      originalFilename: file.name,
      fileType: parsed.fileType,
      fileSize: file.size,
      storageKey: `local:${Date.now()}-${file.name}`,
      extractedText: parsed.text,
      category,
      tags: tags ? tags.split(',').map((t) => t.trim()) : [],
      uploadedBy: user.id,
    });

    return successResponse(doc, 201);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }
    console.error('Document upload error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to upload document'
    );
  }
}
