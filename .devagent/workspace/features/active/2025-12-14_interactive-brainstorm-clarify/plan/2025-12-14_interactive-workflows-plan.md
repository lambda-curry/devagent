# Interactive Brainstorm and Clarify Workflows Plan

- Owner: Jake Ruesink
- Last Updated: 2025-12-14
- Status: Draft
- Related Feature Hub: `.devagent/workspace/features/active/2025-12-14_interactive-brainstorm-clarify/`
- Stakeholders: Jake Ruesink (Owner, Decision Maker)
- Notes: This plan focuses on prompt engineering modifications to workflow files, not code implementation.

---

## PART 1: PRODUCT CONTEXT

### Summary
Transform `devagent brainstorm` and `devagent clarify-feature` workflows to use interactive, question-driven conversations as their default behavior. Instead of creating complete output files immediately, these workflows will engage users through incremental questions (2-3 at a time) that progressively build toward complete documents, reducing cognitive overload while maintaining comprehensive coverage. This change aligns with DevAgent's mission to make AI workflows more accessible and aligns with Constitution C3's "human-in-the-loop defaults" principle.

### Context & Problem
Currently, `devagent brainstorm` and `devagent clarify-feature` workflows execute immediately and generate complete output files. While this is efficient, it can overwhelm users who may not have all answers ready or may benefit from thinking through questions incrementally. Users have expressed a need for more interactive, conversational experiences that help them think about their features or brainstorm topics from different angles progressively.

**Current State:**
- Workflows generate complete files immediately upon invocation
- Users must provide all context upfront or accept incomplete outputs
- No mechanism for incremental question-answering
- Cognitive overload when facing many questions at once

**User Pain:**
- Users feel overwhelmed when workflows generate large files immediately
- Difficult to think through complex features or brainstorm topics without structured guidance
- Missing answers or incomplete thinking leads to lower-quality outputs
- No way to mark questions as "not important" or "don't know" without blocking progress

**Business Trigger:**
This enhancement directly supports DevAgent's mission to make AI workflows more accessible and user-friendly. It addresses the "open-ended and ad hoc" problem mentioned in the product mission by providing structured, guided interactions that help users think more clearly about their work.

**Research Foundation:**
See `research/2025-12-14_interactive-workflow-patterns.md` for detailed findings on prompt engineering patterns, question sequencing strategies, and progressive disclosure approaches.

### Objectives & Success Metrics

**Product Objectives:**
1. Users can engage with brainstorm and clarify workflows through incremental questions (2-3 at a time)
2. Workflows maintain same completeness standards as file-based approach
3. Users can mark questions as "open" when they don't know or when questions aren't important
4. Final documents are generated only after all questions are answered or marked as open

**Success Metrics:**
- **Completeness:** Workflows produce documents with equivalent completeness to previous approach
- **User Satisfaction:** Users report feeling less overwhelmed and more thoughtful in their responses
- **Quality:** Documents maintain same quality standards as previous outputs
- **Engagement:** Users complete clarification/brainstorm sessions more successfully

**Baseline:** Current workflows generate files immediately; no interactive behavior exists.

**Target:** Workflows use interactive conversation as default behavior, producing high-quality documents through incremental question-answering.

### Users & Insights

**Primary Users:**
- Engineering managers and developers using DevAgent workflows
- Users working on complex features requiring structured thinking
- Teams with varying levels of AI proficiency who benefit from guided interactions

**Key Insights:**
- Users want to think through questions incrementally rather than all at once
- Progressive disclosure reduces cognitive overload (2-3 questions optimal)
- Users need flexibility to skip or mark questions as "open" for later resolution
- Conversation-based interactions feel more natural than immediate file generation

**Demand Signals:**
- Direct user request for more interactive brainstorm and clarify experiences
- Research shows progressive disclosure improves user engagement and completion rates
- Constitution C3 emphasizes "human-in-the-loop defaults" — interactive conversations align with this principle

### Solution Principles

