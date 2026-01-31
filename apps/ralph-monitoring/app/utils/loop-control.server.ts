/**
 * Loop control signals for Ralph execution.
 * Creates file-based signals in the repo root (same contract as .devagent/plugins/ralph/tools/lib/control-signals.ts).
 */

import { existsSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const PAUSE_FILE = '.ralph_pause';
const RESUME_FILE = '.ralph_resume';
const SKIP_FILE_PREFIX = '.ralph_skip_';

/**
 * Resolve the directory where control signal files are written (repo root).
 */
export function getSignalDir(): string {
  const fromEnv = process.env.REPO_ROOT?.trim();
  if (fromEnv) return fromEnv;
  const cwd = process.cwd();
  if (cwd.includes('apps/ralph-monitoring')) {
    return join(cwd, '..', '..');
  }
  return cwd;
}

/**
 * Create the pause signal. Ralph will complete the current task then wait until resume.
 */
export function createPauseSignal(): void {
  const dir = getSignalDir();
  writeFileSync(join(dir, PAUSE_FILE), '', 'utf-8');
}

/**
 * Remove pause signal and create resume signal so any waiting Ralph loop continues.
 */
export function removePauseAndCreateResume(): void {
  const dir = getSignalDir();
  const pausePath = join(dir, PAUSE_FILE);
  const resumePath = join(dir, RESUME_FILE);
  if (existsSync(pausePath)) unlinkSync(pausePath);
  writeFileSync(resumePath, '', 'utf-8');
}

/**
 * Create skip signal for the given task ID. Ralph will skip that task when reached.
 */
export function createSkipSignal(taskId: string): void {
  const dir = getSignalDir();
  const basename = `${SKIP_FILE_PREFIX}${taskId}`;
  writeFileSync(join(dir, basename), '', 'utf-8');
}

/**
 * Read current signal state (for status responses).
 */
export function getSignalState(): { pause: boolean; resume: boolean; skipTaskIds: string[] } {
  const dir = getSignalDir();
  const pause = existsSync(join(dir, PAUSE_FILE));
  const resume = existsSync(join(dir, RESUME_FILE));
  const skipTaskIds: string[] = [];
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      if (entry.name.startsWith(SKIP_FILE_PREFIX)) {
        const id = entry.name.slice(SKIP_FILE_PREFIX.length).trim();
        if (id.length > 0) skipTaskIds.push(id);
      }
    }
  } catch {
    // directory missing or unreadable
  }
  return { pause, resume, skipTaskIds };
}
