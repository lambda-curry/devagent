---
name: Beads Integration
description: >-
  Use Beads CLI (`bd`) commands to manage tasks, status, and progress tracking for
  Ralph's autonomous execution. Use when: (1) Querying ready tasks with `bd ready`,
  (2) Updating task status (ready → in_progress → closed), (3) Adding progress comments
  to tasks, (4) Managing task dependencies and relationships, (5) Importing tasks from
  JSON payloads into Beads database. This skill enables Ralph to use Beads' native
  memory and state management instead of file-based approaches.
---

# Beads Integration

Use Beads CLI (`bd`) commands for task management, status tracking, and progress comments.

## Prerequisites

- Beads CLI (`bd`) installed and available in PATH
- Beads database initialized (`.beads/beads.db`)
- Beads project configured (default project or specified project)

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

**Expected Output:**
JSON array of tasks with status "ready" and no incomplete dependencies.

**Parse Response:**
- `bd ready --json` returns an array (possibly empty)
- Use `jq -r '.[0]?.id // empty'` for first task or `jq -r '.[].id'` to iterate
- Guard against empty output before proceeding
- Extract task `id`, `title`, `status`, and `metadata`
- Use task `id` for subsequent operations

### Update Task Status

**Mark task in progress:**
```bash
bd update <task-id> --status in_progress
```

**Mark task closed:**
```bash
bd update <task-id> --status closed
```

**Mark task ready:**
```bash
bd update <task-id> --status ready
```

**Error Handling:**
- If task ID not found, command will fail with error
- Check command exit code before proceeding
- Report errors to user if task update fails

### Add Progress Comments

**Add comment to task:**
```bash
bd comment <task-id> --body "<comment-text>"
```

**Comment Format:**
- Use markdown formatting for structure
- Include timestamps, progress notes, and reasoning
- Link to files changed or external references

**Examples:**
```bash
bd comment bd-a3f8.1 --body "Implementation complete. Added functions in src/utils.py. All tests passing."
```

```bash
bd comment bd-a3f8.1 --body "## Progress Update

- ✅ Completed function implementation
- ✅ Added unit tests
- ✅ Verified linting passes
- 📝 Updated documentation

Next: Integration testing"
```

### Import Tasks from JSON Payload

**Import epic:**
```bash
bd create --title "<epic-title>" --status ready --json
```

**Import task:**
```bash
bd create --title "<task-title>" --description "<description>" --status ready --parent <parent-id> --depends-on <dependency-id> --json
```

**Bulk Import:**
- For large payloads, import tasks one by one in dependency order
- Ensure parent tasks imported before children
- Ensure dependencies imported before dependents

**Alternative:** Some Beads versions support bulk import from JSON file directly:
```bash
bd import <beads-payload.json>
```

## Workflow Patterns

### Autonomous Execution Loop

1. **Select Next Task:**
   ```bash
   bd ready --json
   ```

2. **Mark Task In Progress:**
   ```bash
   bd update <task-id> --status in_progress
   ```

3. **Implement Task:**
   - Follow task objective and acceptance criteria
   - Make code changes
   - Run quality gates

4. **Log Progress:**
   ```bash
   bd comment <task-id> --body "<progress-update>"
   ```

5. **Mark Task Complete:**
   ```bash
   bd update <task-id> --status closed
   ```

6. **Repeat:** Return to step 1 until no ready tasks remain

### Dependency Management

**Check Dependencies:**
```bash
bd view <task-id> --json
```

Extract `depends_on` array from task metadata to verify dependencies are complete before marking task ready.

**Handle Blocked Tasks:**
- If dependencies incomplete, skip task
- Log skip reason as comment
- Return to task when dependencies complete

## Error Handling

**CLI Not Found:**
- If `bd` command not in PATH, report error: "Beads CLI not found in PATH"
- Provide installation instructions if needed

**Command Failures:**
- Check exit code of all `bd` commands
- Parse stderr for error messages
- Report specific errors to user
- Don't proceed if critical operations fail

**Invalid Task IDs:**
- Validate task IDs before using in commands
- Handle "task not found" errors gracefully
- Report invalid references

**Database Errors:**
- If database is locked or corrupted, report error
- Suggest database repair or reinitialization

## Best Practices

1. **Always Use JSON Output:**
   - Use `--json` flag for parsing-friendly output
   - Parse JSON instead of parsing text output

2. **Error Checking:**
   - Check command exit codes
   - Validate JSON responses
   - Handle edge cases (empty results, missing fields)

3. **Progress Comments:**
   - Include timestamps in comments
   - Document reasoning, not just actions
   - Link to relevant files or resources

4. **Status Transitions:**
   - Always transition status in order: ready → in_progress → closed
   - Don't skip status transitions
   - Log status changes in comments

5. **Dependency Resolution:**
   - Verify dependencies before marking task ready
   - Handle circular dependencies (report error)
   - Track dependency completion

## Reference Documentation

- **Beads CLI**: Official Beads CLI documentation for command reference
- **Beads Schema**: See `templates/beads-schema.json` for task structure
- **Ralph Prompt**: See `tools/prompt.md` for Ralph's autonomous execution instructions
