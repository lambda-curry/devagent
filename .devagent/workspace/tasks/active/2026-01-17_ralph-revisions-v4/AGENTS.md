# Ralph Revisions v4 [DERIVED] Progress Tracker

- Owner: Jake Ruesink
- Last Updated: 2026-01-17
- Status: Draft
- Task Hub: `.devagent/workspace/tasks/active/2026-01-17_ralph-revisions-v4/`

## Summary
Capture and track **all** actionable items discussed in the Ralph revisions v4 video, consolidated into a single task hub for follow-on research/planning/implementation. Source video: `tmp/ralph-v4.mp4` (uploaded for analysis at `https://video-query-mcp.lambdacurry.workers.dev/uploaded-file/9f409a31-9699-4afb-b608-cd1c960d183d`).

## Agent Update Instructions
- Always update "Last Updated" to today's date (ISO: YYYY-MM-DD) when editing this file. **Get the current date by explicitly running `date +%Y-%m-%d` first, then use the output for the "Last Updated" field.**
- Progress Log: Append a new entry at the end in the form `- [YYYY-MM-DD] Event: concise update, links to files`. Do not rewrite or delete prior entries. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- Implementation Checklist: Mark items as `[x]` when complete, `[~]` for partial with a short note. Add new items if discovered; avoid removing items—strike through only when obsolete.
- Key Decisions: Record important decisions as `- [YYYY-MM-DD] Decision: rationale, links`. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- References: Keep links current to latest spec, research, and tasks. Add additional references as they are created.
- Scope: Edits here should reflect coordination/progress only; do not include application code changes. Preserve history.

## Key Decisions
- [2026-01-17] Decision: Kanban board uses horizontal overflow (no-wrap columns) and a collapsed-by-default closed column with an accessible “Show/Hide closed” control in the Closed header; the closed toggle is a presentational preference (persisted locally) and is overridden by explicit status filtering. (Ref: `.devagent/workspace/tasks/active/2026-01-17_ralph-revisions-v4/design/kanban-scroll-and-closed-toggle.md`)

## Progress Log
- [Date] Event: Status update, key actions, references to files (spec, research, task plans, prompts).
(Append new entries here, preserving historical entries to maintain a progress timeline.)

- [2026-01-17] Event: Expanded checklist items with additional context/acceptance criteria extracted from v4 video (`https://video-query-mcp.lambdacurry.workers.dev/uploaded-file/9f409a31-9699-4afb-b608-cd1c960d183d`).
- [2026-01-17] Event: Created implementation plan (`.devagent/workspace/tasks/active/2026-01-17_ralph-revisions-v4/plan/2026-01-17_ralph-revisions-v4-plan.md`).
- [2026-01-17] Event: Captured kanban horizontal scroll + closed toggle UX spec for the monitoring UI. (Ref: `.devagent/workspace/tasks/active/2026-01-17_ralph-revisions-v4/design/kanban-scroll-and-closed-toggle.md`)

## Implementation Checklist
Items extracted from the video (ordered as discussed):

- [ ] Replace general agent with project manager agent as fallback. (Ref: `.devagent/plugins/ralph/agents/general-agent.json`, `.devagent/plugins/ralph/agents/project-manager-agent.json`)
  - Video context: the current “general” fallback is too broad; the fallback should instead behave like a **Project Manager** to keep execution coordinated when no specialized agent is selected.
  - Notes: Ralph agent profiles reference instruction files via `instructions_path`. Currently only the project-manager instructions exist; general/implementation/qa instruction files are missing (see `.devagent/plugins/ralph/agents/*.json`).
- [ ] Rename "Implementation Agent" → "Coder Agent" or "Engineering Agent". (Ref: `.devagent/plugins/ralph/agents/implementation-agent.json`)
  - Video context: “Implementation” was called out as too vague; a clearer role label helps the agent adopt a more concrete “engineering execution” persona.
  - Notes: This likely includes updating the agent profile `name` string and ensuring Beads labels/config mapping still match.
