import { existsSync } from 'node:fs';
import { join } from 'node:path';
import Database from 'better-sqlite3';

import type { BeadsComment, BeadsTask, EpicSummary, EpicTask, RalphExecutionLog } from './beads.types';

export type { BeadsComment, BeadsTask, EpicSummary, EpicTask, RalphExecutionLog } from './beads.types';

let db: Database.Database | null = null;

/**
 * Normalize Beads-sourced markdown-ish text at the data boundary.
 *
 * - Convert CRLF/CR -> LF
 * - Convert literal "\\n" sequences -> "\n"
 *
 * See: `.devagent/workspace/tasks/active/2026-01-17_ralph-revisions-v4/design/newline-and-bold-normalization.md`
 */
export function normalizeBeadsMarkdownText(input: string): string {
  // Normalize Windows/mac classic newlines first, then unescape literal escape sequences.
  // Note: Some upstream sources may double-escape, resulting in strings like "\\r\\n" and "\\n".
  return input
    .replace(/\r\n?/g, '\n')
    .replace(/\\+r\\+n/g, '\n')
    .replace(/\\+n/g, '\n')
    .replace(/\\+r/g, '\n');
}

function normalizeNullableBeadsText(input: string | null | undefined): string | null | undefined {
  if (typeof input !== 'string') return input;
  return normalizeBeadsMarkdownText(input);
}

/**
 * Computes the parent ID from a hierarchical task ID.
 *
 * For hierarchical IDs like 'devagent-a217.1', the parent is 'devagent-a217'.
 * For IDs without dots, there is no parent (returns null).
 *
 * @param id - The hierarchical task ID
 * @returns The parent ID if one exists, null otherwise
 */
function computeParentId(id: string): string | null {
  return id.includes('.') ? id.substring(0, id.lastIndexOf('.')) : null;
}

/**
 * Compute duration in milliseconds from started_at and ended_at ISO timestamps.
 * Pure function for testing and for deriving duration when not from DB.
 *
 * @returns Duration in ms, or null if either timestamp is missing/invalid
 */
export function computeDurationMs(
  startedAt: string | null | undefined,
  endedAt: string | null | undefined
): number | null {
  if (startedAt == null || endedAt == null) return null;
  const start = Date.parse(startedAt);
  const end = Date.parse(endedAt);
  if (Number.isNaN(start) || Number.isNaN(end)) return null;
  const ms = end - start;
  return ms >= 0 ? ms : null;
}

/**
 * Format duration in milliseconds as human-readable string (e.g. "2m 30s", "1h 5m").
 *
 * @param ms - Duration in milliseconds (null/undefined => empty string)
 */
export function formatDurationMs(ms: number | null | undefined): string {
  if (ms == null || ms < 0) return '';
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.floor(ms / 1000) % 60;
  const minutes = Math.floor(ms / 60_000) % 60;
  const hours = Math.floor(ms / 3_600_000);
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
  return parts.join(' ');
}

/** Subquery alias for latest execution log row per task (task_id, started_at, ended_at, duration_ms, log_file_path). */
const LATEST_EXEC_LOG_SUBQUERY = `
  (SELECT task_id, started_at, ended_at,
     (CASE WHEN ended_at IS NOT NULL AND started_at IS NOT NULL
       THEN (julianday(ended_at) - julianday(started_at)) * 86400000.0
       ELSE NULL END) AS duration_ms,
     log_file_path
   FROM (
     SELECT task_id, started_at, ended_at, log_file_path,
       ROW_NUMBER() OVER (PARTITION BY task_id ORDER BY started_at DESC) AS rn
     FROM ralph_execution_log
   ) t
   WHERE rn = 1) AS el
`;

/** Latest exec log per task including agent_type (for epic task list). */
const LATEST_EXEC_LOG_WITH_AGENT_SUBQUERY = `
  (SELECT task_id, agent_type, started_at, ended_at,
     (CASE WHEN ended_at IS NOT NULL AND started_at IS NOT NULL
       THEN (julianday(ended_at) - julianday(started_at)) * 86400000.0
       ELSE NULL END) AS duration_ms,
     log_file_path
   FROM (
     SELECT task_id, agent_type, started_at, ended_at, log_file_path,
       ROW_NUMBER() OVER (PARTITION BY task_id ORDER BY started_at DESC) AS rn
     FROM ralph_execution_log
   ) t
   WHERE rn = 1) AS el
`;

