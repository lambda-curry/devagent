# Execute Autonomous (Ralph Plugin)

## Mission
Convert a DevAgent plan into Beads tasks, configure quality gates, and launch Ralph's autonomous execution loop using Beads for state and progress tracking.

## Inputs
- Required: Path to DevAgent plan markdown file
- Optional: Output directory for Beads payloads (default: `.devagent/plugins/ralph/output/`)

## Standard Instructions Reference
Before executing this workflow, review standard instructions in `.devagent/core/AGENTS.md` → Standard Workflow Instructions for date handling, metadata retrieval, context gathering order, and storage patterns.

## Resource Strategy
- Plan document: Located at path provided in input. Parse "Implementation Tasks" section to extract tasks.
- Beads schema reference: `.devagent/plugins/ralph/templates/beads-schema.json` (reference structure for Beads task format)
- Quality gate template: `.devagent/plugins/ralph/quality-gates/typescript.json` (TypeScript quality gate configuration)
- Browser automation skill: `.devagent/plugins/ralph/skills/agent-browser/SKILL.md` (agent-browser CLI usage)
- Config template: `.devagent/plugins/ralph/tools/config.json` (reference template for Ralph configuration)

## Workflow Steps

### Step 1: Convert Plan to Beads Payload

**Objective:** Read the DevAgent plan markdown and generate a Beads-compatible JSON payload.

**⚠️ READ THIS FIRST:** See `skills/plan-to-beads-conversion/SKILL.md` in this plugin for detailed conversion instructions.

**Instructions:**

#### Step 1.1: Validate Prerequisites

Before generating the payload, validate the setup:

1. **Check Beads CLI is installed:**
   ```bash
   which bd
   ```
   If not found, error and stop with message: "Beads CLI (bd) not found in PATH. Please install Beads first."

2. **Check Beads database is initialized:**
   ```bash
   bd list --json > /dev/null 2>&1
   ```
   If this fails, error and stop with message: "Beads database not initialized. Run 'bd init' first."

3. **Detect Beads database prefix:**
   ```bash
   DB_PREFIX=$(bd list --json 2>/dev/null | jq -r '.[0].id' | cut -d'-' -f1-2 || echo "bd")
   ```
   - Extract prefix from existing tasks (first two parts of task ID, e.g., "video-query-mcp" from "video-query-mcp-abc123")
   - If no tasks exist, default to "bd"
   - **Important:** Use this detected prefix for all task IDs, NOT hardcoded "bd-"

#### Step 1.2: Validate Plan Structure

1. Read the plan markdown file from the provided path.
2. Validate plan structure:
   - Check for `# <Task / Project Name> Plan` header
   - Check for "PART 1: PRODUCT CONTEXT" or "## Overview" section (support variations)
   - Check for "PART 2: IMPLEMENTATION PLAN" or "## Implementation Steps" section (support variations)
   - If structure doesn't match expected format, warn user but attempt to parse with fallback logic
3. Read the quality gate template from `.devagent/plugins/ralph/quality-gates/typescript.json` (or project-specific template) to extract quality gate commands that will be required.

#### Step 1.3: Parse Plan Document

4. Parse the plan document structure:
   - Extract plan title from the `# <Task / Project Name> Plan` header
   - Extract final deliverable summary from "PART 1: PRODUCT CONTEXT" → "### Summary" section (or use "### Functional Narrative" if Summary is too high-level)
   - Locate the "### Implementation Tasks" section in "PART 2: IMPLEMENTATION PLAN"
   - For each task under "#### Task N: <Title>", extract:
     - Task number and title
     - **Objective:** (task objective text)
     - **Acceptance Criteria:** (list items under this section)
     - **Dependencies:** (parse task references, e.g., "Task 1" or "None")
     - **Subtasks (optional):** (numbered list items if present)
