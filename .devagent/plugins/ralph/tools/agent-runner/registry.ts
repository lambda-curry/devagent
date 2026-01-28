/**
 * registry.ts
 *
 * Agent registry for discovering and managing agent definitions.
 */
import { AgentDefinition } from './types';

class AgentRegistry {
  private agents: Map<string, AgentDefinition> = new Map();

  register(agent: AgentDefinition): void {
    if (this.agents.has(agent.name)) {
      console.warn(`Agent "${agent.name}" is already registered. Overwriting.`);
    }
    this.agents.set(agent.name, agent);
  }

  get(name: string): AgentDefinition | undefined {
    return this.agents.get(name);
  }

  list(): string[] {
    return Array.from(this.agents.keys());
  }
}

export const registry = new AgentRegistry();
