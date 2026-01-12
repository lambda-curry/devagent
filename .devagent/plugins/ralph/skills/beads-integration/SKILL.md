---
name: Beads Integration
description: >-
  Use Beads CLI (`bd`) commands to manage tasks, status, and progress tracking for
  Ralph's autonomous execution. Use when: (1) Querying ready tasks with `bd ready`,
  (2) Updating task status (todo → in_progress → closed), (3) Adding progress comments
  to tasks, (4) Managing task details (priority, design, notes, labels), (5) Handling
  task dependencies. This skill enables Ralph to use Beads' native memory and state
  management.
---

# Beads Integration

Use Beads CLI (`bd`) commands for task management, status tracking, and progress comments.

## Prerequisites

- Beads CLI (`bd`) installed and available in PATH
- Beads database initialized (`.beads/beads.db`)

## Core Commands

### Query Ready Tasks

**Get next available task:**
```bash
bd ready --json
```

**Get ready tasks for specific project:**
```bash
bd ready --project <project-name> --json
```

**Parse Response:**
- `bd ready --json` returns an array of tasks that are in `todo` status and have all dependencies met.
- Use `jq -r '.[0]?.id // empty'` for first task.
- Guard against empty output.

### Update Task Status

**Mark task in progress:**
```bash
bd update <task-id> --status in_progress
```

**Mark task closed (completed):**
```bash
bd update <task-id> --status closed
```

**Reset task to todo (if failed or abandoned):**
```bash
bd update <task-id> --status todo
```

**Block a task:**
```bash
bd update <task-id> --status blocked
```

**Note:** `ready` is NOT a valid settable status. Use `todo`.

### Manage Task Details

**Set Priority:**
```bash
bd update <task-id> --priority P0  # Critical
bd update <task-id> --priority P1  # High
bd update <task-id> --priority P2  # Medium (Default)
bd update <task-id> --priority P3  # Low
```

**Add Design & Architecture Notes:**
```bash
bd update <task-id> --design "Use Factory Pattern for widget creation. See design doc at docs/widgets.md"
```

**Add General Notes:**
```bash
bd update <task-id> --notes "Requires update to API schema first."
```

**Set Estimate (Minutes):**
```bash
bd update <task-id> --estimate 60  # 1 hour
```

**Manage Labels:**
```bash
bd update <task-id> --add-label "frontend" --add-label "ui"
bd update <task-id> --remove-label "bug"
```

### Add Progress Comments

**Add comment to task:**
```bash
bd comment <task-id> --body "<comment-text>"
```

**Comment Format:**
- Use markdown formatting.
- Include timestamps and reasoning.
- Link to files changed or external references.

**Example:**
```bash
bd comment bd-a3f8.1 --body "## Progress Update
- ✅ Completed function implementation
- ✅ Added unit tests
- 📝 Updated documentation"
```

### Import Tasks from JSON Payload

**Create Task:**
```bash
bd create --title "<title>" --description "<desc>" --status todo --priority P2 --json
```

**Import with Dependencies:**
```bash
bd create --title "<child>" --parent <parent-id> --depends-on <dep-id> --status todo --json
```

## Workflow Patterns

### Autonomous Execution Loop

1. **Select Next Task:** `bd ready --json`
2. **Mark In Progress:** `bd update <task-id> --status in_progress`
3. **Read Details:** `bd show <task-id> --json` (Check `description`, `design`, `notes`, `acceptance_criteria`)
4. **Implement:** Write code, run tests.
5. **Log Progress:** `bd comment <task-id> --body "..."`
6. **Mark Complete:** `bd update <task-id> --status closed`

### Dependency Management

**Check Dependencies:**
```bash
bd view <task-id> --json
```
Check `depends_on` array. Tasks with incomplete dependencies will not appear in `bd ready`.

## Error Handling

- **Invalid Status:** Do not use `ready` as a status. Use `todo`.
- **Task Not Found:** Check ID.
- **Locked DB:** If DB is locked, wait and retry.

## Best Practices

1. **Rich Metadata:** Always add `--design` and `--notes` when clarifying tasks to capture architectural decisions.
2. **Correct Priorities:** Default to P2. Use P0 only for blocking critical path items.
3. **Traceability:** Comment on tasks with every commit or significant step.
4. **JSON Output:** Always use `--json` for programmatic interaction.