/**
 * cli.ts
 *
 * CLI argument parsing for the agent runner.
 */
import { AgentRunOptions } from '../types';
import { registry } from '../registry';

export function parseCLIArgs(argv: string[]): AgentRunOptions {
  // Separate runner args from agent-specific args
  const ddIndex = argv.indexOf('--');
  const runnerArgs = ddIndex === -1 ? argv : argv.slice(0, ddIndex);
  const extraArgs = ddIndex === -1 ? [] : argv.slice(ddIndex + 1);

  const getArg = (flag: string): string | undefined => {
    const i = runnerArgs.indexOf(flag);
    if (i === -1 || i + 1 >= runnerArgs.length) return undefined;
    return runnerArgs[i + 1];
  };

  const hasFlag = (flag: string): boolean => {
    return runnerArgs.includes(flag);
  };

  const agent = getArg('--agent');
  if (!agent) {
    throw new Error('--agent is required. Supported agents: ' + registry.list().join(', '));
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
  const wakeOutputChars = getArg('--wake-output-chars')
    ? Number(getArg('--wake-output-chars'))
    : undefined;

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
