# React Router 7 Best Practices & Cursor Rules Research

- **Date:** 2026-01-15
- **Classification:** Implementation Design Research
- **Related Task:** `.devagent/workspace/tasks/completed/2026-01-15_adopt-reportory-cursor-rules-best-practices/`

## Classification & Assumptions

**Scope:** Research React Router 7 best practices for:
1. Error handling patterns (using `data()` helper instead of `new Response()`)
2. Route type safety (using generated `Route.*` types)
3. State management patterns (avoiding excessive `useState`/`useRef` in favor of React Router 7 features)
4. Testing utilities and patterns
5. Cursor rules enhancement recommendations

**Assumptions:**
- React Router 7.7.1 is in use (from `apps/ralph-monitoring/package.json`)
- Current implementation has 25 instances of `useState`/`useRef`/`useEffect` across 4 files
- Reportory project has comprehensive cursor rules that should be adopted
- Context7 MCP is available for querying React Router 7 documentation

**Consumers:** Implementation agents, plan creators, code reviewers

## Research Plan

**Validation Targets:**
1. ✅ React Router 7 error handling: `data()` helper vs `throw new Response()` patterns
2. ✅ Route type safety: `Route.LoaderArgs` and `Route.ComponentProps` usage patterns
3. ✅ State management: URL search params, `useNavigation`, `useFetcher` for loading states
4. ✅ Form handling: Actions and `useNavigation` instead of client-side state
5. ✅ Error boundaries: `useRouteError()` and `isRouteErrorResponse()` patterns
6. ✅ Testing utilities: React Router 7 testing patterns with Vitest

## Sources

### Internal Sources

1. **Current React Router Rules:** `.cursorrules/react-router-7.mdc` (2026-01-15)
   - Basic 48-line rules file
   - Missing comprehensive patterns for state management, error handling, type safety
   - No guidance on avoiding `useState`/`useRef` anti-patterns

2. **Current Code Analysis:** `apps/ralph-monitoring/app/` (2026-01-15)
   - `routes/_index.tsx`: Uses `useState` for search input debouncing, `useSearchParams` for URL state (good pattern)
   - `routes/tasks.$taskId.tsx`: Uses `useState` for stop message, `useEffect` for fetcher response handling
   - `components/LogViewer.tsx`: Heavy `useState`/`useRef` usage for EventSource management, scroll state, pause state
   - Total: 25 instances of `useState`/`useRef`/`useEffect` across 4 files

3. **Task Context:** `.devagent/workspace/tasks/completed/2026-01-15_adopt-reportory-cursor-rules-best-practices/AGENTS.md` (2026-01-15)
   - Investigation identified missing error handling patterns, route type safety, testing infrastructure
   - Reportory has 13 comprehensive cursor rules vs devagent's 2 basic rules

### External Sources (React Router 7 Official Documentation)

1. **Error Handling with `data()` Helper**
   - Source: https://github.com/remix-run/react-router/blob/main/docs/how-to/error-boundary.md
   - Version: React Router 7 (latest)
   - Key finding: Use `throw data("Record Not Found", { status: 404 })` instead of `throw new Response()`
   - Error boundaries should use `useRouteError()` and `isRouteErrorResponse()` helpers

2. **Route Type Safety**
   - Source: https://github.com/remix-run/react-router/blob/main/docs/explanation/type-safety.md
   - Version: React Router 7 (latest)
   - Key finding: Import `Route.LoaderArgs` and `Route.ComponentProps` from `./+types/[routeName]` for full type safety
   - Types include params, query strings, and loader data with full TypeScript inference

3. **State Management with URL Search Params**
   - Source: https://github.com/remix-run/react-router/blob/main/docs/explanation/state-management.md
   - Version: React Router 7 (latest)
   - Key finding: Use `useSearchParams` and HTML `<Form>` elements for UI state management
   - Eliminates need for explicit state synchronization with `useState`
   - URL search params provide declarative, persistent state

