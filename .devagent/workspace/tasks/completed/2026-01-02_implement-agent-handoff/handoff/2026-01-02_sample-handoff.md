# Handoff Prompt — Implement Agent Handoff (Sample)

**Goal / Intent**
Finish implementing the `devagent handoff` workflow and related command integrations for the implement-agent-handoff task.

**Current State**
- Task 1 complete: created `.devagent/core/templates/handoff-prompt-template.md`.
- Task 2 complete: created `.devagent/core/workflows/handoff.md` and added workflow roster entry in `.devagent/core/AGENTS.md`.
- Task 3 complete: added `.agents/commands/handoff.md`, updated `.agents/commands/README.md`, and created `.cursor/commands/handoff.md` symlink.
- Task 4 in progress: validation example captured here; remaining work is to update the task hub `AGENTS.md` progress log/checklist and report final status.

**Decisions / Assumptions**
- Manual `/handoff <intent>` only; no auto-trigger or auto-save.
- Default to the generic core prompt; add workflow-specific appendix only when relevant.
- Reference selection is open-ended: include task hub `AGENTS.md` when present; add more only if needed to continue.
- Avoid ownership-transfer wording and tool-specific formatting.

**References**
- `.devagent/workspace/tasks/completed/2026-01-02_implement-agent-handoff/AGENTS.md` — task hub progress tracker.
- `.devagent/workspace/tasks/completed/2026-01-02_implement-agent-handoff/plan/2026-01-02_agent-handoff-plan.md` — implementation plan and task list.
- `.devagent/workspace/tasks/completed/2026-01-02_implement-agent-handoff/research/2026-01-02_agent-handoff-research.md` — research findings and guidance.
- `.devagent/workspace/tasks/completed/2026-01-02_implement-agent-handoff/clarification/2026-01-02_initial-clarification.md` — validated requirements and constraints.
- `.devagent/core/templates/handoff-prompt-template.md` — prompt template.
- `.devagent/core/workflows/handoff.md` — workflow definition.
- `.agents/commands/handoff.md` — command interface.

**Next Steps**
1. Update the task hub `AGENTS.md` checklist and progress log to mark Tasks 1–4 complete (using `date +%Y-%m-%d`).
2. Confirm no blockers remain and summarize completion for the user.

**Risks / Open Questions**
- Open metrics and evidence gaps remain in the plan (success metrics, urgency evidence).
- Manual save location preference remains open (plan notes; avoid adding prompts that ask about this).

**Workflow Continuation**
Continue `devagent implement-plan` for the implement-agent-handoff task until all tasks are marked complete.

**Workflow-Specific Appendix (Optional)**
None required.

**Execution Notes**
Proceed without follow-up questions unless a blocker is explicitly flagged.
