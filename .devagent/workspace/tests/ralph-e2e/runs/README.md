# `ralph-e2e/runs`

This folder contains per-run “task hubs” for the resettable loop.

## Naming

- `runs/YYYY-MM-DD_<beads-epic-id>/`

Example:

- `runs/2026-01-18_devagent-6979/`

## Contents policy (MVP)

- **Screenshots-only inside each run folder** (no required `run.md` / narrative report).
- The narrative review lives in **Beads comments** on the epic/tasks.
- The evaluation criteria live in `../expectations/expectations.md`.
  - The Beads epic “run header” should cite the **Expectations Version** (and ideally the expectations commit hash).

## Suggested screenshot organization

Within a run folder, organize screenshots however is convenient for review. A common structure:

- `setup/` (plan → beads setup evidence)
- `execution/` (task implementation verification evidence)
- `qa/` (agent-browser assertions + screenshots)
- `post-run/` (final state screenshots, e.g. task list/statuses)

