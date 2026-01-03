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
- **BEGIN AN INTERACTIVE CLARIFICATION SESSION IMMEDIATELY**—start the conversation and ask the first batch of questions.

## Interactive Session Model (Default)
This workflow runs as a multi-turn conversation that progressively builds a complete Clarification Packet. Your job is to guide the user through questions 2–3 at a time (progressive disclosure), track what’s answered vs. open, and only generate the final document when all questions have a status.

### Question Batching (Hard Rules)
- Ask **exactly 2 or 3 questions per turn**. Count them.
- Output questions as a numbered list `1..2` or `1..3`.
- After the last question, stop and wait for answers. Do not ask follow-ups in the same turn.

### Question Tracking (Hard Rules)
Maintain a running question tracker across the session, organized by the 8 clarification dimensions. After each user response, update the tracker.

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
- Dimension checklist with status: `✅ complete`, `⏳ in progress`, or `⬜ not started`
- A short “what’s next” sentence (which dimension you’re asking about now)

### Completion Gate (Hard Rules)
Do not generate the final Clarification Packet until:
1. Every dimension has been visited, and
2. Every tracked question has one of the allowed status labels.

If the user asks to finish early, generate the packet anyway but clearly mark incomplete sections and retain unanswered items as `⏭️ deferred`, `❓ unknown`, `🔍 needs research`, or `🚧 blocked` as appropriate.

## Inputs
- Required: Task or feature concept/request (from devagent brainstorm, ad-hoc request, or escalation from devagent create-plan), identified stakeholders and decision makers, clarification scope (full task validation, gap-filling, or requirements review), mission context for alignment validation.
- Optional: Existing materials (brainstorm packet, partial spec, related research, prior tasks), known constraints (technical, compliance), prior requirement artifacts from similar work items.
- Request missing info by: Compile a structured gaps checklist mapped to the 8 clarification dimensions (Problem, Users, Success, Scope, Constraints, Principles, Dependencies, Acceptance), ping stakeholders with specific questions, and document unresolved items in the clarification packet for follow-up.

## Resource Strategy
- `.devagent/core/templates/clarification-packet-template.md` (Clarification Packet Template) — duplicate per task and use as the output structure.
- `.devagent/core/templates/clarification-questions-framework.md` (Question Framework) — **use as a completeness checklist for gap analysis, not as a question template**. Analyze context first, then use this framework to identify which dimensions need questions. Ask targeted questions to fill gaps rather than following the framework systematically.
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
- Internal: Mission artifacts, constitution, existing specs and ADRs, task decision logs, prior clarification sessions, analytics and user feedback archives.
- External: None directly—defer external research to devagent research to maintain clear separation between clarification (what do stakeholders want) and research (what does evidence say).
- Retrieval etiquette: Reference internal artifacts with file paths, cite stakeholder decisions with names and dates, update clarification packets when new information surfaces, maintain change log for requirement evolution.

## Workflow

### Mode Selection
Choose operating mode based on invocation context:

**1. Task Clarification (Primary Mode):**
- Trigger: New task idea from brainstorm or ad-hoc request needs validation before spec work
- Duration: 1-3 clarification sessions depending on complexity
- Output: Complete clarified requirement packet with validation status per dimension

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
   - **Analyze task hub context first:** Read the task hub's AGENTS.md, existing research files, plans, specs, or other artifacts to understand what's already documented
   - **Identify gaps:** Compare existing documentation against the 8-dimension framework (use `.devagent/core/templates/clarification-questions-framework.md` as a completeness checklist, not as a question template) to identify missing or incomplete sections
   - **Prioritize gaps:** Focus on the most critical gaps first, especially those that block downstream work if unanswered
   - **Classify gaps:** Classify gaps as clarifiable (ask stakeholders) vs. researchable (need evidence)
   - **Reference existing context:** Before asking questions, acknowledge what's already documented (e.g., "I see from your task hub that you've already documented [X]. Let me ask about [Y] to build on that")

