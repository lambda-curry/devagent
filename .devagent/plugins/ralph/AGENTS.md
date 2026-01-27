# Ralph Plugin Instructions

## High-Level Execution Strategy

Ralph executes tasks autonomously with built-in quality verification. Your approach: read context → plan → implement → verify → review → commit → update status. **Key principle:** No task is complete until all validation gates pass and work is verified. You are responsible for end-to-end execution including verification and documentation.

## Beads Issue Tracking

This project uses [Beads (bd)](https://github.com/steveyegge/beads) for issue tracking. **All work must be tracked in Beads** - never use markdown TODOs or comment-based task lists.

### Core Rules

- Track ALL work in Beads (never use markdown TODOs or comment-based task lists)
- Use `bd ready --parent <EPIC_ID> --limit 200` to find available work for the current epic (default limit is 10)
- Use `bd create` to track new issues/tasks/bugs (only if discovering new work during execution)
- Always use `--json` flag for programmatic interaction with Beads CLI

### Quick Reference

```bash
bd prime                              # Load complete workflow context (AI-optimized format)
bd ready --parent <EPIC_ID> --limit 200 --json  # Show ready tasks for an epic (no blockers)
bd list --status open --json          # List all open issues
bd show <id> --json                  # Get full task details
bd update <id> --status in_progress  # Claim work
bd update <id> --status closed       # Mark complete
bd update <id> --status blocked      # Mark blocked (with reason)
bd comments add <id> "..."            # Add progress comment
bd dep add <issue> <depends-on>       # Add dependency
```

**Tip:** For multiline or markdown-heavy comments, use `bd comments add <id> -f <file>` (see `.devagent/plugins/ralph/skills/beads-integration/SKILL.md`).

### Beads Status Values

**Valid statuses:**
- `open` - Ready to be worked on (default for new tasks)
- `in_progress` - Currently being worked on
- `closed` - Work completed
- `blocked` - Blocked by dependencies or external factors

**Status workflow:**
1. Tasks start as `open` (ready for work)
2. When starting work: `bd update <id> --status in_progress`
3. When complete: `bd update <id> --status closed`
4. If blocked: `bd update <id> --status blocked` (must document reason)

### Issue Types

- `bug` - Something broken
- `feature` - New functionality
- `task` - Work item (tests, docs, refactoring)
- `epic` - Large feature with subtasks (hierarchical parent)
- `chore` - Maintenance (dependencies, tooling)

### Priorities

- `0` or `P0` - Critical (security, data loss, broken builds)
- `1` or `P1` - High (major features, important bugs)
- `2` or `P2` - Medium (default, nice-to-have)
- `3` or `P3` - Low (polish, optimization)
- `4` or `P4` - Backlog (future ideas)

### Context Loading

Run `bd prime` to get complete workflow documentation in AI-optimized format. This provides comprehensive Beads workflow context when needed.

For detailed Beads CLI reference, see `.devagent/plugins/ralph/skills/beads-integration/SKILL.md`.

### Workflow Index (Ralph Plugin)
- Setup: `.devagent/plugins/ralph/workflows/setup-ralph-loop.md` (plan → Beads + config)
- Task setup handoff: `.devagent/plugins/ralph/workflows/task-setup-handoff.md` (write a reusable setup/runbook packet)
- Execution: `.devagent/plugins/ralph/workflows/start-ralph-execution.md` (run the epic)
- Workspace: `.devagent/plugins/ralph/workflows/setup-workspace.md` (workspace/worktree preparation)
- Final review: `.devagent/plugins/ralph/workflows/final-review.md`
- Revise report: `.devagent/plugins/ralph/workflows/generate-revise-report.md`

## Objective Orchestration & Branching Protocols (C6)

When participating in a multi-epic Objective (an Admin Loop), you must follow these specialized protocols to ensure autonomous coordination across the entire tree.

### 1. Context-Aware Branching
In an objective loop, different tasks may belong to different branches. You are responsible for managing your git state autonomously.

**The Protocol:**
1. **Detect Branch Hint:** Before starting any task, check the task `description` (and older plans may use `objective`) for a line starting with `Branch: feature/...`.
2. **Autonomous Switch:** 
   - If a hint is found and you are not on that branch: 
     - `git checkout <branch>` (create it off the hub if it doesn't exist).
     - `git pull origin <branch>` (if it exists remotely).
   - If no hint is found, remain on the current working branch.
3. **Hub Operations:** For "Merge" or "Rebase" tasks, you must switch to the **Hub Branch** (defined in `config.json` or derived from context) to perform the integration.

### 2. Epic Lifecycle Management (Flow Control)
Beads dependencies only unblock when the blocker is `closed`. Therefore, you must explicitly manage the lifecycle of implementation epics to unblock the next phase of the objective.

**The Protocol:**
1. **The "Wrap up & Close" Task**: Most epics will have a final task titled "Wrap up & Close Epic". When you complete this task, you are signaling that implementation is 100% verified.
2. **Closing Epics**: After closing the final task, you MUST mark the **Epic itself** as `closed`:
   - `bd update <EPIC_ID> --status closed`
3. **Signaling Unblock**: Closing the epic is the primary signal that unblocks integration/merge tasks in the objective tree. Integration tasks are typically blocked by the Epic object, not just individual tasks.

### 3. The "Branch Hint" Pattern
To ensure you are working in the correct git context, always look for a `Branch: feature/...` hint in your task description (older tasks may say `objective`). If you see one, ensure you are on that branch before making any file changes. If you create a new branch, use the name suggested in the hint.

## Task Execution Flow

1. **Read Context:** Read task details (`bd show <task-id> --json`), **read latest task comments** (`bd comments <task-id> --json`), plan documents, and acceptance criteria. Set task status to `in_progress` immediately after confirming the latest comments.
2. **Plan:** Understand requirements, identify impacted files, and determine verification commands by reading `package.json`.
3. **Implement:** Modify code to satisfy requirements.
4. **Verify:** Run validation gates (test/lint/typecheck) and UI verification if applicable. **You MUST NOT mark task as 'closed' until ALL validation gates pass.**
5. **Review:** Self-review your work against acceptance criteria and quality standards.
6. **Commit & Push:** Create conventional commit with task ID reference AND push to the remote working branch. Prefer running `git add`/`git commit` from the repo root (or use `git -C <root>`) to avoid pathspec mistakes in monorepos.
7. **Update Status:** Mark task as `closed` (if all gates passed), `blocked` (if cannot proceed), or leave `in_progress` (if retry needed).

## Task Context & Beads Integration

**Reading Task Context:** Use `bd show <task-id> --json` to access:
- `description`: Inline task details or content from `descriptionPath`. Includes Objective, Impacted Modules/Files, References, Testing Criteria.
- `acceptance_criteria`: Success criteria
- `design`: Architecture decisions (if present)
- `notes`: Additional context - **Always check for "Plan document: <path>" and read it**
- `priority`, `labels`, `depends_on`, `parent_id`

**Reading Latest Comments (Required):** Use `bd comments <task-id> --json` before starting work. Review the most recent comments for updated guidance, QA findings, or design decisions.

**Starting Work:** Immediately set status to `in_progress` using `bd update <task-id> --status in_progress` after reading task context. **Never use `todo` or `done` as status values** - Beads uses `open` and `closed`.

**Reading Epic Context:** Use `bd show <epic-id> --json`. Epic `description` contains "Plan document: <path>" - read it for complete implementation context.

**Updating Task Metadata:** During implementation:
- Architectural decisions: `bd update <task-id> --design "<explanation>"`
- Important context: `bd update <task-id> --notes "<information>"`
- Priority adjustment: `bd update <task-id> --priority <P0|P1|P2|P3>`
- Progress comments: `bd comments add <task-id> "<update>"` (use `-f <file>` for multiline/markdown)

**Reference:** See `.devagent/plugins/ralph/skills/beads-integration/SKILL.md` for complete Beads CLI reference.

## Validation Gates

**You MUST NOT update task status to 'closed' until ALL validation gates pass.** At the start of each task, generate a dynamic checklist that adapts to task requirements, including all relevant items below plus task-specific verification steps.

**The 7-Point Validation Checklist:**

1. **Read Task & Context:** Understand requirements, plan docs, and acceptance criteria.
2. **Self-Diagnose Commands:** Read `package.json` to find actual project scripts for test, lint, and typecheck. Do not assume `npm test` works unless verified.
3. **Implementation:** Modify code to satisfy requirements.
4. **Standard Checks:** Run diagnosed commands (e.g., `npm run test:unit`, `npm run lint`). Fix any regressions.
5. **UI Pre-Checks (Before UI Verification):** **REQUIRED when UI verification is needed** - Run basic lint/typecheck or smoke test to catch blocking issues (e.g., empty string in Select components, type errors, syntax errors) before starting UI verification. This prevents UI testing from being blocked by simple errors that should be caught earlier.
6. **UI Verification:** **REQUIRED when:** file extensions indicate UI work (`.tsx`, `.jsx`, `.css`, `.html`, Tailwind config changes), task mentions UI/frontend/visual changes, or client-side state/routing logic is modified.
   - Default owner is the **QA task**. Engineering may defer UI verification to QA when a dedicated QA task exists, but must still run non-UI gates and leave a handoff comment noting the deferral.
   - If you are the QA task (or no QA task exists), run `agent-browser` to visit the local URL and perform DOM assertions (see `.devagent/plugins/ralph/skills/agent-browser/SKILL.md`).
   - **Capture failure screenshots** if assertions fail (mandatory).
   - **Capture success screenshots** only if visual design review expected (optional).
   - Avoid running long-lived dev servers inside coding steps; keep evidence capture in QA tasks unless explicitly required.
   - If browser testing cannot be completed, document reason clearly - "good enough for now" requires explicit reasoning.
7. **Add/Update Tests:** If logic changed, add unit tests. If UI changed, ensure browser checks cover it.
8. **Commit & Push:** Create conventional commit and push to the remote working branch.

**Failure Handling:** If any validation gate fails, you MUST fix the issue or mark task as 'blocked' with reason. Never proceed silently when operations fail.

## Status Management

**Agent Responsibility:** You are responsible for verifying work and managing task status. The script will not automatically close tasks.

**Status Criteria:**
- **`open`:** Ready to be worked on (default for new tasks, tasks that need retry after failure)
- **`in_progress`:** Work in progress, retry needed, or waiting for next iteration
- **`closed`:** All acceptance criteria met, all validation gates passed, work committed
- **`blocked`:** Cannot proceed due to external dependency or unresolvable issue (MUST document reason)

**QA Reopen Rule:** If QA has a high-confidence fix direction (what + where), reset the task status to `open` with a concise FAIL comment and guidance. Out-of-scope improvements should be logged for the revise report instead of reopening.

**Important:** Beads uses `open` (not `todo`) and `closed` (not `done`). Always use the correct Beads status values.

**Status Transitions:**
- **Success:** If task completed and verified, run `bd update <id> --status closed`.
- **Blocker:** If task cannot be completed, run `bd update <id> --status blocked` and document reason.
- **Retry:** If task needs more work (e.g., failed tests), leave as `in_progress`. Script will provide failure context in next iteration.

**Epic Status:** If critical path is blocked, consider blocking parent Epic if appropriate (stops autonomous execution loop).

**Decision-Making:** Infer commit type and scope from task metadata. Default to `chore` for maintenance/tooling, `feat` for new capabilities, `fix` for behavior corrections. Describe reasoning in commit body when it adds clarity.

## Commit Messaging Guidelines

Follow **Conventional Commits v1.0.0**: select type (`feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `revert`) and add meaningful `scope` when it clarifies surface area (e.g., `feat(api): add healthcheck`). Keep subject imperative, lowercase type, no trailing period, under 50 characters where practical.

**CI/CD Optimization:** By default, append `[skip ci]` to subject line for intermediate/incremental commits. Omit `[skip ci]` (trigger build) ONLY when: task is significant feature/UI change warranting preview deployment, explicitly instructed to deploy, or closing major milestone/integration point.

**Task Reference:** Include Beads task ID in subject or first line of body (e.g., `feat(api): add healthcheck endpoint (bd-1234.1)`).

**Commit Body:** Explain what changed, why, and how acceptance criteria were satisfied. Include: `Task:` (full task ID and title), `Acceptance:` (satisfied criteria), `Quality Gates:` (which gates ran and passed), `Iteration:` (Ralph iteration number), `Testing:` (commands executed or verifications performed). Optional `Notes:` for follow-up work.

**Co-author:** Preserve `Co-authored-by: Ralph <ralph@autonomous>` trailer when AI agent participates.

## Sub-Issues Context & Completion Summary (C6)

- Ralph prompts include a bounded sub-issues list (top N + remainder). Treat it as context only; do not auto-select a child when running the parent/epic.
- Prefer plan order when available; otherwise pick the next sub-issue without extra justification.
- When closing a sub-issue, add a short completion summary comment (suggested format, keep it brief):
  ```
  Summary:
  Struggles: (input for revise reports)
  Verification:
  ```

### Cross-task notes (C6)
If your work affects another task in this epic, leave a brief comment:
`bd comments add <task-id> "<message>"` (use `-f <file>` for multiline/markdown).

## Task Commenting for Traceability

**Mandatory Steps After Implementation:**
1. **Run Validation Gates:** Execute diagnosed test, lint, and typecheck commands.
2. **Commit Work:** Create git commit with conventional commit message referencing task ID.
3. **Update Task Status:** Mark as `closed` (if successful), `blocked` (if blocked), or leave `in_progress` (if retry needed).
4. **Use safe comment input:** Prefer `bd comments add <task-id> -f <file>` for multiline markdown (avoids shell interpolation).
5. **Add Comments:** After commit, add:
   ```
   Commit: <hash> - <subject>
   ```
6. **Revision Learning:** Every task must have a "Revision Learning" comment. Use format:
   ```
   Revision Learning:
   **Category**: Documentation|Process|Rules|Architecture
   **Priority**: Critical|High|Medium|Low
   **Issue**: [description]
   **Recommendation**: [actionable suggestion]
   **Files/Rules Affected**: [references]
   ```
7. **Screenshot Documentation:** If screenshots captured during browser testing, add:
   ```
   Screenshots captured: .devagent/workspace/tasks/active/YYYY-MM-DD_task-slug/screenshots/[paths]
   ```
   **Save to task folder (preferred):** `.devagent/workspace/tasks/active/YYYY-MM-DD_task-slug/screenshots/` (extract task folder from Epic's plan document path)
   **Fallback:** Epic-level `.devagent/workspace/reviews/[epic-id]/screenshots/` or task-specific `.devagent/workspace/reviews/[epic-id]/[task-id]/screenshots/` if task folder cannot be determined.

**Quality Gate Failures:** Document which gates failed and what needs fixing. For multi-task commits, cite each task ID in comments.

## Ralph Configuration & Validation

**Git Configuration:** Ralph requires explicit branch configuration in `config.json`:
- `git.base_branch`: Base branch name (e.g., "main")
- `git.working_branch`: Working branch name (e.g., "ralph-<plan-title-slug>")

**Pre-Execution Validation:** Before starting the execution loop, `ralph.sh` validates:
- Epic exists in Beads database (`bd show <epic-id>`)
- Working branch exists locally
- Current branch matches `working_branch` from config

**Branch Setup:** Branch creation/switching is intentionally **out of scope** for `setup-ralph-loop`. Users must create and check out the desired working branch themselves, then set `git.base_branch` and `git.working_branch` in `config.json` accordingly.

**Error Handling:** All validation failures result in immediate script exit with clear error messages. Users must ensure branches are created and configured before running Ralph.

## Epic Quality Gate & Retrospectives

**Epic Report:** Every Epic includes final quality gate task "Generate Epic Revise Report" that runs only after all other tasks are closed or blocked. When this task becomes ready, follow `.devagent/plugins/ralph/workflows/generate-revise-report.md`.

**Completion Verification:** Before generating report, verify all child tasks have status `closed` or `blocked` (use `bd list --parent <EpicID> --json`). Do NOT generate report mid-epic while tasks are still in progress.

**Aggregation:** Workflow aggregates all "Revision Learning" and "Commit" comments from child tasks into consolidated improvement report. Categories: **Documentation** (missing docs, outdated content, onboarding gaps), **Process** (workflow friction, automation opportunities, quality gate improvements), **Rules & Standards** (Cursor rules updates, coding standards violations, pattern inconsistencies), **Tech Architecture** (code structure issues, dependency concerns, technical debt, performance).

**Screenshot Integration:** Reports include screenshot directory references and key screenshots with descriptions. Use generated report to identify systemic issues and create new tasks for process or tooling improvements. Reports saved as `YYYY-MM-DD_<epic-id>-improvements.md` in `.devagent/workspace/reviews/`.

## References

- https://www.conventionalcommits.org/en/v1.0.0/
- Keep using the quality-gate/comment automation defined in `.devagent/plugins/ralph/tools/ralph.sh`, but apply this guidance when narrating commits and adding Beads comments.
