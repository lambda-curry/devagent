import { Link, useFetcher, useRevalidator, data } from 'react-router';
import type { Route } from './+types/tasks.$taskId';
import { getTaskById, getTaskCommentsDirect } from '~/db/beads.server';
import { formatDurationMs, cn } from '~/lib/utils';
import { logFileExists, resolveLogPathForRead } from '~/utils/logs.server';
import { ArrowLeft, CheckCircle2, Circle, PlayCircle, AlertCircle, Square, FileText, CheckSquare, Lightbulb, StickyNote } from 'lucide-react';
import { LogViewer } from '~/components/LogViewer';
import { ThemeToggle } from '~/components/ThemeToggle';
import { Comments } from '~/components/Comments';
import { MarkdownSection } from '~/components/MarkdownSection';
import { useEffect, useRef, useCallback } from 'react';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader } from '~/components/ui/card';

export async function loader({ params }: Route.LoaderArgs) {
  const taskId = params.taskId;
  if (!taskId) {
    throw data('Task ID is required', { status: 400 });
  }

  const task = getTaskById(taskId);
  if (!task) {
    throw data('Task not found', { status: 404 });
  }

  // Determine if this task has ever been executed by Ralph (has execution log entry)
  // log_file_path is set when Ralph starts executing, so its presence indicates execution history
  const hasExecutionHistory = task.log_file_path != null;

  // Resolve the log path using stored path when available (avoids path/env mismatches)
  const resolvedLogPath = hasExecutionHistory 
    ? resolveLogPathForRead(taskId, task.log_file_path)
    : null;

  // Only check filesystem for log file if task has execution history
  // This avoids unnecessary filesystem checks for tasks that were never executed
  const hasLogs = hasExecutionHistory ? logFileExists(taskId, resolvedLogPath) : false;

  const comments = getTaskCommentsDirect(taskId);
  return { task, hasLogs, hasExecutionHistory, comments };
}

export function meta({ data }: Route.MetaArgs) {
  const title = data?.task ? `${data.task.title} - Ralph Monitoring` : 'Task - Ralph Monitoring';
  return [{ title }, { name: 'description', content: data?.task?.description || 'Task details' }];
}

const statusIcons = {
  open: Circle,
  in_progress: PlayCircle,
  closed: CheckCircle2,
  blocked: AlertCircle
};

