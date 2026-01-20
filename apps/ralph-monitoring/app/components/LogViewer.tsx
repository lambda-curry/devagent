import { useEffect, useRef, useState, useCallback } from 'react';
import { AlertCircle, Wifi, WifiOff, Pause, Play, Copy, Download, ArrowUp, ArrowDown, Hash, Loader2, RotateCcw } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { toast } from 'sonner';

interface LogViewerProps {
  taskId: string;
  isTaskActive: boolean;
  hasLogs: boolean;
}

// Exponential backoff configuration
const INITIAL_RETRY_DELAY = 1000; // 1 second
const MAX_RETRY_DELAY = 30000; // 30 seconds
const BACKOFF_MULTIPLIER = 2;

// Waiting-for-logs configuration (for active tasks before the log file exists)
const WAIT_FOR_LOGS_INITIAL_DELAY = 500; // 0.5 seconds
const WAIT_FOR_LOGS_MAX_DELAY = 8000; // 8 seconds
const WAIT_FOR_LOGS_MAX_ATTEMPTS = 6; // bounded (≈ 0.5 + 1 + 2 + 4 + 8 + 8 = 23.5s)

interface MissingLogDiagnostics {
  expectedLogDirectoryTemplate: string;
  expectedLogPathTemplate: string;
  defaultRelativeLogDir: string;
  expectedLogFileName: string;
  envVarsConsulted: string[];
  envVarIsSet: Record<string, boolean>;
  resolvedStrategy: 'RALPH_LOG_DIR' | 'REPO_ROOT' | 'cwd';
}

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
  diagnostics?: MissingLogDiagnostics;
  hints?: string[];
}

interface ErrorInfo {
  message: string;
  code?: string;
  recoverable?: boolean;
  expectedLogPath?: string;
  expectedLogDirectory?: string;
  configHint?: string;
  envVarsConsulted?: string[];
  diagnostics?: MissingLogDiagnostics;
  hints?: string[];
}

type LogAvailability = 'inactive' | 'waiting' | 'available' | 'missing';

const getWaitDelayMs = (attempt: number): number => {
  // attempt is 1-based
  const delay = WAIT_FOR_LOGS_INITIAL_DELAY * 2 ** Math.max(0, attempt - 1);
  return Math.min(delay, WAIT_FOR_LOGS_MAX_DELAY);
};

