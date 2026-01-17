# Fix Comments Visibility and Realtime Log View Plan

- Owner: Jake Ruesink
- Last Updated: 2026-01-17
- Status: Draft
- Related Task Hub: `.devagent/workspace/tasks/active/2026-01-17_fix-comments-visibility-and-realtime-log-view/`
- Stakeholders: Jake Ruesink (Engineering, DRI), Ralph Monitoring users (Engineering)
- Notes: Remove sections marked `(Optional)` if they do not apply.

---

## PART 1: PRODUCT CONTEXT

### Summary
Comments exist in Beads but are invisible in the Ralph monitoring UI, and realtime log streaming frequently fails with "file not found." This plan adds comment visibility (counts in the list view and full comment display in task details) and hardens log streaming by ensuring log directories exist and improving error handling, so engineers can reliably monitor task progress. Research confirms CLI-based comment access and log path resolution logic already exist but are not wired into the UI. See research packet for root causes and implementation recommendations.

### Context & Problem
- Comments are stored in Beads and accessible via `bd comments <task-id> --json`, but the monitoring UI does not query or render them in list or detail views.
- The realtime log stream checks for file existence and returns 404 when logs are missing, often because the log directory is not created or configuration is incorrect, resulting in user-facing "file not found" errors.
- Implementation gaps exist in the database access layer, API/loader layer, and UI layer for comments, plus missing defensive checks for log directory creation and clearer errors for log streaming. See research: `.devagent/workspace/tasks/active/2026-01-17_fix-comments-visibility-and-realtime-log-view/research/2026-01-17_comments-and-log-view-research.md`.

### Objectives & Success Metrics
- Task list cards show comment counts for tasks that have comments.
- Task detail view renders comment history with timestamps and clear empty state when no comments exist.
- Realtime log viewer connects and streams when log files exist, and missing logs return actionable, structured errors without false "file not found" due to missing directories.
- Log directory is auto-created when missing, preventing failures due to absent `logs/ralph/`.

### Users & Insights
Primary users are engineers and operators monitoring Ralph task execution. Research shows comments are already used in Beads for status updates and error annotations, but the monitoring UI provides no visibility, reducing operational awareness. Log streaming errors further limit monitoring during active tasks. See research packet for root causes and code references.

### Solution Principles
- Prefer Beads CLI for comment retrieval to avoid coupling to internal DB schema.
- Surface comment data in UI without introducing heavy performance regressions; optimize later if needed.
- Ensure log streaming fails gracefully with clear, actionable errors.
- Follow React Router v7 patterns and existing UI conventions in the monitoring app.

### Scope Definition
- **In Scope:** CLI-based comment retrieval, comment count badge on task cards, comments section in task detail view, markdown rendering for comment bodies (or clear plaintext fallback), log directory creation, improved log stream error messaging, and log viewer handling for missing logs.
- **Out of Scope / Future:** Comment creation/editing in the UI, caching or batching optimizations beyond initial implementation, major log pipeline redesign, and platform-specific log streaming changes beyond current Node/tail approach.

### Functional Narrative

#### Task List (Cards)
- Trigger: User loads the task list with filters/search.
- Experience narrative: Each task card includes a visible comment count when comments exist, so users can identify discussion-heavy tasks at a glance.
- Acceptance criteria: Comment counts appear on cards with comments and remain hidden or zeroed for tasks without comments (per final UI decision).

#### Task Details
- Trigger: User opens a task details page.
- Experience narrative: The page shows a comments section with chronologically ordered comments, timestamps, and markdown formatting where supported.
- Acceptance criteria: Comments render reliably with an empty state when none exist; errors in fetching comments do not break the page.

#### Log Viewer
- Trigger: User opens a task details page with log viewer enabled.
- Experience narrative: Log streaming connects when logs exist; if logs are missing, the UI shows a clear message and the backend returns structured errors with diagnostics. Log directory is created automatically to prevent missing directory failures.
- Acceptance criteria: Missing directories are created; log stream errors are explicit and actionable; log viewer doesn't show "file not found" due solely to missing directories.

### Technical Notes & Dependencies (Optional)
- Uses Beads CLI (`bd comments <task-id> --json`) as the authoritative comment source.
- Log path is derived from `REPO_ROOT`/`RALPH_LOG_DIR` in `apps/ralph-monitoring/app/utils/logs.server.ts`.

---

## PART 2: IMPLEMENTATION PLAN

### Scope & Assumptions
- Scope focus: Comments visibility and log streaming stability for Ralph monitoring UI.
- Key assumptions:
  - `bd` CLI is available where the monitoring app runs.
  - Comment data shape matches `{ body: string; created_at: string }` from CLI output.
  - Log files are written to `logs/ralph/` by Ralph execution or configured `RALPH_LOG_DIR`.
  - Comment markdown rendering can use a lightweight library (or fallback to plaintext if dependency is undesirable).
- Out of scope: Comment creation in UI, advanced caching, and log pipeline redesign.

### Implementation Tasks

#### Task 1: Add comment retrieval helpers in Beads DB layer
- **Objective:** Provide stable comment and comment-count access for loaders using the Beads CLI.
- **Impacted Modules/Files:**
  - `apps/ralph-monitoring/app/db/beads.server.ts`
- **References:**
  - `.devagent/plugins/ralph/tools/ralph.ts` (comment retrieval pattern)
  - `.devagent/workspace/tasks/active/2026-01-17_fix-comments-visibility-and-realtime-log-view/research/2026-01-17_comments-and-log-view-research.md`
