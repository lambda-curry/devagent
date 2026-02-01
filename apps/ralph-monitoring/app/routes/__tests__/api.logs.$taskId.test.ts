import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loader } from '../api.logs.$taskId';
import { getLogFilePath } from '~/utils/logs.server';

describe('api.logs.$taskId', () => {
  let tempRoot: string;
  let logDir: string;
  const previousRalphLogDir = process.env.RALPH_LOG_DIR;
  const previousRepoRoot = process.env.REPO_ROOT;

  const makeLoaderArgs = (taskId: string | undefined): Parameters<typeof loader>[0] => {
    const resolvedTaskId = taskId ?? '';
    return {
      params: { taskId: resolvedTaskId },
      // Some RR typegen versions model the first generic as `context`.
      // Keep this test strict and portable by satisfying either typing shape.
      context: { taskId: resolvedTaskId } as unknown as Parameters<typeof loader>[0]['context'],
      request: new Request('http://localhost/api/logs'),
      unstable_pattern: ''
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();

    tempRoot = mkdtempSync(join(tmpdir(), 'ralph-monitoring-logs-static-'));
    logDir = join(tempRoot, 'nested', 'logs', 'ralph');
    process.env.RALPH_LOG_DIR = logDir;
    delete process.env.REPO_ROOT;
  });

  afterEach(() => {
    try {
      rmSync(tempRoot, { recursive: true, force: true });
    } catch {
      // ignore cleanup errors
    }

    if (previousRalphLogDir === undefined) {
      delete process.env.RALPH_LOG_DIR;
    } else {
      process.env.RALPH_LOG_DIR = previousRalphLogDir;
    }

    if (previousRepoRoot === undefined) {
      delete process.env.REPO_ROOT;
    } else {
      process.env.REPO_ROOT = previousRepoRoot;
    }
  });

  it('returns 400 when task ID is missing', async () => {
    const thrown = await loader(makeLoaderArgs(undefined)).catch((error) => error);

    expect(thrown).toMatchObject({ init: { status: 400 } });
    expect((thrown as { data?: unknown }).data).toMatchObject({ error: 'Task ID is required', code: 'INVALID_TASK_ID' });
  });

  it('returns 400 for invalid task ID format (e.g. reserved filename)', async () => {
    const thrown = await loader(makeLoaderArgs('.')).catch((error) => error);

    expect(thrown).toMatchObject({ init: { status: 400 } });
    expect((thrown as { data?: unknown }).data).toMatchObject({
      code: 'INVALID_TASK_ID',
      taskId: '.',
      error: expect.stringContaining('Invalid task ID format')
    });
  });

  it('creates the log directory (recursive) before checks, then returns structured 404 diagnostics for missing file', async () => {
    expect(existsSync(logDir)).toBe(false);

    const thrown = await loader(makeLoaderArgs('test-task')).catch((error) => error);

    // Directory should have been created even though the file is missing
    expect(existsSync(logDir)).toBe(true);

    expect(thrown).toMatchObject({ init: { status: 404 } });
    const payload = (thrown as { data?: unknown }).data as Record<string, unknown>;
    expect(payload).toMatchObject({
      code: 'NOT_FOUND',
      taskId: 'test-task',
      expectedLogPath: '<RALPH_LOG_DIR>/test-task.log',
      expectedLogDirectory: '<RALPH_LOG_DIR>',
      envVarsConsulted: ['RALPH_LOG_DIR', 'REPO_ROOT']
    });
    expect(payload.diagnostics).toMatchObject({
      expectedLogPathTemplate: '<RALPH_LOG_DIR>/test-task.log',
      expectedLogDirectoryTemplate: '<RALPH_LOG_DIR>',
      expectedLogFileName: 'test-task.log',
      envVarsConsulted: ['RALPH_LOG_DIR', 'REPO_ROOT'],
      envVarIsSet: { RALPH_LOG_DIR: true, REPO_ROOT: false },
      resolvedStrategy: 'RALPH_LOG_DIR'
    });
  });

  it('returns structured 404 diagnostics when directory exists but file is missing', async () => {
    mkdirSync(logDir, { recursive: true });
    expect(existsSync(logDir)).toBe(true);

    const thrown = await loader(makeLoaderArgs('test-task')).catch((error) => error);

    expect(thrown).toMatchObject({ init: { status: 404 } });
    const payload = (thrown as { data?: unknown }).data as Record<string, unknown>;
    expect(payload).toMatchObject({
      code: 'NOT_FOUND',
      taskId: 'test-task',
      expectedLogPath: '<RALPH_LOG_DIR>/test-task.log',
      envVarsConsulted: ['RALPH_LOG_DIR', 'REPO_ROOT']
    });
  });

  it('returns logs when file exists', async () => {
    const logPath = getLogFilePath('test-task');
    writeFileSync(logPath, 'hello\nworld\n', 'utf-8');

    const response = await loader(makeLoaderArgs('test-task'));
    expect(response).toMatchObject({ type: 'DataWithResponseInit' });

    const payload = (response as { data?: unknown }).data as Record<string, unknown>;
    expect(payload).toMatchObject({ logs: 'hello\nworld\n' });
  });
});
