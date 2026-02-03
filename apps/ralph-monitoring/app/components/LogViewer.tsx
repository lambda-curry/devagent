import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Copy,
  Download,
  Hash,
  Loader2,
  Pause,
  Play,
  RotateCcw,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '~/components/ui/button';
import { createInitialState, type ErrorInfo, logViewerReducer } from './LogViewer.reducer';

interface LogViewerProps {
  taskId: string;
  /** Project id for multi-project; when set, API URLs include ?projectId= for correct DB/path. */
  projectId?: string;
  isTaskActive: boolean;
  hasLogs: boolean;
  /** Whether this task has ever been executed by Ralph (has execution log entry). */
  hasExecutionHistory: boolean;
}

// Exponential backoff configuration
const INITIAL_RETRY_DELAY = 1000; // 1 second
const MAX_RETRY_DELAY = 30000; // 30 seconds
const BACKOFF_MULTIPLIER = 2;

// Waiting-for-logs configuration (for active tasks before the log file exists)
const WAIT_FOR_LOGS_INITIAL_DELAY = 500; // 0.5 seconds
const WAIT_FOR_LOGS_MAX_DELAY = 8000; // 8 seconds
const WAIT_FOR_LOGS_MAX_ATTEMPTS = 6; // bounded (≈ 0.5 + 1 + 2 + 4 + 8 + 8 = 23.5s)

interface LogsOkPayload {
  logs?: string;
  truncated?: boolean;
  warning?: string;
  fileSize?: number;
}

interface LogsErrorPayload {
  error?: string;
  code?: string;
  taskId?: string;
  expectedLogPath?: string;
  expectedLogDirectory?: string;
  configHint?: string;
  envVarsConsulted?: string[];
  diagnostics?: {
    expectedLogDirectoryTemplate: string;
    expectedLogPathTemplate: string;
    defaultRelativeLogDir: string;
    expectedLogFileName: string;
    envVarsConsulted: string[];
    envVarIsSet: Record<string, boolean>;
    resolvedStrategy: 'RALPH_LOG_DIR' | 'REPO_ROOT' | 'cwd';
  };
  hints?: string[];
}

const getWaitDelayMs = (attempt: number): number => {
  // attempt is 1-based
  const delay = WAIT_FOR_LOGS_INITIAL_DELAY * 2 ** Math.max(0, attempt - 1);
  return Math.min(delay, WAIT_FOR_LOGS_MAX_DELAY);
};

function logsApiBase(taskId: string, projectId?: string): string {
  const base = `/api/logs/${taskId}`;
  return projectId ? `${base}?projectId=${encodeURIComponent(projectId)}` : base;
}

function streamApiUrl(taskId: string, projectId?: string): string {
  const base = `/api/logs/${taskId}/stream`;
  return projectId ? `${base}?projectId=${encodeURIComponent(projectId)}` : base;
}

