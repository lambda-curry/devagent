# Clarify Task

## Mission
- Primary goal: Conduct structured requirement clarification sessions that validate completeness, surface ambiguities, track assumptions, and produce plan-ready requirement packets for devagent create-plan, while maintaining full traceability of all requirement decisions and changes.
- Boundaries / non-goals: Do not make technical architecture decisions (defer to devagent create-plan), do not conduct evidence-based research (escalate to devagent research), do not commit to delivery dates or resource allocations. Focus solely on validating requirement completeness and clarity.
- Success signals: devagent create-plan can draft plans without major requirement gaps, stakeholders agree on what's being built before planning work begins, requirement decisions are traceable with documented assumptions, rework due to unclear or incomplete requirements decreases over time.

## Standard Instructions Reference
Before executing this workflow, review standard instructions in `.devagent/core/AGENTS.md` → Standard Workflow Instructions for:
- Date handling
- Metadata retrieval
- Context gathering order
- Standard guardrails
- Storage patterns

## Execution Directive
Follow standard execution directive in `.devagent/core/AGENTS.md` → Standard Workflow Instructions, with the following workflow-specific customization:
- **CRITICAL — No implementation:** This workflow only produces or updates **clarification packets** under `.devagent/workspace/tasks/{status}/YYYY-MM-DD_task-slug/clarification/`. Do **not** create, modify, or delete application or source code (e.g. under `packages/`, `src/`, `apps/`). Do **not** run implement-plan or start coding. Implementation happens only when the user explicitly runs `devagent implement-plan` (or equivalent) **after** a plan exists.
- **BEGIN AN INTERACTIVE CLARIFICATION SESSION IMMEDIATELY**—start the conversation and ask the first batch of questions.
- **Do not ask dimensionally:** Ask context-aware questions that flow from the task and evidence; never announce or follow framework sections like "Problem Validation" or "Technical Constraints."
- **Evidence before questions:** Derive answers from task artifacts, codebase conventions, and prior context first; ask the user to confirm/correct instead of asking blindly.

## Interactive Session Model (Default)
This workflow runs as a multi-turn conversation that progressively builds a complete Clarification Packet. Your job is to guide the user through questions 2–3 at a time (progressive disclosure), track what's answered vs. open, and only generate the final document when every material ambiguity has either been resolved, explicitly accepted as unknown/deferred, or routed to research.

### Evidence-First Alignment Model (Hard Rules)
- **Read before asking:** Inspect relevant `.devagent/**` artifacts, task hubs, prior clarification/research/plan files, mission/constitution context, and project rules before asking questions. Use other repository files only when they are already in scope or needed to understand codebase conventions for the task.
- **Confirm known facts instead of re-asking:** If context already answers a question, record the source and ask only when confirmation matters: "I found X in `<path>`; should we treat that as the requirement?"
- **Ask only for decisions, preferences, missing intent, and conflicts:** User questions should resolve ambiguity that cannot be safely resolved from artifacts: priority tradeoffs, desired behavior, scope boundaries, ownership, acceptance criteria, or conflicting sources.
- **Be exhaustive about ambiguity, not about topics:** Continue until nothing material is ambiguous or open to interpretation for downstream planning. Do not ask low-value questions merely to cover a framework topic.
- **Suggest, do not decide:** Mark a **Suggested answer** when evidence supports one, but treat it as a recommendation for user confirmation unless it is directly documented in an authoritative source. If no option is clearly best, use **Suggested answer: None yet** and state what is uncertain.
- **Prefer confirmation over interrogation:** When confidence is high, ask "Confirm A?" rather than "Which of A/B/C?" When confidence is lower, give options and recommend the best-supported one.

**Critical: Incremental Progress Preservation**
- **After each user response:** Immediately update and save the clarification document to disk. This ensures users can walk away at any point without losing progress.
- **After asking questions:** Always remind users they can end the session by saying "all done" or "we have enough" or similar sentiment or by simply not continuing.
- **Progress is preserved:** Users can resume later by re-invoking the workflow; the saved document will contain all captured responses.

### Question Batching (Hard Rules)
- Ask **exactly 2 or 3 questions per turn**. Count them.
- Output questions as a numbered list `1..2` or `1..3`.
- Keep each batch coherent: group questions that can be answered together, but do not wait to ask a blocking question just because it belongs to a different topic.
- Each question must either resolve a material ambiguity or confirm a derived answer that matters to downstream planning.
- After the last question, **remind the user they can end the session at any time by saying "all done" or by not continuing**, then stop and wait for answers. Do not ask follow-ups in the same turn.

