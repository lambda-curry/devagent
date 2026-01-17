# Clarified Requirement Packet — Extend Task Metadata for Error Tracking in Execution Loop

- Requestor: Jake Ruesink (Owner)
- Decision Maker: Jake Ruesink (Owner)
- Date: 2026-01-17
- Mode: Task Clarification
- Status: Complete
- Related Task Hub: `.devagent/workspace/tasks/active/2026-01-17_extend-task-metadata-for-error-tracking/`
- Notes: Clarification session in progress. Documenting answers incrementally.

## Task Overview

### Context
- **Task name/slug:** extend-task-metadata-for-error-tracking
- **Business context:** Ralph's execution loop currently tracks task failures by parsing comments from Beads tasks, which requires fetching and parsing all comments for each task during the execution loop. This adds significant overhead. Performance improvement needed to make execution loop more efficient.
- **Stakeholders:** Jake Ruesink (Owner, Decision Maker)
- **Prior work:** 
  - Research completed: `.devagent/workspace/tasks/active/2026-01-17_extend-task-metadata-for-error-tracking/research/2026-01-17_task-metadata-extension-research.md`
  - Issue identified in review: `.devagent/workspace/reviews/2026-01-17_devagent-a8fa-improvements.md`

### Clarification Sessions
- Session 1: 2026-01-17 — Initial clarification (complete)

---

## Clarified Requirements

**Documentation approach:** Filling in sections incrementally as clarification progresses.

---

### Scope & End Goal

**What needs to be done?**
- Create `ralph_execution_metadata` table in Beads SQLite database with schema: `issue_id` (PRIMARY KEY, FK to `issues.id`), `failure_count` (INTEGER DEFAULT 0), `last_failure_at` (DATETIME), `last_success_at` (DATETIME), `execution_count` (INTEGER DEFAULT 0)
- Initialize table on `ralph.ts` startup using `CREATE TABLE IF NOT EXISTS`
- Replace `getTaskFailureCount()` function to use direct SQL query instead of comment parsing
- Create new metadata helper functions: `getTaskMetadata()`, `updateTaskMetadata()`
- Update execution loop to use new metadata functions for failure tracking and blocking logic
- Use `bun:sqlite` for database access (native Bun SQLite)

**What's the end goal architecture or state?**
- Ralph execution loop uses efficient database queries (<1ms) instead of comment parsing (10-50ms+) for failure tracking
- Task failure counts and execution metadata are stored in dedicated table with referential integrity
- Execution loop can make blocking decisions based on metadata without performance overhead
- Metadata persists across Ralph runs and is shared across machines using same database

**In-scope (must-have):**
- Custom `ralph_execution_metadata` table with foreign key to `issues` table
- Table initialization on startup
- Replace comment parsing with database queries
- Failure count tracking and blocking logic using metadata
- Error handling: fail fast if database operations fail (metadata is required)

