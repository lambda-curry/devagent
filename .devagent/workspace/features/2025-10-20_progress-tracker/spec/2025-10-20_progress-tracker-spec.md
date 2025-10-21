# Progress Tracker for Workflows

- Owner: DevAgent Team
- Last Updated: 2025-10-20
- Status: In Review
- Related Feature Hub: `.devagent/workspace/features/2025-10-20_progress-tracker/`
- Stakeholders: User (Product Manager), AI Agents (Execution)
- Notes: Remove sections marked `(Optional)` if they do not apply.

## Summary
Add a simple progress tracker to workflows using AGENTS.md files in feature directories. Templates updated with progress tracking references, AGENTS.md template created with implementation checklist, review-progress workflow updated. Agents update Progress Log and Implementation Checklist upon task completion. Ready for integration testing.

## Context & Problem
Workflow executions generate progress but lack integration with ongoing feature work. Without a tracker, progress and decisions are scattered in logs, leading to context loss. AGENTS.md at feature roots can serve as a central, simple hub for AI agents to maintain up-to-date status.

## Objectives & Success Metrics
- Agents reliably update AGENTS.md Progress Log and Implementation Checklist after workflow steps.
- Progress visible in AGENTS.md without manual navigation or searches.
- Zero manual updates required; agents follow declarative instructions.
- Baseline: No tracker; Target: 100% automated updates in test runs.

## Users & Insights
- Primary: AI agents executing workflows.
- Insights: Agents need clear, simple instructions to avoid errors; references reduce redundant reads.

## Solution Principles
- Simplicity: Minimal structure; declarative instructions in AGENTS.md.
- Automation: Agents append via tools without human prompts.
- Reference-first: Link files when context helpful.

## Scope Definition
- **In Scope:** Update templates (spec, task plan, task prompt) with progress tracking instructions for agents, create AGENTS.md template, update review-progress workflow to update AGENTS.md.
- **Out of Scope / Future:** Advanced dashboards, multi-feature linking; modifying other workflow definitions.

## Functional Narrative
Agents read task plan, execute tasks, then append to AGENTS.md Progress Log with completion status, key decisions, and file links. Agents also update the Implementation Checklist for high-level task completion.

### Update Flow
- Trigger: Task completion with task plan reference.
- Experience narrative: Agent checks AGENTS.md, appends entry like "- [2025-10-20] Task done: See [packet.md](path)".
- Acceptance criteria: Entry added correctly; links valid.

## Experience References (Optional)
Wireframes: Simple Markdown list with timestamps.

## Technical Notes & Dependencies (Optional)
- Dependencies: Existing edit_file tool for updates.
- No new tech; uses Markdown appends.

## Risks & Open Questions
| Item | Type (Risk / Question) | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Agents misinterpret instructions | Risk | DevAgent Team | Test with devagent research | 2025-10-27 |
| File conflicts on concurrent runs | Question | DevAgent Team | Use sequential appends | 2025-10-27 |

## Delivery Plan (Optional)
Milestone 1: ✅ Update templates with progress tracking instructions.
Milestone 2: ✅ Create AGENTS.md template with implementation checklist.
Milestone 3: Test integration.

## Approval & Ops Readiness (Optional)
Product sign-off required.

## Appendices & References (Optional)
- Brainstorm packet: See attached.

## Change Log
| Date | Change | Author |
| --- | --- | --- |
| 2025-10-20 | Initial draft | Amp |
| 2025-10-20 | Removed brainstorm references; generalized to workflows; updated scope to include template updates; added AGENTS.md template | Amp |
| 2025-10-20 | Updated status to In Review, summary reflects implementation progress, milestones marked complete | Amp |
