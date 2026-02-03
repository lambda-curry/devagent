## QA Verification: Aggregate Epic Activity Data

**Scope:** Task devagent-mobile-epic-activity-2026-02-03.1 (closed). Branch: `codex/2026-02-03-mobile-epic-activity-view`.

### What was verified (pass)

1. **Unified activity list returns correct types (execution, comment, status)**  
   - `app/utils/__tests__/epic-activity.server.test.ts`: `getEpicActivity` returns items with `type: 'execution' | 'comment' | 'status'`.  
   - Test "returns unified list ordered by timestamp descending" asserts all three types and ordering.

2. **Commit comment parsing extracts sha + message**  
   - `parseCommitComment` tests: first line `Commit: <sha> - <message>` yields `{ sha, message }`; trim, multi-segment sha, null for empty/non-match.  
   - Test "parses commit comments into structured commit field" asserts comment items get `commit: { sha, message }`.

3. **Ordering is most recent first**  
   - Test "returns unified list ordered by timestamp descending": status (11:30) > comment (11:00) > execution (10:00).  
   - Implementation uses `all.sort((a, b) => tb.localeCompare(ta))`.

4. **Graceful handling of missing execution log table**  
   - `getExecutionLogs` in `app/db/beads.server.ts` catches "ralph_execution_log" / "no such table" and returns `[]`.  
   - Epic-activity test "handles missing execution logs gracefully (empty array)" mocks `getExecutionLogs` → `[]` and asserts non-execution items still returned.

5. **Empty states (no comments, no logs)**  
   - Test "handles empty comments gracefully": all three sources mocked empty → `getEpicActivity` returns `[]`.

### Commands run

- `bun run vitest run app/utils/__tests__/epic-activity.server.test.ts` → **10 passed (10)**.
- `bun run test --filter=ralph-monitoring` → 3 test files failed (unrelated); epic-activity tests passed.
- `bun run typecheck --filter=ralph-monitoring` → failed (Comments.tsx, settings.projects.tsx — not epic-activity).
- `bun run lint --filter=ralph-monitoring` → 1 warning (settings.projects.tsx — not epic-activity).

### Evidence

- Implementation: `apps/ralph-monitoring/app/utils/epic-activity.server.ts`, `app/db/beads.types.ts`, `app/db/beads.server.ts` (getExecutionLogs).
- Tests: `apps/ralph-monitoring/app/utils/__tests__/epic-activity.server.test.ts` (10 tests, all pass).

### Blocker

Full project quality gates (typecheck, lint, full test suite) do not pass due to **pre-existing** failures outside epic activity code. Blocker task created: **devagent-mobile-epic-activity-2026-02-03.5** (Fix ralph-monitoring typecheck, lint, and failing tests). This QA task depends on it; leaving status **open** until blocker is closed.

Signed: QA Agent — Bug Hunter
