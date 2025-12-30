# Improve Interactive Workflows Plan

- Owner: Jake Ruesink
- Last Updated: 2025-12-30
- Status: Draft
- Related Feature Hub: `.devagent/workspace/features/completed/2025-12-30_improve-interactive-workflows/`
- Stakeholders: Jake Ruesink (Owner, Decision Maker)
- Notes: Prompt engineering changes to workflow files and templates

---

## PART 1: PRODUCT CONTEXT

### Summary
Update both `clarify-feature` and `brainstorm` workflows to use targeted, context-aware questions that are specific to the feature hub or artifact being worked on. Instead of following rigid templates (8-dimension framework for clarify-feature, phase-based structure for brainstorm), workflows will analyze existing context first, then ask thoughtful questions 2-3 at a time that are relevant to what's already known, updating the clarification/brainstorm document after each round until the user indicates they're done. This improvement reduces cognitive load and makes workflows more effective by avoiding irrelevant questions.

### Context & Problem
Current `clarify-feature` and `brainstorm` workflows use rigid templates that ask questions systematically regardless of what's already documented in the feature hub. The `clarify-feature` workflow follows an 8-dimension question framework, while `brainstorm` uses a phase-based structure with templated questions. This approach can lead to irrelevant questions and doesn't leverage existing context, making the workflows feel overwhelming and less effective.

**User Pain:**
- Developers using DevAgent workflows have to answer questions that are already documented in their feature hubs
- Generic questions that don't adapt to specific feature context
- Previous work (2025-12-14) made workflows interactive but still used rigid templates
- Cognitive overload from facing many questions at once

**Evidence:**
- Research identified that context analysis before questioning would improve workflow effectiveness (`.devagent/workspace/features/completed/2025-12-30_improve-interactive-workflows/research/2025-12-30_context-aware-questioning-patterns.md`)
- Constitution C3 emphasizes "human-in-the-loop defaults" — context-aware questions align with this principle
- Practice clarification session revealed preference for multiple-choice questions with letter labels and context-aware selection

### Objectives & Success Metrics

**Product Objectives:**
- Workflows analyze feature hub context before asking questions
- Questions are targeted and relevant to what's already documented
- Questions use multiple-choice format with letter labels (A, B, C, D) for easy response
- Questions are selected from different categories each round (not all from same category)
- AI selects high-impact questions for the specific feature
- Documents are updated incrementally after each round of questions

**Success Metrics:**
- Users explicitly say they prefer the new approach
- The feature is not as overwhelming to use (reduced cognitive load)
- Fewer irrelevant questions asked during clarification sessions

**Baseline:** Current workflows use rigid templates that ask questions systematically regardless of context.

**Target:** Workflows analyze context first, then ask 2-3 targeted questions per round that fill critical gaps.

### Users & Insights

