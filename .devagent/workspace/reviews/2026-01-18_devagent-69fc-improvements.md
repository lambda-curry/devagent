# Epic Revise Report - Ralph Revisions v4 Plan

**Date:** 2026-01-18  
**Epic ID:** `devagent-69fc`  
**Epic Status (at report time):** `open` (expected to close after this gate)  

## Executive Summary

This epic landed a full round of Ralph safety + data hygiene fixes, monitoring UI ergonomics improvements, and reliability hardening around comments + log viewing. All non-gate child tasks were already `closed` at report time; the remaining work item was this report gate (`devagent-69fc.18`). Standard quality gates (`bun run lint`, `bun run typecheck`, `bun run test`) passed.

## Status Snapshot

- **Closed:** 20 child tasks
- **Blocked:** 0 child tasks
- **In progress:** 1 task (`devagent-69fc.18`, this gate)

## Traceability Matrix

| Task ID | Title | Status | Commit(s) |
| :--- | :--- | :--- | :--- |
| `devagent-69fc.1` | Decide epic auto-close mechanism and document decision | closed | *None recorded* |
| `devagent-69fc.2` | Implement blockers & hygiene fixes (agents, secrets, Beads data, types) | closed | Commit: 6251f3bb - fix(ralph): remove blockers and redact env (devagent-69fc.2) [skip ci] |
| `devagent-69fc.2.1` | Create missing agent instruction files and align naming | closed | Commit: 6251f3bb - fix(ralph): remove blockers and redact env (devagent-69fc.2) [skip ci] |
| `devagent-69fc.2.2` | Sanitize ralph.ts router output to redact env | closed | Commit: 6251f3bb - fix(ralph): remove blockers and redact env (devagent-69fc.2) [skip ci] |
| `devagent-69fc.2.3` | Fix Beads epic data + align BeadsTask types | closed | Commit: 6251f3bb - fix(ralph): remove blockers and redact env (devagent-69fc.2) [skip ci] |
| `devagent-69fc.3` | PM checkpoint: review blockers/hygiene completion | closed | *None recorded* |
| `devagent-69fc.4` | Implement performance fixes for epic tasks and comment counts | closed | Commit: 39d38473 - perf(ralph): remove n+1 epic tasks and parallelize counts (devagent-69fc.4) [skip ci] |
| `devagent-69fc.5` | QA: verify performance improvements | closed | Commit: 39d38473<br/>Commit: 74e2c40f - test(ralph-monitoring): verify perf changes (devagent-69fc.5) [skip ci] |
| `devagent-69fc.6` | PM checkpoint: review performance phase | closed | Commit: 957c6c9a - chore(beads): record pm perf review (devagent-69fc.6) [skip ci] |
| `devagent-69fc.7` | Design: define kanban horizontal scroll + closed toggle | closed | Commit: 437af847 - docs(ralph-monitoring): spec kanban scroll + closed (devagent-69fc.7) [skip ci] |
| `devagent-69fc.8` | Design: define epic/task delineation UX | closed | Commit: 1f665273 - docs(ralph-monitoring): define epic/task ux (devagent-69fc.8) [skip ci]<br/>Commit: d408408c - chore(beads): sync issues state (devagent-69fc.8) [skip ci] |
| `devagent-69fc.9` | Design: newline normalization + markdown bold handling | closed | Commit: bc6ecd6d - docs(ralph-monitoring): newline/bold spec (devagent-69fc.9) [skip ci]<br/>Commit: f5ce9a0d - chore(beads): sync issues state (devagent-69fc.9) [skip ci] |
| `devagent-69fc.10` | Implement monitoring UI ergonomics updates | closed | Commit: 9fe39894 - feat(ralph-monitoring): refine kanban UX (devagent-69fc.10) [skip ci] |
| `devagent-69fc.11` | QA: verify monitoring UI ergonomics | closed | Commit: 9c6c815c - chore(ralph-monitoring): document UI QA (devagent-69fc.11) [skip ci] |
| `devagent-69fc.12` | PM checkpoint: review UI phase | closed | Commit: N/A (checkpoint-only; no code changes) |
| `devagent-69fc.13` | Implement error handling and reliability improvements | closed | Commit: befc6045 - fix(ralph): harden error handling (devagent-69fc.13) [skip ci]<br/>Commit: 1ac6e8c4 - chore(beads): sync issues state [skip ci] |
| `devagent-69fc.14` | QA: verify error handling + LogViewer recovery | closed | Commit: 97a35e47 - test(ralph-monitoring): cover comments timeout vs failure (devagent-69fc.14) [skip ci]<br/>Commit: 6da68566 - chore(beads): sync issues state [skip ci] |
| `devagent-69fc.15` | PM checkpoint: review error handling phase | closed | *None recorded* |
| `devagent-69fc.16` | Investigate and fix plan-to-beads step numbering | closed | Commit: ce1b865a - fix(ralph): preserve plan order for numbered tasks (devagent-69fc.16) [skip ci] |
| `devagent-69fc.17` | QA: verify plan-to-beads numbering output | closed | Commit: ce1b865a<br/>Commit: fd71a60b - chore(beads): record QA verification (devagent-69fc.17) [skip ci] |
| `devagent-69fc.18` | Generate Epic Revise Report | in_progress | *None recorded* |

