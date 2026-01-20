import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ensureLogDirectoryExists, getLogDirectory, getMissingLogDiagnostics } from '~/utils/logs.server';

describe('logs.server', () => {
  const previousRalphLogDir = process.env.RALPH_LOG_DIR;
  const previousRepoRoot = process.env.REPO_ROOT;

  let tempRoot: string;
  let logDir: string;

  beforeEach(() => {
    tempRoot = mkdtempSync(join(tmpdir(), 'ralph-monitoring-logs-server-'));
    logDir = join(tempRoot, 'deep', 'nested', 'logs', 'ralph');
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

  it('creates the log directory recursively when missing', () => {
    expect(existsSync(logDir)).toBe(false);
    ensureLogDirectoryExists();
    expect(existsSync(logDir)).toBe(true);
    expect(getLogDirectory()).toBe(logDir);
  });

  it('returns non-sensitive missing-log diagnostics', () => {
    const diagnostics = getMissingLogDiagnostics('test-task');
    expect(diagnostics.envVarsConsulted).toEqual(['RALPH_LOG_DIR', 'REPO_ROOT']);
    expect(diagnostics.expectedLogPathTemplate).toBe('<RALPH_LOG_DIR>/test-task.log');
    expect(diagnostics.expectedLogDirectoryTemplate).toBe('<RALPH_LOG_DIR>');

    // Should not include absolute paths or env var values
    expect(diagnostics.expectedLogPathTemplate).not.toContain(tempRoot);
    expect(diagnostics.expectedLogDirectoryTemplate).not.toContain(tempRoot);
  });
});