function isNoSuchTableError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes('ralph_execution_log') || message.includes('no such table');
}

function getDatabasePath(): string {
  // Default to .beads/beads.db relative to repo root
  // In production, this should be configurable via environment variable
  // When running from apps/ralph-monitoring, we need to go up to repo root
  const repoRoot =
    process.env.REPO_ROOT ||
    (process.cwd().includes('apps/ralph-monitoring') ? join(process.cwd(), '../..') : process.cwd());
  const dbPath = process.env.BEADS_DB || join(repoRoot, '.beads', 'beads.db');
  return dbPath;
}

export function getDatabase(): Database.Database | null {
  if (db) {
    return db;
  }

  const dbPath = getDatabasePath();

  // Check if database file exists
  if (!existsSync(dbPath)) {
    return null;
  }

  try {
    db = new Database(dbPath);

    return db;
  } catch (error) {
    console.error('Failed to open Beads database:', error);
    return null;
  }
}

/**
 * Get all active tasks (open or in_progress status).
 *
 * @returns Array of tasks with status 'open' or 'in_progress', ordered by status (in_progress first) and updated_at (descending)
 */
export function getActiveTasks(): BeadsTask[] {
  const database = getDatabase();

  if (!database) {
    return [];
  }

  try {
    const stmt = database.prepare(`
      SELECT
        i.id,
        i.title,
        i.description,
        i.design,
        i.acceptance_criteria,
        i.notes,
        i.status,
        i.priority,
        i.created_at,
        i.updated_at,
        el.started_at,
        el.ended_at,
        el.duration_ms,
        el.log_file_path
      FROM issues i
      LEFT JOIN ${LATEST_EXEC_LOG_SUBQUERY} ON el.task_id = i.id
      WHERE i.status IN ('open', 'in_progress')
      ORDER BY
        CASE i.status
          WHEN 'in_progress' THEN 1
          WHEN 'open' THEN 2
          ELSE 3
        END,
        i.updated_at DESC
    `);

    const results = stmt.all() as Array<Omit<BeadsTask, 'parent_id'>>;
    return results.map(row => mapRowToTask(row)) as BeadsTask[];
  } catch (error) {
    if (isNoSuchTableError(error)) {
      return getActiveTasksWithoutExecLog(database);
    }
    console.error('Failed to query active tasks:', error);
    return [];
  }
}

function mapRowToTask(
  row: Omit<BeadsTask, 'parent_id'> & {
    started_at?: string | null;
    ended_at?: string | null;
    duration_ms?: number | null;
    log_file_path?: string | null;
  }
): BeadsTask {
  return {
    ...row,
    parent_id: computeParentId(row.id),
    description: normalizeNullableBeadsText(row.description) as BeadsTask['description'],
    design: normalizeNullableBeadsText(row.design) as BeadsTask['design'],
    acceptance_criteria: normalizeNullableBeadsText(row.acceptance_criteria) as BeadsTask['acceptance_criteria'],
    notes: normalizeNullableBeadsText(row.notes) as BeadsTask['notes'],
    started_at: row.started_at ?? null,
    ended_at: row.ended_at ?? null,
    duration_ms: row.duration_ms ?? null,
    log_file_path: row.log_file_path ?? null
  };
}

function getActiveTasksWithoutExecLog(database: Database.Database): BeadsTask[] {
  const stmt = database.prepare(`
    SELECT id, title, description, design, acceptance_criteria, notes, status, priority, created_at, updated_at
    FROM issues
    WHERE status IN ('open', 'in_progress')
    ORDER BY CASE status WHEN 'in_progress' THEN 1 WHEN 'open' THEN 2 ELSE 3 END, updated_at DESC
  `);
  const results = stmt.all() as Array<Omit<BeadsTask, 'parent_id'>>;
  return results.map(row =>
    mapRowToTask({ ...row, started_at: null, ended_at: null, duration_ms: null, log_file_path: null })
  ) as BeadsTask[];
}

export interface TaskFilters {
  status?: 'all' | 'open' | 'in_progress' | 'closed' | 'blocked';
  priority?: string;
  search?: string;
}

