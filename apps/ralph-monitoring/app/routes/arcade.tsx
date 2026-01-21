import { Link } from 'react-router';
import type { Route } from './+types/arcade';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';

export const meta: Route.MetaFunction = () => [{ title: 'Memory Match' }];

export default function Arcade() {
  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto w-full max-w-3xl p-[var(--space-6)] space-y-[var(--space-6)]">
        <div className="flex items-center justify-between gap-[var(--space-3)]">
          <h1 className="text-2xl font-semibold tracking-tight">Memory Match</h1>
          <Button asChild variant="outline">
            <Link to="/" prefetch="intent">
              Back to tasks
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Arcade</CardTitle>
            <CardDescription>Deterministic mini-games for Ralph E2E runs.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              The Memory Match game UI and logic will land in a follow-up task.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

