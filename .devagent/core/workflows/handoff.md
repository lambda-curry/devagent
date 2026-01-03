# Handoff

## Mission
- Primary goal: Generate a structured, tool-agnostic handoff prompt that enables a new agent to continue the current work immediately without follow-up questions, using a user-supplied intent.
- Boundaries / non-goals: Do not auto-trigger the handoff, do not auto-save artifacts, do not perform external web lookups, do not use tool-specific formatting, and do not include ownership-transfer wording.
- Success signals: Prompt is clear, goal-first, references only necessary artifacts (including task hub AGENTS.md when present), includes workflow continuation when relevant, and is ready for manual copy/paste.

## Standard Instructions Reference
Before executing this workflow, review standard instructions in `.devagent/core/AGENTS.md` → Standard Workflow Instructions for:
- Date handling
- Metadata retrieval
- Context gathering order
- Standard guardrails
- Storage patterns

## Execution Directive
Follow standard execution directive in `.devagent/core/AGENTS.md` → Standard Workflow Instructions, with the following workflow-specific customization:
- Produce a draft prompt for manual copy/paste without pausing unless required inputs are missing or there is a blocker.

## Inputs
- Required: `/handoff <intent>` (user-provided intent or goal for the new agent).
- Optional: Task hub path, specific references to include, workflow name to continue.
- Missing info protocol: If intent is missing, request it. If task hub cannot be found, proceed with best-effort context and note the gap in the prompt.

## Resource Strategy
- Template: `.devagent/core/templates/handoff-prompt-template.md` — canonical structure for the handoff prompt.
- Task hub: `.devagent/workspace/tasks/{status}/YYYY-MM-DD_task-slug/AGENTS.md` — include as a reference when present.
- Supporting artifacts: plan, research, clarification, mission, constitution — include only when needed to continue or validate.
- **No external sources** — do not browse the web or pull external references.

## Knowledge Sources
- Internal: Task hub AGENTS.md, plan documents, research packets, clarification packets, mission, constitution.
- External: None.

## Workflow
1. **Capture intent:** Confirm the `/handoff <intent>` text. If missing, ask for it and stop.
2. **Gather context (focused):**
   - Follow standard context order; prioritize the task hub AGENTS.md when present.
   - Pull only artifacts necessary to continue (plan, research, clarification, mission/constitution as needed).
   - Exclude tool logs, raw transcripts, and irrelevant history.
3. **Reference selection (open-ended):**
   - Always include task hub `AGENTS.md` when present.
   - Add other references only if they are necessary for continuation or validation.
4. **Draft the prompt:**
   - Use `.devagent/core/templates/handoff-prompt-template.md`.
   - Keep content concise but **do not impose strict length limits**.
   - Include “Workflow Continuation” instructions only when a specific workflow should be resumed.
   - Add a workflow-specific appendix only when required by that workflow.
   - Do not include ownership-transfer language.
5. **Output:**
   - Return the draft prompt for manual copy/paste.
   - Do not ask where to save the handoff or suggest auto-saving.

## Edge Cases & Fallbacks
- **No task hub found:** Note the missing task hub in “Risks / Open Questions” and rely on current context summary.
- **No research/plan/clarification artifacts:** Proceed with available context; include a note that references are limited.
- **Conflicting or ambiguous context:** Flag as a blocker in “Risks / Open Questions.”

## Expected Output
- A structured, tool-agnostic handoff prompt aligned to the template, ready for manual copy/paste.

## Related Workflows
- **Upstream:** devagent create-plan (produces plan artifacts), devagent research, devagent clarify-task
- **Downstream:** devagent implement-plan, devagent review-progress (if pausing before handoff)
