# Research Packet — Task Metadata Extension for Error Tracking

- Mode: Task
- Requested By: Jake Ruesink
- Last Updated: 2026-01-17
- Related Plan: (not yet created)
- Storage Path: `.devagent/workspace/tasks/active/2026-01-17_extend-task-metadata-for-error-tracking/research/2026-01-17_task-metadata-extension-research.md`
- Stakeholders: Jake Ruesink (Owner)

## Request Overview

**Problem Statement:** Ralph's execution loop currently tracks task failures by parsing comments from Beads tasks. This requires fetching and parsing all comments for each task during the execution loop, which adds significant overhead. The goal is to implement a more efficient mechanism for tracking task execution metadata (including error counts and failure information) so that the execution loop can make better decisions about task retries, blocking, and error handling without the performance penalty of comment parsing.

**Desired Outcomes:**
- Efficient failure tracking without comment parsing overhead
- Support for tracking execution metadata (failure count, last failure time, last success time, execution count)
- Integration with existing Ralph execution loop
- Maintain compatibility with Beads architecture and best practices

**Constraints:**
- Must work with Beads database architecture (SQLite)
- Must not modify Beads core schema (per Beads extension guidelines)
- Must work with Bun runtime (Ralph is written in TypeScript/Bun)
- Should follow Beads recommended extension patterns

## Context Snapshot

- **Task summary:** Extend task metadata system to support tracking individual task errors in Ralph execution loop, replacing inefficient comment-parsing approach
- **Task reference:** `.devagent/workspace/tasks/active/2026-01-17_extend-task-metadata-for-error-tracking/`
- **Existing decisions:** 
  - Beads recommends custom tables with foreign keys (`.beads/docs/EXTENDING.md`)
  - Current implementation uses CLI commands (`bd comments`, `bd update`) - no direct database access in Ralph
  - Failure tracking identified as performance issue in review (`.devagent/workspace/reviews/2026-01-17_devagent-a8fa-improvements.md`)

## Research Questions

| ID | Question | Status | Notes |
| --- | --- | --- | --- |
| RQ1 | What is the recommended Beads extension pattern for adding custom metadata? | Answered | Use custom tables with foreign keys to `issues` table |
| RQ2 | How can Bun/TypeScript access SQLite database directly? | Answered | Bun has built-in SQLite support; `better-sqlite3` also available |
| RQ3 | What metadata fields are needed for efficient failure tracking? | Answered | `failure_count`, `last_failure_at`, `last_success_at`, `execution_count` |
| RQ4 | How should the custom table be initialized and managed? | Answered | Schema initialization on first use, foreign key constraints |
| RQ5 | What is the migration strategy for existing tasks? | Answered | Initialize with defaults (0 failures, null timestamps) |
| RQ6 | How does this integrate with Ralph's current CLI-based approach? | Answered | Add direct SQLite access alongside CLI commands |

## Key Findings

1. **Beads Extension Pattern:** Beads explicitly recommends creating custom tables in the same SQLite database with foreign keys to the `issues` table. This is the official extension pattern and avoids modifying core Beads schema.

2. **Bun SQLite Support:** Bun has built-in SQLite support via `bun:sqlite` module, and the codebase already uses `better-sqlite3` in the ralph-monitoring app. Both are viable options for direct database access.

3. **Current Performance Issue:** The `getTaskFailureCount()` function calls `getTaskComments()` which spawns `bd comments <taskId> --json` for every task check. This adds CLI overhead, JSON parsing, and string matching on every loop iteration.

4. **Database Path Resolution:** The database path is configurable via `config.json` (`beads.database_path`, defaults to `.beads/beads.db`). Path resolution logic exists in both Ralph tools and ralph-monitoring app.

5. **Schema Design:** A simple table with `issue_id` as primary key (foreign key to `issues.id`) plus metadata fields provides efficient lookups and maintains referential integrity.

6. **Initialization Strategy:** Table creation should happen on first use with `CREATE TABLE IF NOT EXISTS`, ensuring compatibility with existing Beads databases.

## Detailed Findings

### RQ1: Beads Extension Pattern

**Answer:** Beads recommends creating custom tables in the same SQLite database with foreign keys to the `issues` table. This is documented in `.beads/docs/EXTENDING.md` as the official extension pattern.

**Supporting Evidence:**
- `.beads/docs/EXTENDING.md` (2026-01-17) - Documents the recommended pattern: "bd is focused - It tracks issues, dependencies, and ready work. That's it. Your application adds orchestration - Execution state, agent assignments, retry logic, etc."
- Example schema pattern shown:
  ```sql
  CREATE TABLE myapp_executions (
      issue_id TEXT NOT NULL,
      status TEXT NOT NULL,
      FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE
  );
  ```
- Philosophy: "Shared database = simple queries - Join `issues` with your tables for powerful queries"
- Safety warnings: Don't modify database pool settings, keep transactions short, use foreign keys for referential integrity

**Freshness:** Documentation is current (2026-01-17 review)