/**
 * Get all tasks with optional filtering.
 *
 * Filters tasks based on the provided criteria:
 * - Status: Filter by task status (open, in_progress, closed, blocked). Use 'all' or omit to include all statuses.
 * - Priority: Filter by exact priority match (case-sensitive).
 * - Search: Search in task title and description (case-insensitive partial match).
 *
 * Multiple filters are combined with AND logic (all must match).
 *
 * @param filters - Optional filter criteria
 * @param filters.status - Task status to filter by ('all' includes all statuses)
 * @param filters.priority - Exact priority value to match
 * @param filters.search - Search term to match in title and description
 * @returns Array of tasks matching the filters, ordered by status (in_progress, open, closed, blocked) and updated_at (descending)
 */
export function getAllTasks(filters?: TaskFilters): BeadsTask[] {
  const database = getDatabase();

  if (!database) {
    return [];
  }

  try {
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    // Status filter
    if (filters?.status && filters.status !== 'all') {
      conditions.push('status = ?');
      params.push(filters.status);
    }

    // Priority filter
    if (filters?.priority) {
      conditions.push('priority = ?');
      params.push(filters.priority);
    }

    // Search filter (title and description)
    if (filters?.search) {
      conditions.push('(title LIKE ? OR description LIKE ?)');
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm);
    }

    const qualifiedConditions = conditions.map(c =>
      c
        .replace(/\bstatus\b/g, 'i.status')
        .replace(/\bpriority\b/g, 'i.priority')
        .replace(/\btitle\b/g, 'i.title')
        .replace(/\bdescription\b/g, 'i.description')
    );
    const whereClause = qualifiedConditions.length > 0 ? `WHERE ${qualifiedConditions.join(' AND ')}` : '';

    const stmt = database.prepare(`
      SELECT
        i.id,
        i.title,
        i.description,
        i.design,
        i.acceptance_criteria,
        i.notes,
        i.status,
        i.priority,
        i.created_at,
        i.updated_at,
        el.started_at,
        el.ended_at,
        el.duration_ms,
        el.log_file_path
      FROM issues i
      LEFT JOIN ${LATEST_EXEC_LOG_SUBQUERY} ON el.task_id = i.id
      ${whereClause}
      ORDER BY
        CASE i.status
          WHEN 'in_progress' THEN 1
          WHEN 'open' THEN 2
          WHEN 'closed' THEN 3
          WHEN 'blocked' THEN 4
          ELSE 5
        END,
        i.updated_at DESC
    `);

    const results = stmt.all(...params) as Array<
      Omit<BeadsTask, 'parent_id'> & {
        started_at?: string | null;
        ended_at?: string | null;
        duration_ms?: number | null;
      }
    >;
    return results.map(row => mapRowToTask(row)) as BeadsTask[];
  } catch (error) {
    if (isNoSuchTableError(error)) {
      return getAllTasksWithoutExecLog(database, filters);
    }
    console.error('Failed to query tasks:', error);
    return [];
  }
}

function getAllTasksWithoutExecLog(database: Database.Database, filters?: TaskFilters): BeadsTask[] {
  const conditions: string[] = [];
  const params: (string | number)[] = [];
  if (filters?.status && filters.status !== 'all') {
    conditions.push('status = ?');
    params.push(filters.status);
  }
  if (filters?.priority) {
    conditions.push('priority = ?');
    params.push(filters.priority);
  }
  if (filters?.search) {
    conditions.push('(title LIKE ? OR description LIKE ?)');
    const searchTerm = `%${filters.search}%`;
    params.push(searchTerm, searchTerm);
  }
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const stmt = database.prepare(`
    SELECT id, title, description, design, acceptance_criteria, notes, status, priority, created_at, updated_at
    FROM issues
    ${whereClause}
    ORDER BY CASE status WHEN 'in_progress' THEN 1 WHEN 'open' THEN 2 WHEN 'closed' THEN 3 WHEN 'blocked' THEN 4 ELSE 5 END, updated_at DESC
  `);
  const results = stmt.all(...params) as Array<Omit<BeadsTask, 'parent_id'>>;
  return results.map(row =>
    mapRowToTask({ ...row, started_at: null, ended_at: null, duration_ms: null, log_file_path: null })
  ) as BeadsTask[];
}

/**
 * Get the stored log_file_path for a task from the database.
 * Returns the path if found, null if task not found or no log_file_path.
 *
 * @param taskId - The Beads task ID
 * @returns The stored log_file_path or null
 */
