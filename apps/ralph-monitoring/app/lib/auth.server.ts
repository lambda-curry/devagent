import { randomBytes, createHash } from 'node:crypto';
import { getAuthDatabase } from '~/db/auth.server';

/**
 * Generate a secure random token for password reset.
 * Uses cryptographically secure random bytes.
 * 
 * @returns A URL-safe base64-encoded token
 */
export function generatePasswordResetToken(): string {
  // Generate 32 random bytes (256 bits)
  const bytes = randomBytes(32);
  // Convert to URL-safe base64
  return bytes.toString('base64url');
}

/**
 * Hash a password using SHA-256.
 * Note: In production, use bcrypt or argon2 for password hashing.
 * This is a placeholder implementation.
 * 
 * @param password - Plain text password
 * @returns Hashed password
 */
export function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

/**
 * Find a user by email address.
 * 
 * @param email - User's email address
 * @returns User ID if found, null otherwise
 */
export function findUserByEmail(email: string): number | null {
  const db = getAuthDatabase();
  const stmt = db.prepare('SELECT id FROM users WHERE email = ?');
  const result = stmt.get(email) as { id: number } | undefined;
  return result?.id ?? null;
}

/**
 * Create a password reset token for a user.
 * 
 * @param userId - User ID
 * @param expiresInHours - Token expiration time in hours (default: 24)
 * @returns The generated token
 */
export function createPasswordResetToken(userId: number, expiresInHours: number = 24): string {
  const db = getAuthDatabase();
  const token = generatePasswordResetToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expiresInHours);
  
  const stmt = db.prepare(`
    INSERT INTO password_reset_tokens (user_id, token, expires_at)
    VALUES (?, ?, ?)
  `);
  
  stmt.run(userId, token, expiresAt.toISOString());
  
  return token;
}

/**
 * Validate a password reset token.
 * Checks if the token exists, hasn't expired, and hasn't been used.
 * 
 * @param token - The reset token to validate
 * @returns User ID if token is valid, null otherwise
 */
export function validatePasswordResetToken(token: string): number | null {
  const db = getAuthDatabase();
  const stmt = db.prepare(`
    SELECT user_id, expires_at, used_at
    FROM password_reset_tokens
    WHERE token = ?
  `);
  
  const result = stmt.get(token) as { user_id: number; expires_at: string; used_at: string | null } | undefined;
  
  if (!result) {
    return null;
  }
  
  // Check if token has been used
  if (result.used_at) {
    return null;
  }
  
  // Check if token has expired
  const expiresAt = new Date(result.expires_at);
  if (expiresAt < new Date()) {
    return null;
  }
  
  return result.user_id;
}

/**
 * Mark a password reset token as used.
 * 
 * @param token - The reset token to mark as used
 */
export function markTokenAsUsed(token: string): void {
  const db = getAuthDatabase();
  const stmt = db.prepare(`
    UPDATE password_reset_tokens
    SET used_at = CURRENT_TIMESTAMP
    WHERE token = ?
  `);
  
  stmt.run(token);
}

/**
 * Update a user's password.
 * 
 * @param userId - User ID
 * @param newPassword - New plain text password (will be hashed)
 */
export function updatePassword(userId: number, newPassword: string): void {
  const db = getAuthDatabase();
  const passwordHash = hashPassword(newPassword);
  
  const stmt = db.prepare(`
    UPDATE users
    SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  
  stmt.run(passwordHash, userId);
}

/**
 * Send a password reset email.
 * 
 * This is a placeholder implementation. In production, integrate with
 * an email service (SendGrid, AWS SES, etc.).
 * 
 * @param email - Recipient email address
 * @param token - Password reset token
 * @param baseUrl - Base URL for the application (e.g., 'https://app.example.com')
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string,
  baseUrl: string = 'http://localhost:5173'
): Promise<void> {
  const resetUrl = `${baseUrl}/reset-password/${token}`;
  
  // TODO: Integrate with email service
  // For now, log the reset link (useful for development)
  console.log(`[Password Reset] Email: ${email}`);
  console.log(`[Password Reset] Reset URL: ${resetUrl}`);
  
  // In production, this would send an actual email:
  // await emailService.send({
  //   to: email,
  //   subject: 'Reset your password',
  //   html: `Click this link to reset your password: <a href="${resetUrl}">${resetUrl}</a>`
  // });
}
