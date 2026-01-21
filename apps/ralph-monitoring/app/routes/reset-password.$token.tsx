import { useId, useEffect } from 'react';
import { Link, useFetcher, useLoaderData, useNavigate } from 'react-router';
import type { Route } from './+types/reset-password.$token';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { validatePasswordResetToken } from '~/lib/auth.server';
import { data } from 'react-router';

export const meta: Route.MetaFunction = () => [
  { title: 'Reset Password - Ralph Monitoring' },
  { name: 'description', content: 'Set a new password for your account' }
];

interface ResetPasswordResponse {
  success?: boolean;
  message?: string;
  error?: string;
  field?: string;
}

/**
 * Loader validates the token from the URL.
 * If token is invalid/expired, throws error response.
 */
export async function loader({ params }: Route.LoaderArgs) {
  const { token } = params;
  
  if (!token) {
    throw data('Token is required', { status: 400 });
  }
  
  const userId = validatePasswordResetToken(token);
  
  if (!userId) {
    throw data('Invalid or expired reset token', { status: 400 });
  }
  
  return { token, valid: true };
}

export default function ResetPassword() {
  const { token } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const passwordId = useId();
  const passwordDescriptionId = useId();
  const confirmPasswordId = useId();
  const confirmPasswordDescriptionId = useId();
  const fetcher = useFetcher<ResetPasswordResponse>();
  
  const isSubmitting = fetcher.state === 'submitting';
  const actionData = fetcher.data;
  const isSuccess = actionData?.success === true;
  const error = actionData?.error;
  const fieldError = actionData?.field;

  // Redirect to login page after successful password reset
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        navigate('/login?reset=success');
      }, 2000); // Show success message for 2 seconds before redirecting
      return () => clearTimeout(timer);
    }
  }, [isSuccess, navigate]);

  return (
    <div className="min-h-dvh bg-background flex items-center justify-center p-[var(--space-4)]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset password</CardTitle>
          <CardDescription>Enter your new password below</CardDescription>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <div className="space-y-[var(--space-4)]">
              <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4">
                <p className="text-sm text-green-800 dark:text-green-200">
                  {actionData.message || 'Your password has been reset successfully.'}
                </p>
              </div>
              <div className="text-center text-sm">
                <Link
                  to="/login"
                  className="text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-[var(--focus-ring-width)] focus-visible:ring-ring focus-visible:ring-offset-[var(--focus-ring-offset)] rounded"
                >
                  Back to sign in
                </Link>
              </div>
            </div>
          ) : (
            <fetcher.Form method="post" action="/api/reset-password" className="space-y-[var(--space-4)]">
              <input type="hidden" name="token" value={token} />
              {error && (
                <div className="rounded-md bg-destructive/10 p-3">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
              <div className="space-y-[var(--space-2)]">
                <label
                  htmlFor={passwordId}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
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
                  aria-invalid={fieldError === 'password' ? 'true' : 'false'}
                />
                <p id={passwordDescriptionId} className="text-xs text-muted-foreground">
                  Must be at least 8 characters long
                </p>
              </div>
              <div className="space-y-[var(--space-2)]">
                <label
                  htmlFor={confirmPasswordId}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
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
                  aria-invalid={fieldError === 'confirmPassword' ? 'true' : 'false'}
                />
                <p id={confirmPasswordDescriptionId} className="text-xs text-muted-foreground">
                  Re-enter your password to confirm
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Resetting...' : 'Reset password'}
              </Button>
              <div className="text-center text-sm">
                <Link
                  to="/login"
                  className="text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-[var(--focus-ring-width)] focus-visible:ring-ring focus-visible:ring-offset-[var(--focus-ring-offset)] rounded"
                >
                  Back to sign in
                </Link>
              </div>
            </fetcher.Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
