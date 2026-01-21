/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ForgotPassword from '../forgot-password';
import { action } from '../api.forgot-password';
import type { Route } from '../+types/api.forgot-password';
import * as authServer from '~/lib/auth.server';
import { createRoutesStub } from '~/lib/test-utils/router';

// Mock the auth server module
vi.mock('~/lib/auth.server', () => ({
  findUserByEmail: vi.fn(),
  createPasswordResetToken: vi.fn(),
  sendPasswordResetEmail: vi.fn()
}));

// Mock ThemeToggle to avoid theme provider dependencies
vi.mock('~/components/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">Theme Toggle</div>
}));

describe('Forgot Password Page', () => {
  const createRouter = (actionHandler?: typeof action) => {
    const routes = [
      { path: '/forgot-password', Component: ForgotPassword },
      {
        path: '/api/forgot-password',
        action: actionHandler || action
      }
    ];
    const Stub = createRoutesStub(routes);
    return function Router() {
      return <Stub initialEntries={['/forgot-password']} />;
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render forgot password page title', () => {
      const Router = createRouter();
      render(<Router />);

      expect(screen.getByText(/Forgot password/i)).toBeInTheDocument();
    });

    it('should render forgot password page description', () => {
      const Router = createRouter();
      render(<Router />);

      expect(screen.getByText(/Enter your email address and we'll send you a link to reset your password/i)).toBeInTheDocument();
    });

    it('should render email input field', () => {
      const Router = createRouter();
      render(<Router />);

      const emailInput = screen.getByLabelText(/Email/i);
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('name', 'email');
      expect(emailInput).toHaveAttribute('required');
    });

    it('should render submit button', () => {
      const Router = createRouter();
      render(<Router />);

      const submitButton = screen.getByRole('button', { name: /Send reset link/i });
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
  });

  describe('Form Submission', () => {
    it('should submit form with valid email', async () => {
      vi.mocked(authServer.findUserByEmail).mockReturnValue(1);
      vi.mocked(authServer.createPasswordResetToken).mockReturnValue('test-token');
      vi.mocked(authServer.sendPasswordResetEmail).mockResolvedValue(undefined);

      const Router = createRouter();
      render(<Router />);

      const emailInput = screen.getByLabelText(/Email/i);
      const submitButton = screen.getByRole('button', { name: /Send reset link/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(authServer.findUserByEmail).toHaveBeenCalledWith('test@example.com');
      });
    });

    it('should show success message after successful submission', async () => {
      vi.mocked(authServer.findUserByEmail).mockReturnValue(1);
      vi.mocked(authServer.createPasswordResetToken).mockReturnValue('test-token');
      vi.mocked(authServer.sendPasswordResetEmail).mockResolvedValue(undefined);

      const Router = createRouter();
      render(<Router />);

      const emailInput = screen.getByLabelText(/Email/i);
      const submitButton = screen.getByRole('button', { name: /Send reset link/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/If an account exists with that email, a password reset link has been sent/i)).toBeInTheDocument();
      });
    });

    it('should show loading state during submission', async () => {
      vi.mocked(authServer.findUserByEmail).mockReturnValue(1);
      vi.mocked(authServer.createPasswordResetToken).mockReturnValue('test-token');
      vi.mocked(authServer.sendPasswordResetEmail).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      const Router = createRouter();
      render(<Router />);

      const emailInput = screen.getByLabelText(/Email/i);
      const submitButton = screen.getByRole('button', { name: /Send reset link/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.click(submitButton);

      // Button should show "Sending..." during submission
      expect(await screen.findByRole('button', { name: /Sending.../i })).toBeInTheDocument();
    });

    it('should disable submit button during submission', async () => {
      vi.mocked(authServer.findUserByEmail).mockReturnValue(1);
      vi.mocked(authServer.createPasswordResetToken).mockReturnValue('test-token');
      vi.mocked(authServer.sendPasswordResetEmail).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      const Router = createRouter();
      render(<Router />);

      const emailInput = screen.getByLabelText(/Email/i);
      const submitButton = screen.getByRole('button', { name: /Send reset link/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.click(submitButton);

      const sendingButton = await screen.findByRole('button', { name: /Sending.../i });
      expect(sendingButton).toBeDisabled();
    });
  });

  describe('API Action', () => {
    const makeActionArgs = (email: string): Route.ActionArgs => {
      const formData = new FormData();
      formData.append('email', email);
      const request = new Request('http://localhost/api/forgot-password', {
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

    it('should return 400 when email is missing', async () => {
      const formData = new FormData();
      const request = new Request('http://localhost/api/forgot-password', {
        method: 'POST',
        body: formData
      });
      const args: Route.ActionArgs = {
        request,
        params: {},
        context: {},
        unstable_pattern: ''
      };

      const thrown = await action(args).catch(error => error);
      expect(thrown).toMatchObject({ init: { status: 400 } });
      const payload = (thrown as { data?: unknown }).data as { error?: string };
      expect(payload.error).toBe('Email is required');
    });

    it('should return 400 when email is empty string', async () => {
      const args = makeActionArgs('');
      const thrown = await action(args).catch(error => error);
      expect(thrown).toMatchObject({ init: { status: 400 } });
      const payload = (thrown as { data?: unknown }).data as { error?: string };
      expect(payload.error).toBe('Email is required');
    });

    it('should return 400 when email format is invalid', async () => {
      const args = makeActionArgs('invalid-email');
      const thrown = await action(args).catch(error => error);
      expect(thrown).toMatchObject({ init: { status: 400 } });
      const payload = (thrown as { data?: unknown }).data as { error?: string };
      expect(payload.error).toBe('Invalid email format');
    });

    it('should return success even when user does not exist (security)', async () => {
      vi.mocked(authServer.findUserByEmail).mockReturnValue(null);

      const args = makeActionArgs('nonexistent@example.com');
      const result = await action(args);

      expect(result).toMatchObject({ type: 'DataWithResponseInit' });
      const payload = (result as { data?: unknown }).data as { success?: boolean };
      expect(payload.success).toBe(true);
      expect(authServer.findUserByEmail).toHaveBeenCalledWith('nonexistent@example.com');
      expect(authServer.createPasswordResetToken).not.toHaveBeenCalled();
    });

    it('should create reset token and send email when user exists', async () => {
      vi.mocked(authServer.findUserByEmail).mockReturnValue(1);
      vi.mocked(authServer.createPasswordResetToken).mockReturnValue('test-token-123');
      vi.mocked(authServer.sendPasswordResetEmail).mockResolvedValue(undefined);

      const args = makeActionArgs('test@example.com');
      const result = await action(args);

      expect(result).toMatchObject({ type: 'DataWithResponseInit' });
      const payload = (result as { data?: unknown }).data as { success?: boolean };
      expect(payload.success).toBe(true);
      expect(authServer.findUserByEmail).toHaveBeenCalledWith('test@example.com');
      expect(authServer.createPasswordResetToken).toHaveBeenCalledWith(1, 24);
      expect(authServer.sendPasswordResetEmail).toHaveBeenCalledWith(
        'test@example.com',
        'test-token-123',
        'http://localhost'
      );
    });

    it('should normalize email to lowercase', async () => {
      vi.mocked(authServer.findUserByEmail).mockReturnValue(1);
      vi.mocked(authServer.createPasswordResetToken).mockReturnValue('test-token');
      vi.mocked(authServer.sendPasswordResetEmail).mockResolvedValue(undefined);

      const args = makeActionArgs('Test@Example.COM');
      await action(args);

      expect(authServer.findUserByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should trim email whitespace', async () => {
      vi.mocked(authServer.findUserByEmail).mockReturnValue(1);
      vi.mocked(authServer.createPasswordResetToken).mockReturnValue('test-token');
      vi.mocked(authServer.sendPasswordResetEmail).mockResolvedValue(undefined);

      const args = makeActionArgs('  test@example.com  ');
      await action(args);

      expect(authServer.findUserByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should return success even if email sending fails (security)', async () => {
      vi.mocked(authServer.findUserByEmail).mockReturnValue(1);
      vi.mocked(authServer.createPasswordResetToken).mockReturnValue('test-token');
      vi.mocked(authServer.sendPasswordResetEmail).mockRejectedValue(new Error('Email service down'));

      const args = makeActionArgs('test@example.com');
      const result = await action(args);

      // Should still return success to prevent information leakage
      expect(result).toMatchObject({ type: 'DataWithResponseInit' });
      const payload = (result as { data?: unknown }).data as { success?: boolean };
      expect(payload.success).toBe(true);
    });
  });
});
