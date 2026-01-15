import Database from 'better-sqlite3';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

export interface BeadsTask {
  id: string;
  title: string;
  description: string | null;
  status: 'open' | 'in_progress' | 'closed' | 'blocked';
  priority: string | null;
  parent_id: string | null; // Computed from hierarchical ID structure
  created_at: string;
  updated_at: string;
}

let db: Database.Database | null = null;

function getDatabasePath(): string {
  // Default to .beads/beads.db relative to repo root
  // In production, this should be configurable via environment variable
  // When running from apps/ralph-monitoring, we need to go up to repo root
  const repoRoot = process.env.REPO_ROOT || 
    (process.cwd().includes('apps/ralph-monitoring') 
      ? join(process.cwd(), '../..')
      : process.cwd());
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
    // Query tasks that are in 'open' or 'in_progress' status
    // Beads uses hierarchical IDs (e.g., devagent-a217.1 is child of devagent-a217)
    // Compute parent_id from ID structure: everything before the last dot
    const stmt = database.prepare(`
      SELECT 
        id,
        title,
        description,
        status,
        priority,
        CASE 
          WHEN instr(id, '.') > 0 THEN substr(id, 1, length(id) - length(substr(id, instr(reverse(id), '.'))))
          ELSE NULL
        END as parent_id,
        created_at,
        updated_at
      FROM issues
      WHERE status IN ('open', 'in_progress')
      ORDER BY 
        CASE status
          WHEN 'in_progress' THEN 1
          WHEN 'open' THEN 2
          ELSE 3
        END,
        updated_at DESC
    `);

    const results = stmt.all() as Array<Omit<BeadsTask, 'parent_id'> & { parent_id: string | null }>;
    // Compute parent_id correctly from hierarchical ID
    return results.map((row) => {
      const parentId = row.id.includes('.') 
        ? row.id.substring(0, row.id.lastIndexOf('.'))
        : null;
      return { ...row, parent_id: parentId };
    }) as BeadsTask[];
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
        created_at,
        updated_at
      FROM issues
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

    const results = stmt.all(...params) as Array<Omit<BeadsTask, 'parent_id'>>;
    // Compute parent_id correctly from hierarchical ID
    return results.map((row) => {
      const parentId = row.id.includes('.') 
        ? row.id.substring(0, row.id.lastIndexOf('.'))
        : null;
      return { ...row, parent_id: parentId };
    }) as BeadsTask[];
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
        created_at,
        updated_at
      FROM issues
      WHERE id = ?
    `);

    const result = stmt.get(taskId) as Omit<BeadsTask, 'parent_id'> | undefined;
    if (!result) {
      return null;
    }
    
    // Compute parent_id correctly from hierarchical ID
    const parentId = result.id.includes('.') 
      ? result.id.substring(0, result.id.lastIndexOf('.'))
      : null;
    
    return { ...result, parent_id: parentId };
  } catch (error) {
    console.error('Failed to query task by ID:', error);
    return null;
  }
}
