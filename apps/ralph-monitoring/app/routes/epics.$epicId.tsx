import { Link, useRevalidator, data } from 'react-router';
import { useEffect, useRef, useCallback, useMemo } from 'react';
import type { Route } from './+types/epics.$epicId';
import {
  getTaskById,
  getEpicById,
  getTasksByEpicId,
  getExecutionLogs,
} from '~/db/beads.server';
import { getSignalState } from '~/utils/loop-control.server';
import { NowCard } from '~/components/NowCard';
import { ActivityFeed, type ActivityFeedEntry } from '~/components/ActivityFeed';
import { StepsList } from '~/components/StepsList';
import { LoopControlPanel, type LoopRunStatus } from '~/components/LoopControlPanel';
import { ThemeToggle } from '~/components/ThemeToggle';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { ArrowLeft, Play, Pause, PlayCircle } from 'lucide-react';
import { useFetcher } from 'react-router';

const RECENT_ACTIVITY_LIMIT = 10;

export async function loader({ params }: Route.LoaderArgs) {
  const epicId = params.epicId;
  if (!epicId) {
    throw data('Epic ID is required', { status: 400 });
  }

  const epic = getTaskById(epicId);
  if (!epic) {
    throw data('Epic not found', { status: 404 });
  }
  if (epic.parent_id !== null) {
    throw data('Not an epic (task has parent)', { status: 404 });
  }

  const summary = getEpicById(epicId);
  if (!summary) {
    throw data('Epic summary not found', { status: 404 });
  }

  const tasks = getTasksByEpicId(epicId);
  const executionLogs = getExecutionLogs(epicId);
  const taskIdToTitle = Object.fromEntries(tasks.map((t) => [t.id, t.title]));
  const loopSignals = getSignalState();

  return { epic, summary, tasks, executionLogs, taskIdToTitle, loopSignals };
}

export const meta: Route.MetaFunction = ({ data }) => {
  const title = data?.epic ? `${data.epic.title} - Ralph Monitoring` : 'Epic - Ralph Monitoring';
  return [
    { title },
    { name: 'description', content: data?.epic?.description ?? 'Epic progress and tasks' },
  ];
};

function deriveRunStatus(
  loopSignals: { pause: boolean; resume: boolean; skipTaskIds: string[] },
  tasks: { status: string }[]
): LoopRunStatus {
  if (loopSignals.pause) return 'paused';
  const hasInProgress = tasks.some((t) => t.status === 'in_progress');
  return hasInProgress ? 'running' : 'idle';
}

function runStatusBadgeLabel(status: LoopRunStatus): string {
  switch (status) {
    case 'running':
      return 'Running';
    case 'paused':
      return 'Paused';
    case 'idle':
    case 'stopped':
      return 'Idle';
    default:
      return status;
  }
}

