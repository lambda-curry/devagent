import Database from 'better-sqlite3';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { unlinkSync, existsSync } from 'node:fs';
import { randomUUID } from 'node:crypto';

export interface TestDatabase {
  db: Database.Database;
  path: string;
  cleanup: () => void;
}

/**
 * Creates the issues table schema matching beads.server.ts expectations.
 * 
 * The schema matches the structure expected by beads.server.ts queries:
 * - id: TEXT PRIMARY KEY (e.g., 'bd-1234' or 'bd-1234.1')
 * - title: TEXT NOT NULL
 * - description: TEXT (nullable)
 * - design: TEXT (nullable, markdown content)
 * - acceptance_criteria: TEXT (nullable, markdown content)
 * - notes: TEXT (nullable, markdown content)
 * - status: TEXT NOT NULL ('open', 'in_progress', 'closed', 'blocked')
 * - priority: TEXT (nullable, e.g., 'P0', 'P1', 'P2')
 * - created_at: TEXT NOT NULL (RFC3339 timestamp)
 * - updated_at: TEXT NOT NULL (RFC3339 timestamp)
 * 
 * Note: parent_id is computed from hierarchical ID structure (not stored in table)
 * 
 * @param db - The SQLite database instance
 */
export function createIssuesSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS issues (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      design TEXT,
      acceptance_criteria TEXT,
      notes TEXT,
      status TEXT NOT NULL,
      priority TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    
    CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
    CREATE INDEX IF NOT EXISTS idx_issues_priority ON issues(priority);
    CREATE INDEX IF NOT EXISTS idx_issues_updated_at ON issues(updated_at);
  `);
}

/**
 * Creates the comments table schema (matches Beads DB; queried by getTaskCommentsDirect).
 *
 * @param db - The SQLite database instance
 */
export function createCommentsSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      issue_id TEXT NOT NULL,
      author TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_comments_issue_id ON comments(issue_id);
    CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);
  `);
}

/**
 * Creates the ralph_execution_log table schema (used by Ralph and queried by getExecutionLogs).
 *
 * @param db - The SQLite database instance
 */
export function createRalphExecutionLogSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS ralph_execution_log (
      task_id TEXT NOT NULL,
      agent_type TEXT NOT NULL,
      started_at TEXT NOT NULL,
      ended_at TEXT,
      status TEXT NOT NULL,
      iteration INTEGER NOT NULL,
      log_file_path TEXT,
      PRIMARY KEY (task_id, iteration)
    )
  `);
}

/**
 * Creates a temporary SQLite database for testing.
 * 
 * The database is created in the system temp directory with a unique name.
 * The database is opened in read-write mode (not readonly like production).
 * 
 * @returns An object containing the database instance, file path, and cleanup function
 */
export function createTestDatabase(): TestDatabase {
  const dbPath = join(tmpdir(), `beads-test-${randomUUID()}.db`);
  
  // Create the database file
  const db = new Database(dbPath);
  
  // Enable WAL mode for better concurrent access (matching production)
  db.pragma('journal_mode = WAL');
  
  // Create the schema
  createIssuesSchema(db);
  createCommentsSchema(db);
  createRalphExecutionLogSchema(db);
  
  /**
   * Cleanup function that closes the database and removes the temporary file.
   * Should be called in test teardown (afterEach).
   */
  const cleanup = (): void => {
    try {
      db.close();
    } catch (error) {
      // Ignore errors during close (database might already be closed)
      console.warn('Error closing test database:', error);
    }
    
    try {
      if (existsSync(dbPath)) {
        unlinkSync(dbPath);
      }
      // Clean up WAL mode auxiliary files
      const walPath = `${dbPath}-wal`;
      const shmPath = `${dbPath}-shm`;
      if (existsSync(walPath)) {
        unlinkSync(walPath);
      }
      if (existsSync(shmPath)) {
        unlinkSync(shmPath);
      }
    } catch (error) {
      // Ignore errors during file deletion (file might already be deleted)
      console.warn('Error deleting test database file:', error);
    }
  };
  
  return {
    db,
    path: dbPath,
    cleanup,
  };
}