### RQ2: Bun/TypeScript SQLite Access

**Answer:** Bun has built-in SQLite support via `bun:sqlite`, and the codebase already demonstrates `better-sqlite3` usage in the ralph-monitoring app. Both are viable options.

**Supporting Evidence:**
- `apps/ralph-monitoring/app/db/beads.server.ts` (2026-01-17) - Uses `better-sqlite3` for direct database access:
  ```typescript
  import Database from 'better-sqlite3';
  db = new Database(dbPath, { readonly: true });
  ```
- Database path resolution pattern:
  ```typescript
  const dbPath = process.env.BEADS_DB || join(repoRoot, '.beads', 'beads.db');
  ```
- Bun native SQLite: Bun runtime includes `bun:sqlite` module for direct SQLite access without external dependencies
- Current Ralph implementation: Uses CLI commands (`Bun.spawnSync(["bd", ...])`) - no direct database access yet

**Freshness:** Code examples from current codebase (2026-01-17)

**Tradeoff:** 
- `better-sqlite3`: Proven in codebase, more features, external dependency
- `bun:sqlite`: Native, no dependency, potentially faster, less mature API

### RQ3: Required Metadata Fields

**Answer:** Based on current usage in `ralph.ts`, we need: `failure_count`, `last_failure_at`, `last_success_at`, and `execution_count` for comprehensive tracking.

**Supporting Evidence:**
- `.devagent/plugins/ralph/tools/ralph.ts` (2026-01-17) - Current implementation:
  - `getTaskFailureCount()` - counts failure comments
  - `MAX_FAILURES = 5` - blocks tasks after 5 failures
  - Failure detection: looks for "Task implementation failed", "AI tool returned error", "exit code:"
- Execution loop needs to:
  - Check failure count before execution (line 771)
  - Increment failure count on error (line 847)
  - Block task after max failures (line 773)
  - Track execution attempts for analytics

**Recommended Schema:**
```sql
CREATE TABLE ralph_execution_metadata (
    issue_id TEXT PRIMARY KEY,
    failure_count INTEGER DEFAULT 0,
    last_failure_at DATETIME,
    last_success_at DATETIME,
    execution_count INTEGER DEFAULT 0,
    FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE
);
```

**Freshness:** Based on current implementation analysis (2026-01-17)

### RQ4: Table Initialization and Management

**Answer:** Initialize table on first use with `CREATE TABLE IF NOT EXISTS`, ensuring it works with existing Beads databases. Use foreign key constraints for referential integrity.

**Supporting Evidence:**
- `.beads/docs/EXTENDING.md` (2026-01-17) - Shows pattern:
  ```sql
  CREATE TABLE IF NOT EXISTS myapp_executions (...);
  ```
