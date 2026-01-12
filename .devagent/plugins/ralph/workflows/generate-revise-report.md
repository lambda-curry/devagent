# Generate Revise Report (Epic Scope)

## Mission
Generate a comprehensive revise report for a Beads Epic, aggregating traceability data and revision learnings from child tasks to drive process improvement.

## Inputs
- Required: Epic ID (e.g., `bd-1a2b`)
- Optional: Output directory (default: `.devagent/workspace/reviews/`)

## Standard Instructions Reference
Before executing this workflow, review standard instructions in `.devagent/core/AGENTS.md` → Standard Workflow Instructions for date handling, metadata retrieval, context gathering order, and storage patterns.

## Resource Strategy
- Skill instructions: `.devagent/plugins/ralph/skills/revise-report-generation/SKILL.md`
- Beads CLI: `bd` command for data retrieval
- Storage location: `.devagent/workspace/reviews/`

## Workflow Steps

### Step 1: Initialize Report Context

**Objective:** Validate Epic ID and set up report metadata.

**Instructions:**
1. Validate the provided Epic ID exists using `bd show <EpicID>`.
2. Get current date using `date +%Y-%m-%d`.
3. Create report filename: `YYYY-MM-DD_revise-report-epic-<EpicID>.md`.

### Step 2: Aggregate Task Data

**Objective:** Fetch all tasks and their comments to build the dataset.

**Instructions:**
1. List all child tasks for the Epic:
   `bd list --parent <EpicID> --json`
2. For EACH child task:
   a. Fetch details: `bd show <TaskID> --json`
   b. Fetch comments: `bd comments <TaskID> --json`
3. Parse the data to extract:
   - **Traceability:** Look for comment "Commit: <hash> - <subject>"
   - **Learnings:** Look for comment "Revision Learning: <text>"
   - **Status:** Current status of the task

### Step 3: Analyze & Classify

**Objective:** Group learnings and build the traceability matrix.

**Instructions:**
1. **Traceability Matrix:** Map each task to its commit hash. Identify tasks with missing commits.
2. **Learning Classification:** Group "Revision Learning" content into:
   - **Process:** Workflow, prompting, instructions.
   - **Tooling:** Ralph, CLI, environment.
   - **Code:** Architecture, patterns, libraries.
   - **Docs:** Specifications, context.
   - **General:** Other insights.
3. Synthesize an **Executive Summary** based on the overall health (success rate, quality gate failures, rich learnings).

### Step 4: Generate Report

**Objective:** Write the markdown report.

**Instructions:**
1. Follow the template defined in `skills/revise-report-generation/SKILL.md`.
2. Write the Executive Summary.
3. Render the Traceability Matrix as a markdown table.
4. List Consolidated Learnings by category, citing the source Task ID.
5. Propose 3-5 high-value **Action Items** based on the learnings.

### Step 5: Finalize

**Objective:** Save the report and update indices.

**Instructions:**
1. Write the file to `.devagent/workspace/reviews/YYYY-MM-DD_revise-report-epic-<EpicID>.md`.
2. Update `.devagent/workspace/reviews/README.md` to include a link to the new report.

## Error Handling

- **Epic not found:** Return error if `bd show` fails.
- **No comments:** If tasks have no comments, note "No revision learnings captured" in the report.
- **JSON parsing:** Use robust parsing (e.g. `jq`) to handle potential special characters in comments.
