# Ralph Plugin Instructions

## Commit Messaging Guidelines
- Follow **Conventional Commits v1.0.0** when composing the subject line. Select the type (`feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, or `revert`) that best matches the work and add a meaningful `scope` when it clarifies the surface area (e.g., `feat(api): add healthcheck`).
- Keep the subject imperative, use a lowercase type, and omit a trailing period. Include the primary task title or summary while keeping the line under 50 characters where practical.
- **CI/CD Optimization:** By default, append `[skip ci]` to the subject line for all intermediate or incremental commits to save build minutes and avoid queue jams.
  - **Example:** `fix(ui): adjust padding [skip ci]`
  - **Exception:** Omit `[skip ci]` (triggering a build) ONLY when:
    1.  The task is a significant feature or UI change that warrants a preview deployment for verification.
    2.  Explicitly instructed to deploy.
    3.  Closing a task that represents a major milestone or integration point.
    *(Note: Routine task closures or minor fixes should still use `[skip ci]` if no preview is needed.)*
- Reference the Beads task ID in the subject or the first line of the body (e.g., `feat(api): add healthcheck endpoint (bd-1234.1)`). This makes it easy to correlate commits with tasks.
- In the body, explain what changed, why, and how the acceptance criteria were satisfied. Recommended sections:
  1. `Task:` mention the full task ID and title.
  2. `Acceptance:` list or summarize the satisfied acceptance criteria.
  3. `Quality Gates:` state which gates ran (test/lint/typecheck) and whether they passed.
  4. `Iteration:` note the Ralph iteration number and whether the run succeeded.
  5. `Testing:` describe commands executed or manual verifications performed.
  6. Optional `Notes:` capture follow-up work or outstanding questions.
- Preserve the `Co-authored-by: Ralph <ralph@autonomous>` trailer when the AI agent participates in the work.

## Task Context & Beads Integration
- **Reading Task Context:** Before starting work on a task, read full task details using `bd show <task-id> --json` to access:
  - `description`: Enriched task context including Objective, Impacted Modules/Files, References, and Testing Criteria.
  - `acceptance_criteria`: Success criteria
  - `design`: Architecture and design decisions (if present)
  - `notes`: Additional context or requirements (if present) - **Always check for "Plan document: <path>" reference and read the specific plan document for full context**
  - `priority`: Task priority (P0-P3)
  - `labels`: Task labels for categorization
  - `depends_on`: Task dependencies
  - `parent_id`: Parent epic/task ID
- **Starting Work on a Task:** When you begin working on a task, you MUST immediately set its status to `in_progress` using `bd update <task-id> --status in_progress`. This ensures proper task tracking and prevents other agents from picking up the same task. Do this as the first action after reading the task context.
- **Reading Epic Context:** Use `bd show <epic-id> --json` to understand epic description, design notes, and overall context. The epic `description` field will contain a "Plan document: <path>" reference - read that specific plan document for complete implementation context.
- **Plan Document References:** Every task and epic includes a specific plan document path in its `notes` (tasks) or `description` (epic) field. Always read the referenced plan document to understand the full implementation context, architecture decisions, and related tasks.
- **Updating Task Metadata:** During implementation, update task metadata as needed:
  - If you make architectural or design decisions: `bd update <task-id> --design "<decision explanation>"`
  - If you discover important context or constraints: `bd update <task-id> --notes "<context information>"`
  - If task priority needs adjustment: `bd update <task-id> --priority <P0|P1|P2|P3>`
  - Add progress comments as work progresses: `bd comment <task-id> --body "<progress update>"`
- **Beads Skill Reference:** See `.devagent/plugins/ralph/skills/beads-integration/SKILL.md` for complete Beads CLI command reference and best practices.

## Ralph Automation Agents

### Setup Workspace Agent
- **Purpose:** Automatically validates the Epic/Tasks and prepares the Git environment (branching, workspace cleaning) before the main loop starts.
- **Workflow:** `.devagent/plugins/ralph/workflows/setup-workspace.md`
- **Troubleshooting:** If the Ralph loop fails to start, check the Setup Agent logs for Epic validation errors or Git workspace conflicts.

### Final Review Agent
- **Purpose:** Automatically summarizes the execution cycle, integrates revise reports, and manages GitHub PRs on cycle break (success or error).
- **Workflow:** `.devagent/plugins/ralph/workflows/final-review.md`
- **Output:** A created/updated PR with a comprehensive execution report.

## Quality Gates & Verification
**The 7-Point Checklist:**
Every task execution must follow this verification lifecycle. You must generate this checklist at the start of the task and mark items off as you proceed.

1. **Read Task & Context**: Understand requirements, plan docs, and acceptance criteria.
2. **Self-Diagnose Commands**: Read `package.json` to find the *actual* project scripts for test, lint, and typecheck. Do not assume `npm test` works unless verified.
3. **Implementation**: Modify code to satisfy requirements.
4. **Standard Checks**: Run the diagnosed commands (e.g., `npm run test:unit`, `npm run lint`). Fix any regressions.
5. **UI Verification**: IF frontend changes (.tsx, .css, .html) or UI tasks:
   - Run `agent-browser` to visit the local URL.
   - Perform DOM assertions to verify elements.
   - **Capture Failure Screenshots** if assertions fail.
   - **Capture Success Screenshots** ONLY if visual design review is expected.
6. **Add/Update Tests**: If logic changed, add unit tests. If UI changed, ensure browser checks cover it.
7. **Commit & Push**: Create conventional commit and push.

## Task Commenting for Traceability
- **Agent Responsibility:** Agents must run quality gates, commit their work, update task status, and add comments. The `ralph.sh` script only manages the execution loop - agents are responsible for all verification and documentation.
- **Mandatory Steps After Task Implementation:**
  1. **Run Quality Gates:** Execute the diagnosed test, lint, and typecheck commands to verify your work.
  2. **Commit Work:** Create a git commit with conventional commit message referencing the task ID.
  3. **Update Task Status:** Mark task as `closed` if successful, `blocked` if blocked, or leave `in_progress` if retry needed.
  4. **Add Comments:** After commit is created, add:
     ```
     Commit: <hash> - <subject>
     ```
  5. **Revision Learning:** Every task must have a "Revision Learning" comment capturing insights, friction points, or process improvements. Use format:
     ```
     Revision Learning: [learning text]
     ```
     Or structured format (recommended for better categorization):
     ```
     Revision Learning:
     **Category**: Documentation|Process|Rules|Architecture
     **Priority**: Critical|High|Medium|Low
     **Issue**: [description of the issue or gap]
     **Recommendation**: [actionable improvement suggestion]
     **Files/Rules Affected**: [references to specific files, rules, or processes]
     ```
  6. **Screenshot Documentation:** If screenshots were captured during browser testing, add:
     ```
     Screenshots captured: .devagent/workspace/reviews/[epic-id]/screenshots/[paths]
     ```
     Screenshots should be saved to:
     - Epic-level: `.devagent/workspace/reviews/[epic-id]/screenshots/`
     - Task-specific: `.devagent/workspace/reviews/[epic-id]/[task-id]/screenshots/`
- **Quality Gate Failures:** If quality gates fail, document which gates failed and what needs to be fixed.
- **Multi-Task Commits:** When a commit spans multiple tasks, cite each task ID in comments.
- **Context Setup:** Each task should have clear context in its description about what quality gates apply and what the agent is responsible for.

## Decision-Making Expectations
- Ralph should infer the commit type and scope from task metadata (title, description, tags) and describe the reasoning in the body when it adds clarity.
- If the appropriate type is uncertain, default to `chore` for maintenance or tooling updates, `feat` for new capabilities, and `fix` for behavior corrections.
- Embrace Conventional Commits as living documentation: the subject highlights the *why* while the body describes the *what* and *how*.

## Failure Management & Status Updates
- **Agent Responsibility:** Agents are responsible for verifying their work and managing task status. The script will not automatically close tasks.
- **Status Transitions:**
  - **Success:** If a task is completed and verified, the agent MUST run `bd update <id> --status closed`.
  - **Blocker:** If a task cannot be completed due to external dependencies or unresolvable issues, the agent MUST run `bd update <id> --status blocked` and document the reason.
  - **Retry:** If a task needs more work (e.g., failed tests), leave it as `in_progress`. The script will provide the failure context in the next iteration.
- **Epic Status:** If a critical path is blocked, the agent should consider blocking the parent Epic if appropriate, which will stop the autonomous execution loop.

## Epic Quality Gate & Retrospectives
- **Epic Report:** Every Epic includes a final quality gate task "Generate Epic Revise Report" that runs only after all other tasks are closed or blocked. When this task becomes ready, run `devagent ralph-revise-report <EpicID>`.
- **Completion Verification:** Before generating the report, verify that all child tasks have status `closed` or `blocked` (use `bd list --parent <EpicID> --json` to check). Do NOT generate the report mid-epic while tasks are still in progress.
- **Aggregation:** This workflow aggregates all "Revision Learning" and "Commit" comments from child tasks into a consolidated improvement report.
- **Improvement Categories:** Reports categorize improvements into:
  - **Documentation:** Missing docs, outdated content, onboarding gaps
  - **Process:** Workflow friction, automation opportunities, quality gate improvements
  - **Rules & Standards:** Cursor rules updates, coding standards violations, pattern inconsistencies
  - **Tech Architecture:** Code structure issues, dependency concerns, technical debt, performance
- **Screenshot Integration:** Reports include screenshot directory references and key screenshots with descriptions.
- **Process Improvement:** Use the generated report to identify systemic issues and create new tasks for process or tooling improvements. Reports are saved as `YYYY-MM-DD_<epic-id>-improvements.md` in `.devagent/workspace/reviews/`.

## References
- https://www.conventionalcommits.org/en/v1.0.0/
- Keep using the quality-gate/comment automation defined in `.devagent/plugins/ralph/tools/ralph.sh`, but apply this guidance when narrating commits and adding Beads comments.