export function LogViewer({ taskId, isTaskActive, hasLogs }: LogViewerProps) {
  const [logs, setLogs] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [error, setError] = useState<ErrorInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false); // Only for UI display
  const [showLineNumbers, setShowLineNumbers] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [isTruncated, setIsTruncated] = useState(false);
  const [availability, setAvailability] = useState<LogAvailability>(() => {
    if (!isTaskActive) return 'inactive';
    if (hasLogs) return 'available';
    return 'waiting';
  });
  const [waitAttempt, setWaitAttempt] = useState(0);
  const [waitNextDelayMs, setWaitNextDelayMs] = useState<number | null>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const autoScrollRef = useRef(true);
  const isPausedRef = useRef(false); // Use ref for synchronous access in event handlers
  const hasLoadedStaticRef = useRef(false); // Use ref to avoid EventSource recreation
  const reconnectTimeoutRef = useRef<number | null>(null);
  const retryDelayRef = useRef(INITIAL_RETRY_DELAY);
  const isUnmountingRef = useRef(false);
  const hasNonRecoverableErrorRef = useRef(false);
  const waitTimeoutRef = useRef<number | null>(null);
  const waitAbortControllerRef = useRef<AbortController | null>(null);
  const waitAttemptRef = useRef(0);

  const clearWait = useCallback(() => {
    if (waitTimeoutRef.current !== null) {
      clearTimeout(waitTimeoutRef.current);
      waitTimeoutRef.current = null;
    }
    waitAbortControllerRef.current?.abort();
    waitAbortControllerRef.current = null;
    setWaitNextDelayMs(null);
    setWaitAttempt(0);
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
    setIsConnected(false);
    setIsReconnecting(false);
  }, [clearReconnect]);

  const applyStaticLogsPayload = useCallback((payload: LogsOkPayload) => {
    setLogs(payload.logs || '');
    hasLoadedStaticRef.current = true;

    if (payload.warning) setWarning(payload.warning);
    if (payload.truncated) {
      setIsTruncated(true);
      setWarning('Log file is very large. Only showing last 100 lines.');
    }

    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, []);

  const setErrorFromPayload = useCallback((fallbackMessage: string, payload?: LogsErrorPayload, opts?: { recoverable?: boolean }) => {
    const errorMessage = payload?.error || fallbackMessage;
    const errorCode = payload?.code || 'UNKNOWN_ERROR';
    const recoverable = opts?.recoverable ?? false;
    hasNonRecoverableErrorRef.current = !recoverable;

    setError({
      message: errorMessage,
      code: errorCode,
      recoverable,
      expectedLogPath: payload?.expectedLogPath,
      expectedLogDirectory: payload?.expectedLogDirectory,
      configHint: payload?.configHint,
      envVarsConsulted: payload?.envVarsConsulted,
      diagnostics: payload?.diagnostics,
      hints: payload?.hints
    });
  }, []);

  // Load static logs as fallback
  const loadStaticLogs = useCallback(async () => {
    try {
      const response = await fetch(`/api/logs/${taskId}`);
      
      if (response.ok) {
        const data = (await response.json()) as LogsOkPayload;
        if (data.logs !== undefined) {
          applyStaticLogsPayload(data);
        } else {
          setError({
            message: 'No log data received from server',
            code: 'NO_DATA',
            recoverable: true
          });
        }
      } else {
        // Handle error responses with structured error data
        let errorData: LogsErrorPayload | undefined;
        try {
          errorData = (await response.json()) as LogsErrorPayload;
        } catch {
          // If JSON parsing fails, use status text
          errorData = { error: response.statusText || 'Unknown error' };
        }

        const errorCode = errorData.code || 'UNKNOWN_ERROR';
        // Most static-load errors are not user-recoverable; the "Retry" button exists.
        // We keep this quiet (inline error only), especially for expected NOT_FOUND cases.
        const recoverable = response.status === 400 && errorCode !== 'INVALID_TASK_ID';
        setErrorFromPayload(`Failed to load logs (${response.status})`, errorData, { recoverable });
      }
    } catch (err) {
      console.error('Failed to load static logs:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load logs';
      setError({
        message: errorMessage,
        code: 'NETWORK_ERROR',
        recoverable: true
      });
    } finally {
      setIsLoading(false);
    }
  }, [taskId, applyStaticLogsPayload, setErrorFromPayload]);

  // Connect to SSE stream with reconnection logic
  const connectToStream = useCallback(() => {
    // Clear any existing reconnection timeout
    clearReconnect();

    // Don't attempt reconnection if component is unmounting
    if (isUnmountingRef.current) {
      return;
    }

    // Close existing connection if any
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    const streamUrl = `/api/logs/${taskId}/stream`;
    const eventSource = new EventSource(streamUrl);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      // Connection successful - reset retry delay and update state
      setIsConnected(true);
      setIsReconnecting(false);
      setError(null);
      setIsLoading(false);
      retryDelayRef.current = INITIAL_RETRY_DELAY; // Reset delay on successful connection
      hasNonRecoverableErrorRef.current = false; // Reset non-recoverable error flag
    };

    eventSource.onmessage = (event) => {
      // Only update logs if not paused
      if (!isPausedRef.current) {
        setLogs((prev) => {
          const newLogs = prev ? `${prev}\n${event.data}` : event.data;
          return newLogs;
        });
        
        // Auto-scroll to bottom
        if (autoScrollRef.current && logContainerRef.current) {
          logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
      }
    };

    // Handle custom error events from SSE stream
    eventSource.addEventListener('error', (event: MessageEvent) => {
      try {
        const errorData = JSON.parse(event.data);
        const errorMessage = errorData.error || 'Stream error occurred';
        const errorCode = errorData.code || 'STREAM_ERROR';
        
        // NOT_FOUND errors are not recoverable - file doesn't exist
        const recoverable = errorCode !== 'PERMISSION_DENIED' && errorCode !== 'NOT_FOUND';
        hasNonRecoverableErrorRef.current = !recoverable;
        
        setError({
          message: errorMessage,
          code: errorCode,
          recoverable,
          expectedLogPath: errorData.expectedLogPath,
          expectedLogDirectory: errorData.expectedLogDirectory,
          configHint: errorData.configHint,
          envVarsConsulted: errorData.envVarsConsulted,
          diagnostics: errorData.diagnostics,
          hints: errorData.hints
        });

        // Close connection and fall back to static logs (unless NOT_FOUND)
        eventSource.close();
        eventSourceRef.current = null;
        
        // Only attempt to load static logs if error is recoverable
        if (recoverable && !hasLoadedStaticRef.current) {
          loadStaticLogs();
        }
      } catch {
        // If error data is not JSON, treat as generic error
        setError({
          message: event.data || 'Stream error occurred',
          code: 'STREAM_ERROR',
          recoverable: true
        });
      }
    });

    eventSource.onerror = () => {
      setIsConnected(false);
      
      // Close the failed connection
      eventSource.close();
      eventSourceRef.current = null;

      // Don't retry if we have a non-recoverable error (like NOT_FOUND)
      if (hasNonRecoverableErrorRef.current) {
        return;
      }

      // If we haven't loaded static logs yet, try to load them now
      if (!hasLoadedStaticRef.current) {
        setError({
          message: 'Failed to connect to log stream. Loading static logs...',
          code: 'CONNECTION_ERROR',
          recoverable: true
        });
        loadStaticLogs();
      } else {
        // Show reconnecting state instead of just "connection lost"
        setIsReconnecting(true);
        setError({
          message: 'Connection lost. Reconnecting...',
          code: 'RECONNECTING',
          recoverable: true
        });
      }

      // Don't attempt reconnection if component is unmounting
      if (isUnmountingRef.current) {
        return;
      }

      // Schedule reconnection with exponential backoff
      reconnectTimeoutRef.current = window.setTimeout(() => {
        connectToStream();
      }, retryDelayRef.current);

      // Increase delay for next retry (exponential backoff with max cap)
      retryDelayRef.current = Math.min(
        retryDelayRef.current * BACKOFF_MULTIPLIER,
        MAX_RETRY_DELAY
      );
    };
  }, [clearReconnect, taskId, loadStaticLogs]);

  const checkForLogs = useCallback(async () => {
    // Only meaningful for active tasks while waiting
    if (!isTaskActive) return;
    if (isUnmountingRef.current) return;

    waitAbortControllerRef.current?.abort();
    const controller = new AbortController();
    waitAbortControllerRef.current = controller;

    const nextAttempt = waitAttemptRef.current + 1;
    waitAttemptRef.current = nextAttempt;
    setWaitAttempt(nextAttempt);

    try {
      const response = await fetch(`/api/logs/${taskId}`, { signal: controller.signal });
      if (response.ok) {
        const payload = (await response.json()) as LogsOkPayload;
        applyStaticLogsPayload(payload);
        setAvailability('available');
        setIsLoading(false);
        setWaitNextDelayMs(null);
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
          setAvailability('missing');
          setIsLoading(false);
          setWaitNextDelayMs(null);
          setErrorFromPayload(`Log file not found for task ${taskId}`, errorPayload, { recoverable: false });
          return;
        }

        const delayMs = getWaitDelayMs(nextAttempt);
        setAvailability('waiting');
        setIsLoading(false);
        setWaitNextDelayMs(delayMs);

        if (waitTimeoutRef.current !== null) clearTimeout(waitTimeoutRef.current);
        waitTimeoutRef.current = window.setTimeout(() => {
          void checkForLogs();
        }, delayMs);
        return;
      }

      // Unexpected error while probing for logs: show immediately
      setAvailability('missing');
      setIsLoading(false);
      setWaitNextDelayMs(null);
      setErrorFromPayload(`Failed to check logs (${response.status})`, errorPayload, { recoverable: false });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;

      const message = err instanceof Error ? err.message : 'Failed to check logs';
      setAvailability('missing');
      setIsLoading(false);
      setWaitNextDelayMs(null);
      setError({ message, code: 'NETWORK_ERROR', recoverable: true });
    }
  }, [applyStaticLogsPayload, connectToStream, isTaskActive, setErrorFromPayload, taskId]);

  const handleRetry = useCallback(() => {
    // Allow recovery even after previously "non-recoverable" errors like NOT_FOUND.
    hasNonRecoverableErrorRef.current = false;
    hasLoadedStaticRef.current = false;
    retryDelayRef.current = INITIAL_RETRY_DELAY;

    setWarning(null);
    setIsTruncated(false);
    clearWait();
    closeStream();
    setError(null);
    setIsLoading(true);

    // Restart based on current task state
    if (!isTaskActive) {
      setAvailability('inactive');
      setIsLoading(false);
      if (hasLogs) loadStaticLogs();
      return;
    }

    if (hasLogs) {
      setAvailability('available');
      loadStaticLogs();
      connectToStream();
      return;
    }

    setAvailability('waiting');
    setIsLoading(false);
    void checkForLogs();
  }, [checkForLogs, clearWait, closeStream, connectToStream, hasLogs, isTaskActive, loadStaticLogs]);

  useEffect(() => {
    // Reset unmounting flag
    isUnmountingRef.current = false;
    retryDelayRef.current = INITIAL_RETRY_DELAY;
    hasNonRecoverableErrorRef.current = false;

    // Reset UI state that should not persist across task changes
    setWarning(null);
    setIsTruncated(false);
    setError(null);
    setLogs('');
    hasLoadedStaticRef.current = false;
    isPausedRef.current = false;
    setIsPaused(false);

    // Gate behavior by task activity + existing logs
    clearWait();
    closeStream();

    if (!isTaskActive) {
      setAvailability('inactive');
      setIsLoading(false);
      if (hasLogs) loadStaticLogs();
      return () => {
        isUnmountingRef.current = true;
        clearWait();
        closeStream();
      };
    }

    if (hasLogs) {
      setAvailability('available');
      setIsLoading(true);
      loadStaticLogs();
      connectToStream();
      return () => {
        isUnmountingRef.current = true;
        clearWait();
        closeStream();
      };
    }

    // Active task but no logs yet: show waiting and probe with bounded backoff.
    setAvailability('waiting');
    setIsLoading(false);
    void checkForLogs();

    return () => {
      isUnmountingRef.current = true;
      clearWait();
      closeStream();
    };
  }, [checkForLogs, clearWait, closeStream, connectToStream, hasLogs, isTaskActive, loadStaticLogs]);

  // Handle manual scroll to detect user scrolling up
  const handleScroll = () => {
    if (!logContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = logContainerRef.current;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px threshold
    autoScrollRef.current = isAtBottom;
  };

  // Pause/resume functionality
  const handlePauseResume = () => {
    setIsPaused((prev) => {
      const newPaused = !prev;
      isPausedRef.current = newPaused;
      
      if (newPaused && logContainerRef.current) {
        // When pausing, stop auto-scroll
        autoScrollRef.current = false;
      } else if (!newPaused && logContainerRef.current) {
        // When resuming, scroll to bottom and enable auto-scroll
        autoScrollRef.current = true;
        logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
      }
      
      return newPaused;
    });
  };

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(logs);
      toast.success('Logs copied to clipboard');
    } catch (err) {
      console.error('Failed to copy logs:', err);
      toast.error('Failed to copy logs');
    }
  };

  // Download logs
  const handleDownload = () => {
    const blob = new Blob([logs], { type: 'text/plain' });
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

  // Jump to top
  const handleJumpToTop = () => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      autoScrollRef.current = false;
    }
  };

  // Jump to bottom
  const handleJumpToBottom = () => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTo({ top: logContainerRef.current.scrollHeight, behavior: 'smooth' });
      autoScrollRef.current = true;
    }
  };

  // Toggle line numbers
  const handleToggleLineNumbers = () => {
    setShowLineNumbers((prev) => !prev);
  };

  // Format logs with line numbers
  const formatLogsWithLineNumbers = (logText: string): string => {
    if (!showLineNumbers) return logText;
    return logText
      .split('\n')
      .map((line, index) => `${(index + 1).toString().padStart(6, ' ')} | ${line}`)
      .join('\n');
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Header with connection status */}
      <div className="bg-muted px-4 py-2 flex items-center justify-between border-b border-border">
        <h3 className="text-sm font-semibold">Logs</h3>
        <div className="flex items-center gap-2">
          {availability === 'inactive' ? (
            <div className="flex items-center gap-1 text-muted-foreground text-xs">
              <WifiOff className="w-3 h-3" />
              <span>Inactive</span>
            </div>
          ) : availability === 'waiting' ? (
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
        <div className={`border-b border-border px-4 py-2 text-sm ${
          error.code === 'PERMISSION_DENIED' || error.code === 'NOT_FOUND'
            ? 'bg-destructive/10 text-destructive'
            : error.recoverable
            ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-500'
            : 'bg-destructive/10 text-destructive'
        }`}>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span>{error.message}</span>
                {error.code && (
                  <span className="text-xs opacity-75">({error.code})</span>
                )}
              </div>
              {error.expectedLogPath && (
                <div className="text-xs mt-1 opacity-90 font-mono">
                  Expected path: {error.expectedLogPath}
                </div>
              )}
              {error.expectedLogDirectory && !error.expectedLogPath && (
                <div className="text-xs mt-1 opacity-90 font-mono">
                  Log directory: {error.expectedLogDirectory}
                </div>
              )}
              {error.configHint && (
                <div className="text-xs mt-1 opacity-90">
                  {error.configHint}
                </div>
              )}
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
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          aria-label="Download logs"
          title="Download logs"
        >
          <Download className="w-4 h-4" />
          <span className="sr-only">Download</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleJumpToTop}
          aria-label="Jump to top"
          title="Jump to top"
        >
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
        {availability === 'inactive' && !hasLogs ? (
          <div className="text-muted-foreground">
            No live logs for inactive tasks. When a task is active, logs will stream here.
          </div>
        ) : availability === 'waiting' ? (
          <div className="flex items-start gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin mt-0.5" />
            <div>
              <div>Waiting for logs…</div>
              {waitAttempt > 0 && (
                <div className="text-xs mt-1 opacity-75">
                  Attempt {waitAttempt}/{WAIT_FOR_LOGS_MAX_ATTEMPTS}
                  {waitNextDelayMs !== null ? ` • retrying in ${Math.ceil(waitNextDelayMs / 1000)}s` : null}
                </div>
              )}
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading logs...</span>
          </div>
        ) : logs ? (
          <div>{formatLogsWithLineNumbers(logs)}</div>
        ) : error && !error.recoverable ? (
          <div className="text-destructive">
            <p className="font-semibold">Unable to load logs</p>
            <p className="text-sm mt-1">{error.message}</p>
            {error.code && (
              <p className="text-xs mt-1 opacity-75">Error code: {error.code}</p>
            )}
            {error.expectedLogPath && (
              <p className="text-xs mt-1 opacity-75 font-mono">
                Expected path: {error.expectedLogPath}
              </p>
            )}
            {error.expectedLogDirectory && !error.expectedLogPath && (
              <p className="text-xs mt-1 opacity-75 font-mono">
                Log directory: {error.expectedLogDirectory}
              </p>
            )}
            {error.envVarsConsulted?.length ? (
              <p className="text-xs mt-1 opacity-75">
                Env vars consulted: {error.envVarsConsulted.join(', ')}
              </p>
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
            {error.configHint && (
              <p className="text-xs mt-1 opacity-75">{error.configHint}</p>
            )}
            {error.hints?.length ? (
              <div className="text-xs mt-2 opacity-75">
                <div className="font-semibold">Hints</div>
                <ul className="list-disc pl-4 mt-1 space-y-0.5">
                  {error.hints.map((hint) => (
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
