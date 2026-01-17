import { readFileSync, existsSync, statSync, accessSync, constants, openSync, readSync, closeSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';

// File size limits (in bytes)
const MAX_FILE_SIZE_FOR_FULL_READ = 10 * 1024 * 1024; // 10MB
const MAX_FILE_SIZE_FOR_PARTIAL_READ = 100 * 1024 * 1024; // 100MB
const WARN_FILE_SIZE = 50 * 1024 * 1024; // 50MB - warn user about large files

/**
 * Custom error types for better error handling
 */
export class LogFileError extends Error {
  constructor(
    message: string,
    public readonly code: 'NOT_FOUND' | 'PERMISSION_DENIED' | 'TOO_LARGE' | 'READ_ERROR' | 'INVALID_TASK_ID',
    public readonly taskId?: string
  ) {
    super(message);
    this.name = 'LogFileError';
  }
}

/**
 * Get the log directory path
 */
export function getLogDirectory(): string {
  const repoRoot = process.env.REPO_ROOT || process.cwd();
  return process.env.RALPH_LOG_DIR || join(repoRoot, 'logs', 'ralph');
}

/**
 * Ensure the log directory exists (creates it recursively if missing)
 */
export function ensureLogDirectoryExists(): void {
  const logDir = getLogDirectory();
  if (!existsSync(logDir)) {
    try {
      mkdirSync(logDir, { recursive: true });
    } catch (error) {
      console.error(`Failed to create log directory at ${logDir}:`, error);
      throw new LogFileError(
        `Failed to create log directory: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'PERMISSION_DENIED',
        undefined
      );
    }
  }
}

/**
 * Get the log file path for a given task ID
 * Ensures the log directory exists before returning the path
 */
export function getLogFilePath(taskId: string): string {
  // Validate task ID format (basic validation)
  if (!taskId || typeof taskId !== 'string' || taskId.trim() === '') {
    throw new LogFileError('Invalid task ID format', 'INVALID_TASK_ID', taskId);
  }

  // Sanitize task ID to prevent path traversal
  const sanitizedTaskId = taskId.replace(/[^a-zA-Z0-9._-]/g, '');
  if (sanitizedTaskId !== taskId) {
    throw new LogFileError('Task ID contains invalid characters', 'INVALID_TASK_ID', taskId);
  }

  // Ensure log directory exists before returning path
  ensureLogDirectoryExists();

  const logDir = getLogDirectory();
  return join(logDir, `${sanitizedTaskId}.log`);
}

/**
 * Check if a log file exists for a task
 * Ensures the log directory exists before checking
 */
export function logFileExists(taskId: string): boolean {
  try {
    // Ensure directory exists first
    ensureLogDirectoryExists();
    const logPath = getLogFilePath(taskId);
    return existsSync(logPath);
  } catch (error) {
    // If it's an invalid task ID, file doesn't exist
    if (error instanceof LogFileError && error.code === 'INVALID_TASK_ID') {
      return false;
    }
    throw error;
  }
}

/**
 * Check if we can read a file (permissions check)
 */
function canReadFile(filePath: string): boolean {
  try {
    accessSync(filePath, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Read the last N lines from a log file using streaming for large files
 * Returns empty string if file doesn't exist
 * Throws LogFileError for permission errors or other issues
 */
export function readLastLines(taskId: string, lines: number = 100): string {
  // Ensure directory exists before checking file
  ensureLogDirectoryExists();
  const logPath = getLogFilePath(taskId);
  
  if (!existsSync(logPath)) {
    return '';
  }

  // Check file permissions
  if (!canReadFile(logPath)) {
    throw new LogFileError(
      `Permission denied: Cannot read log file for task ${taskId}`,
      'PERMISSION_DENIED',
      taskId
    );
  }

  try {
    const stats = statSync(logPath);
    const fileSize = stats.size;

    // For very large files, use streaming approach
    if (fileSize > MAX_FILE_SIZE_FOR_FULL_READ) {
      return readLastLinesStreaming(logPath, lines, fileSize);
    }

    // For smaller files, read directly
    const content = readFileSync(logPath, 'utf-8');
    const allLines = content.split('\n');
    const lastLines = allLines.slice(-lines);
    return lastLines.join('\n');
  } catch (error) {
    if (error instanceof LogFileError) {
      throw error;
    }
    
    // Check for permission errors
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'EACCES' || error.code === 'EPERM') {
        throw new LogFileError(
          `Permission denied: Cannot read log file for task ${taskId}`,
          'PERMISSION_DENIED',
          taskId
        );
      }
    }

    console.error(`Failed to read log file for task ${taskId}:`, error);
    throw new LogFileError(
      `Failed to read log file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'READ_ERROR',
      taskId
    );
  }
}

/**
 * Read last N lines using efficient tail-like approach (for large files)
 * Reads from the end of the file in chunks
 */
function readLastLinesStreaming(filePath: string, lines: number, fileSize: number): string {
  // For extremely large files, limit the amount we read
  const maxBytesToRead = Math.min(fileSize, MAX_FILE_SIZE_FOR_PARTIAL_READ);
  const startPosition = Math.max(0, fileSize - maxBytesToRead);

  let fd: number | null = null;
  try {
    // Read the tail portion of the file
    fd = openSync(filePath, 'r');
    const buffer = Buffer.alloc(maxBytesToRead);
    const bytesRead = readSync(fd, buffer, 0, maxBytesToRead, startPosition);
    closeSync(fd);
    fd = null;
    
    const content = buffer.toString('utf-8', 0, bytesRead);
    
    // Split into lines and take the last N lines
    const allLines = content.split('\n');
    // If we started mid-line, the first line might be incomplete, so we skip it
    // and take the last N lines from the rest
    const lastLines = allLines.slice(-lines);
    
    return lastLines.join('\n');
  } catch (error) {
    if (fd !== null) {
      try {
        closeSync(fd);
      } catch {
        // Ignore close errors
      }
    }
    // Fallback: try to read a smaller chunk using readFileSync
    console.warn(`Efficient read failed for ${filePath}, attempting fallback:`, error);
    let fallbackFd: number | null = null;
    try {
      const fallbackSize = Math.min(fileSize, 5 * 1024 * 1024); // 5MB fallback
      const fallbackStart = Math.max(0, fileSize - fallbackSize);
      
      // Use readFileSync with position (Node.js 20+)
      fallbackFd = openSync(filePath, 'r');
      const buffer = Buffer.alloc(fallbackSize);
      const bytesRead = readSync(fallbackFd, buffer, 0, fallbackSize, fallbackStart);
      closeSync(fallbackFd);
      fallbackFd = null;
      
      const content = buffer.toString('utf-8', 0, bytesRead);
      const allLines = content.split('\n');
      const lastLines = allLines.slice(-lines);
      return lastLines.join('\n');
    } catch {
      if (fallbackFd !== null) {
        try {
          closeSync(fallbackFd);
        } catch {
          // Ignore close errors
        }
      }
      throw new LogFileError(
        `Failed to read large log file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'READ_ERROR',
        undefined
      );
    }
  }
}

/**
 * Get log file stats (size, modified time)
 * Returns null if file doesn't exist or can't be accessed
 */
export function getLogFileStats(taskId: string): { size: number; mtime: Date; isLarge: boolean } | null {
  // Ensure directory exists before checking file
  ensureLogDirectoryExists();
  const logPath = getLogFilePath(taskId);
  
  if (!existsSync(logPath)) {
    return null;
  }

  try {
    const stats = statSync(logPath);
    return {
      size: stats.size,
      mtime: stats.mtime,
      isLarge: stats.size > WARN_FILE_SIZE
    };
  } catch (error) {
    console.error(`Failed to get log file stats for task ${taskId}:`, error);
    return null;
  }
}

/**
 * Check if a log file is too large to read efficiently
 */
export function isLogFileTooLarge(taskId: string): boolean {
  const stats = getLogFileStats(taskId);
  return stats ? stats.size > MAX_FILE_SIZE_FOR_PARTIAL_READ : false;
}
