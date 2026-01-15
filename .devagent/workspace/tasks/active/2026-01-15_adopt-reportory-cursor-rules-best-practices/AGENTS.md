# Adopt Reportory Cursor Rules & Best Practices Progress Tracker

- Owner: Jake Ruesink
- Last Updated: 2026-01-15
- Status: Draft
- Task Hub: `.devagent/workspace/tasks/active/2026-01-15_adopt-reportory-cursor-rules-best-practices/`

## Summary

Adopt reportory cursor rules and best practices for the ralph-monitoring React Router 7 app. This task involves three main phases:

**Phase 1: Bring in important cursor rules from reportory:**
- Error handling patterns using framework-native `data()` helper instead of `new Response()`
- Comprehensive React Router v7 rules with enhanced type safety and navigation patterns
- Testing best practices with Vitest + React Router 7 testing utilities
- useEffect patterns guide following "You Might Not Need an Effect" principles
- Cursor rules maintenance guide for ongoing rule management

**Phase 2: Review rules against current code:**
- Check all route files for type safety improvements (missing `Route.LoaderArgs` and `Route.ComponentProps` imports)
- Review error handling patterns (currently using `throw new Response()` instead of `throw data()`)
- Verify ErrorBoundary implementation (currently uses manual error prop instead of `useRouteError()`)
- Check biome linting configuration alignment with reportory standards
- **Review excessive useState/useRef usage:** Identify patterns where `useState` and `useRef` are used that could be better handled by React Router 7's built-in features (loaders, actions, form handling, URL state management, etc.). This is an indicator that we may not be leveraging React Router 7 to its fullest potential.

**Phase 3: Update code with best practices:**
- Add `Route.LoaderArgs` and `Route.ComponentProps` type imports to all routes
- Replace `throw new Response()` with `throw data()` in loaders/actions
- Update ErrorBoundary to use `useRouteError()` and `isRouteErrorResponse()` helpers
- **Refactor useState/useRef patterns:** Review all instances of `useState` and `useRef` usage and refactor to use React Router 7's built-in features where appropriate (loaders for server data, actions for mutations, URL search params for state, form handling, etc.). **Agents should consult React Router 7 documentation via context7 MCP or web search to determine the best implementation approach for each pattern.**
- Create test utilities (`app/lib/test-utils/router.tsx`) following reportory patterns
- Add UI tests for routes/components with full type safety
- Ensure biome linting passes with reportory standards
- Run `bun run typecheck` and fix any type errors

**Context from investigation:**
An investigation dated 2025-01-14 compared the ralph-monitoring app (`apps/ralph-monitoring/`) against the reportory project (`../reportory/`) and identified missing error handling patterns, route type safety, and testing infrastructure. Reportory has 13 comprehensive cursor rules while devagent currently has 2 basic rules. Specific files requiring updates include route files (`tasks.$taskId.tsx`, `_index.tsx`), root component (`root.tsx`), API route files, and missing test utilities.

**Verification requirements:**
- `bun run typecheck` passes with all generated route types
- `bun run lint` passes (biome with reportory standards)
- `bun run test` passes with new test utilities
- All routes use generated `Route.*` types
- All error handling uses `data()` helper
- ErrorBoundary uses framework helpers (`useRouteError()`, `isRouteErrorResponse()`)

## Agent Update Instructions
- Always update "Last Updated" to today's date (ISO: YYYY-MM-DD) when editing this file. **Get the current date by explicitly running `date +%Y-%m-%d` first, then use the output for the "Last Updated" field.**
- Progress Log: Append a new entry at the end in the form `- [YYYY-MM-DD] Event: concise update, links to files`. Do not rewrite or delete prior entries. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- Implementation Checklist: Mark items as `[x]` when complete, `[~]` for partial with a short note. Add new items if discovered; avoid removing items—strike through only when obsolete.
- Key Decisions: Record important decisions as `- [YYYY-MM-DD] Decision: rationale, links`. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- References: Keep links current to latest spec, research, and tasks. Add additional references as they are created.
- Scope: Edits here should reflect coordination/progress only; do not include application code changes. Preserve history.

## Key Decisions
- [2026-01-15] Decision: Adopt reportory cursor rules and best practices to improve type safety, error handling, and testing infrastructure in ralph-monitoring app. Based on investigation comparing ralph-monitoring against reportory project structure and cursor rules.
- [2026-01-15] Decision: Address excessive useState/useRef usage patterns that indicate underutilization of React Router 7's built-in features. Agents should consult React Router 7 documentation (via context7 MCP or web search) to determine the best implementation approach rather than defaulting to client-side state management.

## Progress Log
- [2026-01-15] Event: Task hub created. Investigation summary provided from handoff. Ready to begin research phase to gather reportory cursor rules and best practices.
- [2026-01-15] Event: Research phase completed. Created comprehensive research packet analyzing React Router 7 best practices, useState/useRef anti-patterns, error handling, type safety, and testing patterns. Research includes recommendations for refactoring 25 instances of useState/useRef/useEffect across 4 files. See `research/2026-01-15_react-router-7-best-practices-research.md`.
- [2026-01-15] Event: Clarification phase completed. Clarified implementation approach (two-phase: cursor rules first, then code updates), reportory access method (copy from ../reportory/), biome configuration (selective adoption), testing strategy review scope (comprehensive), and definition of done (must-haves complete, nice-to-haves as follow-up). See `clarification/2026-01-15_initial-clarification.md`.
- [2026-01-15] Event: Planning phase completed. Created comprehensive implementation plan organizing work into three tasks: (1) Review reportory's testing strategy and cursor rules, (2) Phase 1 - Bring in cursor rules from reportory, (3) Phase 3 - Update code with best practices. Plan includes detailed subtasks, acceptance criteria, testing criteria, and implementation guidance. See `plan/2026-01-15_implementation-plan.md`.