export function getTaskLogFilePath(taskId: string): string | null {
  const database = getDatabase();
  if (!database) return null;

  try {
    const stmt = database.prepare(`
      SELECT log_file_path
      FROM (
        SELECT task_id, log_file_path,
          ROW_NUMBER() OVER (PARTITION BY task_id ORDER BY started_at DESC) AS rn
        FROM ralph_execution_log
        WHERE task_id = ?
      ) t
      WHERE rn = 1
    `);
    const result = stmt.get(taskId) as { log_file_path: string | null } | undefined;
    return result?.log_file_path ?? null;
  } catch (error) {
    // Table may not exist if Ralph has never run
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('ralph_execution_log') || message.includes('no such table')) {
      return null;
    }
    console.error('Failed to query task log file path:', error);
    return null;
  }
}

/**
 * Get a single task by its ID.
 *
 * @param taskId - The Beads task ID (e.g., 'bd-1234' or 'bd-1234.1')
 * @returns The task if found, null if not found or database error
 */
export function getTaskById(taskId: string): BeadsTask | null {
  const database = getDatabase();

  if (!database) {
    return null;
  }

  try {
    const stmt = database.prepare(`
      SELECT
        i.id,
        i.title,
        i.description,
        i.design,
        i.acceptance_criteria,
        i.notes,
        i.status,
        i.priority,
        i.created_at,
        i.updated_at,
        el.started_at,
        el.ended_at,
        el.duration_ms,
        el.log_file_path
      FROM issues i
      LEFT JOIN ${LATEST_EXEC_LOG_SUBQUERY} ON el.task_id = i.id
      WHERE i.id = ?
    `);

    const result = stmt.get(taskId) as
      | (Omit<BeadsTask, 'parent_id'> & {
          started_at?: string | null;
          ended_at?: string | null;
          duration_ms?: number | null;
          log_file_path?: string | null;
        })
      | undefined;
    if (!result) {
      return null;
    }
    return mapRowToTask(result);
  } catch (error) {
    if (isNoSuchTableError(error)) {
      return getTaskByIdWithoutExecLog(database, taskId);
    }
    console.error('Failed to query task by ID:', error);
    return null;
  }
}

function getTaskByIdWithoutExecLog(database: Database.Database, taskId: string): BeadsTask | null {
  const stmt = database.prepare(`
    SELECT id, title, description, design, acceptance_criteria, notes, status, priority, created_at, updated_at
    FROM issues
    WHERE id = ?
  `);
  const result = stmt.get(taskId) as Omit<BeadsTask, 'parent_id'> | undefined;
  if (!result) return null;
  return mapRowToTask({ ...result, started_at: null, ended_at: null, duration_ms: null, log_file_path: null });
}

/**
 * Get comments for a task by querying the comments table directly via better-sqlite3.
 * Does not spawn the bd comments CLI.
 *
 * @param taskId - The Beads task ID (e.g., 'bd-1234' or 'bd-1234.1')
 * @returns Comments in BeadsComment[] format, or [] if database unavailable or query fails
 */
export function getTaskCommentsDirect(taskId: string): BeadsComment[] {
  const database = getDatabase();
  if (!database) return [];

  try {
    const stmt = database.prepare(`
      SELECT id, author, text AS body, created_at
      FROM comments
      WHERE issue_id = ?
      ORDER BY created_at DESC
    `);

    const results = stmt.all(taskId) as Array<{ id: number; author: string; body: string; created_at: string }>;
    return results.map(row => ({
      id: row.id,
      author: row.author,
      body: normalizeBeadsMarkdownText(row.body),
      created_at: row.created_at
    }));
  } catch (error) {
    console.error('Failed to query comments:', error);
    return [];
  }
}

/**
 * Get execution logs for an epic: all logs where task_id equals the epic or is a descendant (task_id LIKE epicId.%).
 *
 * Returns rows from ralph_execution_log ordered by started_at descending.
 * If the table does not exist (e.g. Ralph has never run), returns [].
 *
 * @param epicId - Beads epic ID (e.g. 'devagent-ralph-dashboard-2026-01-30')
 * @returns Array of execution log rows
 */
export function getExecutionLogs(epicId: string): RalphExecutionLog[] {
  const database = getDatabase();

  if (!database) {
    return [];
  }

  try {
    const stmt = database.prepare(`
      SELECT task_id, agent_type, started_at, ended_at, status, iteration
      FROM ralph_execution_log
      WHERE task_id = ? OR task_id LIKE ?
      ORDER BY started_at DESC
    `);
    const likePattern = `${epicId}.%`;
    const results = stmt.all(epicId, likePattern) as RalphExecutionLog[];
    return results;
  } catch (error) {
    // Table may not exist if Ralph has never run
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('ralph_execution_log') || message.includes('no such table')) {
      return [];
    }
    console.error('Failed to query execution logs:', error);
    return [];
  }
}

