# Adopt Reportory Cursor Rules & Best Practices — Implementation Plan

- Owner: Jake Ruesink
- Last Updated: 2026-01-15
- Status: Draft
- Related Task Hub: `.devagent/workspace/tasks/completed/2026-01-15_adopt-reportory-cursor-rules-best-practices/`
- Stakeholders: Jake Ruesink (Owner, Decision Maker)
- PR Branch: `adopt-reportory-cursor-rules-best-practices` (PR already created, commit and push changes to this branch)

---

## PART 1: PRODUCT CONTEXT

### Summary

The ralph-monitoring React Router 7 app currently lacks comprehensive cursor rules and best practices compared to the reportory project. An investigation identified 25 instances of `useState`/`useRef`/`useEffect` that could be better handled by React Router 7's built-in features, missing error handling patterns using the framework-native `data()` helper, incomplete route type safety, and no testing infrastructure. This plan adopts reportory's proven cursor rules and refactors code to follow React Router 7 best practices, improving type safety, error handling, state management, and testability.

### Context & Problem

**Current State:**
- Reportory has 13 comprehensive cursor rules; devagent has 2 basic rules
- ralph-monitoring app uses `throw new Response()` instead of `throw data()` for error handling
- Route files lack generated `Route.LoaderArgs` and `Route.ComponentProps` type imports
- ErrorBoundary uses manual error prop instead of `useRouteError()` and `isRouteErrorResponse()` helpers
- 25 instances of `useState`/`useRef`/`useEffect` across 4 files indicate underutilization of React Router 7 features
- No test utilities for React Router 7 testing patterns
- Missing comprehensive testing documentation and patterns

**Problem:**
The current implementation doesn't leverage React Router 7's built-in capabilities for state management, error handling, and type safety. This leads to:
- Reduced type safety (manual type definitions instead of generated types)
- Suboptimal error handling (custom patterns instead of framework-native `data()` helper)
- Excessive client-side state management (useState/useRef/useEffect) where URL search params, loaders, actions, and navigation hooks would be more appropriate
- No testing infrastructure for routes and components

**Business Trigger:**
Investigation comparing ralph-monitoring against reportory identified significant gaps in code quality, type safety, and testing infrastructure. Adopting reportory's proven patterns will improve maintainability, reduce bugs, and establish consistent development practices.

**References:**
- Research Packet: `research/2026-01-15_react-router-7-best-practices-research.md` — Comprehensive analysis of React Router 7 best practices, useState/useRef anti-patterns, error handling, type safety, and testing patterns
- Clarification Packet: `clarification/2026-01-15_initial-clarification.md` — Two-phase implementation approach, reportory access method, biome configuration strategy, testing strategy review scope, definition of done

### Objectives & Success Metrics

**Product Objectives:**
1. **Type Safety:** All route files use generated `Route.LoaderArgs` and `Route.ComponentProps` types
2. **Error Handling:** All error handling uses framework-native `data()` helper instead of `throw new Response()`
3. **State Management:** Reduce `useState`/`useRef`/`useEffect` usage by leveraging React Router 7 features (URL search params, `useNavigation`, `useFetcher`)
4. **Testing Infrastructure:** Test utilities created following reportory patterns, enabling comprehensive route and component testing
5. **Code Quality:** All verification steps pass (typecheck, lint, test)

**Success Metrics:**
- ✅ `bun run typecheck` passes with all generated route types
- ✅ `bun run lint` passes (biome with selectively adopted reportory standards)
- ✅ `bun run test` passes (with new test utilities)
- ✅ All routes use generated `Route.*` types (manual review)
- ✅ All error handling uses `data()` helper (manual review)
- ✅ ErrorBoundary uses framework helpers (`useRouteError()`, `isRouteErrorResponse()`) (manual review)
- ✅ Significant reduction in `useState`/`useRef`/`useEffect` usage (from 25 instances to minimal, only for truly ephemeral UI state)

### Users & Insights

**Target Users:**
- **Primary:** Developers working on ralph-monitoring app (Jake Ruesink and future contributors)
- **Secondary:** AI agents using cursor rules for code generation and refactoring

