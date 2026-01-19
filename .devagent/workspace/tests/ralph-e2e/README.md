# `ralph-e2e` — canonical resettable E2E loop

This folder is the **canonical home** for the repeatable end-to-end evaluation loop used to validate the Ralph + Beads workflow against documented expectations.

## Structure

- `plan/`
  - The **single canonical plan** that the loop is executed against (no multi-plan variants for MVP).
- `expectations/`
  - The **per-stage expectations** used to evaluate runs.
  - See `expectations/expectations.md` and `expectations/CHANGELOG.md`.
- `runs/`
  - Per-run “task hubs” with screenshots only:
    - `runs/YYYY-MM-DD_<beads-epic-id>/`

## Run review source of truth

- **Evidence**: screenshots in `runs/YYYY-MM-DD_<beads-epic-id>/...`
- **Pass/Fail + rationale**: Beads comments on the epic/tasks
- **Expected behavior**: `expectations/expectations.md`

For MVP, we intentionally avoid storing a separate per-run markdown report in `runs/.../` (screenshots-only policy). Any narrative review belongs in Beads comments so the workflow stays resettable and centrally auditable.

## Expectations version to cite in run reviews

When writing the Beads epic “run header” comment for a run, include:

- The **Expectations Version** from `expectations/expectations.md`
- The **git commit hash** that contains that expectations version (recommended)

