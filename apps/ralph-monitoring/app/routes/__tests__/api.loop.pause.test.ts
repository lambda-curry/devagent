import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { action } from '../api.loop.pause';

const PAUSE_FILE = '.ralph_pause';

describe('api.loop.pause', () => {
  let tempRoot: string;
  const previousRepoRoot = process.env.REPO_ROOT;

  function makeRequest(): Request {
    return new Request('http://localhost/api/loop/pause', { method: 'POST' });
  }

  function makeActionArgs(): Parameters<typeof action>[0] {
    return {
      request: makeRequest(),
      params: {},
      context: {},
      unstable_pattern: ''
    };
  }

  beforeEach(() => {
    tempRoot = mkdtempSync(join(tmpdir(), 'ralph-loop-pause-'));
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

  it('returns 405 for non-POST', async () => {
    const req = new Request('http://localhost/api/loop/pause', { method: 'GET' });
    const thrown = await action({
      ...makeActionArgs(),
      request: req
    }).catch((e: unknown) => e);

    expect(thrown).toMatchObject({ init: { status: 405 } });
    expect((thrown as { data?: unknown }).data).toMatchObject({ success: false, message: 'Method not allowed' });
  });

  it('POST creates pause signal and returns status', async () => {
    const result = await action(makeActionArgs());

    expect(result).toMatchObject({ type: 'DataWithResponseInit' });
    const payload = (result as { data?: unknown }).data as Record<string, unknown>;
    expect(payload).toMatchObject({ success: true, message: 'Pause signal created' });
    expect(payload.signals).toMatchObject({ pause: true });

    expect(existsSync(join(tempRoot, PAUSE_FILE))).toBe(true);
  });
});
