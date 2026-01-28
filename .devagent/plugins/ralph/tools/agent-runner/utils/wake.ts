/**
 * wake.ts
 *
 * Wake notification for Clawdbot.
 */

export interface WakeResult {
  sent: boolean;
  error?: string;
}

/**
 * Sends a wake notification to Clawdbot.
 * @param text The message to send.
 * @returns A result object indicating success or failure.
 */
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

/**
 * Truncates the tail of a string.
 * @param s The string to truncate.
 * @param n The number of characters to keep.
 * @returns The truncated string.
 */
export function truncateTail(s: string, n: number): string {
  if (n <= 0) return '';
  if (s.length <= n) return s;
  return '…(truncated)…\n' + s.slice(s.length - n);
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

  const base = `${agent} Agent ${
    status === 'success' ? 'succeeded' : 'FAILED'
  } on attempt ${attempt}/${totalAttempts}. Log: ${logPath}`;
  const outputTail = truncateTail(output.trim(), wakeOutputChars);
  return outputTail ? `${base}\n\n--- output (tail) ---\n${outputTail}` : base;
}
