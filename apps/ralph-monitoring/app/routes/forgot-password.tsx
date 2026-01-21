import { useId } from 'react';
import { Link, useFetcher } from 'react-router';
import type { Route } from './+types/forgot-password';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';

export const meta: Route.MetaFunction = () => [
  { title: 'Forgot Password - Ralph Monitoring' },
  { name: 'description', content: 'Request a password reset link' }
];

interface ForgotPasswordResponse {
  success?: boolean;
  message?: string;
  error?: string;
  field?: string;
}

export default function ForgotPassword() {
  const emailId = useId();
  const emailDescriptionId = useId();
  const fetcher = useFetcher<ForgotPasswordResponse>();
  
  const isSubmitting = fetcher.state === 'submitting';
  const actionData = fetcher.data;
  const isSuccess = actionData?.success === true;
  const error = actionData?.error;

  return (
    <div className="min-h-dvh bg-background flex items-center justify-center p-[var(--space-4)]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Forgot password</CardTitle>
          <CardDescription>Enter your email address and we'll send you a link to reset your password</CardDescription>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <div className="space-y-[var(--space-4)]">
              <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4">
                <p className="text-sm text-green-800 dark:text-green-200">
                  {actionData.message || 'If an account exists with that email, a password reset link has been sent.'}
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
            <fetcher.Form method="post" action="/api/forgot-password" className="space-y-[var(--space-4)]">
              {error && (
                <div className="rounded-md bg-destructive/10 p-3">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
              <div className="space-y-[var(--space-2)]">
                <label
                  htmlFor={emailId}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
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
                  aria-invalid={error ? 'true' : 'false'}
                />
                <p id={emailDescriptionId} className="text-xs text-muted-foreground sr-only">
                  Enter the email address associated with your account
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send reset link'}
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
