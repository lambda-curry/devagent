# Ralph Revisions v4 Plan

- Owner: Jake Ruesink
- Last Updated: 2026-01-17
- Status: Draft
- Related Task Hub: `.devagent/workspace/tasks/active/2026-01-17_ralph-revisions-v4/`
- Stakeholders: Jake Ruesink (Owner), Ralph plugin maintainers (Consulted), Ralph monitoring users (Informed)
- Notes: Plan grounded in v4 task hub + research packet; file paths and current-state notes referenced throughout.

---

## PART 1: PRODUCT CONTEXT

### Summary
Ralph Revisions v4 focuses on tightening the Ralph plugin’s core safety, data hygiene, and monitoring experience based on the v4 walkthrough. The plan removes known blockers (missing agent instructions, secret leakage, epic status inconsistencies), addresses performance bottlenecks in task/comment retrieval, improves monitoring UI ergonomics, and hardens error reporting so operators can trust what they see during autonomous runs.

### Context & Problem
The v4 video surfaced multiple issues in Ralph’s current workflow: missing agent instruction files and unclear fallback behavior, Beads epic data inconsistencies, possible secret leakage in router output, performance slowdowns due to N+1 CLI calls, and UX friction in the monitoring UI (kanban wrapping, cluttered actions, poor newline rendering). Research mapped each item to specific repo files and confirmed what is already implemented vs missing. (Ref: `.devagent/workspace/tasks/active/2026-01-17_ralph-revisions-v4/AGENTS.md`, `.devagent/workspace/tasks/active/2026-01-17_ralph-revisions-v4/research/2026-01-17_ralph-revisions-v4-research.md`, `.devagent/workspace/reviews/2026-01-17_pr-48-review.md`)

### Objectives & Success Metrics
- **Safety:** Router output never emits `config.ai_tool.env` or `taskAgents[].agent.ai_tool.env` values; log output is safe by default.
- **Hygiene:** All referenced agent instruction files exist; agent naming/fallback configuration matches v4 intent; Beads epics use correct `issue_type` + status.
- **Performance:** Epic task retrieval no longer performs N+1 CLI calls; comment counts are fetched in parallel; UI remains responsive with larger task sets.
- **UX Clarity:** Kanban columns scroll horizontally (no wrap), closed tasks can be toggled, redundant eye icon removed, newline rendering is legible, and epic/task separation is clearer.
- **Reliability:** Timeouts and failures are distinguishable, failure detection avoids false positives, JSON parse errors include context, and LogViewer can recover without page refresh.
- **Conversion Integrity:** Plan-to-Beads step numbering preserves plan order and produces stable, sequential task ordering.

### Users & Insights
- **Primary users:** Developers/operators running Ralph autonomously and monitoring progress in the Ralph monitoring UI.
- **Insights:** The v4 video explicitly calls out lost clarity from missing instructions, UI clutter, and ambiguous failure states; performance bottlenecks are visible as UI stalls and slow epic loading.

### Solution Principles
- **Security first:** Never leak secrets to router output or logs.
- **Single source of truth:** Align agent roles, Beads task shapes, and epic completion logic to avoid split-brain behavior.
- **Operator clarity:** UI should prioritize readability and recovery (clear errors, legible content, simplified interactions).
- **Incremental improvement:** Prefer targeted changes to the existing monitoring UI and router logic over major refactors.

### Scope Definition
- **In Scope:** Agent instruction files + naming, agent fallback configuration, router output sanitization, Beads epic data fixes, epic auto-close decision, performance fixes in `getEpicTasks`/comment counts, UI ergonomics (kanban layout, closed toggle, eye icon removal, newline rendering, markdown bold normalization, epic/task separation), error handling improvements (timeouts, failure detection, JSON.parse context, LogViewer recovery), plan-to-beads step numbering fix.
- **Out of Scope / Future:** New monitoring features beyond v4 list, large-scale UI redesign, additional automation beyond epic close decision, changing Beads data model/CLI behavior outside required corrections.

### Functional Narrative
#### Agent fallback + execution hygiene
- **Trigger:** Ralph runs without a specialized agent.
- **Experience narrative:** Ralph defaults to a clear project-manager fallback with complete instruction coverage; agent profiles and instructions are consistent and traceable.
- **Acceptance criteria:** All referenced instruction files exist; fallback is aligned with the chosen PM vs general direction.

