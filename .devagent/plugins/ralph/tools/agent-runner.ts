#!/usr/bin/env bun
/**
 * agent-runner.ts
 *
 * Multi-agent delegation runner that generalizes agent execution across multiple CLI-based coding agents.
 * Supports cursor, opencode, claude, gemini, and jules with retries, logging, and Clawdbot wake notifications.
 *
 * Usage:
 *   bun agent-runner.ts --agent cursor --repo /path/to/repo --prompt "..." --attempts 3
 *   bun agent-runner.ts --agent opencode --prompt-file /path/to/prompt.txt --wake-summarize
 *
 * Options:
 *   --agent <name>            Agent to use: cursor, opencode, claude, gemini, jules (required)
 *   --repo <path>              Working directory (default: cwd)
 *   --prompt <text>            Inline prompt text
 *   --prompt-file <path>       Path to file containing prompt
 *   --attempts <n>             Max retry attempts (default: 3)
 *   --sleep-ms <ms>            Initial retry delay (default: 8000)
 *   --backoff <factor>         Exponential backoff multiplier (default: 1.5)
 *   --timeout-ms <ms>          Per-attempt timeout (default: 600000 = 10 min)
 *   --log-dir <path>           Directory for run logs (default: .devagent/logs/agent-runs)
 *   --wake-summarize           Format wake message as a prompt for AI to summarize
 *   --task-description <text>  Short description for wake context
 *   --wake-output-chars <n>    Include last N chars of output in wake (default: 1500)
 *   -- <extra args>            Pass through to the underlying agent CLI
 *
 * Export:
 *   import { runAgent } from './agent-runner';
 *   const result = await runAgent({ agent: 'cursor', prompt: '...', repo: '...' });
 */

import { spawn } from 'node:child_process';
import { mkdir, writeFile, appendFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Agent configuration
interface AgentConfig {
  command: string;
  buildArgs: (prompt: string, extraArgs: string[]) => string[];
  defaultArgs?: string[];
  failurePatterns?: RegExp[];
}

const AGENT_CONFIGS: Record<string, AgentConfig> = {
  cursor: {
    command: 'agent',
    defaultArgs: ['--output-format', 'text', '--approve-mcps', '--force', '--model', 'auto'],
    buildArgs: (prompt: string, extraArgs: string[]) => {
      const hasModel = extraArgs.some((arg, i) => 
        arg === '--model' || arg === '-m' || (i > 0 && (extraArgs[i - 1] === '--model' || extraArgs[i - 1] === '-m'))
      );
      const baseArgs = ['-p', ...(hasModel ? [] : ['--model', 'auto']), '--output-format', 'text', '--approve-mcps', '--force'];
      return [...baseArgs, ...extraArgs, prompt];
    },
    failurePatterns: [/Connection stalled/i, /C:\s*Connection stalled/i],
  },
  opencode: {
    command: 'opencode',
    buildArgs: (prompt: string, extraArgs: string[]) => ['-p', prompt, ...extraArgs],
  },
  claude: {
    command: 'claude',
    buildArgs: (prompt: string, extraArgs: string[]) => [
      '-p',
      prompt,
      '--allowedTools',
      'computer,mcp',
      '--output-format',
      'text',
      ...extraArgs,
    ],
  },
  gemini: {
    command: 'gemini',
    buildArgs: (prompt: string, extraArgs: string[]) => ['-p', prompt, ...extraArgs],
  },
  jules: {
    command: 'jules',
    buildArgs: (prompt: string, extraArgs: string[]) => ['run', prompt, ...extraArgs],
  },
};

// Types
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
}

// Utility functions
function nowStamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function truncateTail(s: string, n: number): string {
  if (n <= 0) return '';
  if (s.length <= n) return s;
  return '…(truncated)…\n' + s.slice(s.length - n);
}

function detectFailure(output: string, patterns?: RegExp[]): boolean {
  if (!patterns || patterns.length === 0) return false;
  return patterns.some((pattern) => pattern.test(output));
}

async function readPrompt(opts: AgentRunOptions): Promise<string> {
  if (opts.promptFile) {
    const file = Bun.file(opts.promptFile);
    return await file.text();
  }
  if (opts.prompt) {
    return opts.prompt;
  }
  throw new Error('Missing --prompt or --prompt-file');
}