**Key Insights:**
- Reportory's cursor rules have proven effective in maintaining code quality and consistency
- React Router 7's built-in features (URL state, loaders, actions, navigation hooks) eliminate need for excessive client-side state management
- Framework-native error handling (`data()` helper) is simpler and more maintainable than custom patterns
- Generated route types provide full type safety with automatic inference
- Testing utilities enable comprehensive test coverage for routes and components

**Demand Signals:**
- Investigation identified missing patterns compared to reportory
- Research packet documented 25 instances of anti-patterns requiring refactoring
- Current implementation lacks testing infrastructure

### Solution Principles

1. **Framework-Native Patterns:** Use React Router 7's built-in features over custom abstractions
2. **Type Safety First:** Leverage generated route types for full TypeScript inference
3. **Selective Adoption:** Take what's best from reportory for devagent project (don't blindly copy everything)
4. **Preserve Functionality:** Refactoring must maintain existing behavior while improving code quality
5. **Testing Standards:** Follow project testing standards (Vitest, @testing-library/react) with React Router 7 patterns
6. **Incremental Improvement:** Must-have items complete first; nice-to-have items tracked as follow-up tasks

### Scope Definition

- **In Scope:**
  - Phase 1: Bring in cursor rules from reportory (copy files, adapt repo-specific context)
  - Phase 3: Update code with best practices (error handling, type safety, state management refactoring)
  - Review reportory's testing strategy comprehensively
  - Create test utilities following reportory patterns
  - All verification steps (typecheck, lint, test)

- **Out of Scope / Future:**
  - Comprehensive test coverage for all routes/components (can be added incrementally later)
  - Nice-to-have items from implementation checklist (can be tracked as follow-up tasks)
  - Advanced state management refactoring for LogViewer if EventSource management is acceptable as-is (review during implementation)

### Functional Narrative

**Phase 1: Cursor Rules Adoption**
- Trigger: Copy cursor rules files from reportory (`../reportory/.cursor/rules/*.mdc`)
- Experience: Files are copied to `.cursorrules/` or `.cursor/rules/` and adapted for devagent repo structure (paths, project names, etc.)
- Acceptance: Cursor rules are in place, properly formatted, and adapted for devagent context

**Phase 3: Code Updates**
- Trigger: All code updates executed together after cursor rules are in place
- Experience: Route files updated with type safety, error handling refactored to use `data()` helper, ErrorBoundary updated to use framework helpers, state management refactored to use React Router 7 features, test utilities created
- Acceptance: All verification steps pass, code follows React Router 7 best practices, significant reduction in `useState`/`useRef`/`useEffect` usage

### Technical Notes & Dependencies

**PR & Version Control:**
- PR Branch: `adopt-reportory-cursor-rules-best-practices` (already created)
- All implementation changes should be committed and pushed to this branch
- PR is ready for commits as work progresses

**Technical Dependencies:**
- System: Reportory project in `../reportory/` sibling directory (verified accessible)
- Status: Available for copying cursor rules and test utilities
- Owner: External project

**Platform/Technical Constraints:**
- React Router 7.7.1 (already in use)
- TypeScript with generated route types
- Biome for linting (selective adoption from reportory)
- Vitest for testing

**Key Technical Considerations:**
- React Router 7 type generation must be working correctly (`bun run typecheck`)
- Reportory-specific context in cursor rules needs adaptation (paths, project structure references)
- State management refactoring may require careful testing to ensure filter persistence and functionality
- LogViewer EventSource management may be acceptable as-is (external system integration) - review during implementation

---

## PART 2: IMPLEMENTATION PLAN

### Scope & Assumptions

- **Scope focus:** Two-phase implementation: (1) Cursor rules adoption, (2) Code updates
- **Key assumptions:**
  - Reportory project is accessible in `../reportory/` sibling directory (verified)
  - React Router 7 type generation is working correctly (verify with `bun run typecheck`)
  - Files can be copied directly and adapted for devagent repo structure
  - Biome configs are "pretty aligned" between reportory and devagent (selective adoption)
  - LogViewer EventSource management may be acceptable as-is (review during implementation)
- **Out of scope:** Comprehensive test coverage for all routes/components (incremental follow-up), nice-to-have items (tracked as follow-up tasks)

### Implementation Tasks

#### Task 1: Review Reportory's Testing Strategy and Cursor Rules

