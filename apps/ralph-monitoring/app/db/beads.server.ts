import Database from 'better-sqlite3';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

export interface BeadsTask {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done' | 'blocked';
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

export function getActiveTasks(): BeadsTask[] {
  const database = getDatabase();

  if (!database) {
    return [];
  }

  try {
    // Query tasks that are in 'todo' or 'in_progress' status
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
      WHERE status IN ('todo', 'in_progress')
      ORDER BY 
        CASE status
          WHEN 'in_progress' THEN 1
          WHEN 'todo' THEN 2
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
  status?: 'all' | 'todo' | 'in_progress' | 'done' | 'blocked';
  priority?: string;
  search?: string;
}

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
          WHEN 'todo' THEN 2
          WHEN 'done' THEN 3
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
