# Setup Ralph Loop (Ralph Plugin)

## Mission
Convert a DevAgent plan into Beads tasks by creating them directly using Beads CLI, configure quality gates, and prepare for Ralph's autonomous execution loop.

## Inputs
- Required: Path to DevAgent plan markdown file
- Optional: Output directory for temporary files (default: `.devagent/plugins/ralph/output/`)

## Standard Instructions Reference
Before executing this workflow, review standard instructions in `.devagent/core/AGENTS.md` → Standard Workflow Instructions for date handling, metadata retrieval, context gathering order, and storage patterns.

## Resource Strategy
- Plan document: Located at path provided in input. Read and extract key information to create Beads tasks.
- Beads integration: `.devagent/plugins/ralph/skills/beads-integration/SKILL.md` (Beads CLI usage patterns)
- Quality gate detection: `.devagent/plugins/ralph/skills/quality-gate-detection/SKILL.md` (dynamic detection from `package.json`)
- Browser automation skill: `.devagent/plugins/ralph/skills/agent-browser/SKILL.md` (agent-browser CLI usage)
- Config template: `.devagent/plugins/ralph/tools/config.json` (reference template for Ralph configuration)

## Workflow Steps

### Step 1: Validate Prerequisites

**Objective:** Ensure Beads CLI is available and database is initialized.

**Instructions:**

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

3. **Check daemon health (optional) and pick a stable mode for this workflow:**
   - If you see repeated output like: “Daemon took too long to start (>5s). Running in direct mode.” then each invocation is paying a startup penalty.
   - For agent-driven workflows, it’s often better to **force direct mode** for the full setup run:
     ```bash
     export BEADS_NO_DAEMON=1
     ```
   - If you prefer daemon mode, restart it and re-check:
     ```bash
     bd daemons restart .
     bd info --json
     ```

4. **Detect Beads database prefix:**
   ```bash
   # First, try to get prefix from database configuration (most reliable)
   DB_PREFIX=$(bd config get issue_prefix 2>/dev/null | tr -d '\n' | grep -v "Error\|not found" || echo "")
   
   # Fallback: try to get prefix from existing tasks
   if [ -z "$DB_PREFIX" ] || [ "$DB_PREFIX" = "" ]; then
     DB_PREFIX=$(bd list --json 2>/dev/null | jq -r '.[0].id' | cut -d'-' -f1-2)
   fi
   
   # Final fallback: use directory name (matches bd init default behavior)
   if [ -z "$DB_PREFIX" ] || [ "$DB_PREFIX" = "null" ] || [ "$DB_PREFIX" = "" ]; then
     DB_PREFIX=$(basename "$(pwd)")
     # Last resort: default to "bd" only if directory name is invalid
     if [ -z "$DB_PREFIX" ] || [ "$DB_PREFIX" = "." ] || [ "$DB_PREFIX" = ".." ]; then
       DB_PREFIX="bd"
     fi
   fi
   ```
   - **Primary method:** Query `bd config get issue_prefix` to get the configured prefix (set by `bd init`)
   - **Fallback:** Extract prefix from existing tasks (first two parts of task ID)
   - **Final fallback:** Use directory name (matches `bd init` default behavior)
   - **Important:** Use this detected prefix for all task IDs, NOT hardcoded "bd-"
   - **Rationale:** `bd init` stores the prefix in database configuration. Always query the configured prefix first to avoid mismatches.

### Step 2: Read and Extract Plan Information

**Objective:** Read the plan document and extract key information for creating Beads tasks.

**Instructions:**

1. **Read the plan markdown file** from the provided path.
   - **Extraction method:** Perform a careful manual read and extract the required fields directly from the plan text.
   - **Do not use ad-hoc parsing scripts** (regex/CLI parsing) unless explicitly requested; manual extraction is the default.
2. **Extract plan metadata:**
   - Plan title from `# <Task / Project Name> Plan` header
   - Summary from "PART 1: PRODUCT CONTEXT" → "### Summary" section (or "### Functional Narrative" if Summary is too high-level)
   - Absolute path to plan document for reference
