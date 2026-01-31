import { readFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, it, expect, afterEach } from 'vitest';
import { runOnIterationHook } from './lib/on-iteration-hook';

const EXPECTED_PAYLOAD_KEYS = [
  'epicId',
  'iteration',
  'maxIterations',
  'taskId',
  'taskTitle',
  'taskStatus',
  'tasksCompleted',
  'tasksRemaining',
  'iterationDurationSec'
] as const;

describe('on-iteration hook', () => {
  afterEach(() => {
    // Clean up temp files created under os.tmpdir()
    try {
      const dir = tmpdir();
      // Only remove our test file if it exists (name pattern)
      for (const name of ['ralph-iter-payload-test']) {
        const p = join(dir, name);
        if (existsSync(p)) rmSync(p, { force: true });
      }
    } catch {
      // ignore
    }
  });

  it('calls hook with JSON payload on stdin and payload contains all expected fields', async () => {
    const outFile = join(tmpdir(), 'ralph-iter-payload-test');
    const command = `cat >> '${outFile.replace(/'/g, "'\"'\"'")}'`;
    const payload = {
      epicId: 'test-epic',
      iteration: 1,
      maxIterations: 3,
      taskId: 'test-epic.1',
      taskTitle: 'Test task',
      taskStatus: 'completed' as const,
      tasksCompleted: 1,
      tasksRemaining: 2,
      iterationDurationSec: 5.2
    };

    await runOnIterationHook(command, payload);

    expect(existsSync(outFile)).toBe(true);
    const content = readFileSync(outFile, 'utf-8').trim();
    const parsed = JSON.parse(content) as Record<string, unknown>;
    for (const key of EXPECTED_PAYLOAD_KEYS) {
      expect(parsed).toHaveProperty(key);
    }
    expect(parsed.epicId).toBe(payload.epicId);
    expect(parsed.iteration).toBe(payload.iteration);
    expect(parsed.maxIterations).toBe(payload.maxIterations);
    expect(parsed.taskId).toBe(payload.taskId);
    expect(parsed.taskTitle).toBe(payload.taskTitle);
    expect(parsed.taskStatus).toBe(payload.taskStatus);
    expect(parsed.tasksCompleted).toBe(payload.tasksCompleted);
    expect(parsed.tasksRemaining).toBe(payload.tasksRemaining);
    expect(parsed.iterationDurationSec).toBe(payload.iterationDurationSec);
  });

  it('does not throw when hook exits non-zero (loop continues)', async () => {
    const command = 'exit 1';
    const payload = {
      epicId: 'e',
      iteration: 1,
      maxIterations: 1,
      taskId: 'e.1',
      taskTitle: 'T',
      taskStatus: 'failed' as const,
      tasksCompleted: 0,
      tasksRemaining: 1,
      iterationDurationSec: 0
    };

    await expect(runOnIterationHook(command, payload)).resolves.toBeUndefined();
  });

  it('does not throw when hook command fails (e.g. missing script)', async () => {
    const command = '/nonexistent/script 2>/dev/null; exit 1';
    const payload = {
      epicId: 'e',
      iteration: 1,
      maxIterations: 1,
      taskId: 'e.1',
      taskTitle: 'T',
      taskStatus: 'completed' as const,
      tasksCompleted: 1,
      tasksRemaining: 0,
      iterationDurationSec: 1
    };

    await expect(runOnIterationHook(command, payload)).resolves.toBeUndefined();
  });
});