**Guiding Principles:**
1. **Prompt Engineering Only:** This is purely a prompt engineering challenge. No code changes, no interfaces, no state management systems. Only modifications to workflow markdown files.
2. **Progressive Disclosure:** Ask 2-3 questions at a time, grouped by dimension/phase, to prevent overwhelm
3. **Explicit Progress Tracking:** Clearly show which dimensions/phases are complete using checkmarks and progress indicators
4. **Open Question Handling:** Allow users to mark questions as "open" when they don't know or when questions aren't important; these can be resolved by the person executing or by the AI agent
5. **Same Output Quality:** Interactive sessions must produce documents with equivalent completeness and quality to file-based approach
6. **Template Alignment:** Final documents use the same templates as file-based workflows
7. **Conversation Flow:** Structure prompts to guide AI through: Start → Ask batch → Wait → Next batch → Finalize when complete

**Non-Negotiables:**
- Must use interactive conversation as the only mode (no file-based alternative)
- Must preserve all existing workflow functionality (same outputs, same templates)
- Must use existing templates for final document generation
- Must align with Constitution C3: Human-in-the-loop defaults

### Scope Definition

**In Scope:**
- Modify `brainstorm.md` and `clarify-feature.md` workflow files to use interactive conversation as default behavior
- Update workflow prompts to guide AI to ask questions incrementally (2-3 at a time)
- Add question sequencing instructions (grouped by dimension/phase)
- Add progress tracking instructions (explicit checkmarks and status indicators)
- Add open question handling (mark as "open" when user doesn't know or says it's not important)
- Add completion validation instructions (verify all dimensions/phases covered before generating document)
- Update document generation instructions (build incrementally, finalize when complete)

**Out of Scope / Future:**
- Code implementation or state management systems
- UI/UX changes or interfaces
- Session persistence or resume functionality
- File-based alternative mode (interactive is the only mode)
- Custom question frameworks (use existing frameworks)

### Functional Narrative

#### Flow: Clarify-Feature Workflow

**Trigger:** User invokes `devagent clarify-feature` with feature concept

**Experience Narrative:**
1. AI introduces conversation: "I'll help you clarify this feature through a conversation. Let's start with a few questions."
2. AI asks 2-3 questions from Problem Validation dimension, waits for answers
3. AI tracks progress: "We've covered Problem Validation ✅. Now let's discuss Users & Stakeholders."
4. AI asks 2-3 questions from Users & Stakeholders dimension, waits for answers
5. Process continues through all 8 dimensions (Problem → Users → Success → Scope → Constraints → Principles → Dependencies → Acceptance)
6. If user says "I don't know" or "not important", AI marks question as "open" and continues
7. After all dimensions covered (including open questions), AI generates complete clarification packet using template
8. Final document includes open questions marked for later resolution by person executing or AI agent

**Acceptance Criteria:**
- AI asks exactly 2-3 questions per batch (not 1, not 5)
- AI waits for user answers before proceeding to next batch
- AI explicitly tracks progress with checkmarks (✅) and status indicators
- AI handles "open" questions gracefully (marks and continues)
- Final document uses clarification packet template
- Final document includes all answered questions and open questions clearly marked

#### Flow: Brainstorm Workflow

**Trigger:** User invokes `devagent brainstorm` with topic or problem statement

**Experience Narrative:**
1. AI introduces conversation: "Let's brainstorm together. First, tell me about the problem or opportunity you're exploring."
2. AI asks about problem statement and mode selection, waits for answers
3. AI asks 1-2 ideation prompts, waits for responses: "Now let's generate some ideas. I'll help you think through this from different angles."
4. AI tracks progress: "We've generated ideas ✅, now clustering them..."
5. AI asks for feedback on ideas before moving to clustering phase
6. Process continues through all phases (Problem → Ideas → Clustering → Evaluation → Prioritization)
7. If user says "I don't know" or "not important", AI marks item as "open" and continues
8. After all phases complete (including open items), AI generates complete brainstorm packet using template
9. Final document includes open items marked for later resolution

**Acceptance Criteria:**
- AI generates ideas incrementally (5-10 at a time, not all at once)
- AI waits for user feedback before moving to next phase
- AI explicitly tracks progress through phases with status indicators
- AI handles "open" items gracefully (marks and continues)
- Final document uses brainstorm packet template
- Final document includes all completed phases and open items clearly marked

### Technical Notes & Dependencies

**Implementation Approach:**
- Pure prompt engineering: Modify workflow markdown files only
- No code changes, no new systems, no state management
- Workflows remain conversation prompts that guide AI behavior

