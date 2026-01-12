# Task Hubs

Organize discovery, plans, and downstream artifacts by task so cross-functional teammates can find the latest context quickly.

## Directory Pattern

Tasks are organized by status to provide clear workflow states:

```
.devagent/workspace/tasks/
  active/                    # Tasks currently being worked on
    YYYY-MM-DD_task-slug/
      README.md              # short description, owners, status
      research/
        YYYY-MM-DD_<slug>-research.md
      plan/
        YYYY-MM-DD_<slug>-plan.md
      tasks/                 # task prompts and planning
  planned/                   # Tasks queued for future work
    YYYY-MM-DD_task-slug/
      README.md
      research/
      plan/
  completed/                 # Shipped and stable tasks
    YYYY-MM-DD_task-slug/
      README.md
      research/
      plan/
      tasks/
```

- **Task folder:** prefix the slug with the kickoff date in ISO format (`YYYY-MM-DD_my-task`). This keeps active work sorted chronologically while retaining readable slugs.
- **Task slug:** lower-case, hyphenated version of the initiative name (e.g. `mission-alignment-dashboard`).
- **Chronological filenames:** prefix with ISO date (`YYYY-MM-DD`) followed by a concise suffix. Use the same slug for related artifacts across research/plan/planning to keep lists sorted.
- **README.md:** summarize the task, decision status (idea, discovery, in progress, shipped), key stakeholders, and links to live dashboards if any.

## How to Add a New Task Hub

1. **Determine status:** Choose the appropriate status directory based on task state:
   - `active/` - Tasks currently being worked on (research, plan, implementation)
   - `planned/` - Tasks queued for future work (approved but not started)
   - `completed/` - Tasks that are shipped and stable

2. **Verify Current State:** For refactoring, migration, or update tasks, perform a quick code audit or use discovery workflows to verify that the requested changes haven't already been implemented. This prevents redundant task hubs and wasted effort.

3. **Create task hub:** Copy the task template to the appropriate status directory:
   ```bash
   cp -R .devagent/core/templates/task-hub-template .devagent/workspace/tasks/active/$(date +%F)_<task-slug>
   ```

3. **Update README.md** with task context, owners, and status.

4. **Author artifacts** under appropriate subdirectories using date-prefixed filenames:
   - Research packets: `research/YYYY-MM-DD_<slug>-research.md`
   - Plans: `plan/YYYY-MM-DD_<slug>-plan.md`
   - Tasks: `tasks/YYYY-MM-DD_<slug>-tasks.md`

5. **Status transitions:** Move tasks between status directories as they progress:
   - `planned/` → `active/` when work begins
   - `active/` → `completed/` when shipped and stable

## Status Management

### When to Use Each Status Directory

- **`active/`** - Tasks currently being worked on:
  - In research phase
  - Being specified
  - In implementation
  - Being tested or refined

- **`planned/`** - Tasks queued for future work:
  - Approved but not yet started
  - Waiting for dependencies
  - Scheduled for future sprints

- **`completed/`** - Tasks that are shipped and stable:
  - Delivered to users
  - No active development
  - Historical reference

### Status Transitions

1. **New tasks** start in `active/` by default
2. **Move to `planned/`** when work is paused or queued
3. **Move to `completed/`** when shipped and stable
4. **Move back to `active/`** if additional work is needed

### Maintaining Freshness

- Keep status directories current by moving tasks as they progress
- Link to the latest mission, guiding questions, or roadmap entries so all context stays connected
- Archive completed tasks periodically to keep active surface manageable
- When workflows publish updates (e.g., `devagent research` or `devagent create-plan`), they should append a dated change note in the task README describing what changed and when.
