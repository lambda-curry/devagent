/**
 * index.ts
 *
 * Main entry point for the agent runner module.
 * Consolidates runner logic with exports.
 */
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import type { AgentRunOptions, AgentRunResult } from './types';
import { getAgent, listAgents, type AgentConfig } from './agents';
import {
  nowStamp,
  setupLogDir,
  writeLogHeader,
  writeLog,
  sleep,
  calculateNextDelay,
  maybeWake,
  buildWakeMessage,
  parseCLIArgs,
} from './utils';

// Re-export types and utilities for external use
export { parseCLIArgs } from './utils';
export * from './types';
export { agents, listAgents, getAgent } from './agents';

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

function detectFailure(output: string, patterns?: RegExp[]): boolean {
  if (!patterns || patterns.length === 0) return false;
  return patterns.some((pattern) => pattern.test(output));
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
      resolve({ exitCode: code ?? 1, stdout, stderr });
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

/**
 * Run an agent with retries, logging, and optional wake notifications.
 */
export async function runAgent(opts: AgentRunOptions): Promise<AgentRunResult> {
  const config = getAgent(opts.agent);
  if (!config) {
    throw new Error(`Unknown agent: ${opts.agent}. Supported agents: ${listAgents().join(', ')}`);
  }

  const attempts = opts.attempts ?? 3;
  if (!Number.isFinite(attempts) || attempts < 1) {
    throw new Error('--attempts must be >= 1');
  }

  const sleepMs = opts.sleepMs ?? 8000;
  const backoff = opts.backoff ?? 1.5;
  const timeoutMs = opts.timeoutMs ?? config.defaultTimeout ?? 600000;
  const wakeOutputChars = opts.wakeOutputChars ?? 1500;
  const repo = opts.repo ?? process.cwd();
  const logDir = opts.logDir ?? resolve(process.cwd(), '.devagent/logs/agent-runs');
  const extraArgs = opts.extraArgs ?? [];

  const promptText = await readPrompt(opts);

  await setupLogDir(logDir);
  const runId = nowStamp();
  const logPath = resolve(logDir, `agent_${opts.agent}_${runId}.log`);

  await writeLogHeader(logPath, runId, opts, promptText);

  let delay = sleepMs;
  let lastStdout = '';
  let lastStderr = '';
  let lastExitCode = 1;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    await writeLog(logPath, `\n=== Attempt ${attempt}/${attempts} ===\n`);

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

      await writeLog(logPath, combined + '\n');

      if (result.exitCode === 0) {
        console.log(`${opts.agent} Agent succeeded on attempt ${attempt}. Log: ${logPath}`);

        let wakeResult = { sent: false, error: undefined as string | undefined };
        if (opts.wakeSummarize) {
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
          wakeResult = await maybeWake(wakeMsg);
          if (!wakeResult.sent && opts.onWakeError) {
            opts.onWakeError(new Error(wakeResult.error));
          }
        }

        return {
          success: true,
          exitCode: 0,
          attempt,
          totalAttempts: attempts,
          stdout: result.stdout,
          stderr: result.stderr,
          logPath,
          runId,
          wakeSent: wakeResult.sent,
          wakeError: wakeResult.error,
        };
      }

      const failureDetected = detectFailure(result.stdout + '\n' + result.stderr, config.failurePatterns);
      const failMsg = failureDetected
        ? `Attempt ${attempt} failed: Detected failure pattern.`
        : `Attempt ${attempt} failed (exit ${result.exitCode}).`;

      console.error(failMsg);

      if (attempt < attempts) {
        await writeLog(logPath, `\n${failMsg} Sleeping ${Math.round(delay)}ms before retry.\n`);
        await sleep(delay);
        delay = calculateNextDelay(delay, backoff);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const failMsg = `Attempt ${attempt} failed with error: ${errorMsg}`;
      console.error(failMsg);
      await writeLog(logPath, `\n${failMsg}\n`);

      if (attempt < attempts) {
        await writeLog(logPath, `Sleeping ${Math.round(delay)}ms before retry.\n`);
        await sleep(delay);
        delay = calculateNextDelay(delay, backoff);
      }
    }
  }

  console.error(`${opts.agent} Agent FAILED after ${attempts} attempts. Log: ${logPath}`);

  let wakeResult = { sent: false, error: undefined as string | undefined };
  if (opts.wakeSummarize) {
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
    wakeResult = await maybeWake(wakeMsg);
    if (!wakeResult.sent && opts.onWakeError) {
      opts.onWakeError(new Error(wakeResult.error));
    }
  }

  return {
    success: false,
    exitCode: lastExitCode,
    attempt: attempts,
    totalAttempts: attempts,
    stdout: lastStdout,
    stderr: lastStderr,
    logPath,
    runId,
    wakeSent: wakeResult.sent,
    wakeError: wakeResult.error,
  };
}
