/**
 * gemini.ts
 *
 * Agent definition for Gemini.
 */
import { BaseAgent } from './base';
import { registry } from '../registry';

class GeminiAgent extends BaseAgent {
  name = 'gemini';
  command = 'gemini';
}

registry.register(new GeminiAgent());