**Primary Users:**
- Developers using DevAgent workflows who need to clarify features or brainstorm ideas
- AI agents executing the workflows (they'll ask better questions)

**Key Insights:**
- Users prefer multiple-choice questions with letter labels for easy response
- Questions should be picked from different categorical sections, not all from the same category
- AI should select high-impact questions for the specific feature
- If all answers are valid options, include an "All of the above" option
- Less structured/open-ended, more targeted questions are preferred

**Demand Signals:**
- Previous work (2025-12-14) made workflows interactive but still used rigid templates
- Practice clarification session revealed strong preference for context-aware, multiple-choice questions

### Solution Principles

**How the AI should select which questions to ask:**
1. Analyze feature hub context first, then ask questions to fill the biggest gaps
2. Use a mix of categories each round (e.g., one from Success, one from Scope, one from Constraints)
3. Prioritize questions that would block downstream work if unanswered

**Question Format Principles:**
- Multiple-choice questions with letter labels (A, B, C, D, E) so users can respond with "Answer 1: B"
- Include "All of the above" option when all answers are valid
- "Other" option doesn't need a letter label — it's just a prompt for custom answers
- Questions should be high-impact for the specific feature
- Less structured/open-ended, more targeted

**Context Analysis Principles:**
- Before asking questions, analyze the feature hub and existing artifacts
- Read AGENTS.md, existing research, plans, or specs to identify what's already documented
- Compare existing documentation against template structure to identify missing or incomplete sections
- Focus questions on the most critical gaps first, especially those that block downstream work

### Scope Definition

**In Scope:**
- Update `clarify-feature.md` workflow file to use context-aware questioning
- Update `brainstorm.md` workflow file to use context-aware questioning
- Update `clarification-questions-framework.md` to emphasize it's a checklist, not a template
- Update `clarification-packet-template.md` to be more flexible and less prescriptive

**Out of Scope / Future:**
- Code changes (this is prompt engineering only)
- Changes to other workflows beyond clarify-feature and brainstorm
- Changes to other templates beyond clarification-questions-framework and clarification-packet-template

### Functional Narrative

#### Flow: Context-Aware Clarification Session

**Trigger:**
- User invokes `devagent clarify-feature` with a feature hub path

**Experience narrative:**
1. AI analyzes feature hub context (reads AGENTS.md, existing research, plans, specs)
2. AI identifies gaps by comparing existing documentation against completeness checklist
3. AI selects 2-3 high-impact questions from different categories to fill critical gaps
4. AI presents questions as multiple-choice with letter labels (A, B, C, D, E)
5. User responds with letter choices (e.g., "Answer 1: B, C. Answer 2: E")
6. AI updates clarification document with answers
7. AI shows progress and identifies next gaps
8. Process repeats until user indicates done or all critical gaps are filled
9. AI generates final clarification packet

**Acceptance criteria:**
- Questions are context-aware (reference existing documentation)
- Questions use multiple-choice format with letter labels
- Questions are selected from different categories each round
- Document is updated after each round of questions
- Final document is generated when user indicates done

#### Flow: Context-Aware Brainstorm Session

**Trigger:**
- User invokes `devagent brainstorm` with a topic or feature hub path

**Experience narrative:**
1. AI analyzes context (feature hub if feature-specific, or mission/roadmap if general)
2. AI asks 2-3 context-setting questions if problem statement is unclear
3. AI generates ideas in batches of 5-10, building on context and previous answers
4. AI updates brainstorm document after each batch
5. User provides feedback or requests more ideas
6. Process continues through clustering, evaluation, and prioritization phases
7. AI generates final brainstorm packet

**Acceptance criteria:**
- Context is analyzed before ideation begins
- Ideas are generated incrementally (5-10 at a time)
- Document is updated after each batch
- Questions adapt to existing context

### Technical Notes & Dependencies

**Technical Constraints:**
- This is a prompt engineering change, not code changes
- Must work with current prompt structure (no code changes)
- Must maintain backwards compatibility with existing workflows (workflows should still function if context analysis fails)

**Dependencies:**
- None — this is self-contained prompt engineering work

**Platform Considerations:**
- Workflows are markdown files with prompt instructions
- Templates are markdown files
- No platform-specific considerations

---

## PART 2: IMPLEMENTATION PLAN

### Scope & Assumptions

**Scope focus:**
- Prompt engineering updates to workflow files and templates
- Focus on clarify-feature and brainstorm workflows
- Update related templates to support new approach

**Key assumptions:**
- This is a prompt engineering change, not code changes
- Workflows will still function if context analysis fails (graceful degradation)
- Users will respond to multiple-choice questions with letter labels

**Out of scope:**
- Code changes
- Changes to other workflows
- Changes to other templates

### Implementation Tasks

#### Task 1: Update clarify-feature.md Workflow
- **Objective:** Add context analysis phase and gap-driven questioning to clarify-feature workflow
- **Impacted Modules/Files:**
  - `.devagent/core/workflows/clarify-feature.md`
- **Dependencies:** None
- **Acceptance Criteria:**
  - Workflow includes explicit context analysis instructions before questioning
  - Workflow instructs AI to analyze feature hub (AGENTS.md, research, plans, specs) to identify gaps
  - Workflow instructs AI to ask 2-3 targeted questions that fill critical gaps
  - Questions use multiple-choice format with letter labels (A, B, C, D, E)
  - Questions are selected from different categories each round
  - Workflow includes "All of the above" option guidance when appropriate
  - Workflow instructs AI to update clarification document after each round
  - Workflow uses question framework as checklist for completeness, not as question template
- **Subtasks:**
  1. Add context analysis phase instructions — Instruct AI to read feature hub artifacts before asking questions
     - Validation: Review workflow file to confirm context analysis instructions are present
  2. Add gap-driven questioning instructions — Replace template-driven questions with gap-driven approach
     - Validation: Review workflow file to confirm gap-driven questioning instructions replace template-driven approach
  3. Add multiple-choice question format instructions — Specify letter labels (A, B, C, D, E) and "All of the above" option
     - Validation: Review workflow file to confirm multiple-choice format instructions are present
  4. Add incremental document update instructions — Instruct AI to update clarification document after each round
     - Validation: Review workflow file to confirm incremental update instructions are present
  5. Update question framework reference — Change from "use framework as template" to "use framework as checklist"
     - Validation: Review workflow file to confirm framework is referenced as checklist, not template
- **Validation Plan:** Review updated workflow file against acceptance criteria, test with practice clarification session

#### Task 2: Update brainstorm.md Workflow
- **Objective:** Add context analysis and adaptive questioning to brainstorm workflow
- **Impacted Modules/Files:**
  - `.devagent/core/workflows/brainstorm.md`
- **Dependencies:** None
- **Acceptance Criteria:**
  - Workflow includes explicit context analysis instructions before ideation
  - Workflow instructs AI to analyze feature hub (if feature-specific) or mission/roadmap (if general)
  - Workflow adapts ideation prompts to specific context rather than using generic templates
  - Workflow instructs AI to ask 2-3 context-setting questions if problem statement is unclear
  - Workflow instructs AI to update brainstorm document after each batch of ideas
  - Questions use multiple-choice format with letter labels when applicable
- **Subtasks:**
  1. Add context analysis phase instructions — Instruct AI to analyze context before starting ideation
     - Validation: Review workflow file to confirm context analysis instructions are present
  2. Add adaptive questioning instructions — Replace phase-based template with context-aware approach
     - Validation: Review workflow file to confirm adaptive questioning instructions replace phase-based template
  3. Add incremental document update instructions — Instruct AI to update brainstorm document after each batch
     - Validation: Review workflow file to confirm incremental update instructions are present
  4. Add multiple-choice question format instructions — Specify letter labels for questions when applicable
     - Validation: Review workflow file to confirm multiple-choice format instructions are present
- **Validation Plan:** Review updated workflow file against acceptance criteria, test with practice brainstorm session

#### Task 3: Update clarification-questions-framework.md Template
- **Objective:** Emphasize that framework is a checklist, not a question template
- **Impacted Modules/Files:**
  - `.devagent/core/templates/clarification-questions-framework.md`
- **Dependencies:** None
- **Acceptance Criteria:**
  - Framework header emphasizes it's a completeness checklist, not a question template
  - Framework includes guidance on using it for gap analysis rather than systematic questioning
  - Framework maintains all existing question sets for reference
- **Subtasks:**
  1. Update framework header — Add guidance that framework is a checklist, not a template
     - Validation: Review template file to confirm header includes checklist guidance
  2. Add gap analysis guidance — Explain how to use framework for identifying gaps rather than asking all questions
     - Validation: Review template file to confirm gap analysis guidance is present
- **Validation Plan:** Review updated template file against acceptance criteria

#### Task 4: Update clarification-packet-template.md Template
- **Objective:** Make template more flexible and less prescriptive
- **Impacted Modules/Files:**
  - `.devagent/core/templates/clarification-packet-template.md`
- **Dependencies:** None
  - Template includes guidance that sections can be removed if not applicable
  - Template emphasizes documenting answers as they come, not waiting for all dimensions
  - Template maintains structure but allows flexibility
- **Subtasks:**
  1. Add flexibility guidance — Include note that sections can be removed if not applicable
     - Validation: Review template file to confirm flexibility guidance is present
  2. Add incremental documentation guidance — Emphasize documenting answers as they come
     - Validation: Review template file to confirm incremental documentation guidance is present
- **Validation Plan:** Review updated template file against acceptance criteria

---

## Risks & Open Questions

| Item | Type (Risk / Question) | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| AI may skip important dimensions if context analysis misses something | Risk | Jake Ruesink | Add final completeness check instruction: "Before finishing, verify all 8 dimensions have been considered (even if marked as not applicable)" | 2025-12-30 |
| Context analysis may be incomplete | Risk | Jake Ruesink | Explicit instructions: "Read AGENTS.md, all files in research/, plan/, and clarification/ directories" | 2025-12-30 |
| Questions may become too generic without template guidance | Risk | Jake Ruesink | Provide examples of context-aware questions in workflow instructions | 2025-12-30 |
| How to handle features with no existing context? | Question | Jake Ruesink | Use templates as fallback, but still frame questions to feature type/name | 2025-12-30 |
| How to ensure completeness without rigid templates? | Question | Jake Ruesink | Final completeness check: "We've covered [list of dimensions]. Any other areas to discuss?" Use framework as checklist, not template | 2025-12-30 |

---

## Progress Tracking
Refer to the AGENTS.md file in the feature directory for instructions on tracking and reporting progress during implementation.

---

## Appendices & References

**Research:**
- `.devagent/workspace/features/active/2025-12-30_improve-interactive-workflows/research/2025-12-30_context-aware-questioning-patterns.md` (2025-12-30) — Patterns for context-aware questioning

**Clarification:**
- `.devagent/workspace/features/active/2025-12-30_improve-interactive-workflows/clarification/2025-12-30_initial-clarification.md` (2025-12-30) — Validated requirements

**Related Work:**
- `.devagent/workspace/features/completed/2025-12-14_interactive-brainstorm-clarify/` (2025-12-14) — Previous work on making workflows interactive

**Current Workflows:**
- `.devagent/core/workflows/clarify-feature.md` (2025-12-30) — Current workflow using 8-dimension framework
- `.devagent/core/workflows/brainstorm.md` (2025-12-30) — Current workflow using phase-based structure

**Templates:**
- `.devagent/core/templates/clarification-questions-framework.md` (2025-12-30) — Question framework (to be updated)
- `.devagent/core/templates/clarification-packet-template.md` (2025-12-30) — Clarification packet template (to be updated)

**Product Context:**
- `.devagent/workspace/product/mission.md` (2025-12-30) — DevAgent mission
- `.devagent/workspace/memory/constitution.md` (2025-12-30) — Constitution C3: Human-in-the-loop defaults
