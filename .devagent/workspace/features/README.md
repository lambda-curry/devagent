# Feature Hubs

Organize discovery, specs, and downstream planning artifacts by feature so cross-functional teammates can find the latest context quickly.

## Directory Pattern

Features are organized by status to provide clear workflow states:

```
.devagent/workspace/features/
  active/                    # Features currently being worked on
    YYYY-MM-DD_feature-slug/
      README.md              # short description, owners, status
      research/
        YYYY-MM-DD_<slug>-research.md
      spec/
        YYYY-MM-DD_<slug>-spec.md
      tasks/                 # task prompts and planning
  planned/                   # Features queued for future work
    YYYY-MM-DD_feature-slug/
      README.md
      research/
      spec/
  completed/                 # Shipped and stable features
    YYYY-MM-DD_feature-slug/
      README.md
      research/
      spec/
      tasks/
```

- **Feature folder:** prefix the slug with the kickoff date in ISO format (`YYYY-MM-DD_my-feature`). This keeps active work sorted chronologically while retaining readable slugs.
- **Feature slug:** lower-case, hyphenated version of the initiative name (e.g. `mission-alignment-dashboard`).
- **Chronological filenames:** prefix with ISO date (`YYYY-MM-DD`) followed by a concise suffix. Use the same slug for related artifacts across research/spec/planning to keep lists sorted.
- **README.md:** summarize the feature, decision status (idea, discovery, in progress, shipped), key stakeholders, and links to live dashboards if any.

## How to Add a New Feature Hub

1. **Determine status:** Choose the appropriate status directory based on feature state:
   - `active/` - Features currently being worked on (research, spec, implementation)
   - `planned/` - Features queued for future work (approved but not started)
   - `completed/` - Features that are shipped and stable

2. **Create feature hub:** Copy the feature template to the appropriate status directory:
   ```bash
   cp -R .devagent/core/templates/feature-hub-template .devagent/workspace/features/active/$(date +%F)_<feature-slug>
   ```

3. **Update README.md** with feature context, owners, and status.

4. **Author artifacts** under appropriate subdirectories using date-prefixed filenames:
   - Research packets: `research/YYYY-MM-DD_<slug>-research.md`
   - Specs: `spec/YYYY-MM-DD_<slug>-spec.md`
   - Tasks: `tasks/YYYY-MM-DD_<slug>-tasks.md`

5. **Status transitions:** Move features between status directories as they progress:
   - `planned/` → `active/` when work begins
   - `active/` → `completed/` when shipped and stable

## Status Management

### When to Use Each Status Directory

- **`active/`** - Features currently being worked on:
  - In research phase
  - Being specified
  - In implementation
  - Being tested or refined

- **`planned/`** - Features queued for future work:
  - Approved but not yet started
  - Waiting for dependencies
  - Scheduled for future sprints

- **`completed/`** - Features that are shipped and stable:
  - Delivered to users
  - No active development
  - Historical reference

### Status Transitions

1. **New features** start in `active/` by default
2. **Move to `planned/`** when work is paused or queued
3. **Move to `completed/`** when shipped and stable
4. **Move back to `active/`** if additional work is needed

### Maintaining Freshness

- Keep status directories current by moving features as they progress
- Link to the latest mission, guiding questions, or roadmap entries so all context stays connected
- Archive completed features periodically to keep active surface manageable
- When ResearchAgent or SpecArchitect publish updates, they should append a dated change note in the feature README describing what changed and when.
