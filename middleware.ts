
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie'; // For clearing cookie

const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'admin-auth-token';
const JWT_SECRET = process.env.JWT_SECRET;

// API routes that are protected by JWT authentication
const protectedApiRoutes = [
  '/api/users', // Covers /api/users for POST and GET (list)
  '/api/users/', // To catch /api/users/[username] by startsWith
  '/api/status',
  '/api/logs',
  // '/api/control', // Old route, new ones below
  '/api/start',
  '/api/stop',
  '/api/restart',
  '/api/coturn-check',
  // Note: /api/me is used for auth check, so it's implicitly protected by its own logic (returns 401 if no valid token)
  // and doesn't need to be in this list for the purpose of early 401 by middleware if token is totally absent.
  // However, if a token is present but invalid, /api/me handles clearing it.
  // Public API routes like /api/login, /api/logout are not in this list.
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the current path is one of the explicitly protected API routes
  // Note: For /api/users/[username], ensure the check is correct.
  // '/api/users/' will match /api/users/anything
  const isProtectedApiRoute = protectedApiRoutes.some(route => {
    if (route.endsWith('/')) { // For routes like '/api/users/' to match '/api/users/foo'
        return pathname.startsWith(route);
    }
    return pathname === route; // For exact matches like '/api/status'
  });


  if (isProtectedApiRoute) {
    if (!JWT_SECRET) {
      console.error('CRITICAL: JWT_SECRET is not set in environment variables. API routes cannot be secured.');
      return NextResponse.json({ message: 'Server configuration error: JWT_SECRET missing.' }, { status: 500 });
    }

    const cookie = request.cookies.get(AUTH_COOKIE_NAME);

    if (!cookie || !cookie.value) {
      return NextResponse.json({ message: 'Authentication required. Token not found.' }, { status: 401 });
    }

    try {
      jwt.verify(cookie.value, JWT_SECRET);
      // Token is valid, proceed to the API route
      return NextResponse.next();
    } catch (err) {
      // Token is invalid (e.g., expired, malformed)
      console.warn('JWT verification failed in middleware for protected API route:', err instanceof Error ? err.message : String(err));
      
      // Clear the invalid cookie
      const clearCookieHeader = serialize(AUTH_COOKIE_NAME, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: new Date(0), 
        path: '/',
        sameSite: 'strict',
      });
      
      return NextResponse.json({ message: 'Authentication failed. Invalid or expired token.' }, { 
        status: 401,
        headers: { 'Set-Cookie': clearCookieHeader }
      });
    }
  }

  // For all other routes (including /api/login, /api/logout, /api/me, and all page routes),
  // let them pass through. Page protection is handled by useAuth hook in AdminLayout.
  // /api/me handles its own auth check and cookie clearing if token is invalid.
  return NextResponse.next();
}

// The matcher ensures this middleware runs for all API routes.
// The logic within the middleware then determines if a specific API route is protected.
export const config = {
  matcher: [
    '/api/:path*',
  ],
};
