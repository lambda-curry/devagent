import { Link, useFetcher, useRevalidator, data } from 'react-router';
import type { Route } from './+types/tasks.$taskId';
import { getTaskById, type BeadsComment } from '~/db/beads.server';
import { logFileExists } from '~/utils/logs.server';
import { ArrowLeft, CheckCircle2, Circle, PlayCircle, AlertCircle, Square, Loader2, FileText, CheckSquare, Lightbulb, StickyNote } from 'lucide-react';
import { LogViewer } from '~/components/LogViewer';
import { ThemeToggle } from '~/components/ThemeToggle';
import { Comments } from '~/components/Comments';
import { MarkdownSection } from '~/components/MarkdownSection';
import { useEffect, useState, useRef, useCallback } from 'react';

export async function loader({ params }: Route.LoaderArgs) {
  const taskId = params.taskId;
  if (!taskId) {
    throw data('Task ID is required', { status: 400 });
  }

  const task = getTaskById(taskId);
  if (!task) {
    throw data('Task not found', { status: 404 });
  }

  // Check if log file exists for this task
  const hasLogs = logFileExists(taskId);

  // PERFORMANCE: Comments are now loaded lazily via clientLoader
  // The bd CLI call (spawnSync) was blocking initial page render by ~50-200ms
  // Moving to clientLoader allows the page to render immediately while comments load async
  return { task, hasLogs };
}

// clientLoader fetches comments after initial page render
// This prevents the CLI spawn from blocking page navigation
export async function clientLoader({ serverLoader }: Route.ClientLoaderArgs) {
  const serverData = await serverLoader();
  
  // Comments are fetched client-side in the component via the API route
  // This allows the page to render immediately while comments load async
  return { ...serverData, comments: null as BeadsComment[] | null };
}

// Hydrate to use clientLoader data on initial page load
clientLoader.hydrate = true;

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
  const { task, hasLogs } = loaderData;
  const fetcher = useFetcher();
  const revalidator = useRevalidator();
  const StatusIcon = statusIcons[task.status as keyof typeof statusIcons] || Circle;
  const statusColor = statusColors[task.status as keyof typeof statusColors] || 'text-gray-500';
  const isInProgress = task.status === 'in_progress';
  const isStopping = fetcher.state === 'submitting' || fetcher.state === 'loading';
  
  // Show LogViewer only for active tasks or tasks with existing logs
  const isActiveTask = task.status === 'in_progress' || task.status === 'open';
  const shouldShowLogViewer = isActiveTask || hasLogs;

  // Lazy load comments - fetch via API to avoid blocking render
  const [comments, setComments] = useState<BeadsComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentsError, setCommentsError] = useState<{ type: 'timeout' | 'failed'; message: string } | null>(null);
  const commentsAbortControllerRef = useRef<AbortController | null>(null);
  
  const loadComments = useCallback(async () => {
    setCommentsLoading(true);
    setCommentsError(null);

    // Cancel any previous request (e.g., user hits Retry quickly or route unmounts).
    commentsAbortControllerRef.current?.abort();
    const controller = new AbortController();
    commentsAbortControllerRef.current = controller;
    const timeoutId = window.setTimeout(() => controller.abort(), 8_000);

    try {
      const response = await fetch(`/api/tasks/${task.id}/comments`, { signal: controller.signal });

      if (response.ok) {
        const data = (await response.json()) as { comments?: BeadsComment[] };
        setComments(data.comments || []);
        return;
      }

      const errorPayload = (await response.json().catch(() => ({}))) as { error?: string; type?: string };
      const errorType = errorPayload.type === 'timeout' ? 'timeout' : 'failed';
      const message =
        errorPayload.error ||
        (errorType === 'timeout'
          ? 'Timed out while loading comments. Please retry.'
          : `Failed to load comments (${response.status}). Please retry.`);
      setCommentsError({ type: errorType, message });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setCommentsError({ type: 'timeout', message: 'Timed out while loading comments. Please retry.' });
        return;
      }
      console.warn('Failed to load comments:', error);
      setCommentsError({ type: 'failed', message: 'Failed to load comments. Please retry.' });
    } finally {
      window.clearTimeout(timeoutId);
      setCommentsLoading(false);
    }
  }, [task.id]);

  useEffect(() => {
    void loadComments();
    return () => {
      commentsAbortControllerRef.current?.abort();
    };
  }, [loadComments]);

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
    const isActiveTask = task.status === 'in_progress' || task.status === 'open';

    if (!isActiveTask) {
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
  }, [task.status, stableRevalidate]);

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
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
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

          {/* Markdown Sections - All task fields that contain markdown */}
          <MarkdownSection
            title="Description"
            content={task.description}
            icon={FileText}
          />

          <MarkdownSection
            title="Acceptance Criteria"
            content={task.acceptance_criteria}
            icon={CheckSquare}
          />

          <MarkdownSection
            title="Design"
            content={task.design}
            icon={Lightbulb}
          />

          <MarkdownSection
            title="Notes"
            content={task.notes}
            icon={StickyNote}
          />

          {/* Comments Section - Lazy loaded for performance */}
          {commentsLoading ? (
            <div className="border-t border-border pt-6 mt-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading comments...</span>
              </div>
            </div>
          ) : commentsError ? (
            <div className="border-t border-border pt-6 mt-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-500">
                  <AlertCircle className="w-4 h-4" />
                  <span>{commentsError.message}</span>
                </div>
                <button
                  type="button"
                  onClick={loadComments}
                  className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded-md hover:bg-muted transition-colors text-sm"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <Comments comments={comments} />
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

        {/* Log Viewer - Only show for active tasks or tasks with existing logs */}
        {shouldShowLogViewer && (
          <div className="mt-6">
            <LogViewer taskId={task.id} />
          </div>
        )}
      </div>
    </div>
  );
}
