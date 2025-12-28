# Consistent Date Handling in Workflows Progress Tracker

- Owner: Jake Ruesink
- Last Updated: 2025-12-27
- Status: Draft
- Feature Hub: `.devagent/workspace/features/active/2025-12-27_consistent-date-handling-workflows/`

## Summary
Update all workflows to explicitly get the current date using `date +%Y-%m-%d` before creating or updating dated documents to prevent incorrect dates from being used in filenames, document headers, and AGENTS.md updates.

## Agent Update Instructions
- Always update "Last Updated" to today's date (ISO: YYYY-MM-DD) when editing this file.
- Progress Log: Append a new entry at the end in the form `- [YYYY-MM-DD] Event: concise update, links to files`. Do not rewrite or delete prior entries.
- Implementation Checklist: Mark items as `[x]` when complete, `[~]` for partial with a short note. Add new items if discovered; avoid removing items—strike through only when obsolete.
- Key Decisions: Record important decisions as `- [YYYY-MM-DD] Decision: rationale, links`.
- References: Keep links current to latest spec, research, and tasks. Add additional references as they are created.
- Scope: Edits here should reflect coordination/progress only; do not include application code changes. Preserve history.

## Key Decisions
- [2025-12-27] Decision: All workflows that create or update dated documents must explicitly run `date +%Y-%m-%d` first to get the current date, rather than assuming or inferring the date. This ensures consistency and prevents errors when AI assistants work across different days or timezones.

## Progress Log
- [2025-12-27] Event: Feature hub created. Initial research notes provided about date handling patterns and required workflow updates.
- [2025-12-27] Event: Research completed. Comprehensive audit of all workflows and templates completed. Identified 8 workflows and 3+ templates requiring date retrieval updates. Research document: `research/2025-12-27_date-handling-audit.md`

## Implementation Checklist
- [x] Research: Audit all workflows to identify where dates are used (filenames, document headers, AGENTS.md updates)
- [x] Research: Document current date handling patterns and identify inconsistencies
- [ ] Plan: Create implementation plan for updating workflows with explicit date retrieval
- [ ] Update: Modify workflows to include `date +%Y-%m-%d` step before creating dated documents
- [ ] Update: Update workflow templates and documentation to reflect date handling pattern
- [ ] Verify: Test updated workflows to ensure dates are correctly retrieved and used

## Open Questions
- ✅ Which workflows need updates? **RESOLVED:** research, create-plan, new-feature, review-progress, brainstorm, compare-prs, review-pr, clarify-feature (verify)
- Should we add a verification step to check date format before using it? (Research suggests: `date +%Y-%m-%d | grep -E '^\d{4}-\d{2}-\d{2}$'`)
- How should we handle timezone considerations? (Document timezone behavior of `date +%Y-%m-%d` command)

## References
- **Research:** `research/2025-12-27_date-handling-audit.md` — Comprehensive audit of date handling patterns across all workflows and templates — 2025-12-27
- `.devagent/core/workflows/research.md` — Uses dates in research document filenames (`YYYY-MM-DD_<descriptor>.md`) — 2025-12-27
- `.devagent/core/workflows/create-plan.md` — Uses dates in plan document filenames (`YYYY-MM-DD_<descriptor>.md`) — 2025-12-27
- `.devagent/core/workflows/new-feature.md` — Uses dates for feature folder prefixes and AGENTS.md "Last Updated" field — 2025-12-27
- `.devagent/core/workflows/review-progress.md` — Uses dates in checkpoint filenames and document headers — 2025-12-27
- `.devagent/core/workflows/brainstorm.md` — Uses dates in brainstorm packet filenames (`YYYY-MM-DD_<topic>.md`) — 2025-12-27
- `.devagent/core/workflows/compare-prs.md` — Uses dates in comparison artifact filenames — 2025-12-27
- `.devagent/core/workflows/review-pr.md` — Uses dates in review artifact filenames — 2025-12-27
- `.devagent/core/templates/feature-agents-template.md` — Template includes "Last Updated: <YYYY-MM-DD>" field — 2025-12-27
- `.devagent/core/templates/plan-document-template.md` — Template includes "Last Updated: <YYYY-MM-DD>" field — 2025-12-27
- `.devagent/core/templates/research-packet-template.md` — Template includes "Last Updated: <YYYY-MM-DD>" field — 2025-12-27
- `.devagent/workspace/memory/constitution.md` — C2 clause requires ISO-date prefixes for chronological feature artifacts — 2025-12-27
- Date handling notes provided in user query — Documents the problem, solution pattern, and verification checklist — 2025-12-27

## Next Steps
1. Run `devagent research` to audit all workflows and document current date handling patterns
2. Run `devagent create-plan` to create an implementation plan for updating workflows
3. Execute the plan to update workflows with explicit date retrieval steps