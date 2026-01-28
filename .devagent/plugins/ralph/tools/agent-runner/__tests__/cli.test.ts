/**
 * cli.test.ts
 *
 * Unit tests for CLI argument parsing.
 */
import { describe, expect, it } from 'bun:test';
import { parseCLIArgs } from '../utils/cli';

// Ensure agents are registered for registry.list() to work
import '../agents/cursor';
import '../agents/opencode';
import '../agents/claude';
import '../agents/gemini';
import '../agents/jules';

describe('CLI Argument Parsing', () => {
  it('should parse the --agent flag correctly', () => {
    const argv = ['node', 'agent-runner.ts', '--agent', 'cursor', '--prompt', 'test'];
    const opts = parseCLIArgs(argv);
    expect(opts.agent).toBe('cursor');
  });

  it('should parse the --prompt flag correctly', () => {
    const argv = ['node', 'agent-runner.ts', '--agent', 'cursor', '--prompt', 'a test prompt'];
    const opts = parseCLIArgs(argv);
    expect(opts.prompt).toBe('a test prompt');
  });

  it('should parse numeric flags correctly', () => {
    const argv = [
      'node',
      'agent-runner.ts',
      '--agent',
      'cursor',
      '--prompt',
      'test',
      '--attempts',
      '5',
      '--sleep-ms',
      '10000',
    ];
    const opts = parseCLIArgs(argv);
    expect(opts.attempts).toBe(5);
    expect(opts.sleepMs).toBe(10000);
  });

  it('should correctly parse extra arguments after --', () => {
    const argv = [
      'node',
      'agent-runner.ts',
      '--agent',
      'cursor',
      '--prompt',
      'test',
      '--',
      '--model',
      'claude-3.5-sonnet',
      '--another-arg',
    ];
    const opts = parseCLIArgs(argv);
    expect(opts.extraArgs).toEqual(['--model', 'claude-3.5-sonnet', '--another-arg']);
  });

  it('should handle runner arguments and extra arguments correctly', () => {
    const argv = [
      'node',
      'agent-runner.ts',
      '--agent',
      'cursor',
      '--prompt',
      'test',
      '--timeout-ms',
      '300000',
      '--',
      '--model',
      'claude-3.5-sonnet',
    ];
    const opts = parseCLIArgs(argv);
    expect(opts.timeoutMs).toBe(300000);
    expect(opts.extraArgs).toEqual(['--model', 'claude-3.5-sonnet']);
  });

  it('should handle no extra arguments when -- is not present', () => {
    const argv = ['node', 'agent-runner.ts', '--agent', 'cursor', '--prompt', 'test'];
    const opts = parseCLIArgs(argv);
    expect(opts.extraArgs).toEqual([]);
  });

  it('should throw an error if --agent is missing', () => {
    const argv = ['node', 'agent-runner.ts', '--prompt', 'test'];
    expect(() => parseCLIArgs(argv)).toThrow('--agent is required');
  });

  it('should throw an error if both --prompt and --prompt-file are missing', () => {
    const argv = ['node', 'agent-runner.ts', '--agent', 'cursor'];
    expect(() => parseCLIArgs(argv)).toThrow('Provide --prompt or --prompt-file');
  });
});
