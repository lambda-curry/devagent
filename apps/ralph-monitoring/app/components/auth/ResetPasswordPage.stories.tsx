import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { Form } from 'react-router';
import { useId } from 'react';
import { createStorybookRouter } from '~/lib/storybook/router';
import { RouterProvider } from 'react-router';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';

/**
 * Reset Password Page Design Story
 * 
 * Design Intent:
 * - Password and confirm password fields
 * - Clear validation feedback
 * - Submit button to complete reset
 * - Accessible form with proper labels
 */

const ResetPasswordPageComponent = () => {
  const passwordId = useId();
  const passwordDescriptionId = useId();
  const confirmPasswordId = useId();
  const confirmPasswordDescriptionId = useId();

  return (
    <div className="min-h-dvh bg-background flex items-center justify-center p-[var(--space-4)]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset password</CardTitle>
          <CardDescription>Enter your new password below</CardDescription>
        </CardHeader>
        <CardContent>
          <Form method="post" action="/api/reset-password" className="space-y-[var(--space-4)]">
            <div className="space-y-[var(--space-2)]">
              <label htmlFor={passwordId} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                New password
              </label>
              <Input
                id={passwordId}
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="Enter new password"
                required
                aria-required="true"
                aria-describedby={passwordDescriptionId}
              />
              <p id={passwordDescriptionId} className="text-xs text-muted-foreground">
                Must be at least 8 characters long
              </p>
            </div>
            <div className="space-y-[var(--space-2)]">
              <label htmlFor={confirmPasswordId} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Confirm password
              </label>
              <Input
                id={confirmPasswordId}
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Confirm new password"
                required
                aria-required="true"
                aria-describedby={confirmPasswordDescriptionId}
              />
              <p id={confirmPasswordDescriptionId} className="text-xs text-muted-foreground">
                Re-enter your password to confirm
              </p>
            </div>
            <Button type="submit" className="w-full">
              Reset password
            </Button>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

const meta = {
  title: 'auth/ResetPasswordPage',
  component: ResetPasswordPageComponent,
  decorators: [
    (Story) => {
      const router = createStorybookRouter(Story, {
        initialEntries: ['/reset-password/token123']
      });
      return <RouterProvider router={router} />;
    }
  ]
} satisfies Meta<typeof ResetPasswordPageComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default state: Reset password form in idle state
 * 
 * Acceptance:
 * - Password input is visible and focusable
 * - Confirm password input is visible and focusable
 * - Submit button is enabled
 * - Form has accessible labels and descriptions
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    const passwordInput = canvas.getByLabelText(/new password/i);
    const confirmPasswordInput = canvas.getByLabelText(/confirm password/i);
    const submitButton = canvas.getByRole('button', { name: /reset password/i });
    
    await expect(passwordInput).toBeVisible();
    await expect(confirmPasswordInput).toBeVisible();
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
 * - Tab order: Password → Confirm password → Submit button
 * - All interactive elements are keyboard accessible
 */
export const KeyboardNavigation: Story = {
  play: async ({ canvasElement }) => {
    const user = userEvent.setup({ document: canvasElement.ownerDocument });
    const canvas = within(canvasElement);
    
    await user.tab();
    const passwordInput = canvas.getByLabelText(/new password/i);
    await expect(passwordInput).toHaveFocus();
    
    await user.tab();
    const confirmPasswordInput = canvas.getByLabelText(/confirm password/i);
    await expect(confirmPasswordInput).toHaveFocus();
    
    await user.tab();
    const submitButton = canvas.getByRole('button', { name: /reset password/i });
    await expect(submitButton).toHaveFocus();
  }
};
