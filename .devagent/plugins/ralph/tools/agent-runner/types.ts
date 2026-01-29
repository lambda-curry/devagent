/**
 * types.ts
 *
 * Shared interfaces for the agent runner.
 */

export interface AgentDefinition {
  name: string;
  command: string;
  buildArgs(prompt: string, extraArgs: string[]): string[];
  failurePatterns?: RegExp[];
  defaultTimeout?: number;
}

export interface AgentRunOptions {
  agent: string;
  repo?: string;
  prompt?: string;
  promptFile?: string;
  attempts?: number;
  sleepMs?: number;
  backoff?: number;
  timeoutMs?: number;
  logDir?: string;
  wakeSummarize?: boolean;
  taskDescription?: string;
  wakeOutputChars?: number;
  extraArgs?: string[];
  onWakeError?: (error: Error) => void;
}

export interface AgentRunResult {
  success: boolean;
  exitCode: number;
  attempt: number;
  totalAttempts: number;
  stdout: string;
  stderr: string;
  logPath: string;
  runId: string;
  wakeSent?: boolean;
  wakeError?: string;
}
