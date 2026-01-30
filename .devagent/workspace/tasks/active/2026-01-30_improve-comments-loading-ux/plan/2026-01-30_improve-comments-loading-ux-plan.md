# Improve Comments Loading UX Plan

- Owner: Jake Ruesink
- Last Updated: 2026-01-30
- Status: Draft
- Related Task Hub: `.devagent/workspace/tasks/active/2026-01-30_improve-comments-loading-ux/`
- Stakeholders: Jake Ruesink (Developer, Decision Maker)

---

## PART 1: PRODUCT CONTEXT

### Summary
Fix comments loading reliability by replacing the CLI-based approach with direct SQLite database queries. The current implementation spawns `bd comments` CLI which can timeout under load. Since we already have direct SQLite access for tasks, we can use the same pattern for comments - making loading instant and eliminating timeout issues entirely.

### Context & Problem

**Current State:**
Comments are fetched via `bd comments {taskId} --json` CLI command, which spawns an external process. This approach:
1. Has a 5-second timeout that can be exceeded under system load
2. Requires process spawning overhead
3. Is inconsistent with how we fetch tasks (direct SQLite)

**Root Cause:**
The Beads database has a `comments` table that we can query directly:
```sql
CREATE TABLE comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    issue_id TEXT NOT NULL,
    author TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE
);
```

We already use `better-sqlite3` for direct database access to fetch tasks. Using the same pattern for comments would be instant and never timeout.

### Objectives & Success Metrics

| Objective | Success Metric |
|-----------|----------------|
| Eliminate comment loading timeouts | Comments load instantly via direct SQLite query |
| Simplify codebase | Remove CLI spawning and async/timeout handling for comments |
| Consistent data access pattern | Comments use same SQLite access as tasks |

### Solution Principles

1. **Fix the root cause**: Query database directly instead of adding retry workarounds
2. **Keep it simple**: One synchronous function, no timeouts, no retries needed
3. **Consistent patterns**: Match existing task query patterns

### Scope Definition

**In Scope:**
- Add direct SQLite query function for comments
- Update API endpoint to use direct query
- Simplify frontend (remove timeout/error handling complexity)

**Out of Scope:**
- Retry logic (no longer needed)
- Backend CLI timeout optimization
- Real-time comments updates

---

## PART 2: IMPLEMENTATION PLAN

### Scope & Assumptions

- **Scope focus:** Replace CLI-based comments fetching with direct SQLite queries
- **Key assumptions:**
  - Direct SQLite queries are fast enough to be synchronous in the loader
  - The `comments` table schema matches what the CLI returns
- **Out of scope:** Retry logic, caching, WebSocket integration

### Implementation Tasks

#### Task 1: Add Direct SQLite Query for Comments

- **Objective:** Create a function that queries the `comments` table directly instead of spawning `bd comments` CLI
- **Impacted Modules/Files:**
  - `apps/ralph-monitoring/app/db/beads.server.ts` — Add `getTaskCommentsDirect()` function
- **Dependencies:** None
- **Acceptance Criteria:**
  - Function queries `comments` table directly via `better-sqlite3`
  - Returns same `BeadsComment[]` format as existing functions
  - Normalizes text with `normalizeBeadsMarkdownText()`
  - Returns empty array if database unavailable (graceful degradation)
- **Testing Criteria:**
  - Unit test: Verify comments are returned for valid task ID
  - Unit test: Verify empty array for non-existent task
  - Unit test: Verify text normalization is applied

**Implementation:**
```typescript
export function getTaskCommentsDirect(taskId: string): BeadsComment[] {
  const database = getDatabase();
  if (!database) return [];

  try {
    const stmt = database.prepare(`
      SELECT text AS body, created_at
      FROM comments
      WHERE issue_id = ?
      ORDER BY created_at ASC
    `);

    const results = stmt.all(taskId) as Array<{ body: string; created_at: string }>;
    return results.map(row => ({
      body: normalizeBeadsMarkdownText(row.body),
      created_at: row.created_at,
    }));
  } catch (error) {
    console.error('Failed to query comments:', error);
    return [];
  }
}
```

#### Task 2: Update Task Detail Route to Use Direct Query

- **Objective:** Replace lazy-loaded comments fetching with direct loader query
- **Impacted Modules/Files:**
  - `apps/ralph-monitoring/app/routes/tasks.$taskId.tsx` — Use direct query in loader
  - `apps/ralph-monitoring/app/routes/api.tasks.$taskId.comments.ts` — May be removed or simplified
- **Dependencies:** Task 1
- **Acceptance Criteria:**
  - Comments loaded in server loader (not client-side fetch)
  - Remove complex client-side loading state management
  - Remove timeout handling and retry logic
  - Page still renders quickly (SQLite query is fast)
- **Testing Criteria:**
  - Verify comments display on task detail page
  - Verify no loading spinner needed (instant load)
  - Verify existing tests pass

**Implementation approach:**
1. Import `getTaskCommentsDirect` in the loader
2. Add `comments` to loader return data
3. Remove `clientLoader`, `useState` for comments, `useEffect` for fetching
4. Simplify component to just render `<Comments comments={loaderData.comments} />`

#### Task 3: Cleanup and Verification

- **Objective:** Remove unused code and verify everything works
- **Impacted Modules/Files:**
  - `apps/ralph-monitoring/app/routes/tasks.$taskId.tsx` — Remove unused imports/state
  - `apps/ralph-monitoring/app/routes/api.tasks.$taskId.comments.ts` — Consider removal
  - `apps/ralph-monitoring/app/db/beads.server.ts` — Keep old functions for backwards compatibility or remove if unused
- **Dependencies:** Task 2
- **Acceptance Criteria:**
  - No unused imports or dead code
  - All tests pass
  - Typecheck passes
  - Comments load reliably without timeouts
- **Testing Criteria:**
  - Run full test suite
  - Run typecheck
  - Manual verification in browser

---

## Risks & Open Questions

| Item | Type | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Synchronous DB query in loader | Risk | Jake | SQLite queries are fast; monitor if issues arise | During implementation |
| API endpoint may be used elsewhere | Question | Jake | Search codebase for usages before removing | Task 3 |

---

## Progress Tracking

Refer to the AGENTS.md file in the task directory for instructions on tracking and reporting progress during implementation.

---

## Appendices & References

- **Task Hub:** `.devagent/workspace/tasks/active/2026-01-30_improve-comments-loading-ux/AGENTS.md`
- **Current implementation:** `apps/ralph-monitoring/app/routes/tasks.$taskId.tsx`
- **Database access:** `apps/ralph-monitoring/app/db/beads.server.ts`
- **Comments table schema:** `SELECT * FROM comments` in `.beads/beads.db`
