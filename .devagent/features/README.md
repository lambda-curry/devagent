# Feature Hubs

Organize discovery, specs, and downstream planning artifacts by feature so cross-functional teammates can find the latest context quickly.

## Directory Pattern

```
.devagent/features/
  YYYY-MM-DD_feature-slug/
    README.md                # short description, owners, status
    research/
      YYYY-MM-DD_<slug>-research.md
    spec/
      YYYY-MM-DD_<slug>-spec.md
    planning/                # optional: tasks, story maps, retro notes
    delivery/                # optional: launch notes, metrics snapshots
```

- **Feature folder:** prefix the slug with the kickoff date in ISO format (`YYYY-MM-DD_my-feature`). This keeps active work sorted chronologically while retaining readable slugs.
- **Feature slug:** lower-case, hyphenated version of the initiative name (e.g. `mission-alignment-dashboard`).
- **Chronological filenames:** prefix with ISO date (`YYYY-MM-DD`) followed by a concise suffix. Use the same slug for related artifacts across research/spec/planning to keep lists sorted.
- **README.md:** summarize the feature, decision status (idea, discovery, in progress, shipped), key stakeholders, and links to live dashboards if any.

## How to Add a New Feature Hub

1. Copy `_template` to a new dated, slugged folder: `cp -R .devagent/features/_template .devagent/features/$(date +%F)_<feature-slug>`.
2. Update the new `README.md` with feature context, owners, and status.
3. Author research packets under `research/` using date-prefixed filenames (e.g. `2025-09-29_initial-research.md`).
4. Publish specs under `spec/` following the same date convention; include a short suffix such as `-v1` or `-revA` when multiple drafts exist on the same day.
5. When work completes, archive the folder under `_archive/<year>/` to keep the active surface manageable (create `_archive` if it does not yet exist).

## Maintaining Freshness

- Move historical artifacts to `_archive` once the feature ships and spec acceptance criteria are met.
- Link to the latest mission, guiding questions, or roadmap entries so all context stays connected.
- When ResearchAgent or SpecArchitect publish updates, they should append a dated change note in the feature README describing what changed and when.
