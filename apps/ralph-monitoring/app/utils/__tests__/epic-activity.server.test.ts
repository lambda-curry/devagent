import { describe, expect, it, vi } from 'vitest';
import {
  parseCommitComment,
  getEpicActivity
} from '../epic-activity.server';
import * as beadsServer from '~/db/beads.server';

vi.mock('~/db/beads.server');

describe('epic-activity.server', () => {
  describe('parseCommitComment', () => {
    it('returns { sha, message } when first line matches "Commit: <sha> - <message>"', () => {
      const body = `Commit: abc1234 - feat: add new feature

## Summary

**Changes:**
- Added new component`;
      expect(parseCommitComment(body)).toEqual({
        sha: 'abc1234',
        message: 'feat: add new feature'
      });
    });

    it('trims the message part', () => {
      expect(parseCommitComment('Commit: xyz -   fix: bug   ')).toEqual({
        sha: 'xyz',
        message: 'fix: bug'
      });
    });

    it('accepts sha with multiple segments (e.g. short hash)', () => {
      expect(parseCommitComment('Commit: a1b2c3d - chore: release')).toEqual({
        sha: 'a1b2c3d',
        message: 'chore: release'
      });
    });

    it('returns null for empty or whitespace-only body', () => {
      expect(parseCommitComment('')).toBeNull();
      expect(parseCommitComment('   \n  ')).toBeNull();
    });

    it('returns null when first line does not match commit format', () => {
      expect(parseCommitComment('Just some text')).toBeNull();
      expect(parseCommitComment('Commit: no dash here')).toBeNull();
      expect(parseCommitComment('commit: abc - lowercase')).toBeNull();
    });

    it('returns null for non-string input', () => {
      expect(parseCommitComment(null as unknown as string)).toBeNull();
      expect(parseCommitComment(undefined as unknown as string)).toBeNull();
    });
  });

  describe('getEpicActivity', () => {
    const epicId = 'devagent-epic-1';

    it('returns unified list ordered by timestamp descending (most recent first)', () => {
      vi.mocked(beadsServer.getExecutionLogs).mockReturnValue([
        {
          task_id: 'devagent-epic-1.1',
          agent_type: 'engineering',
          started_at: '2026-02-03T10:00:00Z',
          ended_at: '2026-02-03T10:05:00Z',
          status: 'success',
          iteration: 1,
          log_file_path: null
        }
      ]);
      vi.mocked(beadsServer.getCommentsForEpicTasks).mockReturnValue([
        {
          id: 1,
          issue_id: 'devagent-epic-1.1',
          author: 'Agent',
          body: 'Commit: abc - feat: thing',
          created_at: '2026-02-03T11:00:00Z'
        }
      ]);
      vi.mocked(beadsServer.getTasksByEpicId).mockReturnValue([
        {
          id: 'devagent-epic-1.1',
          title: 'Task 1',
          description: null,
          design: null,
          acceptance_criteria: null,
          notes: null,
          status: 'closed',
          priority: null,
          parent_id: 'devagent-epic-1',
          created_at: '2026-02-03T09:00:00Z',
          updated_at: '2026-02-03T11:30:00Z',
          agent_type: null
        }
      ] as beadsServer.EpicTask[]);

      const result = getEpicActivity(epicId);

      // Order: status (11:30) > comment (11:00) > execution (10:00)
      expect(result.length).toBe(3);
      expect(result[0].type).toBe('status');
      expect((result[0] as { timestamp: string }).timestamp).toBe('2026-02-03T11:30:00Z');
      expect(result[1].type).toBe('comment');
      expect((result[1] as { timestamp: string }).timestamp).toBe('2026-02-03T11:00:00Z');
      expect(result[2].type).toBe('execution');
      expect((result[2] as { timestamp: string }).timestamp).toBe('2026-02-03T10:00:00Z');
    });

    it('parses commit comments into structured commit field', () => {
      vi.mocked(beadsServer.getExecutionLogs).mockReturnValue([]);
      vi.mocked(beadsServer.getCommentsForEpicTasks).mockReturnValue([
        {
          id: 2,
          issue_id: 'devagent-epic-1.2',
          author: 'Ralph',
          body: 'Commit: deadbeef - fix(api): handle null',
          created_at: '2026-02-03T12:00:00Z'
        }
      ]);
      vi.mocked(beadsServer.getTasksByEpicId).mockReturnValue([]);

      const result = getEpicActivity(epicId);
      const commentItem = result.find(r => r.type === 'comment') as {
        type: 'comment';
        commit?: { sha: string; message: string };
      };
      expect(commentItem).toBeDefined();
      expect(commentItem.commit).toEqual({ sha: 'deadbeef', message: 'fix(api): handle null' });
    });

    it('handles missing execution logs gracefully (empty array)', () => {
      vi.mocked(beadsServer.getExecutionLogs).mockReturnValue([]);
      vi.mocked(beadsServer.getCommentsForEpicTasks).mockReturnValue([]);
      vi.mocked(beadsServer.getTasksByEpicId).mockReturnValue([
        {
          id: epicId,
          title: 'Epic',
          description: null,
          design: null,
          acceptance_criteria: null,
          notes: null,
          status: 'open',
          priority: null,
          parent_id: null,
          created_at: '2026-02-03T08:00:00Z',
          updated_at: '2026-02-03T08:00:00Z',
          agent_type: null
        }
      ] as beadsServer.EpicTask[]);

      const result = getEpicActivity(epicId);
      expect(result.length).toBe(1);
      expect(result[0].type).toBe('status');
    });

    it('handles empty comments gracefully', () => {
      vi.mocked(beadsServer.getExecutionLogs).mockReturnValue([]);
      vi.mocked(beadsServer.getCommentsForEpicTasks).mockReturnValue([]);
      vi.mocked(beadsServer.getTasksByEpicId).mockReturnValue([]);

      const result = getEpicActivity(epicId);
      expect(result).toEqual([]);
    });
  });
});
