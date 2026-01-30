import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { action } from '../api.loop.start';

vi.mock('~/utils/loop-start.server', () => ({
  findRunFileByEpicId: vi.fn(),
  spawnRalphLoop: vi.fn()
}));

const { findRunFileByEpicId, spawnRalphLoop } = await import('~/utils/loop-start.server');

describe('api.loop.start', () => {
  beforeEach(() => {
    vi.mocked(findRunFileByEpicId).mockReset();
    vi.mocked(spawnRalphLoop).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  function makeActionArgs(body: { epicId?: string; runFilePath?: string } | null): Parameters<typeof action>[0] {
    return {
      request: new Request('http://localhost/api/loop/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined
      }),
      params: {},
      context: {},
      unstable_pattern: ''
    };
  }

  it('returns 405 for non-POST', async () => {
    const req = new Request('http://localhost/api/loop/start', { method: 'GET' });
    const thrown = await action({
      request: req,
      params: {},
      context: {},
      unstable_pattern: ''
    }).catch((e: unknown) => e);

    expect(thrown).toMatchObject({ init: { status: 405 } });
  });

  it('returns 400 when epicId is missing', async () => {
    const thrown = await action(makeActionArgs({})).catch((e: unknown) => e);

    expect(thrown).toMatchObject({ init: { status: 400 } });
    expect((thrown as { data?: unknown }).data).toMatchObject({ success: false, message: expect.stringContaining('epicId') });
  });

  it('returns 400 when no run file found for epic', async () => {
    vi.mocked(findRunFileByEpicId).mockReturnValue(null);

    const thrown = await action(makeActionArgs({ epicId: 'unknown-epic' })).catch((e: unknown) => e);

    expect(thrown).toMatchObject({ init: { status: 400 } });
    expect((thrown as { data?: unknown }).data).toMatchObject({
      success: false,
      message: expect.stringContaining('No run file found')
    });
  });

  it('POST spawns ralph and returns status', async () => {
    const runPath = '/repo/.devagent/plugins/ralph/runs/test.json';
    vi.mocked(findRunFileByEpicId).mockReturnValue(runPath);
    vi.mocked(spawnRalphLoop).mockResolvedValue({
      success: true,
      message: 'Ralph loop started in background',
      runFilePath: runPath
    });

    const result = await action(makeActionArgs({ epicId: 'devagent-ralph-dashboard-2026-01-30' }));

    expect(result).toMatchObject({ type: 'DataWithResponseInit' });
    const payload = (result as { data?: unknown }).data as Record<string, unknown>;
    expect(payload).toMatchObject({ success: true, message: expect.stringContaining('started') });
    expect(findRunFileByEpicId).toHaveBeenCalledWith('devagent-ralph-dashboard-2026-01-30');
    expect(spawnRalphLoop).toHaveBeenCalledWith(runPath);
  });

  it('accepts runFilePath in body and uses it', async () => {
    const customPath = '/custom/runs/my-epic.json';
    vi.mocked(spawnRalphLoop).mockResolvedValue({
      success: true,
      message: 'Ralph loop started in background',
      runFilePath: customPath
    });

    const result = await action(makeActionArgs({ epicId: 'my-epic', runFilePath: customPath }));

    expect(result).toMatchObject({ type: 'DataWithResponseInit' });
    expect(findRunFileByEpicId).not.toHaveBeenCalled();
    expect(spawnRalphLoop).toHaveBeenCalledWith(customPath);
  });
});
