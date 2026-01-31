import { readFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, it, expect, afterEach } from 'vitest';
import { runOnCompleteHook } from './lib/on-complete-hook';

const EXPECTED_PAYLOAD_KEYS = [
  'status',
  'epicId',
  'iterations',
  'maxIterations',
  'exitReason',
  'durationSec',
  'branch',
  'logTail'
] as const;

describe('on-complete hook', () => {
  afterEach(() => {
    try {
      const dir = tmpdir();
      for (const name of ['ralph-complete-payload-test']) {
        const p = join(dir, name);
        if (existsSync(p)) rmSync(p, { force: true });
      }
    } catch {
      // ignore
    }
  });

  it('calls hook with JSON payload on stdin and payload contains all expected fields', async () => {
    const outFile = join(tmpdir(), 'ralph-complete-payload-test');
    const command = `cat >> '${outFile.replace(/'/g, "'\"'\"'")}'`;
    const payload = {
      status: 'completed' as const,
      epicId: 'test-epic',
      iterations: 2,
      maxIterations: 3,
      exitReason: 'no_ready_tasks' as const,
      durationSec: 10.5,
      branch: 'feature/test',
      logTail: 'last log lines'
    };

    await runOnCompleteHook(command, payload);

    expect(existsSync(outFile)).toBe(true);
    const content = readFileSync(outFile, 'utf-8').trim();
    const parsed = JSON.parse(content) as Record<string, unknown>;
    for (const key of EXPECTED_PAYLOAD_KEYS) {
      expect(parsed).toHaveProperty(key);
    }
    expect(parsed.status).toBe(payload.status);
    expect(parsed.epicId).toBe(payload.epicId);
    expect(parsed.iterations).toBe(payload.iterations);
    expect(parsed.maxIterations).toBe(payload.maxIterations);
    expect(parsed.exitReason).toBe(payload.exitReason);
    expect(parsed.durationSec).toBe(payload.durationSec);
    expect(parsed.branch).toBe(payload.branch);
    expect(parsed.logTail).toBe(payload.logTail);
  });

  it('does not throw when hook exits non-zero (loop already finished)', async () => {
    const command = 'exit 1';
    const payload = {
      status: 'blocked' as const,
      epicId: 'e',
      iterations: 1,
      maxIterations: 1,
      exitReason: 'max_iterations_reached' as const,
      durationSec: 5,
      branch: '',
      logTail: ''
    };

    await expect(runOnCompleteHook(command, payload)).resolves.toBeUndefined();
  });
});
