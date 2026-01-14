# Ralph Plugin Instructions

## High-Level Execution Strategy

Ralph executes tasks autonomously with built-in quality verification. Your approach: read context → plan → implement → verify → review → commit → update status. **Key principle:** No task is complete until all validation gates pass and work is verified. You are responsible for end-to-end execution including verification and documentation.

## Task Execution Flow

1. **Read Context:** Read task details (`bd show <task-id> --json`), plan documents, and acceptance criteria. Set task status to `in_progress` immediately.
2. **Plan:** Understand requirements, identify impacted files, and determine verification commands by reading `package.json`.
3. **Implement:** Modify code to satisfy requirements.
4. **Verify:** Run validation gates (test/lint/typecheck) and UI verification if applicable. **You MUST NOT mark task as 'closed' until ALL validation gates pass.**
5. **Review:** Self-review your work against acceptance criteria and quality standards.
6. **Commit:** Create conventional commit with task ID reference.
7. **Update Status:** Mark task as `closed` (if all gates passed), `blocked` (if cannot proceed), or leave `in_progress` (if retry needed).

## Task Context & Beads Integration

**Reading Task Context:** Use `bd show <task-id> --json` to access:
- `description`: Objective, Impacted Modules/Files, References, Testing Criteria
- `acceptance_criteria`: Success criteria
- `design`: Architecture decisions (if present)
- `notes`: Additional context - **Always check for "Plan document: <path>" and read it**
- `priority`, `labels`, `depends_on`, `parent_id`

**Starting Work:** Immediately set status to `in_progress` using `bd update <task-id> --status in_progress` after reading task context.

**Reading Epic Context:** Use `bd show <epic-id> --json`. Epic `description` contains "Plan document: <path>" - read it for complete implementation context.

**Updating Task Metadata:** During implementation:
- Architectural decisions: `bd update <task-id> --design "<explanation>"`
- Important context: `bd update <task-id> --notes "<information>"`
- Priority adjustment: `bd update <task-id> --priority <P0|P1|P2|P3>`
- Progress comments: `bd comment <task-id> --body "<update>"`

**Reference:** See `.devagent/plugins/ralph/skills/beads-integration/SKILL.md` for complete Beads CLI reference.

## Validation Gates

**You MUST NOT update task status to 'closed' until ALL validation gates pass.** At the start of each task, generate a dynamic checklist that adapts to task requirements, including all relevant items below plus task-specific verification steps.

**The 7-Point Validation Checklist:**

1. **Read Task & Context:** Understand requirements, plan docs, and acceptance criteria.
2. **Self-Diagnose Commands:** Read `package.json` to find actual project scripts for test, lint, and typecheck. Do not assume `npm test` works unless verified.
3. **Implementation:** Modify code to satisfy requirements.
4. **Standard Checks:** Run diagnosed commands (e.g., `npm run test:unit`, `npm run lint`). Fix any regressions.
5. **UI Verification:** **REQUIRED when:** file extensions indicate UI work (`.tsx`, `.jsx`, `.css`, `.html`, Tailwind config changes), task mentions UI/frontend/visual changes, or client-side state/routing logic is modified.
   - Reference `.devagent/plugins/ralph/skills/agent-browser/SKILL.md` for guidance
   - Run `agent-browser` to visit local URL, perform DOM assertions
   - **Capture failure screenshots** if assertions fail (mandatory)
   - **Capture success screenshots** only if visual design review expected (optional)
   - If browser testing cannot be completed, document reason clearly - "good enough for now" requires explicit reasoning.
6. **Add/Update Tests:** If logic changed, add unit tests. If UI changed, ensure browser checks cover it.
7. **Commit & Push:** Create conventional commit and push.

**Failure Handling:** If any validation gate fails, you MUST fix the issue or mark task as 'blocked' with reason. Never proceed silently when operations fail.

## Status Management

**Agent Responsibility:** You are responsible for verifying work and managing task status. The script will not automatically close tasks.

**Status Criteria:**
- **`closed`:** All acceptance criteria met, all validation gates passed, work committed.
- **`blocked`:** Cannot proceed due to external dependency or unresolvable issue (MUST document reason).
- **`in_progress`:** Work in progress, retry needed, or waiting for next iteration.

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

## Task Commenting for Traceability

**Mandatory Steps After Implementation:**
1. **Run Validation Gates:** Execute diagnosed test, lint, and typecheck commands.
2. **Commit Work:** Create git commit with conventional commit message referencing task ID.
3. **Update Task Status:** Mark as `closed` (if successful), `blocked` (if blocked), or leave `in_progress` (if retry needed).
4. **Add Comments:** After commit, add:
   ```
   Commit: <hash> - <subject>
   ```
5. **Revision Learning:** Every task must have a "Revision Learning" comment. Use format:
   ```
   Revision Learning:
   **Category**: Documentation|Process|Rules|Architecture
   **Priority**: Critical|High|Medium|Low
   **Issue**: [description]
   **Recommendation**: [actionable suggestion]
   **Files/Rules Affected**: [references]
   ```
6. **Screenshot Documentation:** If screenshots captured during browser testing, add:
   ```
   Screenshots captured: .devagent/workspace/reviews/[epic-id]/screenshots/[paths]
   ```
   Save to: Epic-level `.devagent/workspace/reviews/[epic-id]/screenshots/` or task-specific `.devagent/workspace/reviews/[epic-id]/[task-id]/screenshots/`.

**Quality Gate Failures:** Document which gates failed and what needs fixing. For multi-task commits, cite each task ID in comments.

## Ralph Automation Agents

**Setup Workspace Agent:** Validates Epic/Tasks and prepares Git environment (branching, workspace cleaning) before main loop starts. Workflow: `.devagent/plugins/ralph/workflows/setup-workspace.md`. If Ralph loop fails to start, check Setup Agent logs for Epic validation errors or Git workspace conflicts.

**Final Review Agent:** Summarizes execution cycle, integrates revise reports, and manages GitHub PRs on cycle break (success or error). Workflow: `.devagent/plugins/ralph/workflows/final-review.md`. Output: created/updated PR with comprehensive execution report.

## Epic Quality Gate & Retrospectives

**Epic Report:** Every Epic includes final quality gate task "Generate Epic Revise Report" that runs only after all other tasks are closed or blocked. When this task becomes ready, run `devagent ralph-revise-report <EpicID>`.

**Completion Verification:** Before generating report, verify all child tasks have status `closed` or `blocked` (use `bd list --parent <EpicID> --json`). Do NOT generate report mid-epic while tasks are still in progress.

**Aggregation:** Workflow aggregates all "Revision Learning" and "Commit" comments from child tasks into consolidated improvement report. Categories: **Documentation** (missing docs, outdated content, onboarding gaps), **Process** (workflow friction, automation opportunities, quality gate improvements), **Rules & Standards** (Cursor rules updates, coding standards violations, pattern inconsistencies), **Tech Architecture** (code structure issues, dependency concerns, technical debt, performance).

**Screenshot Integration:** Reports include screenshot directory references and key screenshots with descriptions. Use generated report to identify systemic issues and create new tasks for process or tooling improvements. Reports saved as `YYYY-MM-DD_<epic-id>-improvements.md` in `.devagent/workspace/reviews/`.

## References

- https://www.conventionalcommits.org/en/v1.0.0/
- Keep using the quality-gate/comment automation defined in `.devagent/plugins/ralph/tools/ralph.sh`, but apply this guidance when narrating commits and adding Beads comments.