- **Objective:** Understand reportory's testing utilities structure, coverage approach, workflow, documentation, and identify cursor rules adaptation needs before implementation
- **Impacted Modules/Files:**
  - Research artifacts (notes in task directory)
  - No code changes in this task
- **References:**
  - Reportory test utilities: `../reportory/apps/Reportory/app/lib/test-utils/router.tsx`
  - Reportory cursor rules: `../reportory/.cursor/rules/*.mdc`
  - Reportory testing best practices: `../reportory/.cursor/rules/testing-best-practices.mdc`
  - Research packet: `research/2026-01-15_react-router-7-best-practices-research.md`
- **Dependencies:** None (prerequisite for Task 2 and Task 3)
- **Acceptance Criteria:**
  - Reportory's testing strategy documented (utilities structure, coverage approach, workflow, documentation)
  - Reportory-specific context in cursor rules identified (paths, project names, structure references)
  - Adaptation requirements documented for cursor rules
  - Test utilities structure understood for Task 3
- **Testing Criteria:** N/A (research task)
- **Subtasks:**
  1. **Review reportory's test utilities** — Analyze `../reportory/apps/Reportory/app/lib/test-utils/router.tsx` to understand structure, patterns, and usage
     - Validation: Document test utilities structure, helper functions, and usage patterns
  2. **Review reportory's testing documentation** — Analyze `../reportory/.cursor/rules/testing-best-practices.mdc` for testing patterns, best practices, and workflow
     - Validation: Document testing patterns, coverage approach, and workflow
  3. **Identify cursor rules adaptation needs** — Review all cursor rules files from reportory for repo-specific context (paths, project names, structure references)
     - Validation: Document all adaptation requirements (paths to update, project names to change, structure references to adapt)
- **Validation Plan:** Research notes documented in task directory, ready for Task 2 and Task 3

#### Task 2: Phase 1 — Bring in Cursor Rules from Reportory

- **Objective:** Copy cursor rules files from reportory and adapt them for devagent repo structure, establishing comprehensive development guidelines and documenting app structure
- **Impacted Modules/Files:**
  - `.cursor/rules/error-handling.mdc` (new file)
  - `.cursor/rules/react-router-7.mdc` (new file, merge with existing `.cursorrules/react-router-7.mdc`)
  - `.cursor/rules/testing-best-practices.mdc` (new file)
  - `.cursor/rules/useEffect-patterns.mdc` (new file)
  - `.cursor/rules/cursor-rules.mdc` (new file, if exists in reportory)
  - `apps/ralph-monitoring/AGENTS.md` (new file or update existing, document app structure and cursor rules usage)
- **References:**
  - Reportory cursor rules: `../reportory/.cursor/rules/error-handling.mdc`, `../reportory/.cursor/rules/react-router.mdc`, `../reportory/.cursor/rules/testing-best-practices.mdc`, `../reportory/.cursor/rules/useEffect-patterns.mdc`
  - Current React Router rules: `.cursorrules/react-router-7.mdc`
  - Task 1 research notes (adaptation requirements)
- **Dependencies:** Task 1 (adaptation requirements)
- **Acceptance Criteria:**
  - All cursor rules files copied from reportory
  - All repo-specific context adapted (paths, project names, structure references)
  - Files properly formatted and placed in `.cursor/rules/` directory (granular structure)
  - Existing `react-router-7.mdc` patterns merged into new `.cursor/rules/react-router-7.mdc`
  - Cursor rules are comprehensive and ready for use
  - App's `AGENTS.md` file created/updated with:
    - App structure documentation (how the app is organized, key directories, patterns)
    - Reference to cursor rules and when to use them
    - Guidance on working within the app structure
- **Testing Criteria:**
  - Manual review: All files exist and are properly formatted
  - Manual review: All adaptation requirements from Task 1 are addressed
  - Manual review: Cursor rules reference correct paths and project structure
  - Manual review: App's `AGENTS.md` documents structure and cursor rules usage