4. **Loading States with `useNavigation`**
   - Source: https://github.com/remix-run/react-router/blob/main/docs/api/hooks/useNavigation.md
   - Version: React Router 7 (latest)
   - Key finding: `useNavigation` provides `navigation.state` (`"idle"`, `"submitting"`, `"loading"`) for loading indicators
   - No need for `useState` to track loading/submitting states
   - Access form data via `navigation.formData`, `navigation.formAction`, `navigation.formMethod`

5. **Form Handling with Actions**
   - Source: https://github.com/remix-run/react-router/blob/main/docs/explanation/state-management.md
   - Version: React Router 7 (latest)
   - Key finding: Use route `action` functions and `useActionData()` instead of client-side form state
   - `useNavigation` provides `navigation.formAction` to detect which form is submitting
   - Reduces boilerplate from extensive state declarations to just three essential lines

6. **Fetcher Patterns**
   - Source: https://github.com/remix-run/react-router/blob/main/docs/api/hooks/useFetcher.md
   - Version: React Router 7 (latest)
   - Key finding: `useFetcher` provides `fetcher.state` and `fetcher.data` for concurrent data interactions
   - Useful for complex UIs requiring concurrent data interactions without navigation
   - No need for `useState` to track fetcher state

## Findings & Tradeoffs

### 1. Error Handling Patterns

**Current State:**
- `apps/ralph-monitoring/app/routes/tasks.$taskId.tsx` uses `throw new Response('Task not found', { status: 404 })`
- `apps/ralph-monitoring/app/root.tsx` ErrorBoundary uses manual error prop instead of `useRouteError()`

**Recommended Pattern:**
```tsx
import { data } from "react-router";

export async function loader({ params }: Route.LoaderArgs) {
  const task = getTaskById(params.taskId);
  if (!task) {
    throw data("Task not found", { status: 404 });
  }
  return { task };
}

// ErrorBoundary
import { useRouteError, isRouteErrorResponse } from "react-router";

export function ErrorBoundary() {
  const error = useRouteError();
  
  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>{error.status} {error.statusText}</h1>
        <p>{error.data}</p>
      </div>
    );
  }
  // ... handle other error types
}
```

**Tradeoffs:**
- ✅ `data()` is the recommended pattern in React Router 7
- ✅ `useRouteError()` provides type-safe error access
- ⚠️ Migration requires updating all error throws and error boundaries

### 2. Route Type Safety

**Current State:**
- Routes use manual type definitions: `{ params: { taskId?: string } }`
- No generated type imports from `./+types/[routeName]`

**Recommended Pattern:**
```tsx
import type { Route } from './+types/tasks.$taskId';

export async function loader({ params }: Route.LoaderArgs) {
  // params.taskId is fully typed as string
  const task = getTaskById(params.taskId);
  return { task };
}

export default function Component({ loaderData }: Route.ComponentProps) {
  // loaderData is fully typed
  const { task } = loaderData;
  return <div>{task.title}</div>;
}
```

**Tradeoffs:**
- ✅ Full type safety with automatic inference
- ✅ TypeScript catches errors at compile time
- ⚠️ Requires React Router 7's type generation to be working
- ⚠️ Migration requires updating all route files

### 3. State Management Patterns

**Current State Analysis:**

**`routes/_index.tsx`:**
- ✅ Good: Uses `useSearchParams` for URL state (status, priority, search)
- ⚠️ Anti-pattern: Uses `useState` for search input debouncing (`searchInput`)
- ⚠️ Anti-pattern: Uses `useEffect` to sync search input with URL
- ⚠️ Anti-pattern: Uses `useState` for hover state (`isHovered` in TaskCard)

**`routes/tasks.$taskId.tsx`:**
- ⚠️ Anti-pattern: Uses `useState` for stop message (`stopMessage`)
- ⚠️ Anti-pattern: Uses `useEffect` to handle fetcher response

**`components/LogViewer.tsx`:**
- ⚠️ Heavy anti-pattern: 8 `useState` calls for various UI states
- ⚠️ Anti-pattern: Uses `useRef` for EventSource, auto-scroll, pause state
- ⚠️ Anti-pattern: Uses `useEffect` for EventSource management

**Recommended Patterns:**