const statusColors = {
  open: 'text-muted-foreground',
  in_progress: 'text-primary',
  closed: 'text-muted-foreground',
  blocked: 'text-destructive'
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

export default function TaskDetail({ loaderData }: Route.ComponentProps) {
  const { task, hasLogs, hasExecutionHistory, comments } = loaderData;
  const fetcher = useFetcher();
  const revalidator = useRevalidator();
  const StatusIcon = statusIcons[task.status as keyof typeof statusIcons] || Circle;
  const statusColor = statusColors[task.status as keyof typeof statusColors] || 'text-muted-foreground';
  const isInProgress = task.status === 'in_progress';
  const isStopping = fetcher.state === 'submitting' || fetcher.state === 'loading';
  
  // Canonical "active task" definition used to gate live streaming
  const isTaskActive = task.status === 'in_progress' || task.status === 'open';

  // Derive stop message from fetcher state (no local state needed)
  const stopResult = fetcher.data as { success?: boolean; message?: string } | undefined;
  const stopMessage = stopResult?.message || null;
  const stopSuccess = stopResult?.success || false;

  // Use ref to access revalidator.revalidate without causing effect re-runs
  // The revalidator object reference may change on renders, but we only need
  // the revalidate function which is stable
  const revalidateRef = useRef(revalidator.revalidate);
  revalidateRef.current = revalidator.revalidate;

  // Stable revalidate callback that doesn't change between renders
  const stableRevalidate = useCallback(() => {
    revalidateRef.current();
  }, []);

  // Handle successful stop - revalidate after delay
  useEffect(() => {
    if (stopSuccess) {
      const timer = setTimeout(() => {
        stableRevalidate();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [stopSuccess, stableRevalidate]);

  // Automatic revalidation for real-time task updates
  // Poll every 5 seconds when task is active (in_progress or open)
  // Only poll when page is visible to avoid unnecessary requests
  useEffect(() => {
    if (!isTaskActive) {
      return;
    }

    const handleVisibilityChange = () => {
      // Revalidate immediately when page becomes visible
      if (!document.hidden) {
        stableRevalidate();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Poll every 5 seconds when page is visible
    const interval = setInterval(() => {
      if (!document.hidden) {
        stableRevalidate();
      }
    }, 5000);

    // NOTE: Removed initial revalidation on mount - the loader already ran
    // during navigation, so immediate revalidation is redundant and causes
    // unnecessary re-renders

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isTaskActive, stableRevalidate]);

  const handleStop = () => {
    if (!isInProgress || isStopping) return;

    fetcher.submit(
      new FormData(),
      {
        method: 'POST',
        encType: 'multipart/form-data',
        action: `/api/tasks/${task.id}/stop`
      }
    );
  };

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto w-full max-w-4xl p-[var(--space-6)]">
        <div className="flex items-center justify-between mb-[var(--space-6)]">
          <Link
            to="/"
            prefetch="intent"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to tasks
          </Link>
          <ThemeToggle />
        </div>

        <Card>
          <CardHeader className="gap-[var(--space-3)]">
            <div className="flex items-start justify-between gap-[var(--space-4)]">
              <div className="flex items-start gap-[var(--space-3)]">
                <StatusIcon className={cn('mt-0.5 h-5 w-5 flex-shrink-0', statusColor)} aria-hidden="true" />
                <div className="min-w-0">
                  <h1 className="text-lg font-semibold leading-[var(--line-height-tight)] tracking-tight">
                    {task.title}
                  </h1>
                  <div className="mt-[var(--space-2)] flex flex-wrap items-center gap-[var(--space-2)] text-sm text-muted-foreground">
                    <span className="sr-only">Status: {task.status}</span>
                    <Badge variant={task.status === 'blocked' ? 'destructive' : task.status === 'in_progress' ? 'default' : task.status === 'closed' ? 'secondary' : 'outline'}>
                      {formatStatusLabel(task.status)}
                    </Badge>
                    {task.priority ? (
                      <>
                        <span className="sr-only">Priority: {task.priority}</span>
                        <Badge variant="outline">{task.priority}</Badge>
                      </>
                    ) : null}
                    {task.duration_ms != null && task.duration_ms >= 0 ? (
                      <span title="Last run duration">{formatDurationMs(task.duration_ms)}</span>
                    ) : null}
                    <span className="font-mono">ID: {task.id}</span>
                  </div>
                </div>
              </div>

              {isInProgress ? (
                <Button variant="destructive" onClick={handleStop} disabled={isStopping}>
                  <Square className="h-4 w-4" />
                  {isStopping ? 'Stopping…' : 'Stop'}
                </Button>
              ) : null}
            </div>

            {stopMessage ? (
              <div
                className={cn(
                  'rounded-lg border px-[var(--space-3)] py-[var(--space-2)] text-sm',
                  stopSuccess ? 'border-primary/20 bg-primary/10 text-primary' : 'border-destructive/20 bg-destructive/10 text-destructive'
                )}
              >
                {stopMessage}
              </div>
            ) : null}
          </CardHeader>

          <CardContent className="space-y-[var(--space-6)]">
            <MarkdownSection title="Description" content={task.description} icon={FileText} />
            <MarkdownSection title="Acceptance Criteria" content={task.acceptance_criteria} icon={CheckSquare} />
            <MarkdownSection title="Design" content={task.design} icon={Lightbulb} />
            <MarkdownSection title="Notes" content={task.notes} icon={StickyNote} />

            <div className="rounded-lg border bg-surface p-[var(--space-4)] text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[var(--space-3)]">
                <div>
                  <div className="text-xs text-muted-foreground">Created:</div>
                  <div>{new Date(task.created_at).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Updated:</div>
                  <div>{new Date(task.updated_at).toLocaleString()}</div>
                </div>
                {task.started_at != null ? (
                  <div>
                    <div className="text-xs text-muted-foreground">Last run started:</div>
                    <div>{new Date(task.started_at).toLocaleString()}</div>
                  </div>
                ) : null}
                {task.ended_at != null ? (
                  <div>
                    <div className="text-xs text-muted-foreground">Last run ended:</div>
                    <div>{new Date(task.ended_at).toLocaleString()}</div>
                  </div>
                ) : null}
                {task.duration_ms != null && task.duration_ms >= 0 ? (
                  <div>
                    <div className="text-xs text-muted-foreground">Last run duration:</div>
                    <div>{formatDurationMs(task.duration_ms)}</div>
                  </div>
                ) : null}
              </div>
            </div>

            <Comments comments={comments} />
          </CardContent>
        </Card>

        {/* Log Viewer */}
        <div className="mt-[var(--space-6)] space-y-[var(--space-6)]">
          <LogViewer taskId={task.id} isTaskActive={isTaskActive} hasLogs={hasLogs} hasExecutionHistory={hasExecutionHistory} />
        </div>
      </div>
    </div>
  );
}
