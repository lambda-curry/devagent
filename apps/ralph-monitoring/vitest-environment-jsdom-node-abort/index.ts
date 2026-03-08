/**
 * Custom Vitest environment: jsdom with Node's AbortController/AbortSignal.
 * React Router's fetcher uses Request; Node's fetch (undici) requires the signal
 * to be an instance of Node's AbortSignal. JSDOM provides its own AbortSignal,
 * so we override the jsdom global with Node's after setup.
 *
 * We dynamic-import 'vitest' inside setup() so this package can be loaded by
 * Vitest's environment loader without triggering "Vitest failed to access its internal state".
 */
import type { Environment } from 'vitest';

const NodeAbortController = globalThis.AbortController;
const NodeAbortSignal = globalThis.AbortSignal;

export default {
  name: 'jsdom-node-abort',
  transformMode: 'web' as const,
  async setup(global: typeof globalThis, options: Record<string, unknown>) {
    const { builtinEnvironments } = await import('vitest/environments');
    const jsdomEnv = builtinEnvironments.jsdom;
    const result = await jsdomEnv.setup(global, options);
    global.AbortController = NodeAbortController;
    global.AbortSignal = NodeAbortSignal;
    return result;
  },
} satisfies Environment;
