Revision Learning:
**Category**: Process
**Priority**: Low
**Issue**: Settings route action returns `data()` with a shape that TypeScript infers as `{ ok: boolean; intent: string }` without `error`, so component code had to use `'error' in addFetcher.data` and cast to access error message.
**Recommendation**: When returning error payloads from actions, consider a discriminated union type (e.g. `{ ok: true; id?: string } | { ok: false; error: string }`) and export it so fetcher consumers get correct inference.
**Files/Rules Affected**: apps/ralph-monitoring/app/routes/settings.projects.tsx

Signed: Engineering Agent — Code Wizard
