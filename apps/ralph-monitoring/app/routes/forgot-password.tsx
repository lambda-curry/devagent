import type { Route } from './+types/forgot-password';

export const meta: Route.MetaFunction = () => [
  { title: 'Forgot Password - Ralph Monitoring' },
  { name: 'description', content: 'Request a password reset link' }
];

export default function ForgotPassword() {
  return (
    <div className="min-h-dvh bg-background flex items-center justify-center p-[var(--space-4)]">
      <div className="w-full max-w-md text-center">
        <h1 className="text-2xl font-semibold mb-4">Forgot Password</h1>
        <p className="text-muted-foreground">Password reset functionality will be implemented in devagent-vom.3</p>
      </div>
    </div>
  );
}
