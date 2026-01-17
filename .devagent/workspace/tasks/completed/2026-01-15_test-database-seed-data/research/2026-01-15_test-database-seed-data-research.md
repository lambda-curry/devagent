# Test Database Seed Data Setup Research

**Date:** 2026-01-15  
**Classification:** Implementation Design  
**Assumptions:** Using better-sqlite3, SQLite database structure matches Beads schema, test isolation is required

## Research Plan

This research validates the following:

1. **Database Creation Patterns** - How to create isolated test databases with better-sqlite3
2. **Schema Initialization** - How to create the `tasks` table schema matching Beads structure
3. **Seed Data Strategies** - Patterns for creating repeatable, realistic test data
4. **Test Integration** - How to integrate test database into Vitest test suite
5. **Environment Configuration** - How to configure test vs production database paths
6. **Test Scenario Design** - What test scenarios are needed for comprehensive testing

## Sources

### Internal Sources

1. **Current Database Implementation** (`apps/ralph-monitoring/app/db/beads.server.ts`, 2026-01-15)
   - Uses better-sqlite3 with readonly mode
   - Database path configured via `BEADS_DB` env var or defaults to `.beads/beads.db`
   - Queries `tasks` table with columns: `id`, `title`, `description`, `status`, `priority`, `parent_id`, `created_at`, `updated_at`
   - Status values: `'open' | 'in_progress' | 'closed' | 'blocked'`

2. **Existing Test Pattern** (`apps/ralph-monitoring/app/db/__tests__/beads.server.test.ts`, 2026-01-15)
   - Minimal tests that handle missing database gracefully
   - No test database setup currently

3. **Reportory Testing Strategy** (`.devagent/workspace/tasks/completed/2026-01-15_adopt-reportory-cursor-rules-best-practices/reportory-testing-strategy-research.md`, 2026-01-15)
   - Uses `createTestDatabase()` pattern with template caching
   - Creates unique SQLite database file per test
   - Uses Vitest worker isolation
   - Pattern: Mock database module, create test DB in `beforeEach`, cleanup in `afterEach`

4. **Beads Database Patterns** (`.beads/docs/MULTI_REPO_HYDRATION.md`, 2026-01-15)
   - Mentions `:memory:` for in-memory test databases
   - Shows database initialization patterns

5. **Beads Schema Reference** (`.beads/docs/ARCHITECTURE.md`, 2026-01-15)
   - Tasks table structure with status flow: `open` → `in_progress` → `closed`
   - Status values: `open`, `in_progress`, `blocked`, `closed`, `pinned`
   - Priority: integer 0-4 (0=critical, 4=backlog)

6. **Vitest Configuration** (`apps/ralph-monitoring/vitest.config.ts`, 2026-01-15)
   - Uses jsdom environment
   - Has setup file: `vitest.setup.ts`
   - Globals enabled

### External Sources

1. **better-sqlite3 Documentation** (Context7, `/wiselibs/better-sqlite3`, v12.4.1)
   - Database constructor: `new Database(path, options)`
   - Supports `:memory:` for in-memory databases
   - Supports temporary databases (empty string path)
   - `serialize()` method creates buffer from database
   - Can create new database files if they don't exist
   - Options: `readonly`, `fileMustExist`, `timeout`, `verbose`

2. **better-sqlite3 API Patterns** (Context7, `/wiselibs/better-sqlite3`, v12.4.1)
   - `prepare()` creates prepared statements
   - `exec()` executes SQL strings
   - Named parameters: `@foo`, `:foo`, `$foo`
   - Anonymous parameters: `?`

### Update: New Cursor Rules & Testing Guidance (2026-01-15)

After pulling latest code, the following new resources were discovered:

7. **Testing Best Practices Cursor Rule** (`.cursor/rules/testing-best-practices.mdc`, 2026-01-15)
   - **Database Integration Testing Section** (lines 380-497) provides official guidance
   - Shows pattern using `createTestDatabase()` from `~/lib/test-utils/testDatabase`
   - Pattern uses module mocking: `vi.mock('~/lib/db.server', ...)` to inject test database
   - Recommends: "Create fresh DB per test in `beforeEach`"
   - Notes: "Use `createTestDatabase()` for isolation (when available)"
   - **Important:** The example uses Drizzle ORM syntax, but the pattern is applicable to better-sqlite3
   - **Status:** `testDatabase.ts` is mentioned in `apps/ralph-monitoring/AGENTS.md` as "if needed" - not yet implemented

8. **Ralph Monitoring AGENTS.md** (`apps/ralph-monitoring/AGENTS.md`, 2026-01-15)
   - Documents test utilities location: `app/lib/test-utils/`
   - Lists `testDatabase.ts` as "Database testing utilities (if needed)"
   - Confirms test utilities directory structure

9. **Current Test Patterns** (`apps/ralph-monitoring/app/routes/__tests__/_index.test.tsx`, 2026-01-15)
   - Current tests mock `beads.server` functions directly: `vi.mock('~/db/beads.server', () => ({ getAllTasks: vi.fn() }))`
   - This is a function-level mock, not database-level testing
   - **Implication:** Our test database implementation will enable real database testing instead of function mocking

**Impact on Research:**
- ✅ Our research aligns with the cursor rule guidance
- ✅ The `createTestDatabase()` pattern we researched matches the documented approach
- ✅ The module mocking pattern is consistent with our recommendations
- ⚠️ **Note:** The cursor rule example uses Drizzle ORM, but our implementation will use better-sqlite3 directly
- ✅ The recommendation to create fresh DB per test in `beforeEach` matches our Pattern B recommendation

## Findings & Tradeoffs

### 1. Database Creation Approaches

#### Option A: File-Based Test Database
**Pattern:** Create a physical `test.db` file in a test directory
```typescript
const testDbPath = join(process.cwd(), 'test.db');
const db = new Database(testDbPath);
```

**Pros:**
- Persistent across test runs (can inspect manually)
- Can be committed as seed data template
- Easy to debug (can open in SQLite browser)
- Matches production file-based approach

**Cons:**
- Requires cleanup (delete file after tests)
- Potential file system conflicts in parallel tests
- Slower than in-memory

#### Option B: In-Memory Database
**Pattern:** Use `:memory:` for each test
```typescript
const db = new Database(':memory:');
```

**Pros:**
- Fastest option
- Automatic cleanup (no file system)
- Perfect isolation per test
- No cleanup required

**Cons:**
- Can't inspect database manually
- Can't commit seed data as file
- Doesn't match production file-based approach

#### Option C: Temporary File Database
**Pattern:** Use OS temp directory with unique names
```typescript
import { tmpdir } from 'os';
import { join } from 'path';
const testDbPath = join(tmpdir(), `test-${Date.now()}-${Math.random()}.db`);
const db = new Database(testDbPath);
```

**Pros:**
- Good isolation (unique per test)
- Can inspect if needed
- Automatic cleanup via OS temp cleanup

**Cons:**
- Requires cleanup logic
- More complex setup

**Recommendation:** **Option A (File-Based)** for seed data scenarios, **Option B (In-Memory)** for unit tests. Use file-based for integration tests where we want repeatable seed data.

### 2. Schema Initialization

The `tasks` table schema needs to match Beads structure. Based on queries in `beads.server.ts`, the schema should be:

```sql
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK(status IN ('open', 'in_progress', 'closed', 'blocked')),
  priority TEXT,
  parent_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (parent_id) REFERENCES tasks(id)
);
```

**Key Points:**
- `id` is TEXT (Beads uses string IDs like `devagent-a884`)
- `status` has CHECK constraint for valid values
- `parent_id` allows hierarchical tasks
- Timestamps are TEXT (ISO format strings)

### 3. Seed Data Strategies

