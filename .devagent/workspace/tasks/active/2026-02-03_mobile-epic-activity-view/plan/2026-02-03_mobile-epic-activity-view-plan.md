# Mobile Epic Activity View Plan

- Owner: Jake Ruesink
- Last Updated: 2026-02-03
- Status: Draft
- Related Task Hub: `.devagent/workspace/tasks/active/2026-02-03_mobile-epic-activity-view/`
- Stakeholders: Jake Ruesink (Product/Engineering)
- Notes: Remove sections marked (Optional) if they do not apply.

---

## PART 1: PRODUCT CONTEXT

### Summary
On-the-go users need a mobile-friendly epic view that surfaces the latest agent activity, commits, PR linkage, and realtime logs without digging into individual tasks. We will extend the existing `/epics/:epicId` view with an “Epic Activity” surface that aggregates execution logs, Beads comments (commit entries), and PR metadata, while preserving current progress and timeline functionality.

### Context & Problem
Ralph Monitoring already provides epics, task lists, timelines, and per-task logs, but the epic view lacks a concise “what just happened” feed, commit history with GitHub links, and a quick PR link. This makes it hard to quickly assess epic progress from a phone. The solution should leverage existing Beads data and run file metadata to avoid new backend dependencies while keeping the UI readable on small screens.

### Objectives & Success Metrics
- A user can open an epic on mobile and see the latest actions (exec events + comments) within a single screen.
- Commit history is visible with links to the GitHub commit page when repo metadata is available.
- PR link is shown when available; missing PRs show a clear empty state with guidance.
- Realtime logs are accessible from the epic view in ≤2 taps (via embedded LogViewer or task link).
- Existing epic progress + timeline remain intact and usable on mobile.

### Users & Insights
- Primary: on-the-go engineering leads and agents checking active epics.
- Need: fast situational awareness (what changed, what’s running, where to click next).
- Insight: commit entries are already present as Beads comments; run files can store PR URLs.

### Solution Principles
- **Mobile-first clarity**: stack key info, compress controls, avoid dense tables.
- **Reuse existing data**: rely on Beads DB + run file metadata; avoid new services.
- **Traceable links**: every commit/PR link should be explicit and dependable.
- **Token-first UI**: adhere to design tokens and spacing scale.

### Scope Definition
- **In Scope:** Epic activity aggregation; commit list parsing; PR link surfacing; epic-level log access; mobile layout refinements; tests.
- **Out of Scope / Future:** GitHub auth flows; background syncing; new DB tables; cross-project epic aggregation (unless clarified).

### Functional Narrative
#### Flow: Mobile Epic Activity
- Trigger: user opens `/epics/:epicId` on mobile.
- Experience narrative:
  - Top section shows epic title + status + progress.
  - “Activity” card shows the latest execution log events and recent comments (commit entries + revision learnings).
  - “Commits” card lists commit SHA + message, linked to GitHub when repo URL is known.
  - “PR” card shows `pr_url` (if available) or an empty state.
  - “Logs” card shows the active task selector; selecting a task opens embedded LogViewer or a direct link to task detail.
- Acceptance criteria:
  - Latest action is visible without scrolling past the fold on mobile.
  - Commit list and PR link render safely even when metadata is missing.
  - Logs are reachable and functional without leaving the epic context (or one-tap to task detail).

### Technical Notes & Dependencies (Optional)
- Data sources:
  - Beads issues + comments (`comments` table) and execution logs (`ralph_execution_log`).
  - Run file metadata for `epic.pr_url`.
- Dependency on consistent commit comment format (“Commit: <sha> - <message>”).
- Multi-project support decision is pending; current epic routes use default DB only.

---

## PART 2: IMPLEMENTATION PLAN

### Scope & Assumptions
- Scope focus: Epic activity aggregation + mobile UI on `/epics/:epicId`.
- Key assumptions:
  - Commit entries are stored as Beads comments in the standard format.
  - PR URL can be sourced from the Ralph run file `epic.pr_url` when present.
- Out of scope:
  - GitHub auth/token management.
  - Creating new DB tables or background jobs.

### Implementation Tasks

#### Task 1: Aggregate Epic Activity Data
- **Objective:** Build a server-side “activity feed” model that merges execution logs, recent comments, and task updates for an epic.
- **Impacted Modules/Files:**
  - `apps/ralph-monitoring/app/db/beads.server.ts`
  - `apps/ralph-monitoring/app/db/beads.types.ts`
  - `apps/ralph-monitoring/app/utils/epic-activity.server.ts` (new)
- **References:**
  - `apps/ralph-monitoring/app/db/beads.server.ts` (existing queries)
  - `apps/ralph-monitoring/app/components/__tests__/Comments.test.tsx` (commit comment format)
- **Dependencies:** None.
- **Acceptance Criteria:**
  - Returns a unified list of activity items with timestamps and type (execution, comment, status).
  - Commit comments are parsed into structured entries (sha + message).
  - Handles missing execution log table or comments gracefully.
- **Testing Criteria:**
  - Unit test parsing of commit comments.
  - Unit test activity aggregation ordering (most recent first).
- **Validation Plan:**
  - Vitest unit tests for aggregator + parser.

