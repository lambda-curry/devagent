import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  PAUSE_FILE,
  RESUME_FILE,
  SKIP_FILE_PREFIX,
  checkSignals,
  clearSignal,
  clearPauseAndResume,
  parseSkipTaskId,
  waitForResume
} from './lib/control-signals';

describe('control-signals', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = join(process.cwd(), `.ralph-control-signals-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(tmpDir, { recursive: true });
  });

  afterEach(() => {
    try {
      rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  describe('parseSkipTaskId', () => {
    it('returns taskId for .ralph_skip_<taskId> filename', () => {
      expect(parseSkipTaskId('.ralph_skip_devagent-123.1')).toBe('devagent-123.1');
      expect(parseSkipTaskId('.ralph_skip_abc')).toBe('abc');
      expect(parseSkipTaskId('.ralph_skip_task-with-dots.2.3')).toBe('task-with-dots.2.3');
    });

    it('returns null for non-skip filenames', () => {
      expect(parseSkipTaskId('.ralph_pause')).toBeNull();
      expect(parseSkipTaskId('.ralph_resume')).toBeNull();
      expect(parseSkipTaskId('other')).toBeNull();
      expect(parseSkipTaskId('.ralph_skip_')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(parseSkipTaskId('')).toBeNull();
    });
  });

  describe('checkSignals', () => {
    it('returns all false and empty skipTaskIds when no signal files exist', () => {
      const state = checkSignals(tmpDir);
      expect(state.pause).toBe(false);
      expect(state.resume).toBe(false);
      expect(state.skipTaskIds).toEqual([]);
    });

    it('detects pause when .ralph_pause exists', () => {
      writeFileSync(join(tmpDir, PAUSE_FILE), '');
      const state = checkSignals(tmpDir);
      expect(state.pause).toBe(true);
      expect(state.resume).toBe(false);
      expect(state.skipTaskIds).toEqual([]);
    });

    it('detects resume when .ralph_resume exists', () => {
      writeFileSync(join(tmpDir, RESUME_FILE), '');
      const state = checkSignals(tmpDir);
      expect(state.pause).toBe(false);
      expect(state.resume).toBe(true);
      expect(state.skipTaskIds).toEqual([]);
    });

    it('detects skip signals by listing .ralph_skip_* files', () => {
      writeFileSync(join(tmpDir, `${SKIP_FILE_PREFIX}task-1`), '');
      writeFileSync(join(tmpDir, `${SKIP_FILE_PREFIX}devagent-abc.2`), '');
      const state = checkSignals(tmpDir);
      expect(state.pause).toBe(false);
      expect(state.resume).toBe(false);
      expect(state.skipTaskIds).toHaveLength(2);
      expect(state.skipTaskIds).toContain('task-1');
      expect(state.skipTaskIds).toContain('devagent-abc.2');
    });

    it('combines pause, resume, and skip signals', () => {
      writeFileSync(join(tmpDir, PAUSE_FILE), '');
      writeFileSync(join(tmpDir, RESUME_FILE), '');
      writeFileSync(join(tmpDir, `${SKIP_FILE_PREFIX}task-x`), '');
      const state = checkSignals(tmpDir);
      expect(state.pause).toBe(true);
      expect(state.resume).toBe(true);
      expect(state.skipTaskIds).toContain('task-x');
    });
  });

  describe('clearSignal', () => {
    it('removes the specified signal file', () => {
      const pausePath = join(tmpDir, PAUSE_FILE);
      writeFileSync(pausePath, '');
      expect(existsSync(pausePath)).toBe(true);
      clearSignal(tmpDir, PAUSE_FILE);
      expect(existsSync(pausePath)).toBe(false);
    });

    it('is no-op when file does not exist', () => {
      expect(() => clearSignal(tmpDir, PAUSE_FILE)).not.toThrow();
    });
  });

  describe('clearPauseAndResume', () => {
    it('removes both pause and resume files', () => {
      writeFileSync(join(tmpDir, PAUSE_FILE), '');
      writeFileSync(join(tmpDir, RESUME_FILE), '');
      clearPauseAndResume(tmpDir);
      expect(existsSync(join(tmpDir, PAUSE_FILE))).toBe(false);
      expect(existsSync(join(tmpDir, RESUME_FILE))).toBe(false);
    });
  });

  describe('waitForResume', () => {
    it('resolves when .ralph_resume is created and clears both pause and resume', async () => {
      writeFileSync(join(tmpDir, PAUSE_FILE), '');
      const resumePath = join(tmpDir, RESUME_FILE);

      const p = waitForResume(tmpDir, 50);
      await new Promise(r => setTimeout(r, 30));
      writeFileSync(resumePath, '');

      await p;

      expect(existsSync(join(tmpDir, PAUSE_FILE))).toBe(false);
      expect(existsSync(resumePath)).toBe(false);
    });

    it('resolves quickly when .ralph_resume already exists', async () => {
      writeFileSync(join(tmpDir, RESUME_FILE), '');
      const start = Date.now();
      await waitForResume(tmpDir, 5000);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(500);
    });
  });
});