#### Strategy A: SQL Scripts
Create `.sql` files with INSERT statements:
```sql
INSERT INTO tasks (id, title, description, status, priority, parent_id, created_at, updated_at)
VALUES 
  ('test-1', 'Test Task 1', 'Description', 'open', '1', NULL, '2026-01-15T10:00:00Z', '2026-01-15T10:00:00Z'),
  ...
```

**Pros:**
- Easy to read and edit
- Can be version controlled
- Can be loaded via `db.exec()`

**Cons:**
- Less flexible for dynamic data
- Harder to parameterize

#### Strategy B: TypeScript Seed Functions
Create TypeScript functions that generate seed data:
```typescript
function seedTestDatabase(db: Database) {
  const insert = db.prepare('INSERT INTO tasks ...');
  insert.run({ id: 'test-1', title: '...', ... });
}
```

**Pros:**
- Type-safe
- Can generate dynamic data
- Easy to parameterize scenarios

**Cons:**
- More code to maintain
- Less readable than SQL

#### Strategy C: JSON + Insertion Script
Store seed data as JSON, insert programmatically:
```typescript
const seedData = JSON.parse(fs.readFileSync('seed-data.json'));
seedData.forEach(task => insert.run(task));
```

**Pros:**
- Easy to edit (JSON)
- Can be version controlled
- Flexible insertion logic

**Cons:**
- Extra parsing step
- Need to handle date conversion

**Recommendation:** **Strategy B (TypeScript Functions)** for flexibility, with option to export to SQL for manual inspection.

### 4. Test Scenario Design

Based on the query patterns in `beads.server.ts`, we need test scenarios for:

#### Scenario 1: Status Filtering
- Tasks with each status: `open`, `in_progress`, `closed`, `blocked`
- Test: `getActiveTasks()` returns only `open` and `in_progress`
- Test: `getAllTasks({ status: 'closed' })` returns only closed tasks

#### Scenario 2: Priority Filtering
- Tasks with different priorities: `'0'`, `'1'`, `'2'`, `'3'`, `'4'`, `null`
- Test: `getAllTasks({ priority: '1' })` returns only priority 1 tasks

#### Scenario 3: Search Filtering
- Tasks with searchable text in title and description
- Test: `getAllTasks({ search: 'keyword' })` returns matching tasks

#### Scenario 4: Parent-Child Relationships
- Tasks with `parent_id` set
- Test: Hierarchical queries work correctly

#### Scenario 5: Ordering
- Tasks with different `updated_at` timestamps
- Test: Results are ordered correctly (in_progress first, then by updated_at DESC)

#### Scenario 6: Edge Cases
- Empty database
- Single task
- Tasks with null values (description, priority, parent_id)

**Recommended Seed Data:**
```typescript
const seedScenarios = {
  basic: [
    { id: 'test-1', title: 'Open Task', status: 'open', priority: '1', ... },
    { id: 'test-2', title: 'In Progress Task', status: 'in_progress', priority: '0', ... },
    { id: 'test-3', title: 'Closed Task', status: 'closed', priority: '2', ... },
  ],
  withHierarchy: [
    { id: 'test-parent', title: 'Parent Task', status: 'open', parent_id: null, ... },
    { id: 'test-child', title: 'Child Task', status: 'open', parent_id: 'test-parent', ... },
  ],
  withSearch: [
    { id: 'test-search-1', title: 'Keyword in Title', description: 'Some text', ... },
    { id: 'test-search-2', title: 'Other Task', description: 'Keyword in description', ... },
  ],
  // ... more scenarios
};
```

### 5. Test Integration Patterns

#### Pattern A: Global Test Database
Create one test database shared across all tests:
```typescript
let testDb: Database;

beforeAll(() => {
  testDb = createTestDatabase();
  seedDatabase(testDb);
});

afterAll(() => {
  testDb.close();
});
```

**Pros:**
- Fast (one setup)
- Good for integration tests