3. **Gap-Driven Inquiry:**
   - **Targeted questioning:** Based on context analysis, ask **exactly 2–3 targeted questions per turn** that fill the most critical gaps identified, then wait for answers.
   - **Question selection principles:**
     - Select questions from different categories each round (e.g., one from Success, one from Scope, one from Constraints) to maintain breadth while addressing gaps
     - Prioritize questions that would block downstream work if unanswered
     - Skip dimensions that are already well-documented or ask validation questions instead of foundational ones
     - Frame questions specifically to the task being clarified (reference the task name, type, or context from existing documentation)
   - **Question format:** Use multiple-choice format with letter labels (A, B, C, D, E) so users can respond with "Answer 1: B" or "Answer 2: C, D"
     - Include "All of the above" option when all answers are valid
     - "Other" option doesn't need a letter label — it's just a prompt for custom answers
     - Questions should be high-impact for the specific task and less structured/open-ended, more targeted
   - **Q&A formatting (Hard Rules):** Format questions and answers in chat for maximum readability:
     - **Questions:** Use **bold** for the question number and text (e.g., **1. What is the primary goal?**)
     - **Answer options:** Indent answer choices with 2 spaces, use bold for letter labels (e.g., **A.** Option text)
     - **Answer acknowledgment:** When acknowledging user responses, briefly restate the question in bold and the answer below it with indentation for clarity
     - Use consistent indentation (2 spaces) throughout to create visual hierarchy
   - **Incremental document updates:** After each round of questions and answers, update the clarification document with the new information:
     - Add answers to the appropriate sections
     - Mark questions as answered
     - Show what's been filled in and what gaps remain
     - Identify the next gaps to address
   - **Question tracking:** Update the question tracker after each user response (apply status labels).
   - **Documentation:** Document answers with stakeholder attribution (when provided).
   - **Probe vague language:** Detect and clarify: quantification missing, subject unclear, temporal ambiguity, conditional gaps, undefined terms, logical conflicts
   - **Surface assumptions:** Log assumptions with validation requirements
   - **Handle conflicts:** Identify and escalate stakeholder conflicts immediately
   - **Continue iterating:** Repeat this process until the user indicates they're done or all critical gaps are filled

4. **Completeness Validation:**
   - **Final completeness check:** Before finishing, verify all 8 dimensions have been considered (even if marked as not applicable). Review the 8-dimension framework checklist to ensure no critical gaps were missed.
   - Check clarified requirements against plan template sections
   - Score completeness per dimension (Complete / Partial / Missing)
   - Flag remaining gaps with classification (clarifiable vs. researchable)
   - Assess overall plan readiness (Ready / Research Needed / More Clarification Needed)
   - Generate completeness score (X/8 dimensions complete)
   - Enforce the completion gate: verify every tracked question has a status label.

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
   - Create session log with questions, answers, stakeholders, unresolved items
   - Ensure open items are clearly marked by status (`❓ unknown`, `🔍 needs research`, `⚠️ not important`, `🚧 blocked`, etc.).
   - Use the date retrieved in step 6 for the clarification packet filename

8. **Handoff:**
   - **For plan-ready requirements:** Hand to devagent create-plan with validated requirement packet
   - **For research-needed requirements:** Hand to devagent research with specific research questions
   - **For mission conflicts:** Escalate to devagent create-product-mission with alignment questions
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
- Flag issues: missing dimensions, ambiguous language, logical conflicts
- If scan passes: Produce validation report and proceed to plan
- If scan fails: Conduct targeted clarification session on flagged issues

## Adaptation Notes
- For simple enhancements or bug fixes, use Requirements Review mode to validate minimal requirements before plan work.
- For complex multi-stakeholder tasks, plan for multiple clarification cycles and document conflicts explicitly for escalation.
- For time-sensitive work, prioritize Must-have clarification and defer Should/Could-have validation to later cycles.
- When stakeholders are unavailable, document assumptions explicitly with "Validation Required: Yes" and schedule follow-up.
- For tasks with heavy technical uncertainty, clarify user requirements first, then escalate technical unknowns to devagent create-plan for research coordination.

