import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { readRunFileEpic, findRunFileByEpicId } from '../loop-start.server';

vi.mock('node:fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs')>();
  return {
    ...actual,
    readFileSync: vi.fn(),
    readdirSync: vi.fn(),
    existsSync: vi.fn(),
  };
});

const readFileSyncMock = vi.mocked(readFileSync);
const existsSyncMock = vi.mocked(existsSync);

describe('loop-start.server', () => {
  beforeEach(() => {
    readFileSyncMock.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('readRunFileEpic', () => {
    it('returns epic with pr_url when run file contains epic.pr_url', () => {
      readFileSyncMock.mockReturnValue(
        JSON.stringify({
          epic: {
            id: 'devagent-epic-1',
            pr_url: 'https://github.com/org/repo/pull/90',
          },
        })
      );

      const result = readRunFileEpic('/path/to/run.json');

      expect(result).toEqual({
        id: 'devagent-epic-1',
        pr_url: 'https://github.com/org/repo/pull/90',
      });
      expect(readFileSyncMock).toHaveBeenCalledWith('/path/to/run.json', 'utf-8');
    });

    it('returns epic without pr_url when run file has no pr_url', () => {
      readFileSyncMock.mockReturnValue(
        JSON.stringify({
          epic: {
            id: 'devagent-epic-1',
            title: 'My Epic',
          },
        })
      );

      const result = readRunFileEpic('/path/to/run.json');

      expect(result).toEqual({
        id: 'devagent-epic-1',
        title: 'My Epic',
      });
      expect(result?.pr_url).toBeUndefined();
    });

    it('returns null when epic is missing', () => {
      readFileSyncMock.mockReturnValue(JSON.stringify({ run: {}, tasks: [] }));

      const result = readRunFileEpic('/path/to/run.json');

      expect(result).toBeNull();
    });

    it('returns null when JSON is invalid', () => {
      readFileSyncMock.mockReturnValue('not valid json {');

      const result = readRunFileEpic('/path/to/run.json');

      expect(result).toBeNull();
    });

    it('returns null when read throws', () => {
      readFileSyncMock.mockImplementation(() => {
        throw new Error('ENOENT');
      });

      const result = readRunFileEpic('/path/to/run.json');

      expect(result).toBeNull();
    });
  });

  describe('findRunFileByEpicId', () => {
    it('returns null when runs directory does not exist', () => {
      existsSyncMock.mockReturnValue(false);

      const result = findRunFileByEpicId('any-epic');

      expect(result).toBeNull();
    });
  });
});
