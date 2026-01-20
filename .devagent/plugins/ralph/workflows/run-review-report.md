# PR Epic Run Review Report

## Mission
Evaluate a PR + Beads epic run against the canonical `ralph-e2e` expectations rubric, producing a `run-report.md` artifact and updating PR/Beads summaries.

## Inputs
- Required: PR reference (URL or number)
- Required: Beads Epic ID (e.g., `bd-123`)

## Workflow Steps

### Step 1: Initialize and Canonicalize
1. **Canonicalize PR**: If a number is provided, convert to full GitHub URL.
2. **Resolve Run Folder**:
   - Parse the Beads Epic description or comments for a "Run folder:" entry.
   - Fallback: Search for directory matching `runs/*_<epic-id>/` under `.devagent/workspace/tests/ralph-e2e/`.
3. **Read Rubric**: Load the latest expectations from `.devagent/workspace/tests/ralph-e2e/expectations/expectations.md`.

### Step 2: Gather Evidence
1. **Beads Data**: Fetch all tasks and comments for the Epic (`bd list --parent <EpicID> --json`, `bd comments <TaskID> --json`).
2. **Commit History**: Identify commits associated with the run (from Beads comments or PR).
3. **Screenshots**: List files in the run folder's `setup/`, `execution/`, `qa/`, and `post-run/` directories.

### Step 3: Evaluate Against Rubric
Evaluate the run evidence against each stage of the `expectations.md` rubric:
- **Stage 0 (Roles/Collaboration)**: Verify role signatures in comments and explicit handoffs.
- **Stage 1 (Setup)**: Verify task breakdown and run header presence.
- **Stage 2 (Implementation)**: Verify quality gate reporting and traceability (task IDs in commits).
- **Stage 3 (QA)**: Verify evidence-first pass/fail and failure semantics.
- **Stage 4 (Post-run)**: Verify presence of "what we learned" summary.
- **Stage 5 (PR Definition of Done)**: Verify PR hygiene (links, expectations version, test plan).

### Step 4: Generate artifacts
1. **Write `run-report.md`**: Create the report in the resolved run folder.
   - Include rubric-aligned sections (Met/Not Met/Partial).
   - Enumerate evidence pointers (links to Beads comments, screenshot paths).
   - Add a "Next Run Improvements" section with concrete, actionable recommendations.
2. **Update Beads Epic**: Post a concise summary comment to the Epic with a link to the `run-report.md`.
3. **Update PR Description**:
   - Find or create a "## Run Summary" section in the PR description.
   - Update it with the run result, expectations version, and a link to the report.

### Step 5: Finalize
1. Confirm all artifacts are saved.
2. If this is the final `revise-report` task in the epic, mark it as closed.