- **Subtasks:**
  1. **Copy error-handling.mdc** — Copy from `../reportory/.cursor/rules/error-handling.mdc` to `.cursor/rules/error-handling.mdc` and adapt repo-specific context
     - Validation: File exists, paths adapted, project references updated
  2. **Create react-router-7.mdc** — Create new `.cursor/rules/react-router-7.mdc` by merging patterns from `../reportory/.cursor/rules/react-router.mdc` with existing `.cursorrules/react-router-7.mdc`, adapt repo-specific context
     - Validation: Enhanced file includes reportory patterns, maintains devagent-specific context, placed in `.cursor/rules/` directory
  3. **Copy testing-best-practices.mdc** — Copy from `../reportory/.cursor/rules/testing-best-practices.mdc` to `.cursor/rules/testing-best-practices.mdc` and adapt repo-specific context
     - Validation: File exists, paths adapted, project references updated
  4. **Copy useEffect-patterns.mdc** — Copy from `../reportory/.cursor/rules/useEffect-patterns.mdc` to `.cursor/rules/useEffect-patterns.mdc` and adapt repo-specific context
     - Validation: File exists, paths adapted, project references updated
  5. **Copy cursor-rules.mdc (if exists)** — Copy from `../reportory/.cursor/rules/cursor-rules.mdc` to `.cursor/rules/cursor-rules.mdc` and adapt repo-specific context (if file exists in reportory)
     - Validation: File exists (if applicable), paths adapted, project references updated
  6. **Create/update app AGENTS.md** — Create or update `apps/ralph-monitoring/AGENTS.md` with app structure documentation, cursor rules references, and guidance on working within the app
     - Validation: File exists, documents app structure (key directories, patterns, organization), references cursor rules and when to use them, provides guidance on working within the app
- **Validation Plan:** Manual review of all files, verification of adaptation requirements, confirmation that cursor rules are comprehensive and ready for use, app's AGENTS.md provides clear structure and cursor rules guidance

#### Task 3: Phase 3 — Update Code with Best Practices

- **Objective:** Refactor all route files, error handling, ErrorBoundary, and state management to follow React Router 7 best practices, and create test utilities
- **Impacted Modules/Files:**
  - `apps/ralph-monitoring/app/routes/tasks.$taskId.tsx` (type safety, error handling, state management)
  - `apps/ralph-monitoring/app/routes/_index.tsx` (type safety, state management)
  - `apps/ralph-monitoring/app/routes/api.logs.$taskId.ts` (type safety, error handling review)
  - `apps/ralph-monitoring/app/routes/api.tasks.$taskId.stop.ts` (type safety, error handling review)
  - `apps/ralph-monitoring/app/root.tsx` (ErrorBoundary to use `useRouteError()`)
  - `apps/ralph-monitoring/app/lib/test-utils/router.tsx` (new file, test utilities)
  - `apps/ralph-monitoring/app/routes/__tests__/tasks.$taskId.test.tsx` (new file, required)
  - `apps/ralph-monitoring/app/routes/__tests__/_index.test.tsx` (new file, required)
- **References:**
  - Research packet: `research/2026-01-15_react-router-7-best-practices-research.md` (prioritized recommendations)
  - Reportory test utilities: `../reportory/apps/Reportory/app/lib/test-utils/router.tsx`
  - Reportory testing patterns: `../reportory/.cursor/rules/testing-best-practices.mdc`
  - Task 1 research notes (testing strategy)
  - Task 2 cursor rules (implementation guidance)
  - React Router 7 documentation (via context7 MCP or web search for specific patterns)
- **Dependencies:** Task 1 (testing strategy), Task 2 (cursor rules in place)
- **Acceptance Criteria:**
  - All route files use `Route.LoaderArgs` and `Route.ComponentProps` type imports
  - All error handling uses `data()` helper instead of `throw new Response()`
  - ErrorBoundary uses `useRouteError()` and `isRouteErrorResponse()` helpers
  - State management refactored to use React Router 7 features where appropriate (URL search params with nuqs, `useNavigation`, `useFetcher`)
  - Test utilities created following reportory patterns
  - Test files created for routes (`tasks.$taskId.test.tsx`, `_index.test.tsx`) as part of quality gate
  - All verification steps pass (`bun run typecheck`, `bun run lint`, `bun run test`)
  - Significant reduction in `useState`/`useRef`/`useEffect` usage (only for truly ephemeral UI state)
