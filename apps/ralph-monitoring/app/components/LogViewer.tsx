import { useEffect, useRef, useState, useCallback } from 'react';
import { AlertCircle, Wifi, WifiOff } from 'lucide-react';

interface LogViewerProps {
  taskId: string;
}

export function LogViewer({ taskId }: LogViewerProps) {
  const [logs, setLogs] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedStatic, setHasLoadedStatic] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const autoScrollRef = useRef(true);

  // Load static logs as fallback
  const loadStaticLogs = useCallback(async () => {
    try {
      const response = await fetch(`/api/logs/${taskId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.logs) {
          setLogs(data.logs);
          setHasLoadedStatic(true);
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

  useEffect(() => {
    // Load initial static logs as fallback
    loadStaticLogs();

    // Connect to SSE stream
    const streamUrl = `/api/logs/${taskId}/stream`;
    const eventSource = new EventSource(streamUrl);

    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
      setIsLoading(false);
    };

    eventSource.onmessage = (event) => {
      setLogs((prev) => {
        const newLogs = prev ? `${prev}\n${event.data}` : event.data;
        return newLogs;
      });
      
      // Auto-scroll to bottom
      if (autoScrollRef.current && logContainerRef.current) {
        logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      
      // If we haven't loaded static logs yet, try to load them now
      if (!hasLoadedStatic) {
        setError('Failed to connect to log stream. Loading static logs...');
        loadStaticLogs();
      } else {
        setError('Connection lost. Showing cached logs.');
      }
      
      eventSource.close();
    };

    // Cleanup on unmount
    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [taskId, loadStaticLogs, hasLoadedStatic]);

  // Handle manual scroll to detect user scrolling up
  const handleScroll = () => {
    if (!logContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = logContainerRef.current;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px threshold
    autoScrollRef.current = isAtBottom;
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
          <div>{logs}</div>
        ) : (
          <div className="text-muted-foreground">No logs available</div>
        )}
      </div>
    </div>
  );
}
