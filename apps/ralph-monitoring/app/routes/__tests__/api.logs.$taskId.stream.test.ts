import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Readable } from 'node:stream';
import type { EventEmitter } from 'node:events';

// Type-safe global mock storage (vitest hoists vi.mock to top, so we use globalThis)
interface GlobalMocks {
  __mockSpawnFn__?: ReturnType<typeof vi.fn>;
  __mockLogFileExists__?: ReturnType<typeof vi.fn>;
  __mockGetLogFilePath__?: ReturnType<typeof vi.fn>;
  __mockGetLogDirectory__?: ReturnType<typeof vi.fn>;
  __mockEnsureLogDirectoryExists__?: ReturnType<typeof vi.fn>;
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

vi.mock('~/utils/logs.server', () => {
  const mockLogFileExists = vi.fn();
  const mockGetLogFilePath = vi.fn();
  const mockGetLogDirectory = vi.fn();
  const mockEnsureLogDirectoryExists = vi.fn();
  (globalThis as unknown as GlobalMocks).__mockLogFileExists__ = mockLogFileExists;
  (globalThis as unknown as GlobalMocks).__mockGetLogFilePath__ = mockGetLogFilePath;
  (globalThis as unknown as GlobalMocks).__mockGetLogDirectory__ = mockGetLogDirectory;
  (globalThis as unknown as GlobalMocks).__mockEnsureLogDirectoryExists__ = mockEnsureLogDirectoryExists;
  return {
    logFileExists: mockLogFileExists,
    getLogFilePath: mockGetLogFilePath,
    getLogDirectory: mockGetLogDirectory,
    ensureLogDirectoryExists: mockEnsureLogDirectoryExists
  };
});

import { loader } from '../api.logs.$taskId.stream';

const typedGlobal = globalThis as unknown as GlobalMocks;
const mockSpawnFn = typedGlobal.__mockSpawnFn__ as ReturnType<typeof vi.fn>;
const mockLogFileExists = typedGlobal.__mockLogFileExists__ as ReturnType<typeof vi.fn>;
const mockGetLogFilePath = typedGlobal.__mockGetLogFilePath__ as ReturnType<typeof vi.fn>;
const mockEnsureLogDirectoryExists = typedGlobal.__mockEnsureLogDirectoryExists__ as ReturnType<typeof vi.fn>;

describe('api.logs.$taskId.stream', () => {
  let mockTailProcess: {
    stdout: Readable & EventEmitter;
    stderr: Readable & EventEmitter;
    kill: ReturnType<typeof vi.fn>;
    on: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    const mockStdout = new Readable({ read() {} });
    const mockStderr = new Readable({ read() {} });

    mockTailProcess = {
      stdout: mockStdout as Readable & EventEmitter,
      stderr: mockStderr as Readable & EventEmitter,
      kill: vi.fn(),
      on: vi.fn(() => mockTailProcess)
    };

    mockSpawnFn.mockReturnValue(mockTailProcess);
    mockLogFileExists.mockReturnValue(true);
    mockGetLogFilePath.mockReturnValue('/path/to/logs/test-task.log');
    mockEnsureLogDirectoryExists.mockReturnValue(undefined);
  });

  afterEach(() => {
    mockTailProcess.stdout.removeAllListeners();
    mockTailProcess.stderr.removeAllListeners();
  });

  it('returns 400 when task ID is missing', async () => {
    const request = new Request('http://localhost/api/logs/stream');
    const response = await loader({ params: {}, request });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toMatchObject({ error: 'Task ID is required', code: 'INVALID_TASK_ID' });
    expect(mockSpawnFn).not.toHaveBeenCalled();
  });

  it('returns 404 when log file does not exist', async () => {
    mockLogFileExists.mockReturnValue(false);

    const request = new Request('http://localhost/api/logs/test-task/stream');
    const response = await loader({ params: { taskId: 'test-task' }, request });

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data).toMatchObject({
      code: 'NOT_FOUND',
      taskId: 'test-task',
      expectedLogPath: '/path/to/logs/test-task.log'
    });
    expect(mockSpawnFn).not.toHaveBeenCalled();
  });

  it('returns SSE headers for a valid request', async () => {
    const abortController = new AbortController();
    const request = new Request('http://localhost/api/logs/test-task/stream', {
      signal: abortController.signal
    });
    const response = await loader({ params: { taskId: 'test-task' }, request });

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/event-stream');
    expect(response.headers.get('Cache-Control')).toBe('no-cache');

    abortController.abort();
    await new Promise((resolve) => setTimeout(resolve, 10));
  });

  it('spawns tail with expected args', async () => {
    const abortController = new AbortController();
    const request = new Request('http://localhost/api/logs/test-task/stream', {
      signal: abortController.signal
    });

    await loader({ params: { taskId: 'test-task' }, request });

    expect(mockSpawnFn).toHaveBeenCalledWith('tail', ['-F', '-n', '0', '/path/to/logs/test-task.log']);

    abortController.abort();
    await new Promise((resolve) => setTimeout(resolve, 10));
  });

  it('kills the tail process on abort', async () => {
    const abortController = new AbortController();
    const request = new Request('http://localhost/api/logs/test-task/stream', {
      signal: abortController.signal
    });

    await loader({ params: { taskId: 'test-task' }, request });

    abortController.abort();
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(mockTailProcess.kill).toHaveBeenCalled();
  });
});