## Evidence & Screenshots

- **Screenshot Directory**: N/A
- **Screenshots Captured**: 0 (noted as “none” in QA comments; verification done via tests + code review in this environment)

## Improvement Recommendations

### Documentation
- [ ] **[High]** It’s easy to miss that `bd create` disallows `--id` + `--parent`, and `bd ready --parent <epic>` won’t work until explicit parent linkage exists.
  - **Recommendation**: In `.devagent/plugins/ralph/workflows/setup-ralph-loop.md` + the plan-to-beads skill, explicitly document the 2-step pattern for explicit IDs: `bd create --id <epic>.<n>` followed by `bd update <epic>.<n> --parent <epic>` (so `bd ready --parent` behaves as expected).
  - **Files/Rules affected**: `.devagent/plugins/ralph/workflows/setup-ralph-loop.md`, `.devagent/plugins/ralph/skills/plan-to-beads-conversion/SKILL.md`
  - **Source**: `devagent-69fc.17`

- [ ] **[Low]** Beads task descriptions/notes embed absolute plan doc paths (e.g. `/Users/jaruesink/...`) which can be misleading when the repo lives elsewhere.
  - **Recommendation**: Prefer repo-relative paths in generated tasks (e.g. `.devagent/workspace/...`) and/or include both absolute + relative paths.
  - **Files/Rules affected**: plan-to-beads conversion templates/skill/workflow; Beads task templates
  - **Source**: `devagent-69fc.15`

### Process
- [ ] **[Medium]** Performance changes can be hard to validate without an explicit regression test proving parallelism / bounded calls.
  - **Recommendation**: When landing perf fixes, include at least one deterministic unit/integration test (e.g. max in-flight assertions) to prevent regressions and make QA unambiguous.
  - **Files/Rules affected**: `apps/ralph-monitoring/app/db/__tests__/beads.server.test.ts` (parallelism test); validation guidance in `.devagent/workspace/tasks/active/2026-01-17_ralph-revisions-v4/plan/2026-01-17_ralph-revisions-v4-plan.md`.
  - **Source**: `devagent-69fc.5`

- [ ] **[Medium]** Performance work was easy to validate for list views (bounded calls + concurrency), but the task-detail path still has a separate sync CLI call (`spawnSync`) that can be overlooked during “performance phase” review.
  - **Recommendation**: During performance-phase acceptance checks, explicitly review both list and detail/comment retrieval code paths for sync process execution and ensure remaining work is either in-scope for the phase or clearly handed off to the reliability/error-handling phase.
  - **Files/Rules affected**: `apps/ralph-monitoring/app/db/beads.server.ts` (comment retrieval), plan section “Task 2: Performance & Data Retrieval Improvements” in `.devagent/workspace/tasks/active/2026-01-17_ralph-revisions-v4/plan/2026-01-17_ralph-revisions-v4-plan.md`.
  - **Source**: `devagent-69fc.6`

