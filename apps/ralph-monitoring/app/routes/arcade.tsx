import { Link } from 'react-router';
import type { Route } from './+types/arcade';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';

export const meta: Route.MetaFunction = () => [
  { title: 'Memory Match' },
  { name: 'description', content: 'A tiny arcade mode: Memory Match' }
];

export default function Arcade() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-3xl font-bold">Memory Match</h1>
          <Button asChild variant="outline">
            <Link to="/" prefetch="intent">
              Back to Home
            </Link>
          </Button>
        </div>

        <Card>
          <CardContent className="p-6 space-y-3">
            <p className="text-sm text-muted-foreground">
              Arcade mode is landing here. The playable game will be implemented next.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