3. **Extract task information** from "PART 2: IMPLEMENTATION PLAN" → "### Implementation Tasks":
   - For each `#### Task N: <Title>`, extract:
     - Task number and title
     - **Objective:** (task objective text)
     - **Impacted Modules/Files:** (list of files/modules)
     - **References:** (references to docs, rules, other tasks)
     - **Dependencies:** (parse task references, e.g., "Task 1" or "None")
     - **Acceptance Criteria:** (list items under this section)
     - **Testing Criteria:** (testing requirements)
     - **Subtasks (optional):** (numbered list items if present)
4. **Determine UI-sensitivity (for design task creation):**
   - Follow the UI-sensitivity heuristic defined in `.devagent/plugins/ralph/skills/plan-to-beads-conversion/SKILL.md`.
   - Record a boolean `is_ui_sensitive` for task creation rules (Step 4).
5. **Detect quality gates** from `package.json`:
   - Use the `quality-gate-detection` skill to identify available commands
   - Document detected quality gates (test, lint, typecheck, etc.)

### Step 3: Create Epic Task

**Objective:** Create the epic (parent task) in Beads with comprehensive context.

**Instructions:**

1. **Generate epic ID:**
   - Create 4-character MD5 hash from plan title
   - Format: `<DB_PREFIX>-<4-char-hash>` (e.g., `devagent-a217`)

2. **Build epic description:**
   - Include plan document reference: "Plan document: <absolute-path-to-plan-file>"
   - Include final deliverable summary (from Step 2)
   - Include final quality gates (detected from `package.json` in Step 2)
   - Format as multi-line text with clear sections

3. **Create epic using Beads CLI:**
   ```bash
   # Write description to temp file (for multiline content)
   echo "Plan document: <absolute-path>
   
   Final Deliverable: <summary>
   
   Final Quality Gates:
   - All tests passing (bun run test)
   - Lint clean (bun run lint)
   - Typecheck passing (bun run typecheck)" > /tmp/epic-desc.txt
   
   # Create epic (status is "open" by default, no need to set explicitly)
   bd create --id <EPIC_ID> --title "<plan-title>" --body-file /tmp/epic-desc.txt --priority P2 --force --json
   
   # Clean up temp file
   rm /tmp/epic-desc.txt
   ```

**Important:** Always use `--body-file` for multiline descriptions. See Beads Integration skill for details.

### Step 4: Create Task Tasks

**Objective:** Create all tasks from the plan as Beads tasks with rich metadata.

**Instructions:**

**Design task creation (UI-sensitive plans):**
1. **If `is_ui_sensitive` is true and the plan does not already include a design task:**
   - Create an additional **direct epic child** task labeled `design`.
   - **Preferred ordering:** Make it the first numbered task. If renumbering is too heavy, create it as the next available task number and add dependencies from UI implementation tasks to this design task.
   - **Title:** "Design Deliverables (UI-Sensitive Plan)"
   - **Deliverables:** Follow `.devagent/plugins/ralph/skills/plan-to-beads-conversion/SKILL.md` for the required design deliverables checklist.
   - **Notes:** "Design output must live in this task's comments with links to artifacts (Storybook paths, screenshots, mockups)."
2. **If a design task already exists in the plan:** keep it and ensure it aligns with the deliverables checklist in the plan-to-beads conversion skill.

For each task extracted in Step 2:

1. **Generate task ID:**
   - Format: `<EPIC_ID>.<task-number>` (e.g., `devagent-a217.1`)
   - Beads automatically infers parent from hierarchical ID (do NOT use `--parent` flag)

2. **Build task description:**
   - Start with objective from plan
   - Include context about what the task accomplishes
   - Reference the plan document with absolute path
   - Use temp file for multiline content if needed

3. **Build design field:**
   - Extract architecture/design considerations from plan
   - Include technical constraints and patterns
   - Reference relevant cursor rules or documentation
   - Include helpful excerpts from plan where relevant
   - **Note:** Can be inline if short, or use temp file if multiline

4. **Build notes field:**
   - Include plan document reference: "Plan document: <absolute-path>"
   - List impacted modules/files from plan
   - Include references to related docs, rules, or other tasks
   - Add any implementation hints or warnings
   - **Note:** Can be inline if short, or use temp file if multiline

5. **Build acceptance criteria:**
   - Convert acceptance criteria list to semicolon-separated format
   - Format: "Criterion 1; Criterion 2; Criterion 3"
   - Use inline `--acceptance` flag (semicolon-separated works well)

