import { Link, href } from 'react-router';
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { formatDurationMs } from '~/lib/utils';
import type { EpicTask } from '~/db/beads.types';
import type { RalphExecutionLog } from '~/db/beads.types';
import { ExternalLink } from 'lucide-react';
import { cn } from '~/lib/utils';

export type LoopRunStatus = 'idle' | 'running' | 'paused' | 'stopped';

export interface NowCardProps {
  /** When running, the task currently in progress */
  currentTask: EpicTask | null;
  /** When idle/paused, the most recent completed execution log (has ended_at) for display */
  lastCompletedLog: RalphExecutionLog | null;
  /** Task ID → display title */
  taskIdToTitle: Record<string, string>;
  runStatus: LoopRunStatus;
  className?: string;
}

function computeElapsedMs(startedAt: string | null | undefined): number | null {
  if (!startedAt) return null;
  const start = Date.parse(startedAt);
  if (Number.isNaN(start)) return null;
  return Math.max(0, Date.now() - start);
}

export function NowCard({
  currentTask,
  lastCompletedLog,
  taskIdToTitle,
  runStatus,
  className,
}: NowCardProps) {
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isRunning = runStatus === 'running' && currentTask != null;
  const startedAt = currentTask?.started_at ?? null;

  useEffect(() => {
    if (!isRunning || !startedAt) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setElapsedMs(null);
      return;
    }
    const tick = () => setElapsedMs(computeElapsedMs(startedAt));
    tick();
    intervalRef.current = setInterval(tick, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [isRunning, startedAt]);

  return (
    <Card
      className={cn(
        'border-border shadow-[var(--shadow-2)]',
        className
      )}
      data-testid="now-card"
    >
      <CardContent className="p-[var(--space-4)]">
        {isRunning && currentTask ? (
          <div className="space-y-[var(--space-3)]">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Now
              </p>
              <p className="mt-1 min-w-0 truncate text-[length:var(--font-size-md)] font-medium text-foreground">
                {currentTask.title}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-x-[var(--space-3)] gap-y-1 text-sm text-muted-foreground">
                {currentTask.agent_type ? (
                  <span>{currentTask.agent_type.replace(/-/g, ' ')}</span>
                ) : null}
                {elapsedMs != null ? (
                  <span>{formatDurationMs(elapsedMs)} elapsed</span>
                ) : null}
              </div>
            </div>
            <Button
              variant="default"
              size="sm"
              className="w-full touch-manipulation sm:w-auto"
              asChild
            >
              <Link
                to={href('/tasks/:taskId', { taskId: currentTask.id })}
                prefetch="intent"
              >
                <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
                Watch Live
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {runStatus === 'paused' ? 'Paused' : 'Last completed'}
            </p>
            {lastCompletedLog ? (
              <>
                <p className="min-w-0 truncate text-[length:var(--font-size-md)] font-medium text-foreground">
                  {taskIdToTitle[lastCompletedLog.task_id] ?? lastCompletedLog.task_id}
                </p>
                <p className="text-sm text-muted-foreground">
                  {lastCompletedLog.status === 'success'
                    ? 'Completed'
                    : lastCompletedLog.status === 'failed'
                      ? 'Failed'
                      : 'Ended'}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No activity yet</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
