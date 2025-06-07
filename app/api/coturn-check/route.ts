import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

export async function GET() {
  try {
    // Try 'turnserver -V'. This command usually prints version info to stderr.
    const { stdout, stderr } = await execAsync('turnserver -V');
    
    const output = stderr || stdout; // Prefer stderr as version often goes there.

    if (output) {
      // Examples:
      // "Coturn TURN Server version 4.5.2 'dan Eider'"
      // "turnserver version 4.6.2"
      // "RFC 5389/5766/5780/6062/6156 STUN/TURN server" followed by "Version ..." on new line
      const versionMatch = output.match(/version\s*([\d\w.-]+(?:'[^']+')?)/i);

      if (versionMatch && versionMatch[1]) {
        return NextResponse.json({ installed: true, version: versionMatch[1].trim() });
      }
      // If command succeeded but version parse failed, it's installed but version format is unexpected.
      return NextResponse.json({ 
        installed: true, 
        version: "Unknown (installed)", 
        details: `Output: ${output.trim().split('\n')[0]}` // First line of output
      });
    }
    // If 'turnserver -V' produces no output but no error (unlikely for this command), assume not found.
     return NextResponse.json({ 
        installed: false, 
        message: "coturn not found. 'turnserver -V' produced no output." 
      });

  } catch (error: any) {
    // 'turnserver -V' failed (e.g., command not found)
    // error.code might be 127 for command not found.
    // error.stderr might contain "command not found"

    // Fallback: try 'which turnserver' to be absolutely sure.
    try {
      const { stdout: whichStdout } = await execAsync('which turnserver');
      if (whichStdout && whichStdout.trim() !== '') {
        // Executable found, but -V failed. Could be permission issue or incomplete install.
        return NextResponse.json({ 
          installed: true, 
          version: "Unknown (executable found, but -V failed)", 
          details: `turnserver path: ${whichStdout.trim()}. 'turnserver -V' error: ${error.message}`
        });
      }
       // 'which turnserver' also failed or empty output
      return NextResponse.json({ 
        installed: false, 
        message: "coturn not found. 'turnserver -V' failed and 'which turnserver' found nothing.",
        details: `'turnserver -V' error: ${error.message}`
      });
    } catch (whichError: any) {
      // Both commands failed.
      return NextResponse.json({ 
        installed: false, 
        message: "coturn not found. Both 'turnserver -V' and 'which turnserver' failed.",
        details: `'turnserver -V' error: ${error.message}. 'which' error: ${whichError.message}`
      });
    }
  }
}