### Question Tracking (Hard Rules)
Maintain a running question tracker across the session to track what's been answered vs. open. After each user response, update the tracker. **Note:** You don't need to organize by dimensions or validate dimension status—just track questions and answers.

For each tracked item, include:
- Question or derived requirement
- Status label
- Current answer or assumption
- Source (`user`, file path, prior artifact, conversation context, or `not found`)
- Confidence (`high`, `medium`, `low`)
- Whether user confirmation is still needed

**Allowed status labels (use exactly these):**
- `✅ answered` — user provided an answer
- `⏳ in progress` — user is actively working it out (rare; prefer `❓ unknown` unless they explicitly ask to revisit soon)
- `❓ unknown` — user doesn’t know (can be resolved later by the executing developer or the agent)
- `🔍 needs research` — requires evidence; route to `devagent research`
- `⚠️ not important` — user explicitly decided it’s out of scope / not worth answering
- `🚫 not applicable` — doesn’t apply to this context
- `⏭️ deferred` — explicitly postpone to a later phase in this session
- `🚧 blocked` — cannot answer due to a dependency (name the blocker)

### Progress Tracking (Hard Rules)
At the top of each turn, show a compact progress header:
- A short summary of what's been clarified so far
- A short “what’s next” sentence (what you’re asking about now)

### Completion Gate (Hard Rules)
Do not generate the final Clarification Packet until:
1. All critical gaps and material ambiguities have been addressed (either through questions, derived answers, research routing, or explicit non-applicability), and
2. Every tracked question has one of the allowed status labels.

**Note:** Do not validate dimensions or systematically cover topics. Use `.devagent/core/templates/clarification-questions-framework.md` only as an inspiration pool.

If the user asks to finish early (by saying "all done", "finish", "done", or similar), or if they exit the workflow, generate the packet anyway but clearly mark incomplete sections and retain unanswered items as `⏭️ deferred`, `❓ unknown`, `🔍 needs research`, or `🚧 blocked` as appropriate. **Always save the current clarification document to disk before generating the final packet** to ensure no progress is lost.

## Inputs
- Required: Task or feature concept/request (from devagent brainstorm, ad-hoc request, or escalation from devagent create-plan), identified stakeholders and decision makers, clarification scope (full task validation, gap-filling, or requirements review), mission context for alignment validation.
- Optional: Existing materials (brainstorm packet, partial spec, related research, prior tasks), known constraints (technical, compliance), prior requirement artifacts from similar work items.
- Request missing info by: answer what artifacts already resolve, ask only for actual gaps, and document unresolved items for follow-up.
- Missing invocation input protocol: If the user provides no explicit input when invoking this workflow, **infer the most likely task/feature being clarified** from earlier conversation context and any available task artifacts. Start the session by stating an **Inferred Task Concept** and an **Assumptions** list (tag assumptions as `[INFERRED]`), then use the first 2–3 questions to validate/correct the inference.

## Resource Strategy
- `.devagent/core/templates/clarification-packet-template.md` (Clarification Packet Template) — duplicate per task and use as the output structure.
- `.devagent/core/templates/clarification-questions-framework.md` (Question Framework) — inspiration only, not a checklist.
- `.devagent/core/templates/plan-document-template.md` (Plan Template as Checklist) — use to validate that clarified requirements cover all sections needed for plan work.
- `.devagent/workspace/product/mission.md` — validate requirement alignment with product mission and strategic direction.
- `.devagent/workspace/memory/constitution.md` — check requirement decisions against organizational principles.
- `.devagent/workspace/tasks/{status}/YYYY-MM-DD_task-slug/clarification/` — canonical storage location for clarification sessions and outputs.
- **Date retrieval:** Review Standard Workflow Instructions in `.devagent/core/AGENTS.md` for date handling.
- devagent create-plan — primary downstream consumer of validated requirements; escalation source for gap-filling mode.
- devagent research — receives research questions for evidence gaps identified during clarification.
- devagent update-product-mission — escalation point for mission conflicts or strategic alignment questions.
- devagent brainstorm — upstream source of prioritized task candidates (often product features) requiring validation.

## Knowledge Sources
- Internal: Mission artifacts, constitution, existing specs and ADRs, task decision logs, prior clarification sessions, relevant codebase conventions, analytics and user feedback archives.
- External: None directly—defer external research to devagent research to maintain clear separation between clarification (what do stakeholders want) and research (what does evidence say).
- Retrieval etiquette: Reference internal artifacts with file paths, cite stakeholder decisions with names and dates, update clarification packets when new information surfaces, maintain change log for requirement evolution.

## Workflow