5. Generate Beads task structure:
   - Create an epic (parent task) with ID format `<DB_PREFIX>-<4-char-md5-hash>` using plan title and the detected prefix from Step 1.1
     - `description`: Build a comprehensive epic description following the format in `skills/plan-to-beads-conversion/SKILL.md`:
       - Reference to the plan document: "Plan document: <absolute-path-to-plan-file>"
       - Final deliverable summary: Use the extracted summary from step 3 above to describe what the final output should be
       - Final quality gates: List all quality gates from the template read in step 2 (e.g., "All tests passing (npm test)", "Lint clean (npm run lint)", "Typecheck passing (npm run typecheck)", etc.)
       - Format as multi-line text with clear sections
   - For each task, create a Beads task with:
     - `id`: `<DB_PREFIX>-<hash>.<task-number>` (hierarchical ID using detected prefix)
     - `title`: Task title
     - `description`: Task objective
     - `acceptance_criteria`: List of acceptance criteria items
     - `priority`: "normal" (default)
     - `status`: "todo"
     - `parent_id`: Epic ID
     - `depends_on`: Array of task IDs from parsed dependencies (e.g., if Task 2 depends on Task 1, `depends_on: ["<DB_PREFIX>-<hash>.1"]`)
     - `notes`: "Plan document: <absolute-path-to-plan-file>"
   - For each subtask, create a Beads task with:
     - `id`: `<DB_PREFIX>-<hash>.<task-number>.<subtask-number>` (using detected prefix)
     - `title`: Subtask title
     - `parent_id`: Parent task ID
     - `notes`: "Plan document: <absolute-path-to-plan-file>"
     - Other fields as appropriate
   - **Important:** Always include the absolute path to the source plan document in the epic description and each task's notes field to avoid ambiguity for agents.
6. **Append Final Report Task:**
   - Automatically add a final task "Generate Epic Revise Report"
   - Depend on all other top-level tasks to ensure it runs last
   - Instruction: "Run `devagent ralph-revise-report <EpicID>`"
   - Include `notes`: "Plan document: <absolute-path-to-plan-file>"
7. Generate JSON payload with structure:
   ```json
   {
     "metadata": {
       "source_plan": "<plan-path>",
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
     "epics": [{"id": "...", "title": "...", "description": "...", "status": "todo"}],
     "tasks": [/* array of task objects */]
   }
   ```
8. Write the JSON payload to the output directory as `beads-payload.json`.

**Reference:** See `.devagent/plugins/ralph/templates/beads-schema.json` for Beads task field definitions.

**⚠️ Important:** The detected database prefix (`DB_PREFIX`) must be used consistently for all task IDs. If the prefix in the payload doesn't match your database prefix, you'll get a prefix mismatch error during import.

### Step 2: Configure Quality Gates

**Objective:** Load TypeScript quality gate template for autonomous execution.

**Skill Reference:** See `skills/quality-gate-detection/SKILL.md` in this plugin for detailed instructions.

**Instructions:**
1. Read the TypeScript quality gate template from `.devagent/plugins/ralph/quality-gates/typescript.json`.
2. Generate quality gate configuration with structure:
   ```json
   {
     "template": "typescript",
     "commands": {
       "test": "npm test",
       "lint": "npm run lint",
       "typecheck": "npm run typecheck",
       "browser": "npm run test:browser"
     },
      "browser_requirements": [
        "Agent Browser CLI"
      ],

     "source_template": "<absolute-path-to-typescript.json>"
   }
   ```
3. Write the quality gate configuration to the output directory as `quality-gates.json`.
4. If browser requirements exist, follow `skills/agent-browser/SKILL.md` to run validation.

**Reference:** Quality gate template is at `.devagent/plugins/ralph/quality-gates/typescript.json`.

### Step 3: Prepare Ralph Configuration

**Objective:** Merge Beads payload and quality gates into a unified Ralph configuration, including AI tool selection.

**Instructions:**
1. Read the base config template from `.devagent/plugins/ralph/tools/config.json`.
2. Read the generated `beads-payload.json` and `quality-gates.json` from the output directory.
3. Determine AI tool configuration:
   - Check if AI tool command exists in user environment
   - Validate AI tool is available before including in config
4. Merge into Ralph configuration:
   ```json
   {
     "beads": {
       "database_path": ".beads/beads.db",
       "project": "default"
     },
     "ai_tool": {
       "name": "<cursor|opencode|claude-code|custom>",
       "command": "<cursor|opencode|claude|custom-command>",
       "env": {}
     },
     "quality_gates": {
       "template": "<from-quality-gates.json>",
       "commands": { /* from quality-gates.json */ },
       "overrides": {}
     },
     "beads_payload": "<path-to-beads-payload.json>",
     "quality_gates_path": "<path-to-quality-gates.json>",
     "execution": {
       "require_confirmation": true,
       "max_iterations": 50
     }
   }
   ```
5. Write the merged configuration to the output directory as `ralph-config.json`.
6. Validate AI tool is available before proceeding to execution.

**AI Tool Examples:**
```json
// Cursor
{"name": "cursor", "command": "cursor", "env": {}}

// OpenCode  
{"name": "opencode", "command": "opencode", "env": {}}

// Claude Code
{"name": "claude-code", "command": "claude", "env": {}}

// Custom tool
{"name": "custom", "command": "my-ai-tool", "env": {"CUSTOM_VAR": "value"}}
```

### Step 4: Validate Setup and Prepare for Execution

**Objective:** Validate all setup artifacts are in place and ready for Ralph execution.

