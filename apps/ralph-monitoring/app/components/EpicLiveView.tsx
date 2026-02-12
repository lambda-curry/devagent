import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, href, useRevalidator } from 'react-router';
import { ArrowLeft, Play } from 'lucide-react';
import { Button } from '~/components/ui/button';

const REVALIDATE_INTERVAL_MS = 3000;

export function streamApiUrl(taskId: string): string {
  return `/api/logs/${taskId}/stream`;
}

export interface EpicLiveViewTask {
  id: string;
  title: string;
}

export interface EpicLiveViewProps {
  epicId: string;
  epicTitle?: string;
  currentTask: EpicLiveViewTask | null;
  runStatus: 'idle' | 'running' | 'paused';
}

export function EpicLiveView({ epicId, currentTask, runStatus }: EpicLiveViewProps) {
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
  const pendingLinesRef = useRef<string[]>([]);
  const flushRafRef = useRef<number | null>(null);

  const flushPendingLogs = useCallback(() => {
    if (pendingLinesRef.current.length === 0) return;
    const lines = pendingLinesRef.current;
    pendingLinesRef.current = [];
    setLogs((prev) => (prev ? `${prev}\n${lines.join('\n')}` : lines.join('\n')));
    if (autoScrollRef.current && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, []);

  const scheduleFlush = useCallback(() => {
    if (flushRafRef.current != null) return;
    flushRafRef.current = requestAnimationFrame(() => {
      flushRafRef.current = null;
      if (!isUnmountingRef.current) flushPendingLogs();
    });
  }, [flushPendingLogs]);

  const connectToStream = useCallback((taskId: string) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (flushRafRef.current != null) {
      cancelAnimationFrame(flushRafRef.current);
      flushRafRef.current = null;
    }
    pendingLinesRef.current = [];
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
      pendingLinesRef.current.push(event.data);
      scheduleFlush();
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
  }, [scheduleFlush]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden) revalidateRef.current();
    }, REVALIDATE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

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
      className="fixed inset-0 z-50 flex flex-col bg-code text-code-foreground"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <header className="flex shrink-0 items-center gap-2 border-b border-border bg-surface px-3 py-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 text-foreground hover:bg-accent hover:text-accent-foreground"
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
          <p className="truncate text-sm font-medium text-foreground" title={taskLabel}>
            {taskLabel}
          </p>
          <p className="text-xs text-muted-foreground">{statusLabel}</p>
        </div>
      </header>

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
          <div className="mb-2 rounded bg-destructive/20 px-2 py-1 text-destructive">{streamError}</div>
        )}
        {!currentTask && (
          <p className="text-muted-foreground">No active task. Start the loop from the loop detail to stream logs.</p>
        )}
        {currentTask && streamStatus === 'connecting' && !logs && (
          <p className="text-muted-foreground">Connecting to log stream…</p>
        )}
        {currentTask && streamStatus === 'connected' && !logs && (
          <p className="text-muted-foreground">Waiting for log output…</p>
        )}
        {logs || null}
      </div>

      {isPaused && (
        <div
          className="shrink-0 border-t border-border bg-surface px-3 py-2"
          style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}
        >
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleResume}
            className="w-full touch-manipulation"
          >
            <Play className="mr-2 h-4 w-4" aria-hidden />
            Resume auto-scroll
          </Button>
        </div>
      )}
    </div>
  );
}
