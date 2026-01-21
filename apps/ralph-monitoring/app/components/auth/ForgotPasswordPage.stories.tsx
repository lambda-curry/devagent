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
 * Forgot Password Page Design Story
 * 
 * Design Intent:
 * - Simple email submission form
 * - Clear success state after submission
 * - Link back to login page
 * - Accessible form with proper labels
 */

const ForgotPasswordPageComponent = () => {
  const emailId = useId();
  const emailDescriptionId = useId();

  return (
    <div className="min-h-dvh bg-background flex items-center justify-center p-[var(--space-4)]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Forgot password</CardTitle>
          <CardDescription>Enter your email address and we'll send you a link to reset your password</CardDescription>
        </CardHeader>
        <CardContent>
          <Form method="post" action="/api/forgot-password" className="space-y-[var(--space-4)]">
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
                Enter the email address associated with your account
              </p>
            </div>
            <Button type="submit" className="w-full">
              Send reset link
            </Button>
            <div className="text-center text-sm">
              <Link
                to="/login"
                className="text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-[var(--focus-ring-width)] focus-visible:ring-ring focus-visible:ring-offset-[var(--focus-ring-offset)] rounded"
              >
                Back to sign in
              </Link>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

const meta = {
  title: 'auth/ForgotPasswordPage',
  component: ForgotPasswordPageComponent,
  decorators: [
    (Story) => {
      const router = createStorybookRouter(Story, {
        initialEntries: ['/forgot-password'],
        extraRoutes: [
          {
            path: '/login',
            Component: () => (
              <div className="min-h-dvh bg-background flex items-center justify-center p-[var(--space-4)]">
                <Card className="w-full max-w-md">
                  <CardHeader>
                    <CardTitle>Sign in</CardTitle>
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
} satisfies Meta<typeof ForgotPasswordPageComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default state: Forgot password form in idle state
 * 
 * Acceptance:
 * - Email input is visible and focusable
 * - Submit button is enabled
 * - "Back to sign in" link is visible
 * - Form has accessible labels
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    const emailInput = canvas.getByLabelText(/email/i);
    const submitButton = canvas.getByRole('button', { name: /send reset link/i });
    const backLink = canvas.getByRole('link', { name: /back to sign in/i });
    
    await expect(emailInput).toBeVisible();
    await expect(submitButton).toBeEnabled();
    await expect(backLink).toBeVisible();
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
 * - Tab order: Email → Submit button → Back to sign in link
 * - All interactive elements are keyboard accessible
 */
export const KeyboardNavigation: Story = {
  play: async ({ canvasElement }) => {
    const user = userEvent.setup({ document: canvasElement.ownerDocument });
    const canvas = within(canvasElement);
    
    await user.tab();
    const emailInput = canvas.getByLabelText(/email/i);
    await expect(emailInput).toHaveFocus();
    
    await user.tab();
    const submitButton = canvas.getByRole('button', { name: /send reset link/i });
    await expect(submitButton).toHaveFocus();
    
    await user.tab();
    const backLink = canvas.getByRole('link', { name: /back to sign in/i });
    await expect(backLink).toHaveFocus();
  }
};
