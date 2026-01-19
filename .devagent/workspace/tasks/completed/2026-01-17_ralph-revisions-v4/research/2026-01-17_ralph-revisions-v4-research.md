# Research Packet — Ralph Revisions v4

- Mode: Task
- Requested By: Jake Ruesink
- Last Updated: 2026-01-17
- Storage Path: `.devagent/workspace/tasks/completed/2026-01-17_ralph-revisions-v4/research/2026-01-17_ralph-revisions-v4-research.md`
- Stakeholders: Jake Ruesink (Owner)
- Notes: Research maps each v4 video item to concrete repo locations and current state, to enable `devagent create-plan`.

## Request Overview
Research all v4 video list items and add **repo-specific context**: where each change lives, what is already implemented vs missing, and what the likely implementation approach is (without writing product code).

## Research Questions
| ID | Question | Status (Planned / Answered / Follow-up) | Notes |
| --- | --- | --- | --- |
| RQ1 | Where do “agents” live, and which agent instruction files are missing? | Answered | Ralph uses JSON agent profiles with `instructions_path` under `.devagent/plugins/ralph/agents/`. |
| RQ2 | What is the actual secret leakage risk in `ralph.ts` router output? | Answered | `router()` returns `config` (includes `ai_tool.env`) + `taskAgents[].agent.ai_tool.env`, and prints it via `JSON.stringify`. |
| RQ3 | What is the current state of epic auto-close and epic status correctness? | Answered | There is unused `closeEpicIfComplete()` logic, and `.beads/issues.jsonl` has epics incorrectly typed/statused. |
| RQ4 | Where are the performance bottlenecks (N+1 / sequential CLI spawns) and why? | Answered | `getEpicTasks()` does N+1 CLI calls; `getTaskCommentCounts()` loops sequentially calling spawnSync. |
| RQ5 | Are the UI items (design/notes fields, kanban layout, eye icon) already implemented? | Answered | Design/Notes sections are already present in task detail; kanban is a 1–2 column grid (no horizontal scroll) and still uses hover “Eye” button. |
| RQ6 | What specifically is the “step numbering issue” in plan-to-beads? | Follow-up | Skill doc itself doesn’t surface a numbering bug; likely emerges in generated IDs/sorting or in conversion implementation that uses this skill. |

## Key Findings
- **Agent instruction files are referenced but missing**: only `project-manager-agent-instructions.md` exists; `general-agent-instructions.md`, `implementation-agent-instructions.md`, `qa-agent-instructions.md` are missing. (See `.devagent/plugins/ralph/agents/*.json` and `.devagent/workspace/reviews/2026-01-17_pr-48-review.md`)
- **Secret leakage is real and localized**: `.devagent/plugins/ralph/tools/ralph.ts` prints router JSON that contains `config.ai_tool.env` and `taskAgents[].agent.ai_tool.env`. This must be redacted/omitted before printing. (`.devagent/plugins/ralph/tools/ralph.ts:19-57`, `891-957`)
- **Epic correctness has two layers**:
  - **Data issue**: `.beads/issues.jsonl` has at least two “epics” stored as `issue_type:"task"` and/or with incorrect status. (`.beads/issues.jsonl` lines for `devagent-201a`, `devagent-a8fa`)
  - **Behavior issue**: the router has epic completion logic (`checkEpicCompletion`) and an unused closer (`closeEpicIfComplete`) but it’s never invoked. (`.devagent/plugins/ralph/tools/ralph.ts:646-711`)
- **Performance hotspots are confirmed by code**:
  - `getEpicTasks()` loops all tasks and calls `getTaskDetails()` per task to infer `parent_id` matches → N+1 Beads CLI calls. (`.devagent/plugins/ralph/tools/ralph.ts:545-601`)
  - `getTaskCommentCounts()` loops sequentially; this is effectively “one CLI spawn per task” in series. (`apps/ralph-monitoring/app/db/beads.server.ts:322-337`)
- **Some v4 UI items are already implemented in the monitoring app**:
  - Task detail view already renders **Design** and **Notes** sections. (`apps/ralph-monitoring/app/routes/tasks.$taskId.tsx:233-256`)
  - Kanban still uses a 1–2 column grid layout and will “wrap” columns (by design) rather than horizontal scroll. (`apps/ralph-monitoring/app/routes/_index.tsx:315-395`)
  - Hover “Eye” icon/button still exists on task cards. (`apps/ralph-monitoring/app/routes/_index.tsx:558-589`)

## Detailed Findings

### RQ1: Agent instruction files (rename general→PM fallback, rename implementation→coder, QA instructions)
**Repo reality:**
- Ralph agents are configured as JSON profiles under `.devagent/plugins/ralph/agents/*.json` with `instructions_path`.
- Examples:
  - `.devagent/plugins/ralph/agents/general-agent.json` → references `.devagent/plugins/ralph/agents/general-agent-instructions.md` (missing)
  - `.devagent/plugins/ralph/agents/implementation-agent.json` → references `.devagent/plugins/ralph/agents/implementation-agent-instructions.md` (missing)
  - `.devagent/plugins/ralph/agents/qa-agent.json` → references `.devagent/plugins/ralph/agents/qa-agent-instructions.md` (missing)
  - `.devagent/plugins/ralph/agents/project-manager-agent.json` exists, and its instruction file exists (`project-manager-agent-instructions.md`).

