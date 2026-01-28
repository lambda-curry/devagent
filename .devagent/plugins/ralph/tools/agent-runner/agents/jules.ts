/**
 * jules.ts
 *
 * Agent definition for Jules.
 */
import { BaseAgent } from './base';
import { registry } from '../registry';

class JulesAgent extends BaseAgent {
  name = 'jules';
  command = 'jules';

  buildArgs(prompt: string, extraArgs: string[]): string[] {
    return ['run', prompt, ...extraArgs];
  }
}

registry.register(new JulesAgent());
