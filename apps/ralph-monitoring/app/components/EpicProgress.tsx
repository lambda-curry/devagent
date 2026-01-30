import { Circle, PlayCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import type { BeadsTask } from '~/db/beads.server';
import type { EpicSummary, EpicTask } from '~/db/beads.server';
import { formatDurationMs } from '~/db/beads.server';
import { ProgressBar } from '~/components/ProgressBar';
import { Card, CardContent, CardHeader } from '~/components/ui/card';
import { cn } from '~/lib/utils';

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

/**
 * Compute estimated time remaining from average duration of completed tasks.
 * Pure function for testability.
 *
 * @param taskCount - Total tasks in epic
 * @param completedCount - Number of closed tasks
 * @param tasksWithDuration - Duration in ms for each task that has a completed run (can be empty)
 * @returns Estimated remaining time in ms, or null if not estimable
 */
export function estimateTimeRemainingMs(
  taskCount: number,
  completedCount: number,
  tasksWithDuration: number[]
): number | null {
  const remaining = taskCount - completedCount;
  if (remaining <= 0 || tasksWithDuration.length === 0) return null;
  const validDurations = tasksWithDuration.filter((d) => typeof d === 'number' && d > 0);
  if (validDurations.length === 0) return null;
  const avgMs = validDurations.reduce((a, b) => a + b, 0) / validDurations.length;
  return Math.round(avgMs * remaining);
}

export interface EpicProgressProps {
  epic: BeadsTask;
  summary: EpicSummary;
  tasks: EpicTask[];
}

export function EpicProgress({ epic, summary, tasks }: EpicProgressProps) {
  const completedWithDuration = tasks
    .filter((t) => t.status === 'closed' && t.duration_ms != null && t.duration_ms >= 0)
    .map((t) => t.duration_ms!);
  const estimatedMs = estimateTimeRemainingMs(
    summary.task_count,
    summary.completed_count,
    completedWithDuration
  );

  return (
    <div className="space-y-[var(--space-6)]">
      {epic.description ? (
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{epic.description}</p>
      ) : null}

      <div className="space-y-[var(--space-2)]">
        <p className="text-sm text-muted-foreground">
          {summary.completed_count} of {summary.task_count} tasks completed
        </p>
        <ProgressBar
          value={summary.progress_pct}
          label={`${summary.progress_pct}%`}
          showAnimation
        />
      </div>

      {estimatedMs != null && estimatedMs > 0 ? (
        <p className="text-sm text-muted-foreground">
          Estimated time remaining: {formatDurationMs(estimatedMs)}
        </p>
      ) : null}

      <Card>
        <CardHeader className="pb-[var(--space-2)]">
          <h2 className="text-base font-medium text-foreground">Tasks</h2>
        </CardHeader>
        <CardContent>
          <ul className="space-y-[var(--space-3)]">
            {tasks.map((task) => {
              const StatusIcon = statusIcons[task.status as keyof typeof statusIcons] ?? Circle;
              return (
                <li
                  key={task.id}
                  className="flex flex-wrap items-center gap-x-[var(--space-3)] gap-y-[var(--space-1)] text-sm"
                >
                  <StatusIcon
                    className={cn('h-4 w-4 flex-shrink-0', statusColors[task.status as keyof typeof statusColors] ?? 'text-muted-foreground')}
                    aria-hidden
                  />
                  <span className="min-w-0 truncate font-medium text-foreground">{task.title}</span>
                  <span className="text-muted-foreground">{formatStatusLabel(task.status)}</span>
                  {task.duration_ms != null && task.duration_ms >= 0 ? (
                    <span className="text-muted-foreground" title="Duration">
                      {formatDurationMs(task.duration_ms)}
                    </span>
                  ) : null}
                  {task.agent_type ? (
                    <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                      {task.agent_type}
                    </span>
                  ) : null}
                  <span className="font-mono text-xs text-muted-foreground">{task.id}</span>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
