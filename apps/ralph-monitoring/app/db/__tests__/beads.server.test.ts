import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createTestDatabase } from '../../lib/test-utils/testDatabase';
import { seedDatabase } from './seed-data';
import type { BeadsTask, BeadsComment } from '../beads.server';

// Import functions dynamically to allow module reset between tests
import type { TaskFilters } from '../beads.server';

let getActiveTasks: () => BeadsTask[];
let getAllTasks: (filters?: TaskFilters) => BeadsTask[];
let getTaskById: (taskId: string) => BeadsTask | null;
let getTaskCommentsDirect: (taskId: string) => BeadsComment[];
let getExecutionLogs: (epicId: string) => import('../beads.types').RalphExecutionLog[];
let getEpics: () => import('../beads.server').EpicSummary[];
let computeDurationMs: (startedAt: string | null | undefined, endedAt: string | null | undefined) => number | null;
let formatDurationMs: (ms: number | null | undefined) => string;

// Helper to reload the module and get fresh functions
async function reloadModule() {
  vi.resetModules();
  const beadsServer = await import('../beads.server');
  getActiveTasks = beadsServer.getActiveTasks;
  getAllTasks = beadsServer.getAllTasks;
  getTaskById = beadsServer.getTaskById;
  getTaskCommentsDirect = beadsServer.getTaskCommentsDirect;
  getExecutionLogs = beadsServer.getExecutionLogs;
  getEpics = beadsServer.getEpics;
  computeDurationMs = beadsServer.computeDurationMs;
  formatDurationMs = beadsServer.formatDurationMs;
}

