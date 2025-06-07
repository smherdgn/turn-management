
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie'; // For clearing cookie

const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'admin-auth-token';
const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(request: NextRequest) {
  if (!JWT_SECRET) {
    console.error('CRITICAL: JWT_SECRET not set in environment variables.');
    return NextResponse.json({ authenticated: false, message: 'Server configuration error: JWT_SECRET missing.' }, { status: 500 });
  }
  
  const cookie = request.cookies.get(AUTH_COOKIE_NAME);

  if (cookie && cookie.value) {
    try {
      const decoded = jwt.verify(cookie.value, JWT_SECRET) as { email: string; role: string };
      // Token is valid
      return NextResponse.json({ authenticated: true, user: { email: decoded.email, role: decoded.role } }, { status: 200 });
    } catch (error) {
      // Token is invalid (expired, malformed, etc.)
      console.warn('JWT verification failed in /api/me:', error instanceof Error ? error.message : String(error));
      
      const clearCookieHeader = serialize(AUTH_COOKIE_NAME, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: new Date(0), // Expire immediately
        path: '/',
        sameSite: 'strict',
      });

      return NextResponse.json({ authenticated: false, message: 'Invalid or expired session.' }, { 
        status: 401,
        headers: { 'Set-Cookie': clearCookieHeader }
      });
    }
  } else {
    return NextResponse.json({ authenticated: false, message: 'Not authenticated. Token not found.' }, { status: 401 });
  }
}
