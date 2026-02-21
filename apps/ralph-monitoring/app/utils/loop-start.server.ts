/**
 * Start Ralph execution loop by spawning ralph.sh with a run file for the given epic.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

const PLUGIN_REL = join('.devagent', 'plugins', 'ralph');
const RUNS_REL = join(PLUGIN_REL, 'runs');
const RALPH_SH_REL = join(PLUGIN_REL, 'tools', 'ralph.sh');

/**
 * Resolve repo root (same as loop-control).
 */
function getRepoRoot(): string {
  const fromEnv = process.env.REPO_ROOT?.trim();
  if (fromEnv) return fromEnv;
  const cwd = process.cwd();
  if (cwd.includes('apps/ralph-monitoring')) {
    return join(cwd, '..', '..');
  }
  return cwd;
}

export interface RunFileEpic {
  id?: string;
  title?: string;
  pr_url?: string;
}

interface RunFile {
  epic?: RunFileEpic;
}

/**
 * Read and parse a run file, returning the epic fragment (id, pr_url, etc.) or null.
 * Returns null for invalid JSON, missing epic, or read errors.
 */
export function readRunFileEpic(runFilePath: string): RunFileEpic | null {
  try {
    const content = readFileSync(runFilePath, 'utf-8');
    const data = JSON.parse(content) as RunFile;
    return data?.epic ?? null;
  } catch {
    return null;
  }
}

/**
 * Find a run file in .devagent/plugins/ralph/runs whose epic.id matches the given epic ID.
 * Returns the absolute path to the run file, or null if not found or ambiguous.
 */
export function findRunFileByEpicId(epicId: string): string | null {
  const repoRoot = getRepoRoot();
  const runsDir = join(repoRoot, RUNS_REL);
  if (!existsSync(runsDir)) return null;

  const entries = readdirSync(runsDir, { withFileTypes: true });
  let found: string | null = null;
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.json')) continue;
    const path = join(runsDir, entry.name);
    try {
      const content = readFileSync(path, 'utf-8');
      const data = JSON.parse(content) as RunFile;
      if (data?.epic?.id === epicId) {
        if (found !== null) return null; // ambiguous
        found = path;
      }
    } catch {
      // skip invalid JSON
    }
  }
  return found;
}

/**
 * Spawn ralph.sh with the given run file path. Runs in repo root, detached so the API returns immediately.
 * Returns { success, message, runFilePath }.
 */
export function spawnRalphLoop(runFilePath: string): Promise<{
  success: boolean;
  message: string;
  runFilePath?: string;
}> {
  const repoRoot = getRepoRoot();
  const ralphSh = join(repoRoot, RALPH_SH_REL);

  if (!existsSync(ralphSh)) {
    return Promise.resolve({
      success: false,
      message: `ralph.sh not found at ${ralphSh}`,
    });
  }
  if (!existsSync(runFilePath)) {
    return Promise.resolve({
      success: false,
      message: `Run file not found at ${runFilePath}`,
    });
  }

  return new Promise((resolve) => {
    const child = spawn('bash', [ralphSh, '--run', runFilePath], {
      cwd: repoRoot,
      detached: true,
      stdio: 'ignore',
      env: { ...process.env, REPO_ROOT: repoRoot },
    });
    child.unref();

    child.on('error', (err) => {
      resolve({
        success: false,
        message: `Failed to spawn ralph: ${err.message}`,
        runFilePath,
      });
    });

    // Spawn succeeded; loop runs in background
    child.on('spawn', () => {
      resolve({
        success: true,
        message: 'Ralph loop started in background',
        runFilePath,
      });
    });
  });
}
