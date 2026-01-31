import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { action } from '../api.loop.skip.$taskId';

const SKIP_PREFIX = '.ralph_skip_';

describe('api.loop.skip.$taskId', () => {
  let tempRoot: string;
  const previousRepoRoot = process.env.REPO_ROOT;

  function makeRequest(): Request {
    return new Request('http://localhost/api/loop/skip/task-123', { method: 'POST' });
  }

  function makeActionArgs(taskId: string): Parameters<typeof action>[0] {
    return {
      request: makeRequest(),
      params: { taskId },
      context: {},
      unstable_pattern: ''
    };
  }

  beforeEach(() => {
    tempRoot = mkdtempSync(join(tmpdir(), 'ralph-loop-skip-'));
    process.env.REPO_ROOT = tempRoot;
  });

  afterEach(() => {
    try {
      rmSync(tempRoot, { recursive: true, force: true });
    } catch {
      // ignore
    }
    if (previousRepoRoot === undefined) delete process.env.REPO_ROOT;
    else process.env.REPO_ROOT = previousRepoRoot;
  });

  it('returns 400 when taskId is missing', async () => {
    const thrown = await action(makeActionArgs('')).catch((e: unknown) => e);

    expect(thrown).toMatchObject({ init: { status: 400 } });
    expect((thrown as { data?: unknown }).data).toMatchObject({ success: false, message: 'Task ID is required' });
  });

  it('returns 400 when taskId is only whitespace', async () => {
    const thrown = await action(makeActionArgs('   ')).catch((e: unknown) => e);

    expect(thrown).toMatchObject({ init: { status: 400 } });
    expect((thrown as { data?: unknown }).data).toMatchObject({ success: false, message: 'Task ID is required' });
  });

  it('returns 405 for non-POST', async () => {
    const req = new Request('http://localhost/api/loop/skip/task-1', { method: 'GET' });
    const thrown = await action({
      ...makeActionArgs('task-1'),
      request: req
    }).catch((e: unknown) => e);

    expect(thrown).toMatchObject({ init: { status: 405 } });
  });

  it('POST creates skip signal for task', async () => {
    const taskId = 'devagent-ralph-dashboard-2026-01-30.control-api';

    const result = await action(makeActionArgs(taskId));

    expect(result).toMatchObject({ type: 'DataWithResponseInit' });
    const payload = (result as { data?: unknown }).data as Record<string, unknown>;
    expect(payload).toMatchObject({ success: true, message: expect.stringContaining(taskId) });
    expect((payload.signals as { skipTaskIds: string[] }).skipTaskIds).toContain(taskId);

    expect(existsSync(join(tempRoot, `${SKIP_PREFIX}${taskId}`))).toBe(true);
  });
});