6. **Parse dependencies:**
   - Convert task references (e.g., "Task 1", "Task 1, Task 2") to task IDs
   - Format: `<EPIC_ID>.1`, `<EPIC_ID>.2`, etc.
   - If "None", record no dependencies for this task
   - **Important:** Dependencies are added as edges. You can add them after creation via `bd dep add <task-id> <depends-on-id>`. (`bd update` cannot add deps.)

7. **Assign agent label (direct epic child tasks only):**
   - **Objective:** Assign a single Beads routing label per **direct epic child task** so Ralph can pick the right agent.
   - **One-level labeling rule:** Only the epic’s direct children must be labeled. Subtasks/sub-issues are **context-only** by default and should be unlabeled unless you intentionally want distinct routing.
   - **Instructions:**
     1. **Read agents mapping from config:**
        - Load `.devagent/plugins/ralph/tools/config.json` and read the `agents` section
        - Available labels are the keys in the `agents` mapping (e.g., `engineering`, `qa`, `general`, `project-manager`)
        - Ralph’s router reads labels from `bd label list <task-id>` and chooses the **first** label that exists in this mapping.
        - Example mapping structure:
          ```json
          {
            "agents": {
              "engineering": "implementation-agent.json",
              "qa": "qa-agent.json",
              "design": "design-agent.json",
              "general": "project-manager-agent.json",
              "project-manager": "project-manager-agent.json"
            }
          }
          ```
     2. **Determine appropriate label based on task content:**
        - **Engineering tasks:** Any task that requires code changes → use `engineering`
        - **QA/testing tasks:** Tasks that involve testing, quality assurance, test writing, or validation → use `qa` label
        - **Design tasks:** UX/design decisions where implementation is secondary → use `design`
        - **General tasks:** Coordination, planning, doc-only, and “decide/triage” work → use `general` label (default fallback)
        - **Project manager tasks:** Phase check-ins, final review, and explicit coordination-only work → use `project-manager` label
     3. **Assign label during task creation:**
        - Use `--label` flag with Beads CLI: `--label <label-name>`
        - **Important:** Assign exactly ONE label per direct epic child task (no multi-label support)
        - **Fallback rule:** When in doubt or no clear match, use `general` label

**Label taxonomy (quick reference):**

| Label | Use when | Examples | Notes |
| --- | --- | --- | --- |
| `engineering` | Task requires code changes | implement feature, fix bug, refactor module, wire route/component, change CLI/tooling code | Default for “coding agent needed” |
| `qa` | Task is primarily verification/testing | add/adjust tests, reproduce/verify bug, write perf/regression coverage, run UI QA + capture evidence | Prefer `qa` when the main output is validation, not implementation |
| `design` | Task is primarily UX/design decisions | UX spec, interaction design notes, visual/layout decisions | Use when code changes are secondary |
| `general` | Coordination / planning / documentation / triage | write plan/review docs, coordination checkpoints, create follow-up tasks, summarization | Fallback when no other label fits |
| `project-manager` | Explicit coordination-only checkpoints | phase check-ins, final review, revise report generation | Use sparingly; reserve for explicit PM tasks |

8. **Create task using Beads CLI:**
   ```bash
   # Write description to temp file if multiline
   echo "<task-description>" > /tmp/task-desc.txt
   
   # Create task with all fields
   # Use multiple --deps flags for multiple dependencies
   # Assign single agent label (use "general" as fallback if unclear)
   bd create --id <TASK_ID> \
     --title "<task-title>" \
     --body-file /tmp/task-desc.txt \
     --design "<design-notes>" \
     --notes "<notes-content>" \
     --acceptance "<acceptance-criteria>" \
     --priority P2 \
     --label <agent-label> \
     --force \
     --json
   
   # Clean up temp file
   rm /tmp/task-desc.txt
   ```

9. **Ensure parent linkage for epic-scoped queries:**
   - When using explicit hierarchical IDs, Beads may not populate `parent` automatically for filtering.
   - To guarantee `bd ready --parent <EPIC_ID>` and Ralph epic filters work, set parent explicitly:
     ```bash
     bd update <TASK_ID> --parent <EPIC_ID> --json
     ```

