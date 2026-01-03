# Implement Agent Handoff Feature Plan

- Owner: Jake Ruesink
- Last Updated: 2026-01-02
- Status: Draft
- Related Task Hub: `.devagent/workspace/tasks/active/2026-01-02_implement-agent-handoff/`
- Stakeholders: Jake Ruesink (Owner, Decision Authority)
- Notes: This plan follows Constitution clauses C1, C3, C4. Unresolved items are marked as open questions.

---

## PART 1: PRODUCT CONTEXT

### Summary
DevAgent needs a manual `/handoff <intent>` workflow that generates a structured, tool-agnostic prompt for starting a fresh agent thread without losing progress. The handoff prompt should summarize current work state, cite key files and research, and instruct the next agent to continue (including workflow continuation when relevant), preserving human-in-the-loop control and traceable artifacts.

### Context & Problem
Switching to a new agent/thread currently loses momentum; compaction and ad-hoc summaries are unreliable for preserving intent, decisions, and references. DevAgent operators need a dependable, structured handoff prompt they can paste into a new session to continue immediately. Evidence of urgency/impact is not yet documented. (Sources: `.devagent/workspace/tasks/active/2026-01-02_implement-agent-handoff/clarification/2026-01-02_initial-clarification.md`, `.devagent/workspace/tasks/active/2026-01-02_implement-agent-handoff/research/2026-01-02_agent-handoff-research.md`)

### Objectives & Success Metrics
- **Primary outcome:** A new agent can continue work immediately without asking follow-up questions, or after reading the prompt plus linked files. (Validated in clarification packet.)
- **Prompt quality:** Includes progress summary, explicit next steps, and curated references; includes "continue with workflow X" when relevant.
- **Human-in-the-loop:** Prompt is generated for manual copy/paste; no automation beyond generation.
- **Tool-agnostic:** Output usable in any editor/CLI (C4).

**Metrics (open):**
- Product metrics: Not defined; qualitative success only for v1. [NEEDS CLARIFICATION if quantitative targets are required]
- Business metrics: Not defined. [NEEDS CLARIFICATION]
- UX metrics: Not defined. [NEEDS CLARIFICATION]

### Users & Insights
- **Primary users:** DevAgent operators using workflows day-to-day.
- **Need:** Preserve intent, progress, and references when starting a new agent thread without relying on compaction. (Source: clarification packet.)

### Solution Principles
- **Goal-first structure:** Handoff begins with the user-provided intent, followed by summary, decisions, references, and next actions.
- **Human-in-the-loop defaults (C3):** Generate a draft prompt for explicit user review/copy.
- **Traceable artifacts (C3/C2):** Handoff prompt references task hubs/research and includes dated file paths.
- **Tool-agnostic output (C4):** No tool-specific formatting.
- **Token efficiency:** Filter out tool logs and irrelevant history; include only critical artifacts. (Source: research packet.)

### Scope Definition
- **In Scope:**
  - Manual `/handoff <intent>` workflow that generates a structured prompt.
  - Prompt includes progress summary, explicit next steps, and curated file/research references.
  - Prompt includes "continue with workflow X" instructions when relevant.
  - Handoff template and reference-selection guidance that is reusable across workflows.
  - Documentation updates to the workflow roster and command list.
- **Out of Scope / Future:**
  - Auto-saving handoff prompts to task hubs.
  - Automatic triggering without explicit `/handoff`.
  - External web lookups during handoff generation.
  - Tool-specific formatting.
  - Prompts that require follow-up questions in the new thread.

### Functional Narrative
#### Flow: Manual handoff generation
- **Trigger:** User runs `/handoff <intent>`.
- **Experience narrative:** Agent gathers current task context (task hub, research, decisions) and produces a structured, goal-first prompt that includes current state, decisions/assumptions, curated references, and clear next steps. If a workflow continuation is applicable (e.g., "continue with devagent create-plan"), include explicit instructions. The prompt is output as a draft for copy/paste into a new thread with no follow-up questions required.
- **Acceptance criteria:** Prompt includes required sections, remains tool-agnostic, and references only relevant artifacts.

### Technical Notes & Dependencies (Optional)
- **New core artifacts:** `.devagent/core/templates/handoff-prompt-template.md` (new), `.devagent/core/workflows/handoff.md` (new).
- **Workflow roster & commands:** Update `.devagent/core/AGENTS.md`, add `.agents/commands/handoff.md`, update `.agents/commands/README.md`, and create `.cursor/commands/handoff.md` symlink.
- **Dependency decisions:**
  - Default behavior uses a generic core prompt; workflow-specific appendix only when explicitly relevant. [RESOLVED]
  - Reference selection should be open-ended: if a task hub exists, include at least the task hub `AGENTS.md`; add additional references only if they add needed context. [RESOLVED]
  - Where handoff artifacts should live if the user chooses to save them manually (e.g., `handoff/` subfolder). [NEEDS CLARIFICATION]

---

## PART 2: IMPLEMENTATION PLAN

### Scope & Assumptions
- **Scope focus:** V1 manual handoff prompt generation and workflow/command integration.
- **Key assumptions:**
  - Handoff generation does not auto-save artifacts; any saving is manual user action. [Validated]
- **Resolved defaults:**
  - Generic core prompt is the default; add workflow-specific appendix only when relevant.
  - Reference selection is intentionally open-ended: include task hub `AGENTS.md` when present; add extra references only to support continuation.
