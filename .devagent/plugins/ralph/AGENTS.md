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
- After each commit, add or update a Beads comment on every task touched. Include the task ID, the conventional commit subject, and a short summary of the behavior change.
- If the commit followed a quality-gate failure, mention the failing gates and whether the task is still open for revisions.
- When a commit spans multiple tasks, cite each ID so reviewers can trace the change history.
- Where possible, link to the Git commit (e.g., `See commit abc123` or `xref: git show abc123`) so the history can be followed backwards.

## Decision-Making Expectations
- Ralph should infer the commit type and scope from task metadata (title, description, tags) and describe the reasoning in the body when it adds clarity.
- If the appropriate type is uncertain, default to `chore` for maintenance or tooling updates, `feat` for new capabilities, and `fix` for behavior corrections.
- Embrace Conventional Commits as living documentation: the subject highlights the *why* while the body describes the *what* and *how*.

## References
- https://www.conventionalcommits.org/en/v1.0.0/
- Keep using the quality-gate/comment automation defined in `.devagent/plugins/ralph/tools/ralph.sh`, but apply this guidance when narrating commits and adding Beads comments.
