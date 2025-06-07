
import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';

// Read REALM from environment variables as requested.
// It's assumed .env.local or other environment configuration will provide this.
const REALM = process.env.REALM;

export async function GET() {
  if (!REALM) {
    console.error("REALM environment variable is not set.");
    return NextResponse.json({ message: "Server configuration error: REALM environment variable is not set." }, { status: 500 });
  }

  try {
    // Changed to turnadmin -L as per request
    const output = execSync(`turnadmin -L`).toString();
    const usernames = output.split('\n').map(u => u.trim()).filter(u => u.length > 0);
    // Continue to associate users with the configured REALM for API response consistency
    const users = usernames.map(username => ({ username, realm: REALM }));
    return NextResponse.json(users);
  } catch (error: any) {
    console.error("Failed to list users:", error);
    return NextResponse.json({ message: "Failed to list users.", error: error.message, stderr: error.stderr?.toString() }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!REALM) {
    console.error("REALM environment variable is not set.");
    return NextResponse.json({ message: "Server configuration error: REALM environment variable is not set." }, { status: 500 });
  }

  let usernameFromRequest: string | undefined;

  try {
    const body = await request.json();
    usernameFromRequest = body.username;
    const password = body.password;

    if (!usernameFromRequest || !password) {
      return NextResponse.json({ message: "Username and password are required." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters long." }, { status: 400 });
    }
    // Added -k flag as per request
    execSync(`turnadmin -a -u "${usernameFromRequest}" -p "${password}" -r "${REALM}" -k`);
    return NextResponse.json({ message: `User '${usernameFromRequest}' added successfully to realm '${REALM}'.` }, { status: 201 });
  } catch (error: any) {
    console.error(`Failed to add user '${usernameFromRequest}':`, error);
    const stderr = error.stderr?.toString();
    if (usernameFromRequest && stderr && (stderr.includes("user already exists") || stderr.includes("already exists"))) {
        return NextResponse.json({ message: `User '${usernameFromRequest}' already exists in realm '${REALM}'.`}, { status: 409 });
    }
    const errorMessage = usernameFromRequest ? `Failed to add user '${usernameFromRequest}'.` : "Failed to add user.";
    return NextResponse.json({ message: errorMessage, error: error.message, stderr }, { status: 500 });
  }
}

// DELETE handler removed from here, will be in app/api/users/[username]/route.ts
