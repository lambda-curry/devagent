import { Link, useFetcher, useRevalidator, data } from 'react-router';
import type { Route } from './+types/tasks.$taskId';
import { getTaskById } from '~/db/beads.server';
import { ArrowLeft, CheckCircle2, Circle, PlayCircle, AlertCircle, Square } from 'lucide-react';
import { LogViewer } from '~/components/LogViewer';
import { ThemeToggle } from '~/components/ThemeToggle';
import { useEffect } from 'react';

export async function loader({ params }: Route.LoaderArgs) {
  const taskId = params.taskId;
  if (!taskId) {
    throw data('Task ID is required', { status: 400 });
  }

  const task = getTaskById(taskId);
  if (!task) {
    throw data('Task not found', { status: 404 });
  }

  return { task };
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
  open: 'text-gray-500',
  in_progress: 'text-blue-500',
  closed: 'text-green-500',
  blocked: 'text-red-500'
};

export default function TaskDetail({ loaderData }: Route.ComponentProps) {
  const { task } = loaderData;
  const fetcher = useFetcher();
  const revalidator = useRevalidator();
  const StatusIcon = statusIcons[task.status as keyof typeof statusIcons] || Circle;
  const statusColor = statusColors[task.status as keyof typeof statusColors] || 'text-gray-500';
  const isInProgress = task.status === 'in_progress';
  const isStopping = fetcher.state === 'submitting' || fetcher.state === 'loading';

  // Derive stop message from fetcher state (no local state needed)
  const stopResult = fetcher.data as { success?: boolean; message?: string } | undefined;
  const stopMessage = stopResult?.message || null;
  const stopSuccess = stopResult?.success || false;

  // Handle successful stop - revalidate after delay
  useEffect(() => {
    if (stopSuccess) {
      const timer = setTimeout(() => {
        revalidator.revalidate();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [stopSuccess, revalidator]);

  // Automatic revalidation for real-time task updates
  // Poll every 5 seconds when task is active (in_progress or open)
  // Only poll when page is visible to avoid unnecessary requests
  useEffect(() => {
    const isActiveTask = task.status === 'in_progress' || task.status === 'open';

    if (!isActiveTask) {
      return;
    }

    const handleVisibilityChange = () => {
      // Revalidate immediately when page becomes visible
      if (!document.hidden) {
        revalidator.revalidate();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Poll every 5 seconds when page is visible
    const interval = setInterval(() => {
      if (!document.hidden) {
        revalidator.revalidate();
      }
    }, 5000);

    // Initial revalidation after mount
    revalidator.revalidate();

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [task.status, revalidator]);

  const handleStop = () => {
    if (!isInProgress || isStopping) return;

    fetcher.submit(
      {},
      {
        method: 'POST',
        action: `/api/tasks/${task.id}/stop`
      }
    );
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to tasks
          </Link>
          <ThemeToggle />
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-start gap-4 mb-6">
            <StatusIcon className={`w-6 h-6 mt-1 flex-shrink-0 ${statusColor}`} />
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-2">
                <h1 className="text-2xl font-bold">{task.title}</h1>
                {isInProgress && (
                  <button
                    type="button"
                    onClick={handleStop}
                    disabled={isStopping}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                  >
                    <Square className="w-4 h-4" />
                    {isStopping ? 'Stopping...' : 'Stop'}
                  </button>
                )}
              </div>
              {stopMessage && (
                <div
                  className={`mb-2 px-3 py-2 rounded-md text-sm ${
                    stopSuccess
                      ? 'bg-green-500/10 text-green-600 border border-green-500/20'
                      : 'bg-destructive/10 text-destructive border border-destructive/20'
                  }`}
                >
                  {stopMessage}
                </div>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Status: {task.status}</span>
                {task.priority && <span>Priority: {task.priority}</span>}
                <span>ID: {task.id}</span>
              </div>
            </div>
          </div>

          {task.description && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          <div className="border-t border-border pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Created:</span>
                <span className="ml-2">{new Date(task.created_at).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Updated:</span>
                <span className="ml-2">{new Date(task.updated_at).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Log Viewer */}
        <div className="mt-6">
          <LogViewer taskId={task.id} />
        </div>
      </div>
    </div>
  );
}
