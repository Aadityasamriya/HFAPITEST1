import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

export async function executeUserCommand(userId: string | number, command: string): Promise<string> {
  const userDir = path.join(os.tmpdir(), `agent_sandbox_${userId}`);
  
  // Ensure the user directory exists
  try {
    await fs.mkdir(userDir, { recursive: true });
  } catch (e) {
    // Ignore error if it exists
  }
  
  try {
    // Run the command inside the user's specific directory
    // Limit execution time to 10 seconds to prevent hanging
    const { stdout, stderr } = await execAsync(command, { 
      cwd: userDir,
      timeout: 10000 
    });
    
    let output = '';
    if (stdout) output += `STDOUT:\n${stdout}\n`;
    if (stderr) output += `STDERR:\n${stderr}\n`;
    
    if (!output) return "Command executed successfully with no output.";
    
    // Truncate output if it's too long
    if (output.length > 2000) {
      output = output.substring(0, 2000) + "\n...[Output truncated]";
    }
    
    return output;
  } catch (e: any) {
    let errorOutput = `Error executing command: ${e.message}\n`;
    if (e.stdout) errorOutput += `STDOUT:\n${e.stdout}\n`;
    if (e.stderr) errorOutput += `STDERR:\n${e.stderr}\n`;
    
    if (errorOutput.length > 2000) {
      errorOutput = errorOutput.substring(0, 2000) + "\n...[Output truncated]";
    }
    
    return errorOutput;
  }
}
