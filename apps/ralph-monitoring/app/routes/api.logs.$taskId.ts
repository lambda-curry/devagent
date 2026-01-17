import { data } from 'react-router';
import type { Route } from './+types/api.logs.$taskId';
import { readLastLines, logFileExists, getLogFileStats, LogFileError, isLogFileTooLarge } from '~/utils/logs.server';

/**
 * API route to fetch static log content (last N lines)
 * Used as fallback when SSE streaming fails
 */
export async function loader({ params }: Route.LoaderArgs) {
  const taskId = params.taskId;
  
  if (!taskId || taskId.trim() === '') {
    throw data({ 
      error: 'Task ID is required',
      code: 'INVALID_TASK_ID'
    }, { status: 400 });
  }

  // Validate task ID format
  try {
    // Check if log file exists (this also validates task ID format)
    if (!logFileExists(taskId)) {
      throw data({ 
        error: `Log file not found for task ID: ${taskId}`,
        code: 'NOT_FOUND',
        taskId
      }, { status: 404 });
    }
  } catch (error) {
    // If it's a LogFileError with INVALID_TASK_ID, return that
    if (error instanceof LogFileError && error.code === 'INVALID_TASK_ID') {
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
    // Otherwise, it's a not found
    throw data({ 
      error: `Log file not found for task ID: ${taskId}`,
      code: 'NOT_FOUND',
      taskId
    }, { status: 404 });
  }

  // Check file stats for size warnings
  const stats = getLogFileStats(taskId);
  const isTooLarge = isLogFileTooLarge(taskId);
  const isLarge = stats?.isLarge ?? false;

  try {
    // Read last 100 lines as fallback
    // For very large files, this will use efficient streaming
    const logs = readLastLines(taskId, 100);

    return data({ 
      logs,
      truncated: isTooLarge,
      fileSize: stats?.size,
      warning: isLarge ? 'Log file is large. Only showing last 100 lines.' : undefined
    });
  } catch (error) {
    // Handle specific error types
    if (error instanceof LogFileError) {
      switch (error.code) {
        case 'PERMISSION_DENIED':
          throw data({ 
            error: `Permission denied: Cannot read log file for task ${taskId}. Please check file permissions.`,
            code: 'PERMISSION_DENIED',
            taskId
          }, { status: 403 });
        
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