## Implementation Checklist
- [x] Research: Gather reportory cursor rules files and analyze patterns
- [x] Research: Review reportory test utilities (`app/lib/test-utils/router.tsx`) and testing patterns
- [x] Research: Research React Router 7 best practices via context7 MCP (error handling, type safety, state management patterns)
- [x] Plan: Create implementation plan for adopting cursor rules
- [x] Plan: Create implementation plan for code updates
- [ ] Implement: Create/update cursor rules files (error-handling.mdc, enhanced react-router-7.mdc, testing-best-practices.mdc, useEffect-patterns.mdc, cursor-rules.mdc)
- [ ] Implement: Update `apps/ralph-monitoring/app/routes/tasks.$taskId.tsx` (add Route types, replace new Response() with data())
- [ ] Implement: Update `apps/ralph-monitoring/app/routes/_index.tsx` (add Route types)
- [ ] Implement: Update `apps/ralph-monitoring/app/routes/api.logs.$taskId.ts` (review type safety, error handling)
- [ ] Implement: Update `apps/ralph-monitoring/app/routes/api.tasks.$taskId.stop.ts` (review type safety, error handling)
- [ ] Implement: Update `apps/ralph-monitoring/app/root.tsx` (ErrorBoundary to use useRouteError())
- [ ] Implement: Create `apps/ralph-monitoring/app/lib/test-utils/router.tsx` (test utilities from reportory)
- [ ] Implement: Create test files for routes (tasks.$taskId.test.tsx, _index.test.tsx)
- [ ] Verify: Run `bun run typecheck` and fix type errors
- [ ] Verify: Run `bun run lint` and ensure biome passes with reportory standards
- [ ] Verify: Run `bun run test` and ensure all tests pass
- [ ] Verify: Review all routes use generated Route.* types
- [ ] Verify: Review all error handling uses data() helper
- [ ] Verify: Review ErrorBoundary uses framework helpers

## Open Questions
- [RESOLVED] Where is the reportory project located? → Located in `../reportory/` sibling directory (verified accessible)
- [RESOLVED] Should biome configuration be updated to match reportory standards exactly? → Selective adoption based on project needs (validated in clarification)

## References
- Product Mission: `.devagent/workspace/product/mission.md` (2026-01-15) — DevAgent mission for reusable agent-ready prompts and workflows
- Tech Stack: `.devagent/workspace/memory/tech-stack.md` (2026-01-15) — DevAgent tech stack documentation
- Constitution: `.devagent/workspace/memory/constitution.md` (2026-01-15) — DevAgent constitution with delivery principles
- Current React Router Rules: `.cursorrules/react-router-7.mdc` (2026-01-15) — Basic React Router 7 rules (48 lines, needs enhancement)
- Current Monorepo Rules: `.cursorrules/monorepo.mdc` (2026-01-15) — Monorepo cursor rules
- Ralph Monitoring App: `apps/ralph-monitoring/` (2026-01-15) — React Router 7 app requiring cursor rules adoption
- Ralph Monitoring Package: `apps/ralph-monitoring/package.json` (2026-01-15) — Package configuration with testing setup (vitest, @testing-library/react)
- Task Route File: `apps/ralph-monitoring/app/routes/tasks.$taskId.tsx` (2026-01-15) — Route file using `throw new Response()` instead of `data()`, missing Route types
- Root Component: `apps/ralph-monitoring/app/root.tsx` (2026-01-15) — Root component with ErrorBoundary using manual error prop instead of `useRouteError()`
- Research Packet: `research/2026-01-15_react-router-7-best-practices-research.md` (2026-01-15) — Comprehensive research on React Router 7 best practices, useState/useRef anti-patterns, error handling with data() helper, route type safety, state management patterns, and testing utilities. Includes analysis of 25 useState/useRef/useEffect instances and recommendations for refactoring.
- Clarification Packet: `clarification/2026-01-15_initial-clarification.md` (2026-01-15) — Clarified requirements including two-phase implementation approach (cursor rules first, then code updates), reportory access method, biome configuration strategy, testing strategy review scope, definition of done, scope boundaries, and verification criteria. Ready for plan creation.
- Implementation Plan: `plan/2026-01-15_implementation-plan.md` (2026-01-15) — Comprehensive implementation plan organizing work into three tasks: (1) Review reportory's testing strategy and cursor rules, (2) Phase 1 - Bring in cursor rules from reportory, (3) Phase 3 - Update code with best practices. Includes detailed subtasks, acceptance criteria, testing criteria, implementation guidance, and risk tracking.

## Next Steps

Recommended workflow sequence:

1. **Research phase:** `devagent research`
   - Gather reportory cursor rules files
   - Analyze reportory test utilities and patterns
   - Review reportory error handling and type safety patterns
   - Document differences between current implementation and reportory standards

2. **Planning phase:** `devagent create-plan`
   - Create implementation plan for cursor rules adoption
   - Create implementation plan for code updates
   - Prioritize high/medium/low priority items
   - Define verification criteria

3. **Implementation phase:** `devagent implement-plan`
   - Execute plan tasks sequentially
   - Update cursor rules files
   - Update route files with type safety
   - Update error handling patterns
   - Create test utilities and tests
   - Run verification steps
