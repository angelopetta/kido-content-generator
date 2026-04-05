import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const protectedPaths = [
  '/dashboard',
  '/generate',
  '/content',
  '/documents',
  '/templates',
  '/settings',
];

const protectedApiPaths = [
  '/api/generate',
  '/api/content',
  '/api/documents',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedPage = protectedPaths.some((path) => pathname.startsWith(path));
  const isProtectedApi = protectedApiPaths.some((path) => pathname.startsWith(path));

  if (!isProtectedPage && !isProtectedApi) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request });

  if (!token) {
    if (isProtectedApi) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/generate/:path*',
    '/content/:path*',
    '/documents/:path*',
    '/templates/:path*',
    '/settings/:path*',
    '/api/generate/:path*',
    '/api/content/:path*',
    '/api/documents/:path*',
  ],
};