10. **Verify routing labels for direct epic children:**
   - **Goal:** Every direct epic child has exactly one label that exists in the config mapping.
   - **List valid labels from config:**
     ```bash
     jq -r '.agents | keys[]' .devagent/plugins/ralph/tools/config.json
     ```
   - **Check labels for each top-level task:**
     ```bash
     bd label list <TASK_ID>
     ```
   - **Fix missing/unmapped labels:**
     ```bash
     bd label add <TASK_ID> <label>
     bd label remove <TASK_ID> <label>
     ```
   - If multiple labels are present, remove extras so exactly one routing label remains.

**Important Notes:**
- Use `--body-file` for multiline descriptions
- **Dependencies are added after creation** with `bd dep add <task-id> <depends-on-id>` (recommended), or optionally during creation if the IDs are already known. `bd update` does not support deps.
- **Agent labels must be assigned during creation** - Assign exactly ONE label per **direct epic child** using `--label` flag
- **Label assignment rules:**
  - Reference `agents` mapping in `.devagent/plugins/ralph/tools/config.json` for available labels
  - Direct epic children require exactly one routing label; subtasks are unlabeled by default
  - Use `engineering` for tasks that require code changes
  - Use `qa` for testing/quality assurance tasks
  - Use `design` for design/UX tasks
  - Use `project-manager` **sparingly** for explicit PM checkpoints (phase check-in, final review)
  - Use `general` as fallback for unclear or coordination-only tasks
- Use `--force` when creating tasks with explicit IDs matching database prefix
- **Parent linkage for epic filters:** If using explicit IDs, follow up with `bd update <TASK_ID> --parent <EPIC_ID>` so `bd ready --parent` works reliably.
- Always include plan document reference in notes field
- Tasks are created with status "open" by default - no need to set explicitly

### Step 5: Create Subtasks (if any)

**Objective:** Create subtasks as child tasks of their parent tasks.

**Instructions:**

For each subtask extracted in Step 2:

1. **Generate subtask ID:**
   - Format: `<PARENT_TASK_ID>.<subtask-number>` (e.g., `devagent-a217.1.1`)

2. **Create subtask:**
   ```bash
   bd create --id <SUBTASK_ID> \
     --title "<subtask-title>" \
     --description "<subtask-description>" \
     --notes "Plan document: <absolute-path>" \
     --priority P2 \
     --force \
     --json
   ```

**Note:** If using explicit IDs, set parent explicitly after creation so `bd ready --parent <EPIC_ID>` includes descendants:
```bash
bd update <SUBTASK_ID> --parent <PARENT_TASK_ID> --json
```
Subtasks are created with status "open" by default.
**Labeling note:** Subtasks are unlabeled by default. Only add a label if you intentionally want a subtask to be routed separately.

### Step 6: Create Final Report Task

**Objective:** Add a final task that generates the epic revise report after all other tasks complete.

**Instructions:**

1. **Determine highest task number** from created tasks
2. **Create report task with dependencies on all top-level tasks:**
   ```bash
   REPORT_TASK_ID="<EPIC_ID>.<max-task-number+1>"
   
   bd create --id "$REPORT_TASK_ID" \
     --title "Generate Epic Revise Report" \
     --label project-manager \
     --description "Auto-generated epic quality gate. This task runs only after all other epic tasks are closed or blocked. 

**Steps:**
1. Verify that all child tasks have status 'closed' or 'blocked' (no 'open', 'in_progress' tasks remain)
2. Generate the revise report: \`devagent ralph-revise-report <EPIC_ID>\`
3. **Epic Status Management:**
   - If ALL tasks are closed (no blocked tasks): Close the epic with \`bd update <EPIC_ID> --status closed\` and close this report task
   - If ANY tasks are blocked: **Do not block the epic.** Keep the epic \`open\`, leave this report task \`open\`, and add a comment explaining which tasks remain blocked and what to re-check on the next run" \
     --acceptance "All child tasks are closed or blocked; Report generated in .devagent/workspace/reviews/; Epic closed only when all tasks are closed; report task left open with blocker summary when blocked tasks remain" \
     --notes "Plan document: <absolute-path>" \
     --priority P2 \
     --force \
     --json
   ```

