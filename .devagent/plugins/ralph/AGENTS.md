# Ralph Plugin Instructions

## Commit Messaging Guidelines
- Follow **Conventional Commits v1.0.0** when composing the subject line. Select the type (`feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, or `revert`) that best matches the work and add a meaningful `scope` when it clarifies the surface area (e.g., `feat(api): add healthcheck`).
- Keep the subject imperative, use a lowercase type, and omit a trailing period. Include the primary task title or summary while keeping the line under 50 characters where practical.
- Reference the Beads task ID in the subject or the first line of the body (e.g., `feat(api): add healthcheck endpoint (bd-1234.1)`). This makes it easy to correlate commits with tasks.
- In the body, explain what changed, why, and how the acceptance criteria were satisfied. Recommended sections:
  1. `Task:` mention the full task ID and title.
  2. `Acceptance:` list or summarize the satisfied acceptance criteria.
  3. `Quality Gates:` state which gates ran (test/lint/typecheck) and whether they passed.
  4. `Iteration:` note the Ralph iteration number and whether the run succeeded.
  5. `Testing:` describe commands executed or manual verifications performed.
  6. Optional `Notes:` capture follow-up work or outstanding questions.
- Preserve the `Co-authored-by: Ralph <ralph@autonomous>` trailer when the AI agent participates in the work.

## Task Commenting for Traceability
- **Agent Responsibility:** Agents must add comments to tasks after completing implementation. The `ralph.sh` script only manages the execution loop - agents are responsible for proper documentation.
- **Mandatory Comments After Task Completion:**
  1. **Commit Information:** After quality gates pass and commit is created, add:
     ```
     Commit: <hash> - <subject>
     ```
  2. **Revision Learning:** Every task must have a "Revision Learning" comment capturing insights, friction points, or process improvements. Use format:
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
  3. **Screenshot Documentation:** If screenshots were captured during browser testing, add:
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

## Epic Quality Gate & Retrospectives
- **Epic Report:** Upon completion of an Epic, run `devagent ralph-revise-report <EpicID>`.
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
