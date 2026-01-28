/**
 * opencode.ts
 *
 * Agent definition for OpenCode.
 */
import { BaseAgent } from './base';
import { registry } from '../registry';

class OpenCodeAgent extends BaseAgent {
  name = 'opencode';
  command = 'opencode';
}

registry.register(new OpenCodeAgent());