#### Monitoring + epic/task visibility
- **Trigger:** Operator opens the monitoring UI to review epics, tasks, and comments.
- **Experience narrative:** Kanban columns remain side-by-side with horizontal scroll, closed tasks can be collapsed, redundant buttons are removed, and task descriptions render line breaks correctly. Epic/task separation is visible via view toggle or filter.
- **Acceptance criteria:** Kanban no longer wraps; closed toggle works; eye icon removed; newline rendering is readable; epic/task view separation exists.

#### Epic/plan conversion + failure diagnostics
- **Trigger:** Plan-to-Beads conversion or Ralph execution emits progress/failure details.
- **Experience narrative:** Task ordering stays consistent with the plan, timeout errors are explicit, and failure detection is accurate (non-zero exits only).
- **Acceptance criteria:** Numbering is stable; timeouts display as distinct from failures; false-positive failures reduced.

### Technical Notes & Dependencies
- Beads CLI/API capabilities for batching and comment retrieval may constrain performance improvements; verify if DB access or batch commands exist before refactoring CLI usage.
- Epic auto-close must choose a single canonical mechanism: router-driven auto-close vs PM final-review task closure (per plan-to-beads skill).
- Step numbering issue requires locating the actual conversion implementation (skill-only vs code workflow) before changing behavior.

---

## PART 2: IMPLEMENTATION PLAN

### Scope & Assumptions
- Scope focus: Ralph plugin + monitoring UI revisions based on v4 checklist.
- Key assumptions:
  - Router output is the only place env data leaks today.
  - Plan-to-beads conversion logic may live only in skill/workflow guidance (not code); verification needed.
  - Monitoring app uses React Router v7 and existing markdown pipeline (`Markdown.tsx`).
- Out of scope: Net-new monitoring features not listed in v4.

### Implementation Tasks

#### Task 1: Blockers & Hygiene (Agents, Secrets, Beads Data, Type Alignment)
- **Objective:** Remove immediate blockers by completing agent instruction files, fixing agent naming/fallback, sanitizing router output, correcting Beads epic data, aligning Beads task types, and resolving dead code.
- **Impacted Modules/Files:**
  - `.devagent/plugins/ralph/agents/general-agent.json`
  - `.devagent/plugins/ralph/agents/implementation-agent.json`
  - `.devagent/plugins/ralph/agents/qa-agent.json`
  - `.devagent/plugins/ralph/agents/project-manager-agent.json`
  - `.devagent/plugins/ralph/agents/*-instructions.md` (create missing files)
  - `.devagent/plugins/ralph/tools/config.json` (agent fallback mapping)
  - `.devagent/plugins/ralph/tools/ralph.ts` (router output, epic close logic, shared types)
  - `.devagent/plugins/ralph/tools/ralph.sh` (remove `STOP_REASON`)
  - `.beads/issues.jsonl` (epic issue_type/status corrections)
  - `apps/ralph-monitoring/app/db/beads.server.ts` (BeadsTask type alignment)
- **References:**
  - `.devagent/workspace/tasks/active/2026-01-17_ralph-revisions-v4/research/2026-01-17_ralph-revisions-v4-research.md`
  - `.devagent/workspace/reviews/2026-01-17_pr-48-review.md`
- **Dependencies:**
  - Decide epic auto-close mechanism (router-driven vs PM final-review task)
- **Acceptance Criteria:**
  - Missing instruction files exist and are referenced correctly in agent profiles.
  - Agent fallback is updated to PM (or explicitly documented if retained as “general”).
  - Router output redacts/omits env data (`config.ai_tool.env`, `taskAgents[].agent.ai_tool.env`).
  - Beads epics (`devagent-201a`, `devagent-a8fa`) have correct `issue_type` and status.
  - `BeadsTask` shape is shared between router and server (no mismatch).
  - `STOP_REASON` removed or wired into meaningful surfaced status (no dead env).
  - `closeEpicIfComplete` is either removed or wired with a clear call site consistent with the chosen epic-close mechanism.
- **Testing Criteria:**
  - `bun run typecheck`
  - `bun run lint`
  - `bun run test` (or scoped app tests if applicable)