**Then add dependencies (recommended):**
```bash
bd dep add <REPORT_TASK_ID> <EPIC_ID>.1
bd dep add <REPORT_TASK_ID> <EPIC_ID>.2
# ... one per top-level task
```

**Note:** This keeps creation resumable and avoids long `bd create` commands that are more likely to timeout in agent environments.
If using explicit IDs, set parent explicitly after creation:
```bash
bd update <REPORT_TASK_ID> --parent <EPIC_ID> --json
```
**Manual backfill:** If an epic is missing the report task, create it using this Step 6 (include dependencies and parent). Do not add a router-driven auto-close backstop; the report task is the only canonical epic closer.

### Step 7: Prepare Ralph Configuration (No Branch Creation)

**Objective:** Ensure Ralph configuration is ready for execution. Branch creation/switching is **not** part of this workflow.

**Instructions:**

1. **Choose the branches Ralph should validate against:**
   - `git.base_branch`: the branch you consider the “base” for your work (typically `main`)
   - `git.working_branch`: the branch Ralph will run on (must already exist locally, and you must be checked out to it when starting Ralph)

2. **Verify your current branch is the intended working branch:**
   ```bash
   git branch --show-current
   ```
   - If you want a dedicated branch for Ralph, create/switch it **manually** before continuing.

3. **Check if config exists:**
   - If `.devagent/plugins/ralph/tools/config.json` exists, read it and preserve existing settings
   - If it doesn't exist, create it from template

4. **Determine AI tool configuration:**
   - Check if AI tool command exists in user environment
   - Validate AI tool is available before including in config

5. **Create or update config with git section (preserve other settings):**
   - Use `jq` to update config.json:
     ```bash
     BASE_BRANCH="<base-branch>"       # e.g., main
     WORKING_BRANCH="<working-branch>" # must exist locally; must match current branch when starting Ralph

     # Read existing config or create empty object
     if [ -f ".devagent/plugins/ralph/tools/config.json" ]; then
       CONFIG=$(cat ".devagent/plugins/ralph/tools/config.json")
     else
       CONFIG="{}"
     fi
     
     # Update git section (preserves other fields)
     echo "$CONFIG" | jq --arg base "$BASE_BRANCH" --arg working "$WORKING_BRANCH" \
       '. + {
         "beads": (.beads // {
           "database_path": ".beads/beads.db",
           "project": "default"
         }),
         "ai_tool": (.ai_tool // {
           "name": "<agent|opencode|claude-code|custom>",
           "command": "<agent|opencode|claude|custom-command>",
           "env": {}
         }),
         "quality_gates": (.quality_gates // {
           "template": "",
           "overrides": {}
         }),
         "git": {
           "base_branch": $base,
           "working_branch": $working
         },
         "execution": (.execution // {
           "require_confirmation": true,
           "max_iterations": 50
         })
       }' > ".devagent/plugins/ralph/tools/config.json"
     ```

6. **Validate AI tool is available** before proceeding.

**AI Tool Examples:**
```json
// Cursor Agent (CLI command is "agent", not "cursor")
{"name": "agent", "command": "agent", "env": {}}

// OpenCode  
{"name": "opencode", "command": "opencode", "env": {}}

// Claude Code
{"name": "claude-code", "command": "claude", "env": {}}

// Custom tool
{"name": "custom", "command": "my-ai-tool", "env": {"CUSTOM_VAR": "value"}}
```

### Step 8: Validate Setup and Prepare for Execution

**Objective:** Verify all tasks are created and ready for Ralph execution.

**Instructions:**

1. **Verify epic was created:**
   ```bash
   bd show <EPIC_ID> --json
   ```
   - Check that description includes plan document reference, final deliverable, and quality gates

2. **Verify all tasks were created:**
   ```bash
   bd list --json | jq '.[] | select(.id | startswith("<EPIC_ID>"))'
   ```
   - Verify all task IDs exist
   - Check that dependencies are set correctly (use `bd show <task-id> --json` to see dependencies array)

3. **Verify ready tasks:**
   ```bash
   # Note: bd ready defaults to --limit 10, so increase limit for epics.
   bd ready --parent <EPIC_ID> --limit 200 --json
   ```
   - Tasks with no dependencies should appear in ready list
   - Tasks with dependencies will appear once dependencies are closed
   - If empty unexpectedly, run `bd dep tree <task-id>` and verify dependencies are `blocks` only