**Instructions:**
1. Load the Ralph configuration from `ralph-config.json`.
2. Validate AI tool is configured and available:
   - If `ai_tool.name` or `ai_tool.command` is empty, error and stop
   - Check that `ai_tool.command` exists in PATH
3. Import tasks from Beads payload into Beads database:
   - **Recommended:** Use the provided import script for automatic import:
     ```bash
     node .devagent/plugins/ralph/tools/import-beads.js .devagent/plugins/ralph/output/beads-payload.json
     ```
     The script handles prefix detection, proper Beads CLI flag usage, and error handling automatically.
   - **Alternative (Manual):** Use `bd` CLI commands to create the epic and tasks from the payload
     - Follow Beads Integration skill instructions for task import
     - **Important Beads CLI Notes:**
       - **Hierarchical IDs:** When using IDs like `prefix-abc.1`, Beads automatically infers the parent. Do NOT use `--parent` flag with hierarchical IDs.
       - **Force flag:** Use `--force` when creating tasks with explicit IDs that match the database prefix.
       - **Multiline content:** Always use `--body-file` for descriptions containing newlines (write content to temp file first).
     - See `skills/beads-integration/SKILL.md` for detailed patterns
   - Verify epic and all tasks were created successfully
4. Confirm execution artifacts and Beads prefix:
   - Ensure `beads-payload.json`, `quality-gates.json`, and `ralph-config.json` exist in the output directory
   - Verify `bd` is configured with the correct prefix for this run
   - Verify epic description includes plan document reference, final deliverable summary, and final quality gates
5. **Handoff to Start Ralph Workflow:**
   - All setup is complete. To begin execution, use the `start-ralph-execution.md` workflow
   - The setup includes:
     - Epic with plan document reference and final deliverable/quality gates description
     - All tasks imported into Beads database
     - Quality gates configured
     - Ralph configuration ready
   - **Recommended:** Provide the Epic ID to `start-ralph-execution.md` to run in a dedicated worktree (`--epic <id>`)
   - Do NOT launch Ralph execution in this workflow - that is handled by `start-ralph-execution.md`

**Agent Responsibilities (Context):**
Once Ralph execution begins (via `start-ralph-execution.md`), agents are responsible for:
- Reading full task and epic context using Beads CLI (`bd show`)
- Implementing tasks according to acceptance criteria
- Running quality gates to verify work
- Committing work with conventional commit messages
- Updating task status (`closed`, `blocked`, or `in_progress`)
- Adding comments for traceability (commits, revision learnings, screenshots)
- Using Beads metadata fields (`design`, `notes`, `priority`, `labels`) to capture context and decisions

For detailed agent instructions, see `.devagent/plugins/ralph/AGENTS.md` and `.devagent/plugins/ralph/skills/beads-integration/SKILL.md`.

**Note:** This workflow only prepares the Beads payload and configuration for Ralph. The actual execution loop is launched via `start-ralph-execution.md` workflow, which handles task selection, AI tool invocation, and monitoring.

## Error Handling

- **Plan parsing errors:** If plan document structure is invalid or "Implementation Tasks" section is missing, pause execution and report error to user. Attempt to parse with fallback logic if structure variations are detected.
- **Beads CLI errors:** If `bd` command is not found in PATH or Beads database operations fail, pause execution and report error to user.
- **Prefix mismatch errors:** If payload prefix doesn't match database prefix, regenerate payload with correct prefix or use import script which auto-detects prefix.
- **Quality gate failures:** Handled by Ralph during execution (see `.devagent/plugins/ralph/AGENTS.md`)

## Troubleshooting

For common issues:
- Check that Beads CLI is installed and database is initialized
- Verify database prefix matches payload prefix (use import script for auto-detection)
- See Beads Integration skill (`.devagent/plugins/ralph/skills/beads-integration/SKILL.md`) for CLI usage patterns

## Output
- Review checklist: Validate `.devagent/plugins/ralph/output/beads-payload.json`, `quality-gates.json`, and `ralph-config.json` exist before execution and ensure `bd` prefix is configured
- `beads-payload.json`: Beads-compatible task structure generated from DevAgent plan
- `quality-gates.json`: Project-specific quality gate configuration
- `ralph-config.json`: Unified Ralph configuration merging all components
- **Epic in Beads:** Epic created with:
  - Plan document reference
  - Final deliverable summary (from plan)
  - Final quality gates requirements
- **Tasks in Beads:** All tasks imported and ready for execution
- **Handoff to Start Ralph:** After setup is complete, use the `start-ralph-execution.md` workflow to begin autonomous execution. This workflow only handles setup and preparation.