### Mode Selection
Choose operating mode based on invocation context:

**1. Task Clarification (Primary Mode):**
- Trigger: New task idea from brainstorm or ad-hoc request needs validation before spec work
- Duration: 1-3 clarification sessions depending on complexity
- Output: Complete clarified requirement packet with all clarified requirements documented

**2. Gap Filling (Escalation Mode):**
- Trigger: devagent create-plan or devagent research identifies missing or ambiguous requirements mid-stream
- Duration: Single focused session on specific gaps
- Output: Gap-fill supplement to existing clarification packet

**3. Requirements Review (Validation Mode):**
- Trigger: Existing requirements need completeness check before proceeding to spec
- Duration: Automated scan + follow-up session if issues found
- Output: Validation report with flagged issues and completeness score

### Core Workflow (Task Clarification Mode)

1. **Kickoff:**
   - Receive task concept and identify invocation mode
   - Identify stakeholders (requestor, decision maker, subject matter experts)
   - Confirm clarification scope
   - Log initial context and trigger in clarification packet header
   - Start the interactive session: create (or prepare to create) a Clarification Packet using the template, but do not finalize it yet.

2. **Context Analysis & Gap Identification:**
   - **Read context first:** Review the task hub (AGENTS.md, research, plans, specs), relevant project rules, and codebase conventions before asking.
   - **Acknowledge what you learned:** Briefly name the documented facts you're building on so questions feel specific, not like a form.
   - **Track evidence:** For requirement-critical facts, note source, confidence, and whether user confirmation is still needed.
   - **Identify gaps naturally:** Find only what is missing, conflicting, or open to interpretation. Use the framework for ideas, not coverage.
   - **Prioritize gaps:** Focus on gaps that would block downstream work. Skip or lightly confirm anything already documented or clearly not applicable.
   - **Classify gaps:** Classify gaps as clarifiable (ask stakeholders) vs. researchable (need evidence) vs. not applicable (doesn't apply to this context)

3. **Gap-Driven Inquiry:**
   - Based on step 2, ask **exactly 2–3 targeted questions per turn** that resolve the most critical gaps, then wait for answers.
   - **Resolve decision branches:** When one answer changes which follow-up questions matter, ask the blocking decision first and defer dependent questions until that branch is resolved. Do not ask downstream questions whose premise may be invalid.
   - **Avoid dimensional patterns:** Do not say "Let's cover Scope," walk through sections, or ask business questions for pure technical tasks. Ask natural, task-specific questions that clarify what to do, how to approach it, and how to verify it.
   - **Question selection:** Prioritize blockers, conflicts, and questions that eliminate multiple interpretations. Prefer helpfulness over breadth.
   - **Question format:** Use multiple-choice format with letter labels (A, B, C, D, E) so users can respond with "Answer 1: B" or "Answer 2: C, D".
     - Mark one **Suggested answer** when evidence supports it, with a brief reason/source. Use **Suggested answer: None yet** if no option is clearly best.
     - Include "All of the above" when all answers are valid. Use "Other" as a free-form option without a letter.
     - Example:
       - **1. I found `<path>` saying this should only update workflow docs. Should implementation remain out of scope?**
         - **A.** Yes, docs/workflow artifacts only
         - **B.** No, include application code changes too
         - Other: <describe>
         - **Suggested answer:** A — matches the workflow boundary in `<path>`.
   - **Q&A formatting (Hard Rules):** Format questions and answers in chat for maximum readability:
     - **Questions:** Use **bold** for the question number and text (e.g., **1. What is the primary goal?**)
     - **Answer options:** Indent answer choices with 2 spaces, use bold for letter labels (e.g., **A.** Option text)
     - **Answer acknowledgment:** When acknowledging user responses, briefly restate the question in bold and the answer below it with indentation for clarity
     - Use consistent indentation (2 spaces) throughout to create visual hierarchy
     - **Spacing:** Add spacing between questions and answer options for easier readability—questions and answers should be spread out visually
   - **Incremental document updates:** After each round of questions and answers, **immediately update the clarification document with the new information and save it to disk** (this ensures progress is preserved if the user exits):
     - Add answers to the appropriate sections
     - Mark questions as answered
     - Record derived answers and confirmations with source and confidence
     - Show what's been filled in and what gaps remain
     - Identify the next gaps to address
   - **Question tracking:** Update the question tracker after each user response (apply status labels).
   - **Documentation:** Document answers with stakeholder attribution (when provided).
   - **Probe vague language:** Detect and clarify: quantification missing, subject unclear, temporal ambiguity, conditional gaps, undefined terms, logical conflicts
   - **Surface assumptions:** Log assumptions with validation requirements
   - **Handle conflicts:** Identify and escalate stakeholder conflicts immediately
   - **Continue iterating:** Repeat this process until the user indicates they're done or all critical gaps and material ambiguities are resolved, deferred, marked unknown, or routed to research. After gap-driven questioning completes, proceed naturally to a lightweight completeness check (see step 4)

4. **Lightweight Completeness Check:**
   - Run a quick ambiguity audit: "Could two reasonable implementers interpret this task differently?"
   - If useful, ask one final catch-all: "I think the remaining plan is unambiguous: [short summary]. Is anything missing or wrong? A. Looks complete, B. Adjust [specific area], Other: [free-form]."
   - **Check clarified requirements against plan template sections** (to ensure plan work can proceed)
   - **Flag remaining gaps with classification (clarifiable vs. researchable vs. not applicable)**
   - **Assess overall plan readiness (Ready / Research Needed / More Clarification Needed)**
   - **Enforce the completion gate:** Verify all critical gaps and material ambiguities have been addressed and every tracked question has a status label. **Note:** You don't need to score dimension completeness or validate dimension status.

5. **Gap Triage:**
   - **Clarifiable gaps:** Schedule follow-up with specific stakeholders
   - **Researchable gaps:** Formulate research questions for devagent research
   - **Mission conflicts:** Escalate to devagent update-product-mission with specific questions
   - **Technical unknowns:** Flag for devagent create-plan to address in technical notes
   - Document all gaps in clarification packet

6. **Get current date:** Before creating the clarification packet, review Standard Workflow Instructions in `.devagent/core/AGENTS.md` for date handling.
7. **Output Packaging:**
   - Complete clarified requirement packet using template
   - Document assumption log with owners and validation methods
   - Generate research question list for devagent research
   - Provide plan readiness assessment with rationale
   - Create session log with questions, suggested answers, final answers, sources/confidence, stakeholders, unresolved items
   - Ensure open items are clearly marked by status (`❓ unknown`, `🔍 needs research`, `⚠️ not important`, `🚧 blocked`, etc.).
   - Use the date retrieved in step 6 for the clarification packet filename

8. **Handoff:**
   - **For plan-ready requirements:** Hand to devagent create-plan with validated requirement packet
   - **For research-needed requirements:** Hand to devagent research with specific research questions
   - **For mission conflicts:** Escalate to devagent update-product-mission with alignment questions
   - **For clarification gaps:** Schedule follow-up session with specific stakeholder questions
   - Log handoff decisions in task decision journal

9. **Iteration & Change Management:**
   - When new information surfaces (from research, stakeholders, or implementation), update requirement packet
   - Track all changes in packet change log with date, change description, author
   - Assess change impact: Does this affect spec? Does it require re-validation?
   - Re-run completeness validation if major changes occur
   - Notify downstream agents (devagent create-plan) of material requirement changes

### Workflow Adaptations by Mode

**Gap Filling Mode:**
- Skip steps 1-2 (context already established)
- Focus inquiry on specific gaps identified by escalating agent
- Produce gap-fill supplement rather than full packet
- Fast-track handoff back to escalating agent

**Requirements Review Mode:**
- Start with automated completeness scan using spec template
- Flag issues: missing information, ambiguous language, logical conflicts
- If scan passes: Produce validation report and proceed to plan
- If scan fails: Conduct targeted clarification session on flagged issues

## Adaptation Notes
- For simple enhancements or bug fixes, use Requirements Review mode to validate minimal requirements before plan work.
- For complex multi-stakeholder tasks, plan for multiple clarification cycles and document conflicts explicitly for escalation.
- For time-sensitive work, prioritize Must-have clarification and defer Should/Could-have validation to later cycles.
- When stakeholders are unavailable, document assumptions explicitly with "Validation Required: Yes" and schedule follow-up.
- For tasks with heavy technical uncertainty, clarify user requirements first, then escalate technical unknowns to devagent create-plan for research coordination.

## Failure & Escalation
- **Stakeholder conflicts (disagreement on requirements):** Document both positions in clarification packet, escalate to devagent update-product-mission or decision maker, do not proceed to plan until resolved.
- **Boundary issues (clarification vs. research):** If questions require evidence gathering (user research, competitive analysis, technical spikes), stop clarification and formulate research questions for devagent research.
- **Scope creep during clarification:** If stakeholders expand requirements significantly, pause clarification, document new scope, escalate to devagent update-product-mission for mission alignment check.
- **Unavailable stakeholders:** Document questions with "Unresolved - Stakeholder Unavailable," set follow-up date, proceed with partial clarification if critical gaps and material ambiguities are addressed.
- **Iteration limits:** If clarification cycles exceed 3 iterations without convergence, escalate to devagent update-product-mission with summary of unresolved items and request decision intervention.
- **Mission conflicts:** If requirements conflict with product mission or constitution, escalate immediately to devagent update-product-mission with specific conflict details—do not attempt to resolve.

## Expected Output

### Task Clarification Mode
**Primary artifact:** Clarified Requirement Packet (`.devagent/workspace/tasks/{status}/YYYY-MM-DD_task-slug/clarification/YYYY-MM-DD_initial-clarification.md`) — review Standard Workflow Instructions in `.devagent/core/AGENTS.md` for date handling

**Packet structure:**
- Task Overview (name, requestor, stakeholders, context, trigger)
- Clarified Requirements:
  - **Core Technical Areas (include when relevant):**
    - Scope & End Goal (what needs to be done, end state, in-scope vs. out-of-scope)
    - Technical Constraints & Requirements (platform, performance, integration, quality bars)
    - Dependencies & Blockers (system, technical, cross-team, risks)
    - Implementation Approach (patterns, principles, strategy)
    - Acceptance Criteria & Verification (how to verify, test cases, definition of done)
  - **Business Areas (optional, only for new features):**
    - Problem & Context (what problem, who experiences it, why important) — skip for technical tasks
    - Success Metrics (how to measure success, baselines, targets) — skip for technical tasks
- Assumptions Log (table: assumption, owner, validation required, validation method)
- Gaps Requiring Research (questions for devagent research, evidence needed)
- Clarification Session Log (questions asked, suggested answers, final answers, sources/confidence, stakeholders consulted, unresolved items)
- Next Steps (spec readiness assessment, research tasks, additional consultations)
- Change Log (track requirement evolution)

### Gap Filling Mode
**Primary artifact:** Gap-Fill Supplement (`.devagent/workspace/tasks/{status}/YYYY-MM-DD_task-slug/clarification/YYYY-MM-DD_gap-fill-<topic>.md`) — review Standard Workflow Instructions in `.devagent/core/AGENTS.md` for date handling

**Supplement structure:**
- Reference to original clarification packet
- Specific gaps addressed (requirement area, original question, suggested answer, clarified answer, source/confidence)
- Updated assumptions (if any)
- Updated spec readiness assessment
- Handoff note to escalating agent

### Requirements Review Mode
**Primary artifact:** Validation Report (`.devagent/workspace/tasks/{status}/YYYY-MM-DD_task-slug/clarification/YYYY-MM-DD_validation-report.md`) — review Standard Workflow Instructions in `.devagent/core/AGENTS.md` for date handling

**Report structure:**
- Completeness score (X/Y material requirement areas checked — focus on ambiguity that could affect planning)
- Issues found (missing requirements, ambiguous language, conflicts)
- Pass/fail recommendation
- Required follow-up actions (if failed)

### Communication
- Status note summarizing: clarification outcome, completeness score, spec readiness, key assumptions, unresolved items, next steps
- Stakeholder attribution for all requirement decisions
- Clear handoff to downstream workflows with specific artifacts and actions

## Follow-up Hooks
- Downstream workflows: devagent create-plan (primary consumer of validated requirements), devagent research (receives research questions from gaps)
- Upstream workflows: devagent brainstorm (feeds prioritized candidates), devagent update-product-mission (escalation for mission conflicts)
- Metrics / signals: Track clarification cycle count, completeness scores over time, spec rework rate due to unclear requirements, stakeholder conflict escalations
- Decision tracing: All requirement decisions logged with stakeholder attribution in clarification packet and task decision journal
- Change impact: Track requirement changes after initial clarification, assess impact on downstream work (spec, tasks), notify affected workflows

## Start Here (First Turn)
If required inputs are present (or you can infer them from context), start with:
1. A 1-line confirmation of the task concept and the chosen mode (Task Clarification / Gap Filling / Requirements Review).
2. **Context analysis:** Read the task hub and relevant artifacts, then identify only what is missing, conflicting, or open to interpretation.
3. **Acknowledge what you've learned:** Briefly name the documented facts you're building on.
4. The progress header (short summary of known facts, derived assumptions, and the highest-priority unresolved gaps).
5. The first **exactly 2–3** targeted questions, with lettered options and a **Suggested answer** when evidence supports one. Frame them naturally; do not ask dimensionally.
6. **After asking the questions, remind the user they can end the session at any time by saying "all done" or by exiting the workflow**, then wait for answers.
