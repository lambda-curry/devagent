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

3. **Acceptance Criteria:**
   - Pattern: `- **Acceptance Criteria:**` followed by list items
   - Extract all list items (lines starting with `- ` or numbered)

4. **Dependencies:**
   - Pattern: `- **Dependencies:** <task-references>`
   - Parse task references (e.g., "Task 1", "Task 1, Task 2", or "None")
   - Convert to task numbers for dependency mapping

5. **Subtasks (Optional):**
   - Pattern: `- **Subtasks (optional):**` followed by numbered list
   - Extract numbered list items (e.g., `1. Subtask A`, `2. Subtask B`)

### Step 2: Generate Beads Task IDs

**Epic ID:**
- Generate 4-character MD5 hash from plan title
- Format: `bd-<4-char-hash>` (e.g., `bd-a3f8`)

**Task IDs:**
- Format: `bd-<hash>.<task-number>` (e.g., `bd-a3f8.1`, `bd-a3f8.2`)

**Subtask IDs:**
- Format: `bd-<hash>.<task-number>.<subtask-number>` (e.g., `bd-a3f8.1.1`, `bd-a3f8.1.2`)

### Step 3: Build Task Hierarchy

**IMPORTANT - Beads Schema Compatibility:**
The Beads CLI schema requires `acceptance_criteria` to be a **string**, not an array. DevAgent plans use arrays, so conversion is required:
- Convert acceptance criteria arrays to markdown-formatted strings
- Prepend parent task ID to child task descriptions for parent-child relationship visibility
- Use the `plan-to-beads-converter.sh` utility in `tools/` for automated conversion

**Epic (Parent Task):**
```json
{
  "id": "bd-<hash>",
  "title": "<plan-title>",
  "description": "",
  "status": "ready"
}
```

**Main Tasks:**
```json
{
  "id": "bd-<hash>.<number>",
  "title": "<task-title>",
  "description": "<task-objective>",
  "acceptance_criteria": "- <criterion-1>\n- <criterion-2>\n- <criterion-3>",
  "priority": "normal",
  "status": "ready",
  "parent_id": "bd-<hash>",
  "depends_on": ["bd-<hash>.<dependency-number>", ...]
}
```

**Subtasks (with parent context):**
```json
{
  "id": "bd-<hash>.<task-number>.<subtask-number>",
  "title": "<subtask-title>",
  "description": "**Parent Task:** bd-<hash>.<task-number>\n\n<subtask-description>",
  "acceptance_criteria": "",
  "priority": "normal",
  "status": "ready",
  "parent_id": "bd-<hash>.<task-number>",
  "depends_on": []
}
```

### Step 4: Resolve Dependencies

For each task with dependencies:
1. Parse dependency text to extract task numbers
2. Map task numbers to generated task IDs
3. Populate `depends_on` array with dependency task IDs
4. If dependencies reference tasks not yet created, ensure topological ordering

### Step 5: Generate Complete Payload

**Full JSON Structure:**
```json
{
  "metadata": {
    "source_plan": "<absolute-path-to-plan>",
    "generated_at": "<ISO-8601-UTC-timestamp>Z"
  },
  "ralph_integration": {
    "ready_command": "bd ready",
    "status_updates": {
      "in_progress": "in_progress",
      "closed": "closed"
    },
    "progress_comments": true
  },
  "epics": [
    {
      "id": "bd-<hash>",
      "title": "<plan-title>",
      "description": "",
      "status": "ready"
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

## Utility Scripts

**Automated Conversion:**
Use the `plan-to-beads-converter.sh` utility in `tools/` directory:

```bash
./tools/plan-to-beads-converter.sh <plan-file> <output-dir>
```

This utility:
- Extracts plan title and generates epic ID
- Creates base JSON structure with schema compatibility
- Flattens acceptance_criteria arrays to markdown strings
- Prepends parent context to child descriptions
- Validates against Beads schema constraints

**Note:** The script creates the base structure. Full task extraction requires manual parsing or a more sophisticated parser (Python/Node.js) to extract all task details from the markdown.

## Reference Documentation

- **Beads Schema**: See `templates/beads-schema.json` in this plugin for field definitions
- **Plan Template**: See `.devagent/core/templates/plan-document-template.md` for plan structure
- **Example Plans**: See `.devagent/workspace/tasks/active/*/plan/*.md` for real plan examples
- **Converter Utility**: See `tools/plan-to-beads-converter.sh` for automated base conversion