- **Testing Criteria:**
  - Run `bun run typecheck` — all types should generate correctly
  - Run `bun run lint` — biome should pass with selectively adopted reportory standards
  - Run `bun run test` — all tests should pass with new test utilities (test files are part of quality gate)
  - Manual review: All routes use generated `Route.*` types
  - Manual review: All error handling uses `data()` helper
  - Manual review: ErrorBoundary uses framework helpers
  - Manual review: State management refactored appropriately (URL search params with nuqs)
- **Subtasks:**
  1. **Create test utilities** — Create `apps/ralph-monitoring/app/lib/test-utils/router.tsx` following reportory patterns, adapted for ralph-monitoring context (no AuthProvider if not needed, ThemeProvider if needed)
     - Validation: Test utilities file exists, follows reportory patterns, adapted for ralph-monitoring context, can be imported and used in tests
  2. **Update tasks.$taskId.tsx** — Add `Route.LoaderArgs` and `Route.ComponentProps` imports, replace `throw new Response()` with `throw data()`, remove `useState` for stop message (use `fetcher.data` directly), remove `useEffect` for fetcher response (use `fetcher.state` and `fetcher.data` in render)
     - Validation: Type safety added, error handling updated, state management refactored, functionality preserved, `bun run typecheck` passes
  3. **Update _index.tsx** — Add `Route.LoaderArgs` and `Route.ComponentProps` imports, explore and implement nuqs with React Router 7 for URL search params (research nuqs best practices with React Router 7, implement debounced search pattern using nuqs), use `useNavigation` for loading states (already partially done)
     - Validation: Type safety added, state management refactored using nuqs with React Router 7 best practices, search functionality preserved with proper debouncing, filter persistence maintained, `bun run typecheck` passes
  4. **Update root.tsx ErrorBoundary** — Update ErrorBoundary to use `useRouteError()` and `isRouteErrorResponse()` helpers instead of manual error prop
     - Validation: ErrorBoundary uses framework helpers, error handling works correctly, `bun run typecheck` passes
  5. **Review and update API routes** — Review `api.logs.$taskId.ts` and `api.tasks.$taskId.stop.ts` for type safety and error handling improvements (add Route types if applicable, use `data()` helper for errors)
     - Validation: Type safety improved, error handling uses `data()` helper, `bun run typecheck` passes
  6. **Review LogViewer.tsx** — Review `components/LogViewer.tsx` to determine if EventSource management is acceptable as-is (external system integration) or if refactoring is needed
     - Validation: Decision documented, EventSource management reviewed, refactoring completed if needed
  7. **Create test files** — Create `apps/ralph-monitoring/app/routes/__tests__/tasks.$taskId.test.tsx` and `apps/ralph-monitoring/app/routes/__tests__/_index.test.tsx` using new test utilities, following reportory testing patterns
     - Validation: Test files exist, use test utilities correctly, follow reportory patterns, provide meaningful test coverage, `bun run test` passes
  8. **Run verification steps** — Run `bun run typecheck`, `bun run lint`, `bun run test` and fix any errors (test files are part of quality gate)
     - Validation: All verification steps pass, no type errors, no linting errors, all tests pass including new route tests
- **Validation Plan:** All verification steps pass, manual review confirms best practices are followed, functionality is preserved, significant reduction in `useState`/`useRef`/`useEffect` usage

### Implementation Guidance

**From `.devagent/core/AGENTS.md` → Standard Workflow Instructions:**
- Date handling: Always run `date +%Y-%m-%d` first to get current date in ISO format
- Metadata retrieval: Use `git config user.name` for owner/author when not explicitly provided
- Context gathering: Review internal agent documentation, workflow definitions, rules & conventions, DevAgent workspace in standard order
- Standard guardrails: Prefer authoritative sources, never expose secrets, tag uncertainties with `[NEEDS CLARIFICATION: ...]`, cite file paths with anchors

