import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');

  // 1. Define protected admin routes
  if (pathname.startsWith('/admin')) {
    // 2. Allow the login page itself
    if (pathname === '/admin/login') {
      return response;
    }

    // 3. Check for admin_auth cookie
    const authCookie = request.cookies.get('admin_auth');

    if (!authCookie || authCookie.value !== 'true') {
      // 4. Redirect to login if not authenticated
      const loginUrl = new URL('/admin/login', request.url);
      const redirectResponse = NextResponse.redirect(loginUrl);
      redirectResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      redirectResponse.headers.set('Pragma', 'no-cache');
      redirectResponse.headers.set('Expires', '0');
      return redirectResponse;
    }
  }

  return response;
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/admin/:path*'],
};
