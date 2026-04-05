import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';
import { GeneratedContent } from '@/lib/db/models';
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
    const content = await GeneratedContent.findById(id)
      .populate('createdBy', 'name email')
      .lean();

    if (!content) {
      return errorResponse('Content not found', 404);
    }

    return successResponse(content);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }
    console.error('Content get error:', error);
    return errorResponse('Failed to fetch content');
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireSession();
    if (user.role === 'viewer') {
      return errorResponse('Viewers cannot edit content', 403);
    }

    const { id } = await params;
    const body = await req.json();
    await connectToDatabase();

    const existing = await GeneratedContent.findById(id);
    if (!existing) {
      return errorResponse('Content not found', 404);
    }

    if (user.role === 'editor' && existing.createdBy.toString() !== user.id) {
      return errorResponse('Editors can only edit their own content', 403);
    }

    // Create new version
    const newVersion = {
      version: existing.versions.length + 1,
      content: body.content || existing.content,
      parameters: body.parameters || existing.parameters,
      createdAt: new Date(),
      createdBy: user.id,
      changeNote: body.changeNote,
    };

    existing.versions.push(newVersion);
    existing.content = newVersion.content;
    if (body.parameters) existing.parameters = body.parameters;
    if (body.title) existing.title = body.title;
    await existing.save();

    return successResponse(existing);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }
    console.error('Content update error:', error);
    return errorResponse('Failed to update content');
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireSession();
    await connectToDatabase();

    const { id } = await params;
    const existing = await GeneratedContent.findById(id);
    if (!existing) {
      return errorResponse('Content not found', 404);
    }

    if (user.role === 'editor' && existing.createdBy.toString() !== user.id) {
      return errorResponse('Editors can only delete their own content', 403);
    }
    if (user.role === 'viewer') {
      return errorResponse('Viewers cannot delete content', 403);
    }

    await GeneratedContent.findByIdAndDelete(id);
    return successResponse({ deleted: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }
    console.error('Content delete error:', error);
    return errorResponse('Failed to delete content');
  }
}
