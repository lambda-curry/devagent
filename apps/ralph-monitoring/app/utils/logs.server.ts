import { readFileSync, existsSync, statSync, accessSync, constants, openSync, readSync, closeSync, mkdirSync, writeSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

// File size limits (in bytes)
const MAX_FILE_SIZE_FOR_FULL_READ = 10 * 1024 * 1024; // 10MB
const MAX_FILE_SIZE_FOR_PARTIAL_READ = 100 * 1024 * 1024; // 100MB
const WARN_FILE_SIZE = 50 * 1024 * 1024; // 50MB - warn user about large files

/**
 * Log file error codes used by server utilities.
 */
export interface LogFileError extends Error {
  code: 'NOT_FOUND' | 'PERMISSION_DENIED' | 'TOO_LARGE' | 'READ_ERROR' | 'INVALID_TASK_ID';
  taskId?: string;
}

export const isLogFileError = (error: unknown): error is LogFileError => {
  if (!error || typeof error !== 'object') return false;
  return 'code' in error && typeof (error as { code?: unknown }).code === 'string';
};

const makeLogFileError = (message: string, code: LogFileError['code'], taskId?: string): LogFileError => {
  const error = new Error(message) as LogFileError;
  error.name = 'LogFileError';
  error.code = code;
  error.taskId = taskId;
  return error;
};

const LOG_DIR_ENV_VAR = 'RALPH_LOG_DIR' as const;
const REPO_ROOT_ENV_VAR = 'REPO_ROOT' as const;

export const LOG_PATH_ENV_VARS = [LOG_DIR_ENV_VAR, REPO_ROOT_ENV_VAR] as const;
export type LogPathEnvVarName = typeof LOG_PATH_ENV_VARS[number];

const DEFAULT_RELATIVE_LOG_DIR = join('logs', 'ralph');

export interface MissingLogDiagnostics {
  expectedLogDirectoryTemplate: string;
  expectedLogPathTemplate: string;
  defaultRelativeLogDir: string;
  expectedLogFileName: string;
  envVarsConsulted: LogPathEnvVarName[];
  envVarIsSet: Record<LogPathEnvVarName, boolean>;
  resolvedStrategy: 'RALPH_LOG_DIR' | 'REPO_ROOT' | 'cwd';
}

/**
 * Return non-sensitive diagnostics for missing-log cases.
 * Avoid absolute paths and env var values; provide only names + a safe template.
 */
export const getMissingLogDiagnostics = (taskId: string): MissingLogDiagnostics => {
  const envVarIsSet: Record<LogPathEnvVarName, boolean> = {
    [LOG_DIR_ENV_VAR]: Boolean(process.env[LOG_DIR_ENV_VAR]),
    [REPO_ROOT_ENV_VAR]: Boolean(process.env[REPO_ROOT_ENV_VAR])
  };

  const expectedLogFileName = getTaskLogFileName(taskId);
  const defaultRelativeLogDir = DEFAULT_RELATIVE_LOG_DIR;
  const resolvedStrategy: MissingLogDiagnostics['resolvedStrategy'] = envVarIsSet[LOG_DIR_ENV_VAR]
    ? 'RALPH_LOG_DIR'
    : envVarIsSet[REPO_ROOT_ENV_VAR]
      ? 'REPO_ROOT'
      : 'cwd';

  const expectedLogPathTemplate =
    resolvedStrategy === 'RALPH_LOG_DIR'
      ? `<${LOG_DIR_ENV_VAR}>/${expectedLogFileName}`
      : `<${REPO_ROOT_ENV_VAR}|cwd>/${defaultRelativeLogDir}/${expectedLogFileName}`;

  return {
    expectedLogDirectoryTemplate:
      resolvedStrategy === 'RALPH_LOG_DIR' ? `<${LOG_DIR_ENV_VAR}>` : `<${REPO_ROOT_ENV_VAR}|cwd>/${defaultRelativeLogDir}`,
    expectedLogPathTemplate,
    defaultRelativeLogDir,
    expectedLogFileName,
    envVarsConsulted: [...LOG_PATH_ENV_VARS],
    envVarIsSet,
    resolvedStrategy
  };
};

function isRepoRootCandidate(dirPath: string): boolean {
  // Prefer turbo.json (monorepo root) or .git (repo root in dev).
  // In packaged deployments those files may not exist; we gracefully fall back to cwd.
  return existsSync(join(dirPath, 'turbo.json')) || existsSync(join(dirPath, '.git'));
}

function resolveRepoRootFromCwd(): string | null {
  // Walk up from cwd, bounded, looking for repo root markers.
  let current = resolve(process.cwd());
  for (let i = 0; i < 12; i++) {
    if (isRepoRootCandidate(current)) return current;
    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return null;
}

function resolveLogBaseDirectory(): string {
  const repoRootFromEnv = process.env[REPO_ROOT_ENV_VAR]?.trim();
  if (repoRootFromEnv) return repoRootFromEnv;

  const inferredRepoRoot = resolveRepoRootFromCwd();
  if (inferredRepoRoot) return inferredRepoRoot;

  return process.cwd();
}

export function sanitizeTaskIdForLogFileName(taskId: string): string {
  // Prevent path traversal and ensure deterministic mapping.
  // We keep "." and "-" because Beads IDs commonly contain them (e.g., devagent-300b.3).
  const raw = typeof taskId === 'string' ? taskId.trim() : '';
  const sanitized = raw.replace(/[^a-zA-Z0-9._-]/g, '_');

  // Avoid special/empty names
  const normalized = sanitized.replace(/_+/g, '_');
  if (!normalized || normalized === '.' || normalized === '..') {
    throw makeLogFileError('Invalid task ID format', 'INVALID_TASK_ID', taskId);
  }

  return normalized;
}

export function getTaskLogFileName(taskId: string): string {
  // Never throw for diagnostics callers; if taskId is invalid, fall back to a safe placeholder.
  try {
    return `${sanitizeTaskIdForLogFileName(taskId)}.log`;
  } catch {
    return 'invalid-task-id.log';
  }
}

/**
 * Get the log directory path
 * Returns the directory where log files are stored
 */
export function getLogDirectory(): string {
  const configured = process.env[LOG_DIR_ENV_VAR]?.trim();
  if (configured) return configured;

  const baseDir = resolveLogBaseDirectory();
  return join(baseDir, DEFAULT_RELATIVE_LOG_DIR);
}

/**
 * Ensure the log directory exists (creates recursively if missing)
 * This should be called before any file operations to prevent "file not found" errors
 */
export function ensureLogDirectoryExists(): void {
  const logDir = getLogDirectory();
  if (!existsSync(logDir)) {
    try {
      mkdirSync(logDir, { recursive: true });
    } catch (error) {
      console.error(`Failed to create log directory at ${logDir}:`, error);
      throw makeLogFileError(
        `Failed to create log directory: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'PERMISSION_DENIED'
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
    throw makeLogFileError('Invalid task ID format', 'INVALID_TASK_ID', taskId);
  }

  const sanitizedTaskId = sanitizeTaskIdForLogFileName(taskId);

  // Ensure log directory exists before returning path
  ensureLogDirectoryExists();

  const logDir = getLogDirectory();
  return join(logDir, `${sanitizedTaskId}.log`);
}

export function touchLogFile(taskId: string): string {
  const logPath = getLogFilePath(taskId);
  // Open in append mode to create if missing; then close immediately.
  const fd = openSync(logPath, 'a');
  closeSync(fd);
  return logPath;
}

export function appendToLogFile(taskId: string, content: string | Uint8Array): string {
  const logPath = getLogFilePath(taskId);
  const fd = openSync(logPath, 'a');
  try {
    if (typeof content === 'string') {
      writeSync(fd, content);
    } else {
      writeSync(fd, content);
    }
  } finally {
    closeSync(fd);
  }
  return logPath;
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
    if (isLogFileError(error) && error.code === 'INVALID_TASK_ID') {
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
 * Throws `LogFileError` for permission errors or other issues
 */
export function readLastLines(taskId: string, lines: number = 100): string {
  // Ensure directory exists before attempting to read
  ensureLogDirectoryExists();
  const logPath = getLogFilePath(taskId);
  
  if (!existsSync(logPath)) {
    return '';
  }

  // Check file permissions
  if (!canReadFile(logPath)) {
    throw makeLogFileError(
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
    if (isLogFileError(error)) {
      throw error;
    }
    
    // Check for permission errors
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'EACCES' || error.code === 'EPERM') {
        throw makeLogFileError(
          `Permission denied: Cannot read log file for task ${taskId}`,
          'PERMISSION_DENIED',
          taskId
        );
      }
    }

    console.error(`Failed to read log file for task ${taskId}:`, error);
    throw makeLogFileError(
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
      throw makeLogFileError(
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
  // Ensure directory exists before checking stats
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
