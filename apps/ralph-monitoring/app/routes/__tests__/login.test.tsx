/** @vitest-environment jsdom */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Login from '../login';
import { createRoutesStub } from '~/lib/test-utils/router';

// Mock ThemeToggle to avoid theme provider dependencies
vi.mock('~/components/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">Theme Toggle</div>
}));

describe('Login Page', () => {
  const createRouter = () => {
    const Stub = createRoutesStub([{ path: '/login', Component: Login }]);
    return function Router() {
      return <Stub initialEntries={['/login']} />;
    };
  };

  it('should render login page title', () => {
    const Router = createRouter();
    render(<Router />);

    // "Sign in" appears in both title and button, so use getAllByText
    const titles = screen.getAllByText(/Sign in/i);
    expect(titles.length).toBeGreaterThan(0);
    // Verify at least one is the page title (in a div with text-lg class)
    const pageTitle = titles.find(el => el.closest('.text-lg'));
    expect(pageTitle).toBeInTheDocument();
  });

  it('should render login page description', () => {
    const Router = createRouter();
    render(<Router />);

    expect(screen.getByText(/Enter your email and password to access your account/i)).toBeInTheDocument();
  });

  it('should render email input field', () => {
    const Router = createRouter();
    render(<Router />);

    const emailInput = screen.getByLabelText(/Email/i);
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('name', 'email');
    expect(emailInput).toHaveAttribute('required');
    expect(emailInput).toHaveAttribute('autoComplete', 'email');
  });

  it('should render password input field', () => {
    const Router = createRouter();
    render(<Router />);

    const passwordInput = screen.getByLabelText(/Password/i);
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('name', 'password');
    expect(passwordInput).toHaveAttribute('required');
    expect(passwordInput).toHaveAttribute('autoComplete', 'current-password');
  });

  it('should render forgot password link', () => {
    const Router = createRouter();
    render(<Router />);

    const forgotPasswordLink = screen.getByRole('link', { name: /Forgot password\?/i });
    expect(forgotPasswordLink).toBeInTheDocument();
    expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password');
  });

  it('should render submit button', () => {
    const Router = createRouter();
    render(<Router />);

    const submitButton = screen.getByRole('button', { name: /Sign in/i });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toHaveAttribute('type', 'submit');
  });

  it('should render form with correct action and method', () => {
    const Router = createRouter();
    render(<Router />);

    const form = document.querySelector('form');
    expect(form).toBeInTheDocument();
    if (form instanceof HTMLFormElement) {
      expect(form).toHaveAttribute('method', 'post');
      expect(form).toHaveAttribute('action', '/api/login');
    }
  });

  it('should have accessible form labels', () => {
    const Router = createRouter();
    render(<Router />);

    const emailLabel = screen.getByLabelText(/Email/i);
    const passwordLabel = screen.getByLabelText(/Password/i);

    expect(emailLabel).toBeInTheDocument();
    expect(passwordLabel).toBeInTheDocument();
  });

  it('should have proper ARIA attributes on inputs', () => {
    const Router = createRouter();
    render(<Router />);

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);

    expect(emailInput).toHaveAttribute('aria-required', 'true');
    expect(passwordInput).toHaveAttribute('aria-required', 'true');
  });
});
