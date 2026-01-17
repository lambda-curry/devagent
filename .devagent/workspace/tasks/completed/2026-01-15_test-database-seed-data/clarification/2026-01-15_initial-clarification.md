# Clarified Requirement Packet — Test Database Seed Data Setup

- Requestor: Jake Ruesink
- Decision Maker: Jake Ruesink
- Date: 2026-01-15
- Mode: Task Clarification
- Status: Complete
- Related Task Hub: `.devagent/workspace/tasks/completed/2026-01-15_test-database-seed-data/`
- Notes: Clarification session in progress. Documenting requirements incrementally.

## Task Overview

### Context
- **Task name/slug:** test-database-seed-data
- **Business context:** Need to set up seed data for testing the ralph-monitoring app without affecting the actual beads database. This will enable safe testing of database queries, task filtering, status updates, and other database operations.
- **Stakeholders:** Jake Ruesink (Owner, Decision Maker)
- **Prior work:** 
  - Research completed: `research/2026-01-15_test-database-seed-data-research.md`
  - Research covers database creation patterns, schema initialization, seed data strategies, test integration patterns, and recommended implementation approach

### Clarification Sessions
- Session 1: 2026-01-15 — Initial clarification (in progress)

---

## Clarified Requirements

**Documentation approach:** Fill in sections incrementally as clarification progresses.

---

### Scope & End Goal

**What needs to be done?**
Create test database utilities, seed data functions, update existing tests to use them, and add new logical test scenarios. Keep scope simple and focused on logical test flows rather than exhaustive coverage.

**What's the end goal architecture or state?**
- Test database utilities in `app/lib/test-utils/testDatabase.ts`
- Seed data scenarios in `app/db/__tests__/seed-data.ts`
- Updated `beads.server.test.ts` using test database with seed data
- New logical test scenarios covering core query patterns
- Simple, maintainable approach without over-engineering

**In-scope (must-have):**
- Create test database utilities (`testDatabase.ts`)
- Create seed data scenarios (focused on logical test flows)
- Update `beads.server.test.ts` to use test database
- Add logical test scenarios for core query patterns

**Out-of-scope (won't-have):**
- Exhaustive test coverage (keep it simple)
- Complex test scenarios beyond logical flows
- Over-engineering the solution

**Nice-to-have (could be deferred):**
- Additional test scenarios beyond core patterns
- Performance optimizations (if not needed initially)

---

### Technical Constraints & Requirements

**Platform/technical constraints:**
- Technology stack: better-sqlite3, Vitest, TypeScript
- Integration requirements: Must work with existing `beads.server.ts` functions

**Architecture requirements:**
- Test isolation: Each test should have isolated database state
- Performance: Should not significantly slow down test suite

**Quality bars:**
- Testing coverage: Should enable comprehensive testing of all query patterns

---

### Dependencies & Blockers

**Technical dependencies:**
- better-sqlite3: Available
- Vitest: Available
- Existing `beads.server.ts`: Available (may need modification for dependency injection)

**Blockers or risks:**
_To be clarified_

---

### Implementation Approach

**Implementation strategy:**
- Research recommends: File-based test database, TypeScript seed functions, template database pattern
- Location: `app/lib/test-utils/testDatabase.ts` per cursor rule guidance
- Database injection: Use environment variable override (`BEADS_DB`) for simplicity (quick solution)
- Test scenarios: Start with core scenarios (status filtering, basic queries) — expand later as needed

**Design principles:**
- Follow cursor rule patterns from `.cursor/rules/testing-best-practices.mdc`
- Maintain test isolation
- Enable repeatable test scenarios
- Keep it simple — avoid over-engineering

---

### Acceptance Criteria & Verification

**How will we verify this works?**
- Test database utilities can create isolated test databases
- Seed data functions can populate test databases with core scenarios
- Existing `beads.server.test.ts` tests pass using test database
- New logical test scenarios verify core query patterns (status filtering, basic queries)

**What does "done" look like?**
- [ ] `app/lib/test-utils/testDatabase.ts` created with database creation utilities
- [ ] `app/db/__tests__/seed-data.ts` created with core seed data scenarios
- [ ] `beads.server.test.ts` updated to use test database with seed data
- [ ] Core test scenarios added (status filtering, basic queries)
- [ ] All tests pass
- [ ] Simple, maintainable solution (no over-engineering)

**Testing approach:**
- Unit tests for test database utilities
- Integration tests using test database with seed data
- Core scenarios: status filtering, basic queries
- Additional scenarios can be added later as needed

---

## Assumptions Log

| Assumption | Owner | Validation Required | Validation Method | Due Date | Status |
| --- | --- | --- | --- | --- | --- |

---

## Gaps Requiring Research

_None identified yet - research already completed_

---

## Clarification Session Log

### Session 1: 2026-01-15
**Participants:** Jake Ruesink

**Questions Asked:**

**1. What's the primary scope for this task?**
  → **Answer: D** - Create utilities + seed data + update tests + add new comprehensive test scenarios, but keep it simple with logical test flows rather than exhaustive coverage (Jake Ruesink)

**2. Which test scenarios are must-have for the initial implementation?**
  → **Answer: B** - Just the core scenarios (status filtering, basic queries) — others can be added later (Jake Ruesink)

**3. How should we handle the `beads.server.ts` modification for test database injection?**
  → **Answer: B** - Use environment variable override (`BEADS_DB`) — quick solution, preferred for simplicity (Jake Ruesink)
  → Note: Initially considered A (dependency injection) but prefer B for simplicity

**Unresolved Items:**
_None - all critical gaps addressed_

---

## Next Steps

### Spec Readiness Assessment
**Status:** ✅ Ready for Plan

**Plan Readiness Assessment:**
- ✅ Critical gaps addressed: Scope, approach, test scenarios, and acceptance criteria are clear
- ✅ No blockers: All dependencies are available (better-sqlite3, Vitest, existing code)
- ✅ Research complete: Comprehensive research packet available with implementation patterns
- ✅ Requirements clear: Simple, focused approach with clear boundaries

**Rationale:**
All critical requirements have been clarified:
- **What needs to be done:** Create test database utilities, seed data, update tests, add core test scenarios
- **How to do it:** File-based test database, TypeScript seed functions, env var override for injection, core scenarios only
- **How to verify it:** Clear acceptance criteria with checklist of deliverables

The approach is intentionally simple to avoid over-engineering. Research provides detailed implementation patterns. Ready to proceed to planning phase.

### Recommended Actions

**Ready for plan:**
- [x] Hand validated requirement packet to `devagent create-plan`
- [x] Provide link to this clarification packet: `.devagent/workspace/tasks/completed/2026-01-15_test-database-seed-data/clarification/2026-01-15_initial-clarification.md`
- [x] Highlight key decisions:
  - Simple approach preferred (avoid over-engineering)
  - Core test scenarios only (status filtering, basic queries)
  - Environment variable override for database injection (simplest solution)
  - Full implementation scope but kept focused on logical test flows

---
