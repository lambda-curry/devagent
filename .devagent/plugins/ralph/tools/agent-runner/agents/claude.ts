/**
 * claude.ts
 *
 * Agent definition for Claude.
 */
import { BaseAgent } from './base';
import { registry } from '../registry';

class ClaudeAgent extends BaseAgent {
  name = 'claude';
  command = 'claude';

  buildArgs(prompt: string, extraArgs: string[]): string[] {
    return [
      '-p',
      prompt,
      '--allowedTools',
      'computer,mcp',
      '--output-format',
      'text',
      ...extraArgs,
    ];
  }
}

registry.register(new ClaudeAgent());
