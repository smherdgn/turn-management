
import { NextRequest, NextResponse } from 'next/server';
import { serialize } from 'cookie';
import jwt from 'jsonwebtoken';
import fs from 'fs/promises';
import path from 'path';
// Removed import process from 'process';

const JWT_SECRET = process.env.JWT_SECRET;
const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'admin-auth-token';
const USER_DB_PATH = process.env.USER_DB_PATH || 'data/users.json';

interface User {
  email: string;
  passwordHash: string; // IMPORTANT: In a real app, this should be a bcrypt hash.
  role: string;
}

async function getUsers(): Promise<User[]> {
  try {
    const filePath = path.join((process as NodeJS.Process).cwd(), USER_DB_PATH);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error: any) {
    console.error(`Error reading user database at ${USER_DB_PATH}:`, error.message);
    // If the file doesn't exist or is malformed, throw an error.
    // The admin should ensure users.json is correctly set up.
    throw new Error(`Could not read user database. Please check server configuration and ensure '${USER_DB_PATH}' exists and is valid JSON.`);
  }
}

export async function POST(request: NextRequest) {
  if (!JWT_SECRET) {
    console.error('CRITICAL: JWT_SECRET is not set in environment variables.');
    return NextResponse.json({ message: 'Server configuration error: JWT_SECRET missing.' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
    }

    const users = await getUsers();
    const user = users.find(u => u.email === email);

    // IMPORTANT: Plain text password comparison. In a real application, use bcrypt.compareSync().
    if (user && user.passwordHash === password) {
      const payload = { email: user.email, role: user.role };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

      const cookie = serialize(AUTH_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // 1 day in seconds
        path: '/',
        sameSite: 'strict',
      });

      return NextResponse.json({ message: 'Login successful' }, {
        status: 200,
        headers: { 'Set-Cookie': cookie },
      });
    } else {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }
  } catch (error: any) {
    console.error('Login error:', error.message);
    if (error.message.startsWith('Could not read user database')) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'An error occurred during login.' }, { status: 500 });
  }
}