**Implication for v4:**
- “Replace general agent with PM fallback” likely means: update `.devagent/plugins/ralph/tools/config.json`’s `agents.general` mapping to point at the PM agent profile, or rename/repoint the “general” agent concept to the PM profile (while keeping label semantics clear).
- “Rename Implementation Agent to Coder/Engineering Agent” likely means: rename the agent profile `name` string and/or label, and ensure Beads labels match the config mapping used in `.devagent/plugins/ralph/tools/ralph.ts` (`resolveAgentForTask`).

**Evidence:**
- `.devagent/plugins/ralph/agents/project-manager-agent-instructions.md` (exists) defines PM as the default fallback + “project-manager” label behavior.
- Review doc enumerates the missing instruction files. `.devagent/workspace/reviews/2026-01-17_pr-48-review.md:61-67`

### RQ2: Secret leakage sanitization (config.env, taskAgents env)
**Where it happens:**
- `router()` returns `{ config, readyTasks, taskAgents }`. (`.devagent/plugins/ralph/tools/ralph.ts:897-927`)
- `Config` includes `ai_tool.env: Record<string,string>`. (`.devagent/plugins/ralph/tools/ralph.ts:32-57`)
- `AgentProfile.ai_tool.env?: Record<string,string>`. (`.devagent/plugins/ralph/tools/ralph.ts:19-30`)
- CLI entrypoint prints `JSON.stringify(result, null, 2)`. (`.devagent/plugins/ralph/tools/ralph.ts:948-956`)

**Why this is a security risk:**
- Any secrets in those env maps will be printed to stdout, which can be captured in logs/CI/artifacts.

**Recommendation direction (no code yet):**
- Create a `sanitizeRouterOutput()` that:
  - omits `config.ai_tool.env` (or replaces values with `{{REDACTED}}`)
  - strips `taskAgents[].agent.ai_tool.env`
  - consider omitting `config.beads_payload` if it can contain sensitive paths/data

### RQ3: Epic auto-close + epic data correctness
**Data correctness issue (Beads JSONL):**
- `devagent-201a` is currently `issue_type:"task"` but is an epic by intent. (`.beads/issues.jsonl` line with `"id":"devagent-201a"`)
- `devagent-a8fa` is `status:"open"` but appears to represent a plan/epic that should be closed when complete. (`.beads/issues.jsonl` line with `"id":"devagent-a8fa"`)

**Behavior / automation issue:**
- Router includes:
  - `checkEpicCompletion()` that already guards `totalCount === 0`. (`.devagent/plugins/ralph/tools/ralph.ts:646-668`)
  - `closeEpicIfComplete()` that closes/blocks the epic based on child task states. (`.devagent/plugins/ralph/tools/ralph.ts:670-711`)
- But `closeEpicIfComplete()` is not invoked anywhere (so it’s currently dead code). (Also called out in `.devagent/workspace/reviews/2026-01-17_pr-48-review.md:79`)

**Implementation implication:**
- If the product direction is “auto-close epics”, either:
  - invoke `closeEpicIfComplete()` from the router loop (with clear guardrails), OR
  - make the PM “final review” task the canonical closure path (as described in the plan-to-beads conversion skill), and delete this helper to avoid split-brain behavior.

### RQ4: Performance bottlenecks
**N+1 in `.devagent/plugins/ralph/tools/ralph.ts`:**
- `getEpicTasks()` runs `bd list --json` once, then loops tasks and calls `getTaskDetails(task.id)` to check `details.parent_id === epicId`. (`.devagent/plugins/ralph/tools/ralph.ts:545-585`)
- This creates O(n) `bd show` calls (worst-case per loop iteration).

**Sequential spawns in monitoring app:**
- `getTaskCommentCounts(taskIds)` loops and calls `getTaskCommentCount()` per task → which calls `getTaskComments()` → which runs `spawnSync('bd', ['comments', taskId, '--json'])`. (`apps/ralph-monitoring/app/db/beads.server.ts:268-337`)

**Recommendation direction:**
- Prefer reading from the Beads sqlite DB (if comments are accessible) for counts instead of spawning per task.
- If CLI is required, batch (if supported) or parallelize with async spawns (non-blocking), then aggregate.

### RQ5: UI/UX items (newline rendering, markdown bold, design/note fields, horizontal scrolling, closed toggle, epic/task delineation, eye icon)
**Design/Notes fields**
- Already implemented: Task detail view renders “Design” and “Notes” sections using `MarkdownSection`. (`apps/ralph-monitoring/app/routes/tasks.$taskId.tsx:246-256`)

