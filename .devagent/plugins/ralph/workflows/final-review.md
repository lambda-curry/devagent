# Ralph Final Review & PR Creation

## Mission
- Primary goal: Review the results of a Ralph execution cycle, summarize work completed, integrate process improvements from revise reports, and create or update a GitHub PR.
- Boundaries / non-goals: Do not modify application code or change task statuses (except to record the final report).
- Success signals: A GitHub PR is created or updated with a high-quality summary of work, a status table of tasks, and the contents of the latest revise report (if available). If PR review comments exist, follow-up tasks are created before any revise report is generated.

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
- **Determine task folder:** Extract task folder path from Epic's plan document reference (Epic description contains "Plan document: <path>")
- Identify the latest revise report in the task folder (`.devagent/workspace/tasks/active/YYYY-MM-DD_task-slug/`) or fallback location (`.devagent/workspace/reviews/`) for this Epic.

### 2. PR Review Comment Triage (Before Revise Report)
- Check for PR review comments (inline review comments or review threads) on the current PR.
  - Example (requires repo + PR number):
    - `gh repo view --json nameWithOwner`
    - `gh pr view --json number,url`
    - `gh api repos/<owner>/<repo>/issues/<pr-number>/comments` (PR timeline/issue comments)
    - `gh api repos/<owner>/<repo>/pulls/<pr-number>/comments` (REST: diff-anchored review comments only)
    - **Review threads (GraphQL):** REST does not include unresolved review threads. If you need full coverage, query `pullRequest.reviewThreads` via GraphQL (or explicitly note that unresolved threads will be missed if you only use REST).
      - Example GraphQL query:
        ```bash
        gh api graphql -f query='
        query($owner:String!, $name:String!, $number:Int!) {
          repository(owner:$owner, name:$name) {
            pullRequest(number:$number) {
              reviewThreads(first: 100) {
                nodes {
                  isResolved
                  comments(first: 50) {
                    nodes { author { login } body url createdAt }
                  }
                }
              }
            }
          }
        }' -F owner=<owner> -F name=<repo> -F number=<pr-number>
        ```
- If **actionable review comments exist**:
  - Create new child tasks under the epic (one per comment or grouped by theme).
  - Label tasks `engineering` for code changes and `qa` for verification/test requests.
  - Include the PR comment link/text in the task description/notes for traceability.
  - **Keep the final review task open** and stop here. Do **not** generate the revise report until the new tasks are closed.

### 3. Summary Generation
- Create a natural language executive summary of the execution cycle:
  - What was accomplished?
  - What blockers were encountered?
  - Why did the cycle stop?
- Format a "Task Status" table (ID, Status, Title).

### 4. Revise Report Integration
- If a recent revise report exists (generated via the revise-report workflow), append its "Improvement Recommendations" and "Action Items" to the PR body.
- If no report exists, briefly note that no process improvements were identified in this cycle.

### 5. PR Management
- Use `gh pr list --head <BRANCH_NAME> --json url` to check if a PR already exists.
- If PR exists:
  - Update the PR body with the new summary using `gh pr edit`.
- If PR does not exist:
  - Create the PR using `gh pr create` with a title like "Ralph Execution: <Epic Title> (<Epic ID>)".
  - Set the base branch (default: `main`).

## Failure Handling
- **gh CLI missing:** If `gh` is not found, write the final summary to a file `.ralph_pr_body.md` and report that PR creation was skipped.
- **Git push failure:** If the branch hasn't been pushed, attempt to push it once before PR creation. If push fails, report the error but continue with PR creation (PR may still work if branch was pushed previously).

## Expected Output
- A created or updated GitHub PR with a comprehensive execution report.
- A summary message in the terminal with the PR URL.
