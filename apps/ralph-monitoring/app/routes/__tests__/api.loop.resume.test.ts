import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { action } from '../api.loop.resume';

const PAUSE_FILE = '.ralph_pause';
const RESUME_FILE = '.ralph_resume';

describe('api.loop.resume', () => {
  let tempRoot: string;
  const previousRepoRoot = process.env.REPO_ROOT;

  function makeRequest(): Request {
    return new Request('http://localhost/api/loop/resume', { method: 'POST' });
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
    tempRoot = mkdtempSync(join(tmpdir(), 'ralph-loop-resume-'));
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
    const req = new Request('http://localhost/api/loop/resume', { method: 'GET' });
    const thrown = await action({
      ...makeActionArgs(),
      request: req
    }).catch((e: unknown) => e);

    expect(thrown).toMatchObject({ init: { status: 405 } });
  });

  it('POST removes pause and creates resume signal', async () => {
    writeFileSync(join(tempRoot, PAUSE_FILE), '', 'utf-8');
    expect(existsSync(join(tempRoot, PAUSE_FILE))).toBe(true);

    const result = await action(makeActionArgs());

    expect(result).toMatchObject({ type: 'DataWithResponseInit' });
    const payload = (result as { data?: unknown }).data as Record<string, unknown>;
    expect(payload).toMatchObject({ success: true, message: expect.stringContaining('Resume') });

    expect(existsSync(join(tempRoot, PAUSE_FILE))).toBe(false);
    expect(existsSync(join(tempRoot, RESUME_FILE))).toBe(true);
  });
});
