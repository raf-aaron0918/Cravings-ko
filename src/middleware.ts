import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Define protected admin routes
  if (pathname.startsWith('/admin')) {
    // 2. Allow the login page itself
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    // 3. Check for admin_auth cookie
    const authCookie = request.cookies.get('admin_auth');

    if (!authCookie || authCookie.value !== 'true') {
      // 4. Redirect to login if not authenticated
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/admin/:path*'],
};
