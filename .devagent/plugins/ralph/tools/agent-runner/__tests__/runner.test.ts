/**
 * runner.test.ts
 *
 * Unit tests for the core agent runner logic.
 */
import { describe, expect, it } from 'vitest';
import { buildWakeMessage, truncateTail } from '../utils/wake';
import { registry } from '../registry';

// Ensure agents are registered
import '../agents/cursor';
import '../agents/opencode';
import '../agents/claude';
import '../agents/gemini';
import '../agents/jules';

describe('Agent Runner', () => {
  describe('Agent Registry', () => {
    const SUPPORTED_AGENTS = ['cursor', 'opencode', 'claude', 'gemini', 'jules'];

    it('should have all built-in agents registered', () => {
      const registeredAgents = registry.list();
      SUPPORTED_AGENTS.forEach((agent) => {
        expect(registeredAgents).toContain(agent);
      });
    });

    it('should return a valid agent definition', () => {
      const agent = registry.get('cursor');
      expect(agent).toBeDefined();
      expect(agent?.name).toBe('cursor');
      expect(agent?.command).toBe('agent');
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

  describe('Failure Pattern Detection', () => {
    it('should detect failure patterns in agent output', () => {
      const cursorAgent = registry.get('cursor');
      const output = 'Error: Connection stalled';
      const patterns = cursorAgent?.failurePatterns ?? [];
      const detected = patterns.some((p) => p.test(output));
      expect(detected).toBe(true);
    });

    it('should not detect failure in normal output', () => {
      const cursorAgent = registry.get('cursor');
      const output = 'Process completed successfully.';
      const patterns = cursorAgent?.failurePatterns ?? [];
      const detected = patterns.some((p) => p.test(output));
      expect(detected).toBe(false);
    });
  });

  describe('Agent Command Building', () => {
    it('cursor agent should add --model auto by default', () => {
      const agent = registry.get('cursor');
      const args = agent?.buildArgs('test', []);
      expect(args).toContain('--model');
      expect(args).toContain('auto');
    });

    it('cursor agent should not add --model auto if already present', () => {
      const agent = registry.get('cursor');
      const args = agent?.buildArgs('test', ['--model', 'claude-3.5']);
      const modelIndices = args
        ?.map((arg, i) => (arg === '--model' ? i : -1))
        .filter((i) => i !== -1);
      expect(modelIndices?.length).toBe(1);
      expect(args?.[modelIndices![0] + 1]).toBe('claude-3.5');
    });

    it('claude agent should add required flags', () => {
      const agent = registry.get('claude');
      const args = agent?.buildArgs('test', []);
      expect(args).toContain('--allowedTools');
      expect(args).toContain('computer,mcp');
    });

    it('jules agent should use the "run" subcommand', () => {
        const agent = registry.get('jules');
        const args = agent?.buildArgs('test', []);
        expect(args?.[0]).toBe('run');
      });
  });
});