**URL Search Params for Filter State:**
```tsx
// Instead of useState for search input, use Form with URL params
import { Form, useSearchParams } from "react-router";

export default function Index() {
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") || "";

  return (
    <Form>
      <input name="search" defaultValue={search} />
      <button type="submit">Search</button>
    </Form>
  );
}
```

**useNavigation for Loading States:**
```tsx
// Instead of useState for loading, use useNavigation
import { useNavigation } from "react-router";

export default function Component() {
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading" || navigation.state === "submitting";
  
  return isLoading ? <Spinner /> : <Content />;
}
```

**useFetcher for Concurrent Actions:**
```tsx
// Instead of useState + useEffect for fetcher responses, use fetcher.state and fetcher.data
import { useFetcher } from "react-router";

export default function Component() {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state === "submitting";
  const message = fetcher.data?.message;
  
  return (
    <fetcher.Form method="post">
      <button disabled={isSubmitting}>Submit</button>
      {message && <p>{message}</p>}
    </fetcher.Form>
  );
}
```

**Tradeoffs:**
- ✅ Eliminates need for `useState`/`useEffect` for network-related state
- ✅ URL state is shareable, bookmarkable, and persists across refreshes
- ✅ Loading states are automatically managed by React Router
- ⚠️ Some UI-only state (like hover) may still need `useState` (acceptable)
- ⚠️ EventSource management in LogViewer may require refactoring to use React Router patterns or remain as-is if it's truly external system integration

### 4. Form Handling Patterns

**Current State:**
- Forms use `useFetcher` but still rely on `useState` + `useEffect` for response handling

**Recommended Pattern:**
```tsx
import { Form, useNavigation, useActionData } from "react-router";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const errors = await validate(formData);
  if (errors) {
    return { ok: false, errors };
  }
  await processForm(formData);
  return { ok: true, errors: null };
}

export default function Component({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.formAction === "/route-path";
  const errors = actionData?.errors;
  
  return (
    <Form method="post">
      <input name="field" />
      {errors?.field && <span>{errors.field}</span>}
      <button disabled={isSubmitting}>Submit</button>
    </Form>
  );
}
```

**Tradeoffs:**
- ✅ Eliminates manual state management for form submissions
- ✅ Server-side validation and error handling
- ⚠️ Requires route-level `action` functions

### 5. Testing Utilities

**Current State:**
- Basic vitest config exists
- No test utilities for React Router 7
- No tests for routes/components

**Recommended Pattern (from reportory):**
- Create `app/lib/test-utils/router.tsx` with:
  - `createRoutesStubWithTheme` helper
  - `createRoutesFor` convenience function
  - `renderRouteComponent` helper
  - `makeActionArgs` for route testing

**Tradeoffs:**
- ✅ Enables comprehensive route testing
- ✅ Type-safe test utilities
- ⚠️ Requires creating test utilities from scratch or adapting from reportory

## Recommendation

**Priority 1: High Impact, Low Effort**
1. **Update error handling:** Replace `throw new Response()` with `throw data()` in all loaders/actions
2. **Update ErrorBoundary:** Use `useRouteError()` and `isRouteErrorResponse()` in `root.tsx`
3. **Add route type safety:** Import `Route.LoaderArgs` and `Route.ComponentProps` in all route files

**Priority 2: Medium Impact, Medium Effort**
4. **Refactor state management in `_index.tsx`:**
   - Replace search input `useState` + `useEffect` debouncing with `Form` + URL search params
   - Use `useNavigation` for loading states (already partially done)
5. **Refactor fetcher patterns in `tasks.$taskId.tsx`:**
   - Remove `useState` for stop message, use `fetcher.data` directly
   - Remove `useEffect` for fetcher response, use `fetcher.state` and `fetcher.data` in render

**Priority 3: Lower Priority (External System Integration)**
6. **Review `LogViewer.tsx`:** 
   - EventSource management may be acceptable as-is (external system integration)
   - Consider if pause/resume state can use URL params or if it's truly ephemeral UI state
   - Scroll state and refs are likely acceptable for DOM manipulation

**Priority 4: Testing Infrastructure**
7. **Create test utilities:** Adapt reportory's test utilities for React Router 7
8. **Add route tests:** Create tests for routes using new utilities

