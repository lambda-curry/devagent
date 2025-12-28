# Standard Workflow Instructions Centralization Progress Tracker

- Owner: Jake Ruesink
- Last Updated: 2025-12-27
- Status: Complete
- Feature Hub: `.devagent/workspace/features/completed/2025-12-27_standard-workflow-instructions-centralization/`

## Summary
Centralize common workflow instructions in AGENTS.md to reduce duplication and improve consistency across workflows. Based on research findings that identify repeated patterns (execution directives, date retrieval, context gathering, guardrails) across all 14 workflows. Follows Builder.io AGENTS.md pattern for centralized AI agent guidance.

## Agent Update Instructions
- Always update "Last Updated" to today's date (ISO: YYYY-MM-DD) when editing this file. **Get the current date by explicitly running `date +%Y-%m-%d` first, then use the output for the "Last Updated" field.**
- Progress Log: Append a new entry at the end in the form `- [YYYY-MM-DD] Event: concise update, links to files`. Do not rewrite or delete prior entries. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- Implementation Checklist: Mark items as `[x]` when complete, `[~]` for partial with a short note. Add new items if discovered; avoid removing items—strike through only when obsolete.
- Key Decisions: Record important decisions as `- [YYYY-MM-DD] Decision: rationale, links`. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- References: Keep links current to latest spec, research, and tasks. Add additional references as they are created.
- Scope: Edits here should reflect coordination/progress only; do not include application code changes. Preserve history.

## Key Decisions

## Progress Log
- [2025-12-27] Event: Feature hub created. Research document `2025-12-27_workflow-pre-read-instructions-centralization.md` moved from `.devagent/workspace/research/` to feature research directory.
- [2025-12-27] Event: Implementation plan created. Plan document `plan/2025-12-27_standard-workflow-instructions-centralization-plan.md` created with 3 implementation tasks: (1) Add Standard Workflow Instructions section to AGENTS.md, (2) Update workflow template with reference pattern, (3) Update all 14 workflows to reference standards.
- [2025-12-27] Event: Task 1 completed. Added "Standard Workflow Instructions" section to `.devagent/core/AGENTS.md` with 6 subsections: Date Handling, Metadata Retrieval, Context Gathering (Standard Order), Standard Guardrails, Execution Directive (Standard), Storage Patterns.
- [2025-12-27] Event: Task 2 completed. Updated `.devagent/core/templates/agent-brief-template.md` to include "Standard Instructions Reference" section and updated Execution Directive to reference AGENTS.md standard.
- [2025-12-27] Event: Task 3 completed. Updated all 14 workflows to include "Standard Instructions Reference" section and simplified Execution Directive sections to reference AGENTS.md standard. Updated inline date retrieval and context gathering references to use generic "Review Standard Workflow Instructions" pattern. All workflows: research.md, create-plan.md, new-feature.md, implement-plan.md, review-progress.md, review-pr.md, compare-prs.md, brainstorm.md, clarify-feature.md, update-product-mission.md, update-tech-stack.md, update-constitution.md, build-workflow.md, mark-feature-complete.md.
- [2025-12-27] Event: Progress review completed. Verified all three implementation tasks are complete via code inspection. All 14 workflows include Standard Instructions Reference sections and reference standard execution directive. AGENTS.md contains Standard Workflow Instructions section with all 6 subsections. Template updated with reference pattern. Feature is ready for completion. Checkpoint: `progress/2025-12-27_checkpoint.md`
- [2025-12-27] Event: Feature moved to completed. Updated all status references and file paths from active/ to completed/ throughout feature directory.

## Implementation Checklist
- [x] Task 1: Add Standard Workflow Instructions Section to AGENTS.md
- [x] Task 2: Update Workflow Template with Standard Instructions Reference
- [x] Task 3: Update All 14 Workflows to Reference Standard Instructions

## Open Questions

## References
- Research: `research/2025-12-27_workflow-pre-read-instructions-centralization.md`
- Plan: `plan/2025-12-27_standard-workflow-instructions-centralization-plan.md`
- Related: `.devagent/core/AGENTS.md` (target for standard instructions section)
- Related: `.devagent/core/workflows/**/*.md` (workflows to be updated with references)
- Related: `.devagent/core/templates/agent-brief-template.md` (template to update)
- Related: `.devagent/workspace/features/completed/2025-10-01_agent-execution-directive/` (example of pattern standardization)
- Related: `.devagent/workspace/features/completed/2025-12-27_consistent-date-handling-workflows/` (recent pattern standardization example)
