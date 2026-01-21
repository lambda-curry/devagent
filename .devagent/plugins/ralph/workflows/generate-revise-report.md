# Generate Revise Report (Epic Scope)

## Mission
Generate a comprehensive revise report for a Beads Epic, aggregating traceability data and revision learnings from child tasks to drive process improvement.

## Inputs
- Required: Epic ID (e.g., `bd-1a2b`)
- Optional: Output directory (default: `.devagent/workspace/reviews/`)

**Note:** There is no CLI entrypoint for this workflow. Follow the steps below to generate the report manually.

## Standard Instructions Reference
Before executing this workflow, review standard instructions in `.devagent/core/AGENTS.md` → Standard Workflow Instructions for date handling, metadata retrieval, context gathering order, and storage patterns.

## Resource Strategy
- Skill instructions: `.devagent/plugins/ralph/skills/revise-report-generation/SKILL.md`
- Beads CLI: `bd` command for data retrieval
- Storage location: Primary - task folder (`.devagent/workspace/tasks/active/YYYY-MM-DD_task-slug/`), Fallback - `.devagent/workspace/reviews/`

## Workflow Steps

### Step 1: Initialize Report Context

**Objective:** Validate Epic ID and set up report metadata.

**Instructions:**
1. Validate the provided Epic ID exists using `bd show <EpicID>`.
2. Get current date using `date +%Y-%m-%d`.
3. **Determine task folder:** Extract task folder path from Epic's plan document reference:
   - Epic description contains "Plan document: <absolute-path>"
   - Extract the task folder from the plan path (e.g., `/path/to/.devagent/workspace/tasks/active/YYYY-MM-DD_task-slug/plan/...` → `.devagent/workspace/tasks/active/YYYY-MM-DD_task-slug/`)
   - If task folder cannot be determined, use fallback location `.devagent/workspace/reviews/`
4. Create report filename: `YYYY-MM-DD_<epic-id>-improvements.md` (preferred) or `YYYY-MM-DD_revise-report-epic-<EpicID>.md` (legacy).

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
   - **Learnings:** Look for comment "Revision Learning: <text>" (may include structured format)
   - **Screenshots:** Look for comment "Screenshots captured: <path>"
   - **Status:** Current status of the task

### Step 3: Analyze & Classify

**Objective:** Group learnings and build the traceability matrix.

**Instructions:**
1. **Traceability Matrix:** Map each task to its commit hash. Identify tasks with missing commits.
2. **Screenshot Collection:**
   - Extract all screenshot paths from "Screenshots captured:" comments.
   - Group screenshots by task ID.
   - Verify screenshot files exist in project directory.
   - Count total screenshots and identify key screenshots for inclusion.
   - Determine screenshot directory structure (epic-level vs task-specific).
3. **Learning Classification:**
   - **Structured Format:** If "Revision Learning" includes structured fields:
     - Extract `Category:` (Documentation|Process|Rules|Architecture)
     - Extract `Priority:` (Critical|High|Medium|Low)
     - Extract `Issue:` (description)
     - Extract `Recommendation:` (actionable improvement)
     - Extract `Files/Rules Affected:` (references)
   - **Auto-Classification:** If not structured, classify into:
     - **Documentation:** Missing context, unclear specs, outdated docs, onboarding gaps.
     - **Process:** Workflow, prompting, instructions, automation opportunities, quality gates.
     - **Rules & Standards:** Cursor rules, coding standards, pattern inconsistencies, best practices.
     - **Tech Architecture:** Architecture, patterns, libraries, code structure, dependencies, technical debt, performance.
4. **Prioritization:** Assign priorities (Critical, High, Medium, Low) to all improvements, prioritizing structured learnings with explicit priorities.
5. Synthesize an **Executive Summary** based on the overall health (success rate, quality gate failures, rich learnings, improvement density).

### Step 4: Generate Report

**Objective:** Write the markdown report.

**Instructions:**
1. Follow the template defined in `skills/revise-report-generation/SKILL.md`.
2. Write the Executive Summary.
3. Render the Traceability Matrix as a markdown table.
4. **Evidence & Screenshots Section:**
   - Document screenshot directory location.
   - List key screenshots with descriptions and relative paths.
   - Include screenshot count and organization.
5. **Improvement Recommendations Section:**
   - Organize improvements by category (Documentation, Process, Rules & Standards, Tech Architecture).
   - For each improvement, include:
     - Priority (Critical, High, Medium, Low)
     - Issue description
     - Recommendation (actionable)
     - Files/Rules affected (when available)
     - Source Task ID
   - Use checkbox format for actionable items.
6. **Action Items Section:**
   - Extract top 5-10 prioritized action items from improvements.
   - Group by priority (Critical first, then High, Medium, Low).
   - Include category and source task for traceability.

### Step 5: Finalize

**Objective:** Save the report and update indices.

**Instructions:**
1. **Save report to task folder (preferred):** Write the file to `.devagent/workspace/tasks/active/YYYY-MM-DD_task-slug/YYYY-MM-DD_<epic-id>-improvements.md`
   - If task folder cannot be determined, use fallback: `.devagent/workspace/reviews/YYYY-MM-DD_<epic-id>-improvements.md`
2. Ensure screenshot directories are documented and accessible (should be in task folder if available).
3. Update `.devagent/workspace/reviews/README.md` to include a link to the new report (if saved to reviews/ folder).

## Error Handling

- **Epic not found:** Return error if `bd show` fails.
- **No comments:** If tasks have no comments, note "No revision learnings captured" in the report.
- **JSON parsing:** Use robust parsing (e.g. `jq`) to handle potential special characters in comments.
