/**
 * base.ts
 *
 * Base class for agent definitions.
 */
import { AgentDefinition } from '../types';

export abstract class BaseAgent implements AgentDefinition {
  abstract name: string;
  abstract command: string;

  buildArgs(prompt: string, extraArgs: string[]): string[] {
    return ['-p', prompt, ...extraArgs];
  }

  failurePatterns?: RegExp[] = [];
  defaultTimeout = 600000; // 10 minutes
}
