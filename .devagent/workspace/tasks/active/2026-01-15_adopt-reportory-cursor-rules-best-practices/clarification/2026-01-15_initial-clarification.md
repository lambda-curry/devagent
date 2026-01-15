# Clarified Requirement Packet — Adopt Reportory Cursor Rules & Best Practices

- Requestor: Jake Ruesink (Owner)
- Decision Maker: Jake Ruesink (Owner)
- Date: 2026-01-15
- Mode: Task Clarification
- Status: Complete
- Related Task Hub: `.devagent/workspace/tasks/active/2026-01-15_adopt-reportory-cursor-rules-best-practices/`
- Notes: Clarification session in progress. Documenting answers incrementally.

## Task Overview

### Context
- **Task name/slug:** adopt-reportory-cursor-rules-best-practices
- **Business context:** Investigation identified that ralph-monitoring React Router 7 app is missing comprehensive cursor rules and best practices compared to reportory project. Current implementation has 25 instances of useState/useRef/useEffect that could be better handled by React Router 7's built-in features. Reportory has 13 comprehensive cursor rules while devagent has 2 basic rules.
- **Stakeholders:** Jake Ruesink (Owner, Decision Maker)
- **Prior work:** 
  - Research packet: `research/2026-01-15_react-router-7-best-practices-research.md` (comprehensive analysis of React Router 7 best practices, useState/useRef anti-patterns, error handling, type safety)
  - Task hub: `AGENTS.md` (task summary, phases, implementation checklist)

### Clarification Sessions
- Session 1: 2026-01-15 — Initial clarification (complete)

---

## Clarified Requirements

### Scope & End Goal

**What needs to be done?**
Adopt reportory cursor rules and best practices for ralph-monitoring React Router 7 app through a two-phase approach: (1) Bring in cursor rules from reportory (copy files, adapt repo-specific context), (2) Update code with best practices (error handling, type safety, state management refactoring).

**What's the end goal architecture or state?**
- Comprehensive cursor rules in place (error-handling.mdc, enhanced react-router-7.mdc, testing-best-practices.mdc, useEffect-patterns.mdc, cursor-rules.mdc)
- All route files use `Route.LoaderArgs` and `Route.ComponentProps` type imports
- All error handling uses `data()` helper instead of `throw new Response()`
- ErrorBoundary uses `useRouteError()` and `isRouteErrorResponse()` helpers
- State management refactored to use React Router 7 features where appropriate (URL search params, useNavigation, useFetcher)
- Test utilities created following reportory patterns
- All verification steps pass (typecheck, lint, test)

**In-scope (must-have):**
- Phase 1: Bring in cursor rules from reportory (copy files, adapt repo-specific context like paths)
- Phase 3: Update code with best practices (all code updates together after cursor rules are in place)
- Review reportory's testing strategy for best practices