## Failure & Escalation
- **Stakeholder conflicts (disagreement on requirements):** Document both positions in clarification packet, escalate to devagent create-product-mission or decision maker, do not proceed to plan until resolved.
- **Boundary issues (clarification vs. research):** If questions require evidence gathering (user research, competitive analysis, technical spikes), stop clarification and formulate research questions for devagent research.
- **Scope creep during clarification:** If stakeholders expand requirements significantly, pause clarification, document new scope, escalate to devagent create-product-mission for mission alignment check.
- **Unavailable stakeholders:** Document questions with "Unresolved - Stakeholder Unavailable," set follow-up date, proceed with partial clarification if remaining dimensions are complete.
- **Iteration limits:** If clarification cycles exceed 3 iterations without convergence, escalate to devagent create-product-mission with summary of unresolved items and request decision intervention.
- **Mission conflicts:** If requirements conflict with product mission or constitution, escalate immediately to devagent create-product-mission with specific conflict details—do not attempt to resolve.

## Expected Output

### Task Clarification Mode
**Primary artifact:** Clarified Requirement Packet (`.devagent/workspace/tasks/{status}/YYYY-MM-DD_task-slug/clarification/YYYY-MM-DD_initial-clarification.md`) — review Standard Workflow Instructions in `.devagent/core/AGENTS.md` for date handling

**Packet structure:**
- Feature Overview (name, requestor, stakeholders, business context, trigger)
- Validated Requirements (8 sections with validation status per dimension):
  - Problem Statement (what, who, why, evidence, validation status)
  - Success Criteria (metrics, baselines, targets, failure definition, validation status)
  - Users & Personas (primary/secondary users, goals, insights, validation status)
  - Constraints (technical, compliance, resources, validation status)
  - Scope Boundaries (in-scope, out-of-scope, ambiguous areas, validation status)
  - Solution Principles (quality bars, architecture, UX, performance, validation status)
  - Dependencies (technical, cross-team, external, validation status)
  - Acceptance Criteria (flows, error cases, testing, launch readiness, validation status)
- Assumptions Log (table: assumption, owner, validation required, validation method)
- Gaps Requiring Research (questions for devagent research, evidence needed)
- Clarification Session Log (questions asked, answers, stakeholders consulted, unresolved items)
- Next Steps (spec readiness assessment, research tasks, additional consultations)
- Change Log (track requirement evolution)

### Gap Filling Mode
**Primary artifact:** Gap-Fill Supplement (`.devagent/workspace/tasks/{status}/YYYY-MM-DD_task-slug/clarification/YYYY-MM-DD_gap-fill-<topic>.md`) — review Standard Workflow Instructions in `.devagent/core/AGENTS.md` for date handling

**Supplement structure:**
- Reference to original clarification packet
- Specific gaps addressed (dimension, original question, clarified answer)
- Updated assumptions (if any)
- Updated spec readiness assessment
- Handoff note to escalating agent

### Requirements Review Mode
**Primary artifact:** Validation Report (`.devagent/workspace/tasks/{status}/YYYY-MM-DD_task-slug/clarification/YYYY-MM-DD_validation-report.md`) — review Standard Workflow Instructions in `.devagent/core/AGENTS.md` for date handling

**Report structure:**
- Completeness score (X/8 dimensions)
- Issues found (missing dimensions, ambiguous language, conflicts)
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
If required inputs are present, start with:
1. A 1-line confirmation of the task concept and the chosen mode (Task Clarification / Gap Filling / Requirements Review).
2. **Context analysis:** Analyze the task hub (read AGENTS.md, existing research, plans, specs) to understand what's already documented.
3. The progress header (dimension checklist showing what's already known vs. gaps).
4. The first **exactly 2–3** targeted questions that fill the most critical gaps (use multiple-choice format with letter labels), referencing existing context where relevant, and wait for answers.
