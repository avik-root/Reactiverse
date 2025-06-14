
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_AUTH_COOKIE_NAME = 'admin-auth-token';
const ADMIN_LOGIN_URL = '/admin/login';
const ADMIN_DASHBOARD_URL = '/admin/dashboard';
const ADMIN_CREATE_ACCOUNT_URL = '/admin/create-account';
// The /admin path itself redirects, so it should be treated like a public path for initial access.
const PUBLIC_ADMIN_PATHS = [ADMIN_LOGIN_URL, ADMIN_CREATE_ACCOUNT_URL, '/admin', '/admin/'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminAuthToken = request.cookies.get(ADMIN_AUTH_COOKIE_NAME);

  // If trying to access a protected admin path (any /admin/** route not in PUBLIC_ADMIN_PATHS)
  if (pathname.startsWith('/admin') && !PUBLIC_ADMIN_PATHS.includes(pathname)) {
    if (!adminAuthToken) {
      // No token, redirect to login
      return NextResponse.redirect(new URL(ADMIN_LOGIN_URL, request.url));
    }
    // Token exists, allow access to protected admin path
    return NextResponse.next();
  }

  // If trying to access public admin paths (login, create-account, or root admin page)
  if (PUBLIC_ADMIN_PATHS.includes(pathname)) {
    if (adminAuthToken && (pathname === ADMIN_LOGIN_URL || pathname === ADMIN_CREATE_ACCOUNT_URL)) {
      // Has token and trying to access login/create, redirect to dashboard
      return NextResponse.redirect(new URL(ADMIN_DASHBOARD_URL, request.url));
    }
    // No token, or on /admin root with token (let the page itself handle redirection), allow access
    return NextResponse.next();
  }

  // For any other paths not starting with /admin (though matcher should only trigger for /admin/:path*)
  // This case should ideally not be hit if the matcher is specific enough.
  return NextResponse.next();
}

export const config = {
  // Matcher for all routes under /admin, including the root /admin path itself.
  matcher: '/admin/:path*',
};
