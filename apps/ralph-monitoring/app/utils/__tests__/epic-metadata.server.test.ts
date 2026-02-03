import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { getEpicMetadata, getRepoUrl } from '../epic-metadata.server';
import * as loopStart from '~/utils/loop-start.server';

vi.mock('~/utils/loop-start.server', () => ({
  findRunFileByEpicId: vi.fn(),
  readRunFileEpic: vi.fn(),
}));

describe('epic-metadata.server', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.mocked(loopStart.findRunFileByEpicId).mockReset();
    vi.mocked(loopStart.readRunFileEpic).mockReset();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  describe('getRepoUrl', () => {
    it('returns null when RALPH_REPO_URL is not set', () => {
      delete process.env.RALPH_REPO_URL;

      expect(getRepoUrl()).toBeNull();
    });

    it('returns null when RALPH_REPO_URL is empty or whitespace', () => {
      process.env.RALPH_REPO_URL = '';
      expect(getRepoUrl()).toBeNull();

      process.env.RALPH_REPO_URL = '   ';
      expect(getRepoUrl()).toBeNull();
    });

    it('returns trimmed URL when RALPH_REPO_URL is set', () => {
      process.env.RALPH_REPO_URL = '  https://github.com/org/repo  ';

      expect(getRepoUrl()).toBe('https://github.com/org/repo');
    });
  });

  describe('getEpicMetadata', () => {
    it('returns prUrl null and repoUrl from env when no run file found', () => {
      vi.mocked(loopStart.findRunFileByEpicId).mockReturnValue(null);
      process.env.RALPH_REPO_URL = 'https://github.com/org/repo';

      const result = getEpicMetadata('unknown-epic');

      expect(result).toEqual({ prUrl: null, repoUrl: 'https://github.com/org/repo' });
      expect(loopStart.readRunFileEpic).not.toHaveBeenCalled();
    });

    it('returns prUrl from run file when present', () => {
      const runPath = '/repo/.devagent/plugins/ralph/runs/epic.json';
      vi.mocked(loopStart.findRunFileByEpicId).mockReturnValue(runPath);
      vi.mocked(loopStart.readRunFileEpic).mockReturnValue({
        id: 'devagent-epic-1',
        pr_url: 'https://github.com/org/repo/pull/90',
      });

      const result = getEpicMetadata('devagent-epic-1');

      expect(result.prUrl).toBe('https://github.com/org/repo/pull/90');
      expect(loopStart.readRunFileEpic).toHaveBeenCalledWith(runPath);
    });

    it('returns prUrl null when run file epic has no pr_url', () => {
      vi.mocked(loopStart.findRunFileByEpicId).mockReturnValue('/path/to/run.json');
      vi.mocked(loopStart.readRunFileEpic).mockReturnValue({
        id: 'devagent-epic-1',
        title: 'Epic',
      });

      const result = getEpicMetadata('devagent-epic-1');

      expect(result.prUrl).toBeNull();
    });

    it('returns prUrl null when readRunFileEpic returns null', () => {
      vi.mocked(loopStart.findRunFileByEpicId).mockReturnValue('/path/to/run.json');
      vi.mocked(loopStart.readRunFileEpic).mockReturnValue(null);

      const result = getEpicMetadata('devagent-epic-1');

      expect(result.prUrl).toBeNull();
    });

    it('trims pr_url and rejects empty string', () => {
      vi.mocked(loopStart.findRunFileByEpicId).mockReturnValue('/path/to/run.json');
      vi.mocked(loopStart.readRunFileEpic).mockReturnValue({
        id: 'devagent-epic-1',
        pr_url: '   ',
      });

      const result = getEpicMetadata('devagent-epic-1');

      expect(result.prUrl).toBeNull();
    });

    it('does not break when readRunFileEpic throws', () => {
      vi.mocked(loopStart.findRunFileByEpicId).mockReturnValue('/path/to/run.json');
      vi.mocked(loopStart.readRunFileEpic).mockImplementation(() => {
        throw new Error('read error');
      });

      const result = getEpicMetadata('devagent-epic-1');

      expect(result).toEqual({ prUrl: null, repoUrl: null });
    });
  });
});
