import { data } from 'react-router';
import type { Route } from './+types/api.logs.$taskId';
import { readLastLines, logFileExists, getLogFileStats, LogFileError, isLogFileTooLarge, getLogFilePath, getLogDirectory, ensureLogDirectoryExists } from '~/utils/logs.server';

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

  // Ensure log directory exists before any file operations
  try {
    ensureLogDirectoryExists();
  } catch (error) {
    const logDir = getLogDirectory();
    throw data({ 
      error: `Failed to create log directory: ${error instanceof Error ? error.message : 'Unknown error'}`,
      code: 'PERMISSION_DENIED',
      taskId,
      expectedLogDirectory: logDir,
      configHint: 'Check RALPH_LOG_DIR environment variable or ensure logs/ralph/ directory is writable'
    }, { status: 500 });
  }

  // Get expected log path for error messages
  let expectedLogPath: string;
  try {
    expectedLogPath = getLogFilePath(taskId);
  } catch (error) {
    // If it's a LogFileError with INVALID_TASK_ID, return that
    if (error instanceof LogFileError && error.code === 'INVALID_TASK_ID') {
      throw data({ 
        error: `Invalid task ID format: ${taskId}`,
        code: 'INVALID_TASK_ID',
        taskId
      }, { status: 400 });
    }
    throw error;
  }

  // Validate task ID format and check if log file exists
  try {
    // Check if log file exists (this also validates task ID format)
    if (!logFileExists(taskId)) {
      const logDir = getLogDirectory();
      throw data({ 
        error: `Log file not found for task ID: ${taskId}`,
        code: 'NOT_FOUND',
        taskId,
        expectedLogPath,
        expectedLogDirectory: logDir,
        configHint: `Logs are expected at: ${logDir}. Check RALPH_LOG_DIR environment variable if logs are in a different location.`
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
    const logDir = getLogDirectory();
    throw data({ 
      error: `Log file not found for task ID: ${taskId}`,
      code: 'NOT_FOUND',
      taskId,
      expectedLogPath,
      expectedLogDirectory: logDir,
      configHint: `Logs are expected at: ${logDir}. Check RALPH_LOG_DIR environment variable if logs are in a different location.`
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
        case 'PERMISSION_DENIED': {
          const logDir = getLogDirectory();
          throw data({ 
            error: `Permission denied: Cannot read log file for task ${taskId}. Please check file permissions.`,
            code: 'PERMISSION_DENIED',
            taskId,
            expectedLogPath,
            expectedLogDirectory: logDir,
            configHint: `Ensure the log file at ${expectedLogPath} is readable. Check file permissions and RALPH_LOG_DIR environment variable.`
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
