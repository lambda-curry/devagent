# Setup Ralph Loop (Ralph Plugin)

## Mission
Convert a DevAgent plan or goal into a structured `loop.json` configuration file, then use `setup-loop.ts` to create the Beads Epic and tasks. This workflow favors a **JSON-first blueprint** approach over manual CLI commands.

## Inputs
- Required: Path to DevAgent plan markdown file (or a high-level goal).

## Resource Strategy
- **Loop Schema**: `.devagent/plugins/ralph/core/schemas/loop.schema.json`
- **Setup Script**: `.devagent/plugins/ralph/tools/setup-loop.ts` (JSON -> Beads)
- **Runs Directory**: `.devagent/plugins/ralph/runs/`

---

## Workflow Steps

### Step 1: Analyze & Extract
Read the plan (or goal) and extract the task list. 
- **Identify Epics**: Determine the parent Epic ID (must start with the `devagent-` prefix).
- **Identify Tasks**: Extract descriptions, roles (`engineering`, `qa`, `design`, `project-manager`), and acceptance criteria.
- **Identify Dependencies**: Map task relationships.

### Step 2: Construct loop.json
Build a structured JSON file matching the `loop.schema.json`.

**Blueprinting Best Practices:**
1. **Epic Object**: Include an `epic` object with `id`, `title`, and `description`.
2. **Task IDs**: Use hierarchical IDs (e.g., `devagent-epic.1`).
3. **Modular Descriptions**: Use `descriptionPath` to reference external markdown files for long technical specs. Use `description` for short inline details.
4. **Separate Loop Files**: For multi-epic objectives, reference sub-loop files in the kickoff task description: `Loop File: ./path/to/sub-loop.json`.
5. **Branch Hints**: Include a `Branch: feature/...` line in the `description` of every implementation task to help agents manage git state.
6. **Closing Signals**: Add a "Wrap up & Close Epic" task at the end of every implementation epic.
7. **Dependencies**: Ensure "Merge" tasks are blocked by their respective "Epic" objects.

### Step 3: Execute Sync
Save the JSON to `.devagent/plugins/ralph/runs/<id>_<date>.json` and run the setup tool:

```bash
bun .devagent/plugins/ralph/tools/setup-loop.ts path/to/your-loop.json
```

**What happens:**
- The script creates the **Epic** if it doesn't exist.
- The script creates all **Tasks**.
- The script links all **Dependencies**.
- The script automatically updates `.devagent/plugins/ralph/tools/config.json` with run-specific settings from `loop.json`:
  - `git.base_branch` and `git.working_branch`
  - `execution.max_iterations`
  
**Note:** This eliminates the need to manually edit `config.json` after setup. All run-specific configuration comes from `loop.json`'s `run` section.

### Step 4: Verify
Run a quick check to ensure the structure is correct in Beads:
```bash
bd ready --parent <EPIC_ID> --json
```

---

## Quality Standards (C6)
- **Prefer Simplicity**: Do not use manual `bd create` commands if you can build a JSON blueprint instead.
- **Self-Documenting**: Ensure the `epic.description` in your JSON includes a link to the original plan file.
- **Idempotent**: You can run the setup script multiple times; it will skip existing tasks and update dependencies.

## Output
- A `loop.json` file in the `runs/` directory.
- A live Epic and Task tree in Beads.
- Ralph configuration updated at `.devagent/plugins/ralph/tools/config.json`.
