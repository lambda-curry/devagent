---

name: Beads Integration

description: >-

## Use Beads CLI (`bd`) commands to manage tasks, status, and progress tracking for Ralph's autonomous execution.

Use when: (1) Querying ready tasks with `bd ready`,
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
bd show <task-id> --json
```

Check `depends_on` array. Tasks with incomplete dependencies will not appear in `bd ready`.

## Error Handling

- **Invalid Status:** Do not use `ready` as a status. Use `todo`.
- **Task Not Found:** Check ID.
- **Locked DB:** If DB is locked, wait and retry.

## Best Practices

### Task Creation & Naming

**Core Principle: Atomicity**

- Create focused, single-purpose tasks with clear, actionable titles
- Each task should be small enough for fast agent processing
- Break large tasks into smaller, atomic beads

**Title Guidelines:**
✅ **Good Task Titles:**

- "Add user authentication endpoint"
- "Fix memory leak in WebSocket handler"
- "Create database migration for user schema"
- "Update TypeScript interface for HealthResponse"
- "Remove CPU metrics from healthcheck UI"

❌ **Poor Task Titles:**

- "Fix stuff"
- "Update code"
- "Make it better"
- "Handle edge cases"
- "Do the thing"

**Title Format Rules:**

1. Start with action verb (imperative mood): "Add", "Fix", "Create", "Update", "Refactor", "Document"
2. Be specific: Include what and where (e.g., "Add pagination to user list endpoint")
3. Keep concise: Aim for 50-70 characters
4. Use consistent terminology: Align with codebase vocabulary

### Rich Metadata

**Always populate these fields when enriching tasks:**

1. **Description (`--description`)**:
   - Clear objective explaining what the task accomplishes
   - Link to planning documents when available (include specific path)
   - Example: "Update `/api/health` to return only relevant metrics for Vercel serverless architecture. See plan document: `.devagent/workspace/tasks/active/2026-01-10_healthcheck-improvements/plan/2026-01-10_healthcheck-plan.md` for full context."
2. **Design (`--design`)**:
   - Architecture and design decisions
   - Technical considerations and constraints
   - Patterns to follow or avoid
   - Example: "Vercel serverless functions are stateless and ephemeral. Focus on metrics that persist: database connectivity, environment info, deployment status. Avoid collecting metrics that don't persist across invocations."
3. **Notes (`--notes`)**:
   - Context, constraints, or prerequisites
   - References to related work or documentation (always include specific paths)
   - Implementation hints or warnings
   - Example: "Interface changes affect api.health.ts, health.tsx, and app.health.tsx. Plan document: `.devagent/workspace/tasks/active/2026-01-10_healthcheck-improvements/plan/2026-01-10_healthcheck-plan.md`. See plan document for interface requirements."
4. **Acceptance Criteria (`--acceptance`)**:
  - Measurable, verifiable outcomes
  - Specific conditions for task completion
  - Format: Semicolon-separated list of criteria
  - Example: "CPU metrics removed from interface; Memory metrics removed from interface; Interface only contains relevant serverless metrics"

### Priority Guidelines

- **P0 (Critical)**: Blocking work or high-impact items that unblock other tasks
- **P1 (High)**: Important features or fixes with significant impact
- **P2 (Medium)**: Default priority for most tasks
- **P3 (Low)**: Nice-to-have improvements, non-critical work

**Default to P2 unless the task is clearly blocking or high-impact.**

### Task Enrichment Workflow

When enriching existing tasks (e.g., from plan-to-beads conversion):

1. **Extract from plan document**: Use plan's "Objective", "Acceptance Criteria", architecture notes, and context
2. **Populate description**: Convert objective to clear description
3. **Add design notes**: Extract architecture considerations, technical constraints, patterns
4. **Add general notes**: Include context, file references, related work, quality gates
5. **Set acceptance criteria**: Convert acceptance criteria list to semicolon-separated format

**Example enrichment:**

```bash
bd update task-id \
  --description "Update API endpoint to return simplified health metrics for serverless architecture. See plan document: `.devagent/workspace/tasks/active/2026-01-10_healthcheck-improvements/plan/2026-01-10_healthcheck-plan.md` for full context." \
  --design "Vercel serverless functions are stateless. Focus on: database connectivity, environment info, deployment status. Avoid CPU/memory/uptime metrics." \
  --notes "Endpoint: /api/health. Plan document: `.devagent/workspace/tasks/active/2026-01-10_healthcheck-improvements/plan/2026-01-10_healthcheck-plan.md`. Maintain backward compatibility for 'status' field." \
  --acceptance "CPU metrics removed; Memory metrics removed; Database connectivity included; Deployment info included when available"
```

### Traceability

- **Comment on tasks**: Add progress comments with every commit or significant step
- **Link to commits**: Reference commit SHAs in comments for traceability
- **Document decisions**: Use design field to capture architectural decisions during implementation
- **Update notes**: Add implementation discoveries or constraints to notes field

### JSON Output

Always use `--json` flag for programmatic interaction with Beads CLI to ensure consistent parsing.