- **Subtasks (optional):**
  1. Create missing instruction files and update agent labels/names where needed.
     - Validation: Ensure instruction paths resolve and agent names are consistent with config.
  2. Sanitize router output (strip env maps) and verify CLI output contains no env keys.
     - Validation: Manual inspection of router JSON output from CLI run.
  3. Correct Beads epic data and align BeadsTask type definitions.
     - Validation: `bd show <epic-id> --json` reflects correct type/status; TypeScript types compile.
- **Validation Plan:** Run lint/typecheck/tests; verify CLI output for env redaction and Beads epic status.

#### Task 2: Performance & Data Retrieval Improvements
- **Objective:** Eliminate N+1 CLI calls for epic tasks and parallelize comment count retrieval to reduce UI stalls.
- **Impacted Modules/Files:**
  - `.devagent/plugins/ralph/tools/ralph.ts` (`getEpicTasks`, `getTaskDetails` usage)
  - `apps/ralph-monitoring/app/db/beads.server.ts` (`getTaskCommentCounts`, `getTaskComments`)
- **References:**
  - `.devagent/workspace/tasks/active/2026-01-17_ralph-revisions-v4/research/2026-01-17_ralph-revisions-v4-research.md`
- **Dependencies:**
  - Confirm Beads CLI supports batching or DB access to avoid per-task calls.
- **Acceptance Criteria:**
  - `getEpicTasks()` no longer performs one `bd show` per task; parent-child mapping is computed with a bounded number of calls.
  - Comment counts are fetched in parallel; total time scales with the slowest call, not the sum.
  - UI continues to display comment counts and epic task lists correctly.
- **Testing Criteria:**
  - `bun run typecheck`
  - `bun run lint`
  - `bun run test` (or app tests covering task list/comment count behavior)
- **Validation Plan:** Manual smoke test of epic list and comment counts with multiple tasks.

#### Task 3: Monitoring UI UX Updates
- **Objective:** Improve kanban readability and remove UI clutter while fixing newline/markdown formatting issues.
- **Impacted Modules/Files:**
  - `apps/ralph-monitoring/app/routes/_index.tsx` (kanban layout, closed toggle, eye icon removal, epic/task filter)
  - `apps/ralph-monitoring/app/components/Markdown.tsx` (newline normalization, bold formatting)
  - `apps/ralph-monitoring/app/routes/tasks.$taskId.tsx` (verify design/notes already present; ensure no regression)
- **References:**
  - `.devagent/workspace/tasks/active/2026-01-17_ralph-revisions-v4/research/2026-01-17_ralph-revisions-v4-research.md`
- **Dependencies:**
  - Decide how epic/task delineation should appear (toggle vs filter vs separate section).
- **Acceptance Criteria:**
  - Kanban columns scroll horizontally and do not wrap on narrow widths.
  - Closed column supports show/hide toggle (Linear-like).
  - Hover eye icon removed from task cards without losing click affordance.
  - Newlines render as line breaks for descriptions/comments (no literal `\\n`).
  - Markdown bold uses `**` formatting or input is normalized accordingly.
  - Design/Notes sections remain visible when present (already implemented).
- **Testing Criteria:**
  - `bun run typecheck`
  - `bun run lint`
  - `bun run test` (if route/component tests exist)
- **Validation Plan:** UI smoke test in monitoring app; verify kanban scroll, toggle, and content rendering.

#### Task 4: Error Handling & Reliability
- **Objective:** Make failures/timeout states explicit, reduce false positives, and allow log view recovery without refresh.
- **Impacted Modules/Files:**
  - `apps/ralph-monitoring/app/db/beads.server.ts` (`getTaskComments` timeout/error handling)
  - `.devagent/plugins/ralph/tools/ralph.ts` (failure detection, timeout vs failure reasoning, JSON.parse error context)
  - `apps/ralph-monitoring/app/components/LogViewer.tsx` (recoverability + shared logic)
  - Any progress summary helper used for epics (locate implementation referenced in research)
- **References:**
  - `.devagent/workspace/tasks/active/2026-01-17_ralph-revisions-v4/research/2026-01-17_ralph-revisions-v4-research.md`
  - `.devagent/workspace/reviews/2026-01-17_pr-48-review.md`
- **Dependencies:**
  - Locate the concrete implementation of `getEpicProgressSummary` (only referenced in research today).
