import '@testing-library/jest-dom/vitest';
import { URLSearchParams as NodeURLSearchParams } from 'node:url';

if (typeof globalThis.URLSearchParams !== 'undefined') {
  globalThis.URLSearchParams = NodeURLSearchParams as unknown as typeof URLSearchParams;
}

// Save Node's AbortSignal before jsdom overrides it. Tests that use fetcher/navigation with
// createRoutesStub run in jsdom; when React Router creates a Request it uses global AbortSignal.
// Undici (Node fetch) requires the signal to be an instance of Node's AbortSignal, so we restore
// it in tests that need it (see tasks.$taskId.test.tsx).
if (typeof globalThis.AbortSignal !== 'undefined') {
  (globalThis as unknown as { __NodeAbortSignal?: typeof AbortSignal }).__NodeAbortSignal =
    globalThis.AbortSignal;
}
