import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';
import { PromptTemplate } from '@/lib/db/models';
import { requireSession } from '@/lib/auth/session';
import { successResponse, errorResponse } from '@/lib/utils/api-response';

export async function GET() {
  try {
    await requireSession();
    await connectToDatabase();

    const templates = await PromptTemplate.find()
      .sort({ contentType: 1, isDefault: -1 })
      .lean();

    return successResponse(templates);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }
    console.error('Templates list error:', error);
    return errorResponse('Failed to fetch templates');
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireSession();
    if (user.role !== 'admin') {
      return errorResponse('Only admins can create templates', 403);
    }

    const body = await req.json();
    await connectToDatabase();

    const template = await PromptTemplate.create({
      ...body,
      isDefault: false,
      createdBy: user.id,
    });

    return successResponse(template, 201);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }
    console.error('Template create error:', error);
    return errorResponse('Failed to create template');
  }
}
