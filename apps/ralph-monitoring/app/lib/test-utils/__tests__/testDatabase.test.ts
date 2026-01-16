import { describe, it, expect } from 'vitest';
import { createTestDatabase, createTasksSchema } from '../testDatabase';
import { existsSync } from 'node:fs';

describe('testDatabase', () => {
  describe('createTestDatabase', () => {
    it('creates a temporary SQLite database file', () => {
      const { db, path, cleanup } = createTestDatabase();
      
      expect(db).toBeDefined();
      expect(path).toBeDefined();
      expect(existsSync(path)).toBe(true);
      
      // Verify database is functional by querying schema
      const tables = db
        .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='issues'")
        .get();
      
      expect(tables).toBeDefined();
      
      cleanup();
      expect(existsSync(path)).toBe(false);
    });

    it('creates the issues table with correct schema', () => {
      const { db, cleanup } = createTestDatabase();
      
      // Query table info
      const tableInfo = db.pragma('table_info(issues)') as Array<{ name: string; type: string }>;
      
      const columns = tableInfo.map((col) => col.name);
      
      expect(columns).toContain('id');
      expect(columns).toContain('title');
      expect(columns).toContain('description');
      expect(columns).toContain('status');
      expect(columns).toContain('priority');
      expect(columns).toContain('created_at');
      expect(columns).toContain('updated_at');
      
      cleanup();
    });

    it('allows inserting and querying data', () => {
      const { db, cleanup } = createTestDatabase();
      
      const now = new Date().toISOString();
      db.prepare(`
        INSERT INTO issues (id, title, description, status, priority, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run('test-1', 'Test Task', 'Test Description', 'open', 'P1', now, now);
      
      const task = db.prepare('SELECT * FROM issues WHERE id = ?').get('test-1');
      
      expect(task).toBeDefined();
      expect((task as { id: string }).id).toBe('test-1');
      expect((task as { title: string }).title).toBe('Test Task');
      
      cleanup();
    });

    it('cleanup removes the database file', () => {
      const { path, cleanup } = createTestDatabase();
      
      expect(existsSync(path)).toBe(true);
      
      cleanup();
      
      expect(existsSync(path)).toBe(false);
    });

    it('cleanup can be called multiple times safely', () => {
      const { path, cleanup } = createTestDatabase();
      
      expect(existsSync(path)).toBe(true);
      
      cleanup();
      cleanup(); // Should not throw
      cleanup(); // Should not throw
      
      expect(existsSync(path)).toBe(false);
    });
  });

  describe('createTasksSchema', () => {
    it('creates schema on an existing database', () => {
      const { db, cleanup } = createTestDatabase();
      
      // Drop the table
      db.exec('DROP TABLE IF EXISTS issues');
      
      // Recreate schema
      createTasksSchema(db);
      
      // Verify table exists
      const tables = db
        .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='issues'")
        .get();
      
      expect(tables).toBeDefined();
      
      cleanup();
    });

    it('creates indexes for performance', () => {
      const { db, cleanup } = createTestDatabase();
      
      const indexes = db
        .prepare("SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='issues'")
        .all() as Array<{ name: string }>;
      
      const indexNames = indexes.map(idx => idx.name);
      
      expect(indexNames).toContain('idx_issues_status');
      expect(indexNames).toContain('idx_issues_priority');
      expect(indexNames).toContain('idx_issues_updated_at');
      
      cleanup();
    });
  });
});
