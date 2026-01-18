import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createTestDatabase } from '../../lib/test-utils/testDatabase';
import { seedDatabase } from './seed-data';
import type { BeadsTask, BeadsComment } from '../beads.server';
import { spawnSync } from 'node:child_process';

vi.mock('node:child_process', () => ({
  spawnSync: vi.fn()
}));

// Import functions dynamically to allow module reset between tests
import type { TaskFilters } from '../beads.server';

let getActiveTasks: () => BeadsTask[];
let getAllTasks: (filters?: TaskFilters) => BeadsTask[];
let getTaskById: (taskId: string) => BeadsTask | null;
let getTaskComments: (taskId: string) => BeadsComment[];
let getTaskCommentCount: (taskId: string) => number;
let getTaskCommentCounts: (taskIds: string[]) => Map<string, number>;

// Helper to reload the module and get fresh functions
async function reloadModule() {
  vi.resetModules();
  const beadsServer = await import('../beads.server');
  getActiveTasks = beadsServer.getActiveTasks;
  getAllTasks = beadsServer.getAllTasks;
  getTaskById = beadsServer.getTaskById;
  getTaskComments = beadsServer.getTaskComments;
  getTaskCommentCount = beadsServer.getTaskCommentCount;
  getTaskCommentCounts = beadsServer.getTaskCommentCounts;
}

