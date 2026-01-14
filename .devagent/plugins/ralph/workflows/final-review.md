# Ralph Final Review & PR Creation

## Mission
- Primary goal: Review the results of a Ralph execution cycle, summarize work completed, integrate process improvements from revise reports, and create or update a GitHub PR.
- Boundaries / non-goals: Do not modify application code or change task statuses (except to record the final report).
- Success signals: A GitHub PR is created or updated with a high-quality summary of work, a status table of tasks, and the contents of the latest revise report (if available).

## Standard Instructions Reference
Before executing this workflow, review standard instructions in `.devagent/core/AGENTS.md` → Standard Workflow Instructions for:
- Date handling (run `date +%Y-%m-%d`)
- Metadata retrieval
- Context gathering order

## Execution Directive
- Execute immediately without human-in-the-loop confirmation.
- Ensure the final report is created even if the execution cycle ended in an error (the "Stop Reason" should be clearly documented).

## Inputs
- Required: Epic ID, Stop Reason (e.g., "Max Iterations Reached", "All Tasks Completed").
- Optional: Iteration count, current branch name.

## Workflow

### 1. Data Aggregation
- Fetch task status summary using `bd list --parent <EPIC_ID> --json`.
- Extract "Revision Learning" and "Commit" comments from all tasks in the Epic.
- Verify that all child tasks have status `closed` or `blocked` (no `todo`, `in_progress`, or `open` tasks remain) before generating the revise report.

### 2. Generate Revise Report
- Generate a comprehensive revise report following the workflow in `.devagent/plugins/ralph/workflows/generate-revise-report.md`.
- Use the skill instructions in `.devagent/plugins/ralph/skills/revise-report-generation/SKILL.md`.
- Save the report to `.devagent/workspace/reviews/YYYY-MM-DD_<epic-id>-improvements.md`.
- Extract the "Improvement Recommendations" and "Action Items" sections for PR integration.

### 3. Summary Generation
- Create a natural language executive summary of the execution cycle:
  - What was accomplished?
  - What blockers were encountered?
  - Why did the cycle stop?
- Format a "Task Status" table (ID, Status, Title).

### 4. Revise Report Integration
- Append the revise report's "Improvement Recommendations" and "Action Items" to the PR body.
- If no improvements were identified, briefly note that no process improvements were identified in this cycle.

### 5. PR Management
- Use `gh pr list --head <BRANCH_NAME> --json url` to check if a PR already exists.
- If PR exists:
  - Update the PR body with the new summary using `gh pr edit`.
- If PR does not exist:
  - Create the PR using `gh pr create` with a title like "Ralph Execution: <Epic Title> (<Epic ID>)".
  - Set the base branch (default: `main`).

## Failure Handling
- **gh CLI missing:** If `gh` is not found, write the final summary to a file `.ralph_pr_body.md` and report that PR creation was skipped.
- **Git push failure:** If the branch hasn't been pushed, attempt to push it once before PR creation.

## Expected Output
- A created or updated GitHub PR with a comprehensive execution report.
- A summary message in the terminal with the PR URL.
