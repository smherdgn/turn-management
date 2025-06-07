
import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);
const SERVICE_NAME = "coturn";

export async function POST(request: NextRequest) {
  try {
    const { stdout, stderr } = await execAsync(`sudo systemctl restart \${SERVICE_NAME}`);
     if (stderr) {
      console.warn(`Stderr while restarting \${SERVICE_NAME}: \${stderr}`);
    }
    return NextResponse.json({ 
      success: true, 
      output: stdout.toString().trim() || stderr.toString().trim() || `Service \${SERVICE_NAME} restart command issued successfully.`
    });
  } catch (error: any) {
    console.error(`Failed to restart service \${SERVICE_NAME}:`, error);
    const stderrContent = error.stderr?.toString().trim();
    const stdoutContent = error.stdout?.toString().trim();
    return NextResponse.json({ 
      success: false, 
      output: stderrContent || stdoutContent || "Failed to restart service.",
      error: error.message 
    }, { status: 500 });
  }
}
