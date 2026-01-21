import { data } from 'react-router';
import type { Route } from './+types/api.reset-password';
import { validatePasswordResetToken, markTokenAsUsed, updatePassword } from '~/lib/auth.server';

/**
 * API endpoint for password reset submission.
 * 
 * Validates the token, checks password requirements,
 * updates the password, and marks the token as used.
 */
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const token = formData.get('token');
  const password = formData.get('password');
  const confirmPassword = formData.get('confirmPassword');

  // Validate token
  if (!token || typeof token !== 'string') {
    throw data(
      { error: 'Reset token is required', field: 'token' },
      { status: 400 }
    );
  }

  // Validate password
  if (!password || typeof password !== 'string' || password.trim() === '') {
    throw data(
      { error: 'Password is required', field: 'password' },
      { status: 400 }
    );
  }

  // Validate confirm password
  if (!confirmPassword || typeof confirmPassword !== 'string') {
    throw data(
      { error: 'Please confirm your password', field: 'confirmPassword' },
      { status: 400 }
    );
  }

  // Check passwords match
  if (password !== confirmPassword) {
    throw data(
      { error: 'Passwords do not match', field: 'confirmPassword' },
      { status: 400 }
    );
  }

  // Validate password strength (minimum 8 characters)
  if (password.length < 8) {
    throw data(
      { error: 'Password must be at least 8 characters long', field: 'password' },
      { status: 400 }
    );
  }

  // Validate token and get user ID
  const userId = validatePasswordResetToken(token);
  
  if (!userId) {
    throw data(
      { error: 'Invalid or expired reset token', field: 'token' },
      { status: 400 }
    );
  }

  // Update password
  try {
    updatePassword(userId, password);
    
    // Mark token as used
    markTokenAsUsed(token);
    
    // Return success response
    return data({ 
      success: true, 
      message: 'Your password has been reset successfully. You can now sign in with your new password.' 
    });
  } catch (error) {
    console.error('Failed to reset password:', error);
    throw data(
      { error: 'Failed to reset password. Please try again.', field: 'password' },
      { status: 500 }
    );
  }
}
