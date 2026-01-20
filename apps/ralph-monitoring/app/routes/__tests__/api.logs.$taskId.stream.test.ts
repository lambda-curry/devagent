import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Readable } from 'node:stream';
import type { EventEmitter } from 'node:events';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Type-safe global mock storage (vitest hoists vi.mock to top, so we use globalThis)
interface GlobalMocks {
  __mockSpawnFn__?: ReturnType<typeof vi.fn>;
}

vi.mock('node:fs', async () => {
  const actual = await vi.importActual<typeof import('node:fs')>('node:fs');
  return {
    ...actual,
    accessSync: vi.fn(() => {})
  };
});

vi.mock('node:child_process', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:child_process')>();
  const mockSpawnFn = vi.fn();
  (globalThis as unknown as GlobalMocks).__mockSpawnFn__ = mockSpawnFn;
  return {
    ...actual,
    spawn: mockSpawnFn
  };
});

import { loader } from '../api.logs.$taskId.stream';
import { getLogFilePath } from '~/utils/logs.server';

const typedGlobal = globalThis as unknown as GlobalMocks;
const mockSpawnFn = typedGlobal.__mockSpawnFn__ as ReturnType<typeof vi.fn>;

describe('api.logs.$taskId.stream', () => {
  let mockTailProcess: {
    stdout: Readable & EventEmitter;
    stderr: Readable & EventEmitter;
    kill: ReturnType<typeof vi.fn>;
    on: ReturnType<typeof vi.fn>;
  };

  let tempRoot: string;
  let logDir: string;
  const previousRalphLogDir = process.env.RALPH_LOG_DIR;
  const previousRepoRoot = process.env.REPO_ROOT;

  const makeLoaderArgs = (
    taskId: string | undefined,
    request: Request
  ): Parameters<typeof loader>[0] => ({
    params: { taskId: taskId ?? '' },
    request,
    context: {},
    unstable_pattern: ''
  });

  beforeEach(() => {
    vi.clearAllMocks();

    tempRoot = mkdtempSync(join(tmpdir(), 'ralph-monitoring-logs-'));
    logDir = join(tempRoot, 'nested', 'logs', 'ralph');
    process.env.RALPH_LOG_DIR = logDir;
    delete process.env.REPO_ROOT;

    const mockStdout = new Readable({ read() {} });
    const mockStderr = new Readable({ read() {} });

    mockTailProcess = {
      stdout: mockStdout as Readable & EventEmitter,
      stderr: mockStderr as Readable & EventEmitter,
      kill: vi.fn(),
      on: vi.fn(() => mockTailProcess)
    };

    mockSpawnFn.mockReturnValue(mockTailProcess);
  });

  afterEach(() => {
    mockTailProcess.stdout.removeAllListeners();
    mockTailProcess.stderr.removeAllListeners();

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
    const request = new Request('http://localhost/api/logs/stream');
    const thrown = await loader(makeLoaderArgs(undefined, request)).catch((error) => error);

    expect(thrown).toMatchObject({ init: { status: 400 } });
    expect((thrown as { data?: unknown }).data).toMatchObject({ error: 'Task ID is required', code: 'INVALID_TASK_ID' });
    expect(mockSpawnFn).not.toHaveBeenCalled();
  });

  it('creates the log directory (recursive) before checks, then returns structured 404 diagnostics for missing file', async () => {
    expect(existsSync(logDir)).toBe(false);

    const request = new Request('http://localhost/api/logs/test-task/stream');
    const thrown = await loader(makeLoaderArgs('test-task', request)).catch((error) => error);

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
    expect(mockSpawnFn).not.toHaveBeenCalled();
  });

  it('returns structured 404 diagnostics when directory exists but file is missing', async () => {
    mkdirSync(logDir, { recursive: true });
    expect(existsSync(logDir)).toBe(true);

    const request = new Request('http://localhost/api/logs/test-task/stream');
    const thrown = await loader(makeLoaderArgs('test-task', request)).catch((error) => error);

    expect(thrown).toMatchObject({ init: { status: 404 } });
    const payload = (thrown as { data?: unknown }).data as Record<string, unknown>;
    expect(payload).toMatchObject({
      code: 'NOT_FOUND',
      taskId: 'test-task',
      expectedLogPath: '<RALPH_LOG_DIR>/test-task.log',
      envVarsConsulted: ['RALPH_LOG_DIR', 'REPO_ROOT']
    });
  });

  it('returns SSE headers for a valid request', async () => {
    // Ensure log file exists
    const logPath = getLogFilePath('test-task');
    writeFileSync(logPath, 'hello\n', 'utf-8');

    const abortController = new AbortController();
    const request = new Request('http://localhost/api/logs/test-task/stream', {
      signal: abortController.signal
    });
    const response = await loader(makeLoaderArgs('test-task', request));

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/event-stream');
    expect(response.headers.get('Cache-Control')).toBe('no-cache');

    abortController.abort();
    await new Promise((resolve) => setTimeout(resolve, 10));
  });

  it('spawns tail with expected args', async () => {
    const logPath = getLogFilePath('test-task');
    writeFileSync(logPath, 'hello\n', 'utf-8');

    const abortController = new AbortController();
    const request = new Request('http://localhost/api/logs/test-task/stream', {
      signal: abortController.signal
    });

    await loader(makeLoaderArgs('test-task', request));

    expect(mockSpawnFn).toHaveBeenCalledWith('tail', ['-F', '-n', '0', logPath]);

    abortController.abort();
    await new Promise((resolve) => setTimeout(resolve, 10));
  });

  it('kills the tail process on abort', async () => {
    const logPath = getLogFilePath('test-task');
    writeFileSync(logPath, 'hello\n', 'utf-8');

    const abortController = new AbortController();
    const request = new Request('http://localhost/api/logs/test-task/stream', {
      signal: abortController.signal
    });

    await loader(makeLoaderArgs('test-task', request));

    abortController.abort();
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(mockTailProcess.kill).toHaveBeenCalled();
  });
});