#### Task 2: Surface Epic Metadata (PR + Repo Links)
- **Objective:** Expose `pr_url` (and repo URL if available) for the epic in the loader.
- **Impacted Modules/Files:**
  - `apps/ralph-monitoring/app/utils/loop-start.server.ts` (extend or add helper)
  - `apps/ralph-monitoring/app/utils/epic-metadata.server.ts` (new)
  - `apps/ralph-monitoring/app/routes/epics.$epicId.tsx`
- **References:**
  - `.devagent/plugins/ralph/runs/ralph-monitoring-dashboard-2026-01-30.json` (epic `pr_url` example)
- **Dependencies:** Task 1 (for unified loader return shape).
- **Acceptance Criteria:**
  - Loader includes `prUrl` when present in run file; otherwise null.
  - Missing or ambiguous run files do not break epic view.
  - Repo URL source is explicit (config or derived from project path) and optional.
- **Testing Criteria:**
  - Unit test run file parsing with/without `pr_url`.
- **Validation Plan:**
  - Vitest unit tests for metadata helper.

#### Task 3: Add Mobile-Friendly Epic Activity UI
- **Objective:** Add “Activity”, “Commits”, and “PR” cards to epic detail with mobile-first layout.
- **Impacted Modules/Files:**
  - `apps/ralph-monitoring/app/routes/epics.$epicId.tsx`
  - `apps/ralph-monitoring/app/components/EpicActivity.tsx` (new)
  - `apps/ralph-monitoring/app/components/EpicCommitList.tsx` (new)
  - `apps/ralph-monitoring/app/components/EpicMetaCard.tsx` (new)
- **References:**
  - `apps/ralph-monitoring/docs/DESIGN_LANGUAGE.md`
  - `apps/ralph-monitoring/app/components/ui/*` primitives
- **Dependencies:** Tasks 1–2.
- **Acceptance Criteria:**
  - Activity feed renders recent items with clear timestamps and labels.
  - Commit list shows SHA + message, with GitHub links when repo URL is known.
  - PR card shows link if available, otherwise empty-state copy.
  - Layout stacks cleanly on mobile and remains readable on desktop.
- **Testing Criteria:**
  - Component test for empty states and list rendering.
- **Validation Plan:**
  - React Testing Library + `createRoutesStub` for route integration.

#### Task 4: Add Epic-Level Log Access
- **Objective:** Provide a log panel in epic detail that surfaces the active task’s logs (or a direct task link).
- **Impacted Modules/Files:**
  - `apps/ralph-monitoring/app/routes/epics.$epicId.tsx`
  - `apps/ralph-monitoring/app/components/EpicLogPanel.tsx` (new)
- **References:**
  - `apps/ralph-monitoring/app/components/LogViewer.tsx`
- **Dependencies:** Task 1 (activity/task selection data).
- **Acceptance Criteria:**
  - Default selection prefers `in_progress` task when available.
  - Users can switch tasks to view logs or navigate to task detail.
  - Handles cases where logs do not exist (clear empty state).
- **Testing Criteria:**
  - Component test with active vs inactive tasks.
- **Validation Plan:**
  - Unit/component tests; no new end-to-end automation required.

### Implementation Guidance
- **From `ai-rules/.generated-ai-rules/ai-rules-generated-react-router-7.md` → Route patterns:**
  - Use `data()` for loader responses and `throw data()` for expected errors; keep route type imports as `./+types/...`.
- **From `ai-rules/.generated-ai-rules/ai-rules-generated-error-handling.md` → Error handling:**
  - Prefer framework-native error boundaries; avoid wrapper error classes; throw `data()` for expected failures.
- **From `ai-rules/.generated-ai-rules/ai-rules-generated-testing-best-practices.md` → Testing:**
  - Use `createRoutesStub` for component-level routing tests and avoid mocking router hooks.
- **From `apps/ralph-monitoring/docs/DESIGN_LANGUAGE.md` → Design tokens:**
  - Use token-backed Tailwind classes only (`bg-*`, `text-*`, `border-*`), respect spacing scale (`--space-*`), and maintain light/dark parity.

---

## Risks & Open Questions

| Item | Type (Risk / Question) | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Should epics be project-scoped for multi-project setups? | Question | Jake Ruesink | Decide before implementation; adjust routes + DB access if needed. | TBD |
| Commit parsing depends on consistent comment format. | Risk | Eng | Add parser tests + fallbacks; document expected format. | TBD |
| PR link source may be missing for older epics. | Risk | Eng | Display empty state + guidance; allow manual link later if needed. | TBD |
| Repo URL source for commit links is undefined. | Question | Eng | Decide on config location (projects config vs env). | TBD |

---

## Progress Tracking
Refer to the AGENTS.md file in the task directory for instructions on tracking and reporting progress during implementation.

---

## Appendices & References (Optional)
- Research: `.devagent/workspace/tasks/active/2026-02-03_mobile-epic-activity-view/research/2026-02-03_mobile-epic-activity-view.md`
- Epic routes: `apps/ralph-monitoring/app/routes/epics._index.tsx`, `apps/ralph-monitoring/app/routes/epics.$epicId.tsx`
- Data sources: `apps/ralph-monitoring/app/db/beads.server.ts`, `apps/ralph-monitoring/app/db/beads.types.ts`
- UI tokens: `apps/ralph-monitoring/docs/DESIGN_LANGUAGE.md`
- Testing guidance: `ai-rules/.generated-ai-rules/ai-rules-generated-testing-best-practices.md`