## Repo Next Steps

### Immediate Actions
- [ ] Update `.cursorrules/react-router-7.mdc` with comprehensive patterns:
  - Error handling with `data()` helper
  - Route type safety patterns
  - State management anti-patterns to avoid
  - Form handling patterns
  - Loading state patterns
- [ ] Create `.cursor/rules/error-handling.mdc` with error boundary patterns
- [ ] Create `.cursor/rules/testing-best-practices.mdc` with testing utilities documentation

### Code Updates (Priority Order)
- [ ] Update `apps/ralph-monitoring/app/routes/tasks.$taskId.tsx`:
  - Add `Route.LoaderArgs` and `Route.ComponentProps` imports
  - Replace `throw new Response()` with `throw data()`
  - Remove `useState` for stop message, use `fetcher.data` directly
  - Remove `useEffect` for fetcher response
- [ ] Update `apps/ralph-monitoring/app/routes/_index.tsx`:
  - Add `Route.LoaderArgs` and `Route.ComponentProps` imports
  - Refactor search input to use `Form` + URL search params (remove debouncing `useState` + `useEffect`)
- [ ] Update `apps/ralph-monitoring/app/root.tsx`:
  - Update ErrorBoundary to use `useRouteError()` and `isRouteErrorResponse()`
- [ ] Review `apps/ralph-monitoring/app/components/LogViewer.tsx`:
  - Determine if EventSource management is acceptable as-is (external system)
  - Consider URL params for pause/resume state if it should persist
- [ ] Create `apps/ralph-monitoring/app/lib/test-utils/router.tsx`:
  - Adapt reportory's test utilities
- [ ] Create test files for routes:
  - `app/routes/__tests__/tasks.$taskId.test.tsx`
  - `app/routes/__tests__/_index.test.tsx`

### Verification
- [ ] Run `bun run typecheck` - all types should generate correctly
- [ ] Run `bun run lint` - biome should pass
- [ ] Run `bun run test` - all tests should pass
- [ ] Review all route files use `Route.*` types
- [ ] Review all error handling uses `data()` helper
- [ ] Review ErrorBoundary uses framework helpers
- [ ] Count `useState`/`useRef` usage - should be reduced significantly (only for truly ephemeral UI state)

## Risks & Open Questions

### Risks
1. **Type Generation:** React Router 7's `+types` generation must be working correctly
2. **Breaking Changes:** Updating error handling may affect error boundary behavior
3. **State Migration:** Refactoring URL search params may require careful testing of filter persistence
4. **Test Utilities:** Creating test utilities from scratch may take time

### Open Questions
1. **Reportory Location:** Where is the reportory project located? (Referenced as `../reportory/` in investigation)
2. **LogViewer Refactoring:** Should EventSource management remain as-is (external system) or be refactored?
3. **Biome Configuration:** Should biome configuration be updated to match reportory standards exactly?
4. **Debouncing Pattern:** How should search input debouncing be handled with URL search params? (May need custom hook or accept slight delay)

### Dependencies
- React Router 7.7.1 (already installed)
- Context7 MCP for documentation queries (available)
- Reportory project access (needed for test utilities and cursor rules)

## Citations

1. React Router Error Handling: https://github.com/remix-run/react-router/blob/main/docs/how-to/error-boundary.md
2. React Router Type Safety: https://github.com/remix-run/react-router/blob/main/docs/explanation/type-safety.md
3. React Router State Management: https://github.com/remix-run/react-router/blob/main/docs/explanation/state-management.md
4. React Router useNavigation Hook: https://github.com/remix-run/react-router/blob/main/docs/api/hooks/useNavigation.md
5. React Router useFetcher Hook: https://github.com/remix-run/react-router/blob/main/docs/api/hooks/useFetcher.md
6. Current Cursor Rules: `.cursorrules/react-router-7.mdc` (2026-01-15)
7. Current Code: `apps/ralph-monitoring/app/` (2026-01-15)
8. Task Context: `.devagent/workspace/tasks/completed/2026-01-15_adopt-reportory-cursor-rules-best-practices/AGENTS.md` (2026-01-15)