/**
 * Get all epics (root-level tasks with no parent_id).
 * Each epic includes task count, completed count, and progress percentage.
 *
 * @returns Array of epics ordered by updated_at descending
 */
export function getEpics(): EpicSummary[] {
  const database = getDatabase();

  if (!database) {
    return [];
  }

  try {
    // Epics = issues whose id has no dot (no parent). Children = id LIKE epic_id || '.%'
    const stmt = database.prepare(`
      SELECT
        i.id,
        i.title,
        i.status,
        i.updated_at,
        (SELECT COUNT(*) FROM issues c WHERE c.id LIKE i.id || '.%') AS task_count,
        (SELECT COUNT(*) FROM issues c WHERE c.id LIKE i.id || '.%' AND c.status = 'closed') AS completed_count
      FROM issues i
      WHERE i.id NOT LIKE '%.%'
      ORDER BY i.updated_at DESC
    `);

    const rows = stmt.all() as Array<{
      id: string;
      title: string;
      status: BeadsTask['status'];
      updated_at: string;
      task_count: number;
      completed_count: number;
    }>;

    return rows.map(row => {
      const taskCount = Number(row.task_count) || 0;
      const completedCount = Number(row.completed_count) || 0;
      const progressPct = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;

      return {
        id: row.id,
        title: row.title,
        status: row.status,
        task_count: taskCount,
        completed_count: completedCount,
        progress_pct: progressPct,
        updated_at: row.updated_at
      };
    });
  } catch (error) {
    console.error('Failed to query epics:', error);
    return [];
  }
}

/**
 * Get a single epic by ID (root-level task only).
 *
 * @param epicId - Beads epic ID (no dot in id)
 * @returns Epic summary if found and root-level, null otherwise
 */
export function getEpicById(epicId: string): EpicSummary | null {
  const database = getDatabase();
  if (!database) return null;

  try {
    const stmt = database.prepare(`
      SELECT
        i.id,
        i.title,
        i.status,
        i.updated_at,
        (SELECT COUNT(*) FROM issues c WHERE c.id LIKE i.id || '.%') AS task_count,
        (SELECT COUNT(*) FROM issues c WHERE c.id LIKE i.id || '.%' AND c.status = 'closed') AS completed_count
      FROM issues i
      WHERE i.id = ? AND i.id NOT LIKE '%.%'
    `);
    const row = stmt.get(epicId) as
      | {
          id: string;
          title: string;
          status: BeadsTask['status'];
          updated_at: string;
          task_count: number;
          completed_count: number;
        }
      | undefined;
    if (!row) return null;

    const taskCount = Number(row.task_count) || 0;
    const completedCount = Number(row.completed_count) || 0;
    const progressPct = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;

    return {
      id: row.id,
      title: row.title,
      status: row.status,
      task_count: taskCount,
      completed_count: completedCount,
      progress_pct: progressPct,
      updated_at: row.updated_at
    };
  } catch (error) {
    console.error('Failed to query epic by ID:', error);
    return null;
  }
}

function mapRowToEpicTask(
  row: Omit<BeadsTask, 'parent_id'> & {
    started_at?: string | null;
    ended_at?: string | null;
    duration_ms?: number | null;
    agent_type?: string | null;
    log_file_path?: string | null;
  }
): EpicTask {
  const task = mapRowToTask(row);
  return {
    ...task,
    agent_type: row.agent_type ?? null
  };
}

/**
 * Get all tasks for an epic: the epic itself plus all descendants (id = epicId OR id LIKE epicId.%).
 * Includes latest execution log (duration_ms, agent_type) per task.
 *
 * @param epicId - Beads epic ID
 * @returns Tasks ordered by status then updated_at descending
 */