**From Research Packet → React Router 7 Best Practices:**
- **Error Handling:** Use `throw data("message", { status: 404 })` instead of `throw new Response()`. ErrorBoundary should use `useRouteError()` and `isRouteErrorResponse()` helpers.
- **Route Type Safety:** Import `Route.LoaderArgs` and `Route.ComponentProps` from `./+types/[routeName]` for full type safety. Never use relative paths like `../+types/[routeName]`.
- **State Management:** Use URL search params with nuqs for filter state (explore nuqs best practices with React Router 7), `useNavigation` for loading states, `useFetcher` for concurrent actions. Eliminate `useState`/`useEffect` for network-related state.
- **Form Handling:** Use route `action` functions and `useActionData()` instead of client-side form state. `useNavigation` provides `navigation.formAction` to detect which form is submitting.
- **URL Search Params with nuqs:** Research nuqs library integration with React Router 7, implement debounced search patterns using nuqs hooks, follow nuqs best practices for type-safe URL search params

**From Reportory Cursor Rules → Error Handling Patterns:**
- Use `throw data()` with status codes for expected errors (404, 401, 403, 400)
- Let unexpected errors throw naturally (ErrorBoundary handles them)
- Helper functions should throw to abort early and simplify caller code
- ErrorBoundary should use `useRouteError()` and `isRouteErrorResponse()` helpers

**From Reportory Cursor Rules → React Router 7 Patterns:**
- Always use `./+types/[routeName]` for route type imports (never relative paths)
- Run `typecheck` if you see missing type errors (never try to "fix" the import path)
- Use `href()` for type-safe URL generation
- Use `data()` for JSON responses (not `json()`)
- Never pass `Headers` instance to `redirect()` or `data()`; pass plain object or tuple list

**From Reportory Cursor Rules → Testing Best Practices:**
- Use Vitest as test runner, `@testing-library/react` for component testing
- Prefer `createRoutesStub` for tests (wrapped by Theme provider)
- Use `makeActionArgs` helper for route action/loader testing
- Avoid mocking router hooks; assert behavior via DOM and `router.state`
- Parse request as `text()` → `URLSearchParams` (not `formData()` directly) for `fetcher.submit` tests

**From Reportory Cursor Rules → useEffect Patterns:**
- Effects are for synchronization with external systems (browser APIs, network, timers)
- Calculate derived state during rendering (not in Effects)
- Handle user events in event handlers (not in Effects)
- Use `useMemo` for expensive calculations
- Always clean up subscriptions and timers

**From User Rules → Code Style:**
- Write concise, technical TypeScript code
- Use functional and declarative programming patterns; avoid classes
- Prefer iteration and modularization over code duplication
- Use descriptive variable names with auxiliary verbs
- Prefer self-documenting code; comments only when needed for context
- Use lowercase with dashes for directories
- Favor named exports for components
- Use interfaces over types
- Avoid enums; use maps instead
- Prefer functional components with TypeScript interfaces
- Prefer const with fat arrow syntax
- Minimize `useEffect` and `setState` as much as possible

### Release & Delivery Strategy

**Milestone 1: Cursor Rules Adoption (Task 2)**
- Deliverable: Comprehensive cursor rules in place, adapted for devagent context
- Review Gate: Manual review of cursor rules files, verification of adaptation requirements
- Dependencies: Task 1 (research complete)

**Milestone 2: Code Updates (Task 3)**
- Deliverable: All code updated with best practices, test utilities created, verification steps pass
- Review Gate: All verification steps pass (`bun run typecheck`, `bun run lint`, `bun run test`), manual review confirms best practices
- Dependencies: Task 1 (testing strategy), Task 2 (cursor rules in place)

**Definition of Done:**
- All must-have items from implementation checklist are complete
- All verification steps pass (typecheck, lint, test)
- Cursor rules are in place and properly formatted
- Code updates follow React Router 7 best practices
- Nice-to-have items can be tracked as follow-up tasks (not blocking completion)

---

## Risks & Open Questions

| Item | Type (Risk / Question) | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| React Router 7 type generation not working | Risk | System | Verify with `bun run typecheck` before starting Task 3 | Task 3 start |
| Reportory-specific context in cursor rules | Risk | Jake Ruesink | Task 1 identifies all adaptation requirements; Task 2 addresses them | Task 2 |
| State management refactoring breaks filter persistence | Risk | Jake Ruesink | Careful testing during Task 3, preserve URL search params functionality | Task 3 |
| LogViewer EventSource management refactoring complexity | Question | Jake Ruesink | Review during Task 3, determine if acceptable as-is (external system integration) | Task 3 |
| Biome configuration alignment | Question | Jake Ruesink | Selective adoption based on project needs (already validated in clarification) | Task 3 |
| Test utilities adaptation complexity | Risk | Jake Ruesink | Follow reportory patterns closely, adapt only for ralph-monitoring-specific context (ThemeProvider, no AuthProvider if not needed) | Task 3 |
| nuqs integration with React Router 7 | Question | Jake Ruesink | Research nuqs best practices with React Router 7, explore debouncing patterns, verify compatibility and implementation approach | Task 3 |