- **Out of scope:** Auto-triggering, auto-saving, external web lookups, tool-specific formatting.
- **Prompt behavior:** Do not ask the user whether to save the handoff prompt or where to store it.

### Implementation Tasks

#### Task 1: Define handoff prompt template + reference selection guidance
- **Objective:** Create a reusable, structured handoff prompt template aligned with research findings and DevAgent principles.
- **Impacted Modules/Files:**
  - `.devagent/core/templates/handoff-prompt-template.md` (new)
  - `.devagent/core/templates/task-prompt-template.md` (optional cross-reference only if needed)
- **Dependencies:** None.
- **Acceptance Criteria:**
  - Template includes sections for Goal/Intent, Current State, Decisions/Assumptions, References, Next Steps, Risks/Open Questions, and Workflow Continuation.
  - Explicit instruction that the new agent should proceed without asking follow-up questions unless a blocker is flagged.
  - Template includes a human-in-the-loop note (draft for copy/paste).
  - Reference guidance: include task hub `AGENTS.md` if present; add more references only when necessary for continuation.
  - Template avoids asking whether to save the handoff prompt or where to store it.
- **Validation Plan:** Template review against clarification must-haves and research findings; confirm aligns with C3/C4.

#### Task 2: Add handoff workflow definition
- **Objective:** Create a `devagent handoff` workflow that produces the prompt using the template and current task context.
- **Impacted Modules/Files:**
  - `.devagent/core/workflows/handoff.md` (new)
  - `.devagent/core/AGENTS.md` (workflow roster update)
- **Dependencies:** Task 1 completed; decision on reference selection rules.
- **Acceptance Criteria:**
  - Workflow specifies inputs (`/handoff <intent>`), context gathering order, and filtering guidance.
  - Workflow disallows external web lookups and tool-specific formatting.
  - Workflow includes rules for inserting "continue with workflow X" when relevant.
  - Output is a draft prompt intended for manual copy/paste (human-in-the-loop).
- **Validation Plan:** Dry-run the workflow on the current task hub to ensure output is complete and tool-agnostic.

#### Task 3: Add command interface + command documentation
- **Objective:** Provide a standardized command file and command list entry for the handoff workflow.
- **Impacted Modules/Files:**
  - `.agents/commands/handoff.md` (new)
  - `.agents/commands/README.md` (add handoff entry)
  - `.cursor/commands/handoff.md` (symlink to command)
- **Dependencies:** Task 2 completed (workflow file exists).
- **Acceptance Criteria:**
  - Command file references `.devagent/core/workflows/handoff.md` and includes an input context placeholder.
  - Command list includes handoff with a one-line description.
  - Cursor command symlink resolves correctly.
- **Validation Plan:** Verify command file and symlink; confirm command list includes handoff.

#### Task 4: Capture validation example + document usage expectations
- **Objective:** Validate usability by running the workflow on an existing task and documenting the expected output structure.
- **Impacted Modules/Files:**
  - `.devagent/workspace/tasks/active/2026-01-02_implement-agent-handoff/plan/2026-01-02_agent-handoff-plan.md` (append validation note if needed)
  - `.devagent/workspace/tasks/active/2026-01-02_implement-agent-handoff/AGENTS.md` (reference the sample handoff prompt if saved)
- **Dependencies:** Tasks 1-3 completed.
- **Acceptance Criteria:**
  - Sample handoff prompt can be pasted into a new agent thread with no follow-up questions required.
  - Prompt references task hub, research, and plan files accurately.
- **Validation Plan:** Manual dry-run and reviewer confirmation; record any gaps as open questions.

---

## Risks & Open Questions

| Item | Type (Risk / Question) | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Evidence/urgency for problem importance | Question | Jake Ruesink | Capture supporting evidence or user anecdotes in clarification (optional) | TBD |
| Success metrics/baselines/targets | Question | Jake Ruesink | Define metrics in clarification or mission alignment if needed | TBD |
| Dependencies and required approvals | Risk | Jake Ruesink | Identify any prerequisite workflow/command updates | TBD |
| Error/edge cases (missing task hub, no research) | Risk | Jake Ruesink | Add fallback behaviors and explicit prompt language | TBD |
| Testing approach (beyond manual dry-run) | Question | Jake Ruesink | Document acceptable validation in workflow or task hub | TBD |
| Prompt length bloat | Risk | Jake Ruesink | Keep guidance minimal; avoid strict caps unless needed | TBD |
| Ownership transfer wording | Question | Jake Ruesink | Omit ownership language unless requested later | TBD |

---

## Progress Tracking
Refer to `.devagent/workspace/tasks/active/2026-01-02_implement-agent-handoff/AGENTS.md` for progress logging instructions during implementation.

---

## Appendices & References (Optional)
- `.devagent/workspace/tasks/active/2026-01-02_implement-agent-handoff/research/2026-01-02_agent-handoff-research.md`
- `.devagent/workspace/tasks/active/2026-01-02_implement-agent-handoff/clarification/2026-01-02_initial-clarification.md`
- `.devagent/workspace/product/mission.md`
- `.devagent/workspace/memory/constitution.md`
- `.devagent/core/templates/task-prompt-template.md`
- `.devagent/core/templates/plan-document-template.md`
