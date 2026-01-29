/**
 * agent-runner.test.ts
 *
 * Consolidated tests for the agent runner module.
 */
import { describe, expect, it } from 'vitest';
import { agents, getAgent, listAgents } from './agents';
import { parseCLIArgs, buildWakeMessage, truncateTail, calculateNextDelay } from './utils';

describe('Agent Runner', () => {
  describe('Agent Registry', () => {
    const SUPPORTED_AGENTS = ['cursor', 'opencode', 'claude', 'gemini', 'jules'];

    it('should have all built-in agents registered', () => {
      const registeredAgents = listAgents();
      SUPPORTED_AGENTS.forEach((agent) => {
        expect(registeredAgents).toContain(agent);
      });
    });

    it('should return a valid agent definition', () => {
      const agent = getAgent('cursor');
      expect(agent).toBeDefined();
      expect(agent?.command).toBe('agent');
    });

    it('should return undefined for unknown agent', () => {
      const agent = getAgent('unknown-agent');
      expect(agent).toBeUndefined();
    });
  });

  describe('Agent Command Building', () => {
    it('cursor agent should add --model auto by default', () => {
      const agent = getAgent('cursor');
      const args = agent?.buildArgs('test', []);
      expect(args).toContain('--model');
      expect(args).toContain('auto');
    });

    it('cursor agent should not add --model auto if already present', () => {
      const agent = getAgent('cursor');
      const args = agent?.buildArgs('test', ['--model', 'claude-3.5']);
      const modelIndices = args?.map((arg, i) => (arg === '--model' ? i : -1)).filter((i) => i !== -1);
      expect(modelIndices?.length).toBe(1);
      expect(args?.[modelIndices![0] + 1]).toBe('claude-3.5');
    });

    it('claude agent should add required flags', () => {
      const agent = getAgent('claude');
      const args = agent?.buildArgs('test', []);
      expect(args).toContain('--allowedTools');
      expect(args).toContain('computer,mcp');
    });

    it('jules agent should use the "run" subcommand', () => {
      const agent = getAgent('jules');
      const args = agent?.buildArgs('test', []);
      expect(args?.[0]).toBe('run');
    });
  });

  describe('Failure Pattern Detection', () => {
    it('should detect failure patterns in agent output', () => {
      const cursorAgent = getAgent('cursor');
      const output = 'Error: Connection stalled';
      const patterns = cursorAgent?.failurePatterns ?? [];
      const detected = patterns.some((p) => p.test(output));
      expect(detected).toBe(true);
    });

    it('should not detect failure in normal output', () => {
      const cursorAgent = getAgent('cursor');
      const output = 'Process completed successfully.';
      const patterns = cursorAgent?.failurePatterns ?? [];
      const detected = patterns.some((p) => p.test(output));
      expect(detected).toBe(false);
    });
  });

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

  describe('Retry Logic', () => {
    describe('calculateNextDelay', () => {
      it('should calculate exponential backoff without jitter', () => {
        let delay = 1000;
        const backoff = 1.5;

        delay = calculateNextDelay(delay, backoff, false);
        expect(delay).toBe(1500);

        delay = calculateNextDelay(delay, backoff, false);
        expect(delay).toBe(2250);

        delay = calculateNextDelay(delay, backoff, false);
        expect(delay).toBe(3375);
      });

      it('should calculate exponential backoff with jitter', () => {
        const delay = 1000;
        const backoff = 1.5;
        const nextDelay = 1500;

        for (let i = 0; i < 100; i++) {
          const result = calculateNextDelay(delay, backoff, true);
          // Jitter is ±25%, so the range is [1500 * 0.75, 1500 * 1.25]
          expect(result).toBeGreaterThanOrEqual(nextDelay * 0.75);
          expect(result).toBeLessThanOrEqual(nextDelay * 1.25);
        }
      });

      it('should cap the delay at maxDelay', () => {
        let delay = 5000;
        const backoff = 2;
        const maxDelay = 8000;

        delay = calculateNextDelay(delay, backoff, false, maxDelay);
        expect(delay).toBe(8000); // 5000 * 2 = 10000, capped at 8000
      });

      it('should not exceed maxDelay even with jitter', () => {
        const delay = 8000;
        const backoff = 2;
        const maxDelay = 10000;

        for (let i = 0; i < 100; i++) {
          const result = calculateNextDelay(delay, backoff, true, maxDelay);
          expect(result).toBeLessThanOrEqual(maxDelay);
        }
      });
    });
  });

  describe('Wake Message Formatting', () => {
    it('should format a basic success message correctly', () => {
      const msg = buildWakeMessage({
        status: 'success',
        attempt: 1,
        totalAttempts: 3,
        logPath: '/log.txt',
        output: 'Success!',
        wakeOutputChars: 100,
        agent: 'cursor',
        promptText: 'test',
      });
      expect(msg).toContain('cursor Agent succeeded on attempt 1/3');
      expect(msg).toContain('Log: /log.txt');
      expect(msg).toContain('Success!');
    });

    it('should format a summarize wake message correctly', () => {
      const msg = buildWakeMessage({
        status: 'success',
        attempt: 1,
        totalAttempts: 3,
        logPath: '/log.txt',
        output: 'Success!',
        wakeOutputChars: 100,
        agent: 'cursor',
        wakeSummarize: true,
        taskDescription: 'Do the thing',
        promptText: 'test',
      });
      expect(msg).toContain('Agent delegation completed');
      expect(msg).toContain('Task: Do the thing');
      expect(msg).toContain('Please summarize');
    });

    it('should truncate long output correctly', () => {
      const longOutput = 'a'.repeat(200);
      const truncated = truncateTail(longOutput, 100);
      expect(truncated).toContain('…(truncated)…');
      expect(truncated.length).toBeLessThan(120);
    });
  });
});
