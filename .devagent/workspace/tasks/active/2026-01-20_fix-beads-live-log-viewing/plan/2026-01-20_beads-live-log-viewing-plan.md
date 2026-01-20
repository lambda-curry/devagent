# Fix Beads Live Log Viewing Plan

- Owner: Jake Ruesink
- Last Updated: 2026-01-20 **Populate by running `date +%Y-%m-%d` first to get the current date in ISO format.**
- Status: Draft
- Related Task Hub: `.devagent/workspace/tasks/active/2026-01-20_fix-beads-live-log-viewing/`
- Stakeholders: Jake Ruesink (Engineering, DRI), Ralph Monitoring users (Engineering)
- Notes: Remove sections marked `(Optional)` if they do not apply.

---

## PART 1: PRODUCT CONTEXT

### Summary
Live log viewing in the Ralph monitoring UI consistently fails with a “can’t find the log files” experience, blocking the core job-to-be-done: watching what an agent is doing while a task is actively running. This plan focuses on making live logs reliable for **active** tasks (and quiet/clear for inactive tasks) by hardening log path resolution + diagnostics, aligning log production with log consumption, and improving the task detail UI behavior for “waiting for logs” vs “no live logs”.

### Context & Problem
- Current state: task detail log viewing returns a “log file not found” style failure, even when the user expects streaming logs for an active task.
- User pain: no real-time visibility into what the agent is doing while it runs.
- Additional context: a prior internal epic claims log streaming hardening work was shipped, suggesting this may be a **branch/environment mismatch** or a **regression** rather than a brand-new missing feature.

Primary evidence:
- Research packet: `.devagent/workspace/research/2026-01-20_beads-live-log-viewing-file-not-found.md`
- Related prior task: `.devagent/workspace/tasks/active/2026-01-17_fix-comments-visibility-and-realtime-log-view/`

### Objectives & Success Metrics
- When a task is considered **active**, the task detail page shows a live log experience that:
  - connects and streams when logs exist
  - clearly indicates “waiting for logs” (if logs are expected but not yet created)
  - does not degrade into a generic “can’t find log files” dead-end without diagnostics
- When a task is **inactive**, the UI does not present a failing live-log stream; it either hides the log viewer or shows a clear “no live logs for inactive tasks” state.
- Missing logs return actionable diagnostics (expected path / config hints) without exposing secrets.

### Users & Insights
- Primary users: engineers monitoring agent execution in Ralph Monitoring.
- Key insight: live log visibility is most valuable during “active work”; for inactive tasks, absence of streaming logs is expected and should not appear as an error.

Supporting context:
- `.devagent/workspace/research/2026-01-20_beads-live-log-viewing-file-not-found.md`
- `.devagent/workspace/tasks/active/2026-01-17_fix-comments-visibility-and-realtime-log-view/research/2026-01-17_comments-and-log-view-research.md`

### Solution Principles
- Prefer **clear state modeling** (active vs inactive, logs present vs not yet present) over generic error messages.
- Add **diagnostics that reduce guesswork** (expected resolved log path; which env vars were used) while avoiding leaking sensitive values.
- Align producer and consumer: the log writer and log viewer must agree on directory + filename (including any sanitization).
- Avoid treating “inactive task has no live logs” as an error state.

### Scope Definition
- **In Scope:**
  - Server-side hardening for log streaming and log-path diagnostics
  - UI behavior for active vs inactive tasks (including “waiting for logs” for active tasks)
  - Producer/consumer alignment for log file naming and directory configuration
  - Regression test coverage for the key “log not found” cases
- **Out of Scope / Future:**
  - Long-term log retention / historical log browsing for inactive tasks
  - Redesigning the log streaming protocol wholesale (unless required by a discovered platform incompatibility)
  - Building a full observability pipeline (log aggregation, indexing, etc.)

### Functional Narrative

#### Task details → Active task with live logs
- Trigger: user opens a task detail page for an active task.
- Experience narrative: log viewer connects quickly and streams live output.
- Acceptance criteria:
  - Live logs stream without showing “log not found” once the log file exists.
  - If the stream disconnects, the UI shows a recoverable state and retries appropriately (bounded retries).

#### Task details → Active task while logs are not yet created
- Trigger: user opens a task detail page immediately after a task starts.
- Experience narrative: UI shows “waiting for logs” and retries for a short bounded window.
- Acceptance criteria:
  - UI does not show a generic failure immediately.
  - If logs never appear, the UI shows a clear message including a pointer to where logs are expected.

