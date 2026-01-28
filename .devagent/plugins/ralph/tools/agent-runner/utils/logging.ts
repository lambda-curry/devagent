/**
 * logging.ts
 *
 * Log file management for agent runs.
 */
import { mkdir, writeFile, appendFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { AgentRunOptions } from '../types';

/**
 * Generates a timestamp string for log files.
 * e.g., 2023-10-27T10-30-00-000Z
 */
export function nowStamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

/**
 * Creates a log directory if it doesn't exist.
 * @param logDir The directory path.
 */
export async function setupLogDir(logDir: string): Promise<void> {
  await mkdir(logDir, { recursive: true });
}

/**
 * Writes the initial header to the log file.
 */
export async function writeLogHeader(
  logPath: string,
  runId: string,
  opts: AgentRunOptions,
  promptText: string
): Promise<void> {
  const header = [
    `Run: ${runId}`,
    `Agent: ${opts.agent}`,
    `Repo: ${opts.repo ?? process.cwd()}`,
    `Attempts: ${opts.attempts ?? 3}`,
    `Timeout: ${opts.timeoutMs ?? 600000}ms`,
    `Extra args: ${opts.extraArgs?.join(' ') ?? ''}`,
    '--- prompt ---',
    promptText,
    '--- end prompt ---',
    '',
  ].join('\n');
  await writeFile(logPath, header);
}

/**
 * Appends a message to the log file.
 */
export async function writeLog(logPath: string, message: string): Promise<void> {
  await appendFile(logPath, message);
}
