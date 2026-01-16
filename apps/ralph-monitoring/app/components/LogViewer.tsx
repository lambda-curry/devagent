import { useEffect, useRef, useState, useCallback } from 'react';
import { AlertCircle, Wifi, WifiOff, Pause, Play, Copy, Download, ArrowUp, ArrowDown, Hash, Loader2 } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { toast } from 'sonner';

interface LogViewerProps {
  taskId: string;
}

// Exponential backoff configuration
const INITIAL_RETRY_DELAY = 1000; // 1 second
const MAX_RETRY_DELAY = 30000; // 30 seconds
const BACKOFF_MULTIPLIER = 2;

export function LogViewer({ taskId }: LogViewerProps) {
  const [logs, setLogs] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false); // Only for UI display
  const [showLineNumbers, setShowLineNumbers] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const autoScrollRef = useRef(true);
  const isPausedRef = useRef(false); // Use ref for synchronous access in event handlers
  const hasLoadedStaticRef = useRef(false); // Use ref to avoid EventSource recreation
  const reconnectTimeoutRef = useRef<number | null>(null);
  const retryDelayRef = useRef(INITIAL_RETRY_DELAY);
  const isUnmountingRef = useRef(false);

  // Load static logs as fallback
  const loadStaticLogs = useCallback(async () => {
    try {
      const response = await fetch(`/api/logs/${taskId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.logs) {
          setLogs(data.logs);
          hasLoadedStaticRef.current = true;
          // Auto-scroll to bottom after loading static logs
          if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
          }
        }
      }
    } catch (err) {
      console.error('Failed to load static logs:', err);
      setError('Failed to load logs');
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  // Connect to SSE stream with reconnection logic
  const connectToStream = useCallback(() => {
    // Clear any existing reconnection timeout
    if (reconnectTimeoutRef.current !== null) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

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

    eventSource.onerror = () => {
      setIsConnected(false);
      
      // Close the failed connection
      eventSource.close();
      eventSourceRef.current = null;

      // If we haven't loaded static logs yet, try to load them now
      if (!hasLoadedStaticRef.current) {
        setError('Failed to connect to log stream. Loading static logs...');
        loadStaticLogs();
      } else {
        // Show reconnecting state instead of just "connection lost"
        setIsReconnecting(true);
        setError('Connection lost. Reconnecting...');
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
  }, [taskId, loadStaticLogs]);

  useEffect(() => {
    // Reset unmounting flag
    isUnmountingRef.current = false;
    // Reset retry delay when taskId changes
    retryDelayRef.current = INITIAL_RETRY_DELAY;

    // Load initial static logs as fallback
    loadStaticLogs();

    // Connect to SSE stream
    connectToStream();

    // Cleanup on unmount
    return () => {
      isUnmountingRef.current = true;
      
      // Clear reconnection timeout
      if (reconnectTimeoutRef.current !== null) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      // Close EventSource connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [loadStaticLogs, connectToStream]);

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
          {isConnected ? (
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

      {/* Error message */}
      {error && (
        <div className="bg-destructive/10 border-b border-border px-4 py-2 flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Control toolbar */}
      <div className="bg-muted/50 px-4 py-2 flex items-center gap-2 border-b border-border flex-wrap">
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
        {isLoading ? (
          <div className="text-muted-foreground">Loading logs...</div>
        ) : logs ? (
          <div>{formatLogsWithLineNumbers(logs)}</div>
        ) : (
          <div className="text-muted-foreground">No logs available</div>
        )}
      </div>
    </div>
  );
}
