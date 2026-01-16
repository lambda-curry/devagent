# Reportory Testing Strategy & Cursor Rules Research

**Task:** devagent-a217.1  
**Date:** 2026-01-15  
**Objective:** Understand reportory's testing utilities structure, coverage approach, workflow, documentation, and identify cursor rules adaptation needs before implementation.

---

## Executive Summary

This research document provides a comprehensive analysis of reportory's testing strategy, including:
- Testing utilities structure and organization
- Coverage approach and testing patterns
- Testing workflow and commands
- Documentation structure
- Reportory-specific context in cursor rules
- Adaptation requirements for devagent cursor rules

---

## 1. Testing Utilities Structure

### 1.1 Core Test Utilities Location

**Path:** `/Users/jake/projects/reportory/apps/Reportory/app/lib/test-utils/`

**Files:**
- `router.tsx` - React Router v7 testing utilities (primary utility)
- `testDatabase.ts` - Database testing utilities for integration tests
- `dropdown-menu-mock.tsx` - Mock components for Radix UI dropdowns
- `mock-types.ts` - Type definitions for mocks

### 1.2 Router Testing Utilities (`router.tsx`)

**Purpose:** Provides React Router v7 testing helpers that wrap `createRoutesStub` with theme and auth providers.

**Key Functions:**

1. **`createRoutesStub(routes, options?)`**
   - Wraps React Router's `createRoutesStub` with theme and auth providers
   - Handles `AuthProvider` with optional `sessionOverride`
   - Includes `MockThemeProvider` to avoid localStorage/window.matchMedia issues
   - **Critical Note:** Does NOT support loaders on root route (causes silent rendering failures)
   - Session data passed via `sessionOverride` prop instead of loaders

**Structure:**
```typescript
interface RoutesStubOptions {
  withProviders?: boolean;
  session?: { session: AuthSession; user: AuthUser } | null;
}

export const createRoutesStub = (
  routes: RouteObject[], 
  options?: RoutesStubOptions
) => {
  // Returns TestRouterStub component
}
```

**Usage Pattern:**
```tsx
const Stub = createRoutesStub([
  { path: '/', Component: MyComponent },
  { path: '/api/endpoint', action: mockAction }
]);
render(<Stub initialEntries={['/']} />);
```

### 1.3 Database Testing Utilities (`testDatabase.ts`)

**Purpose:** Creates isolated test databases for integration tests with proper cleanup.

**Key Functions:**

1. **`createTestDatabase()`**
   - Creates a unique SQLite database file per test
   - Uses template database caching for performance (fingerprint-based)
   - Returns: `{ db, client, filePath, cleanup }`
   - Handles worker isolation (Vitest worker ID)
   - Runs migrations on template database

**Features:**
- Template database caching (reuses migrated template across tests)
- Worker-specific isolation (separate template per Vitest worker)
- Automatic cleanup function
- Migration fingerprint tracking

**Usage Pattern:**
```typescript
let currentTestDb: Database | null = null;

vi.mock('~/lib/db.server', () => ({
  get db() {
    if (!currentTestDb) throw new Error('Test database not initialized');
    return currentTestDb;
  }
}));

beforeEach(async () => {
  const db = await createTestDatabase();
  currentTestDb = db.db;
  cleanup = db.cleanup;
});

afterEach(async () => {
  if (cleanup) await cleanup();
});
```

### 1.4 Test Organization Structure

**Test File Locations:**
- Route tests: `apps/Reportory/app/routes/__tests__/`
- Component tests: `apps/Reportory/app/components/**/__tests__/`
- Library tests: `apps/Reportory/app/lib/**/__tests__/`
- Script tests: `apps/Reportory/scripts/__tests__/`

**Naming Conventions:**
- `.test.ts` - Unit tests
- `.test.tsx` - Component/UI tests
- `.unit.test.ts` - Explicit unit tests
- `.integration.test.tsx` - Integration tests
- `.ui.test.tsx` - UI-specific tests

---

## 2. Coverage Approach

### 2.1 Testing Strategy

**Multi-Layer Approach:**
1. **Unit Tests** - Isolated function/component testing
2. **Integration Tests** - Route-level testing with real database
3. **Component Tests** - UI behavior with `createRoutesStub`
4. **Database Tests** - Schema constraints, FK cascades, multi-tenancy

### 2.2 Testing Patterns

#### Component-Level Testing
- Use `createRoutesStub` for component isolation
- Mock theme provider to avoid localStorage issues
- Test with accessible queries (`getByRole`, `getByLabelText`)
- Prefer `userEvent` over `fireEvent`

#### Route-Level Testing
- Test loaders/actions directly with `makeActionArgs` helper
- Use `createTestDatabase()` for database integration tests
- Test redirects via `router.state.location.pathname`
- Assert on DOM, not router internals