**Kanban horizontal scroll**
- Current: `grid grid-cols-1 md:grid-cols-2` and each status section is a stacked block. (`apps/ralph-monitoring/app/routes/_index.tsx:315-395`)
- To meet “horizontal scroll columns”, likely change to a `flex flex-nowrap overflow-x-auto` container with fixed/min column widths.

**Closed toggle**
- Not currently implemented; “Closed” column always renders list. (`apps/ralph-monitoring/app/routes/_index.tsx:361-376`)

**Epic/task delineation**
- Partial: task cards can render “Sub-issues” when `task.children.length > 0`. (`apps/ralph-monitoring/app/routes/_index.tsx:525-556`)
- Remaining: likely needs a filter/view mode for epics vs tasks, or stronger visual treatment for epics.

**Remove hover eye icon**
- Still present in the “Quick Action Buttons” area. (`apps/ralph-monitoring/app/routes/_index.tsx:558-589`)

**Newline rendering**
- Renderer uses `react-markdown` (`MarkdownContent`) for descriptions/comments. (`apps/ralph-monitoring/app/components/Markdown.tsx`)
- If users still see literal `\\n`, the likely issue is upstream strings containing escaped sequences rather than actual newline chars. Fix direction: normalize input (`text.replaceAll('\\n', '\n')`) at the point we hand content to markdown (or fix at source in Beads data).

### RQ6: Plan-to-beads step numbering
**What we can confirm:**
- The plan-to-beads conversion skill documents parsing `#### Task <number>: ...` sections and generating IDs like `bd-<hash>.<task-number>`. (`.devagent/plugins/ralph/skills/plan-to-beads-conversion/SKILL.md:41-85`)
- It also appends an epic “report” task at N+1. (`SKILL.md:159-181`)

**What remains unclear ([NEEDS CLARIFICATION]):**
- The v4 “step numbering issue” likely refers to:
  - ordering/sorting issues in downstream UI (lexicographic vs numeric), OR
  - a mismatch between task numbering in plan vs generated IDs/comments, OR
  - a separate conversion implementation that does not match this spec.
- Next step: locate the actual code/workflow that performs conversion (if any) and compare behavior against this skill doc.

## Implications for Implementation
- Several v4 items are **non-codebase changes** (Beads data correction, missing instruction files) and should be treated as “blocking hygiene” before deeper refactors.
- The monitoring app already has a solid markdown pipeline; UI items mostly reduce to layout and small interaction changes (closed toggle, remove eye icon, horizontal scroll).
- The router’s JSON output should be treated as untrusted for logging: sanitize env fields before output to avoid accidental secret exposure.

## Risks & Open Questions
| Item | Type (Risk / Question) | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Auto-close epic behavior could conflict with PM final-review closure | Risk | Jake | Choose one canonical epic-closing mechanism; delete/disable the other | In planning |
| Beads CLI batching capabilities for comments/children unclear | Question | Jake | Check Beads CLI docs / schema for direct DB query options | In planning |
| “Step numbering issue” root cause not identified | Question | Jake | Find conversion implementation and reproduce misnumbering | In planning |

## Recommended Follow-ups
- Run `devagent create-plan` using this packet + the v4 task hub checklist to convert findings into an implementation plan.
- Consider a quick `devagent clarify-task` pass specifically for:
  - desired epic auto-close behavior (router-driven vs PM task-driven),
  - what “step numbering issue” refers to in practice.

## Sources
| Reference | Type | Freshness | Access Notes |
| --- | --- | --- | --- |
| `tmp/ralph-v4.mp4` | Internal video | 2026-01-17 | Local file |
| `https://video-query-mcp.lambdacurry.workers.dev/uploaded-file/9f409a31-9699-4afb-b608-cd1c960d183d` | Internal video (uploaded) | 2026-01-17 | Reusable MCP URL |
| `.devagent/workspace/tasks/completed/2026-01-17_ralph-revisions-v4/AGENTS.md` | Task hub | 2026-01-17 | Checklist + added context |
| `.devagent/workspace/reviews/2026-01-17_pr-48-review.md` | Internal review | 2026-01-17 | Consolidates many v4 issues + file pointers |
| `.devagent/plugins/ralph/tools/ralph.ts` | Source | 2026-01-17 | Router output, epic completion, failure detection |
| `apps/ralph-monitoring/app/db/beads.server.ts` | Source | 2026-01-17 | Comment retrieval/counts, BeadsTask type |
| `apps/ralph-monitoring/app/routes/_index.tsx` | Source | 2026-01-17 | Kanban layout, eye icon, epic children UI |
| `apps/ralph-monitoring/app/routes/tasks.$taskId.tsx` | Source | 2026-01-17 | Design/Notes already rendered |
| `.devagent/plugins/ralph/skills/plan-to-beads-conversion/SKILL.md` | Skill doc | 2026-01-17 | Intended conversion behavior |
| `.beads/issues.jsonl` | Internal data | 2026-01-17 | Epic/task status correctness inputs |
| `.beads/docs/CLI_REFERENCE.md`, `.beads/docs/MOLECULES.md` | Internal docs | 2026-01-17 | `--parent` creation pattern and parent-child semantics |