---

## Progress Tracking

Refer to the AGENTS.md file in the task directory for instructions on tracking and reporting progress during implementation.

---

## Appendices & References

### Agent Documentation
- **Agent documentation:** `AGENTS.md` (root), `.devagent/core/AGENTS.md`
- **Workflow definitions:** `.devagent/core/workflows/create-plan.md`

### Coding Standards and Conventions
- **Current React Router Rules:** `.cursorrules/react-router-7.mdc` (2026-01-15) — Basic React Router 7 rules (48 lines, needs enhancement)
- **Current Monorepo Rules:** `.cursorrules/monorepo.mdc` (2026-01-15) — Monorepo cursor rules
- **User Rules:** Workspace rules for TypeScript, Node.js, Bun, React Router 7, React, Shadcn UI, Tailwind

### Task Artifacts
- **Task Hub:** `.devagent/workspace/tasks/completed/2026-01-15_adopt-reportory-cursor-rules-best-practices/AGENTS.md` — Task hub with summary, phases, implementation checklist, and progress log
- **Research Packet:** `research/2026-01-15_react-router-7-best-practices-research.md` — Comprehensive research on React Router 7 best practices, useState/useRef anti-patterns, error handling with `data()` helper, route type safety, state management patterns, and testing utilities. Includes analysis of 25 useState/useRef/useEffect instances and recommendations for refactoring.
- **Clarification Packet:** `clarification/2026-01-15_initial-clarification.md` — Clarified requirements including two-phase implementation approach (cursor rules first, then code updates), reportory access method, biome configuration strategy, testing strategy review scope, definition of done, scope boundaries, and verification criteria.

### Code References
- **Ralph Monitoring App:** `apps/ralph-monitoring/` — React Router 7 app requiring cursor rules adoption
- **Ralph Monitoring Package:** `apps/ralph-monitoring/package.json` — Package configuration with testing setup (vitest, @testing-library/react)
- **Task Route File:** `apps/ralph-monitoring/app/routes/tasks.$taskId.tsx` — Route file using `throw new Response()` instead of `data()`, missing Route types
- **Index Route File:** `apps/ralph-monitoring/app/routes/_index.tsx` — Route file with useState/useEffect for search debouncing, missing Route types
- **Root Component:** `apps/ralph-monitoring/app/root.tsx` — Root component with ErrorBoundary using manual error prop instead of `useRouteError()`
- **API Route Files:** `apps/ralph-monitoring/app/routes/api.logs.$taskId.ts`, `apps/ralph-monitoring/app/routes/api.tasks.$taskId.stop.ts` — API routes requiring type safety and error handling review

### Reportory References
- **Reportory Cursor Rules:** `../reportory/.cursor/rules/error-handling.mdc`, `../reportory/.cursor/rules/react-router.mdc`, `../reportory/.cursor/rules/testing-best-practices.mdc`, `../reportory/.cursor/rules/useEffect-patterns.mdc`
- **Reportory Test Utilities:** `../reportory/apps/Reportory/app/lib/test-utils/router.tsx` — Test utilities implementation to adapt for ralph-monitoring

### External Documentation
- **React Router 7 Documentation:** Available via context7 MCP or web search for specific patterns during implementation
- **React Router 7 Error Handling:** https://github.com/remix-run/react-router/blob/main/docs/how-to/error-boundary.md
- **React Router 7 Type Safety:** https://github.com/remix-run/react-router/blob/main/docs/explanation/type-safety.md
- **React Router 7 State Management:** https://github.com/remix-run/react-router/blob/main/docs/explanation/state-management.md
- **nuqs Documentation:** Research nuqs library for React Router 7 integration, URL search params best practices, and debouncing patterns
