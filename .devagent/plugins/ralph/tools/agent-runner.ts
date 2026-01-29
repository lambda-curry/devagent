#!/usr/bin/env bun
/**
 * agent-runner.ts
 *
 * CLI entry point for the multi-agent delegation runner.
 * This is a thin wrapper around the modular implementation in the agent-runner/ directory.
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

import { runAgent, parseCLIArgs } from './agent-runner/index';

if (import.meta.main) {
  try {
    const opts = parseCLIArgs(process.argv);
    const result = await runAgent(opts);
    process.exit(result.success ? 0 : 1);
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
    process.exit(2);
  }
}