#### Task details → Inactive task
- Trigger: user opens a task detail page for an inactive/completed task.
- Experience narrative: live log stream is not attempted; UI shows “no live logs for inactive tasks” (or hides the log viewer).
- Acceptance criteria:
  - No background streaming attempts.
  - No “can’t find log files” error for this expected case.

### Technical Notes & Dependencies (Optional)
- Log path configuration likely depends on env vars (`RALPH_LOG_DIR`, `REPO_ROOT`) and a default under `logs/ralph`.
- Streaming may depend on platform tooling (e.g., `tail -F`) which can behave differently across environments.
- This plan assumes the task detail route can determine whether a task is “active” via its loaded task state/status (exact definition captured in Risks & Open Questions).

---

## PART 2: IMPLEMENTATION PLAN

### Scope & Assumptions
- Scope focus: `apps/ralph-monitoring` task detail live log viewer + server log streaming route, plus any log writer alignment needed.
- Key assumptions:
  - “Active” can be derived from task status or an equivalent runtime indicator. **[NEEDS CLARIFICATION]**
  - The log writer should produce a file per task, named deterministically from task id (including any sanitization).
  - The monitoring app can safely emit non-sensitive diagnostics about expected log paths.
- Out of scope:
  - Historical log browsing / full log retention policy
  - Broader observability upgrades

### Implementation Tasks

#### Task 1: Harden log path resolution + add structured “log not found” diagnostics
- **Objective:** Ensure the log directory exists, and when a log file is missing, return structured, actionable diagnostics instead of a generic “file not found”.
- **Impacted Modules/Files:**
  - `apps/ralph-monitoring/app/utils/logs.server.ts`
  - `apps/ralph-monitoring/app/routes/api.logs.$taskId.stream.ts`
- **References:**
  - `.devagent/workspace/research/2026-01-20_beads-live-log-viewing-file-not-found.md`
  - `.devagent/workspace/tasks/active/2026-01-17_fix-comments-visibility-and-realtime-log-view/research/2026-01-17_comments-and-log-view-research.md`
  - `.devagent/workspace/tasks/active/2026-01-17_fix-comments-visibility-and-realtime-log-view/2026-01-17_devagent-201a-improvements.md`
- **Dependencies:** None
- **Acceptance Criteria:**
  - Log directory is created (recursive) before existence checks or streaming attempts.
  - Missing log responses include: expected resolved log file path (or safe relative form), and which env vars were consulted (names only, not values unless safe).
  - Errors remain safe (no secrets, no absolute paths if that’s considered sensitive in your environment).
- **Testing Criteria:**
  - Add/repair tests for the “missing log” response shape and status codes.
  - Validate both “directory missing” and “file missing” cases.
- **Validation Plan:** Run the monitoring app against a scenario with no `logs/ralph` directory and confirm it self-heals; hit the stream endpoint for a missing file and confirm diagnostics are actionable.

#### Task 2: Make the task detail UI stateful (active vs inactive) and add “waiting for logs” behavior for active tasks
- **Objective:** Stop showing noisy “can’t find log files” for expected cases; only attempt streaming for active tasks, and provide a “waiting for logs” UI for active tasks before logs are created.
- **Impacted Modules/Files:**
  - `apps/ralph-monitoring/app/routes/tasks.$taskId.tsx`
  - `apps/ralph-monitoring/app/components/LogViewer.tsx`
- **References:**
  - `.devagent/workspace/research/2026-01-20_beads-live-log-viewing-file-not-found.md`
  - `.devagent/workspace/tasks/active/2026-01-17_fix-comments-visibility-and-realtime-log-view/plan/2026-01-17_comments-and-log-view-plan.md`
- **Dependencies:**
  - Task 1 (so the UI can display structured diagnostics when logs never appear)
- **Acceptance Criteria:**
  - Inactive tasks: UI does not attempt to open a live log stream; user sees a clear non-error state.
  - Active tasks: UI attempts to stream logs; if logs are missing, UI shows “waiting for logs” with bounded retry/backoff before showing a final “logs not found” state.
  - “Logs not found” UI includes diagnostics from Task 1 (in a user-friendly format).
- **Testing Criteria:**
  - Component-level tests for each state (inactive, active-waiting, active-streaming, active-missing-after-retries).
- **Validation Plan:** Use one active task (real or simulated) and verify transition from “waiting” → “streaming” once the log file appears.

