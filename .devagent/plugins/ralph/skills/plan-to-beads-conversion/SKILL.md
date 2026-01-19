---

name: Plan-to-Beads Conversion

description: >-
  Convert DevAgent plan markdown documents into Beads-compatible JSON task structures.
  Use when: (1) Converting DevAgent implementation plans to Beads tasks for autonomous
  execution, (2) Creating hierarchical task structures (Epic → Task → Subtask) from plan
  documents, (3) Parsing task dependencies and acceptance criteria from plan markdown,
  (4) Generating Beads task IDs and dependency relationships. This skill enables Ralph
  plugin to work with DevAgent plans using Beads for state and progress tracking.

---

# Plan-to-Beads Conversion

Convert DevAgent plan markdown documents into Beads-compatible JSON task structures for autonomous execution.

## Prerequisites

- DevAgent plan document following the standard plan template
- Beads schema reference (see `templates/beads-schema.json` in this plugin)
- Output directory for generated JSON payload

## Conversion Process

### Step 1: Parse Plan Document Structure

Read the DevAgent plan markdown and identify key sections:

**Plan Header:**

- Extract plan title from `# <Task / Project Name> Plan` header
- This becomes the Epic title

**Implementation Tasks Section:**

- Locate `### Implementation Tasks` under `## PART 2: IMPLEMENTATION PLAN`
- This section contains all tasks to be converted

**Task Parsing:**
For each `#### Task N: <Title>` section, extract:

1. **Task Number and Title:**
  - Pattern: `#### Task <number>: <title>`
  - Extract number and title text
2. **Objective:**
  - Pattern: `- **Objective:** <text>`
  - Extract the objective description
3. **Impacted Modules/Files:**
  - Pattern: `- **Impacted Modules/Files:** <text>`
  - Extract the list of files/modules
4. **References:**
  - Pattern: `- **References:** <text>`
  - Extract the references (optional, default to "None")
5. **Testing Criteria:**
  - Pattern: `- **Testing Criteria:** <text>`
  - Extract the testing criteria (optional, default to "None")
6. **Acceptance Criteria:**
  - Pattern: `- **Acceptance Criteria:**` followed by list items
  - Extract all list items (lines starting with `-`  or numbered)
7. **Dependencies:**
  - Pattern: `- **Dependencies:** <task-references>`
  - Parse task references (e.g., "Task 1", "Task 1, Task 2", or "None")
  - Convert to task numbers for dependency mapping
8. **Subtasks (Optional):**
  - Pattern: `- **Subtasks (optional):**` followed by numbered list
  - Extract numbered list items (e.g., `1. Subtask A`, `2. Subtask B`)

### Step 2: Generate Beads Task IDs

**Epic ID:**

- Generate 4-character MD5 hash from plan title
- Use the **configured Beads prefix** (do not hardcode `bd-`)
  - Prefer: `bd config get issue_prefix`
  - Fallback: infer from an existing issue ID in `bd list --json`
- Format: `<prefix>-<4-char-hash>` (e.g., `devagent-a3f8`)

**Task IDs:**

- Format: `<epic-id>.<task-number>` (e.g., `devagent-a3f8.1`, `devagent-a3f8.2`)

**Subtask IDs:**

- Format: `<epic-id>.<task-number>.<subtask-number>` (e.g., `devagent-a3f8.1.1`, `devagent-a3f8.1.2`)

### Step 3: Build Task Hierarchy

**Epic (Parent Task):**

