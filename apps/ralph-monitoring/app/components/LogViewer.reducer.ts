// ============================================================================
// LogViewer Connection State Machine
// ============================================================================
// This reducer consolidates the interdependent connection/streaming state that
// was previously spread across multiple useState calls in LogViewer.tsx.
//
// Per the react-hooks-patterns rule:
// "Use `useState` for independent state. Use `useReducer` when one state value
// depends on another to update."
//
// The following states were interdependent and are now consolidated:
// - isConnected, isReconnecting, isLoading, error
// - These always change together in coordinated transitions
// ============================================================================

// Connection state machine states
export type ConnectionStatus =
  | 'idle'           // Initial state, no connection attempt yet
  | 'connecting'     // Attempting to connect to SSE stream
  | 'connected'      // Successfully connected and streaming
  | 'reconnecting'   // Connection lost, attempting to reconnect
  | 'error';         // Non-recoverable error state

// Log availability states (separate concern from connection)
export type LogAvailability =
  | 'inactive'   // Task not active, no streaming needed
  | 'waiting'    // Active task, waiting for log file to appear
  | 'available'  // Log file exists
  | 'missing';   // Log file not found after max attempts

export interface ConnectionState {
  status: ConnectionStatus;
  error: ErrorInfo | null;
  retryCount: number;
  nextRetryDelayMs: number | null;
}

export interface WaitState {
  availability: LogAvailability;
  attempt: number;
  nextDelayMs: number | null;
}

export interface LogViewerState {
  connection: ConnectionState;
  wait: WaitState;
  isLoading: boolean;
  logs: string;
  warning: string | null;
  isTruncated: boolean;
}

