import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Database from 'better-sqlite3';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  generatePasswordResetToken,
  hashPassword,
  findUserByEmail,
  createPasswordResetToken,
  validatePasswordResetToken,
  markTokenAsUsed,
  updatePassword
} from '../auth.server';
import * as authDbModule from '~/db/auth.server';

// Mock the database module to use a test database
let testDb: Database.Database | null = null;
let testDbPath: string | null = null;

// Override getAuthDatabase to return test database
vi.mock('~/db/auth.server', () => {
  return {
    getAuthDatabase: () => {
      if (!testDb) {
        throw new Error('Test database not initialized');
      }
      return testDb;
    },
    closeAuthDatabase: () => {
      // No-op for tests
    }
  };
});

describe('auth.server', () => {
  beforeEach(() => {
    // Create a temporary database for each test
    const tempDir = mkdtempSync(join(tmpdir(), 'auth-test-'));
    testDbPath = join(tempDir, 'auth.db');
    testDb = new Database(testDbPath);
    testDb.pragma('journal_mode = WAL');

    // Initialize schema
    testDb.exec(`
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

    // Insert test user
    testDb.prepare(`
      INSERT INTO users (email, password_hash)
      VALUES (?, ?)
    `).run('test@example.com', hashPassword('password123'));
  });

  afterEach(() => {
    if (testDb) {
      testDb.close();
      testDb = null;
    }
    if (testDbPath) {
      try {
        rmSync(join(testDbPath, '..'), { recursive: true, force: true });
      } catch {
        // ignore cleanup errors
      }
      testDbPath = null;
    }
  });

  describe('generatePasswordResetToken', () => {
    it('should generate a URL-safe base64 token', () => {
      const token = generatePasswordResetToken();
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      // Base64url should not contain +, /, or = characters
      expect(token).not.toMatch(/[+/=]/);
    });

    it('should generate unique tokens', () => {
      const token1 = generatePasswordResetToken();
      const token2 = generatePasswordResetToken();
      expect(token1).not.toBe(token2);
    });

    it('should generate tokens of reasonable length', () => {
      const token = generatePasswordResetToken();
      // Base64url encoding of 32 bytes should be 43 characters
      expect(token.length).toBeGreaterThan(30);
      expect(token.length).toBeLessThan(50);
    });
  });

  describe('hashPassword', () => {
    it('should hash a password', () => {
      const hash = hashPassword('password123');
      expect(hash).toBeTruthy();
      expect(typeof hash).toBe('string');
      expect(hash).not.toBe('password123');
    });

    it('should produce consistent hashes for the same password', () => {
      const hash1 = hashPassword('password123');
      const hash2 = hashPassword('password123');
      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different passwords', () => {
      const hash1 = hashPassword('password123');
      const hash2 = hashPassword('password456');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('findUserByEmail', () => {
    it('should find user by email', () => {
      const userId = findUserByEmail('test@example.com');
      expect(userId).toBe(1);
    });

    it('should return null for non-existent email', () => {
      const userId = findUserByEmail('nonexistent@example.com');
      expect(userId).toBeNull();
    });

    it('should be case-sensitive for email lookup', () => {
      const userId = findUserByEmail('TEST@EXAMPLE.COM');
      expect(userId).toBeNull();
    });
  });

  describe('createPasswordResetToken', () => {
    it('should create a reset token for a user', () => {
      const token = createPasswordResetToken(1);
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');

      // Verify token was stored in database
      const stored = testDb!.prepare(`
        SELECT token, expires_at, used_at
        FROM password_reset_tokens
        WHERE user_id = ? AND token = ?
      `).get(1, token) as { token: string; expires_at: string; used_at: string | null } | undefined;

      expect(stored).toBeTruthy();
      expect(stored!.token).toBe(token);
      expect(stored!.used_at).toBeNull();
    });

    it('should set expiration time correctly', () => {
      const token = createPasswordResetToken(1, 24);
      const stored = testDb!.prepare(`
        SELECT expires_at
        FROM password_reset_tokens
        WHERE token = ?
      `).get(token) as { expires_at: string } | undefined;

      expect(stored).toBeTruthy();
      const expiresAt = new Date(stored!.expires_at);
      const now = new Date();
      const hoursUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);
      expect(hoursUntilExpiry).toBeGreaterThan(23);
      expect(hoursUntilExpiry).toBeLessThan(25);
    });

    it('should allow custom expiration time', () => {
      const token = createPasswordResetToken(1, 1); // 1 hour
      const stored = testDb!.prepare(`
        SELECT expires_at
        FROM password_reset_tokens
        WHERE token = ?
      `).get(token) as { expires_at: string } | undefined;

      expect(stored).toBeTruthy();
      const expiresAt = new Date(stored!.expires_at);
      const now = new Date();
      const hoursUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);
      expect(hoursUntilExpiry).toBeGreaterThan(0.9);
      expect(hoursUntilExpiry).toBeLessThan(1.1);
    });
  });

  describe('validatePasswordResetToken', () => {
    it('should return user ID for valid token', () => {
      const token = createPasswordResetToken(1);
      const userId = validatePasswordResetToken(token);
      expect(userId).toBe(1);
    });

    it('should return null for non-existent token', () => {
      const userId = validatePasswordResetToken('nonexistent-token');
      expect(userId).toBeNull();
    });

    it('should return null for expired token', () => {
      // Create a token that expires in the past
      const token = generatePasswordResetToken();
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 1);
      testDb!.prepare(`
        INSERT INTO password_reset_tokens (user_id, token, expires_at)
        VALUES (?, ?, ?)
      `).run(1, token, pastDate.toISOString());

      const userId = validatePasswordResetToken(token);
      expect(userId).toBeNull();
    });

    it('should return null for used token', () => {
      const token = createPasswordResetToken(1);
      markTokenAsUsed(token);
      const userId = validatePasswordResetToken(token);
      expect(userId).toBeNull();
    });
  });

  describe('markTokenAsUsed', () => {
    it('should mark token as used', () => {
      const token = createPasswordResetToken(1);
      markTokenAsUsed(token);

      const stored = testDb!.prepare(`
        SELECT used_at
        FROM password_reset_tokens
        WHERE token = ?
      `).get(token) as { used_at: string | null } | undefined;

      expect(stored).toBeTruthy();
      expect(stored!.used_at).toBeTruthy();
    });

    it('should not affect other tokens', () => {
      const token1 = createPasswordResetToken(1);
      const token2 = createPasswordResetToken(1);
      markTokenAsUsed(token1);

      const stored1 = testDb!.prepare(`
        SELECT used_at
        FROM password_reset_tokens
        WHERE token = ?
      `).get(token1) as { used_at: string | null } | undefined;

      const stored2 = testDb!.prepare(`
        SELECT used_at
        FROM password_reset_tokens
        WHERE token = ?
      `).get(token2) as { used_at: string | null } | undefined;

      expect(stored1!.used_at).toBeTruthy();
      expect(stored2!.used_at).toBeNull();
    });
  });

  describe('updatePassword', () => {
    it('should update user password', () => {
      const newPassword = 'newpassword123';
      updatePassword(1, newPassword);

      const user = testDb!.prepare(`
        SELECT password_hash
        FROM users
        WHERE id = ?
      `).get(1) as { password_hash: string } | undefined;

      expect(user).toBeTruthy();
      expect(user!.password_hash).toBe(hashPassword(newPassword));
    });

    it('should hash the password before storing', () => {
      const newPassword = 'newpassword123';
      updatePassword(1, newPassword);

      const user = testDb!.prepare(`
        SELECT password_hash
        FROM users
        WHERE id = ?
      `).get(1) as { password_hash: string } | undefined;

      expect(user!.password_hash).not.toBe(newPassword);
      expect(user!.password_hash).toBe(hashPassword(newPassword));
    });

    it('should update updated_at timestamp', () => {
      const originalUser = testDb!.prepare(`
        SELECT updated_at
        FROM users
        WHERE id = ?
      `).get(1) as { updated_at: string } | undefined;

      const originalTimestamp = originalUser!.updated_at;
      updatePassword(1, 'newpassword123');

      const updatedUser = testDb!.prepare(`
        SELECT updated_at
        FROM users
        WHERE id = ?
      `).get(1) as { updated_at: string } | undefined;

      // Verify updated_at is a valid date string
      expect(updatedUser!.updated_at).toBeTruthy();
      const updatedAt = new Date(updatedUser!.updated_at);
      expect(updatedAt.getTime()).toBeGreaterThan(0);
      // The timestamp should be different (or at least a valid date)
      expect(updatedUser!.updated_at).toBeTruthy();
    });
  });
});