**Out-of-scope (won't-have):**
- Comprehensive test coverage for all routes/components (can be added incrementally later)
- Nice-to-have items from implementation checklist (can be tracked as follow-up tasks)

**Nice-to-have (could be deferred):**
- Full test suite for all routes/components
- Additional cursor rules beyond the core set
- Advanced state management refactoring for LogViewer (if EventSource management is acceptable as-is)

---

### Technical Constraints & Requirements

**Platform/technical constraints:**
- React Router 7.7.1 (already in use)
- TypeScript with generated route types
- Biome for linting (selectively adopt best practices from reportory)
- Vitest for testing

**Quality bars:**
- `bun run typecheck` passes with all generated route types
- `bun run lint` passes (biome with selectively adopted reportory standards)
- `bun run test` passes (with new test utilities)
- All routes use generated `Route.*` types
- All error handling uses `data()` helper
- ErrorBoundary uses framework helpers

---

### Dependencies & Blockers

**Technical dependencies:**
- System: Reportory project in `../reportory/` sibling directory
- Status: Available (to be accessed for copying cursor rules and test utilities)
- Owner: External project
- Risk: Low - files can be copied directly

**Blockers or risks:**
- Reportory-specific context in cursor rules (paths, etc.) needs to be adapted for devagent repo structure
- React Router 7 type generation must be working correctly for route type safety
- State management refactoring may require careful testing to ensure filter persistence and functionality

---

### Implementation Approach

**Implementation strategy:**
- **Approach:** Two-phase implementation: (1) Cursor rules first (Phase 1), then (2) all code updates together (Phase 3)
- **Reportory access:** Copy files directly from `../reportory/` sibling directory
- **Adaptation:** Check for and update reportory-specific context (e.g., paths in cursor rules) to match devagent repo structure
- **Testing:** Review reportory's testing strategy to understand best practices before implementing

**Design principles:**
- Follow React Router 7 best practices (use framework features over client-side state management)
- Maintain type safety throughout (use generated Route types)
- Adopt reportory patterns selectively (take what's best for devagent project)
- Preserve existing functionality while improving code quality

---

### Acceptance Criteria & Verification

**How will we verify this works?**
- Run `bun run typecheck` - all types should generate correctly
- Run `bun run lint` - biome should pass with selectively adopted reportory standards
- Run `bun run test` - all tests should pass with new test utilities
- Manual review: All routes use generated `Route.*` types
- Manual review: All error handling uses `data()` helper
- Manual review: ErrorBoundary uses framework helpers (`useRouteError()`, `isRouteErrorResponse()`)
- Manual review: State management refactored appropriately (URL search params, useNavigation, useFetcher)

**What does "done" look like?**
- [x] All must-have items from implementation checklist are complete
- [x] All verification steps pass (typecheck, lint, test)
- [x] Cursor rules are in place and properly formatted
- [x] Code updates follow React Router 7 best practices
- [ ] Nice-to-have items can be tracked as follow-up tasks (not blocking completion)

---

## Assumptions Log

| Assumption | Owner | Validation Required | Validation Method | Due Date | Status |
| --- | --- | --- | --- | --- | --- |
| Reportory project is accessible in `../reportory/` sibling directory | Jake Ruesink | Yes | Verify directory exists and contains cursor rules/test utilities | 2026-01-15 | Pending |
| React Router 7 type generation is working correctly | System | Yes | Run `bun run typecheck` and verify `+types` directories are generated | 2026-01-15 | Pending |
| Biome configs are "pretty aligned" between reportory and devagent | Jake Ruesink | No | Selective adoption based on project needs | N/A | Validated |
| LogViewer EventSource management is acceptable as-is (external system integration) | Jake Ruesink | No | Review during implementation | N/A | Pending |

---

## Gaps Requiring Research

### For #ResearchAgent

**Research Question 1:** Review reportory's testing strategy comprehensively
- Context: Need to understand test utilities structure, coverage approach, workflow, and documentation
- Evidence needed: Test utilities implementation, test file examples, testing documentation, best practices guides
- Priority: High
- Blocks: Creating test utilities and establishing testing patterns

**Research Question 2:** Identify reportory-specific context in cursor rules that needs adaptation
- Context: Cursor rules may contain paths or references specific to reportory project structure
- Evidence needed: Review cursor rules files for repo-specific paths, project names, or structure references
- Priority: Medium
- Blocks: Adapting cursor rules for devagent repo structure

---

## Clarification Session Log

### Session 1: 2026-01-15
**Participants:** Jake Ruesink (Owner, Decision Maker)

**Questions Asked:**

**1. Where is the reportory project located, and how should we access its cursor rules and test utilities?**
  → **Answer: A** - It's in a sibling directory (`../reportory/`) relative to devagent, and we should copy files directly. Also check for any reportory-specific context that should be changed for our repo (like paths for cursor rules). (Jake Ruesink)

**2. For the useState/useRef refactoring work, what's the priority order for implementation?**
  → **Answer: B** - Focus on cursor rules first (Phase 1), then do all code updates together (Phase 3). (Jake Ruesink)

**3. For testing, how comprehensive should the test coverage be?**
  → **Answer:** Review reportory's testing strategy for best practices. (Jake Ruesink)

**4. For biome configuration, how should we align with reportory standards?**
  → **Answer:** They should be pretty aligned. Take what we think is best for our project (selective adoption). (Jake Ruesink)

**5. When reviewing reportory's testing strategy, what specific aspects should we focus on?**
  → **Answer: D** - All of the above, plus any testing documentation or best practices guides. Review test utilities structure and patterns, test coverage approach, testing workflow, and testing documentation/best practices guides. (Jake Ruesink)

**6. For verification, what's the definition of "done" for this task?**
  → **Answer: D** - All must-have items complete, nice-to-have items can be tracked as follow-up tasks. (Jake Ruesink)

**Ambiguities Surfaced:**
*[To be filled during clarification]*

**Conflicts Identified:**
*[To be filled during clarification]*

**Unresolved Items:**
*[To be filled during clarification]*

---

## Next Steps

### Spec Readiness Assessment
**Status:** ✅ Ready for Plan | ⬜ Research Needed | ⬜ More Clarification Needed

**Plan Readiness Assessment:**
- Are critical gaps addressed? ✅ Yes - Implementation approach, scope, verification, and dependencies are clarified
- Are there any blockers that would prevent planning? ⚠️ Minor - Need to verify reportory access and review testing strategy, but these can be handled during plan/research phase
- Is there enough information to create a plan? ✅ Yes - Two-phase approach is clear, scope is defined, verification criteria established

**Rationale:**
All critical technical dimensions are clarified:
- ✅ Scope & End Goal: Two-phase approach (cursor rules first, then code updates), end state defined
- ✅ Implementation Approach: Copy from reportory, adapt repo-specific context, selective adoption
- ✅ Dependencies: Reportory project location identified, access method confirmed
- ✅ Verification: Definition of done established (must-haves complete, nice-to-haves as follow-up)
- ✅ Testing: Review strategy defined (comprehensive review of utilities, coverage, workflow, docs)

Minor research needed (reportory testing strategy review, cursor rules adaptation) can be handled during plan creation or as part of implementation. No blocking clarification gaps remain.

---