The epic description must be comprehensive and include:
1. Plan document reference
2. Final deliverable summary (from plan's "Summary" section in PART 1)
3. Final quality gates that must pass

```json
{
  "id": "<epic-id>",
  "title": "<plan-title>",
  "description": "Plan document: <absolute-path-to-plan>\n\nFinal Deliverable: [extract from plan's Summary section in PART 1, or Functional Narrative if Summary is not descriptive enough]\n\nFinal Quality Gates:\n- All tests passing (npm test)\n- Lint clean (npm run lint)\n- Typecheck passing (npm run typecheck)\n- [Include any additional gates from quality-gates.json template]",
  "status": "open"
}
```

**Instructions for Epic Description:**
1. Read the plan document to extract:
   - Summary section (PART 1) - use this for "Final Deliverable" if it clearly describes the end result
   - If Summary is too high-level, use the Functional Narrative section to describe what the final output should be
2. Reference the quality gates template (`.devagent/plugins/ralph/quality-gates/typescript.json` or project-specific template) to list all quality gates that must pass
3. Format as a clear, multi-line description that agents can reference when working on tasks

**Main Tasks:**

Construct the `description` field by combining context fields.

```json
{
  "id": "<epic-id>.<number>",
  "title": "<task-title>",
  "description": "Objective: <objective>\n\nImpacted Modules/Files:\n<impacted-modules>\n\nReferences:\n<references>\n\nTesting Criteria:\n<testing-criteria>",
  "acceptance_criteria": ["<criterion-1>", "<criterion-2>", ...],
  "priority": "normal",
  "status": "open",
  "parent_id": "<epic-id>",
  "depends_on": ["<epic-id>.<dependency-number>", ...],
  "notes": "Plan document: <absolute-path-to-plan>"
}
```

**Subtasks:**

```json
{
  "id": "<epic-id>.<task-number>.<subtask-number>",
  "title": "<subtask-title>",
  "description": "",
  "acceptance_criteria": [],
  "priority": "normal",
  "status": "open",
  "parent_id": "<epic-id>.<task-number>",
  "depends_on": [],
  "notes": "Plan document: <absolute-path-to-plan>"
}
```

**Important:** Always include the absolute path to the source plan document in:
- Epic `description` field
- Each task's `notes` field (for both main tasks and subtasks)

This ensures agents can unambiguously reference the specific plan document when working on tasks.

### Labeling Rules (Routing)

Ralph routes tasks based on **labels** attached to the epic’s direct child tasks.

- **Direct epic children:** Must have **exactly one** routing label from the keys in `.devagent/plugins/ralph/tools/config.json` → `agents`.
- **Subtasks:** Unlabeled by default (context-only). Only add a label if you intentionally want distinct routing.
- **Fallback:** Use `general` when a task is coordination-only or you cannot confidently pick a specialized label.
- **Explicit PM checkpoints:** Use `project-manager` only for phase check-ins or final reviews.

**Implementation note:** This conversion output may not embed labels directly. If labels are applied during `bd create`, ensure the one-level labeling rule is followed there.

### Step 4: Resolve Dependencies

For each task with dependencies:

1. Parse dependency text to extract task numbers
2. Map task numbers to generated task IDs
3. Populate `depends_on` array with dependency task IDs
4. If dependencies reference tasks not yet created, ensure topological ordering

### Step 5: Append Epic Report Task (Quality Gate)

**Objective:** Ensure every Epic concludes with a mandatory revise report that runs only after all tasks are complete.

**Instructions:**

1. Determine the highest task number (N) from the parsed plan.
2. Create a final task with number N+1.
3. **ID:** `<epic-id>.<N+1>`
4. **Title:** "Generate Epic Revise Report"
5. **Label:** "project-manager" (this task uses the project-manager agent for final review)
6. **Description:** "Auto-generated epic quality gate. This task runs only after all other epic tasks are closed or blocked.

**Steps:**
1. Verify that all child tasks have status 'closed' or 'blocked' (no 'open', 'in_progress' tasks remain)
2. Generate the revise report: `devagent ralph-revise-report <epic-id>`
3. **Epic Status Management:**
   - If ALL tasks are closed (no blocked tasks): Close the epic with `bd update <epic-id> --status closed`
   - If ANY tasks are blocked: Block the epic for human review with `bd update <epic-id> --status blocked` and add a comment explaining which tasks are blocked"
6. **Acceptance Criteria:** ["All child tasks are closed or blocked", "Report generated in .devagent/workspace/reviews/", "Epic status updated (closed if all tasks completed, blocked if any tasks blocked)"]
7. **Dependencies:** Array containing IDs of ALL other top-level tasks (e.g., `["<epic-id>.1", "<epic-id>.2", ...]`). This ensures the task only becomes ready when all dependencies are complete.
8. **Notes:** Include plan document path: `"Plan document: <absolute-path-to-plan>"`
9. Add this task to the `tasks` array.

### Step Ordering and Numbering (Important)

If you rely on string sorting, hierarchical IDs will sort incorrectly once task numbers exceed 9 (for example, `<epic-id>.10` comes before `<epic-id>.2`).

- **Always** preserve plan order by comparing hierarchical numeric segments (split on `.` and compare numbers).
- This affects both:
  - **Execution order** (when selecting the “first” ready task)
  - **UI ordering** (task boards/lists that display tasks)

### Step 6: Generate Complete Payload

**Full JSON Structure:**

```json
{
  "metadata": {
    "source_plan": "<absolute-path-to-plan>",
    "generated_at": "<ISO-8601-UTC-timestamp>Z"
  },
  "ralph_integration": {
    "ready_command": "bd ready --parent <EPIC_ID> --limit 200",
    "status_updates": {
      "in_progress": "in_progress",
      "closed": "closed"
    },
    "progress_comments": true
  },
  "epics": [
    {
      "id": "<epic-id>",
      "title": "<plan-title>",
      "description": "",
      "status": "open"
    }
  ],
  "tasks": [
    /* array of task objects */
  ]
}
```

### Step 6: Write Output

Write the complete JSON payload to:

- Path: `<output-dir>/beads-payload.json`
- Format: Pretty-printed JSON with 2-space indentation
- Encoding: UTF-8

## Edge Cases

**Missing Sections:**

- If "Implementation Tasks" section not found, report error and stop
- If individual tasks lack required fields (Objective, Acceptance Criteria), use empty values

**Dependency Resolution:**

- If dependency references non-existent task, log warning and omit dependency
- If "None" specified for dependencies, use empty array

**Empty Lists:**

- If no subtasks, omit subtask generation
- If no acceptance criteria, use empty array
- If no dependencies, use empty array

**Special Characters:**

- Preserve markdown formatting in descriptions (can be cleaned later by Beads)
- Handle unicode characters in titles and descriptions

## Validation

Before writing output, validate:

1. At least one task exists (epic alone is invalid)
2. All task IDs are unique
3. All dependency references resolve to existing task IDs
4. All tasks have valid parent_id references
5. JSON structure matches Beads schema

## Reference Documentation

- **Beads Schema**: See `templates/beads-schema.json` in this plugin for field definitions
- **Plan Template**: See `.devagent/core/templates/plan-document-template.md` for plan structure
- **Example Plans**: See `.devagent/workspace/tasks/active/*/plan/*.md` for real plan examples
