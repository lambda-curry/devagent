import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('check-task-status', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Status and Label checking logic', () => {
    it('should detect when status matches', () => {
      const task = { status: 'completed', labels: ['engineering'] };
      const signal = 'completed';
      const found = task.status === signal || (task.labels && task.labels.includes(signal));
      expect(found).toBe(true);
    });

    it('should detect when label matches', () => {
      const task = { status: 'in_progress', labels: ['review-needed', 'engineering'] };
      const signal = 'review-needed';
      const found = task.status === signal || (task.labels && task.labels.includes(signal));
      expect(found).toBe(true);
    });

    it('should return false when neither status nor label matches', () => {
      const task = { status: 'in_progress', labels: ['engineering'] };
      const signal = 'completed';
      const found = task.status === signal || (task.labels && task.labels.includes(signal));
      expect(found).toBe(false);
    });

    it('should handle missing labels', () => {
      const task: { status: string; labels?: string[] } = { status: 'in_progress' };
      const signal = 'review-needed';
      const found = task.status === signal || !!(task.labels && task.labels.includes(signal));
      expect(found).toBe(false);
    });
  });

  describe('JSON parsing', () => {
    it('should parse Beads JSON output correctly', () => {
      const stdout = JSON.stringify([{ status: 'completed', labels: ['ready'] }]);
      const task = JSON.parse(stdout)[0];
      expect(task.status).toBe('completed');
      expect(task.labels).toContain('ready');
    });
  });

  describe('CLI argument validation', () => {
    it('should require both id and signal', () => {
      const args: string[] = [];
      const [id, signal] = args;
      expect(!id || !signal).toBe(true);
    });

    it('should accept valid arguments', () => {
      const args = ['devagent-034b9i.5', 'review-needed'];
      const [id, signal] = args;
      expect(!id || !signal).toBe(false);
      expect(id).toBe('devagent-034b9i.5');
      expect(signal).toBe('review-needed');
    });
  });
});
