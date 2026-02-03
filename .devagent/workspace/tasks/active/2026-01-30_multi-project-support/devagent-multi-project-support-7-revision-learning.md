**Revision Learning:**

- **Category:** Process
- **Priority:** Low
- **Issue:** `bd list --parent <EpicID> --json` returns a limited number of child tasks by default (e.g. 2); full child list was obtained via `bd show <EpicID> --json` (dependents array). Workflow could be clearer on which command to use for "all child tasks."
- **Recommendation:** In generate-revise-report workflow or revise-report-generation skill, specify: use `bd show <EpicID> --json` and parse `dependents`, or use `bd list --parent <EpicID> --limit 50 --json` (or higher) so all children are included when aggregating task data.
- **Files/Rules Affected:** `.devagent/plugins/ralph/workflows/generate-revise-report.md`, `.devagent/plugins/ralph/skills/revise-report-generation/SKILL.md`

Signed: Engineering Agent — Code Wizard
