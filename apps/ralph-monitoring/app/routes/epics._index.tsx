import { Link, href } from 'react-router';
import type { Route } from './+types/epics._index';
import { getEpics } from '~/db/beads.server';
import { EmptyState } from '~/components/EmptyState';
import { ProgressBar } from '~/components/ProgressBar';
import { ThemeToggle } from '~/components/ThemeToggle';
import { Badge } from '~/components/ui/badge';
import { Card, CardContent, CardHeader } from '~/components/ui/card';
import { Circle, PlayCircle, CheckCircle2, AlertCircle, Layers } from 'lucide-react';
import { cn } from '~/lib/utils';

export async function loader(_args: Route.LoaderArgs) {
  const epics = getEpics();
  return { epics };
}

export const meta: Route.MetaFunction = () => [
  { title: 'Epics - Ralph Monitoring' },
  { name: 'description', content: 'View all epics and their progress' },
];

const statusIcons = {
  open: Circle,
  in_progress: PlayCircle,
  closed: CheckCircle2,
  blocked: AlertCircle,
};

const statusColors = {
  open: 'text-muted-foreground',
  in_progress: 'text-primary',
  closed: 'text-muted-foreground',
  blocked: 'text-destructive',
};

function formatStatusLabel(status: string) {
  switch (status) {
    case 'open':
      return 'Open';
    case 'in_progress':
      return 'In Progress';
    case 'closed':
      return 'Closed';
    case 'blocked':
      return 'Blocked';
    default:
      return status;
  }
}

export default function EpicsIndex({ loaderData }: Route.ComponentProps) {
  const { epics } = loaderData;

  return (
    <main className="mx-auto w-full max-w-4xl p-[var(--space-6)]">
      <header className="mb-[var(--space-6)] flex flex-wrap items-center justify-between gap-[var(--space-4)]">
        <div className="flex items-center gap-[var(--space-3)]">
          <Link
            to="/"
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            ← Home
          </Link>
          <h1 className="text-xl font-semibold text-foreground">Epics</h1>
        </div>
        <ThemeToggle />
      </header>

      {epics.length === 0 ? (
        <EmptyState
          title="No epics yet"
          description="Epics will appear here once Ralph creates parent tasks. Check back soon!"
          icon={Layers}
          variant="card"
        />
      ) : (
        <ul className="space-y-[var(--space-4)]">
          {epics.map((epic) => {
            const StatusIcon = statusIcons[epic.status] ?? statusIcons.open;
            return (
              <li key={epic.id}>
                <Link
                  to={href('/tasks/:taskId', { taskId: epic.id })}
                  className="block transition-opacity hover:opacity-90"
                >
                  <Card className="shadow-none">
                    <CardHeader className="pb-[var(--space-2)]">
                      <div className="flex flex-wrap items-center justify-between gap-[var(--space-2)]">
                        <h2 className="text-base font-medium text-foreground">
                          {epic.title}
                        </h2>
                        <div className="flex items-center gap-[var(--space-2)]">
                          <Badge
                            variant="secondary"
                            className={cn(
                              'gap-1 font-normal',
                              statusColors[epic.status] ?? statusColors.open
                            )}
                          >
                            <StatusIcon className="h-3.5 w-3.5" aria-hidden />
                            {formatStatusLabel(epic.status)}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-[var(--space-3)]">
                      <p className="text-sm text-muted-foreground">
                        {epic.completed_count} of {epic.task_count} tasks
                        completed
                      </p>
                      <ProgressBar
                        value={epic.progress_pct}
                        label={`${epic.progress_pct}%`}
                        showAnimation
                      />
                    </CardContent>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
