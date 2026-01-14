import { describe, it, expect } from 'vitest';
import { getActiveTasks, getTaskById } from '../beads.server';

// Simple test to verify the functions exist and handle missing database gracefully
describe('beads.server', () => {
  it('should return empty array when database does not exist', () => {
    const tasks = getActiveTasks();
    expect(Array.isArray(tasks)).toBe(true);
  });

  it('should return null for task by id when database does not exist', () => {
    const task = getTaskById('test-1');
    expect(task).toBeNull();
  });
});
