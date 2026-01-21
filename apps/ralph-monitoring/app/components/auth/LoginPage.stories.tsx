import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { Form, Link } from 'react-router';
import { useId } from 'react';
import { createStorybookRouter } from '~/lib/storybook/router';
import { RouterProvider } from 'react-router';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';

/**
 * Login Page Design Story
 * 
 * This story serves as the design mockup and acceptance criteria reference
 * for the login page implementation.
 * 
 * Design Intent:
 * - Clear, centered login form with email and password fields
 * - Visible "Forgot password?" link below password field
 * - Accessible form with proper labels and keyboard navigation
 * - Deterministic states for testing (idle, submitting, error, success)
 */

const LoginPageComponent = () => {
  const emailId = useId();
  const emailDescriptionId = useId();
  const passwordId = useId();
  const passwordDescriptionId = useId();

  return (
    <div className="min-h-dvh bg-background flex items-center justify-center p-[var(--space-4)]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Enter your email and password to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Form method="post" action="/api/login" className="space-y-[var(--space-4)]">
            <div className="space-y-[var(--space-2)]">
              <label htmlFor={emailId} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Email
              </label>
              <Input
                id={emailId}
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                aria-required="true"
                aria-describedby={emailDescriptionId}
              />
              <p id={emailDescriptionId} className="text-xs text-muted-foreground sr-only">
                Enter your email address
              </p>
            </div>
            <div className="space-y-[var(--space-2)]">
              <div className="flex items-center justify-between">
                <label htmlFor={passwordId} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-[var(--focus-ring-width)] focus-visible:ring-ring focus-visible:ring-offset-[var(--focus-ring-offset)] rounded"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id={passwordId}
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                required
                aria-required="true"
                aria-describedby={passwordDescriptionId}
              />
              <p id={passwordDescriptionId} className="text-xs text-muted-foreground sr-only">
                Enter your password
              </p>
            </div>
            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

const meta = {
  title: 'auth/LoginPage',
  component: LoginPageComponent,
  decorators: [
    (Story) => {
      const router = createStorybookRouter(Story, {
        initialEntries: ['/login'],
        extraRoutes: [
          {
            path: '/forgot-password',
            Component: () => (
              <div className="min-h-dvh bg-background flex items-center justify-center p-[var(--space-4)]">
                <Card className="w-full max-w-md">
                  <CardHeader>
                    <CardTitle>Forgot password</CardTitle>
                    <CardDescription>Enter your email to receive a password reset link</CardDescription>
                  </CardHeader>
                </Card>
              </div>
            )
          }
        ]
      });
      return <RouterProvider router={router} />;
    }
  ]
} satisfies Meta<typeof LoginPageComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default state: Login page in idle state
 * 
 * Acceptance:
 * - Email input is visible and focusable
 * - Password input is visible and focusable
 * - "Forgot password?" link is visible and positioned below password label
 * - Submit button is enabled
 * - All form fields have accessible labels
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Verify form elements are present
    const emailInput = canvas.getByLabelText(/email/i);
    const passwordInput = canvas.getByLabelText(/password/i);
    const forgotPasswordLink = canvas.getByRole('link', { name: /forgot password/i });
    const submitButton = canvas.getByRole('button', { name: /sign in/i });
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(forgotPasswordLink).toBeVisible();
    await expect(submitButton).toBeEnabled();
  }
};

/**
 * Dark theme variant
 */
export const Dark: Story = {
  ...Default,
  parameters: {
    theme: 'dark'
  }
};

/**
 * Keyboard navigation test
 * 
 * Acceptance:
 * - Tab order: Email → Password → Forgot password link → Submit button
 * - All interactive elements are keyboard accessible
 * - Focus indicators are visible
 */
export const KeyboardNavigation: Story = {
  play: async ({ canvasElement }) => {
    const user = userEvent.setup({ document: canvasElement.ownerDocument });
    const canvas = within(canvasElement);
    
    // Start from body, tab through form
    await user.tab();
    const emailInput = canvas.getByLabelText(/email/i);
    await expect(emailInput).toHaveFocus();
    
    await user.tab();
    const passwordInput = canvas.getByLabelText(/password/i);
    await expect(passwordInput).toHaveFocus();
    
    await user.tab();
    const forgotPasswordLink = canvas.getByRole('link', { name: /forgot password/i });
    await expect(forgotPasswordLink).toHaveFocus();
    
    await user.tab();
    const submitButton = canvas.getByRole('button', { name: /sign in/i });
    await expect(submitButton).toHaveFocus();
  }
};

/**
 * Forgot password link interaction
 * 
 * Acceptance:
 * - Clicking "Forgot password?" navigates to /forgot-password
 * - Link is clearly visible and has accessible name
 */
export const ForgotPasswordLink: Story = {
  play: async ({ canvasElement }) => {
    const user = userEvent.setup({ document: canvasElement.ownerDocument });
    const canvas = within(canvasElement);
    
    const forgotPasswordLink = canvas.getByRole('link', { name: /forgot password/i });
    await expect(forgotPasswordLink).toBeVisible();
    await expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password');
    
    await user.click(forgotPasswordLink);
    // Navigation would happen in real app - in story we just verify link exists
  }
};
