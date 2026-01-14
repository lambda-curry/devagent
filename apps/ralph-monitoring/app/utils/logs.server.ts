import { readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Get the log file path for a given task ID
 */
export function getLogFilePath(taskId: string): string {
  const repoRoot = process.env.REPO_ROOT || process.cwd();
  const logDir = process.env.RALPH_LOG_DIR || join(repoRoot, 'logs', 'ralph');
  return join(logDir, `${taskId}.log`);
}

/**
 * Check if a log file exists for a task
 */
export function logFileExists(taskId: string): boolean {
  const logPath = getLogFilePath(taskId);
  return existsSync(logPath);
}

/**
 * Read the last N lines from a log file
 * Returns empty string if file doesn't exist
 */
export function readLastLines(taskId: string, lines: number = 100): string {
  const logPath = getLogFilePath(taskId);
  
  if (!existsSync(logPath)) {
    return '';
  }

  try {
    const content = readFileSync(logPath, 'utf-8');
    const allLines = content.split('\n');
    const lastLines = allLines.slice(-lines);
    return lastLines.join('\n');
  } catch (error) {
    console.error(`Failed to read log file for task ${taskId}:`, error);
    return '';
  }
}

/**
 * Get log file stats (size, modified time)
 */
export function getLogFileStats(taskId: string): { size: number; mtime: Date } | null {
  const logPath = getLogFilePath(taskId);
  
  if (!existsSync(logPath)) {
    return null;
  }

  try {
    const stats = statSync(logPath);
    return {
      size: stats.size,
      mtime: stats.mtime
    };
  } catch (error) {
    console.error(`Failed to get log file stats for task ${taskId}:`, error);
    return null;
  }
}