**Cons:**
- Tests can interfere with each other
- Need careful cleanup between tests

#### Pattern B: Per-Test Database
Create fresh database for each test:
```typescript
let testDb: Database;

beforeEach(() => {
  testDb = createTestDatabase();
  seedDatabase(testDb);
});

afterEach(() => {
  testDb.close();
  // Delete file if file-based
});
```

**Pros:**
- Perfect isolation
- No test interference

**Cons:**
- Slower (setup per test)
- More cleanup logic

#### Pattern C: Template Database (Reportory Pattern)
Create template database once, copy for each test:
```typescript
let templateDb: Database;

beforeAll(() => {
  templateDb = createTestDatabase();
  seedDatabase(templateDb);
});

beforeEach(() => {
  const buffer = templateDb.serialize();
  testDb = new Database(buffer);
});
```

**Pros:**
- Fast (template created once)
- Good isolation (copy per test)
- Best of both worlds

**Cons:**
- More complex setup
- Requires `serialize()` support

**Recommendation:** **Pattern C (Template Database)** for performance and isolation, following Reportory pattern. **Note:** The new cursor rule (`.cursor/rules/testing-best-practices.mdc`) recommends "Create fresh DB per test in `beforeEach`" which aligns with Pattern B, but Pattern C provides better performance for larger test suites while maintaining isolation.

### 6. Environment Configuration

Current implementation uses:
```typescript
const dbPath = process.env.BEADS_DB || join(repoRoot, '.beads', 'beads.db');
```

**Options for Test Configuration:**

#### Option A: Environment Variable Override
```typescript
// In test setup
process.env.BEADS_DB = testDbPath;
```

**Pros:**
- Simple
- Uses existing code path

**Cons:**
- Global state (can leak between tests)
- Need to restore original value

#### Option B: Dependency Injection
Modify `getDatabase()` to accept optional path parameter:
```typescript
export function getDatabase(dbPath?: string): Database | null {
  const path = dbPath || getDatabasePath();
  // ...
}
```

**Pros:**
- Explicit
- No global state
- Type-safe

**Cons:**
- Requires code changes
- Need to update all call sites

#### Option C: Mock Module
Mock the `beads.server` module in tests:
```typescript
vi.mock('~/db/beads.server', () => ({
  getDatabase: () => testDb,
}));
```

**Pros:**
- No code changes needed
- Complete isolation

**Cons:**
- Can be brittle
- Harder to test the actual module

**Recommendation:** **Option B (Dependency Injection)** for long-term maintainability, with **Option A (Env Var)** as quick solution.

## Recommendation

### Recommended Approach

1. **Database Creation:** Use file-based test database (`test.db` in test directory) for seed data scenarios
   - Allows committing seed data as reference
   - Easy to inspect and debug
   - Matches production approach

2. **Schema Initialization:** Create schema via SQL in TypeScript:
   ```typescript
   function createTasksSchema(db: Database) {
     db.exec(`
       CREATE TABLE IF NOT EXISTS tasks (
         id TEXT PRIMARY KEY,
         title TEXT NOT NULL,
         description TEXT,
         status TEXT NOT NULL CHECK(status IN ('open', 'in_progress', 'closed', 'blocked')),
         priority TEXT,
         parent_id TEXT,
         created_at TEXT NOT NULL,
         updated_at TEXT NOT NULL,
         FOREIGN KEY (parent_id) REFERENCES tasks(id)
       );
     `);
   }
   ```

3. **Seed Data:** Use TypeScript functions with predefined scenarios:
   ```typescript
   export const seedScenarios = {
     basic: () => [/* basic tasks */],
     withHierarchy: () => [/* parent-child tasks */],
     withSearch: () => [/* searchable tasks */],
     // ... more scenarios
   };
   
   function seedDatabase(db: Database, scenario: keyof typeof seedScenarios) {
     const tasks = seedScenarios[scenario]();
     const insert = db.prepare('INSERT INTO tasks ...');
     for (const task of tasks) {
       insert.run(task);
     }
   }
   ```

