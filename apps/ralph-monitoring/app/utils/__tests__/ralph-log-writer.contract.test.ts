import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import { getLogFilePath } from '~/utils/logs.server';
import { openRalphTaskLogWriter, resolveRalphTaskLogPath } from '~/utils/ralph-log-writer.server';

describe('ralph log writer/viewer contract', () => {
  const previousRalphLogDir = process.env.RALPH_LOG_DIR;
  const previousRepoRoot = process.env.REPO_ROOT;

  let tempRoot: string;
  let logDir: string;

  beforeEach(() => {
    tempRoot = mkdtempSync(join(tmpdir(), 'ralph-monitoring-ralph-log-writer-'));
    logDir = join(tempRoot, 'logs');
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

  it('writer produces logs at the exact path the viewer expects (including sanitization)', () => {
    const cases: Array<{ taskId: string; expectedFileName: string }> = [
      { taskId: 'devagent-300b.3', expectedFileName: 'devagent-300b.3.log' },
      { taskId: 'devagent 300b/3', expectedFileName: 'devagent_300b_3.log' }
    ];

    for (const { taskId, expectedFileName } of cases) {
      const writer = openRalphTaskLogWriter(taskId);
      const viewerPath = getLogFilePath(taskId);

      expect(writer.logPath).toBe(viewerPath);
      expect(resolveRalphTaskLogPath(taskId)).toBe(viewerPath);
      expect(basename(writer.logPath)).toBe(expectedFileName);

      writer.write('hello\n');
      writer.close();

      expect(existsSync(viewerPath)).toBe(true);
      expect(readFileSync(viewerPath, 'utf-8')).toContain('hello');
    }
  });
});

