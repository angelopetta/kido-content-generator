import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';
import { GeneratedContent } from '@/lib/db/models';
import { requireSession } from '@/lib/auth/session';
import { successResponse, errorResponse } from '@/lib/utils/api-response';

export async function GET(req: NextRequest) {
  try {
    await requireSession();
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const contentType = searchParams.get('contentType');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const filter: Record<string, unknown> = {};
    if (contentType) filter.contentType = contentType;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      GeneratedContent.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('createdBy', 'name email')
        .lean(),
      GeneratedContent.countDocuments(filter),
    ]);

    return successResponse({
      items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }
    console.error('Content list error:', error);
    return errorResponse('Failed to fetch content');
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireSession();
    if (user.role === 'viewer') {
      return errorResponse('Viewers cannot create content', 403);
    }

    const body = await req.json();
    await connectToDatabase();

    const content = await GeneratedContent.create({
      ...body,
      createdBy: user.id,
      versions: [
        {
          version: 1,
          content: body.content,
          parameters: body.parameters,
          createdAt: new Date(),
          createdBy: user.id,
        },
      ],
    });

    return successResponse(content, 201);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }
    console.error('Content create error:', error);
    return errorResponse('Failed to create content');
  }
}