**Dependencies:**
- Existing workflow files: `.devagent/core/workflows/brainstorm.md` and `.devagent/core/workflows/clarify-feature.md`
- Existing templates: `brainstorm-packet-template.md` and `clarification-packet-template.md`
- Existing question framework: `clarification-questions-framework.md`

**Constraints:**
- Must preserve all existing functionality (same outputs, same templates)
- Must use existing templates for document generation
- Interactive conversation is the only mode (no alternatives)

---

## PART 2: IMPLEMENTATION PLAN

### Scope & Assumptions

**Scope Focus:** Prompt engineering modifications to two workflow files (`brainstorm.md` and `clarify-feature.md`) to make interactive conversation the default behavior.

**Key Assumptions:**
- AI will follow explicit prompt instructions for question batching (2-3 questions)
- Users will engage in conversation format (answering questions incrementally)
- Existing templates and question frameworks remain unchanged
- Backward compatibility maintained (existing file-based behavior still works)

**Out of Scope:**
- Code implementation
- State management systems
- UI/UX changes
- Session persistence
- File-based alternative mode

### Implementation Tasks

#### Task 1: Update Clarify-Feature Workflow for Interactive Conversation

- **Objective:** Modify `.devagent/core/workflows/clarify-feature.md` to use interactive conversation as the default behavior, with prompt instructions for incremental question-asking, progress tracking, and open question handling.

- **Impacted Modules/Files:** 
  - `.devagent/core/workflows/clarify-feature.md`

- **Dependencies:** None

- **Acceptance Criteria:**
  - Workflow updated to use interactive conversation as default behavior
  - Workflow includes instructions for asking 2-3 questions per batch
  - Workflow includes progress tracking instructions (checkmarks, status indicators)
  - Workflow includes open question handling instructions
  - Workflow includes completion validation instructions
  - Workflow includes document generation instructions (build incrementally, finalize when complete)
  - Workflow references existing 8-dimension question framework
  - All existing workflow functionality preserved (same outputs, same templates)

- **Subtasks:**
  1. **Update Workflow Execution Directive** — Modify execution directive to emphasize interactive conversation approach
     - Validation: Execution directive clearly describes interactive conversation behavior
  2. **Add Conversation Flow Instructions** — Include step-by-step conversation pattern in workflow (Start → Ask batch → Wait → Update tracking → Next batch → Finalize)
     - Validation: Instructions clearly describe conversation flow with tracking updates
  3. **Add Question Tracking Instructions** — Instructions: "Maintain a running list of all questions from the framework, marking each with status labels: ✅ answered, ⏳ in progress, ❓ unknown (user doesn't know), 🚫 not applicable (doesn't apply to this context), ⏭️ deferred (address later), 🔍 needs research (requires evidence - route to devagent research), ⚠️ not important (user decided not relevant), 🚧 blocked (can't answer due to dependencies). Update this list after each answer."
     - Validation: Instructions include question tracking with specific status labels
  4. **Add Question Batching Instructions** — Explicit instructions: "Ask exactly 2-3 questions at a time. Count them. Do not ask more than 3. After each answer, update your question list and identify the next 2-3 questions to ask."
     - Validation: Instructions explicitly state 2-3 question limit and update requirement
  5. **Add Progress Tracking Instructions** — Instructions for showing progress: "Track which dimensions are complete: [list with checkmarks and question counts]. Show progress: 'We've answered questions 1-3 of Problem Validation ✅. Next, I'll ask questions 4-6.'"
     - Validation: Instructions include checkmark format, question counts, and progress statements
  6. **Add Question Status Handling** — Instructions: "If the user says they don't know, mark as ❓ unknown. If they say it needs research, mark as 🔍 needs research. If they say it's not important, mark as ⚠️ not important. If it doesn't apply, mark as 🚫 not applicable. Questions marked as ❓ unknown can be resolved by the person executing or by the AI agent. Questions marked as 🔍 needs research should be routed to devagent research. Questions marked as ⚠️ not important are explicitly out of scope."
     - Validation: Instructions clearly describe different question status labels and their handling
  7. **Add Completion Validation** — Instructions: "Before generating final document, check your question list: verify all questions have a status label (answered, unknown, needs research, not important, not applicable, deferred, or blocked). Questions marked as 🔍 needs research should be routed to devagent research. Only generate the document when all questions have a status."
     - Validation: Instructions include completion checklist with all status labels and routing guidance
  8. **Add Document Generation Instructions** — Instructions: "Build document incrementally as questions are answered. Don't write the document yet, but keep track of what sections are filling in based on your question tracking. When all questions have status labels, generate the complete document using the clarification packet template. In the document, clearly mark questions by status: unknown ❓ (can be resolved by person executing or AI agent), needs research 🔍 (route to devagent research), not important ⚠️ (explicitly out of scope)."
     - Validation: Instructions describe incremental building using question tracking, final generation, and status-based routing