#### Database Integration Testing
- Test schema constraints (NOT NULL, FK cascades)
- Test multi-tenancy with JOINs
- Test migration verification
- Use fresh database per test in `beforeEach`

### 2.3 Testing Libraries

**Core Stack:**
- **Vitest** - Test runner (replaces Jest)
- **@testing-library/react** - Component testing
- **@testing-library/user-event** - User interaction simulation
- **jsdom** - DOM environment for tests

**Vitest Configuration:**
- Environment: `jsdom`
- Globals: `true` (describe, it, expect available globally)
- Setup file: `app/lib/__tests__/setup.ts`
- Test timeout: 10000ms
- Dependency optimization for React Router and remix-hook-form

---

## 3. Testing Workflow

### 3.1 Package.json Scripts

**Test Commands:**
```json
{
  "test": "vitest run --pool=threads",
  "test:ui": "vitest --ui --pool=threads",
  "test:watch": "vitest watch --pool=threads",
  "test:ci": "vitest run --pool=threads"
}
```

**Key Characteristics:**
- Uses `--pool=threads` for parallel execution
- Separate UI command for interactive test runner
- Watch mode for development
- CI mode matches regular test command

### 3.2 Testing Workflow Steps

1. **Write Test** - Create test file with appropriate naming
2. **Setup Test Environment** - Use `createRoutesStub` or `createTestDatabase` as needed
3. **Run Tests** - `bun run test` or `bun run test:watch`
4. **Verify Coverage** - Check test output and fix failures
5. **Type Check** - Ensure TypeScript types are correct (`bun run typecheck`)

### 3.3 Test Setup File

**Location:** `apps/Reportory/app/lib/__tests__/setup.ts`

**Purpose:** Global test configuration and mocks

**Common Setup:**
- jsdom environment configuration
- Global mocks for browser APIs
- Test utilities imports

---

## 4. Documentation

### 4.1 Cursor Rules Documentation

**Location:** `/Users/jake/projects/reportory/.cursor/rules/testing-best-practices.mdc`

**Structure:**
- Frontmatter with description, globs, alwaysApply
- Core testing libraries & setup
- React Router v7 testing patterns
- Form testing patterns
- useFetcher testing patterns
- Async & DOM events
- Test organization & best practices
- Database integration testing
- References to related documentation

**Key Sections:**
1. **Core Testing Libraries** - Vitest, @testing-library/react setup
2. **React Router v7 Testing** - Route objects, helpers, action/loader testing
3. **Form Testing** - React Router forms, remix-hook-form patterns
4. **useFetcher Testing** - Critical patterns for fetcher.submit
5. **Database Integration** - When and how to test at DB level
6. **jsdom Limitations** - Complex component testing constraints

### 4.2 Additional Documentation References

**In testing-best-practices.mdc:**
- `docs/testing.md` - Detailed database testing patterns
- `docs/testing/jsdom-limitations-and-workarounds.md` - jsdom constraints
- `docs/testing/fetcher-testing-patterns.md` - useFetcher guide
- `.agent-os/specs/2025-08-29-testing-patterns/spec.md` - Original spec

### 4.3 Code Examples in Documentation

**Pattern:** Documentation includes real code examples from reportory codebase
- Examples reference actual file paths (`apps/Reportory/app/utils/http.server.ts`)
- Shows DO/DON'T patterns side-by-side
- Includes edge cases and gotchas

---

## 5. Reportory-Specific Context in Cursor Rules

### 5.1 Path References

**Reportory-Specific Paths Found in Cursor Rules:**

1. **`apps/Reportory/`** - App root path
   - Used in: `testing-best-practices.mdc`, `react-router.mdc`, `backend.mdc`, `cursor-rules.mdc`, `drizzle-migrations.mdc`, `prompt-engineering.mdc`

2. **`apps/Reportory/app/lib/test-utils/router.tsx`** - Test utilities
   - Referenced in: `testing-best-practices.mdc`, `react-router.mdc`

3. **`apps/Reportory/app/utils/http.server.ts`** - HTTP utilities
   - Referenced in: `react-router.mdc` (headersToObject example)

4. **`apps/Reportory/app/routes/**/*.tsx`** - Route files
   - Used in: `react-router.mdc`, `backend.mdc`, `cursor-rules.mdc`

5. **`apps/Reportory/drizzle/**/*.ts`** - Migration files
   - Used in: `drizzle-migrations.mdc`

6. **`apps/Reportory/app/lib/prompts/**/*.ts`** - Prompt files
   - Used in: `prompt-engineering.mdc`

### 5.2 Project Name References

