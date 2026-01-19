# `ralph-e2e/plan`

This folder holds the **single canonical plan** used for the resettable Ralph E2E evaluation loop.

## Rules (MVP)

- **One plan only**: the loop runs against a stable plan so that results are comparable run-to-run.
- If the plan changes in a way that affects evaluation criteria, update:
  - `../expectations/expectations.md`
  - `../expectations/CHANGELOG.md` (bump expectations version, CalVer `vYYYY-MM-DD`)

