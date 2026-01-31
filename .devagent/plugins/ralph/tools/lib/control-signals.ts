/**
 * File-based control signals for Ralph execution loop.
 *
 * Signal files are read from a directory (typically repo root):
 * - .ralph_pause   — complete current task, then wait until .ralph_resume appears
 * - .ralph_resume  — continue from paused state (cleared when consumed)
 * - .ralph_skip_<taskId> — mark the given task as skipped and move to next
 */

import { existsSync, readdirSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

export const PAUSE_FILE = '.ralph_pause';
export const RESUME_FILE = '.ralph_resume';
export const SKIP_FILE_PREFIX = '.ralph_skip_';

export interface SignalState {
  pause: boolean;
  resume: boolean;
  skipTaskIds: string[];
}

/**
 * Parse task ID from a skip signal filename.
 * Returns the taskId if the filename matches `.ralph_skip_<taskId>`, otherwise null.
 */
export function parseSkipTaskId(filename: string): string | null {
  if (!filename.startsWith(SKIP_FILE_PREFIX)) return null;
  const taskId = filename.slice(SKIP_FILE_PREFIX.length).trim();
  return taskId.length > 0 ? taskId : null;
}

/**
 * Check the signal directory for pause, resume, and skip signal files.
 * Skip signals are discovered by listing the directory for files matching `.ralph_skip_*`.
 */
export function checkSignals(signalDir: string): SignalState {
  const pausePath = join(signalDir, PAUSE_FILE);
  const resumePath = join(signalDir, RESUME_FILE);
  const pause = existsSync(pausePath);
  const resume = existsSync(resumePath);

  let skipTaskIds: string[] = [];
  try {
    const entries = readdirSync(signalDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      const taskId = parseSkipTaskId(entry.name);
      if (taskId) skipTaskIds.push(taskId);
    }
  } catch {
    // Directory may not exist or be unreadable; skip list stays empty
  }

  return { pause, resume, skipTaskIds };
}

/**
 * Remove a single signal file by basename (e.g. RESUME_FILE or `.ralph_skip_<taskId>`).
 * No-op if the file does not exist.
 */
export function clearSignal(signalDir: string, basename: string): void {
  const path = join(signalDir, basename);
  if (existsSync(path)) {
    try {
      unlinkSync(path);
    } catch {
      // Ignore unlink errors (permissions, already removed)
    }
  }
}

/**
 * Clear pause and resume signals (e.g. after consuming resume).
 */
export function clearPauseAndResume(signalDir: string): void {
  clearSignal(signalDir, PAUSE_FILE);
  clearSignal(signalDir, RESUME_FILE);
}

const DEFAULT_POLL_MS = 2000;

/**
 * Poll until .ralph_resume exists in signalDir, then clear both pause and resume files.
 * Used when .ralph_pause was detected: Ralph enters a wait state until resume is present.
 */
export function waitForResume(
  signalDir: string,
  pollIntervalMs: number = DEFAULT_POLL_MS
): Promise<void> {
  return new Promise<void>(resolve => {
    const resumePath = join(signalDir, RESUME_FILE);

    const check = (): void => {
      if (existsSync(resumePath)) {
        clearPauseAndResume(signalDir);
        resolve();
        return;
      }
      setTimeout(check, pollIntervalMs);
    };

    check();
  });
}
