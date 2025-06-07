
import { NextResponse } from 'next/server';
import { execSync } from 'child_process';

export async function GET() {
  try {
    // execSync returns a Buffer for stdout if successful (exit code 0)
    const outputBuffer = execSync('systemctl is-active coturn');
    const status = outputBuffer.toString().trim(); // e.g. "active"
    // If command is successful (exit code 0), status is typically "active"
    return NextResponse.json({ success: true, output: status });
  } catch (error: any) {
    // If execSync throws, it's because the command exited with a non-zero status code.
    // error.stdout often contains the actual status string like "inactive", "failed", "activating".
    if (error.stdout) {
      const statusFromError = error.stdout.toString().trim();
      // The API call was successful in determining a status, even if service is "failed" or "inactive"
      return NextResponse.json({ success: true, output: statusFromError });
    }
    // If error.stdout is not informative, log the full error and return a generic server error.
    console.error("Failed to get service status using execSync:", error);
    return NextResponse.json({ 
      success: false,
      output: "unknown",
      message: "Failed to get service status", 
      error: error.message, 
      stderr: error.stderr?.toString() 
    }, { status: 500 });
  }
}