4. **Test Integration:** Use template database pattern (Reportory-style):
   - Create template database in `beforeAll`
   - Copy via `serialize()` for each test in `beforeEach`
   - Cleanup in `afterEach`

5. **Environment Configuration:** Add dependency injection to `getDatabase()`:
   ```typescript
   export function getDatabase(dbPath?: string): Database | null {
     const path = dbPath || getDatabasePath();
     // ... rest of implementation
   }
   ```

6. **Test Scenarios:** Create comprehensive seed data covering:
   - All status values
   - All priority values
   - Parent-child relationships
   - Searchable text variations
   - Edge cases (null values, empty database)

### Implementation Structure

```
apps/ralph-monitoring/
  app/
    lib/
      test-utils/
        testDatabase.ts                # Test database utilities (matches cursor rule)
    db/
      __tests__/
        beads.server.test.ts          # Updated tests
        seed-data.ts                   # Seed data scenarios
        fixtures/
          test.db                      # Optional: committed seed database
```

**Note:** Per cursor rule guidance and `AGENTS.md`, test utilities should be in `app/lib/test-utils/` rather than `app/db/__tests__/`.

## Repo Next Steps

- [ ] Create `app/lib/test-utils/testDatabase.ts` with database creation utilities (matches cursor rule guidance)
- [ ] Create `app/db/__tests__/seed-data.ts` with seed data scenarios
- [ ] Update `beads.server.ts` to support dependency injection (optional `dbPath` parameter)
- [ ] Update `beads.server.test.ts` to use test database with seed data
- [ ] Follow module mocking pattern from `.cursor/rules/testing-best-practices.mdc` (lines 397-402) for test database injection
- [ ] Create test scenarios covering all query patterns:
  - [ ] Status filtering (open, in_progress, closed, blocked)
  - [ ] Priority filtering
  - [ ] Search filtering
  - [ ] Parent-child relationships
  - [ ] Ordering (status priority, updated_at)
  - [ ] Edge cases (empty, null values)
- [ ] Document test database usage in README or test file comments
- [ ] Consider committing a reference `test.db` file as fixture (optional)

## Risks & Open Questions

### Risks

1. **Schema Drift:** If Beads schema changes, test database schema needs updating
   - **Mitigation:** Document schema source, add schema validation test

2. **Test Isolation:** File-based databases can conflict in parallel tests
   - **Mitigation:** Use unique filenames per test or use in-memory for parallel tests

3. **Maintenance Burden:** Seed data needs to stay in sync with real data patterns
   - **Mitigation:** Document seed data purpose, keep scenarios simple

### Open Questions

1. **Should we commit a reference `test.db` file?**
   - Pros: Easy to inspect, can be used as template
   - Cons: Binary file in git, needs updates when schema changes
   - **Recommendation:** No, generate from seed data scripts instead

2. **Should seed data be in SQL files or TypeScript?**
   - **Recommendation:** TypeScript for flexibility, with option to export SQL

3. **How to handle database migrations in tests?**
   - **Recommendation:** Use fixed schema version for tests, update manually when needed

4. **Should we support multiple seed scenarios in one test run?**
   - **Recommendation:** Yes, via scenario parameter to `seedDatabase()`

5. **How to test the actual `getDatabase()` function with test database?**
   - **Recommendation:** Use dependency injection or environment variable override

## Additional References (Post-Pull Update)

- **Testing Best Practices Cursor Rule**: `.cursor/rules/testing-best-practices.mdc` (2026-01-15) - Official database testing guidance with `createTestDatabase()` pattern
- **Ralph Monitoring AGENTS.md**: `apps/ralph-monitoring/AGENTS.md` (2026-01-15) - Test utilities location (`app/lib/test-utils/`) and structure documentation
