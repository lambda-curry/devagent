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
- **Critical:** Output the prompt text directly in your response. Do not create files. Do not implement fixes. Stop after outputting the prompt.

## Inputs
- Required: **Intent** (user-provided goal for the new agent; plain text).
- Optional: Task hub path, specific references to include, workflow name to continue, Epic ID (for linking improvement reports).
- Missing info protocol: If intent is missing, request it. If task hub cannot be found, proceed with best-effort context and note the gap in the prompt.

## Resource Strategy
- Template: `.devagent/core/templates/handoff-prompt-template.md` — canonical structure for the handoff prompt.
- Task hub: `.devagent/workspace/tasks/{status}/YYYY-MM-DD_task-slug/AGENTS.md` — include as a reference when present.
- Supporting artifacts: plan, research, clarification, mission, constitution — include only when needed to continue or validate.
- Improvement reports: `.devagent/workspace/reviews/YYYY-MM-DD_<epic-id>-improvements.md` — link when Epic ID is available and report exists.
- Screenshot directories: `.devagent/workspace/reviews/<epic-id>/screenshots/` — reference when available.
- **No external sources** — do not browse the web or pull external references.

## Knowledge Sources
- Internal: Task hub AGENTS.md, plan documents, research packets, clarification packets, mission, constitution.
- External: None.

## Workflow
1. **Capture intent:** Extract/confirm the intent text. If the user provided `/handoff <intent>`, treat `/handoff` as a command prefix and **do not include it in the intent**. If intent is missing, ask for it and stop.
2. **Gather context (focused):**
   - Follow standard context order; prioritize the task hub AGENTS.md when present.
   - Pull only artifacts necessary to continue (plan, research, clarification, mission/constitution as needed).
   - Exclude tool logs, raw transcripts, and irrelevant history.
   - **Check for improvement reports:** If Epic ID is available (from context or explicit input), check for improvement report at `.devagent/workspace/reviews/YYYY-MM-DD_<epic-id>-improvements.md` or `YYYY-MM-DD_revise-report-epic-<epic-id>.md`.
   - **Check for screenshots:** If Epic ID is available, check for screenshot directory at `.devagent/workspace/reviews/<epic-id>/screenshots/`.
3. **Reference selection (open-ended):**
   - Always include task hub `AGENTS.md` when present.
   - Add other references only if they are necessary for continuation or validation.
   - **Include improvement report:** If improvement report exists, reference it in the handoff.
   - **Include screenshot directory:** If screenshots exist, reference the directory path.
4. **Extract top improvements (if improvement report exists):**
   - Read the improvement report if available.
   - Extract top 3-5 critical/high priority improvements.
   - Categorize by: Documentation, Process, Rules & Standards, Tech Architecture.
   - Include in handoff summary for quick reference.
5. **Draft the prompt:**
   - Use `.devagent/core/templates/handoff-prompt-template.md`.
   - Keep content concise but **do not impose strict length limits**.
   - Include "Workflow Continuation" instructions only when a specific workflow should be resumed.
   - Include "Risks / Open Questions" only when there are known risks, blockers, or open questions.
   - **Include "Quick Status" section:** Add task completion status, critical issues count, screenshot directory, and link to improvement report.
   - **Include "Top Improvements" section:** List top 3-5 critical improvements from improvement report (if available).
   - Add a workflow-specific appendix only when required by that workflow.
   - Do not include ownership-transfer language.
6. **Output:**
   - **Output the prompt text directly in your response.**
   - **Do not include `/handoff` in the prompt output.** It is a trigger/command prefix, not part of the intent.
   - **Do not create files.**
   - **Do not implement fixes or continue working.**
   - **Stop after outputting the prompt.**
   - Return the draft prompt for manual copy/paste.
   - Do not ask where to save the handoff or suggest auto-saving.

## Edge Cases & Fallbacks
- **No task hub found:** If this creates a risk, note the missing task hub in "Risks / Open Questions" (optional section) and rely on current context summary.
- **No research/plan/clarification artifacts:** Proceed with available context; include a note in "Risks / Open Questions" only if the limited references create a risk.
- **Conflicting or ambiguous context:** Flag as a blocker in "Risks / Open Questions" (include this section when blockers exist).

## Expected Output
- A structured, tool-agnostic handoff prompt aligned to the template, ready for manual copy/paste.
- **The prompt text must be output directly in the response, not saved to a file.**
- **No implementation work should be performed. Stop after outputting the prompt.**

## Related Workflows
- **Upstream:** devagent create-plan (produces plan artifacts), devagent research, devagent clarify-task
- **Downstream:** devagent implement-plan, devagent review-progress (if pausing before handoff)