export function getTasksByEpicId(epicId: string): EpicTask[] {
  const database = getDatabase();
  if (!database) return [];

  try {
    const stmt = database.prepare(`
      SELECT
        i.id,
        i.title,
        i.description,
        i.design,
        i.acceptance_criteria,
        i.notes,
        i.status,
        i.priority,
        i.created_at,
        i.updated_at,
        el.started_at,
        el.ended_at,
        el.duration_ms,
        el.agent_type,
        el.log_file_path
      FROM issues i
      LEFT JOIN ${LATEST_EXEC_LOG_WITH_AGENT_SUBQUERY} ON el.task_id = i.id
      WHERE i.id = ? OR i.id LIKE ?
      ORDER BY
        CASE i.status
          WHEN 'in_progress' THEN 1
          WHEN 'open' THEN 2
          WHEN 'closed' THEN 3
          WHEN 'blocked' THEN 4
          ELSE 5
        END,
        i.updated_at DESC
    `);
    const likePattern = `${epicId}.%`;
    const results = stmt.all(epicId, likePattern) as Array<
      Omit<BeadsTask, 'parent_id'> & {
        started_at?: string | null;
        ended_at?: string | null;
        duration_ms?: number | null;
        agent_type?: string | null;
        log_file_path?: string | null;
      }
    >;
    return results.map(row => mapRowToEpicTask(row));
  } catch (error) {
    if (isNoSuchTableError(error)) {
      const stmt = database.prepare(`
        SELECT id, title, description, design, acceptance_criteria, notes, status, priority, created_at, updated_at
        FROM issues
        WHERE id = ? OR id LIKE ?
        ORDER BY CASE status WHEN 'in_progress' THEN 1 WHEN 'open' THEN 2 WHEN 'closed' THEN 3 WHEN 'blocked' THEN 4 ELSE 5 END, updated_at DESC
      `);
      const likePattern = `${epicId}.%`;
      const results = stmt.all(epicId, likePattern) as Array<Omit<BeadsTask, 'parent_id'>>;
      return results.map(row =>
        mapRowToEpicTask({
          ...row,
          started_at: null,
          ended_at: null,
          duration_ms: null,
          agent_type: null,
          log_file_path: null
        })
      );
    }
    console.error('Failed to query tasks by epic ID:', error);
    return [];
  }
}

/**
 * Add a new comment to a task.
 *
 * @param taskId - The Beads task ID (e.g., 'bd-1234' or 'bd-1234.1')
 * @param author - The author of the comment
 * @param text - The comment text (markdown)
 * @returns The created comment, or null if creation failed
 */
export function addComment(taskId: string, author: string, text: string): BeadsComment | null {
  const database = getDatabase();
  if (!database) return null;

  try {
    const stmt = database.prepare(`
      INSERT INTO comments (issue_id, author, text, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `);
    const result = stmt.run(taskId, author, text);
    const insertedId = result.lastInsertRowid;

    // Fetch the inserted comment to return
    const selectStmt = database.prepare(`
      SELECT id, author, text AS body, created_at
      FROM comments
      WHERE id = ?
    `);
    const row = selectStmt.get(insertedId) as
      | { id: number; author: string; body: string; created_at: string }
      | undefined;
    if (!row) return null;

    return {
      id: row.id,
      author: row.author,
      body: normalizeBeadsMarkdownText(row.body),
      created_at: row.created_at
    };
  } catch (error) {
    console.error('Failed to add comment:', error);
    return null;
  }
}

/**
 * Update an existing comment.
 *
 * @param commentId - The comment ID
 * @param text - The new comment text (markdown)
 * @returns The updated comment, or null if update failed
 */
export function updateComment(commentId: number, text: string): BeadsComment | null {
  const database = getDatabase();
  if (!database) return null;

  try {
    const stmt = database.prepare(`
      UPDATE comments
      SET text = ?
      WHERE id = ?
    `);
    const result = stmt.run(text, commentId);

    if (result.changes === 0) return null;

    // Fetch the updated comment to return
    const selectStmt = database.prepare(`
      SELECT id, author, text AS body, created_at
      FROM comments
      WHERE id = ?
    `);
    const row = selectStmt.get(commentId) as
      | { id: number; author: string; body: string; created_at: string }
      | undefined;
    if (!row) return null;

    return {
      id: row.id,
      author: row.author,
      body: normalizeBeadsMarkdownText(row.body),
      created_at: row.created_at
    };
  } catch (error) {
    console.error('Failed to update comment:', error);
    return null;
  }
}

/**
 * Delete a comment by ID.
 *
 * @param commentId - The comment ID
 * @returns true if deleted, false if not found or failed
 */
export function deleteComment(commentId: number): boolean {
  const database = getDatabase();
  if (!database) return false;

  try {
    const stmt = database.prepare(`
      DELETE FROM comments
      WHERE id = ?
    `);
    const result = stmt.run(commentId);
    return result.changes > 0;
  } catch (error) {
    console.error('Failed to delete comment:', error);
    return false;
  }
}
