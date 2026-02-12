**Commit:** 4101824e - fix(tests): use jsdom-node-abort env so fetcher tests pass in jsdom

**Summary:**
- Root cause: In jsdom, React Router's fetcher builds a Request using the global AbortController. Node's fetch (undici) only accepts its own AbortSignal, so it threw "RequestInit: Expected signal to be an instance of AbortSignal".
- Fix: Added custom Vitest environment `jsdom-node-abort` that runs the built-in jsdom setup then overwrites the test global's AbortController/AbortSignal with Node's. Both previously failing tests now use this env and pass.
- Implementation: New local package `vitest-environment-jsdom-node-abort` (dynamic-import of vitest/environments inside setup() to avoid "Vitest failed to access its internal state"); LoopControlPanel.test.tsx and storybook router.test.tsx use `@vitest-environment jsdom-node-abort`.

**Verification:** `bun run vitest run app/components/__tests__/LoopControlPanel.test.tsx app/lib/storybook/__tests__/router.test.tsx` — 10 tests passed.

**Revision Learning:**
- **Category:** Process
- **Priority:** Low
- **Issue:** Custom Vitest environments must not import from `vitest` at module load time (triggers "Vitest failed to access its internal state"); use dynamic `import('vitest/environments')` inside `setup()`.
- **Recommendation:** Document in testing docs or vitest-environment-jsdom-node-abort README.
- **Files/Rules Affected:** vitest-environment-jsdom-node-abort/index.ts

Signed: Engineering Agent — Code Wizard