- **Dependencies:** None.
- **Acceptance Criteria:**
  - New helper returns parsed comment arrays and safely handles CLI failures by returning `[]`.
  - Comment count helper returns numeric counts for provided task IDs.
  - Invalid task IDs or CLI errors do not crash the loader.
- **Testing Criteria:**
  - If adding tests, use Vitest and follow React Router testing guidance.
  - Manual validation: run the app locally and confirm loaders receive comment counts and comments without runtime errors.
- **Validation Plan:** Validate via local run: list view shows counts and detail view shows comments without server errors.

#### Task 2: Wire comments into list/detail loaders and UI
- **Objective:** Display comment counts on task cards and full comments in task details.
- **Impacted Modules/Files:**
  - `apps/ralph-monitoring/app/routes/_index.tsx`
  - `apps/ralph-monitoring/app/routes/tasks.$taskId.tsx`
  - `apps/ralph-monitoring/app/components/Comments.tsx` (new)
  - `apps/ralph-monitoring/app/components/ui/*` (if needed for badges/typography)
- **References:**
  - `.devagent/workspace/tasks/active/2026-01-17_fix-comments-visibility-and-realtime-log-view/research/2026-01-17_comments-and-log-view-research.md`
- **Dependencies:** Task 1.
- **Acceptance Criteria:**
  - Task list cards display a comment count badge when comments exist.
  - Task detail view renders a comments section with timestamps and empty state.
  - Comment text renders with markdown (if adopted) or clear plaintext without breaking layout.
  - Comment retrieval failures degrade gracefully (no page crash).
- **Testing Criteria:**
  - If adding tests, use Vitest + Testing Library and avoid mocking router hooks.
  - Manual verification: open list and detail views for tasks with and without comments to confirm UI behavior.
- **Validation Plan:** Verify UI on local dev server: counts show on cards, comments section renders correctly, empty state appears when appropriate.

#### Task 3: Stabilize log directory and improve stream error handling
- **Objective:** Prevent "file not found" errors caused by missing log directories and improve diagnostics for missing logs.
- **Impacted Modules/Files:**
  - `apps/ralph-monitoring/app/utils/logs.server.ts`
  - `apps/ralph-monitoring/app/routes/api.logs.$taskId.stream.ts`
  - `apps/ralph-monitoring/app/components/LogViewer.tsx` (if retry or messaging tweaks are needed)
- **References:**
  - `.devagent/workspace/tasks/active/2026-01-17_fix-comments-visibility-and-realtime-log-view/research/2026-01-17_comments-and-log-view-research.md`
- **Dependencies:** None.
- **Acceptance Criteria:**
  - Log directory is created (recursive) before existence checks or streaming attempts.
  - Streaming endpoint returns structured error payloads that include expected log location or config hints.
  - Log viewer shows a clear, actionable message when logs are missing and does not loop on "file not found" without context.
- **Testing Criteria:**
  - Manual validation: delete/rename `logs/ralph/` locally and confirm directory is recreated and errors are actionable.
  - Verify streaming works when a log file exists and returns a clean error when it does not.
- **Validation Plan:** Local run with and without log files; confirm stream connection and error messaging behavior.

### Implementation Guidance (Optional)
- **From `.cursor/rules/react-router-7.mdc` -> Route type imports and package usage:**
  - Use `react-router` imports and route types from `./+types/<route-file>` for route modules. (`.cursor/rules/react-router-7.mdc`)
- **From `.cursor/rules/error-handling.mdc` -> Loader/action error handling:**
  - Use `throw data()` for expected errors in loaders/actions and let unexpected errors bubble to ErrorBoundary. (`.cursor/rules/error-handling.mdc`)
- **From `.cursor/rules/testing-best-practices.mdc` -> Testing stack and router tests:**
  - Use Vitest + Testing Library; prefer `createMemoryRouter` and avoid mocking router hooks. (`.cursor/rules/testing-best-practices.mdc`)
- **From `.cursor/rules/useEffect-patterns.mdc` -> Effects for external systems:**
  - Use effects only to synchronize with external systems (e.g., SSE/EventSource), avoid derived-state effects. (`.cursor/rules/useEffect-patterns.mdc`)

---

## Risks & Open Questions

| Item | Type (Risk / Question) | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Comment count performance for many tasks | Risk | Engineering | Start with CLI-based counts; consider batching or caching if performance issues appear | TBD |
| Markdown rendering library choice | Question | Engineering | Decide on `react-markdown` + `remark-gfm` vs plaintext fallback | TBD |
| Log file location/configuration | Question | Engineering | Validate `REPO_ROOT`/`RALPH_LOG_DIR` across environments; add diagnostics | TBD |
| Log file creation timing (race condition) | Risk | Engineering | Add retry/backoff messaging in LogViewer if files appear late | TBD |

---

## Progress Tracking
Refer to the AGENTS.md file in the task directory for instructions on tracking and reporting progress during implementation.

---

## Appendices & References (Optional)
- Research: `.devagent/workspace/tasks/active/2026-01-17_fix-comments-visibility-and-realtime-log-view/research/2026-01-17_comments-and-log-view-research.md`
- Beads CLI pattern: `.devagent/plugins/ralph/tools/ralph.ts`
- Code references:
  - `apps/ralph-monitoring/app/db/beads.server.ts`
  - `apps/ralph-monitoring/app/routes/_index.tsx`
  - `apps/ralph-monitoring/app/routes/tasks.$taskId.tsx`
  - `apps/ralph-monitoring/app/components/LogViewer.tsx`
  - `apps/ralph-monitoring/app/utils/logs.server.ts`
  - `apps/ralph-monitoring/app/routes/api.logs.$taskId.stream.ts`
