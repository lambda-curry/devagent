import { useFetcher, useRevalidator } from 'react-router';
import { Play, Pause, PlayCircle, SkipForward } from 'lucide-react';
import type { EpicTask } from '~/db/beads.types';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader } from '~/components/ui/card';
import { cn } from '~/lib/utils';

export type LoopRunStatus = 'idle' | 'running' | 'paused' | 'stopped';

export interface LoopSignals {
  pause: boolean;
  resume: boolean;
  skipTaskIds: string[];
}

export interface LoopControlPanelProps {
  epicId: string;
  runStatus: LoopRunStatus;
  tasks: EpicTask[];
  runFilePath?: string;
  disabled?: boolean;
  className?: string;
}

function runStatusLabel(status: LoopRunStatus): string {
  switch (status) {
    case 'idle':
    case 'stopped':
      return 'Stopped';
    case 'running':
      return 'Running';
    case 'paused':
      return 'Paused';
    default:
      return status;
  }
}

export function LoopControlPanel({
  epicId,
  runStatus,
  tasks,
  runFilePath,
  disabled = false,
  className,
}: LoopControlPanelProps) {
  const startFetcher = useFetcher();
  const pauseResumeFetcher = useFetcher();
  const skipFetcher = useFetcher();
  const revalidator = useRevalidator();

  const isStartLoading = startFetcher.state !== 'idle';
  const isPauseResumeLoading = pauseResumeFetcher.state !== 'idle';
  const isSkipLoading = skipFetcher.state !== 'idle';

  const handleStart = () => {
    const body: { epicId: string; runFilePath?: string } = { epicId };
    if (runFilePath) body.runFilePath = runFilePath;
    startFetcher.submit(body, {
      method: 'POST',
      action: '/api/loop/start',
      encType: 'application/json',
    });
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

  const handleSkip = (taskId: string) => {
    if (!window.confirm(`Skip task "${tasks.find((t) => t.id === taskId)?.title ?? taskId}"?`)) return;
    skipFetcher.submit(null, {
      method: 'POST',
      action: `/api/loop/skip/${taskId}`,
    });
    revalidator.revalidate();
  };

  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const canStart =
    (runStatus === 'idle' || runStatus === 'stopped') && !disabled && !isStartLoading;
  const canPause = runStatus === 'running' && !disabled && !isPauseResumeLoading;
  const canResume = runStatus === 'paused' && !disabled && !isPauseResumeLoading;

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-[var(--space-2)]">
        <h2 className="text-base font-medium text-foreground">Loop control</h2>
        <p className="text-sm text-muted-foreground" aria-live="polite">
          Status: {runStatusLabel(runStatus)}
        </p>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-[var(--space-3)]">
        {(runStatus === 'idle' || runStatus === 'stopped') ? (
          <Button
            type="button"
            variant="default"
            size="default"
            disabled={!canStart}
            onClick={handleStart}
            aria-label="Start run"
          >
            <Play className="h-4 w-4" aria-hidden />
            {isStartLoading ? 'Starting…' : 'Start'}
          </Button>
        ) : null}

        {runStatus === 'running' ? (
          <Button
            type="button"
            variant="outline"
            size="default"
            disabled={!canPause}
            onClick={handlePause}
            aria-label="Pause run"
          >
            <Pause className="h-4 w-4" aria-hidden />
            {isPauseResumeLoading ? 'Pausing…' : 'Pause'}
          </Button>
        ) : null}

        {runStatus === 'paused' ? (
          <Button
            type="button"
            variant="default"
            size="default"
            disabled={!canResume}
            onClick={handleResume}
            aria-label="Resume run"
          >
            <PlayCircle className="h-4 w-4" aria-hidden />
            {isPauseResumeLoading ? 'Resuming…' : 'Resume'}
          </Button>
        ) : null}

        {inProgressTasks.length > 0
          ? inProgressTasks.map((task) => (
              <Button
                key={task.id}
                type="button"
                variant="secondary"
                size="sm"
                disabled={disabled || isSkipLoading}
                onClick={() => handleSkip(task.id)}
                aria-label={`Skip task ${task.title}`}
              >
                <SkipForward className="h-4 w-4" aria-hidden />
                Skip: {task.title}
              </Button>
            ))
          : null}
      </CardContent>
    </Card>
  );
}
