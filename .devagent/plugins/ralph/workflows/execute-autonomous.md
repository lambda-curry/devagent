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

**Skill Reference:** See `skills/plan-to-beads-conversion/SKILL.md` in this plugin for detailed conversion instructions.

**Instructions:**
1. Read the plan markdown file from the provided path.
2. Parse the plan document structure:
   - Extract plan title from the `# <Task / Project Name> Plan` header
   - Locate the "### Implementation Tasks" section in "PART 2: IMPLEMENTATION PLAN"
   - For each task under "#### Task N: <Title>", extract:
     - Task number and title
     - **Objective:** (task objective text)
     - **Acceptance Criteria:** (list items under this section)
     - **Dependencies:** (parse task references, e.g., "Task 1" or "None")
     - **Subtasks (optional):** (numbered list items if present)
3. Generate Beads task structure:
   - Create an epic (parent task) with ID format `bd-<4-char-md5-hash>` using plan title
   - For each task, create a Beads task with:
     - `id`: `bd-<hash>.<task-number>` (hierarchical ID)
     - `title`: Task title
     - `description`: Task objective
     - `acceptance_criteria`: List of acceptance criteria items
     - `priority`: "normal" (default)
     - `status`: "ready"
     - `parent_id`: Epic ID
     - `depends_on`: Array of task IDs from parsed dependencies (e.g., if Task 2 depends on Task 1, `depends_on: ["bd-<hash>.1"]`)
   - For each subtask, create a Beads task with:
     - `id`: `bd-<hash>.<task-number>.<subtask-number>`
     - `title`: Subtask title
     - `parent_id`: Parent task ID
     - Other fields as appropriate
4. Generate JSON payload with structure:
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
     "epics": [{"id": "...", "title": "...", "description": "...", "status": "ready"}],
     "tasks": [/* array of task objects */]
   }
   ```
5. Write the JSON payload to the output directory as `beads-payload.json`.

**Reference:** See `.devagent/plugins/ralph/templates/beads-schema.json` for Beads task field definitions.

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

### Step 4: Launch Ralph Execution Loop

**Objective:** Start Ralph's autonomous execution using Beads payload and quality gates.

**Instructions:**
1. Load the Ralph configuration from `ralph-config.json`.
2. Validate AI tool is configured and available:
   - If `ai_tool.name` or `ai_tool.command` is empty, error and stop
   - Check that `ai_tool.command` exists in PATH
3. Import tasks from Beads payload into Beads database:
   - Use `bd` CLI commands to create the epic and tasks from the payload
   - Follow Beads Integration skill instructions for task import
4. Launch Ralph loop script:
   - Execute `.devagent/plugins/ralph/tools/ralph.sh`
   - Script reads config, validates AI tool, runs autonomous loop
   - Handles quality gates, task status updates, and progress tracking
   - **Git progress**: Use standard Git commands to save progress and enable rollback
5. Monitor execution through Beads comments and Git history.
6. On completion, script generates summary of executed tasks, successes, and failures.
7. Generate revise report from logged issues (see Issue Logging below).

**Note:** The Ralph script handles the autonomous loop independently. If AI tool fails during execution, script reports error and stops - user can fix configuration and retry.

**Skill Reference:** See `skills/beads-integration/SKILL.md` in this plugin for detailed Beads CLI usage instructions.

### Issue Logging (During Execution)

**Objective:** Log issues as they occur during execution for final revise report.

**Instructions:**
1. Create revise log file in output directory: `revise-issues.json`
2. For each issue encountered, log with structure:
```json
{
  "timestamp": "<ISO-8601>",
  "category": "ralph_systems|workflows_process|code_rules_documentation|skills_prompts|infrastructure_tooling",
  "severity": "critical|high|medium|low",
  "title": "<brief description>",
  "description": "<detailed description of what went wrong>",
  "symptoms": "<observable effects or error messages>",
  "workaround": "<what you did to work around it>",
  "context": "<what was being executed when it happened>"
}
```
3. Common logging scenarios:
   - **Quality gate failures**: Log with "ralph_systems" category
   - **Confusing instructions**: Log with "workflows_process" category  
   - **Manual intervention required**: Log with "ralph_systems" category
   - **Skill execution problems**: Log with "skills_prompts" category
   - **Missing configuration**: Log with "infrastructure_tooling" category

### Generate Final Revise Report

**Objective:** Create comprehensive revise report from logged issues.

**Instructions:**
1. After execution loop completes, read `revise-issues.json`
2. Run the revise report generation workflow using the collected issues
3. Generate final report in `.devagent/workspace/reviews/`
4. Include execution context and summary in the report

## Error Handling

- **Plan parsing errors:** If plan document structure is invalid or "Implementation Tasks" section is missing, pause execution and report error to user.
- **Beads CLI errors:** If `bd` command is not found in PATH or Beads database operations fail, pause execution and report error to user.
- **Quality gate failures:** If quality gates fail after task implementation, mark task with failure reason, update status, and stop execution (unless configured to retry).

## Output
- `beads-payload.json`: Beads-compatible task structure generated from DevAgent plan
- `quality-gates.json`: Project-specific quality gate configuration
- `ralph-config.json`: Unified Ralph configuration merging all components
- Execution logs: Progress tracked through Beads comments and task status updates
- **Git Progress**: Simple Git commands for checkpointing and rollback:
  ```bash
  # Create branch and save progress
  git checkout -b ralph/execution
  git add .
  git commit -m "ralph: Complete task bd-a3f8.1 - Implement user authentication"
  
  # Rollback if needed
  git checkout main
  git log --oneline --grep="ralph:"  # See Ralph history
  ```