describe('beads.server', () => {
  let testDb: ReturnType<typeof createTestDatabase> | null = null;
  let originalBeadsDb: string | undefined;

  beforeEach(async () => {
    // Save original BEADS_DB value
    originalBeadsDb = process.env.BEADS_DB;

    // Create test database
    testDb = createTestDatabase();

    // Set BEADS_DB environment variable to test database path
    process.env.BEADS_DB = testDb.path;

    // Reset module cache to pick up new BEADS_DB value
    await reloadModule();
  });

  afterEach(() => {
    // Clean up test database
    if (testDb) {
      testDb.cleanup();
      testDb = null;
    }

    // Restore original BEADS_DB or remove it
    if (originalBeadsDb !== undefined) {
      process.env.BEADS_DB = originalBeadsDb;
    } else {
      delete process.env.BEADS_DB;
    }

    // Reset module cache for next test
    vi.resetModules();
  });

  describe('getActiveTasks', () => {
    it('should return empty array when database has no active tasks', () => {
      // Database is empty (no seed data)
      const tasks = getActiveTasks();
      expect(tasks).toEqual([]);
    });

    it('should return only open and in_progress tasks', async () => {
      if (!testDb) throw new Error('Test database not initialized');
      
      seedDatabase(testDb.db, 'basic');
      
      // Reset module to pick up database changes
      await reloadModule();

      const tasks = getActiveTasks();
      
      // Verify all returned tasks are active
      expect(tasks.length).toBeGreaterThan(0);
      tasks.forEach(task => {
        expect(['open', 'in_progress']).toContain(task.status);
      });

      // Verify ordering: in_progress first, then open, ordered by updated_at DESC
      const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
      const openTasks = tasks.filter(t => t.status === 'open');
      
      // All in_progress tasks should come before open tasks
      if (inProgressTasks.length > 0 && openTasks.length > 0) {
        const lastInProgressIndex = tasks.lastIndexOf(inProgressTasks[inProgressTasks.length - 1]);
        const firstOpenIndex = tasks.indexOf(openTasks[0]);
        expect(lastInProgressIndex).toBeLessThan(firstOpenIndex);
      }
    });
  });

  describe('getTaskById', () => {
    it('should return null when task does not exist', () => {
      // Database exists but is empty
      const task = getTaskById('bd-1001');
      expect(task).toBeNull();
    });

    it('should return task by id when it exists', async () => {
      if (!testDb) throw new Error('Test database not initialized');
      
      seedDatabase(testDb.db, 'basic');
      
      // Reset module to pick up database changes
      await reloadModule();

      const task = getTaskById('bd-1001');
      
      expect(task).not.toBeNull();
      expect(task?.id).toBe('bd-1001');
      expect(task?.title).toBe('Implement user authentication');
      expect(task?.status).toBe('open');
      expect(task?.priority).toBe('P1');
    });

    it('should compute parent_id correctly for hierarchical IDs', async () => {
      if (!testDb) throw new Error('Test database not initialized');
      
      seedDatabase(testDb.db, 'hierarchy');
      
      // Reset module to pick up database changes
      await reloadModule();

      // Test parent task (no parent)
      const parent = getTaskById('bd-3001');
      expect(parent).not.toBeNull();
      expect(parent?.parent_id).toBeNull();

      // Test child task
      const child = getTaskById('bd-3001.1');
      expect(child).not.toBeNull();
      expect(child?.parent_id).toBe('bd-3001');

      // Test grandchild task
      const grandchild = getTaskById('bd-3001.2.1');
      expect(grandchild).not.toBeNull();
      expect(grandchild?.parent_id).toBe('bd-3001.2');
    });
  });

  describe('getAllTasks - Status Filtering', () => {
    beforeEach(async () => {
      if (!testDb) throw new Error('Test database not initialized');
      seedDatabase(testDb.db, 'basic');
      
      // Reset module to pick up database changes
      await reloadModule();
    });

    it('should return all tasks when no filters provided', () => {
      const tasks = getAllTasks();
      expect(tasks.length).toBe(8); // basic scenario has 8 tasks
    });

    it('should filter by status: open', () => {
      const tasks = getAllTasks({ status: 'open' });
      
      expect(tasks.length).toBeGreaterThan(0);
      tasks.forEach(task => {
        expect(task.status).toBe('open');
      });
    });

    it('should filter by status: in_progress', () => {
      const tasks = getAllTasks({ status: 'in_progress' });
      
      expect(tasks.length).toBeGreaterThan(0);
      tasks.forEach(task => {
        expect(task.status).toBe('in_progress');
      });
    });

    it('should filter by status: closed', () => {
      const tasks = getAllTasks({ status: 'closed' });
      
      expect(tasks.length).toBeGreaterThan(0);
      tasks.forEach(task => {
        expect(task.status).toBe('closed');
      });
    });

    it('should filter by status: blocked', () => {
      const tasks = getAllTasks({ status: 'blocked' });
      
      expect(tasks.length).toBeGreaterThan(0);
      tasks.forEach(task => {
        expect(task.status).toBe('blocked');
      });
    });

    it('should return all tasks when status is "all"', () => {
      const allTasks = getAllTasks();
      const filteredTasks = getAllTasks({ status: 'all' });
      
      expect(filteredTasks.length).toBe(allTasks.length);
    });
  });

  describe('getAllTasks - Priority Filtering', () => {
    beforeEach(async () => {
      if (!testDb) throw new Error('Test database not initialized');
      seedDatabase(testDb.db, 'basic');
      
      // Reset module to pick up database changes
      await reloadModule();
    });

    it('should filter by priority: P0', () => {
      const tasks = getAllTasks({ priority: 'P0' });
      
      expect(tasks.length).toBeGreaterThan(0);
      tasks.forEach(task => {
        expect(task.priority).toBe('P0');
      });
    });

    it('should filter by priority: P1', () => {
      const tasks = getAllTasks({ priority: 'P1' });
      
      expect(tasks.length).toBeGreaterThan(0);
      tasks.forEach(task => {
        expect(task.priority).toBe('P1');
      });
    });

    it('should filter by priority: P2', () => {
      const tasks = getAllTasks({ priority: 'P2' });
      
      expect(tasks.length).toBeGreaterThan(0);
      tasks.forEach(task => {
        expect(task.priority).toBe('P2');
      });
    });

    it('should filter by priority: P3', () => {
      const tasks = getAllTasks({ priority: 'P3' });
      
      expect(tasks.length).toBeGreaterThan(0);
      tasks.forEach(task => {
        expect(task.priority).toBe('P3');
      });
    });

    it('should return empty array for non-existent priority', () => {
      const tasks = getAllTasks({ priority: 'P99' });
      expect(tasks).toEqual([]);
    });
  });

  describe('getAllTasks - Search Filtering', () => {
    beforeEach(async () => {
      if (!testDb) throw new Error('Test database not initialized');
      seedDatabase(testDb.db, 'search');
      
      // Reset module to pick up database changes
      await reloadModule();
    });

    it('should search in title (case-insensitive)', () => {
      const tasks = getAllTasks({ search: 'authentication' });
      
      expect(tasks.length).toBeGreaterThan(0);
      tasks.forEach(task => {
        const titleLower = task.title.toLowerCase();
        const descLower = (task.description || '').toLowerCase();
        expect(titleLower.includes('authentication') || descLower.includes('authentication')).toBe(true);
      });
    });

    it('should search in description (case-insensitive)', () => {
      const tasks = getAllTasks({ search: 'OAuth2' });
      
      expect(tasks.length).toBeGreaterThan(0);
      tasks.forEach(task => {
        const titleLower = task.title.toLowerCase();
        const descLower = (task.description || '').toLowerCase();
        expect(titleLower.includes('oauth2') || descLower.includes('oauth2')).toBe(true);
      });
    });

    it('should search in both title and description', () => {
      const tasks = getAllTasks({ search: 'database' });
      
      expect(tasks.length).toBeGreaterThan(0);
      tasks.forEach(task => {
        const titleLower = task.title.toLowerCase();
        const descLower = (task.description || '').toLowerCase();
        expect(titleLower.includes('database') || descLower.includes('database')).toBe(true);
      });
    });

    it('should return empty array for non-matching search', () => {
      const tasks = getAllTasks({ search: 'nonexistentkeyword12345' });
      expect(tasks).toEqual([]);
    });

    it('should handle partial matches', () => {
      const tasks = getAllTasks({ search: 'auth' });
      
      expect(tasks.length).toBeGreaterThan(0);
      tasks.forEach(task => {
        const titleLower = task.title.toLowerCase();
        const descLower = (task.description || '').toLowerCase();
        expect(titleLower.includes('auth') || descLower.includes('auth')).toBe(true);
      });
    });
  });

  describe('getAllTasks - Combined Filters', () => {
    beforeEach(async () => {
      if (!testDb) throw new Error('Test database not initialized');
      seedDatabase(testDb.db, 'basic');
      
      // Reset module to pick up database changes
      await reloadModule();
    });

    it('should combine status and priority filters', () => {
      const tasks = getAllTasks({ status: 'open', priority: 'P1' });
      
      tasks.forEach(task => {
        expect(task.status).toBe('open');
        expect(task.priority).toBe('P1');
      });
    });

    it('should combine status and search filters', async () => {
      // Clear database and seed with search scenario for this test
      testDb!.db.prepare('DELETE FROM issues').run();
      seedDatabase(testDb!.db, 'search');
      
      // Reset module to pick up database changes
      await reloadModule();

      const tasks = getAllTasks({ status: 'in_progress', search: 'authentication' });
      
      tasks.forEach(task => {
        expect(task.status).toBe('in_progress');
        const titleLower = task.title.toLowerCase();
        const descLower = (task.description || '').toLowerCase();
        expect(titleLower.includes('authentication') || descLower.includes('authentication')).toBe(true);
      });
    });

    it('should combine priority and search filters', async () => {
      // Clear database and seed with search scenario for this test
      testDb!.db.prepare('DELETE FROM issues').run();
      seedDatabase(testDb!.db, 'search');
      
      // Reset module to pick up database changes
      await reloadModule();

      const tasks = getAllTasks({ priority: 'P1', search: 'database' });
      
      tasks.forEach(task => {
        expect(task.priority).toBe('P1');
        const titleLower = task.title.toLowerCase();
        const descLower = (task.description || '').toLowerCase();
        expect(titleLower.includes('database') || descLower.includes('database')).toBe(true);
      });
    });

    it('should combine all three filters', async () => {
      // Clear database and seed with search scenario for this test
      testDb!.db.prepare('DELETE FROM issues').run();
      seedDatabase(testDb!.db, 'search');
      
      // Reset module to pick up database changes
      await reloadModule();

      const tasks = getAllTasks({ status: 'in_progress', priority: 'P1', search: 'database' });
      
      tasks.forEach(task => {
        expect(task.status).toBe('in_progress');
        expect(task.priority).toBe('P1');
        const titleLower = task.title.toLowerCase();
        const descLower = (task.description || '').toLowerCase();
        expect(titleLower.includes('database') || descLower.includes('database')).toBe(true);
      });
    });
  });

  describe('getAllTasks - Ordering', () => {
    beforeEach(async () => {
      if (!testDb) throw new Error('Test database not initialized');
      seedDatabase(testDb.db, 'basic');
      
      // Reset module to pick up database changes
      await reloadModule();
    });

    it('should order by status (in_progress, open, closed, blocked) then updated_at DESC', () => {
      const tasks = getAllTasks();
      
      expect(tasks.length).toBeGreaterThan(0);
      
      // Group tasks by status
      const statusGroups: Record<string, BeadsTask[]> = {};
      tasks.forEach(task => {
        if (!statusGroups[task.status]) {
          statusGroups[task.status] = [];
        }
        statusGroups[task.status].push(task);
      });

      // Verify ordering within status groups (updated_at DESC)
      Object.values(statusGroups).forEach(group => {
        if (group.length > 1) {
          for (let i = 0; i < group.length - 1; i++) {
            const current = new Date(group[i].updated_at).getTime();
            const next = new Date(group[i + 1].updated_at).getTime();
            expect(current).toBeGreaterThanOrEqual(next);
          }
        }
      });

      // Verify status ordering: in_progress comes before open, open before closed, etc.
      const statusOrder = ['in_progress', 'open', 'closed', 'blocked'];
      let lastStatusIndex = -1;
      
      tasks.forEach(task => {
        const currentStatusIndex = statusOrder.indexOf(task.status);
        expect(currentStatusIndex).toBeGreaterThanOrEqual(lastStatusIndex);
        lastStatusIndex = currentStatusIndex;
      });
    });

    it('should maintain ordering when filters are applied', () => {
      const tasks = getAllTasks({ status: 'open' });
      
      if (tasks.length > 1) {
        // Verify updated_at DESC ordering
        for (let i = 0; i < tasks.length - 1; i++) {
          const current = new Date(tasks[i].updated_at).getTime();
          const next = new Date(tasks[i + 1].updated_at).getTime();
          expect(current).toBeGreaterThanOrEqual(next);
        }
      }
    });
  });

  describe('Edge Cases', () => {
    it('should return empty array when database is empty', () => {
      // Database exists but has no data
      const tasks = getAllTasks();
      expect(tasks).toEqual([]);
    });

    it('should handle null description gracefully', async () => {
      if (!testDb) throw new Error('Test database not initialized');
      seedDatabase(testDb.db, 'basic');
      
      // Reset module to pick up database changes
      await reloadModule();

      const tasks = getAllTasks();
      
      // Should not throw and should handle null descriptions
      tasks.forEach(task => {
        expect(task.description === null || typeof task.description === 'string').toBe(true);
      });
    });

    it('should handle null priority gracefully', async () => {
      if (!testDb) throw new Error('Test database not initialized');
      seedDatabase(testDb.db, 'basic');
      
      // Reset module to pick up database changes
      await reloadModule();

      const tasks = getAllTasks();
      
      // Should include tasks with null priority
      const tasksWithNullPriority = tasks.filter(t => t.priority === null);
      expect(tasksWithNullPriority.length).toBeGreaterThan(0);
    });
  });

  describe('Comment Retrieval Helpers', () => {
    const mockSpawnSync = vi.mocked(spawnSync);

    beforeEach(async () => {
      mockSpawnSync.mockReset();
      // Reload module to get fresh functions
      await reloadModule();
    });

    describe('getTaskComments', () => {
      it('should map CLI comment text to body', () => {
        mockSpawnSync.mockReturnValue({
          status: 0,
          stdout: JSON.stringify([{ text: 'Hello', created_at: '2026-01-01T00:00:00Z' }])
        } as ReturnType<typeof spawnSync>);

        const comments = getTaskComments('devagent-201a.1');

        expect(comments).toEqual([
          { body: 'Hello', created_at: '2026-01-01T00:00:00Z' }
        ]);
      });

      it('should return empty array for non-zero CLI status', () => {
        mockSpawnSync.mockReturnValue({
          status: 1,
          stdout: ''
        } as ReturnType<typeof spawnSync>);

        const comments = getTaskComments('invalid-task-id');

        expect(comments).toEqual([]);
      });

      it('should return empty array on CLI exceptions', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        mockSpawnSync.mockImplementation(() => {
          throw new Error('spawn failed');
        });

        const comments = getTaskComments('devagent-201a.2');

        expect(comments).toEqual([]);
        expect(warnSpy).toHaveBeenCalled();
        warnSpy.mockRestore();
      });
    });

    describe('getTaskCommentCount', () => {
      it('should return numeric count for task', () => {
        mockSpawnSync.mockReturnValue({
          status: 0,
          stdout: JSON.stringify([
            { text: 'One', created_at: '2026-01-01T00:00:00Z' },
            { text: 'Two', created_at: '2026-01-02T00:00:00Z' }
          ])
        } as ReturnType<typeof spawnSync>);

        const count = getTaskCommentCount('devagent-201a.1');

        expect(count).toBe(2);
      });

      it('should return 0 when CLI returns error', () => {
        mockSpawnSync.mockReturnValue({
          status: 1,
          stdout: ''
        } as ReturnType<typeof spawnSync>);

        const count = getTaskCommentCount('invalid-task-id');

        expect(count).toBe(0);
      });
    });

    describe('getTaskCommentCounts', () => {
      it('should return map of task IDs to comment counts', () => {
        mockSpawnSync.mockImplementation((_cmd, args) => {
          const taskId = args?.[1] as string | undefined;
          if (taskId === 'devagent-201a.1') {
            return {
              status: 0,
              stdout: JSON.stringify([{ text: 'One', created_at: '2026-01-01T00:00:00Z' }])
            } as ReturnType<typeof spawnSync>;
          }
          return {
            status: 1,
            stdout: ''
          } as ReturnType<typeof spawnSync>;
        });

        const counts = getTaskCommentCounts(['devagent-201a.1', 'invalid-task']);

        expect(counts.get('devagent-201a.1')).toBe(1);
        expect(counts.get('invalid-task')).toBe(0);
      });

      it('should return empty map for empty task IDs array', () => {
        const counts = getTaskCommentCounts([]);
        
        expect(counts instanceof Map).toBe(true);
        expect(counts.size).toBe(0);
      });
    });
  });
});
