/**
 * agents.ts
 *
 * Agent configurations as a simple object map.
 * No classes, no registry, no side-effect imports.
 */

export interface AgentConfig {
  command: string;
  buildArgs: (prompt: string, extraArgs: string[]) => string[];
  failurePatterns?: RegExp[];
  defaultTimeout?: number;
}

export const agents = {
  cursor: {
    command: 'agent',
    buildArgs: (prompt: string, extraArgs: string[]) => {
      const hasModel = extraArgs.some(
        (arg, i) =>
          arg === '--model' ||
          arg === '-m' ||
          (i > 0 && (extraArgs[i - 1] === '--model' || extraArgs[i - 1] === '-m'))
      );
      return [
        '-p',
        ...(hasModel ? [] : ['--model', 'auto']),
        '--output-format',
        'text',
        '--approve-mcps',
        '--force',
        ...extraArgs,
        prompt,
      ];
    },
    failurePatterns: [/Connection stalled/i, /C:\\s*Connection stalled/i],
  },

  claude: {
    command: 'claude',
    buildArgs: (prompt: string, extraArgs: string[]) => [
      '-p',
      prompt,
      '--allowedTools',
      'computer,mcp',
      '--output-format',
      'text',
      ...extraArgs,
    ],
  },

  opencode: {
    command: 'opencode',
    buildArgs: (prompt: string, extraArgs: string[]) => ['-p', prompt, ...extraArgs],
  },

  gemini: {
    command: 'gemini',
    buildArgs: (prompt: string, extraArgs: string[]) => ['-p', prompt, ...extraArgs],
  },

  jules: {
    command: 'jules',
    buildArgs: (prompt: string, extraArgs: string[]) => ['run', '-p', prompt, ...extraArgs],
  },
} as const satisfies Record<string, AgentConfig>;

export type AgentName = keyof typeof agents;

export function getAgent(name: string): AgentConfig | undefined {
  return agents[name as AgentName];
}

export function listAgents(): string[] {
  return Object.keys(agents);
}