- [ ] **[Medium]** Beads CLI comment usage is easy to get wrong: `bd comment` is deprecated and does not accept `--body`, while guidance elsewhere suggests `bd comment <id> --body`.
  - **Recommendation**: Standardize on `bd comments add <id> "..."` in docs/examples and avoid the deprecated `bd comment` subcommand.
  - **Files/Rules affected**: `.devagent/plugins/ralph/AGENTS.md` (Beads comment examples), any workflow docs referencing `bd comment --body`
  - **Source**: `devagent-69fc.8`

- [ ] **[Medium]** Adding Beads comments via shell is error-prone in zsh: backticks in paths trigger command substitution, and unquoted asterisks expand as globs, which can cause confusing failures.
  - **Recommendation**: Standardize on `bd comments add <id> "$(cat <<'EOF' ... EOF)"` for multi-line comments and avoid backticks/asterisks in unquoted arguments.
  - **Files/Rules affected**: `.devagent/plugins/ralph/AGENTS.md` (comment examples), any workflow docs that suggest `bd comment --body` or include markdown/backticks directly in CLI args
  - **Source**: `devagent-69fc.9`

- [ ] **[Medium]** QA for UI ergonomics often expects interactive verification (scroll/visual newline rendering), but in this environment we rely on Vitest + code review, so screenshot capture isn’t always feasible.
  - **Recommendation**: Add/standardize a lightweight headless UI smoke path (or agent-browser step) for the monitoring app that can capture 1-2 baseline screenshots of the kanban board and a task detail page; alternatively document that Vitest coverage is acceptable verification when screenshots aren’t available.
  - **Files/Rules affected**: `.devagent/plugins/ralph/AGENTS.md` (UI Verification + screenshots guidance), `apps/ralph-monitoring/app/routes/__tests__/_index.test.tsx`, `apps/ralph-monitoring/app/db/__tests__/beads.server.test.ts`.
  - **Source**: `devagent-69fc.11`

- [ ] **[Medium]** Beads task/epic descriptions reference an absolute plan path under `/Users/jaruesink/...`, which doesn’t exist on other machines/agents.
  - **Recommendation**: Prefer workspace-relative paths (e.g. `.devagent/workspace/tasks/...`) in Beads descriptions/notes (or include both absolute + relative), and have plan-to-beads conversion emit the relative path.
  - **Files/Rules affected**: `.devagent/plugins/ralph/skills/plan-to-beads-conversion/SKILL.md` (and/or conversion tooling), Beads task templates
  - **Source**: `devagent-69fc.12`

- [ ] **[Medium]** Error reporting for CLI/JSON boundaries lacked actionable context (what source, what output) and some tests were brittle when the same message renders in multiple UI regions.
  - **Recommendation**: Centralize JSON parsing with contextual previews (file/command + output snippet) and write UI tests using more specific queries (e.g., getAllByText / role-based selectors) when duplicate strings are expected.
  - **Files/Rules affected**: (see `devagent-69fc.13` comment; the “Files/Rules Affected” field accidentally included a large pasted blob and should be cleaned up in future learnings)
  - **Source**: `devagent-69fc.13`

- [ ] **[Medium]** Beads CLI write commands are easy to misuse (`bd comment` vs `bd comments add`), and shell interpolation can silently break task IDs / paths containing `$`.
  - **Recommendation**: Prefer `bd comments add` (new API) and always pass multi-line text via a quoted heredoc. When using git add/paths containing `$`, always single-quote the path.
  - **Files/Rules affected**: `.devagent/plugins/ralph/AGENTS.md` (Beads command examples); shell usage in docs; `apps/ralph-monitoring/app/routes/__tests__/tasks.$taskId.test.tsx` (filename contains `$`)
  - **Source**: `devagent-69fc.14`

- [ ] **[Low]** Beads CLI comment command syntax is easy to get wrong (bd comment vs bd comments add); some docs/examples still reference deprecated forms/flags.
  - **Recommendation**: Standardize docs and automation on `bd comments add <id> "..."` and avoid `bd comment --body` patterns.
  - **Files/Rules affected**: `.devagent/plugins/ralph/AGENTS.md` (task commenting examples), any internal workflow docs that reference Beads comment syntax.
  - **Source**: `devagent-69fc.7`