- [ ] Verify QA agent instructions are complete. (Ref: `.devagent/plugins/ralph/agents/qa-agent.json`)
  - Video context: QA agent instructions may be missing/incomplete; ensure the QA role has explicit, standardized guidance so validation isn’t ad-hoc.
  - Notes: The referenced instruction file path is `.devagent/plugins/ralph/agents/qa-agent-instructions.md` (currently missing).
- [ ] Auto-close epics when final subtask completes. (Ref: `.beads/issues.jsonl`)
  - Video context: epics can remain “Open” even when all sub-tasks are “Closed”, which makes the kanban misleading.
  - Acceptance criteria: when the **last** sub-task transitions to “Closed”, the parent epic should automatically transition to “Closed”.
- [ ] Sanitize secret leakage in router output (`config.env`, `taskAgents`). (Ref: `ralph.ts`)
  - Video context: router output can include sensitive env config; specifically called out: `config.env` and `taskAgents[].agent.ai_tool.env`.
  - Acceptance criteria: strip/sanitize any env blocks before returning data to the UI or logging responses.
- [ ] Add timeout/error handling to task comment retrieval. (Ref: `getTaskComments`)
  - Video context: comments loading is fragile; without timeout/error handling the UI can spin indefinitely or silently fail when underlying retrieval errors/hangs.
  - Acceptance criteria: implement a bounded timeout and return a clear error state (vs. hanging).
- [ ] Fix plan-to-beads step numbering to follow best practices. (Ref: `plan-to-beads-conversion` skill)
  - Video context: plan→beads conversion can produce misordered/corrupted step numbering, causing tasks to appear out of order and become hard to follow.
  - Acceptance criteria: generated tasks preserve the plan’s original ordering and strict sequential numbering.
- [ ] Remove dead code: delete `closeEpicIfComplete` (defined but never invoked). (Ref: backend logic)
  - Video context: `closeEpicIfComplete` exists but is not called; it adds confusion/tech debt around epic-closing behavior.
  - Acceptance criteria: remove the function (and any related unused imports/refs) unless we re-introduce it with a real call site.
- [ ] Optimize N+1 CLI calls for epic tasks; avoid sequential per-task `getTaskDetails`. (Ref: `getEpicTasks`)
  - Video context: epic loading does per-task `getTaskDetails`, creating an N+1 pattern that slows down as task count grows.
  - Acceptance criteria: batch/consolidate so the epic view fetches required details in ~1 call (or a bounded number), not 1-per-task.
- [ ] Parallelize CLI process spawning for comment counts. (Ref: `getTaskCommentCounts`)
  - Video context: comment count fetch spawns a separate CLI process **sequentially** per task, causing UI stalls (time grows linearly with task count).
  - Acceptance criteria: run these in parallel (e.g. `Promise.all`) so total time approaches “slowest single call”, not sum of calls.
- [ ] Resolve type mismatch: sync `BeadsTask` interface between client router and server. (Ref: `ralph.ts`, `beads.server.ts`)
  - Video context: mismatched `BeadsTask` shapes can cause compile-time errors and runtime “missing field” UI issues.
  - Acceptance criteria: a single source of truth for the task shape that both server and client import.
- [ ] Remove unused variable `STOP_REASON`. (Ref: `ralph.sh`)
  - Video context: `STOP_REASON` is set but unused; it’s “dead env” that makes the flow harder to reason about.
  - Acceptance criteria: remove it unless we wire it through to surfaced task status in a meaningful way.
- [ ] Standardize error recoverability logic. (Ref: `apps/ralph-monitoring/app/components/LogViewer.tsx`)
  - Video context: LogViewer can get stuck in an error UI state (e.g. transient connection failures) with no clear recovery path; users end up refreshing the page.
  - Acceptance criteria: consistent state transitions + a retry mechanism that can move from error → loading/streaming.
