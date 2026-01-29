/**
 * utils.ts
 *
 * Consolidated utilities for the agent runner.
 * Combines logging, retry, wake, and CLI parsing into one file.
 */
import { mkdir, writeFile, appendFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { AgentRunOptions } from './types';
import { listAgents } from './agents';

// ============================================================================
// Time & Logging
// ============================================================================

export function nowStamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

export async function setupLogDir(logDir: string): Promise<void> {
  await mkdir(logDir, { recursive: true });
}

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

export async function writeLog(logPath: string, message: string): Promise<void> {
  await appendFile(logPath, message);
}

// ============================================================================
// Retry & Backoff
// ============================================================================

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function calculateNextDelay(
  currentDelay: number,
  backoff: number,
  jitter: boolean = true,
  maxDelay?: number
): number {
  let next = currentDelay * backoff;
  if (jitter) {
    next = next * (0.75 + Math.random() * 0.5); // ±25% jitter
  }
  if (maxDelay && next > maxDelay) {
    next = maxDelay;
  }
  return Math.round(next);
}

// ============================================================================
// Wake Notifications
// ============================================================================

export interface WakeResult {
  sent: boolean;
  error?: string;
}

export async function maybeWake(text: string): Promise<WakeResult> {
  try {
    const proc = Bun.spawn(['clawdbot', 'gateway', 'wake', '--text', text, '--mode', 'now'], {
      stdout: 'pipe',
      stderr: 'pipe',
    });
    const exitCode = await proc.exited;
    if (exitCode === 0) {
      return { sent: true };
    }
    const stderr = await new Response(proc.stderr).text();
    return { sent: false, error: stderr || `clawdbot exited with code ${exitCode}` };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    return { sent: false, error };
  }
}

export function truncateTail(s: string, n: number): string {
  if (n <= 0) return '';
  if (s.length <= n) return s;
  return '…(truncated)…\n' + s.slice(s.length - n);
}

export function buildWakeMessage(opts: {
  status: 'success' | 'failed';
  attempt: number;
  totalAttempts: number;
  logPath: string;
  output: string;
  wakeOutputChars: number;
  agent: string;
  wakeSummarize?: boolean;
  taskDescription?: string;
  promptText: string;
}): string {
  const {
    status,
    attempt,
    totalAttempts,
    logPath,
    output,
    wakeOutputChars,
    agent,
    wakeSummarize,
    taskDescription,
    promptText,
  } = opts;

  if (wakeSummarize) {
    const taskBlock = taskDescription
      ? `Task: ${taskDescription}`
      : `Task (from prompt):\n${promptText.slice(0, 500)}${promptText.length > 500 ? '…' : ''}`;

    const outputTail = truncateTail(output.trim(), wakeOutputChars);

    return `${agent} Agent delegation completed.

**Status:** ${status} (attempt ${attempt}/${totalAttempts})
**Agent:** ${agent}
**Log:** ${logPath}

${taskBlock}

**Output${outputTail.includes('(truncated)') ? ' (tail)' : ''}:**
${outputTail || '(no output)'}

---
Please summarize what was accomplished (or what failed) and highlight any key findings, deliverables, or recommended next steps.`;
  }

  const base = `${agent} Agent ${
    status === 'success' ? 'succeeded' : 'FAILED'
  } on attempt ${attempt}/${totalAttempts}. Log: ${logPath}`;
  const outputTail = truncateTail(output.trim(), wakeOutputChars);
  return outputTail ? `${base}\n\n--- output (tail) ---\n${outputTail}` : base;
}

// ============================================================================
// CLI Parsing
// ============================================================================

export function parseCLIArgs(argv: string[]): AgentRunOptions {
  const ddIndex = argv.indexOf('--');
  const runnerArgs = ddIndex === -1 ? argv : argv.slice(0, ddIndex);
  const extraArgs = ddIndex === -1 ? [] : argv.slice(ddIndex + 1);

  const getArg = (flag: string): string | undefined => {
    const i = runnerArgs.indexOf(flag);
    if (i === -1 || i + 1 >= runnerArgs.length) return undefined;
    return runnerArgs[i + 1];
  };

  const hasFlag = (flag: string): boolean => runnerArgs.includes(flag);

  const agent = getArg('--agent');
  if (!agent) {
    throw new Error('--agent is required. Supported agents: ' + listAgents().join(', '));
  }

  const prompt = getArg('--prompt');
  const promptFile = getArg('--prompt-file');
  if (!prompt && !promptFile) {
    throw new Error('Provide --prompt or --prompt-file');
  }

  return {
    agent,
    repo: getArg('--repo'),
    prompt,
    promptFile,
    attempts: getArg('--attempts') ? Number(getArg('--attempts')) : undefined,
    sleepMs: getArg('--sleep-ms') ? Number(getArg('--sleep-ms')) : undefined,
    backoff: getArg('--backoff') ? Number(getArg('--backoff')) : undefined,
    timeoutMs: getArg('--timeout-ms') ? Number(getArg('--timeout-ms')) : undefined,
    logDir: getArg('--log-dir'),
    wakeSummarize: hasFlag('--wake-summarize'),
    taskDescription: getArg('--task-description'),
    wakeOutputChars: getArg('--wake-output-chars') ? Number(getArg('--wake-output-chars')) : undefined,
    extraArgs,
  };
}
