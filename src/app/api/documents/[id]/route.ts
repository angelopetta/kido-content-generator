import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';
import { Document } from '@/lib/db/models';
import { requireSession } from '@/lib/auth/session';
import { successResponse, errorResponse } from '@/lib/utils/api-response';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSession();
    await connectToDatabase();

    const { id } = await params;
    const doc = await Document.findById(id)
      .populate('uploadedBy', 'name email')
      .lean();

    if (!doc) {
      return errorResponse('Document not found', 404);
    }

    return successResponse(doc);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }
    console.error('Document get error:', error);
    return errorResponse('Failed to fetch document');
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireSession();
    if (user.role === 'viewer') {
      return errorResponse('Viewers cannot delete documents', 403);
    }

    const { id } = await params;
    await connectToDatabase();

    const doc = await Document.findById(id);
    if (!doc) {
      return errorResponse('Document not found', 404);
    }

    if (user.role === 'editor' && doc.uploadedBy.toString() !== user.id) {
      return errorResponse('Editors can only delete their own documents', 403);
    }

    await Document.findByIdAndDelete(id);
    return successResponse({ deleted: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }
    console.error('Document delete error:', error);
    return errorResponse('Failed to delete document');
  }
}