- **Validation Plan:** 
  - Review workflow file to ensure interactive conversation is the default behavior
  - Verify all instructions are present and clear
  - Verify existing workflow functionality preserved (same outputs, same templates)
  - Test that workflow file is valid markdown

#### Task 2: Update Brainstorm Workflow for Interactive Conversation

- **Objective:** Modify `.devagent/core/workflows/brainstorm.md` to use interactive conversation as the default behavior, with prompt instructions for incremental idea generation, phase-based progression, and open item handling.

- **Impacted Modules/Files:**
  - `.devagent/core/workflows/brainstorm.md`

- **Dependencies:** None

- **Acceptance Criteria:**
  - Workflow updated to use interactive conversation as default behavior
  - Workflow includes instructions for generating ideas incrementally (5-10 at a time)
  - Workflow includes phase-based progression instructions (Problem → Ideas → Clustering → Evaluation → Prioritization)
  - Workflow includes progress tracking instructions
  - Workflow includes open item handling instructions
  - Workflow includes completion validation instructions
  - Workflow includes document generation instructions
  - All existing workflow functionality preserved (same outputs, same templates)

- **Subtasks:**
  1. **Update Workflow Execution Directive** — Modify execution directive to emphasize interactive conversation approach
     - Validation: Execution directive clearly describes interactive conversation behavior
  2. **Add Conversation Flow Instructions** — Include step-by-step conversation pattern in workflow for brainstorm phases (Start → Generate batch → Wait → Update tracking → Next phase)
     - Validation: Instructions clearly describe phase-based conversation flow
  3. **Add Phase Tracking Instructions** — Instructions: "Maintain a running list of all phases and their status: Problem Statement (✅ complete), Ideas Generation (⏳ in progress, 8/15 ideas generated), Clustering (⏭️ pending), etc. Update this tracking after each interaction."
     - Validation: Instructions include phase tracking with status markers and progress counts
  4. **Add Incremental Idea Generation Instructions** — Instructions: "Generate ideas incrementally, 5-10 at a time, not all at once. After each batch, update your phase tracking. Wait for user feedback before moving to the next phase."
     - Validation: Instructions explicitly state incremental generation, tracking update, and wait requirement
  5. **Add Phase Progression Instructions** — Instructions: "Track progress through phases: Problem → Ideas → Clustering → Evaluation → Prioritization. Show progress explicitly: 'We've generated 8 ideas so far. Let's generate 5-7 more before moving to clustering.'"
     - Validation: Instructions include phase sequence, progress counts, and explicit progress statements
  6. **Add Item Status Handling** — Instructions: "If the user says they don't know, mark as ❓ unknown. If they say it needs research, mark as 🔍 needs research. If they say it's not important, mark as ⚠️ not important. If it doesn't apply, mark as 🚫 not applicable. Items marked as ❓ unknown can be resolved by the person executing or by the AI agent. Items marked as 🔍 needs research should be routed to devagent research. Items marked as ⚠️ not important are explicitly out of scope."
     - Validation: Instructions clearly describe different item status labels and their handling
  7. **Add Completion Validation** — Instructions: "Before generating final document, check your phase tracking: verify all phases have items with status labels (complete, unknown, needs research, not important, not applicable, deferred, or blocked). Items marked as 🔍 needs research should be routed to devagent research. Only generate the document when all phases have status labels."
     - Validation: Instructions include completion checklist with all status labels and routing guidance
  8. **Add Document Generation Instructions** — Instructions: "Build document incrementally as phases complete. Track progress using your phase tracking. When all phases have items with status labels, generate the complete document using the brainstorm packet template. In the document, clearly mark items by status: unknown ❓ (can be resolved by person executing or AI agent), needs research 🔍 (route to devagent research), not important ⚠️ (explicitly out of scope)."
     - Validation: Instructions describe incremental building using phase tracking, final generation, and status-based routing

