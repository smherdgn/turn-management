
import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';

const SERVICE_NAME = "coturn";

export async function POST(request: NextRequest) {
  let action: string | undefined; 
  try {
    const body = await request.json();
    action = body.action;

    if (!action || !['start', 'stop', 'restart'].includes(action)) {
      return NextResponse.json({ message: "Invalid or missing 'action' in JSON body. Must be 'start', 'stop', or 'restart'." }, { status: 400 });
    }

    execSync(`sudo systemctl ${action} ${SERVICE_NAME}`);
    return NextResponse.json({ message: `Service ${SERVICE_NAME} ${action}ed successfully.` });
  } catch (error: any) {
    const actionTermForLog = (action && ['start', 'stop', 'restart'].includes(action)) ? action : SERVICE_NAME;
    console.error(`Failed to ${actionTermForLog} service:`, error);
    
    return NextResponse.json({ message: `Failed to ${action ? action : 'control'} ${SERVICE_NAME}`, error: error.message, stderr: error.stderr?.toString() }, { status: 500 });
  }
}