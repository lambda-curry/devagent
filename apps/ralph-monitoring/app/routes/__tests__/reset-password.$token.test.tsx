/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResetPassword, { loader } from '../reset-password.$token';
import { action } from '../api.reset-password';
import type { Route } from '../+types/reset-password.$token';
import type { Route as ApiRoute } from '../+types/api.reset-password';
import * as authServer from '~/lib/auth.server';
import { createRoutesStub } from '~/lib/test-utils/router';
import * as reactRouter from 'react-router';

// Mock the auth server module
vi.mock('~/lib/auth.server', () => ({
  validatePasswordResetToken: vi.fn(),
  markTokenAsUsed: vi.fn(),
  updatePassword: vi.fn()
}));

// Mock ThemeToggle to avoid theme provider dependencies
vi.mock('~/components/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">Theme Toggle</div>
}));

describe('Reset Password Page', () => {
  const defaultLoaderData: Awaited<ReturnType<typeof loader>> = { token: 'valid-token', valid: true };

  const createRouter = (loaderData?: Awaited<ReturnType<typeof loader>>, actionHandler?: typeof action) => {
    const routes = [
      {
        path: '/reset-password/:token',
        Component: ResetPassword
      },
      {
        path: '/api/reset-password',
        action: actionHandler || action
      },
      {
        path: '/login',
        Component: () => <div>Login Page</div>
      }
    ];
    const Stub = createRoutesStub(routes);
    return function Router() {
      return <Stub initialEntries={['/reset-password/valid-token']} />;
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    // Mock useLoaderData to return default loader data for all tests
    vi.spyOn(reactRouter, 'useLoaderData').mockReturnValue(defaultLoaderData);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Loader', () => {
    const makeLoaderArgs = (token: string | undefined): Route.LoaderArgs => ({
      params: { token: token ?? '' },
      request: new Request(`http://localhost/reset-password/${token ?? ''}`),
      context: {},
      unstable_pattern: ''
    });

    it('should throw 400 when token is missing', async () => {
      const thrown = await loader(makeLoaderArgs(undefined)).catch(error => error);
      expect(thrown).toMatchObject({ init: { status: 400 } });
      const payload = (thrown as { data?: unknown }).data;
      expect(payload).toBe('Token is required');
    });

    it('should throw 400 when token is empty string', async () => {
      const thrown = await loader(makeLoaderArgs('')).catch(error => error);
      expect(thrown).toMatchObject({ init: { status: 400 } });
    });

    it('should throw 400 when token is invalid', async () => {
      vi.mocked(authServer.validatePasswordResetToken).mockReturnValue(null);

      const thrown = await loader(makeLoaderArgs('invalid-token')).catch(error => error);
      expect(thrown).toMatchObject({ init: { status: 400 } });
      const payload = (thrown as { data?: unknown }).data;
      expect(payload).toBe('Invalid or expired reset token');
      expect(authServer.validatePasswordResetToken).toHaveBeenCalledWith('invalid-token');
    });

    it('should return token and valid flag when token is valid', async () => {
      vi.mocked(authServer.validatePasswordResetToken).mockReturnValue(1);

      const result = await loader(makeLoaderArgs('valid-token'));
      expect(result).toEqual({ token: 'valid-token', valid: true });
      expect(authServer.validatePasswordResetToken).toHaveBeenCalledWith('valid-token');
    });
  });

  describe('Component Rendering', () => {
    it('should render reset password page title', () => {
      const Router = createRouter();
      render(<Router />);

      // "Reset password" appears in both title and button, so use getAllByText
      const titles = screen.getAllByText(/Reset password/i);
      expect(titles.length).toBeGreaterThan(0);
      // Verify at least one is the page title (in a div with text-lg class)
      const pageTitle = titles.find(el => el.closest('.text-lg'));
      expect(pageTitle).toBeInTheDocument();
    });

    it('should render reset password page description', () => {
      const Router = createRouter();
      render(<Router />);

      expect(screen.getByText(/Enter your new password below/i)).toBeInTheDocument();
    });

    it('should render password input field', () => {
      const Router = createRouter();
      render(<Router />);

      const passwordInput = screen.getByLabelText(/New password/i);
      expect(passwordInput).toBeInTheDocument();
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('name', 'password');
      expect(passwordInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('autoComplete', 'new-password');
    });

    it('should render confirm password input field', () => {
      const Router = createRouter();
      render(<Router />);

      const confirmPasswordInput = screen.getByLabelText(/Confirm password/i);
      expect(confirmPasswordInput).toBeInTheDocument();
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
      expect(confirmPasswordInput).toHaveAttribute('name', 'confirmPassword');
      expect(confirmPasswordInput).toHaveAttribute('required');
      expect(confirmPasswordInput).toHaveAttribute('autoComplete', 'new-password');
    });

    it('should render password requirements hint', () => {
      const Router = createRouter();
      render(<Router />);

      expect(screen.getByText(/Must be at least 8 characters long/i)).toBeInTheDocument();
    });

    it('should render submit button', () => {
      const Router = createRouter();
      render(<Router />);

      const submitButton = screen.getByRole('button', { name: /Reset password/i });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    it('should render back to sign in link', () => {
      const Router = createRouter();
      render(<Router />);

      const backLink = screen.getByRole('link', { name: /Back to sign in/i });
      expect(backLink).toBeInTheDocument();
      expect(backLink).toHaveAttribute('href', '/login');
    });

    it('should render hidden token input', () => {
      const Router = createRouter();
      render(<Router />);

      const tokenInput = document.querySelector('input[name="token"][type="hidden"]');
      expect(tokenInput).toBeInTheDocument();
      expect(tokenInput).toHaveValue('valid-token');
    });
  });

  // Form submission is tested via API action tests below
  // Component-level form submission tests require complex router setup with loaders
  // which is better covered by integration/E2E tests

  describe('API Action', () => {
    const makeActionArgs = (token: string, password: string, confirmPassword: string): ApiRoute.ActionArgs => {
      const formData = new FormData();
      formData.append('token', token);
      formData.append('password', password);
      formData.append('confirmPassword', confirmPassword);
      const request = new Request('http://localhost/api/reset-password', {
        method: 'POST',
        body: formData
      });
      return {
        request,
        params: {},
        context: {},
        unstable_pattern: ''
      };
    };

    it('should return 400 when token is missing', async () => {
      const formData = new FormData();
      formData.append('password', 'newpassword123');
      formData.append('confirmPassword', 'newpassword123');
      const request = new Request('http://localhost/api/reset-password', {
        method: 'POST',
        body: formData
      });
      const args: ApiRoute.ActionArgs = {
        request,
        params: {},
        context: {},
        unstable_pattern: ''
      };

      const thrown = await action(args).catch(error => error);
      expect(thrown).toMatchObject({ init: { status: 400 } });
      const payload = (thrown as { data?: unknown }).data as { error?: string };
      expect(payload.error).toBe('Reset token is required');
    });

    it('should return 400 when password is missing', async () => {
      const args = makeActionArgs('valid-token', '', 'newpassword123');
      const thrown = await action(args).catch(error => error);
      expect(thrown).toMatchObject({ init: { status: 400 } });
      const payload = (thrown as { data?: unknown }).data as { error?: string };
      expect(payload.error).toBe('Password is required');
    });

    it('should return 400 when confirm password is missing', async () => {
      const formData = new FormData();
      formData.append('token', 'valid-token');
      formData.append('password', 'newpassword123');
      const request = new Request('http://localhost/api/reset-password', {
        method: 'POST',
        body: formData
      });
      const args: ApiRoute.ActionArgs = {
        request,
        params: {},
        context: {},
        unstable_pattern: ''
      };

      const thrown = await action(args).catch(error => error);
      expect(thrown).toMatchObject({ init: { status: 400 } });
      const payload = (thrown as { data?: unknown }).data as { error?: string };
      expect(payload.error).toBe('Please confirm your password');
    });

    it('should return 400 when passwords do not match', async () => {
      const args = makeActionArgs('valid-token', 'newpassword123', 'differentpassword');
      const thrown = await action(args).catch(error => error);
      expect(thrown).toMatchObject({ init: { status: 400 } });
      const payload = (thrown as { data?: unknown }).data as { error?: string };
      expect(payload.error).toBe('Passwords do not match');
    });

    it('should return 400 when password is too short', async () => {
      const args = makeActionArgs('valid-token', 'short', 'short');
      const thrown = await action(args).catch(error => error);
      expect(thrown).toMatchObject({ init: { status: 400 } });
      const payload = (thrown as { data?: unknown }).data as { error?: string };
      expect(payload.error).toBe('Password must be at least 8 characters long');
    });

    it('should return 400 when token is invalid', async () => {
      vi.mocked(authServer.validatePasswordResetToken).mockReturnValue(null);

      const args = makeActionArgs('invalid-token', 'newpassword123', 'newpassword123');
      const thrown = await action(args).catch(error => error);
      expect(thrown).toMatchObject({ init: { status: 400 } });
      const payload = (thrown as { data?: unknown }).data as { error?: string };
      expect(payload.error).toBe('Invalid or expired reset token');
    });

    it('should update password and mark token as used when valid', async () => {
      vi.mocked(authServer.validatePasswordResetToken).mockReturnValue(1);
      vi.mocked(authServer.updatePassword).mockImplementation(() => {});
      vi.mocked(authServer.markTokenAsUsed).mockImplementation(() => {});

      const args = makeActionArgs('valid-token', 'newpassword123', 'newpassword123');
      const result = await action(args);

      expect(result).toMatchObject({ type: 'DataWithResponseInit' });
      const payload = (result as { data?: unknown }).data as { success?: boolean };
      expect(payload.success).toBe(true);
      expect(authServer.validatePasswordResetToken).toHaveBeenCalledWith('valid-token');
      expect(authServer.updatePassword).toHaveBeenCalledWith(1, 'newpassword123');
      expect(authServer.markTokenAsUsed).toHaveBeenCalledWith('valid-token');
    });

    it('should return 500 when password update fails', async () => {
      vi.mocked(authServer.validatePasswordResetToken).mockReturnValue(1);
      vi.mocked(authServer.updatePassword).mockImplementation(() => {
        throw new Error('Database error');
      });

      const args = makeActionArgs('valid-token', 'newpassword123', 'newpassword123');
      const thrown = await action(args).catch(error => error);
      expect(thrown).toMatchObject({ init: { status: 500 } });
      const payload = (thrown as { data?: unknown }).data as { error?: string };
      expect(payload.error).toBe('Failed to reset password. Please try again.');
    });
  });
});