async function runAgentCommand(
  config: AgentConfig,
  prompt: string,
  cwd: string,
  extraArgs: string[],
  timeoutMs: number
): Promise<{ exitCode: number; stdout: string; stderr: string }> {
  const cmd = config.command;
  const args = config.buildArgs(prompt, extraArgs);

  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, {
      cwd,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    proc.stdout?.on('data', (chunk: Buffer) => {
      stdout += chunk.toString();
    });

    proc.stderr?.on('data', (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    proc.on('close', (code) => {
      if (timeoutId) clearTimeout(timeoutId);
      resolve({
        exitCode: code ?? 1,
        stdout,
        stderr,
      });
    });

    proc.on('error', (err) => {
      if (timeoutId) clearTimeout(timeoutId);
      reject(err);
    });

    if (timeoutMs > 0) {
      timeoutId = setTimeout(() => {
        proc.kill('SIGTERM');
        reject(new Error(`Command timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    }
  });
}

async function maybeWake(text: string): Promise<void> {
  try {
    const proc = Bun.spawn(['clawdbot', 'gateway', 'wake', '--text', text, '--mode', 'now'], {
      stdout: 'pipe',
      stderr: 'pipe',
    });
    await proc.exited;
  } catch {
    // best-effort wake notification
  }
}

function buildSummarizeWake(opts: {
  status: 'success' | 'failed';
  attempt: number;
  totalAttempts: number;
  taskDescription?: string;
  promptText: string;
  output: string;
  logPath: string;
  wakeOutputChars: number;
  agent: string;
}): string {
  const {
    status,
    attempt,
    totalAttempts,
    taskDescription,
    promptText,
    output,
    logPath,
    wakeOutputChars,
    agent,
  } = opts;

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

function buildWakeMessage(opts: {
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
    return buildSummarizeWake({
      status,
      attempt,
      totalAttempts,
      taskDescription,
      promptText,
      output,
      logPath,
      wakeOutputChars,
      agent,
    });
  }

  const base = `${agent} Agent ${status === 'success' ? 'succeeded' : 'FAILED'} on attempt ${attempt}/${totalAttempts}. Log: ${logPath}`;
  const outputTail = truncateTail(output.trim(), wakeOutputChars);
  return outputTail ? `${base}\n\n--- output (tail) ---\n${outputTail}` : base;
}

/**
 * Run an agent with retries, logging, and optional wake notifications.
 */
export async function runAgent(opts: AgentRunOptions): Promise<AgentRunResult> {
  // Validate agent
  const config = AGENT_CONFIGS[opts.agent];
  if (!config) {
    throw new Error(
      `Unknown agent: ${opts.agent}. Supported agents: ${Object.keys(AGENT_CONFIGS).join(', ')}`
    );
  }

  // Validate options
  const attempts = opts.attempts ?? 3;
  if (!Number.isFinite(attempts) || attempts < 1) {
    throw new Error('--attempts must be >= 1');
  }

  const sleepMs = opts.sleepMs ?? 8000;
  const backoff = opts.backoff ?? 1.5;
  const timeoutMs = opts.timeoutMs ?? 600000;
  const wakeOutputChars = opts.wakeOutputChars ?? 1500;
  const repo = opts.repo ?? process.cwd();
  const logDir = opts.logDir ?? resolve(process.cwd(), '.devagent/logs/agent-runs');
  const extraArgs = opts.extraArgs ?? [];

  // Read prompt
  const promptText = await readPrompt(opts);

  // Setup logging
  await mkdir(logDir, { recursive: true });
  const runId = nowStamp();
  const logPath = resolve(logDir, `agent_${opts.agent}_${runId}.log`);

  const header = [
    `Run: ${runId}`,
    `Agent: ${opts.agent}`,
    `Repo: ${repo}`,
    `Attempts: ${attempts}`,
    `Timeout: ${timeoutMs}ms`,
    `Extra args: ${extraArgs.join(' ')}`,
    '--- prompt ---',
    promptText,
    '--- end prompt ---',
    '',
  ].join('\n');

  await writeFile(logPath, header);

  // Run with retries
  let delay = sleepMs;
  let lastStdout = '';
  let lastStderr = '';
  let lastExitCode = 1;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    await appendFile(logPath, `\n=== Attempt ${attempt}/${attempts} ===\n`);

    try {
      const result = await runAgentCommand(config, promptText, repo, extraArgs, timeoutMs);
      lastStdout = result.stdout;
      lastStderr = result.stderr;
      lastExitCode = result.exitCode;

      const combined = [
        `exitCode: ${result.exitCode}`,
        '--- stdout ---',
        result.stdout,
        '--- stderr ---',
        result.stderr,
        '--- end ---',
      ].join('\n');

      await appendFile(logPath, combined + '\n');

      if (result.exitCode === 0) {
        const wakeMsg = buildWakeMessage({
          status: 'success',
          attempt,
          totalAttempts: attempts,
          logPath,
          output: result.stdout,
          wakeOutputChars,
          agent: opts.agent,
          wakeSummarize: opts.wakeSummarize,
          taskDescription: opts.taskDescription,
          promptText,
        });

        if (opts.wakeSummarize) {
          await maybeWake(wakeMsg);
        }

        console.log(`${opts.agent} Agent succeeded on attempt ${attempt}. Log: ${logPath}`);

        return {
          success: true,
          exitCode: 0,
          attempt,
          totalAttempts: attempts,
          stdout: result.stdout,
          stderr: result.stderr,
          logPath,
          runId,
        };
      }

      const failureDetected = detectFailure(result.stdout + '\n' + result.stderr, config.failurePatterns);
      const failMsg = failureDetected
        ? `Attempt ${attempt} failed: Detected failure pattern.`
        : `Attempt ${attempt} failed (exit ${result.exitCode}).`;

      console.error(failMsg);

      if (attempt < attempts) {
        await appendFile(logPath, `\n${failMsg} Sleeping ${Math.round(delay)}ms before retry.\n`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay = Math.round(delay * backoff);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const failMsg = `Attempt ${attempt} failed with error: ${errorMsg}`;
      console.error(failMsg);
      await appendFile(logPath, `\n${failMsg}\n`);

      if (attempt < attempts) {
        await appendFile(logPath, `Sleeping ${Math.round(delay)}ms before retry.\n`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay = Math.round(delay * backoff);
      }
    }
  }

  // All attempts failed
  const combinedOutput = ['--- last stdout ---', lastStdout.trim(), '--- last stderr ---', lastStderr.trim()].join(
    '\n'
  );

  const wakeMsg = buildWakeMessage({
    status: 'failed',
    attempt: attempts,
    totalAttempts: attempts,
    logPath,
    output: combinedOutput,
    wakeOutputChars,
    agent: opts.agent,
    wakeSummarize: opts.wakeSummarize,
    taskDescription: opts.taskDescription,
    promptText,
  });

  if (opts.wakeSummarize) {
    await maybeWake(wakeMsg);
  }

  console.error(`${opts.agent} Agent FAILED after ${attempts} attempts. Log: ${logPath}`);

  return {
    success: false,
    exitCode: lastExitCode,
    attempt: attempts,
    totalAttempts: attempts,
    stdout: lastStdout,
    stderr: lastStderr,
    logPath,
    runId,
  };
}

// CLI parsing
function getArg(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  if (i === -1) return undefined;
  return process.argv[i + 1];
}

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

function parseCLIArgs(): AgentRunOptions {
  const agent = getArg('--agent');
  if (!agent) {
    throw new Error('--agent is required. Supported agents: ' + Object.keys(AGENT_CONFIGS).join(', '));
  }

  const repo = getArg('--repo');
  const prompt = getArg('--prompt');
  const promptFile = getArg('--prompt-file');
  const attempts = getArg('--attempts') ? Number(getArg('--attempts')) : undefined;
  const sleepMs = getArg('--sleep-ms') ? Number(getArg('--sleep-ms')) : undefined;
  const backoff = getArg('--backoff') ? Number(getArg('--backoff')) : undefined;
  const timeoutMs = getArg('--timeout-ms') ? Number(getArg('--timeout-ms')) : undefined;
  const logDir = getArg('--log-dir');
  const wakeSummarize = hasFlag('--wake-summarize');
  const taskDescription = getArg('--task-description');
  const wakeOutputChars = getArg('--wake-output-chars') ? Number(getArg('--wake-output-chars')) : undefined;

  // Everything after `--` passes through to the agent
  const dd = process.argv.indexOf('--');
  const extraArgs = dd === -1 ? [] : process.argv.slice(dd + 1);

  if (!prompt && !promptFile) {
    throw new Error('Provide --prompt or --prompt-file');
  }

  return {
    agent,
    repo,
    prompt,
    promptFile,
    attempts,
    sleepMs,
    backoff,
    timeoutMs,
    logDir,
    wakeSummarize,
    taskDescription,
    wakeOutputChars,
    extraArgs,
  };
}

// CLI entry point
if (import.meta.main) {
  try {
    const opts = parseCLIArgs();
    const result = await runAgent(opts);
    process.exit(result.success ? 0 : 1);
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
    process.exit(2);
  }
}