- **Validation Plan:**
  - Review workflow file to ensure interactive conversation is the default behavior
  - Verify all instructions are present and clear
  - Verify existing workflow functionality preserved (same outputs, same templates)
  - Test that workflow file is valid markdown

#### Task 3: Update Feature Hub and Documentation

- **Objective:** Update feature hub AGENTS.md to reflect plan completion and add reference to plan document.

- **Impacted Modules/Files:**
  - `.devagent/workspace/features/active/2025-12-14_interactive-brainstorm-clarify/AGENTS.md`

- **Dependencies:** Tasks 1 and 2 complete

- **Acceptance Criteria:**
  - Progress log updated with plan creation entry
  - Implementation checklist updated to reflect plan tasks
  - Plan document referenced in References section
  - Last Updated date updated

- **Subtasks:**
  1. **Update Progress Log** — Add entry: "[2025-12-14] Event: Plan created. Implementation plan ready for execution. See `plan/2025-12-14_interactive-workflows-plan.md`."
     - Validation: Entry added to progress log
  2. **Update Implementation Checklist** — Mark planning tasks as complete, add implementation tasks from plan
     - Validation: Checklist reflects current state
  3. **Add Plan Reference** — Add plan document to References section
     - Validation: Reference link is correct

- **Validation Plan:**
  - Verify AGENTS.md file is updated correctly
  - Check that all references are valid

---

## Risks & Open Questions

| Item | Type (Risk / Question) | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| AI may not follow explicit question batching instructions (ask 1 or 5 instead of 2-3) | Risk | Jake Ruesink | Use very explicit instructions: "Ask exactly 2-3 questions. Count them. Do not ask more than 3." Test with real conversations and refine if needed. | Ongoing |
| AI may generate documents too early (before all questions answered) | Risk | Jake Ruesink | Explicit instruction: "Do not generate the document until explicitly told to do so or until all dimensions/phases are complete." Include completion checklist in prompts. | Ongoing |
| Context loss across conversation turns | Risk | Jake Ruesink | Explicit question tracking in prompts: "Maintain a running list of all questions, marking each with status labels: ✅ answered, ⏳ in progress, ❓ unknown, 🚫 not applicable, ⏭️ deferred, 🔍 needs research, ⚠️ not important, 🚧 blocked. Update this list after each answer." Also include explicit progress tracking: "Remember we've covered: [list]. Now ask about [next topic]." | Ongoing |
| Users may not understand how to use interactive conversation | Question | Jake Ruesink | Test with real users, gather feedback, refine prompt instructions based on usage patterns. Document usage patterns after testing. | After implementation |
| How to ensure AI asks exactly 2-3 questions consistently? | Question | Jake Ruesink | Use explicit counting instructions and test with real conversations. Refine prompts based on results. | During implementation |
| How to maintain question context throughout conversation? | Question | Jake Ruesink | Use explicit question tracking instructions: maintain running list of all questions with status markers (✅ answered, ⏳ in progress, ❓ unknown, 🚫 not applicable, ⏭️ deferred, 🔍 needs research, ⚠️ not important, 🚧 blocked). Update list after each answer. Show progress explicitly with question counts and status labels. Route questions marked as 🔍 needs research to devagent research. | During implementation |

---

## Progress Tracking

Refer to the AGENTS.md file in the feature directory for instructions on tracking and reporting progress during implementation.

---

## Appendices & References

**Research:**
- `research/2025-12-14_interactive-workflow-patterns.md` — Prompt engineering research findings

**Workflow Files:**
- `.devagent/core/workflows/brainstorm.md` — Current brainstorm workflow (to be modified)
- `.devagent/core/workflows/clarify-feature.md` — Current clarify-feature workflow (to be modified)

**Templates:**
- `.devagent/core/templates/brainstorm-packet-template.md` — Brainstorm output template
- `.devagent/core/templates/clarification-packet-template.md` — Clarification output template
- `.devagent/core/templates/clarification-questions-framework.md` — Question framework for clarify-feature

**Product Context:**
- `.devagent/workspace/product/mission.md` — DevAgent product mission
- `.devagent/workspace/memory/constitution.md` — Constitution C3: Human-in-the-loop defaults
