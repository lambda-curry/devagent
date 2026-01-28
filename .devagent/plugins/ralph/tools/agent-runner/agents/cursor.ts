/**
 * cursor.ts
 *
 * Agent definition for Cursor.
 */
import { BaseAgent } from './base';
import { registry } from '../registry';

class CursorAgent extends BaseAgent {
  name = 'cursor';
  command = 'agent';

  buildArgs(prompt: string, extraArgs: string[]): string[] {
    const hasModel = extraArgs.some(
      (arg, i) =>
        arg === '--model' ||
        arg === '-m' ||
        (i > 0 && (extraArgs[i - 1] === '--model' || extraArgs[i - 1] === '-m'))
    );
    const baseArgs = [
      '-p',
      ...(hasModel ? [] : ['--model', 'auto']),
      '--output-format',
      'text',
      '--approve-mcps',
      '--force',
    ];
    return [...baseArgs, ...extraArgs, prompt];
  }

  failurePatterns = [/Connection stalled/i, /C:\\s*Connection stalled/i];
}

registry.register(new CursorAgent());
