import Database from 'better-sqlite3';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

export interface BeadsTask {
  id: string;
  title: string;
  description: string | null;
  status: 'open' | 'in_progress' | 'closed' | 'blocked';
  priority: string | null;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

let db: Database.Database | null = null;

function getDatabasePath(): string {
  // Default to .beads/beads.db relative to repo root
  // In production, this should be configurable via environment variable
  const repoRoot = process.env.REPO_ROOT || process.cwd();
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
    db = new Database(dbPath, { readonly: true });

    // Enable WAL mode for better concurrent access
    db.pragma('journal_mode = WAL');

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
    // Query tasks that are in 'open' or 'in_progress' status
    const stmt = database.prepare(`
      SELECT 
        id,
        title,
        description,
        status,
        priority,
        parent_id,
        created_at,
        updated_at
      FROM tasks
      WHERE status IN ('open', 'in_progress')
      ORDER BY 
        CASE status
          WHEN 'in_progress' THEN 1
          WHEN 'open' THEN 2
          ELSE 3
        END,
        updated_at DESC
    `);

    return stmt.all() as BeadsTask[];
  } catch (error) {
    console.error('Failed to query active tasks:', error);
    return [];
  }
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

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const stmt = database.prepare(`
      SELECT 
        id,
        title,
        description,
        status,
        priority,
        parent_id,
        created_at,
        updated_at
      FROM tasks
      ${whereClause}
      ORDER BY 
        CASE status
          WHEN 'in_progress' THEN 1
          WHEN 'open' THEN 2
          WHEN 'closed' THEN 3
          WHEN 'blocked' THEN 4
          ELSE 5
        END,
        updated_at DESC
    `);

    return stmt.all(...params) as BeadsTask[];
  } catch (error) {
    console.error('Failed to query tasks:', error);
    return [];
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
        id,
        title,
        description,
        status,
        priority,
        parent_id,
        created_at,
        updated_at
      FROM tasks
      WHERE id = ?
    `);

    const task = stmt.get(taskId) as BeadsTask | undefined;
    return task || null;
  } catch (error) {
    console.error('Failed to query task by ID:', error);
    return null;
  }
}
