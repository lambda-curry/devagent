# Consolidate AI Rules and Commands Progress Tracker

- Owner: Jake Ruesink
- Last Updated: 2026-01-21
- Status: Active
- Task Hub: `.devagent/workspace/tasks/active/2026-01-21_consolidate-ai-rules/`

## Summary
Consolidate AI rules and commands across all AI agents (opencode, cursor, claude, gemini, codex, github) using https://github.com/block/ai-rules as a reference. The goal is to create a unified set of instructions and rules that can be easily used and shared across different projects and AI interfaces, ensuring consistency and efficiency in AI-assisted development.

## Agent Update Instructions
- Always update "Last Updated" to today's date (ISO: YYYY-MM-DD) when editing this file. **Get the current date by explicitly running `date +%Y-%m-%d` first, then use the output for the "Last Updated" field.**
- Progress Log: Append a new entry at the end in the form `- [YYYY-MM-DD] Event: concise update, links to files`. Do not rewrite or delete prior entries. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- Implementation Checklist: Mark items as `[x]` when complete, `[~]` for partial with a short note. Add new items if discovered; avoid removing items—strike through only when obsolete.
- Key Decisions: Record important decisions as `- [YYYY-MM-DD] Decision: rationale, links`. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- References: Keep links current to latest spec, research, and tasks. Add additional references as they are created.
- Scope: Edits here should reflect coordination/progress only; do not include application code changes. Preserve history.

## Key Decisions
- [2026-01-21] Decision: Task initialized using `devagent new-task` to consolidate AI rules across platforms.
- [2026-01-21] Decision: Adopted a "Source Hub" approach (`ai-rules/` directory) inspired by `block/ai-rules` to maintain a single source of truth for guidelines.

## Progress Log
- [2026-01-21] Event: Task hub scaffolded and AGENTS.md initialized.
- [2026-01-21] Event: Completed initial research on `block/ai-rules` and audited internal rules. Created research document: `.devagent/workspace/tasks/active/2026-01-21_consolidate-ai-rules/research/2026-01-21_ai-rules-consolidation.md`.
- [2026-01-21] Event: Plan created at `.devagent/workspace/tasks/active/2026-01-21_consolidate-ai-rules/plan/2026-01-21_ai-rules-consolidation-plan.md`.
- [2026-01-21] Event: Setup Ralph loop for execution. Beads Epic: `devagent-c37ax1`.

## Implementation Checklist
- [x] Research: Analyze https://github.com/block/ai-rules for applicable patterns.
- [x] Audit: Inventory current rules in `.cursor/rules/` and `.devagent/plugins/ralph/agents/`.
- [x] Design: Draft unified rule structure for opencode, cursor, claude, gemini, codex, and github.
- [ ] Implementation: Create consolidated rule files and instructions in `ai-rules/`.
- [ ] Documentation: Add instructions on how to use these rules in other projects.
- [ ] Verification: Test rules across different AI agents where feasible.

## References
- Reference Repository: [https://github.com/block/ai-rules](https://github.com/block/ai-rules)
- Plan: `.devagent/workspace/tasks/active/2026-01-21_consolidate-ai-rules/plan/2026-01-21_ai-rules-consolidation-plan.md`
- Internal Reference: `.devagent/core/AGENTS.md` (Workflow definitions)

- Internal Reference: `.devagent/workspace/memory/constitution.md` (Guiding principles)
- Internal Reference: `.cursor/rules/` (Existing cursor rules)
- Internal Reference: `.devagent/plugins/ralph/agents/` (Agent instruction files)
- Historical Context: `.devagent/workspace/tasks/active/2026-01-15_adopt-reportory-cursor-rules-best-practices/`

## Next Steps
- Research discovery: `devagent research`
- Brainstorm ideas: `devagent brainstorm`
- Create plan: `devagent create-plan`