**"Reportory" References:**
- Project name appears in examples and descriptions
- Database naming: `reportory-template-${workerId}-${fingerprint}.db`
- Test database: `reportory-test-${randomUUID()}.db`

### 5.3 Structure References

**App Structure Patterns:**
- `app/routes/` - Route files
- `app/lib/` - Library/utilities
- `app/lib/test-utils/` - Test utilities
- `app/lib/__tests__/` - Test files
- `drizzle/` - Database migrations

**Glob Patterns:**
- `apps/Reportory/**/*.test.ts` - Test files
- `apps/Reportory/**/*.test.tsx` - Component test files
- `apps/Reportory/app/routes/**/*.tsx` - Route files
- `apps/Reportory/app/lib/**/*.ts` - Library files

### 5.4 Framework-Specific Context

**React Router v7 Patterns:**
- Route type imports: `./+types/[routeName]`
- Route configuration: `app/routes.ts`
- Type generation: `bun run typecheck`

**Database Patterns:**
- Drizzle ORM usage
- LibSQL client patterns
- Migration workflow

**Authentication Patterns:**
- Better Auth integration
- Session management
- AuthProvider usage in tests

---

## 6. Adaptation Requirements for Cursor Rules

### 6.1 Path Adaptations

**Reportory → DevAgent Adaptations:**

| Reportory Path | DevAgent Path | Notes |
|---------------|---------------|-------|
| `apps/Reportory/` | `apps/ralph-monitoring/` | App root |
| `apps/Reportory/app/lib/test-utils/router.tsx` | `apps/ralph-monitoring/app/lib/test-utils/router.tsx` | Test utilities (to be created) |
| `apps/Reportory/app/routes/**/*.tsx` | `apps/ralph-monitoring/app/routes/**/*.tsx` | Route files |
| `apps/Reportory/app/lib/**/*.ts` | `apps/ralph-monitoring/app/lib/**/*.ts` | Library files |
| `apps/Reportory/drizzle/**/*.ts` | N/A (if not using Drizzle) | May not apply |

### 6.2 Project Name Adaptations

**Replace:**
- "Reportory" → "ralph-monitoring" (or appropriate project name)
- "reportory-template" → "ralph-monitoring-template" (if using test databases)
- "reportory-test" → "ralph-monitoring-test"

### 6.3 Structure Adaptations

**Current DevAgent Structure:**
- `apps/ralph-monitoring/app/routes/` - Routes exist
- `apps/ralph-monitoring/app/lib/` - Library exists
- `apps/ralph-monitoring/app/lib/test-utils/` - **TO BE CREATED**
- `apps/ralph-monitoring/app/db/` - Database utilities exist

**Required Adaptations:**
1. Create `apps/ralph-monitoring/app/lib/test-utils/` directory
2. Adapt `router.tsx` for ralph-monitoring context (remove Reportory-specific auth if not needed)
3. Adapt `testDatabase.ts` if using database testing (may not be needed if using different DB)
4. Update glob patterns to match ralph-monitoring structure

### 6.4 Framework Adaptations

**React Router v7:**
- ✅ Already using React Router v7 (v7.7.1 in devagent vs v7.9.1 in reportory)
- ✅ Route structure similar
- ✅ Type generation pattern same (`bun run typecheck`)

**Testing Stack:**
- ✅ Vitest already configured
- ✅ @testing-library/react available
- ⚠️ May need to add `@testing-library/user-event` if not present
- ⚠️ Test utilities need to be created/adapted

**Database:**
- ⚠️ DevAgent uses better-sqlite3, reportory uses LibSQL
- ⚠️ May need different database testing approach
- ⚠️ Drizzle patterns may not apply if not using Drizzle

### 6.5 Content Adaptations

**Testing Best Practices:**
- Remove Reportory-specific examples (replace with ralph-monitoring examples)
- Adapt database testing patterns if using different ORM/DB
- Update file paths in examples
- Remove Reportory-specific auth patterns if not applicable

**React Router Rules:**
- Merge with existing `.cursorrules/react-router-7.mdc`
- Keep devagent-specific patterns
- Add reportory patterns that are missing
- Update path references

**Error Handling:**
- Framework patterns are universal (React Router v7)
- Examples may need path updates
- Keep core patterns, adapt examples

**useEffect Patterns:**
- Universal React patterns, no adaptation needed
- Examples may need path updates

**Cursor Rules Best Practices:**
- Universal patterns, no adaptation needed
- Update example paths from `apps/Reportory` to `apps/ralph-monitoring`

### 6.6 Files to Create/Adapt

