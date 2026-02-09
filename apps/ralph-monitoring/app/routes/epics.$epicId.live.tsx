import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, href, data, useRevalidator } from 'react-router';
import type { Route } from './+types/epics.$epicId.live';
import { getTaskById, getEpicById, getTasksByEpicId } from '~/db/beads.server';
import { getSignalState } from '~/utils/loop-control.server';
import { ArrowLeft, Play } from 'lucide-react';
import { Button } from '~/components/ui/button';

const REVALIDATE_INTERVAL_MS = 3000;

function streamApiUrl(taskId: string): string {
  return `/api/logs/${taskId}/stream`;
}

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
  const loopSignals = getSignalState();
  const hasInProgress = tasks.some((t) => t.status === 'in_progress');
  const runStatus = loopSignals.pause ? 'paused' : hasInProgress ? 'running' : 'idle';
  const currentTask = tasks.find((t) => t.status === 'in_progress') ?? null;

  return {
    epicId,
    epicTitle: epic.title,
    currentTask,
    runStatus,
  };
}

export const meta: Route.MetaFunction = ({ data }) => {
  const title = data?.currentTask
    ? `Live: ${data.currentTask.title} - Ralph`
    : 'Live log - Ralph Monitoring';
  return [{ title }, { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' }];
};

export default function EpicLive({ loaderData }: Route.ComponentProps) {
  const { epicId, currentTask, runStatus } = loaderData;
  const revalidator = useRevalidator();
  const revalidateRef = useRef(revalidator.revalidate);
  revalidateRef.current = revalidator.revalidate;

  const [logs, setLogs] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [streamStatus, setStreamStatus] = useState<'idle' | 'connecting' | 'connected' | 'ended' | 'error'>('idle');
  const [streamError, setStreamError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef(true);
  const isPausedRef = useRef(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const isUnmountingRef = useRef(false);
  const currentTaskIdRef = useRef<string | null>(null);
  const hadConnectedRef = useRef(false);

  const connectToStream = useCallback((taskId: string) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    hadConnectedRef.current = false;
    setStreamStatus('connecting');
    setStreamError(null);

    const url = streamApiUrl(taskId);
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;
    currentTaskIdRef.current = taskId;

    eventSource.onopen = () => {
      if (!isUnmountingRef.current) {
        hadConnectedRef.current = true;
        setStreamStatus('connected');
      }
    };

    eventSource.onmessage = (event: MessageEvent) => {
      if (isUnmountingRef.current) return;
      if (isPausedRef.current) return;
      setLogs((prev) => (prev ? `${prev}\n${event.data}` : event.data));
      if (autoScrollRef.current && containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    };

    eventSource.addEventListener('error', (event: MessageEvent) => {
      try {
        const payload = JSON.parse(event.data) as { error?: string };
        setStreamError(payload.error ?? 'Stream error');
      } catch {
        setStreamError('Stream error');
      }
      setStreamStatus('error');
      eventSource.close();
      eventSourceRef.current = null;
    });

    eventSource.onerror = () => {
      eventSource.close();
      eventSourceRef.current = null;
      if (!isUnmountingRef.current) {
        setStreamStatus(hadConnectedRef.current ? 'ended' : 'error');
      }
    };
  }, []);

  // Revalidate to detect active task change
  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden) revalidateRef.current();
    }, REVALIDATE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Connect / reconnect when currentTask changes
  useEffect(() => {
    isUnmountingRef.current = false;

    if (!currentTask) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      currentTaskIdRef.current = null;
      setStreamStatus('idle');
      return () => {
        isUnmountingRef.current = true;
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }
      };
    }

    if (currentTaskIdRef.current !== currentTask.id) {
      setLogs('');
      connectToStream(currentTask.id);
    }

    return () => {
      isUnmountingRef.current = true;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [currentTask, connectToStream]);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    autoScrollRef.current = scrollTop + clientHeight >= scrollHeight - 20;
  }, []);

  const handleTapToPause = useCallback(() => {
    setIsPaused((prev) => {
      const next = !prev;
      if (next) autoScrollRef.current = false;
      else if (containerRef.current) {
        autoScrollRef.current = true;
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
      return next;
    });
  }, []);

  const handleResume = useCallback(() => {
    setIsPaused(false);
    autoScrollRef.current = true;
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, []);

  const taskLabel = currentTask?.title ?? 'No active task';
  const statusLabel =
    runStatus === 'running' ? 'Running' : runStatus === 'paused' ? 'Paused' : 'Idle';

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-[#0d1117] text-[#e6edf3]"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Thin header bar */}
      <header className="flex shrink-0 items-center gap-2 border-b border-[#30363d] bg-[#161b22] px-3 py-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 text-[#e6edf3] hover:bg-[#30363d] hover:text-[#e6edf3]"
          asChild
        >
          <Link
            to={href('/epics/:epicId', { epicId })}
            className="extend-touch-target inline-flex items-center justify-center"
            aria-label="Back to loop detail"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[#e6edf3]" title={taskLabel}>
            {taskLabel}
          </p>
          <p className="text-xs text-[#8b949e]">{statusLabel}</p>
        </div>
      </header>

      {/* Log content — full area, tappable to pause */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        onClick={handleTapToPause}
        className="flex-1 overflow-auto px-3 py-2 font-mono text-sm leading-relaxed"
        style={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          WebkitTapHighlightColor: 'transparent',
        }}
        role="log"
        aria-live="polite"
      >
        {streamError && (
          <div className="mb-2 rounded bg-red-900/30 px-2 py-1 text-red-300">{streamError}</div>
        )}
        {!currentTask && (
          <p className="text-[#8b949e]">No active task. Start the loop from the loop detail to stream logs.</p>
        )}
        {currentTask && streamStatus === 'connecting' && !logs && (
          <p className="text-[#8b949e]">Connecting to log stream…</p>
        )}
        {logs || null}
      </div>

      {/* Resume bar when paused */}
      {isPaused && (
        <div
          className="shrink-0 border-t border-[#30363d] bg-[#161b22] px-3 py-2"
          style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}
        >
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleResume}
            className="w-full touch-manipulation bg-[#238636] text-white hover:bg-[#2ea043]"
          >
            <Play className="mr-2 h-4 w-4" aria-hidden />
            Resume auto-scroll
          </Button>
        </div>
      )}
    </div>
  );
}
