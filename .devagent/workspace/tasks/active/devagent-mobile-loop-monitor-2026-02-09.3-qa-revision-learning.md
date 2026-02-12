Revision Learning:
**Category**: Rules
**Priority**: Low
**Issue**: EventSource global mock in jsdom tests must satisfy TypeScript's constructor type (static CONNECTING, OPEN, CLOSED). A plain vi.fn() mock causes typecheck failure.
**Recommendation**: When replacing globalThis.EventSource in tests, use Object.assign(mockImpl, { CONNECTING: 0, OPEN: 1, CLOSED: 2 }) as typeof EventSource so the mock is assignable to the global.
**Files/Rules Affected**: apps/ralph-monitoring/app/routes/__tests__/epics.$epicId.live.test.tsx

Signed: QA Agent — Bug Hunter