**New Files to Create:**
1. `.cursor/rules/testing-best-practices.mdc` - Adapted from reportory
2. `.cursor/rules/error-handling.mdc` - Adapted from reportory
3. `.cursor/rules/useEffect-patterns.mdc` - Adapted from reportory
4. `.cursor/rules/react-router-7.mdc` - Merge existing with reportory patterns
5. `apps/ralph-monitoring/app/lib/test-utils/router.tsx` - Adapted from reportory

**Files to Update:**
1. `.cursorrules/react-router-7.mdc` - Merge with reportory patterns

**Files to Evaluate:**
1. `apps/ralph-monitoring/app/lib/test-utils/testDatabase.ts` - Only if using database testing
2. Vitest configuration - May need updates for test utilities

---

## 7. Test Utilities Structure for Task 3

### 7.1 Required Test Utilities

**For ralph-monitoring:**

1. **`router.tsx`** - React Router v7 testing utilities
   - Adapt `createRoutesStub` from reportory
   - Remove Reportory-specific auth if not needed
   - Keep theme provider if using themes
   - Simplify if no auth/theme needed

2. **`testDatabase.ts`** (Optional)
   - Only needed if doing database integration tests
   - Adapt for better-sqlite3 if using SQLite
   - May not be needed if using different DB approach

### 7.2 Implementation Considerations

**Simplified Version (if no auth/theme):**
```typescript
// Minimal version if no auth/theme providers needed
export const createRoutesStub = (routes: RouteObject[]) => {
  const rootRoute: RouteObject = {
    id: 'root',
    Component: () => <Outlet />,
    children: routes
  };
  const Stub = buildRoutesStub([rootRoute]);
  return function TestRouterStub(props: { initialEntries?: string[] }) {
    const { initialEntries = ['/'] } = props;
    return <Stub initialEntries={initialEntries} />;
  };
};
```

**Full Version (if auth/theme needed):**
- Adapt reportory's version
- Replace AuthProvider with ralph-monitoring auth (if any)
- Replace ThemeProvider with ralph-monitoring theme (if any)

### 7.3 Integration Points

**Vitest Configuration:**
- May need to add test utilities to path aliases
- Ensure setup file imports test utilities
- Configure environment for React Router v7 testing

**Test Files:**
- Import from `~/lib/test-utils/router` (or appropriate path)
- Use `createRoutesStub` for component tests
- Follow reportory patterns for route testing

---

## 8. Summary & Next Steps

### 8.1 Key Findings

1. **Testing Utilities:** Reportory has well-structured test utilities in `app/lib/test-utils/`
2. **Coverage Approach:** Multi-layer testing (unit, integration, component, database)
3. **Workflow:** Vitest-based with clear script commands
4. **Documentation:** Comprehensive cursor rules with real examples
5. **Adaptation Needs:** Paths, project names, structure references need updating

### 8.2 Critical Adaptation Points

1. **Paths:** `apps/Reportory/` → `apps/ralph-monitoring/`
2. **Test Utilities:** Create/adapt `router.tsx` for ralph-monitoring
3. **Database Testing:** Evaluate if needed, adapt if using different DB
4. **Auth/Theme:** Simplify if not using same providers
5. **Examples:** Update all examples to use ralph-monitoring paths

### 8.3 Next Steps (Task 2)

1. Copy cursor rules files from reportory
2. Adapt all path references
3. Adapt project name references
4. Create test utilities structure
5. Merge with existing react-router-7.mdc
6. Update glob patterns
7. Test that rules work correctly

---

## 9. References

### 9.1 Reportory Files Referenced

- `/Users/jake/projects/reportory/apps/Reportory/app/lib/test-utils/router.tsx`
- `/Users/jake/projects/reportory/apps/Reportory/app/lib/test-utils/testDatabase.ts`
- `/Users/jake/projects/reportory/.cursor/rules/testing-best-practices.mdc`
- `/Users/jake/projects/reportory/.cursor/rules/react-router.mdc`
- `/Users/jake/projects/reportory/.cursor/rules/error-handling.mdc`
- `/Users/jake/projects/reportory/.cursor/rules/useEffect-patterns.mdc`
- `/Users/jake/projects/reportory/.cursor/rules/cursor-rules.mdc`
- `/Users/jake/projects/reportory/apps/Reportory/package.json`
- `/Users/jake/projects/reportory/apps/Reportory/vitest.config.ts`

### 9.2 DevAgent Files Referenced

- `/Users/jake/projects/ralph-worktrees/devagent-a217/.cursorrules/react-router-7.mdc`
- `/Users/jake/projects/ralph-worktrees/devagent-a217/apps/ralph-monitoring/package.json`
- `/Users/jake/projects/ralph-worktrees/devagent-a217/apps/ralph-monitoring/vitest.config.ts`

---

**Research Complete**  
**Ready for Task 2: Phase 1 — Bring in Cursor Rules from Reportory**