export interface ErrorInfo {
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

export interface MissingLogDiagnostics {
  expectedLogDirectoryTemplate: string;
  expectedLogPathTemplate: string;
  defaultRelativeLogDir: string;
  expectedLogFileName: string;
  envVarsConsulted: string[];
  envVarIsSet: Record<string, boolean>;
  resolvedStrategy: 'RALPH_LOG_DIR' | 'REPO_ROOT' | 'cwd';
}

// Action types
export type LogViewerAction =
  // Connection actions
  | { type: 'CONNECT_START' }
  | { type: 'CONNECT_SUCCESS' }
  | { type: 'CONNECT_ERROR'; error: ErrorInfo; recoverable: boolean }
  | { type: 'CONNECTION_LOST'; nextRetryDelayMs: number }
  | { type: 'RECONNECT_START' }
  // Wait actions (for log file to appear)
  | { type: 'WAIT_START' }
  | { type: 'WAIT_NEXT_ATTEMPT'; attempt: number; nextDelayMs: number }
  | { type: 'WAIT_SUCCESS'; logs: string; warning?: string; truncated?: boolean }
  | { type: 'WAIT_EXHAUSTED'; error: ErrorInfo }
  // Log content actions
  | { type: 'APPEND_LOG'; data: string }
  | { type: 'SET_LOGS'; logs: string; warning?: string; truncated?: boolean }
  // Availability actions
  | { type: 'SET_INACTIVE' }
  | { type: 'SET_AVAILABLE' }
  // Reset actions
  | { type: 'RESET' }
  | { type: 'RETRY' };

// Initial state factory
export function createInitialState(
  hasExecutionHistory: boolean,
  isTaskActive: boolean,
  hasLogs: boolean
): LogViewerState {
  // Determine initial availability based on props
  let availability: LogAvailability = 'inactive';
  if (hasExecutionHistory) {
    if (isTaskActive) {
      availability = hasLogs ? 'available' : 'waiting';
    } else {
      availability = 'inactive';
    }
  }

  return {
    connection: {
      status: 'idle',
      error: null,
      retryCount: 0,
      nextRetryDelayMs: null,
    },
    wait: {
      availability,
      attempt: 0,
      nextDelayMs: null,
    },
    isLoading: availability === 'available' || availability === 'waiting',
    logs: '',
    warning: null,
    isTruncated: false,
  };
}

// Reducer
export function logViewerReducer(
  state: LogViewerState,
  action: LogViewerAction
): LogViewerState {
  switch (action.type) {
    case 'CONNECT_START':
      return {
        ...state,
        connection: {
          ...state.connection,
          status: 'connecting',
          error: null,
        },
        isLoading: true,
      };

    case 'CONNECT_SUCCESS':
      return {
        ...state,
        connection: {
          status: 'connected',
          error: null,
          retryCount: 0,
          nextRetryDelayMs: null,
        },
        isLoading: false,
      };

    case 'CONNECT_ERROR':
      return {
        ...state,
        connection: {
          ...state.connection,
          status: 'error',
          error: action.error,
        },
        isLoading: false,
      };

    case 'CONNECTION_LOST':
      return {
        ...state,
        connection: {
          ...state.connection,
          status: 'reconnecting',
          error: {
            message: 'Connection lost. Reconnecting...',
            code: 'RECONNECTING',
            recoverable: true,
          },
          retryCount: state.connection.retryCount + 1,
          nextRetryDelayMs: action.nextRetryDelayMs,
        },
      };

    case 'RECONNECT_START':
      return {
        ...state,
        connection: {
          ...state.connection,
          status: 'connecting',
          nextRetryDelayMs: null,
        },
      };

    case 'WAIT_START':
      return {
        ...state,
        wait: {
          availability: 'waiting',
          attempt: 0,
          nextDelayMs: null,
        },
        isLoading: false,
      };

    case 'WAIT_NEXT_ATTEMPT':
      return {
        ...state,
        wait: {
          availability: 'waiting',
          attempt: action.attempt,
          nextDelayMs: action.nextDelayMs,
        },
        isLoading: false,
      };

    case 'WAIT_SUCCESS':
      return {
        ...state,
        wait: {
          availability: 'available',
          attempt: 0,
          nextDelayMs: null,
        },
        isLoading: false,
        logs: action.logs,
        warning: action.warning ?? null,
        isTruncated: action.truncated ?? false,
      };

    case 'WAIT_EXHAUSTED':
      return {
        ...state,
        wait: {
          availability: 'missing',
          attempt: state.wait.attempt,
          nextDelayMs: null,
        },
        connection: {
          ...state.connection,
          error: action.error,
        },
        isLoading: false,
      };

    case 'APPEND_LOG':
      return {
        ...state,
        logs: state.logs ? `${state.logs}\n${action.data}` : action.data,
      };

    case 'SET_LOGS':
      return {
        ...state,
        logs: action.logs,
        warning: action.warning ?? state.warning,
        isTruncated: action.truncated ?? state.isTruncated,
        isLoading: false,
      };

    case 'SET_INACTIVE':
      return {
        ...state,
        wait: {
          availability: 'inactive',
          attempt: 0,
          nextDelayMs: null,
        },
        connection: {
          status: 'idle',
          error: null,
          retryCount: 0,
          nextRetryDelayMs: null,
        },
        isLoading: false,
      };

    case 'SET_AVAILABLE':
      return {
        ...state,
        wait: {
          ...state.wait,
          availability: 'available',
        },
      };

    case 'RESET':
      return {
        connection: {
          status: 'idle',
          error: null,
          retryCount: 0,
          nextRetryDelayMs: null,
        },
        wait: {
          availability: 'inactive',
          attempt: 0,
          nextDelayMs: null,
        },
        isLoading: false,
        logs: '',
        warning: null,
        isTruncated: false,
      };

    case 'RETRY':
      return {
        ...state,
        connection: {
          status: 'idle',
          error: null,
          retryCount: 0,
          nextRetryDelayMs: null,
        },
        wait: {
          ...state.wait,
          attempt: 0,
          nextDelayMs: null,
        },
        isLoading: true,
        warning: null,
        isTruncated: false,
      };

    default:
      return state;
  }
}