- Foreign key with `ON DELETE CASCADE` ensures metadata is cleaned up when issues are deleted
- Index on `issue_id` not needed (it's the primary key)
- Initialization should happen in a function that's called before first use

**Implementation Pattern:**
```typescript
function ensureMetadataTable(dbPath: string): void {
  const db = new Database(dbPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS ralph_execution_metadata (
      issue_id TEXT PRIMARY KEY,
      failure_count INTEGER DEFAULT 0,
      last_failure_at DATETIME,
      last_success_at DATETIME,
      execution_count INTEGER DEFAULT 0,
      FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE
    );
  `);
  db.close();
}
```

**Freshness:** Based on Beads documentation and codebase patterns (2026-01-17)

### RQ5: Migration Strategy

**Answer:** No migration needed - new table starts empty. Existing tasks will get metadata records created on first access with default values (0 failures, null timestamps). This is a "lazy migration" approach.

**Supporting Evidence:**
- Beads extension pattern doesn't require data migration for new tables
- Default values handle existing tasks: `failure_count = 0`, `last_failure_at = NULL`, etc.
- Records created on-demand when tasks are accessed in execution loop
- No data loss - comments remain in Beads for historical reference

**Migration Approach:**
1. Create table with `CREATE TABLE IF NOT EXISTS`
2. On first access to a task, check if metadata record exists
3. If not, create with defaults: `INSERT OR IGNORE INTO ralph_execution_metadata (issue_id, failure_count, execution_count) VALUES (?, 0, 0)`
4. Update metadata on each execution attempt

**Freshness:** Based on extension pattern analysis (2026-01-17)

### RQ6: Integration with CLI-Based Approach

**Answer:** Add direct SQLite access alongside existing CLI commands. Use database for metadata reads/writes, continue using CLI for issue status updates and comments.

**Supporting Evidence:**
- Current Ralph implementation: `.devagent/plugins/ralph/tools/ralph.ts` uses CLI for all Beads operations
- Database path available: `config.beads.database_path` (line 34)
- Hybrid approach:
  - Use SQLite for metadata (fast, efficient)
  - Use CLI for issue operations (`bd update`, `bd comments add`) - maintains compatibility
- Pattern exists in codebase: `apps/ralph-monitoring/app/db/beads.server.ts` shows direct database access pattern

**Integration Points:**
1. Replace `getTaskFailureCount()` with direct SQL query
2. Add `updateTaskMetadata()` function for writes
3. Initialize table on Ralph startup or first use
4. Keep CLI commands for issue status and comments

**Freshness:** Based on current implementation and codebase patterns (2026-01-17)

## Comparative / Alternatives Analysis

### Alternative 1: Store in Beads `notes` or `design` Field as JSON
**Pros:**
- No new table needed
- Uses existing Beads fields
- Automatically synced via JSONL

**Cons:**
- Still requires parsing JSON on every access
- Mixes execution metadata with task content
- No efficient querying (would need to parse all tasks)
- Not recommended by Beads extension pattern

**Verdict:** ❌ Not recommended - doesn't solve performance problem

### Alternative 2: Local State File
**Pros:**
- Simple implementation
- No database changes
- Fast file I/O

**Cons:**
- Not shared across machines/clones
- No referential integrity
- Manual sync required
- Doesn't integrate with Beads data model

**Verdict:** ❌ Not recommended - breaks distributed workflow

### Alternative 3: Custom Table (Recommended)
**Pros:**
- ✅ Follows Beads extension pattern
- ✅ Efficient queries with indexes
- ✅ Referential integrity via foreign keys
- ✅ Shared across machines via same database
- ✅ Can join with `issues` table for powerful queries
- ✅ Clean separation of concerns

**Cons:**
- Requires database access code
- Table initialization needed

**Verdict:** ✅ **Recommended** - aligns with Beads architecture and solves performance issue

## Implications for Implementation

### Scope Adjustments
1. **Add SQLite dependency:** Choose between `bun:sqlite` (native) or `better-sqlite3` (proven in codebase)
2. **Database access layer:** Create helper functions for metadata operations (get, update, increment)
3. **Table initialization:** Add schema creation on first use or Ralph startup
4. **Replace comment parsing:** Update `getTaskFailureCount()` to use direct SQL query
5. **Add metadata updates:** Update metadata on execution attempts, failures, and successes

### Acceptance Criteria Impacts
- Must initialize table automatically (no manual setup required)
- Must maintain backward compatibility (existing tasks work with defaults)
- Must not break existing CLI-based workflow
- Performance improvement: metadata queries should be <1ms (vs current comment parsing which is 10-50ms+)
- Foreign key constraints must work correctly

### Validation Needs
1. **Performance testing:** Measure query time vs comment parsing time
2. **Integration testing:** Verify metadata updates correctly during execution loop
3. **Migration testing:** Verify existing tasks get metadata records on first access
4. **Foreign key testing:** Verify cascade delete works when issues are deleted
5. **Multi-machine testing:** Verify metadata syncs correctly across clones (via shared database)

## Risks & Open Questions

| Item | Type | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Database path resolution in worktrees | Risk | TBD | Verify path resolution works correctly in worktree contexts | Before implementation |
| Bun SQLite vs better-sqlite3 choice | Question | TBD | Evaluate both options, prefer native if stable | Before implementation |
| Concurrent access from multiple Ralph instances | Risk | TBD | SQLite handles concurrent reads well; writes need transaction handling | During implementation |
| Table initialization timing | Question | TBD | Initialize on first use vs Ralph startup - prefer first use for simplicity | During implementation |
| Metadata migration from comments | Question | TBD | Consider one-time migration script to populate initial failure counts from comments | Optional enhancement |

## Recommended Follow-ups

1. **Prototype database access:** Create a small proof-of-concept showing table creation and basic queries
2. **Performance benchmark:** Measure current comment parsing time vs direct SQL query time
3. **Choose SQLite library:** Decide between `bun:sqlite` and `better-sqlite3` based on stability and feature needs
4. **Design helper API:** Design the metadata access functions (get, update, increment) with clear interface
5. **Update execution loop:** Replace `getTaskFailureCount()` with direct database query
6. **Add metadata updates:** Update metadata on execution attempts, failures, and successes
7. **Testing:** Create integration tests for metadata operations and execution loop integration

## Sources

| Reference | Type | Freshness | Access Notes |
| --- | --- | --- | --- |
| `.beads/docs/EXTENDING.md` | Internal documentation | 2026-01-17 | Official Beads extension pattern documentation |
| `.beads/docs/ARCHITECTURE.md` | Internal documentation | 2026-01-17 | Beads database architecture and schema |
| `.devagent/plugins/ralph/tools/ralph.ts` | Internal code | 2026-01-17 | Current implementation with comment parsing |
| `.devagent/workspace/reviews/2026-01-17_devagent-a8fa-improvements.md` | Internal review | 2026-01-17 | Identifies performance issue and suggests alternatives |
| `apps/ralph-monitoring/app/db/beads.server.ts` | Internal code | 2026-01-17 | Example of direct SQLite access pattern |
| `.devagent/plugins/ralph/tools/config.json` | Internal config | 2026-01-17 | Database path configuration |