- **Acceptance Criteria:**
  - Task comment retrieval times out with a clear error state (no infinite spinner).
  - Failure detection only flags non-zero exit codes; `exit code: 0` never marked as failure.
  - Timeout failures are explicitly labeled as timeouts (distinct from “Failed”).
  - JSON parse errors include source context and snippet.
  - LogViewer can recover from transient errors via retry without full page refresh.
  - Epic progress summary guards against `total === 0` wherever implemented.
- **Testing Criteria:**
  - `bun run typecheck`
  - `bun run lint`
  - `bun run test` (or add/adjust tests around LogViewer and error handling)
- **Validation Plan:** Manual test of failure/timeout states in UI; verify error transitions in LogViewer.

#### Task 5: Plan-to-Beads Step Numbering Investigation & Fix
- **Objective:** Identify the actual conversion implementation and ensure step numbering preserves plan order with stable sequential IDs.
- **Impacted Modules/Files:**
  - `.devagent/plugins/ralph/skills/plan-to-beads-conversion/SKILL.md`
  - `.devagent/plugins/ralph/commands/execute-autonomous.md` (if conversion steps are described)
  - `.devagent/plugins/ralph/workflows/execute-autonomous.md` (if conversion steps are scripted)
  - Any live conversion script/tooling if found (search needed)
- **References:**
  - `.devagent/workspace/tasks/active/2026-01-17_ralph-revisions-v4/research/2026-01-17_ralph-revisions-v4-research.md`
- **Dependencies:**
  - Locate conversion workflow used during execution (skill-only vs script).
- **Acceptance Criteria:**
  - Root cause of numbering issue identified (ordering, ID format, or sorting layer).
  - Conversion output preserves plan ordering and sequential numbering.
  - Documentation or implementation updated to match the fix.
- **Testing Criteria:**
  - Run conversion on a sample plan and confirm ordering in Beads (manual verification).
- **Validation Plan:** Use a known plan doc and confirm task IDs/ordering in Beads UI/CLI.

### Implementation Guidance
- **From `.devagent/plugins/ralph/AGENTS.md` → Validation Gates:**
  - Work should not be marked complete until lint/typecheck/tests (and UI verification for UI changes) pass; use Beads statuses `open`, `in_progress`, `closed`, `blocked`.
- **From `.cursor/rules/error-handling.mdc` → Error Handling:**
  - Use React Router v7’s built-in error handling (`throw data()` for expected errors, let unexpected errors bubble to ErrorBoundary).
- **From `.cursor/rules/react-router-7.mdc` → Route Types:**
  - Always import route types from `./+types/<route>`; never use `react-router-dom`.
- **From `.cursor/rules/testing-best-practices.mdc` → Testing:**
  - Use Vitest + Testing Library patterns; prefer `createMemoryRouter` and router test utilities for route/component tests.

### Release & Delivery Strategy (Optional)
- Deliver as a single PR if changes remain cohesive; consider splitting if UI and backend changes diverge significantly.

---

## Risks & Open Questions

| Item | Type (Risk / Question) | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Epic auto-close should be router-driven or PM final-review task? | Question | Jake | Decide canonical closure path; remove alternate mechanism | In planning |
| Plan-to-beads step numbering issue root cause unknown | Risk | Jake | Locate conversion implementation; reproduce issue | In planning |
| Beads CLI batching/DB access limitations | Risk | Jake | Verify CLI/DB options before refactor | In planning |
| Newline rendering source of `\\n` unclear (data vs rendering) | Question | Jake | Inspect upstream strings vs renderer; normalize at best layer | In planning |
| Epic progress summary division-by-zero location unknown | Question | Jake | Locate actual implementation and add guard | In planning |

---

## Progress Tracking
Refer to the AGENTS.md file in the task directory for instructions on tracking and reporting progress during implementation.

---

## Appendices & References (Optional)
- Task Hub: `.devagent/workspace/tasks/active/2026-01-17_ralph-revisions-v4/AGENTS.md`
- Research: `.devagent/workspace/tasks/active/2026-01-17_ralph-revisions-v4/research/2026-01-17_ralph-revisions-v4-research.md`
- Review notes: `.devagent/workspace/reviews/2026-01-17_pr-48-review.md`
- Agent guidance: `AGENTS.md` (root), `.devagent/core/AGENTS.md`, `.devagent/plugins/ralph/AGENTS.md`
- Cursor rules: `.cursor/rules/error-handling.mdc`, `.cursor/rules/react-router-7.mdc`, `.cursor/rules/testing-best-practices.mdc`
