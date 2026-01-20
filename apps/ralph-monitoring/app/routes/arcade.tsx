import { Link, href } from 'react-router';
import type { Route } from './+types/arcade';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';

export const meta: Route.MetaFunction = () => [
  { title: 'Memory Match' },
  { name: 'description', content: 'Play Memory Match in the Ralph Arcade.' }
];

export default function Arcade(_: Route.ComponentProps) {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">Memory Match</h1>
          <Button asChild variant="outline">
            <Link to={href('/')} prefetch="intent">
              Back to home
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Arcade</CardTitle>
            <CardDescription>Mini-games live here. Memory Match is coming next.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This route is intentionally lightweight for now; the deterministic game UI/logic is implemented in the next task.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

