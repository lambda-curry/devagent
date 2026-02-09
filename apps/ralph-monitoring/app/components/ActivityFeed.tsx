import { Link, href } from 'react-router';
import { formatRelativeTime } from '~/lib/formatRelativeTime';
import type { RalphExecutionLog } from '~/db/beads.types';
import { Check, X, Loader2 } from 'lucide-react';
import { cn } from '~/lib/utils';

export interface ActivityFeedEntry {
  taskId: string;
  taskTitle: string;
  startedAt: string;
  status: RalphExecutionLog['status'];
}

export interface ActivityFeedProps {
  /** Last N execution log entries (newest first) */
  entries: ActivityFeedEntry[];
  /** Max title length before truncation */
  maxTitleLength?: number;
  className?: string;
}

const statusConfig: Record<
  RalphExecutionLog['status'],
  { icon: typeof Check; label: string; className: string }
> = {
  success: {
    icon: Check,
    label: 'Success',
    className: 'text-green-600 dark:text-green-400',
  },
  failed: {
    icon: X,
    label: 'Failed',
    className: 'text-destructive',
  },
  running: {
    icon: Loader2,
    label: 'Running',
    className: 'text-primary animate-spin',
  },
};

function truncateTitle(title: string, maxLen: number): string {
  if (title.length <= maxLen) return title;
  return `${title.slice(0, maxLen - 1).trim()}…`;
}

export function ActivityFeed({
  entries,
  maxTitleLength = 32,
  className,
}: ActivityFeedProps) {
  return (
    <section
      className={cn('space-y-0', className)}
      aria-label="Recent activity"
      data-testid="activity-feed"
    >
      <h2 className="mb-[var(--space-2)] text-sm font-medium text-foreground">
        Recent Activity
      </h2>
      {entries.length === 0 ? (
        <p className="py-[var(--space-3)] text-sm text-muted-foreground">
          No activity yet
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {entries.map((entry) => {
            const config = statusConfig[entry.status];
            const Icon = config.icon;
            return (
              <li key={`${entry.taskId}-${entry.startedAt}`}>
                <Link
                  to={href('/tasks/:taskId', { taskId: entry.taskId })}
                  prefetch="intent"
                  className={cn(
                    'flex min-h-[44px] touch-manipulation items-center gap-[var(--space-3)] px-0 py-[var(--space-2)]',
                    'text-left text-sm hover:bg-accent/50 active:opacity-[var(--active-opacity)]',
                    'focus-visible:outline-none focus-visible:ring-[var(--focus-ring-width)] focus-visible:ring-ring focus-visible:ring-offset-[var(--focus-ring-offset)]'
                  )}
                >
                  <span
                    className="w-16 shrink-0 text-xs text-muted-foreground"
                    title={entry.startedAt}
                  >
                    {formatRelativeTime(entry.startedAt)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-foreground" title={entry.taskTitle}>
                    {truncateTitle(entry.taskTitle, maxTitleLength)}
                  </span>
                  <Icon
                    className={cn('h-4 w-4 shrink-0', config.className)}
                    aria-label={config.label}
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
