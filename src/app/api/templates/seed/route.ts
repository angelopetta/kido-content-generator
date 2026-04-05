import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';
import { PromptTemplate, User } from '@/lib/db/models';
import { DEFAULT_TEMPLATES } from '@/lib/templates/defaults';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import bcrypt from 'bcryptjs';

/**
 * Seed default templates and admin user.
 * GET /api/templates/seed?secret=CRON_SECRET
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');

    if (secret !== process.env.CRON_SECRET) {
      return errorResponse('Invalid secret', 401);
    }

    await connectToDatabase();

    // Create admin user if none exists
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('changeme123', 12);
      adminUser = await User.create({
        name: 'Admin',
        email: 'admin@kido209.ca',
        hashedPassword,
        role: 'admin',
      });
    }

    // Seed default templates
    let seeded = 0;
    for (const tmpl of DEFAULT_TEMPLATES) {
      const exists = await PromptTemplate.findOne({
        contentType: tmpl.contentType,
        isDefault: true,
      });

      if (!exists) {
        await PromptTemplate.create({
          ...tmpl,
          isDefault: true,
          createdBy: adminUser._id,
        });
        seeded++;
      }
    }

    return successResponse({
      message: `Seeded ${seeded} templates. Admin user: ${adminUser.email}`,
      templatesSeeded: seeded,
    });
  } catch (error) {
    console.error('Seed error:', error);
    return errorResponse('Seed failed');
  }
}