**Out-of-scope (won't-have):**
- Modifying Beads core schema
- Migration script to populate historical failure counts from comments (lazy migration - records created on first access)
- Integration tests (manual testing only)
- Performance benchmarking (can be done later if needed)

---

### Technical Constraints & Requirements

**Platform/technical constraints:**
- Platform limitations: Bun runtime (TypeScript/Bun)
- Performance requirements: Metadata queries should be <1ms (vs current comment parsing which is 10-50ms+)
- Integration requirements: Must work with Beads SQLite database (`.beads/beads.db`)
- Technology stack: Must not modify Beads core schema; must follow Beads extension patterns

**Architecture requirements:**
- Data architecture: Custom table in same SQLite database with foreign keys to `issues` table

**Quality bars:**
- Error handling: Fail fast - metadata is required, execution should stop if database operations fail
- Testing coverage: Manual testing with real Beads database during development

---

### Dependencies & Blockers

**Technical dependencies:**
- System: Beads SQLite database (`.beads/beads.db`)
- Status: Available
- Owner: Beads project
- Risk: Low - database is already in use

**Blockers or risks:**
- None - all decisions clarified

---

### Implementation Approach

**Implementation strategy:**
- Approach: Create custom `ralph_execution_metadata` table following Beads extension patterns
- Patterns: Foreign key constraints, table initialization on startup (create/verify table exists when `ralph.ts` starts using `CREATE TABLE IF NOT EXISTS`)
- Technology: Use `bun:sqlite` (native Bun SQLite module) for database access
- Integration: Replace `getTaskFailureCount()` function entirely (keep same signature, use database instead) AND create new functions (`getTaskMetadata()`, `updateTaskMetadata()`) for broader metadata operations
- Existing patterns: Follow Beads extension pattern from `.beads/docs/EXTENDING.md`

**Design principles:**
- Architecture principles: Separation of concerns (execution metadata separate from task content), referential integrity via foreign keys
- Error handling: Fail fast - metadata is required, execution should stop if database operations fail

---

### Acceptance Criteria & Verification

**How will we verify this works?**
- Manual testing with real Beads database during development
- Verify table is created correctly on startup
- Verify `getTaskFailureCount()` returns correct values from database
- Verify failure count increments on task failures
- Verify tasks are blocked after MAX_FAILURES (5) failures
- Verify metadata persists across Ralph runs
- Verify performance improvement (subjective - should feel faster than comment parsing)

**What does "done" look like?**
- [ ] `ralph_execution_metadata` table created and initialized on startup
- [ ] `getTaskFailureCount()` uses database query instead of comment parsing
- [ ] New metadata functions (`getTaskMetadata()`, `updateTaskMetadata()`) implemented
- [ ] Execution loop updated to use metadata for failure tracking
- [ ] Blocking logic works correctly based on metadata
- [ ] Manual testing confirms all functionality works
- [ ] Old comment-parsing code removed or deprecated

**Testing approach:**
- Manual testing with real Beads database during development
- Verify metadata operations work correctly in execution loop context
- Test failure count tracking, blocking behavior, and metadata updates

---

## Assumptions Log

| Assumption | Owner | Validation Required | Validation Method | Due Date | Status |
| --- | --- | --- | --- | --- | --- |
| Custom table approach is preferred over storing in Beads notes/design fields | Research | No | Research completed - confirmed | 2026-01-17 | Validated |
| Lazy migration (create records on first access) is acceptable | Clarification | No | Confirmed - records created on first access with defaults | 2026-01-17 | Validated |

---

## Gaps Requiring Research

_None identified - research already completed._

---

## Clarification Session Log

### Session 1: 2026-01-17
**Participants:** Jake Ruesink (Owner)

**Questions Asked:**

**1. SQLite library choice for Ralph's execution loop**
The research shows both `bun:sqlite` (native) and `better-sqlite3` (used in ralph-monitoring) are viable. Which should we use in `ralph.ts`?
→ **Answer:** Use `bun:sqlite` (native Bun SQLite) - transitioning to Bun's native features since this is a Bun app (Jake Ruesink)

**2. Table initialization timing**
When should the `ralph_execution_metadata` table be created?
→ **Answer:** Startup initialization - create/verify table exists when `ralph.ts` starts, before execution loop begins. Table is created once in database (persists), but code ensures it exists on startup using `CREATE TABLE IF NOT EXISTS` (Jake Ruesink)

**3. Error handling for database operations**
If database operations fail (e.g., table creation fails, query fails), what should happen?
→ **Answer:** Fail fast and stop execution (C) - metadata is required to work, so execution should stop if database operations fail (Jake Ruesink)

**4. Testing and verification approach**
How should we verify this works correctly?
→ **Answer:** Manual testing with real Beads database during development (B) (Jake Ruesink)

**5. Integration points in execution loop**
Where exactly in `ralph.ts` should we replace the comment parsing with metadata queries?
→ **Answer:** Both A and B - Replace `getTaskFailureCount()` function entirely (keep same function signature but use database instead) AND create new functions (`getTaskMetadata()`, `updateTaskMetadata()`) and update all call sites (Jake Ruesink)

**Question Tracker:**
- ✅ SQLite library choice - answered: Use `bun:sqlite`
- ✅ Table initialization timing - answered: Startup initialization (create/verify on ralph.ts startup)
- ✅ Error handling approach - answered: Fail fast
- ✅ Testing approach - answered: Manual testing with real Beads database
- ✅ Integration points - answered: Replace getTaskFailureCount() AND create new metadata functions

---

## Next Steps

### Spec Readiness Assessment
**Status:** ✅ Ready for Spec | ⬜ Research Needed | ⬜ More Clarification Needed

**Plan Readiness Assessment:**
- Are critical gaps addressed? ✅ Yes - all implementation decisions clarified
- Are there any blockers that would prevent planning? ✅ No blockers
- Is there enough information to create a plan, or is research needed first? ✅ Yes - research complete, all clarifications answered

**Rationale:**
All critical implementation decisions have been clarified:
- SQLite library: `bun:sqlite` (native)
- Table initialization: Startup (create/verify on ralph.ts start)
- Error handling: Fail fast (metadata is required)
- Testing: Manual testing with real database
- Integration: Replace `getTaskFailureCount()` AND create new metadata functions
- Scope and end goal clearly defined
- Acceptance criteria established

Ready to proceed to planning phase.

---
