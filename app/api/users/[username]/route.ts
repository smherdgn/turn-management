
import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';

const REALM = process.env.REALM;

export async function DELETE(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  if (!REALM) {
    console.error("REALM environment variable is not set.");
    return NextResponse.json({ message: "Server configuration error: REALM environment variable is not set." }, { status: 500 });
  }

  const usernameToDelete = params.username;

  if (!usernameToDelete) {
    return NextResponse.json({ message: "Username path parameter is required for deletion." }, { status: 400 });
  }

  try {
    // Ensure username is treated as a single argument
    execSync(`turnadmin -d -u "${usernameToDelete}" -r "${REALM}"`);
    return NextResponse.json({ message: `User '${usernameToDelete}' deleted successfully from realm '${REALM}'.` });
  } catch (error: any) {
    console.error(`Failed to delete user '${usernameToDelete}':`, error);
    const stderr = error.stderr?.toString();
     if (stderr && (stderr.includes("user not found") || stderr.includes("does not exist"))) {
        return NextResponse.json({ message: `User '${usernameToDelete}' not found in realm '${REALM}'.`}, { status: 404 });
    }
    return NextResponse.json({ message: `Failed to delete user '${usernameToDelete}'.`, error: error.message, stderr }, { status: 500 });
  }
}
