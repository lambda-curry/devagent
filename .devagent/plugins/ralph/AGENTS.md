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
- **Mandatory Traceability:** `ralph.sh` automatically posts a comment with the commit hash (`Commit: <hash> - <subject>`) after every task execution. Ensure this automation remains active.
- **Localized Learning:** Every task must have a "Revision Learning" comment capturing insights, friction points, or process improvements encountered during execution. `ralph.sh` extracts this from the AI output.
- **Structured Revision Learning Format (Recommended):** For better categorization in improvement reports, use structured format:
  ```
  ### Revision Learning
  
  **Category**: Documentation|Process|Rules|Architecture
  **Priority**: Critical|High|Medium|Low
  **Issue**: [description of the issue or gap]
  **Recommendation**: [actionable improvement suggestion]
  **Files/Rules Affected**: [references to specific files, rules, or processes]
  ```
- **Screenshot Documentation:** When screenshots are captured during browser testing, `ralph.sh` automatically detects and documents them. Screenshots should be saved to:
  - Epic-level: `.devagent/workspace/reviews/[epic-id]/screenshots/`
  - Task-specific: `.devagent/workspace/reviews/[epic-id]/[task-id]/screenshots/`
- If the commit followed a quality-gate failure, mention the failing gates and whether the task is still open for revisions.
- When a commit spans multiple tasks, cite each ID so reviewers can trace the change history.
- Where possible, link to the Git commit (e.g., `See commit abc123` or `xref: git show abc123`) so the history can be followed backwards.

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

## Handoff Enhancement
- **Core Workflow:** Use the standard handoff workflow (`.devagent/core/workflows/handoff.md`) for all handoffs.
- **Ralph Enhancements:** When handing off after Epic work, apply the Ralph handoff enhancement (`.devagent/plugins/ralph/workflows/handoff-enhancement.md`) to include:
  - Links to improvement reports
  - Screenshot directory references
  - Top 3-5 critical improvements from the improvement report
- **Note:** The core handoff workflow remains portable and unchanged. Ralph-specific enhancements are optional and only applied when Epic context is available.

## References
- https://www.conventionalcommits.org/en/v1.0.0/
- Keep using the quality-gate/comment automation defined in `.devagent/plugins/ralph/tools/ralph.sh`, but apply this guidance when narrating commits and adding Beads comments.