4. **Validate AI tool is configured and available:**
   - If `ai_tool.name` or `ai_tool.command` is empty, error and stop
   - Check that `ai_tool.command` exists in PATH

5. **Validate git branch requirements:**
   - `git.working_branch` must exist locally
   - You must be checked out to `git.working_branch` before starting Ralph
   - Ralph will validate and fail fast if these are not true

6. **Handoff to Start Ralph Workflow:**
   - All setup is complete. To begin execution, use the `start-ralph-execution.md` workflow
   - The setup includes:
     - Epic with plan document reference and final deliverable/quality gates description
     - All tasks created in Beads database with rich metadata (description, design, notes, acceptance_criteria)
     - Dependencies set correctly (tasks with dependencies won't appear in `bd ready` until dependencies are closed)
     - Quality gates will be detected dynamically during execution from `package.json`
     - Ralph configuration ready
   - **If this setup came from a DevAgent task hub:** update that task’s `AGENTS.md` to record the Beads epic ID (and add a progress log entry pointing to the epic).
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

**Note:** This workflow only creates Beads tasks and prepares configuration for Ralph. The actual execution loop is launched via `start-ralph-execution.md` workflow, which handles task selection, AI tool invocation, and monitoring.

## Error Handling

- **Plan reading errors:** If plan document cannot be read or structure is invalid, pause execution and report error to user
- **Beads CLI errors:** If `bd` command is not found in PATH or Beads database operations fail, pause execution and report error to user
- **Prefix mismatch errors:** Always use detected prefix from Step 1 to avoid mismatches
- **Dependency errors:** If dependency linkage fails, continue creating remaining tasks and retry linking using `bd dep add`. Do not block the entire setup on a single edge.
- **Quality gate failures:** Handled by Ralph during execution (see `.devagent/plugins/ralph/AGENTS.md`)

## Troubleshooting

For common issues:
- Check that Beads CLI is installed and database is initialized
- Verify database prefix matches task IDs (use detected prefix from Step 1)
- See Beads Integration skill (`.devagent/plugins/ralph/skills/beads-integration/SKILL.md`) for CLI usage patterns
- Always use `--body-file` for multiline content
- Remember: Do NOT use `--parent` flag with hierarchical IDs
- Add dependencies after creation with `bd dep add <task-id> <depends-on-id>`
- Tasks are created with status "open" by default - no need to set explicitly
- **Router fallback warnings:**
  - `Routing fallback: task <id> has no labels` → assign exactly one label to the direct epic child task.
  - `Routing fallback: task <id> labels [...] do not match config mapping keys` → update labels to match `.devagent/plugins/ralph/tools/config.json`.

## Key Learnings from Implementation

1. **Dependencies are edges:** The `bd update` command does not support deps. Prefer creating tasks first, then linking with `bd dep add <task> <depends-on>`.

2. **Status is "open" by default:** Tasks created with `bd create` have status "open" by default. No need to explicitly set status unless you want a different initial status.

3. **Multiline content:** Use `--body-file` for descriptions with newlines. Shorter content in `--design`, `--notes`, and `--acceptance` can be inline.

4. **Acceptance criteria format:** Semicolon-separated format works well: "Criterion 1; Criterion 2; Criterion 3"

5. **Hierarchical IDs:** Beads automatically infers parent from hierarchical IDs (e.g., `epic-abc.1` is automatically a child of `epic-abc`). Never use `--parent` flag with hierarchical IDs.

## Output

- **Epic in Beads:** Epic created with plan document reference, final deliverable summary, and quality gates
- **Tasks in Beads:** All tasks created with rich metadata:
  - `description`: Task objective and context
  - `design`: Architecture considerations and patterns
  - `notes`: Plan document reference, impacted files, references
  - `acceptance_criteria`: Semicolon-separated criteria list
  - `dependencies`: Set correctly (tasks with dependencies won't appear in `bd ready` until dependencies are closed)
- **Ralph Configuration:** Ready at `.devagent/plugins/ralph/tools/config.json`
- **Handoff to Start Ralph:** After setup is complete, use the `start-ralph-execution.md` workflow to begin autonomous execution
