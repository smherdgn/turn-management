
import { NextRequest, NextResponse } from 'next/server';
import { serialize } from 'cookie';

const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'admin-auth-token';

export async function GET(request: NextRequest) { 
  const cookie = serialize(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0), // Expire immediately
    path: '/',
    sameSite: 'strict',
  });

  // Redirect to login page after clearing cookie
  const loginUrl = new URL('/login', request.url);
  const response = NextResponse.redirect(loginUrl, { status: 302 });
  response.headers.set('Set-Cookie', cookie);
  
  // The client-side redirect from AdminLayout will handle showing the login page.
  // Here we just ensure the cookie is cleared and can send a JSON response too if needed.
  // For a GET request that is often called via `fetch` from client expecting JSON (like in `useAuth` type flows initially),
  // a JSON response is more standard, and client handles redirect.
  // However, if it's a direct navigation or form submission (less common for logout GET), redirect is fine.
  // Let's return JSON for consistency with other auth APIs. The client will then redirect.
  
  return NextResponse.json({ message: 'Logout successful' }, {
    status: 200,
    headers: { 'Set-Cookie': cookie },
  });
}