### Rules & Standards
- [ ] **[High]** Biome suppressions in JSX comments are ignored, and TS lib config in this app does not include `String.prototype.replaceAll`.
  - **Recommendation**: When suppressing Biome rules in TSX props, use inline `// biome-ignore` comments (not JSX `{/* ... */}`). Prefer regex/string-split replacements over `replaceAll` for compatibility.
  - **Files/Rules affected**: `apps/ralph-monitoring/app/routes/_index.tsx`; `apps/ralph-monitoring/app/db/beads.server.ts`; `biome lint/a11y/noNoninteractiveTabindex`
  - **Source**: `devagent-69fc.10`

### Tech Architecture
- [ ] **[High]** Router output and agent profiles can carry env maps that should never be emitted to logs/JSON output; instruction file paths also need a single, unambiguous resolution base (repo root) to avoid silently falling back.
  - **Recommendation**: Treat router/CLI JSON output as public-by-default and sanitize any env-like fields before printing. Resolve `instructions_path` relative to repo root (and keep agent JSON paths consistent).
  - **Files/Rules affected**: `.devagent/plugins/ralph/tools/ralph.ts`, `.devagent/plugins/ralph/agents/*.json`
  - **Source**: `devagent-69fc.2`

- [ ] **[High]** `bd list` defaults to `--limit 50`, which can silently truncate results and (when combined with per-task `bd show`) creates accidental N+1 patterns.
  - **Recommendation**: For programmatic usage, always pass `--limit 0` and prefer a bounded number of list queries (`--parent`, ID-prefix filtering) over per-issue `bd show`. For comment counts, use async process execution with a concurrency cap to avoid blocking UI loaders.
  - **Files/Rules affected**: `.devagent/plugins/ralph/tools/ralph.ts`, `apps/ralph-monitoring/app/db/beads.server.ts`
  - **Source**: `devagent-69fc.4`

- [ ] **[High]** Hierarchical Beads IDs (e.g. `<epic>.10`) were effectively ordered as strings in key paths (router selecting the first ready task; UI preserving query order), which breaks plan step order once task numbers exceed 9 (`.10` sorts before `.2`).
  - **Recommendation**: Always compare hierarchical IDs by numeric segments (split on `.` and compare numbers). Centralize this logic so both execution routing and UI rendering use the same ordering.
  - **Files/Rules affected**: `.devagent/plugins/ralph/tools/ralph.ts`, `apps/ralph-monitoring/app/db/hierarchical-id.ts`, `apps/ralph-monitoring/app/routes/_index.tsx`, `.devagent/plugins/ralph/skills/plan-to-beads-conversion/SKILL.md`
  - **Source**: `devagent-69fc.16`

## Action Items (Prioritized)

1. [ ] **[High]** Document explicit-ID parent linking pattern (`bd create --id ...` then `bd update ... --parent ...`) so `bd ready --parent` works. (Docs; `devagent-69fc.17`)
2. [ ] **[High]** Keep Ralph router output “public-by-default”: sanitize env-like fields and standardize instruction path resolution. (Architecture; `devagent-69fc.2`)
3. [ ] **[High]** Ensure hierarchical IDs are sorted numerically everywhere (router + UI). (Architecture; `devagent-69fc.16`)
4. [ ] **[High]** Avoid Biome/TS compatibility footguns in TSX suppressions and string APIs (`replaceAll`). (Rules; `devagent-69fc.10`)
5. [ ] **[Medium]** Standardize Beads comment commands + safe multi-line patterns in docs (`bd comments add` + heredocs). (Process; `devagent-69fc.7`, `.8`, `.9`, `.14`)
6. [ ] **[Medium]** Add a lightweight UI smoke/screenshot capture step (agent-browser or headless) or explicitly bless Vitest verification for UI-only changes. (Process; `devagent-69fc.11`)
7. [ ] **[Medium]** Prefer repo-relative plan document paths in Beads task templates/conversion output. (Documentation/Process; `devagent-69fc.12`, `.15`)
8. [ ] **[Medium]** When landing perf changes, add at least one deterministic test asserting bounded parallel behavior. (Process; `devagent-69fc.5`)