describe('beads.server', () => {
  /**
   * Testing philosophy (pragmatic + contract-focused)
   *
   * We are not testing Beads itself.
   * We *are* testing our adapter layer (`beads.server.ts`) which:
   * - Reads the Beads SQLite DB and shapes it into our `BeadsTask` model
   * - Implements our own filtering/ordering semantics (SQL + JS transforms)
   * - Computes derived fields (e.g. `parent_id` from hierarchical IDs)
   * - Normalizes Beads-sourced text at the boundary
   * - Integrates with the `bd` CLI and classifies failures/timeouts
   * - Applies a concurrency cap to protect our server from fan-out
   *
   * Practical guardrails:
   * - Prefer a few high-signal contract tests over exhaustive combinatorics.
   * - Only add a new test when it protects an invariant we rely on or a past regression.
   * - Avoid re-testing generic SQL behavior (“priority filter returns priority”) unless it’s easy to regress.
   */
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

    it('should normalize CRLF and literal \\\\n sequences in task text fields', async () => {
      if (!testDb) throw new Error('Test database not initialized');

      const now = new Date().toISOString();
      testDb.db
        .prepare(
          `
          INSERT INTO issues (id, title, description, design, acceptance_criteria, notes, status, priority, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        )
        .run(
          'bd-9999',
          'Normalization test',
          'Line 1\\\\nLine 2\\r\\nLine 3',
          'Design A\\r\\nDesign B',
          'Accept\\\\nOne\\r\\nAccept Two',
          'Notes\\\\nOne',
          'open',
          'P2',
          now,
          now,
        );

      await reloadModule();

      const task = getTaskById('bd-9999');
      expect(task).not.toBeNull();
      expect(task?.description).toBe('Line 1\nLine 2\nLine 3');
      expect(task?.design).toBe('Design A\nDesign B');
      expect(task?.acceptance_criteria).toBe('Accept\nOne\nAccept Two');
      expect(task?.notes).toBe('Notes\nOne');
    });

    it('includes started_at, ended_at, duration_ms when execution log exists', async () => {
      if (!testDb) throw new Error('Test database not initialized');
      seedDatabase(testDb.db, 'basic');
      const start = '2026-01-15T10:00:00.000Z';
      const end = '2026-01-15T10:05:00.000Z';
      testDb.db
        .prepare(
          `INSERT INTO ralph_execution_log (task_id, agent_type, started_at, ended_at, status, iteration)
           VALUES (?, ?, ?, ?, ?, ?)`,
        )
        .run('bd-1001', 'engineering', start, end, 'success', 1);
      await reloadModule();

      const task = getTaskById('bd-1001');
      expect(task).not.toBeNull();
      expect(task?.started_at).toBe(start);
      expect(task?.ended_at).toBe(end);
      expect(task?.duration_ms).toBeGreaterThanOrEqual(299_000);
      expect(task?.duration_ms).toBeLessThanOrEqual(301_000);
    });

    it('returns null timing fields when task has no execution log', async () => {
      if (!testDb) throw new Error('Test database not initialized');
      seedDatabase(testDb.db, 'basic');
      await reloadModule();

      const task = getTaskById('bd-1003');
      expect(task).not.toBeNull();
      expect(task?.started_at).toBeNull();
      expect(task?.ended_at).toBeNull();
      expect(task?.duration_ms).toBeNull();
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

    it.each([
      ['open'],
      ['in_progress'],
      ['closed'],
      ['blocked'],
    ] satisfies Array<[Exclude<NonNullable<TaskFilters['status']>, 'all'>]>)(
      'should filter by status: %s',
      (status) => {
        const tasks = getAllTasks({ status });

        expect(tasks.length).toBeGreaterThan(0);
        tasks.forEach((task) => {
          expect(task.status).toBe(status);
        });
      },
    );

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

    it.each([['P0'], ['P1'], ['P2'], ['P3']])('should filter by priority: %s', (priority) => {
      const tasks = getAllTasks({ priority });

      expect(tasks.length).toBeGreaterThan(0);
      tasks.forEach((task) => {
        expect(task.priority).toBe(priority);
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

    it.each([['authentication'], ['OAuth2'], ['database']])(
      'should match case-insensitively in title OR description for: %s',
      (search) => {
        const tasks = getAllTasks({ search });

        expect(tasks.length).toBeGreaterThan(0);
        tasks.forEach((task) => {
          const titleLower = task.title.toLowerCase();
          const descLower = (task.description || '').toLowerCase();
          expect(titleLower.includes(search.toLowerCase()) || descLower.includes(search.toLowerCase())).toBe(true);
        });
      },
    );

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
    });

    it('should combine filters with AND semantics (status + priority + search)', async () => {
      seedDatabase(testDb!.db, 'search');
      await reloadModule();

      const tasks = getAllTasks({ status: 'in_progress', priority: 'P1', search: 'database' });

      expect(tasks.length).toBeGreaterThan(0);
      tasks.forEach((task) => {
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
  });

  describe('getExecutionLogs', () => {
    it('should return empty array when no execution logs exist for epic', async () => {
      if (!testDb) throw new Error('Test database not initialized');
      seedDatabase(testDb.db, 'basic');
      await reloadModule();

      const logs = getExecutionLogs('devagent-ralph-dashboard-2026-01-30');
      expect(logs).toEqual([]);
    });

    it('should return logs for epic and descendants ordered by started_at DESC', async () => {
      if (!testDb) throw new Error('Test database not initialized');
      seedDatabase(testDb.db, 'basic');
      const epicId = 'devagent-ralph-dashboard-2026-01-30';
      const now = new Date().toISOString();
      const earlier = new Date(Date.now() - 60_000).toISOString();
      testDb.db
        .prepare(
          `INSERT INTO ralph_execution_log (task_id, agent_type, started_at, ended_at, status, iteration)
           VALUES (?, ?, ?, ?, ?, ?)`
        )
        .run(epicId, 'project-manager', earlier, now, 'success', 1);
      testDb.db
        .prepare(
          `INSERT INTO ralph_execution_log (task_id, agent_type, started_at, ended_at, status, iteration)
           VALUES (?, ?, ?, ?, ?, ?)`
        )
        .run(`${epicId}.exec-log-schema`, 'engineering', now, now, 'success', 2);
      await reloadModule();

      const logs = getExecutionLogs(epicId);
      expect(logs).toHaveLength(2);
      expect(logs[0].task_id).toBe(`${epicId}.exec-log-schema`);
      expect(logs[0].agent_type).toBe('engineering');
      expect(logs[0].status).toBe('success');
      expect(logs[0].iteration).toBe(2);
      expect(logs[1].task_id).toBe(epicId);
      expect(logs[1].agent_type).toBe('project-manager');
      expect(logs[1].iteration).toBe(1);
    });

    it('should not return logs for other epics', async () => {
      if (!testDb) throw new Error('Test database not initialized');
      seedDatabase(testDb.db, 'basic');
      testDb.db
        .prepare(
          `INSERT INTO ralph_execution_log (task_id, agent_type, started_at, ended_at, status, iteration)
           VALUES (?, ?, ?, ?, ?, ?)`
        )
        .run('other-epic-123', 'qa', new Date().toISOString(), new Date().toISOString(), 'success', 1);
      await reloadModule();

      const logs = getExecutionLogs('devagent-ralph-dashboard-2026-01-30');
      expect(logs).toEqual([]);
    });

    it('should return logs with null ended_at (running task) with correct shape', async () => {
      if (!testDb) throw new Error('Test database not initialized');
      seedDatabase(testDb.db, 'basic');
      const epicId = 'devagent-ralph-dashboard-2026-01-30';
      const startedAt = new Date().toISOString();
      testDb.db
        .prepare(
          `INSERT INTO ralph_execution_log (task_id, agent_type, started_at, ended_at, status, iteration)
           VALUES (?, ?, ?, ?, ?, ?)`
        )
        .run(epicId, 'engineering', startedAt, null, 'running', 1);
      await reloadModule();

      const logs = getExecutionLogs(epicId);
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({
        task_id: epicId,
        agent_type: 'engineering',
        started_at: startedAt,
        status: 'running',
        iteration: 1,
      });
      expect(logs[0].ended_at).toBeNull();
    });
  });

  describe('getEpics', () => {
    it('returns empty array when database has no epics', () => {
      const epics = getEpics();
      expect(epics).toEqual([]);
    });

    it('returns only root-level tasks (no dot in id) with task/completed counts and progress', async () => {
      if (!testDb) throw new Error('Test database not initialized');
      seedDatabase(testDb.db, 'hierarchy');
      await reloadModule();

      const epics = getEpics();
      expect(epics.length).toBe(3);

      const byId = Object.fromEntries(epics.map((e) => [e.id, e]));

      // bd-3001: 4 children (bd-3001.1, bd-3001.2, bd-3001.3, bd-3001.2.1), 1 closed
      expect(byId['bd-3001']).toBeDefined();
      expect(byId['bd-3001']?.title).toBe('Implement user dashboard feature');
      expect(byId['bd-3001']?.task_count).toBe(4);
      expect(byId['bd-3001']?.completed_count).toBe(1);
      expect(byId['bd-3001']?.progress_pct).toBe(25);

      // bd-3002: 3 children, 1 closed
      expect(byId['bd-3002']?.task_count).toBe(3);
      expect(byId['bd-3002']?.completed_count).toBe(1);
      expect(byId['bd-3002']?.progress_pct).toBe(33);

      // bd-3003: 2 children, both closed
      expect(byId['bd-3003']?.task_count).toBe(2);
      expect(byId['bd-3003']?.completed_count).toBe(2);
      expect(byId['bd-3003']?.progress_pct).toBe(100);

      epics.forEach((e) => {
        expect(e).toMatchObject({
          id: expect.any(String),
          title: expect.any(String),
          status: expect.stringMatching(/^(open|in_progress|closed|blocked)$/),
          task_count: expect.any(Number),
          completed_count: expect.any(Number),
          progress_pct: expect.any(Number),
          updated_at: expect.any(String),
        });
      });
    });
  });

  describe('Duration helpers', () => {
    it('computeDurationMs returns null when either timestamp is missing', async () => {
      await reloadModule();
      expect(computeDurationMs(null, '2026-01-01T12:00:00Z')).toBeNull();
      expect(computeDurationMs('2026-01-01T12:00:00Z', null)).toBeNull();
      expect(computeDurationMs(undefined, '2026-01-01T12:00:00Z')).toBeNull();
      expect(computeDurationMs('2026-01-01T12:00:00Z', undefined)).toBeNull();
    });

    it('computeDurationMs returns ms from valid ISO timestamps', async () => {
      await reloadModule();
      const start = '2026-01-01T12:00:00.000Z';
      const end = '2026-01-01T12:02:30.500Z';
      const ms = computeDurationMs(start, end);
      expect(ms).toBe(150_500);
    });

    it('computeDurationMs returns null for invalid timestamps', async () => {
      await reloadModule();
      expect(computeDurationMs('not-a-date', '2026-01-01T12:00:00Z')).toBeNull();
      expect(computeDurationMs('2026-01-01T12:00:00Z', 'invalid')).toBeNull();
    });

    it('formatDurationMs returns human-readable string', async () => {
      await reloadModule();
      expect(formatDurationMs(500)).toBe('500ms');
      expect(formatDurationMs(90_000)).toBe('1m 30s');
      expect(formatDurationMs(3725000)).toBe('1h 2m 5s');
      expect(formatDurationMs(null)).toBe('');
      expect(formatDurationMs(undefined)).toBe('');
    });
  });

  describe('getAllTasks with duration (execution log join)', () => {
    it('includes started_at, ended_at, duration_ms from latest execution log', async () => {
      if (!testDb) throw new Error('Test database not initialized');
      seedDatabase(testDb.db, 'basic');
      const start = new Date(Date.now() - 120_000).toISOString();
      const end = new Date().toISOString();
      testDb.db
        .prepare(
          `INSERT INTO ralph_execution_log (task_id, agent_type, started_at, ended_at, status, iteration)
           VALUES (?, ?, ?, ?, ?, ?)`,
        )
        .run('bd-1001', 'engineering', start, end, 'success', 1);
      testDb.db
        .prepare(
          `INSERT INTO ralph_execution_log (task_id, agent_type, started_at, ended_at, status, iteration)
           VALUES (?, ?, ?, ?, ?, ?)`,
        )
        .run('bd-1002', 'qa', start, end, 'success', 1);
      await reloadModule();

      const tasks = getAllTasks();
      const byId = Object.fromEntries(tasks.map((t) => [t.id, t]));

      expect(byId['bd-1001']?.started_at).toBe(start);
      expect(byId['bd-1001']?.ended_at).toBe(end);
      expect(byId['bd-1001']?.duration_ms).toBeGreaterThanOrEqual(119_000);
      expect(byId['bd-1001']?.duration_ms).toBeLessThanOrEqual(121_000);

      expect(byId['bd-1002']?.started_at).toBe(start);
      expect(byId['bd-1002']?.ended_at).toBe(end);

      expect(byId['bd-1003']?.started_at).toBeNull();
      expect(byId['bd-1003']?.ended_at).toBeNull();
      expect(byId['bd-1003']?.duration_ms).toBeNull();
    });

    it('snapshot: task list shape with duration fields', async () => {
      if (!testDb) throw new Error('Test database not initialized');
      seedDatabase(testDb.db, 'basic');
      const start = '2026-01-15T10:00:00.000Z';
      const end = '2026-01-15T10:05:00.000Z';
      testDb.db
        .prepare(
          `INSERT INTO ralph_execution_log (task_id, agent_type, started_at, ended_at, status, iteration)
           VALUES (?, ?, ?, ?, ?, ?)`,
        )
        .run('bd-1001', 'engineering', start, end, 'success', 1);
      await reloadModule();

      const tasks = getAllTasks();
      const shape = tasks.map((t) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        started_at: t.started_at ?? null,
        ended_at: t.ended_at ?? null,
        duration_ms: t.duration_ms ?? null,
        log_file_path: t.log_file_path ?? null,
      }));

      // Find the task with execution log data and verify it has duration fields
      const taskWithExecLog = shape.find((t) => t.id === 'bd-1001');
      expect(taskWithExecLog).toBeDefined();
      expect(taskWithExecLog?.started_at).toBe(start);
      expect(taskWithExecLog?.ended_at).toBe(end);
      expect(taskWithExecLog?.duration_ms).toBeGreaterThan(0);
      expect(taskWithExecLog?.log_file_path).toBeNull(); // Old execution logs don't have log_file_path
    });
  });

  describe('Edge Cases', () => {
    it('should return empty array when database is empty', () => {
      // Database exists but has no data
      const tasks = getAllTasks();
      expect(tasks).toEqual([]);
    });

    it('should tolerate nullable fields (description/priority) without throwing', async () => {
      if (!testDb) throw new Error('Test database not initialized');
      seedDatabase(testDb.db, 'basic');
      
      // Reset module to pick up database changes
      await reloadModule();

      const tasks = getAllTasks();
      
      // Should not throw and should preserve nullable shapes
      tasks.forEach((task) => {
        expect(task.description === null || typeof task.description === 'string').toBe(true);
        expect(task.priority === null || typeof task.priority === 'string').toBe(true);
      });

      const tasksWithNullPriority = tasks.filter(t => t.priority === null);
      expect(tasksWithNullPriority.length).toBeGreaterThan(0);
    });
  });

  describe('Comment Retrieval Helpers', () => {
    beforeEach(async () => {
      await reloadModule();
    });

    describe('getTaskCommentsDirect', () => {
      it('returns [] when database is unavailable', async () => {
        process.env.BEADS_DB = '/nonexistent/beads.db';
        await reloadModule();

        const result = getTaskCommentsDirect('bd-1001');

        expect(result).toEqual([]);
      });

      it('returns [] for task with no comments', async () => {
        if (!testDb) throw new Error('Test database not initialized');
        seedDatabase(testDb.db, 'basic');
        await reloadModule();

        const result = getTaskCommentsDirect('bd-1001');

        expect(result).toEqual([]);
      });

      it('returns comments in BeadsComment format with normalized body', async () => {
        if (!testDb) throw new Error('Test database not initialized');
        seedDatabase(testDb.db, 'basic');
        const insert = testDb.db.prepare(
          'INSERT INTO comments (issue_id, author, text, created_at) VALUES (?, ?, ?, ?)'
        );
        insert.run('bd-1001', 'User', 'Hello world', '2026-01-01T00:00:00Z');
        insert.run('bd-1001', 'Claude', 'Line 1\\nLine 2', '2026-01-02T00:00:00Z');
        await reloadModule();

        const result = getTaskCommentsDirect('bd-1001');

        // Comments are now ordered DESC, so newest first
        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({ id: 2, author: 'Claude', body: 'Line 1\nLine 2', created_at: '2026-01-02T00:00:00Z' });
        expect(result[1]).toEqual({ id: 1, author: 'User', body: 'Hello world', created_at: '2026-01-01T00:00:00Z' });
      });
    });
  });
});
