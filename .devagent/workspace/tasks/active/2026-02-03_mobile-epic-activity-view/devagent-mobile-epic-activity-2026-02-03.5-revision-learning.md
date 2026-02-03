# Revision Learning – devagent-mobile-epic-activity-2026-02-03.5

**Category**: Process / Tech Architecture  
**Priority**: Medium  
**Issue**: In Node (undici), `new Request(url, { body: urlSearchParams })` fails when `urlSearchParams` comes from a different realm (e.g. Vite bundle’s global), with "Expected init.body to be an instance of URLSearchParams". Vitest tests that use `useFetcher` form submit hit this when the fetcher sends URLSearchParams.  
**Recommendation**: Document in testing-best-practices or ralph-monitoring README: (1) Use `vitest.setup.ts` to patch `globalThis.URLSearchParams` to Node’s and, if needed, wrap `Request` to normalize only URLSearchParams body to string; (2) do not normalize FormData so route actions that use `request.formData()` keep working.  
**Files/Rules Affected**: `apps/ralph-monitoring/vitest.setup.ts`, `ai-rules/testing-best-practices.md` (optional doc update).

Signed: QA Agent — Bug Hunter
