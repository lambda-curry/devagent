import { data } from 'react-router';
import type { Route } from './+types/api.logs.$taskId';
import {
  ensureLogDirectoryExists,
  getLogFilePath,
  getLogFileStats,
  getMissingLogDiagnostics,
  isLogFileError,
  isLogFileTooLarge,
  logFileExists,
  readLastLines,
  resolveLogPathForRead
} from '~/utils/logs.server';
import { getTaskLogFilePath } from '~/db/beads.server';

/**
 * API route to fetch static log content (last N lines)
 * Used as fallback when SSE streaming fails.
 * Optional query: projectId — project id for multi-project DB/path resolution.
 */
export async function loader({ params, request }: Route.LoaderArgs) {
  const taskId = params.taskId;
  const url = new URL(request.url);
  const projectId = url.searchParams.get('projectId') ?? undefined;

  if (!taskId || taskId.trim() === '') {
    throw data({
      error: 'Task ID is required',
      code: 'INVALID_TASK_ID'
    }, { status: 400 });
  }

  // Ensure log directory exists before any file operations
  try {
    ensureLogDirectoryExists();
  } catch (error) {
    const diagnostics = getMissingLogDiagnostics(taskId);
    throw data({ 
      error: `Failed to create log directory: ${error instanceof Error ? error.message : 'Unknown error'}`,
      code: 'PERMISSION_DENIED',
      taskId,
      expectedLogDirectory: diagnostics.expectedLogDirectoryTemplate,
      envVarsConsulted: diagnostics.envVarsConsulted,
      diagnostics,
      configHint: 'Check RALPH_LOG_DIR (and optionally REPO_ROOT) or ensure the default logs/ralph directory is writable.'
    }, { status: 500 });
  }

  // Get stored log_file_path from DB (if available) for path resolution
  const storedLogPath = getTaskLogFilePath(taskId, projectId);

  // Validate task ID format (and ensure filename mapping is valid) before resolving path.
  // resolveLogPathForRead can throw INVALID_TASK_ID when there is no stored path;
  // validating first ensures we return 400 instead of 500 for invalid task IDs.
  try {
    if (!storedLogPath) {
      void getLogFilePath(taskId);
    }
  } catch (error) {
    if (isLogFileError(error) && error.code === 'INVALID_TASK_ID') {
      throw data({ 
        error: `Invalid task ID format: ${taskId}`,
        code: 'INVALID_TASK_ID',
        taskId
      }, { status: 400 });
    }
    throw error;
  }

  const resolvedLogPath = resolveLogPathForRead(taskId, storedLogPath);

  // Check if log file exists
  try {
    // Check if log file exists using resolved path
    if (!logFileExists(taskId, resolvedLogPath)) {
      const diagnostics = getMissingLogDiagnostics(taskId);
      throw data({ 
        error: `Log file not found for task ID: ${taskId}`,
        code: 'NOT_FOUND',
        taskId,
        expectedLogPath: diagnostics.expectedLogPathTemplate,
        expectedLogDirectory: diagnostics.expectedLogDirectoryTemplate,
        envVarsConsulted: diagnostics.envVarsConsulted,
        diagnostics,
        configHint: 'Logs are expected under RALPH_LOG_DIR, or by default under <REPO_ROOT|cwd>/logs/ralph.'
      }, { status: 404 });
    }
  } catch (error) {
    // If it's a LogFileError with INVALID_TASK_ID, return that
    if (isLogFileError(error) && error.code === 'INVALID_TASK_ID') {
      throw data({ 
        error: `Invalid task ID format: ${taskId}`,
        code: 'INVALID_TASK_ID',
        taskId
      }, { status: 400 });
    }
    // Re-throw if it's already a data() response
    if (error && typeof error === 'object' && 'type' in error && error.type === 'DataWithResponseInit') {
      throw error;
    }
    // Unexpected error during existence check
    throw error;
  }

  // Check file stats for size warnings (using resolved path)
  const stats = getLogFileStats(taskId, resolvedLogPath);
  const isTooLarge = isLogFileTooLarge(taskId, resolvedLogPath);
  const isLarge = stats?.isLarge ?? false;

  try {
    // Read last 100 lines as fallback (using resolved path)
    // For very large files, this will use efficient streaming
    const logs = readLastLines(taskId, 100, resolvedLogPath);

    return data({ 
      logs,
      truncated: isTooLarge,
      fileSize: stats?.size,
      warning: isLarge ? 'Log file is large. Only showing last 100 lines.' : undefined
    });
  } catch (error) {
    // Handle specific error types
    if (isLogFileError(error)) {
      switch (error.code) {
        case 'PERMISSION_DENIED': {
          const diagnostics = getMissingLogDiagnostics(taskId);
          throw data({ 
            error: `Permission denied: Cannot read log file for task ${taskId}. Please check file permissions.`,
            code: 'PERMISSION_DENIED',
            taskId,
            expectedLogPath: diagnostics.expectedLogPathTemplate,
            expectedLogDirectory: diagnostics.expectedLogDirectoryTemplate,
            envVarsConsulted: diagnostics.envVarsConsulted,
            diagnostics,
            configHint: 'Ensure the log file is readable by the server process.'
          }, { status: 403 });
        }
        
        case 'TOO_LARGE':
          throw data({ 
            error: `Log file is too large to read (exceeds 100MB). Please use streaming or truncate the file.`,
            code: 'TOO_LARGE',
            taskId
          }, { status: 413 });
        
        case 'READ_ERROR':
          throw data({ 
            error: `Failed to read log file: ${error.message}`,
            code: 'READ_ERROR',
            taskId
          }, { status: 500 });
        
        default:
          throw data({ 
            error: `Error reading log file: ${error.message}`,
            code: error.code,
            taskId
          }, { status: 500 });
      }
    }

    // Unknown error
    console.error(`Unexpected error reading logs for task ${taskId}:`, error);
    throw data({ 
      error: `An unexpected error occurred while reading the log file`,
      code: 'UNKNOWN_ERROR',
      taskId
    }, { status: 500 });
  }
}
