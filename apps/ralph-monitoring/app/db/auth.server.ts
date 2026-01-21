import Database from 'better-sqlite3';
import { join } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';

let authDb: Database.Database | null = null;

/**
 * Get the path to the authentication database.
 * Creates the directory if it doesn't exist.
 */
function getAuthDatabasePath(): string {
  const repoRoot = process.env.REPO_ROOT || 
    (process.cwd().includes('apps/ralph-monitoring') 
      ? join(process.cwd(), '../..')
      : process.cwd());
  const dbDir = join(repoRoot, '.ralph-monitoring');
  const dbPath = process.env.AUTH_DB || join(dbDir, 'auth.db');
  
  // Ensure directory exists
  if (!existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true });
  }
  
  return dbPath;
}

/**
 * Initialize the authentication database schema.
 * Creates users and password_reset_tokens tables if they don't exist.
 */
function initializeSchema(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expires_at DATETIME NOT NULL,
      used_at DATETIME,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_reset_tokens_token ON password_reset_tokens(token);
    CREATE INDEX IF NOT EXISTS idx_reset_tokens_user_id ON password_reset_tokens(user_id);
    CREATE INDEX IF NOT EXISTS idx_reset_tokens_expires_at ON password_reset_tokens(expires_at);
  `);
}

/**
 * Get or create the authentication database connection.
 * Initializes the schema on first access.
 */
export function getAuthDatabase(): Database.Database {
  if (authDb) {
    return authDb;
  }

  const dbPath = getAuthDatabasePath();
  authDb = new Database(dbPath);
  
  // Enable WAL mode for better concurrency
  authDb.pragma('journal_mode = WAL');
  
  // Initialize schema
  initializeSchema(authDb);
  
  return authDb;
}

/**
 * Close the authentication database connection.
 * Useful for cleanup in tests.
 */
export function closeAuthDatabase(): void {
  if (authDb) {
    authDb.close();
    authDb = null;
  }
}
