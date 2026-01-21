import { data } from 'react-router';
import type { Route } from './+types/api.forgot-password';
import { findUserByEmail, createPasswordResetToken, sendPasswordResetEmail } from '~/lib/auth.server';

/**
 * API endpoint for forgot password requests.
 * 
 * Accepts an email address, generates a secure reset token,
 * and sends a password reset email.
 * 
 * For security, always returns success even if email is not found
 * (prevents email enumeration attacks).
 */
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const email = formData.get('email');

  // Validate email input
  if (!email || typeof email !== 'string' || email.trim() === '') {
    throw data(
      { error: 'Email is required', field: 'email' },
      { status: 400 }
    );
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    throw data(
      { error: 'Invalid email format', field: 'email' },
      { status: 400 }
    );
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Find user by email
  const userId = findUserByEmail(normalizedEmail);

  // For security, always return success even if user doesn't exist
  // This prevents email enumeration attacks
  if (userId) {
    try {
      // Generate reset token (valid for 24 hours)
      const token = createPasswordResetToken(userId, 24);

      // Get base URL from request
      const url = new URL(request.url);
      const baseUrl = `${url.protocol}//${url.host}`;

      // Send password reset email
      await sendPasswordResetEmail(normalizedEmail, token, baseUrl);
    } catch (error) {
      // Log error but still return success to user
      // This prevents information leakage about system failures
      console.error('Failed to process password reset request:', error);
    }
  }

  // Always return success to prevent email enumeration
  return data({ success: true, message: 'If an account exists with that email, a password reset link has been sent.' });
}
