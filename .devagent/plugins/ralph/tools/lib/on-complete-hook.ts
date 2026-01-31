import { spawn } from 'node:child_process';

export type OnCompleteExitReason =
  | 'epic_blocked_or_closed'
  | 'no_ready_tasks'
  | 'max_iterations_reached';

export interface OnCompletePayload {
  status: 'completed' | 'blocked';
  epicId: string;
  iterations: number;
  maxIterations: number;
  exitReason: OnCompleteExitReason;
  durationSec: number;
  branch: string;
  logTail: string;
}

/**
 * Run the on-complete hook with a JSON payload on stdin.
 * Hook failures are logged but do not throw (loop already finished).
 */
export async function runOnCompleteHook(
  hookCommand: string,
  payload: OnCompletePayload
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
      console.warn(`on-complete hook exited with code ${exitCode}`);
    }
  } catch (error) {
    console.warn(
      'on-complete hook failed:',
      error instanceof Error ? error.message : String(error)
    );
  }
}