export default function EpicDetail({ loaderData }: Route.ComponentProps) {
  const { epic, tasks, executionLogs, taskIdToTitle, loopSignals } = loaderData;
  const runStatus = deriveRunStatus(loopSignals, tasks);

  const revalidator = useRevalidator();
  const revalidateRef = useRef(revalidator.revalidate);
  revalidateRef.current = revalidator.revalidate;

  const stableRevalidate = useCallback(() => {
    revalidateRef.current();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden) {
        stableRevalidate();
      }
    }, 5000);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        stableRevalidate();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [stableRevalidate]);

  const currentTask = useMemo(
    () => tasks.find((t) => t.status === 'in_progress') ?? null,
    [tasks]
  );

  const lastCompletedLog = useMemo(
    () => executionLogs.find((log) => log.ended_at != null) ?? null,
    [executionLogs]
  );

  const activityEntries = useMemo<ActivityFeedEntry[]>(() => {
    return executionLogs.slice(0, RECENT_ACTIVITY_LIMIT).map((log) => ({
      taskId: log.task_id,
      taskTitle: taskIdToTitle[log.task_id] ?? log.task_id,
      startedAt: log.started_at,
      status: log.status,
    }));
  }, [executionLogs, taskIdToTitle]);

  const taskIdToLastStatus = useMemo(() => {
    const map: Record<string, 'success' | 'failed' | 'running'> = {};
    for (const log of executionLogs) {
      if (map[log.task_id] == null) {
        map[log.task_id] = log.status;
      }
    }
    return map;
  }, [executionLogs]);

  return (
    <main className="mx-auto w-full max-w-lg overflow-x-hidden px-[var(--space-4)] py-[var(--space-6)]">
      <header className="mb-[var(--space-4)] flex flex-nowrap items-center gap-[var(--space-2)]">
        <Link
          to="/epics"
          className="inline-flex shrink-0 items-center gap-1 text-muted-foreground underline-offset-4 hover:underline"
          aria-label="Back to Epics"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="min-w-0 flex-1 truncate text-lg font-semibold text-foreground">
          {epic.title}
        </h1>
        <Badge
          variant={runStatus === 'running' ? 'default' : runStatus === 'paused' ? 'secondary' : 'outline'}
          className="shrink-0"
        >
          {runStatusBadgeLabel(runStatus)}
        </Badge>
        <HeaderLoopControl epicId={epic.id} runStatus={runStatus} />
        <ThemeToggle />
      </header>

      <NowCard
        currentTask={currentTask}
        lastCompletedLog={lastCompletedLog}
        taskIdToTitle={taskIdToTitle}
        runStatus={runStatus}
        className="mb-[var(--space-6)]"
      />

      <ActivityFeed entries={activityEntries} className="mb-[var(--space-6)]" />

      <LoopControlPanel epicId={epic.id} runStatus={runStatus} tasks={tasks} className="mb-[var(--space-6)]" />

      <StepsList
        tasks={tasks}
        taskIdToLastStatus={taskIdToLastStatus}
        defaultCollapsed
      />
    </main>
  );
}

/** Compact Start / Pause / Resume control for the header. */
function HeaderLoopControl({
  epicId,
  runStatus,
}: {
  epicId: string;
  runStatus: LoopRunStatus;
}) {
  const startFetcher = useFetcher();
  const pauseResumeFetcher = useFetcher();
  const revalidator = useRevalidator();

  const handleStart = () => {
    startFetcher.submit(
      { epicId },
      { method: 'POST', action: '/api/loop/start', encType: 'application/json' }
    );
    revalidator.revalidate();
  };

  const handlePause = () => {
    if (!window.confirm('Pause the loop after the current task?')) return;
    pauseResumeFetcher.submit(null, { method: 'POST', action: '/api/loop/pause' });
    revalidator.revalidate();
  };

  const handleResume = () => {
    if (!window.confirm('Resume the loop?')) return;
    pauseResumeFetcher.submit(null, { method: 'POST', action: '/api/loop/resume' });
    revalidator.revalidate();
  };

  const isLoading = startFetcher.state !== 'idle' || pauseResumeFetcher.state !== 'idle';

  if (runStatus === 'idle' || runStatus === 'stopped') {
    return (
      <Button
        type="button"
        variant="default"
        size="icon"
        disabled={isLoading}
        onClick={handleStart}
        aria-label="Start run"
      >
        <Play className="h-4 w-4" />
      </Button>
    );
  }

  if (runStatus === 'running') {
    return (
      <Button
        type="button"
        variant="outline"
        size="icon"
        disabled={isLoading}
        onClick={handlePause}
        aria-label="Pause run"
      >
        <Pause className="h-4 w-4" />
      </Button>
    );
  }

  if (runStatus === 'paused') {
    return (
      <Button
        type="button"
        variant="default"
        size="icon"
        disabled={isLoading}
        onClick={handleResume}
        aria-label="Resume run"
      >
        <PlayCircle className="h-4 w-4" />
      </Button>
    );
  }

  return null;
}
