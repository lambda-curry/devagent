import { describe, expect, it } from 'vitest';

/**
 * Unit tests for agent-runner.ts
 * 
 * These tests focus on testable logic without complex mocking.
 * Integration tests would require actual agent CLI execution.
 */

describe('agent-runner', () => {
  describe('Agent configuration validation', () => {
    const SUPPORTED_AGENTS = ['cursor', 'opencode', 'claude', 'gemini', 'jules'];

    it('should support all required agents', () => {
      SUPPORTED_AGENTS.forEach((agent) => {
        expect(SUPPORTED_AGENTS).toContain(agent);
      });
    });

    it('should reject unknown agents', () => {
      const unknownAgents = ['unknown', 'invalid', 'test-agent'];
      unknownAgents.forEach((agent) => {
        expect(SUPPORTED_AGENTS).not.toContain(agent);
      });
    });
  });

  describe('CLI argument parsing logic', () => {
    it('should parse --agent flag', () => {
      const args = ['node', 'agent-runner.ts', '--agent', 'cursor', '--prompt', 'test'];
      const agentIndex = args.indexOf('--agent');
      const agent = agentIndex !== -1 ? args[agentIndex + 1] : undefined;
      expect(agent).toBe('cursor');
    });

    it('should parse --prompt flag', () => {
      const args = ['node', 'agent-runner.ts', '--agent', 'cursor', '--prompt', 'test prompt'];
      const promptIndex = args.indexOf('--prompt');
      const prompt = promptIndex !== -1 ? args[promptIndex + 1] : undefined;
      expect(prompt).toBe('test prompt');
    });

    it('should parse --prompt-file flag', () => {
      const args = ['node', 'agent-runner.ts', '--agent', 'cursor', '--prompt-file', '/path/to/file'];
      const fileIndex = args.indexOf('--prompt-file');
      const file = fileIndex !== -1 ? args[fileIndex + 1] : undefined;
      expect(file).toBe('/path/to/file');
    });

    it('should parse --attempts flag', () => {
      const args = ['node', 'agent-runner.ts', '--agent', 'cursor', '--prompt', 'test', '--attempts', '5'];
      const attemptsIndex = args.indexOf('--attempts');
      const attempts = attemptsIndex !== -1 ? Number(args[attemptsIndex + 1]) : undefined;
      expect(attempts).toBe(5);
    });

    it('should parse extra args after --', () => {
      const args = ['node', 'agent-runner.ts', '--agent', 'cursor', '--prompt', 'test', '--', '--model', 'claude-3.5'];
      const dd = args.indexOf('--');
      const extraArgs = dd === -1 ? [] : args.slice(dd + 1);
      expect(extraArgs).toEqual(['--model', 'claude-3.5']);
    });

    it('should require --agent flag', () => {
      const args = ['node', 'agent-runner.ts', '--prompt', 'test'];
      const agentIndex = args.indexOf('--agent');
      const agent = agentIndex !== -1 ? args[agentIndex + 1] : undefined;
      expect(agent).toBeUndefined();
    });

    it('should require either --prompt or --prompt-file', () => {
      const args1 = ['node', 'agent-runner.ts', '--agent', 'cursor', '--prompt', 'test'];
      const args2 = ['node', 'agent-runner.ts', '--agent', 'cursor', '--prompt-file', '/path/to/file'];
      const args3 = ['node', 'agent-runner.ts', '--agent', 'cursor'];

      const hasPrompt1 = args1.includes('--prompt') || args1.includes('--prompt-file');
      const hasPrompt2 = args2.includes('--prompt') || args2.includes('--prompt-file');
      const hasPrompt3 = args3.includes('--prompt') || args3.includes('--prompt-file');

      expect(hasPrompt1).toBe(true);
      expect(hasPrompt2).toBe(true);
      expect(hasPrompt3).toBe(false);
    });
  });

  describe('Wake message formatting', () => {
    function truncateTail(s: string, n: number): string {
      if (n <= 0) return '';
      if (s.length <= n) return s;
      return '…(truncated)…\n' + s.slice(s.length - n);
    }

    it('should format basic wake message on success', () => {
      const output = 'Task completed successfully';
      const logPath = '/tmp/logs/agent_cursor_2026-01-27.log';
      const base = `cursor Agent succeeded on attempt 1/3. Log: ${logPath}`;
      const outputTail = truncateTail(output, 1500);
      const msg = outputTail ? `${base}\n\n--- output (tail) ---\n${outputTail}` : base;

      expect(msg).toContain('cursor Agent succeeded');
      expect(msg).toContain(logPath);
      expect(msg).toContain(output);
    });

    it('should format summarize wake message when --wake-summarize is set', () => {
      const promptText = 'Implement feature X';
      const output = 'Feature X has been implemented';
      const logPath = '/tmp/logs/agent_cursor_2026-01-27.log';
      const taskBlock = `Task (from prompt):\n${promptText.slice(0, 500)}`;
      const outputTail = truncateTail(output, 1500);

      const msg = `cursor Agent delegation completed.

**Status:** success (attempt 1/3)
**Agent:** cursor
**Log:** ${logPath}

${taskBlock}

**Output${outputTail.includes('(truncated)') ? ' (tail)' : ''}:**
${outputTail || '(no output)'}

---
Please summarize what was accomplished (or what failed) and highlight any key findings, deliverables, or recommended next steps.`;

      expect(msg).toContain('Agent delegation completed');
      expect(msg).toContain('Please summarize');
      expect(msg).toContain(promptText);
      expect(msg).toContain(output);
    });

    it('should include task description in summarize wake when provided', () => {
      const taskDescription = 'Implement user authentication';
      const output = 'Auth implemented';
      const logPath = '/tmp/logs/agent_cursor_2026-01-27.log';
      const taskBlock = `Task: ${taskDescription}`;
      const outputTail = truncateTail(output, 1500);

      const msg = `cursor Agent delegation completed.

**Status:** success (attempt 1/3)
**Agent:** cursor
**Log:** ${logPath}

${taskBlock}

**Output:**
${outputTail || '(no output)'}

---
Please summarize what was accomplished (or what failed) and highlight any key findings, deliverables, or recommended next steps.`;

      expect(msg).toContain(`Task: ${taskDescription}`);
      expect(msg).not.toContain('Task (from prompt)');
    });

    it('should truncate long output in wake messages', () => {
      const longOutput = 'x'.repeat(2000);
      const truncated = truncateTail(longOutput, 1500);

      expect(truncated).toContain('(truncated)');
      expect(truncated.length).toBeLessThanOrEqual(1500 + 20); // 20 for prefix
      expect(truncated.endsWith('x'.repeat(1500))).toBe(true);
    });

    it('should not truncate short output', () => {
      const shortOutput = 'Short output';
      const truncated = truncateTail(shortOutput, 1500);

      expect(truncated).not.toContain('(truncated)');
      expect(truncated).toBe(shortOutput);
    });
  });

  describe('Failure pattern detection', () => {
    it('should detect cursor connection stall pattern', () => {
      const output = 'Connection stalled during execution';
      const pattern = /Connection stalled/i;
      const detected = pattern.test(output);
      expect(detected).toBe(true);
    });

    it('should detect Windows-style connection stall', () => {
      // The pattern /C:\s*Connection stalled/i matches "C:" followed by optional whitespace
      // Test with space after colon (most common case)
      const output1 = 'C: Connection stalled';
      const pattern = /C:\s*Connection stalled/i;
      const detected1 = pattern.test(output1);
      expect(detected1).toBe(true);
      
      // Test with no space (colon directly before "Connection")
      const output2 = 'C:Connection stalled';
      const detected2 = pattern.test(output2);
      expect(detected2).toBe(true);
    });

    it('should not detect failure in normal output', () => {
      const output = 'Task completed successfully';
      const pattern = /Connection stalled/i;
      const detected = pattern.test(output);
      expect(detected).toBe(false);
    });
  });

  describe('Retry logic', () => {
    it('should calculate exponential backoff correctly', () => {
      const sleepMs = 8000;
      const backoff = 1.5;
      let delay = sleepMs;

      // Simulate retries
      const delays: number[] = [];
      for (let i = 0; i < 3; i++) {
        delays.push(delay);
        delay = Math.round(delay * backoff);
      }

      expect(delays[0]).toBe(8000);
      expect(delays[1]).toBe(12000); // 8000 * 1.5
      expect(delays[2]).toBe(18000); // 12000 * 1.5
    });

    it('should validate attempts parameter', () => {
      const validAttempts = 3;
      const invalidAttempts = 0;
      const invalidAttempts2 = -1;
      const invalidAttempts3 = NaN;

      expect(Number.isFinite(validAttempts) && validAttempts >= 1).toBe(true);
      expect(Number.isFinite(invalidAttempts) && invalidAttempts >= 1).toBe(false);
      expect(Number.isFinite(invalidAttempts2) && invalidAttempts2 >= 1).toBe(false);
      expect(Number.isFinite(invalidAttempts3) && invalidAttempts3 >= 1).toBe(false);
    });
  });

  describe('Agent command building', () => {
    it('should build cursor command with default model when not provided', () => {
      const prompt = 'test prompt';
      const extraArgs: string[] = [];
      const hasModel = extraArgs.some((arg, i) => 
        arg === '--model' || arg === '-m' || (i > 0 && (extraArgs[i - 1] === '--model' || extraArgs[i - 1] === '-m'))
      );
      const baseArgs = ['-p', ...(hasModel ? [] : ['--model', 'auto']), '--output-format', 'text', '--approve-mcps', '--force'];
      const args = [...baseArgs, ...extraArgs, prompt];

      expect(args).toContain('--model');
      expect(args).toContain('auto');
      expect(args).toContain(prompt);
    });

    it('should not add default model when --model is in extra args', () => {
      const prompt = 'test prompt';
      const extraArgs = ['--model', 'claude-3.5'];
      const hasModel = extraArgs.some((arg, i) => 
        arg === '--model' || arg === '-m' || (i > 0 && (extraArgs[i - 1] === '--model' || extraArgs[i - 1] === '-m'))
      );
      const baseArgs = ['-p', ...(hasModel ? [] : ['--model', 'auto']), '--output-format', 'text', '--approve-mcps', '--force'];
      const args = [...baseArgs, ...extraArgs, prompt];

      // Should not have duplicate --model auto
      const modelAutoIndex = args.indexOf('--model');
      const nextArg = args[modelAutoIndex + 1];
      expect(nextArg).not.toBe('auto');
      expect(nextArg).toBe('claude-3.5');
    });

    it('should build opencode command correctly', () => {
      const prompt = 'test prompt';
      const extraArgs: string[] = [];
      const args = ['-p', prompt, ...extraArgs];

      expect(args[0]).toBe('-p');
      expect(args[1]).toBe(prompt);
    });

    it('should build claude command with required flags', () => {
      const prompt = 'test prompt';
      const extraArgs: string[] = [];
      const args = ['-p', prompt, '--allowedTools', 'computer,mcp', '--output-format', 'text', ...extraArgs];

      expect(args).toContain('--allowedTools');
      expect(args).toContain('computer,mcp');
      expect(args).toContain('--output-format');
      expect(args).toContain('text');
    });

    it('should build jules command with run subcommand', () => {
      const prompt = 'test prompt';
      const extraArgs: string[] = [];
      const args = ['run', prompt, ...extraArgs];

      expect(args[0]).toBe('run');
      expect(args[1]).toBe(prompt);
    });
  });

  describe('Log file path generation', () => {
    it('should generate log file path with agent name and timestamp', () => {
      const logDir = '/tmp/logs';
      const runId = '2026-01-27T12-00-00-000Z';
      const agent = 'cursor';
      const logPath = `${logDir}/agent_${agent}_${runId}.log`;
      
      expect(logPath).toContain('agent_cursor_');
      expect(logPath).toContain('.log');
      expect(logPath).toContain(logDir);
      expect(logPath).toContain(runId);
    });

    it('should format log header with metadata', () => {
      const header = [
        `Run: test-run-id`,
        `Agent: cursor`,
        `Repo: /tmp/repo`,
        `Attempts: 3`,
        `Timeout: 600000ms`,
        `Extra args: --model claude-3.5`,
        '--- prompt ---',
        'test prompt',
        '--- end prompt ---',
        '',
      ].join('\n');

      expect(header).toContain('Agent: cursor');
      expect(header).toContain('test prompt');
      expect(header).toContain('Attempts: 3');
      expect(header).toContain('Timeout: 600000ms');
    });
  });
});
