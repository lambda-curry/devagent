import { spawn } from 'node:child_process';

export interface OnIterationPayload {
  epicId: string;
  iteration: number;
  maxIterations: number;
  taskId: string;
  taskTitle: string;
  taskStatus: 'completed' | 'failed' | 'blocked';
  tasksCompleted: number;
  tasksRemaining: number;
  iterationDurationSec: number;
}

/**
 * Run the on-iteration hook with a JSON payload on stdin.
 * Uses Node child_process so it works in both Node (tests) and Bun (ralph).
 * Hook failures are logged but do not throw.
 */
export async function runOnIterationHook(
  hookCommand: string,
  payload: OnIterationPayload
): Promise<void> {
  try {
    const payloadStr = JSON.stringify(payload);
    const proc = spawn('sh', ['-c', hookCommand], {
      stdio: ['pipe', 'inherit', 'inherit']
    });
    proc.stdin?.end(payloadStr, 'utf8');
    const exitCode = await new Promise<number | null>((resolve) => {
      proc.on('close', (code) => resolve(code));
    });
    if (exitCode !== 0 && exitCode !== null) {
      console.warn(`on-iteration hook exited with code ${exitCode}`);
    }
  } catch (error) {
    console.warn('on-iteration hook failed:', error instanceof Error ? error.message : String(error));
  }
}
