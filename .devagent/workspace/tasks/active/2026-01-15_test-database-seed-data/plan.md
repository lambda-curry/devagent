# Implementation Plan - Test Database Seed Data Setup

- **Task:** Test Database Seed Data Setup
- **Status:** Proposed
- **Owner:** Jake Ruesink
- **Date:** 2026-01-15

## 1. Overview

This plan outlines the implementation of a test database setup for the `ralph-monitoring` app. The goal is to enable safe, reliable, and isolated testing of database operations without affecting the production Beads database. We will use `better-sqlite3` to create a file-based test database populated with seed data using TypeScript functions. Test isolation will be achieved using a template database pattern where a fresh database is created (or copied) for each test. The database path will be injected into the application using the `BEADS_DB` environment variable override.

## 2. User Stories & Requirements

- **US1:** As a developer, I want a set of utilities to easily create and tear down a test database so that my tests are isolated and reliable.
- **US2:** As a developer, I want predefined seed data scenarios (e.g., tasks with different statuses, priorities) so that I can test common query patterns without manually creating data for every test.
- **US3:** As a developer, I want to verify that `getAllTasks` correctly filters by status, priority, and search terms using realistic data.

**Requirements:**
- **Utilities:** Create `app/lib/test-utils/testDatabase.ts` to handle DB creation, schema initialization, and cleanup.
- **Seed Data:** Create `app/db/__tests__/seed-data.ts` containing seed scenarios (Basic, Hierarchy, Search, Edge Cases).
- **Integration:** Update `app/db/__tests__/beads.server.test.ts` to use the test database via `process.env.BEADS_DB`.
- **Scenarios:** Implement test cases for:
  - Status filtering (`open`, `in_progress`, `closed`, `blocked`)
  - Priority filtering
  - Search functionality
  - Basic ordering verification

## 3. Proposed Changes

### A. Create Test Database Utilities
**File:** `apps/ralph-monitoring/app/lib/test-utils/testDatabase.ts`
- Implement `createTestDatabase()`: Creates a temporary SQLite database file.
- Implement `createTasksSchema(db)`: Executes SQL to create the `issues` table matching `beads.server.ts` schema expectations.
- Implement cleanup logic to remove temporary database files.

**Note:** The table name `issues` matches the Beads project's convention. Beads uses `issues` as the table name in its database schema (see `apps/ralph-monitoring/app/db/beads.server.ts`), which aligns with Beads' terminology where work items are called "issues" rather than "tasks".

### B. Create Seed Data Scenarios
**File:** `apps/ralph-monitoring/app/db/__tests__/seed-data.ts`
- Implement `seedDatabase(db, scenario)` function.
- Define `seedScenarios` object with:
  - `basic`: Tasks with mixed statuses and priorities.
  - `search`: Tasks with specific keywords in titles/descriptions.
  - `hierarchy`: Tasks with parent-child relationships.

### C. Update Existing Tests
**File:** `apps/ralph-monitoring/app/db/__tests__/beads.server.test.ts`
- Remove/Update existing mocks to usage of real (test) database.
- In `beforeEach`:
  - Create test database using utility.
  - Set `process.env.BEADS_DB` to the test database path.
  - Seed database with relevant scenario.
- In `afterEach`:
  - Close database connection.
  - Clean up test database file.
  - Restore `process.env.BEADS_DB`.

## 4. Verification Plan

### Automated Tests
- **Unit/Integration Tests:** Run `bun run test apps/ralph-monitoring/app/db/__tests__/beads.server.test.ts`
- **Verify:**
  - All tests pass.
  - Tests run in isolation (no cross-contamination).
  - Database queries return expected results based on seed data.

### Manual Verification
- None required (fully automated via tests).

## 5. Execution Steps

1. **Create Utilities:**
   - Create `apps/ralph-monitoring/app/lib/test-utils/testDatabase.ts`.
   - Implement schema creation and database init.
2. **Create Seed Data:**
   - Create `apps/ralph-monitoring/app/db/__tests__/seed-data.ts`.
   - Implement `seedScenarios` and `seedDatabase`.
3. **Refactor Tests:**
   - Modify `apps/ralph-monitoring/app/db/__tests__/beads.server.test.ts`.
   - Integrate test database setup/teardown.
   - Add test cases for Status, Priority, and Search filtering.
4. **Final Verification:**
   - Run full test suite.
   - Ensure linting and type checking pass.

## 6. Risks & Mitigations

- **Risk:** `process.env` changes leaking between tests if `afterEach` fails or isn't robust.
  - **Mitigation:** Use `vi.stubEnv` or ensure strict `finally` block logic in teardown. (Note: `process.env` assignment is simple but `vi.stubEnv` is safer if available in our Vitest setup).
- **Risk:** Schema drift between production Beads DB and test DB schema.
  - **Mitigation:** Document the schema source in `testDatabase.ts`. Acknowledged as a maintenance task until a shared schema source exists.
