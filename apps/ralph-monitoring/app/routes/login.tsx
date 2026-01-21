import { useId } from 'react';
import { Form, Link } from 'react-router';
import type { Route } from './+types/login';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';

export const meta: Route.MetaFunction = () => [
  { title: 'Sign in - Ralph Monitoring' },
  { name: 'description', content: 'Sign in to your Ralph Monitoring account' }
];

export default function Login() {
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
              />
              <p id={emailDescriptionId} className="text-xs text-muted-foreground sr-only">
                Enter your email address
              </p>
            </div>
            <div className="space-y-[var(--space-2)]">
              <div className="flex items-center justify-between">
                <label
                  htmlFor={passwordId}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
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
}
