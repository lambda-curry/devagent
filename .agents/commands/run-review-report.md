# Run Review Report (Command)

## Instructions

1. Follow the `.devagent/plugins/ralph/workflows/run-review-report.md` workflow to evaluate a PR + Beads epic run against the canonical `ralph-e2e` expectations rubric.

2. Required: 
   - PR reference (URL or number)
   - Beads Epic ID (e.g., `bd-123`)

3. The workflow will:
   - Resolve the run folder automatically.
   - Read the latest expectations from `expectations/expectations.md`.
   - Write a `run-report.md` artifact to the run folder.
   - Update the Beads Epic with a summary.
   - Update the PR description with a run summary section.

---

**Input Context:**
PR: [PR_URL_OR_NUMBER]
Epic ID: [EPIC_ID]
