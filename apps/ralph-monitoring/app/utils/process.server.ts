import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { kill } from 'node:process';

/**
 * Get the PID file path for a given task ID
 * Matches the naming convention in ralph.sh: ${TASK_LOG_DIR}/${taskId}.pid
 */
export function getPidFilePath(taskId: string): string {
  const repoRoot = process.env.REPO_ROOT || process.cwd();
  const logDir = process.env.RALPH_LOG_DIR || join(repoRoot, 'logs', 'ralph');
  return join(logDir, `${taskId}.pid`);
}

/**
 * Check if a PID file exists for a task
 */
export function pidFileExists(taskId: string): boolean {
  const pidPath = getPidFilePath(taskId);
  return existsSync(pidPath);
}

/**
 * Read PID and process group ID from PID file
 * Returns null if file doesn't exist or is invalid
 * Format: First line is PID, second line (optional) is PGID
 */
export function readPidFile(taskId: string): { pid: number; pgid?: number } | null {
  const pidPath = getPidFilePath(taskId);
  
  if (!existsSync(pidPath)) {
    return null;
  }

  try {
    const content = readFileSync(pidPath, 'utf-8');
    const lines = content.trim().split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      return null;
    }

    const pid = parseInt(lines[0], 10);
    if (Number.isNaN(pid)) {
      return null;
    }

    const pgid = lines.length > 1 ? parseInt(lines[1], 10) : undefined;
    if (pgid !== undefined && Number.isNaN(pgid)) {
      return { pid };
    }

    return { pid, pgid };
  } catch (error) {
    console.error(`Failed to read PID file for task ${taskId}:`, error);
    return null;
  }
}

/**
 * Check if a process is still running
 */
export function isProcessRunning(pid: number): boolean {
  try {
    // Signal 0 doesn't kill the process, just checks if it exists
    process.kill(pid, 0);
    return true;
  } catch (_error: unknown) {
    // If error, process doesn't exist or we don't have permission
    return false;
  }
}

/**
 * Stop a process gracefully with SIGTERM, then force kill with SIGKILL if needed
 * Also handles process group if PGID is provided
 * 
 * @param pid Process ID to stop
 * @param pgid Optional process group ID to kill entire group
 * @returns Object with success status and message
 */
export async function stopProcess(pid: number, pgid?: number): Promise<{ success: boolean; message: string }> {
  // Check if process is running
  if (!isProcessRunning(pid)) {
    return { success: false, message: 'Process is not running' };
  }

  try {
    // First, try to kill the process group if PGID is available
    // Use negative PID to signal the process group
    if (pgid !== undefined) {
      try {
        kill(-pgid, 'SIGTERM');
        console.log(`Sent SIGTERM to process group ${pgid}`);
      } catch (error) {
        console.warn(`Failed to kill process group ${pgid}, trying individual process:`, error);
      }
    }

    // Send SIGTERM to the process (graceful shutdown)
    kill(pid, 'SIGTERM');
    console.log(`Sent SIGTERM to process ${pid}`);

    // Wait up to 5 seconds for graceful shutdown
    const maxWait = 5000;
    const checkInterval = 100;
    let waited = 0;

    while (waited < maxWait) {
      if (!isProcessRunning(pid)) {
        return { success: true, message: 'Process stopped gracefully' };
      }
      await new Promise(resolve => setTimeout(resolve, checkInterval));
      waited += checkInterval;
    }

    // If still running, force kill with SIGKILL
    if (isProcessRunning(pid)) {
      console.log(`Process ${pid} did not stop gracefully, sending SIGKILL`);
      
      if (pgid !== undefined) {
        try {
          kill(-pgid, 'SIGKILL');
          console.log(`Sent SIGKILL to process group ${pgid}`);
        } catch (error) {
          console.warn(`Failed to kill process group ${pgid} with SIGKILL:`, error);
        }
      }
      
      kill(pid, 'SIGKILL');
      
      // Give it a moment, then check
      await new Promise(resolve => setTimeout(resolve, 200));
      
      if (!isProcessRunning(pid)) {
        return { success: true, message: 'Process force killed' };
      } else {
        return { success: false, message: 'Failed to stop process (may require manual intervention)' };
      }
    }

    return { success: true, message: 'Process stopped gracefully' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error stopping process ${pid}:`, error);
    return { success: false, message: `Error stopping process: ${errorMessage}` };
  }
}

/**
 * Stop a task process by reading PID from file and terminating it
 * 
 * @param taskId Task ID to stop
 * @returns Object with success status and message
 */
export async function stopTaskProcess(taskId: string): Promise<{ success: boolean; message: string }> {
  const pidInfo = readPidFile(taskId);
  
  if (!pidInfo) {
    return { success: false, message: 'PID file not found or invalid. Task may already be stopped.' };
  }

  const { pid, pgid } = pidInfo;

  if (!isProcessRunning(pid)) {
    return { success: false, message: 'Process is not running (may have already completed)' };
  }

  return await stopProcess(pid, pgid);
}
