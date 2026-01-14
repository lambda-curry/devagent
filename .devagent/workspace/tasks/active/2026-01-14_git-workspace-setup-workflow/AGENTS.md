# Git Workspace Setup Workflow Progress Tracker

- Owner: Jake Ruesink
- Last Updated: 2026-01-14
- Status: In Progress
- Task Hub: `.devagent/workspace/tasks/active/2026-01-14_git-workspace-setup-workflow/`

## Summary
Create two complementary deliverables for git workspace management: (1) A **DevAgent workflow** (`devagent new-workspace`) for manually creating a new workspace and optionally moving in-progress uncommitted work to it, and (2) A **git-workspace skill** (using skill-creator pattern) that teaches agents how to work with git workspaces/worktrees in general. The use case is that while working on one feature, a developer might start working on a new feature that is unrelated to what they're currently working on. They want to spin that new work off into a new workspace to keep it safe and separate from their current work.

## Agent Update Instructions
- Always update "Last Updated" to today's date (ISO: YYYY-MM-DD) when editing this file. **Get the current date by explicitly running `date +%Y-%m-%d` first, then use the output for the "Last Updated" field.**
- Progress Log: Append a new entry at the end in the form `- [YYYY-MM-DD] Event: concise update, links to files`. Do not rewrite or delete prior entries. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- Implementation Checklist: Mark items as `[x]` when complete, `[~]` for partial with a short note. Add new items if discovered; avoid removing items—strike through only when obsolete.
- Key Decisions: Record important decisions as `- [YYYY-MM-DD] Decision: rationale, links`. **Use the date retrieved from `date +%Y-%m-%d` for the date portion.**
- References: Keep links current to latest spec, research, and tasks. Add additional references as they are created.
- Scope: Edits here should reflect coordination/progress only; do not include application code changes. Preserve history.

## Key Decisions
- [2026-01-14] Decision: Task created to explore git workspace management workflow for handling concurrent feature development.
- [2026-01-14] Decision: Scope expanded to include both a DevAgent workflow (command-based, manual invocation) and a git-workspace skill (auto-discovered, cross-platform). **Rationale:** Workflow provides explicit control for workspace creation, while skill enables agents to work with git workspaces/worktrees in any context automatically. See workflow-vs-skill decision guide (`.devagent/workspace/research/2025-12-25_workflow-vs-skill-decision-guide.md`).

## Progress Log
- [2026-01-14] Event: Task hub scaffolded with initial summary and structure.
- [2026-01-14] Event: Research completed on workspace best practices, cleanup strategies, and git worktree patterns. Created research packet at `research/2026-01-14_workspace-best-practices-research.md`. Key findings: git worktrees enable concurrent development, cleanup is recommended but not automatic, safety checks prevent accidental data loss. Scope clarified: need both workflow (command-based) and skill (auto-discovered) for complete solution.
- [2026-01-14] Event: Implementation plan created at `plan/2026-01-14_git-workspace-setup-workflow-plan.md`. Plan includes 4 tasks: (1) Create DevAgent workflow definition, (2) Create workflow command file, (3) Create git-workspace skill, (4) Update workflow roster documentation. Plan covers both workflow and skill deliverables with clear acceptance criteria and validation plans. Ready for implementation.
- [2026-01-14] Event: Task 1 completed - Created DevAgent workflow definition at `.devagent/core/workflows/new-workspace.md`. Workflow handles workspace creation, branch management, optional uncommitted work migration (stash → create → apply pattern), safety checks, and error handling. Follows DevAgent workflow structure and tool-agnostic design (C4).
- [2026-01-14] Event: Task 2 completed - Created workflow command file at `.agents/commands/new-workspace.md` and symlink at `.cursor/commands/new-workspace.md`. Command file follows DevAgent command structure and references workflow correctly.
- [2026-01-14] Event: Task 3 completed - Created git-workspace skill at `.cursor/skills/git-workspace/SKILL.md`. Skill includes comprehensive frontmatter for auto-discovery, clear instructions for git worktree operations (create, list, remove, prune), safety considerations, and common patterns. Follows open standard format and progressive disclosure principles.
- [2026-01-14] Event: Task 4 completed - Updated workflow roster in `.devagent/core/AGENTS.md` and command list in `.cursor/commands/README.md`. Workflow and command now documented and discoverable.

## Implementation Checklist
- [x] Research git workspace management patterns and existing DevAgent workflow structure
- [x] Create implementation plan for both deliverables
- [x] Task 1: Create DevAgent workflow definition (`.devagent/core/workflows/new-workspace.md`)
- [x] Task 2: Create workflow command file (`.agents/commands/new-workspace.md` + symlink)
- [x] Task 3: Create git-workspace skill (`.cursor/skills/git-workspace/SKILL.md`)
- [x] Task 4: Update workflow roster documentation (`.devagent/core/AGENTS.md`)

## Open Questions
- How should the workflow handle conflicts when moving uncommitted work? (Research suggests stash → apply pattern)
- What should the skill description include to ensure proper auto-discovery? (Need comprehensive YAML frontmatter)
- Should the workflow integrate with existing setup agent patterns or be standalone?
- What git operations should the skill cover? (worktree add/remove/list/prune, branch management, safety checks)

## References
- Plan: `.devagent/workspace/tasks/active/2026-01-14_git-workspace-setup-workflow/plan/2026-01-14_git-workspace-setup-workflow-plan.md` (2026-01-14) — Implementation plan with 4 tasks for workflow and skill creation
- Research: `.devagent/workspace/tasks/active/2026-01-14_git-workspace-setup-workflow/research/2026-01-14_workspace-best-practices-research.md` (2026-01-14) — Workspace best practices, cleanup strategies, git worktree patterns
- Product Mission: `.devagent/workspace/product/mission.md` (2026-01-14) — DevAgent mission and product context
- Constitution: `.devagent/workspace/memory/constitution.md` (2026-01-14) — Delivery principles and guardrails including tool-agnostic design (C4)
- Workflow vs Skill Guide: `.devagent/workspace/research/2025-12-25_workflow-vs-skill-decision-guide.md` (2026-01-14) — Decision criteria for choosing workflow vs skill
- Skill Creator: `.cursor/skills/skill-creator/SKILL.md` (2026-01-14) — Guide for creating effective skills
- Related Task - Setup Agent: `.devagent/workspace/tasks/completed/2026-01-13_final-agent-pr-creation-reporting/` (2026-01-14) — Previous work on setup agent that validates epic/tasks and prepares git workspace

## Next Steps
- **Implement tasks:** Execute tasks from the Implementation Plan section of the plan artifact (`.devagent/workspace/tasks/active/2026-01-14_git-workspace-setup-workflow/plan/2026-01-14_git-workspace-setup-workflow-plan.md`)
- **Task 1:** Create DevAgent workflow definition (`.devagent/core/workflows/new-workspace.md`)
- **Task 2:** Create workflow command file (`.agents/commands/new-workspace.md` + symlink)
- **Task 3:** Create git-workspace skill (`.cursor/skills/git-workspace/SKILL.md`)
- **Task 4:** Update workflow roster documentation (`.devagent/core/AGENTS.md`)