export function LogViewer({ taskId, projectId, isTaskActive, hasLogs, hasExecutionHistory }: LogViewerProps) {
  // ============================================================================
  // State: useReducer for interdependent connection/streaming state
  // ============================================================================
  // Per react-hooks-patterns rule: "Use useReducer when one state value depends
  // on another to update." Connection status, error, retry count, and loading
  // state all change together in coordinated transitions.
  const [state, dispatch] = useReducer(
    logViewerReducer,
    { hasExecutionHistory, isTaskActive, hasLogs },
    ({ hasExecutionHistory, isTaskActive, hasLogs }) => createInitialState(hasExecutionHistory, isTaskActive, hasLogs)
  );

  // ============================================================================
  // State: useState for truly independent UI state
  // ============================================================================
  // Per react-hooks-patterns rule: "Use useState for independent state."
  // These toggle states are independent of connection/streaming logic.
  const [isPaused, setIsPaused] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(false);

  // ============================================================================
  // Refs for synchronous access and cleanup
  // ============================================================================
  const logContainerRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const autoScrollRef = useRef(true);
  const isPausedRef = useRef(false);
  const hasLoadedStaticRef = useRef(false);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const retryDelayRef = useRef(INITIAL_RETRY_DELAY);
  const isUnmountingRef = useRef(false);
  const hasNonRecoverableErrorRef = useRef(false);
  const waitTimeoutRef = useRef<number | null>(null);
  const waitAbortControllerRef = useRef<AbortController | null>(null);
  const waitAttemptRef = useRef(0);

  // ============================================================================
  // Cleanup helpers
  // ============================================================================
  const clearWait = useCallback(() => {
    if (waitTimeoutRef.current !== null) {
      clearTimeout(waitTimeoutRef.current);
      waitTimeoutRef.current = null;
    }
    waitAbortControllerRef.current?.abort();
    waitAbortControllerRef.current = null;
    waitAttemptRef.current = 0;
  }, []);

  const clearReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current !== null) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const closeStream = useCallback(() => {
    clearReconnect();
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, [clearReconnect]);

  // ============================================================================
  // API response handlers
  // ============================================================================
  const applyStaticLogsPayload = useCallback((payload: LogsOkPayload) => {
    dispatch({
      type: 'SET_LOGS',
      logs: payload.logs || '',
      warning: payload.warning,
      truncated: payload.truncated
    });
    hasLoadedStaticRef.current = true;

    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, []);

  const createErrorFromPayload = useCallback(
    (fallbackMessage: string, payload?: LogsErrorPayload, opts?: { recoverable?: boolean }): ErrorInfo => {
      const errorMessage = payload?.error || fallbackMessage;
      const errorCode = payload?.code || 'UNKNOWN_ERROR';
      const recoverable = opts?.recoverable ?? false;
      hasNonRecoverableErrorRef.current = !recoverable;

      return {
        message: errorMessage,
        code: errorCode,
        recoverable,
        expectedLogPath: payload?.expectedLogPath,
        expectedLogDirectory: payload?.expectedLogDirectory,
        configHint: payload?.configHint,
        envVarsConsulted: payload?.envVarsConsulted,
        diagnostics: payload?.diagnostics,
        hints: payload?.hints
      };
    },
    []
  );

  // ============================================================================
  // Load static logs as fallback
  // ============================================================================
  const loadStaticLogs = useCallback(async () => {
    try {
      const response = await fetch(logsApiBase(taskId, projectId));

      if (response.ok) {
        const data = (await response.json()) as LogsOkPayload;
        if (data.logs !== undefined) {
          applyStaticLogsPayload(data);
        } else {
          dispatch({
            type: 'CONNECT_ERROR',
            error: { message: 'No log data received from server', code: 'NO_DATA', recoverable: true },
            recoverable: true
          });
        }
      } else {
        let errorData: LogsErrorPayload | undefined;
        try {
          errorData = (await response.json()) as LogsErrorPayload;
        } catch {
          errorData = { error: response.statusText || 'Unknown error' };
        }

        const errorCode = errorData.code || 'UNKNOWN_ERROR';
        const recoverable = response.status === 400 && errorCode !== 'INVALID_TASK_ID';
        const error = createErrorFromPayload(`Failed to load logs (${response.status})`, errorData, { recoverable });
        dispatch({ type: 'CONNECT_ERROR', error, recoverable });
      }
    } catch (err) {
      console.error('Failed to load static logs:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load logs';
      dispatch({
        type: 'CONNECT_ERROR',
        error: { message: errorMessage, code: 'NETWORK_ERROR', recoverable: true },
        recoverable: true
      });
    }
  }, [taskId, projectId, applyStaticLogsPayload, createErrorFromPayload]);

  // ============================================================================
  // Connect to SSE stream with reconnection logic
  // ============================================================================
  const connectToStream = useCallback(() => {
    clearReconnect();

    if (isUnmountingRef.current) {
      return;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    dispatch({ type: 'CONNECT_START' });

    const streamUrl = streamApiUrl(taskId, projectId);
    const eventSource = new EventSource(streamUrl);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      dispatch({ type: 'CONNECT_SUCCESS' });
      retryDelayRef.current = INITIAL_RETRY_DELAY;
      hasNonRecoverableErrorRef.current = false;
    };

    eventSource.onmessage = event => {
      if (!isPausedRef.current) {
        dispatch({ type: 'APPEND_LOG', data: event.data });

        if (autoScrollRef.current && logContainerRef.current) {
          logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
      }
    };

    eventSource.addEventListener('error', (event: MessageEvent) => {
      try {
        const errorData = JSON.parse(event.data);
        const errorMessage = errorData.error || 'Stream error occurred';
        const errorCode = errorData.code || 'STREAM_ERROR';
        const recoverable = errorCode !== 'PERMISSION_DENIED' && errorCode !== 'NOT_FOUND';
        hasNonRecoverableErrorRef.current = !recoverable;

        const error: ErrorInfo = {
          message: errorMessage,
          code: errorCode,
          recoverable,
          expectedLogPath: errorData.expectedLogPath,
          expectedLogDirectory: errorData.expectedLogDirectory,
          configHint: errorData.configHint,
          envVarsConsulted: errorData.envVarsConsulted,
          diagnostics: errorData.diagnostics,
          hints: errorData.hints
        };

        dispatch({ type: 'CONNECT_ERROR', error, recoverable });

        eventSource.close();
        eventSourceRef.current = null;

        if (recoverable && !hasLoadedStaticRef.current) {
          loadStaticLogs();
        }
      } catch {
        dispatch({
          type: 'CONNECT_ERROR',
          error: { message: event.data || 'Stream error occurred', code: 'STREAM_ERROR', recoverable: true },
          recoverable: true
        });
      }
    });

    eventSource.onerror = () => {
      eventSource.close();
      eventSourceRef.current = null;

      if (hasNonRecoverableErrorRef.current) {
        return;
      }

      if (!hasLoadedStaticRef.current) {
        dispatch({
          type: 'CONNECT_ERROR',
          error: {
            message: 'Failed to connect to log stream. Loading static logs...',
            code: 'CONNECTION_ERROR',
            recoverable: true
          },
          recoverable: true
        });
        loadStaticLogs();
      } else {
        dispatch({ type: 'CONNECTION_LOST', nextRetryDelayMs: retryDelayRef.current });
      }

      if (isUnmountingRef.current) {
        return;
      }

      reconnectTimeoutRef.current = window.setTimeout(() => {
        dispatch({ type: 'RECONNECT_START' });
        connectToStream();
      }, retryDelayRef.current);

      retryDelayRef.current = Math.min(retryDelayRef.current * BACKOFF_MULTIPLIER, MAX_RETRY_DELAY);
    };
  }, [clearReconnect, taskId, projectId, loadStaticLogs]);

  // ============================================================================
  // Check for logs (polling for active tasks waiting for log file)
  // ============================================================================
  const checkForLogs = useCallback(async () => {
    if (!isTaskActive) return;
    if (isUnmountingRef.current) return;

    waitAbortControllerRef.current?.abort();
    const controller = new AbortController();
    waitAbortControllerRef.current = controller;

    const nextAttempt = waitAttemptRef.current + 1;
    waitAttemptRef.current = nextAttempt;

    try {
      const response = await fetch(logsApiBase(taskId, projectId), { signal: controller.signal });
      if (response.ok) {
        const payload = (await response.json()) as LogsOkPayload;
        dispatch({
          type: 'WAIT_SUCCESS',
          logs: payload.logs || '',
          warning: payload.warning,
          truncated: payload.truncated
        });
        hasLoadedStaticRef.current = true;
        connectToStream();
        return;
      }

      let errorPayload: LogsErrorPayload | undefined;
      try {
        errorPayload = (await response.json()) as LogsErrorPayload;
      } catch {
        errorPayload = { error: response.statusText || 'Unknown error', code: 'UNKNOWN_ERROR' };
      }

      const isNotFound = response.status === 404 && errorPayload.code === 'NOT_FOUND';
      if (isNotFound) {
        if (nextAttempt >= WAIT_FOR_LOGS_MAX_ATTEMPTS) {
          const error = createErrorFromPayload(`Log file not found for task ${taskId}`, errorPayload, {
            recoverable: false
          });
          dispatch({ type: 'WAIT_EXHAUSTED', error });
          return;
        }

        const delayMs = getWaitDelayMs(nextAttempt);
        dispatch({ type: 'WAIT_NEXT_ATTEMPT', attempt: nextAttempt, nextDelayMs: delayMs });

        if (waitTimeoutRef.current !== null) clearTimeout(waitTimeoutRef.current);
        waitTimeoutRef.current = window.setTimeout(() => {
          void checkForLogs();
        }, delayMs);
        return;
      }

      const error = createErrorFromPayload(`Failed to check logs (${response.status})`, errorPayload, {
        recoverable: false
      });
      dispatch({ type: 'WAIT_EXHAUSTED', error });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;

      const message = err instanceof Error ? err.message : 'Failed to check logs';
      dispatch({
        type: 'WAIT_EXHAUSTED',
        error: { message, code: 'NETWORK_ERROR', recoverable: true }
      });
    }
  }, [connectToStream, createErrorFromPayload, isTaskActive, taskId, projectId]);

  // ============================================================================
  // Retry handler
  // ============================================================================
  const handleRetry = useCallback(() => {
    hasNonRecoverableErrorRef.current = false;
    hasLoadedStaticRef.current = false;
    retryDelayRef.current = INITIAL_RETRY_DELAY;
    waitAttemptRef.current = 0;

    clearWait();
    closeStream();
    dispatch({ type: 'RETRY' });

    if (!hasExecutionHistory) {
      dispatch({ type: 'SET_INACTIVE' });
      return;
    }

    if (!isTaskActive) {
      dispatch({ type: 'SET_INACTIVE' });
      if (hasLogs) loadStaticLogs();
      return;
    }

    if (hasLogs) {
      dispatch({ type: 'SET_AVAILABLE' });
      loadStaticLogs();
      connectToStream();
      return;
    }

    dispatch({ type: 'WAIT_START' });
    void checkForLogs();
  }, [
    checkForLogs,
    clearWait,
    closeStream,
    connectToStream,
    hasExecutionHistory,
    hasLogs,
    isTaskActive,
    loadStaticLogs
  ]);

  // ============================================================================
  // Main effect: initialize and manage connections based on props
  // ============================================================================
  useEffect(() => {
    isUnmountingRef.current = false;
    retryDelayRef.current = INITIAL_RETRY_DELAY;
    hasNonRecoverableErrorRef.current = false;
    hasLoadedStaticRef.current = false;
    isPausedRef.current = false;
    waitAttemptRef.current = 0;
    setIsPaused(false);

    dispatch({ type: 'RESET' });
    clearWait();
    closeStream();

    if (!hasExecutionHistory) {
      dispatch({ type: 'SET_INACTIVE' });
      return () => {
        isUnmountingRef.current = true;
        clearWait();
        closeStream();
      };
    }

    if (!isTaskActive) {
      dispatch({ type: 'SET_INACTIVE' });
      if (hasLogs) loadStaticLogs();
      return () => {
        isUnmountingRef.current = true;
        clearWait();
        closeStream();
      };
    }

    if (hasLogs) {
      dispatch({ type: 'SET_AVAILABLE' });
      // Load static logs first, then connect stream for live updates
      // This ensures content is shown immediately without waiting for stream connection
      loadStaticLogs().then(() => {
        if (!isUnmountingRef.current && isTaskActive) {
          // Only connect stream for active tasks after static content is loaded
          connectToStream();
        }
      });
      return () => {
        isUnmountingRef.current = true;
        clearWait();
        closeStream();
      };
    }

    dispatch({ type: 'WAIT_START' });
    void checkForLogs();

    return () => {
      isUnmountingRef.current = true;
      clearWait();
      closeStream();
    };
  }, [
    checkForLogs,
    clearWait,
    closeStream,
    connectToStream,
    hasExecutionHistory,
    hasLogs,
    isTaskActive,
    loadStaticLogs
  ]);

  // ============================================================================
  // UI event handlers
  // ============================================================================
  const handleScroll = () => {
    if (!logContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = logContainerRef.current;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
    autoScrollRef.current = isAtBottom;
  };

  const handlePauseResume = () => {
    setIsPaused(prev => {
      const newPaused = !prev;
      isPausedRef.current = newPaused;

      if (newPaused && logContainerRef.current) {
        autoScrollRef.current = false;
      } else if (!newPaused && logContainerRef.current) {
        autoScrollRef.current = true;
        logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
      }

      return newPaused;
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(state.logs);
      toast.success('Logs copied to clipboard');
    } catch (err) {
      console.error('Failed to copy logs:', err);
      toast.error('Failed to copy logs');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([state.logs], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `task-${taskId}-logs.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Logs downloaded');
  };

  const handleJumpToTop = () => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      autoScrollRef.current = false;
    }
  };

  const handleJumpToBottom = () => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTo({ top: logContainerRef.current.scrollHeight, behavior: 'smooth' });
      autoScrollRef.current = true;
    }
  };

  const handleToggleLineNumbers = () => {
    setShowLineNumbers(prev => !prev);
  };

  const formatLogsWithLineNumbers = (logText: string): string => {
    if (!showLineNumbers) return logText;
    return logText
      .split('\n')
      .map((line, index) => `${(index + 1).toString().padStart(6, ' ')} | ${line}`)
      .join('\n');
  };

  // ============================================================================
  // Derived values from reducer state
  // ============================================================================
  const { connection, wait, isLoading, logs, warning, isTruncated } = state;
  const error = connection.error;
  const isConnected = connection.status === 'connected';
  const isReconnecting = connection.status === 'reconnecting';

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Header with connection status */}
      <div className="bg-muted px-4 py-2 flex items-center justify-between border-b border-border">
        <h3 className="text-sm font-semibold">Logs</h3>
        <div className="flex items-center gap-2">
          {wait.availability === 'inactive' ? (
            <div className="flex items-center gap-1 text-muted-foreground text-xs">
              <WifiOff className="w-3 h-3" />
              <span>Inactive</span>
            </div>
          ) : wait.availability === 'waiting' ? (
            <div className="flex items-center gap-1 text-yellow-600 text-xs">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Waiting for logs...</span>
            </div>
          ) : isConnected ? (
            <div className="flex items-center gap-1 text-green-600 text-xs">
              <Wifi className="w-3 h-3" />
              <span>Streaming</span>
            </div>
          ) : isReconnecting ? (
            <div className="flex items-center gap-1 text-yellow-600 text-xs">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Reconnecting...</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-muted-foreground text-xs">
              <WifiOff className="w-3 h-3" />
              <span>Disconnected</span>
            </div>
          )}
        </div>
      </div>

      {/* Warning message (non-critical) */}
      {warning && !error && (
        <div className="bg-yellow-500/10 border-b border-border px-4 py-2 flex items-center gap-2 text-yellow-600 dark:text-yellow-500 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{warning}</span>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div
          className={`border-b border-border px-4 py-2 text-sm ${
            error.code === 'PERMISSION_DENIED' || error.code === 'NOT_FOUND'
              ? 'bg-destructive/10 text-destructive'
              : error.recoverable
                ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-500'
                : 'bg-destructive/10 text-destructive'
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span>{error.message}</span>
                {error.code && <span className="text-xs opacity-75">({error.code})</span>}
              </div>
              {error.expectedLogPath && (
                <div className="text-xs mt-1 opacity-90 font-mono">Expected path: {error.expectedLogPath}</div>
              )}
              {error.expectedLogDirectory && !error.expectedLogPath && (
                <div className="text-xs mt-1 opacity-90 font-mono">Log directory: {error.expectedLogDirectory}</div>
              )}
              {error.configHint && <div className="text-xs mt-1 opacity-90">{error.configHint}</div>}
            </div>
          </div>
        </div>
      )}

      {/* Truncation notice */}
      {isTruncated && (
        <div className="bg-blue-500/10 border-b border-border px-4 py-2 flex items-center gap-2 text-blue-600 dark:text-blue-500 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>Log file is very large. Only the last 100 lines are shown. Use streaming for real-time updates.</span>
        </div>
      )}

      {/* Control toolbar */}
      <div className="bg-muted/50 px-4 py-2 flex items-center gap-2 border-b border-border flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRetry}
          aria-label="Retry loading logs"
          title="Retry loading logs"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="sr-only">Retry</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handlePauseResume}
          aria-label={isPaused ? 'Resume streaming' : 'Pause streaming'}
          title={isPaused ? 'Resume streaming' : 'Pause streaming'}
        >
          {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          <span className="sr-only">{isPaused ? 'Resume' : 'Pause'}</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          aria-label="Copy logs to clipboard"
          title="Copy logs to clipboard"
        >
          <Copy className="w-4 h-4" />
          <span className="sr-only">Copy</span>
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownload} aria-label="Download logs" title="Download logs">
          <Download className="w-4 h-4" />
          <span className="sr-only">Download</span>
        </Button>
        <Button variant="outline" size="sm" onClick={handleJumpToTop} aria-label="Jump to top" title="Jump to top">
          <ArrowUp className="w-4 h-4" />
          <span className="sr-only">Top</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleJumpToBottom}
          aria-label="Jump to bottom"
          title="Jump to bottom"
        >
          <ArrowDown className="w-4 h-4" />
          <span className="sr-only">Bottom</span>
        </Button>
        <Button
          variant={showLineNumbers ? 'default' : 'outline'}
          size="sm"
          onClick={handleToggleLineNumbers}
          aria-label={showLineNumbers ? 'Hide line numbers' : 'Show line numbers'}
          title={showLineNumbers ? 'Hide line numbers' : 'Show line numbers'}
        >
          <Hash className="w-4 h-4" />
          <span className="sr-only">{showLineNumbers ? 'Hide line numbers' : 'Show line numbers'}</span>
        </Button>
      </div>

      {/* Log content */}
      <div
        ref={logContainerRef}
        onScroll={handleScroll}
        className="bg-background p-4 font-mono text-sm overflow-auto max-h-[600px]"
        style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
      >
        {/* Priority order: show logs if we have them, then loading states, then errors */}
        {logs ? (
          <div>{formatLogsWithLineNumbers(logs)}</div>
        ) : wait.availability === 'inactive' && !hasLogs ? (
          <div className="text-muted-foreground">
            {!hasExecutionHistory
              ? 'No logs available — this task has not been executed yet.'
              : 'No live logs for inactive tasks. When a task is active, logs will stream here.'}
          </div>
        ) : wait.availability === 'waiting' ? (
          <div className="flex items-start gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin mt-0.5" />
            <div>
              <div>Waiting for logs…</div>
              {wait.attempt > 0 && (
                <div className="text-xs mt-1 opacity-75">
                  Attempt {wait.attempt}/{WAIT_FOR_LOGS_MAX_ATTEMPTS}
                  {wait.nextDelayMs !== null ? ` • retrying in ${Math.ceil(wait.nextDelayMs / 1000)}s` : null}
                </div>
              )}
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading logs...</span>
          </div>
        ) : error && !error.recoverable ? (
          <div className="text-destructive">
            <p className="font-semibold">Unable to load logs</p>
            <p className="text-sm mt-1">{error.message}</p>
            {error.code && <p className="text-xs mt-1 opacity-75">Error code: {error.code}</p>}
            {error.expectedLogPath && (
              <p className="text-xs mt-1 opacity-75 font-mono">Expected path: {error.expectedLogPath}</p>
            )}
            {error.expectedLogDirectory && !error.expectedLogPath && (
              <p className="text-xs mt-1 opacity-75 font-mono">Log directory: {error.expectedLogDirectory}</p>
            )}
            {error.envVarsConsulted?.length ? (
              <p className="text-xs mt-1 opacity-75">Env vars consulted: {error.envVarsConsulted.join(', ')}</p>
            ) : null}
            {error.diagnostics ? (
              <div className="text-xs mt-2 opacity-75">
                <div className="font-semibold">Diagnostics</div>
                <div className="mt-1 font-mono">
                  expectedLogFileName: {error.diagnostics.expectedLogFileName}
                  {'\n'}resolvedStrategy: {error.diagnostics.resolvedStrategy}
                  {'\n'}expectedLogPathTemplate: {error.diagnostics.expectedLogPathTemplate}
                </div>
              </div>
            ) : null}
            {error.configHint && <p className="text-xs mt-1 opacity-75">{error.configHint}</p>}
            {error.hints?.length ? (
              <div className="text-xs mt-2 opacity-75">
                <div className="font-semibold">Hints</div>
                <ul className="list-disc pl-4 mt-1 space-y-0.5">
                  {error.hints.map(hint => (
                    <li key={hint}>{hint}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="text-muted-foreground">No logs available for this task</div>
        )}
      </div>
    </div>
  );
}