- [ ] Guard against division-by-zero crash in epic progress summary when total = 0. (Ref: `getEpicProgressSummary`)
  - Video context: progress % computation divides by total; when total is 0 (empty/new epic), this can crash or show `NaN%`.
  - Acceptance criteria: return a safe value (e.g. 0%) when total is 0.
- [ ] Refine failure detection pattern matching to avoid false positives (e.g. "exit code: *"). (Ref: failure detection module)
  - Video context: the current matching is too broad; logs like “exit code: 0” can still get flagged as failure.
  - Acceptance criteria: only treat non-zero exit codes as failures.
- [ ] Improve error reporting to distinguish timeouts vs other failures. (Ref: process handling)
  - Video context: timeouts and crashes currently look the same in the UI; hard to know whether to optimize vs debug.
  - Acceptance criteria: surface a distinct “Timed out” reason vs “Failed” (error) reason.
- [ ] Improve `JSON.parse` failure error messages for debugging. (Ref: data parsing modules)
  - Video context: raw `JSON.parse` errors are cryptic (e.g. “Unexpected token…”), and don’t identify what failed/where it came from.
  - Acceptance criteria: wrap parsing so logs include context (source/field) and a small snippet of the offending string.
- [ ] Fix newline rendering so `\n` displays as line breaks in descriptions/comments. (Ref: task detail view)
  - Video context: task descriptions/comments display literal `\\n` instead of line breaks, harming readability.
  - Acceptance criteria: render newlines as line breaks (or run content through the same markdown pipeline that preserves line breaks).
- [ ] Standardize markdown formatting to use asterisks for bold (not underscores). (Ref: markdown rendering components)
  - Video context: bold formatting should consistently use `**bold**` instead of `__bold__` for better compatibility with common markdown parsers.
- [ ] Show missing Beads fields in task detail: `design` and `note`. (Ref: task detail view)
  - Video context: these are “first-class” Beads fields but not currently shown; users lose important context when reviewing tasks.
  - Acceptance criteria: add “Design” and “Notes” sections in the task detail view when present.
- [ ] Implement horizontal kanban scrolling (columns stay side-by-side; horizontal overflow). (Ref: kanban board)
  - Video context: columns wrap vertically on narrow widths; desired behavior is classic kanban side-by-side columns with horizontal scroll.
  - Acceptance criteria: board container scrolls horizontally; columns do not wrap.
- [ ] Add closed-task visibility toggle (Linear-like). (Ref: kanban board)
  - Video context: closed column can be huge (dozens of items), cluttering the board; inspiration cited: Linear hides/compresses completed items.
  - Acceptance criteria: toggle/collapse control in the “Closed” column header to show/hide closed tasks.
- [ ] Improve epic/task delineation (separate boards or clearer filtered views). (Ref: main UI / kanban board)
  - Video context: need a clearer separation between epics (high-level) and tasks (work items); proposed direction is a toggle/filter (e.g., “Epic view” vs “Task view”, or filter by epic).
- [ ] Remove hover eye icon from task cards (card click already opens). (Ref: kanban task cards)
  - Video context: the hover eye icon was called out as redundant UI clutter since the card itself is obviously clickable.

## Open Questions
- Which agent should be the true fallback: keep “general” as a separate role, or point `agents.general` at the project-manager agent profile (per v4 intent)?
- Should this revision be implemented as one PR or split by category (agents/docs vs backend performance vs UI)?

## References
- Video (local): `tmp/ralph-v4.mp4`
- Video (uploaded for analysis): `https://video-query-mcp.lambdacurry.workers.dev/uploaded-file/9f409a31-9699-4afb-b608-cd1c960d183d`
- Prior Ralph revision plan (context): `.devagent/workspace/tasks/completed/2026-01-14_ralph-revision-3/plan/2026-01-15_ralph-revision-3-plan.md` (fresh as of 2026-01-17)
- Workflow used: `.devagent/core/workflows/new-task.md` (fresh as of 2026-01-17)
- Implementation plan: `.devagent/workspace/tasks/active/2026-01-17_ralph-revisions-v4/plan/2026-01-17_ralph-revisions-v4-plan.md`
