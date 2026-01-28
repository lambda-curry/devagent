#!/usr/bin/env bun
/**
 * agent-runner.ts
 *
 * CLI entry point for the multi-agent delegation runner.
 * This is a thin wrapper around the modular implementation in the agent-runner/ directory.
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