#### Task 3: Align log writer + log viewer contract (directory, filename, sanitization)
- **Objective:** Ensure the component that writes log files and the component that reads/streams them agree on the exact path and filename for a given task id.
- **Impacted Modules/Files:**
  - `apps/ralph-monitoring/app/utils/logs.server.ts` (reader contract)
  - `apps/ralph-monitoring/app/routes/api.logs.$taskId.stream.ts` (reader/streamer contract)
  - Likely log writer(s) in the Ralph/agent execution path **[NEEDS CLARIFICATION: exact file(s)]**
- **References:**
  - `.devagent/workspace/research/2026-01-20_beads-live-log-viewing-file-not-found.md`
  - `.devagent/workspace/tasks/active/2026-01-17_fix-comments-visibility-and-realtime-log-view/research/2026-01-17_comments-and-log-view-research.md`
- **Dependencies:**
  - Task 1 (better diagnostics to pinpoint mismatches)
- **Acceptance Criteria:**
  - For a given task id, the writer produces a log file at the same resolved path the viewer expects.
  - Any task-id sanitization is shared/consistent across writer and viewer.
- **Testing Criteria:**
  - Add a minimal integration-style test (or contract test) that asserts writer+reader agreement for representative task ids.
- **Validation Plan:** Run an agent task end-to-end and confirm the expected log file is created and streams in the UI.

#### Task 4: Prevent regressions (repair existing log stream tests and add coverage for the new UI gating)
- **Objective:** Ensure future changes do not reintroduce “always not found” or “inactive shows error” behavior.
- **Impacted Modules/Files:**
  - Existing log stream tests under `apps/ralph-monitoring/app/routes/__tests__/` **[NEEDS CLARIFICATION: exact filenames]**
  - `apps/ralph-monitoring/app/components/__tests__/LogViewer.test.tsx` (or equivalent)
- **References:**
  - `.devagent/workspace/tasks/active/2026-01-17_fix-comments-visibility-and-realtime-log-view/2026-01-17_devagent-201a-improvements.md` (notes test maintenance issues tied to permission checks)
- **Dependencies:** Tasks 1–3
- **Acceptance Criteria:**
  - Tests cover missing directory, missing file, active waiting state, inactive no-stream state.
  - Tests remain stable across platforms used in CI.
- **Testing Criteria:**
  - Run the existing test suite for `apps/ralph-monitoring` and ensure log-related tests pass.
- **Validation Plan:** Confirm the exact bug report path (“can’t find the log files”) is covered by at least one failing-then-fixed test.

### Implementation Guidance (Optional)
- **From `.devagent/workspace/research/2026-01-20_beads-live-log-viewing-file-not-found.md`:**
  - Prioritize verifying branch/environment mismatch vs true missing log creation before redesigning the viewer.

---

## Risks & Open Questions

| Item | Type (Risk / Question) | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| What exactly counts as “active”? | Question | Engineering | Define the canonical mapping (Beads status vs runtime state) and use it consistently in the UI | TBD |
| Are logs being written at all in the failing environment? | Question | Engineering | Verify log writer produces files and where; use new diagnostics to pinpoint mismatch | TBD |
| Branch divergence / regression possibility | Risk | Engineering | Confirm whether the prior “log streaming stabilization” commit is present in the deployed/running code | TBD |
| Platform/tooling differences for streaming (e.g., `tail -F`) | Risk | Engineering | Add tests/guards; if needed, replace with a more portable streaming approach | TBD |

---

## Progress Tracking
Refer to the AGENTS.md file in the task directory for instructions on tracking and reporting progress during implementation.

---

## Appendices & References (Optional)
- Task hub: `.devagent/workspace/tasks/active/2026-01-20_fix-beads-live-log-viewing/`
- Research: `.devagent/workspace/research/2026-01-20_beads-live-log-viewing-file-not-found.md`
- Related prior work:
  - `.devagent/workspace/tasks/active/2026-01-17_fix-comments-visibility-and-realtime-log-view/research/2026-01-17_comments-and-log-view-research.md`
  - `.devagent/workspace/tasks/active/2026-01-17_fix-comments-visibility-and-realtime-log-view/plan/2026-01-17_comments-and-log-view-plan.md`
  - `.devagent/workspace/tasks/active/2026-01-17_fix-comments-visibility-and-realtime-log-view/2026-01-17_devagent-201a-improvements.md`
