# Redesign Clarify Workflow for Active Development Context Plan

- Owner: Jake Ruesink
- Last Updated: 2026-01-14
- Status: Draft
- Related Task Hub: `.devagent/workspace/tasks/completed/2026-01-14_redesign-clarify-workflow-active-development/`
- Stakeholders: Jake Ruesink (Owner, Decision Maker)
- Notes: Plan to redesign clarify workflow from template-driven to gap-driven approach, adapting to task context while maintaining completeness.

---

## PART 1: PRODUCT CONTEXT

### Summary
The clarify workflow is currently too regimented, systematically forcing all tasks through the same 8-dimension checklist regardless of context. This creates friction for active development work where certain questions (like timelines/deadlines) are irrelevant. This plan implements a gap-driven, context-aware approach that adapts question selection based on task context and existing documentation, while maintaining completeness through framework validation. The redesign maintains the existing multiple-choice question format and ensures ambiguity exhaustion, but shifts from template-driven to gap-driven questioning.

### Context & Problem
**Current State:**
- Workflow requires visiting all 8 dimensions systematically, regardless of context
- Timeline questions are frequently irrelevant for active development work (marked as "None" or "Not applicable")
- Framework intent (gap analysis) doesn't match implementation (systematic coverage)
- Context analysis exists but isn't fully leveraged - workflow still asks questions from all dimensions

**User Pain:**
- Users experience friction from irrelevant questions (e.g., timeline questions for active development)
- Workflow feels regimented rather than helpful
- Users skip or mark dimensions as "not applicable" rather than getting value from clarification

**Business Trigger:**
- DevAgent mission emphasizes "actively ongoing work" - workflow needs to adapt to this context
- Research shows workflow is template-driven rather than gap-driven, reducing helpfulness
- Brainstorm identified multiple solution approaches, with gap-driven + validation approach scoring highest

**Evidence:**
- Research: `.devagent/workspace/tasks/completed/2026-01-14_redesign-clarify-workflow-active-development/research/2026-01-14_clarify-workflow-flexibility-research.md`
- Clarification: `.devagent/workspace/tasks/completed/2026-01-14_redesign-clarify-workflow-active-development/clarification/2026-01-14_initial-clarification.md`
- Brainstorm: `.devagent/workspace/tasks/completed/2026-01-14_redesign-clarify-workflow-active-development/brainstorms/2026-01-14_flexible-clarify-workflow-approaches.md`

### Objectives & Success Metrics
**Product Objectives:**
- Workflow adapts question selection based on task context (active development vs. new feature planning)
- Workflow asks only relevant questions while maintaining completeness
- Users find the workflow more helpful and context-aware
- Workflow aligns with DevAgent mission (actively ongoing work, not future planning)

**Success Metrics:**
- **Baseline:** Current workflow is template-driven, asks irrelevant questions (e.g., timeline questions for active development)
- **Target:** Workflow is gap-driven and context-aware, asks only relevant questions while maintaining completeness
- **User Experience:** Users report fewer irrelevant questions, workflow feels more helpful
- **Completeness:** Workflow still exhausts ambiguity (all dimensions checked, even if with validation questions)

**Definition of "Good Enough":**
- Workflow adapts question selection based on task context
- Users report fewer irrelevant questions
- Workflow still exhausts ambiguity (no early exit)
- Framework used as guide/validation, not mandate

### Users & Insights
**Primary Users:**
- Developers using DevAgent clarify workflow
- AI agents executing the clarify workflow
- Downstream workflows (create-plan) that consume clarification outputs

**Key Insights:**
- Active development work has different clarification needs than new feature planning
- Timeline questions are frequently irrelevant for active development
- Users already adapt by skipping irrelevant sections, but workflow still enforces visiting all dimensions
- Framework is intended as completeness checklist, not question template

**Demand Signals:**
- Research shows timeline constraints frequently marked as "None" for active development tasks
- Multiple clarification packets show incomplete dimension coverage
- Framework documentation explicitly states it's a "completeness checklist, not a question template"

### Solution Principles
**Quality Bars:**
- **Gap-driven approach:** Analyze existing documentation first, then ask only questions that fill actual gaps
- **Context-aware:** Adapt question selection based on task type and context
- **Flexible:** Use framework as guide/validation, not mandate
- **Complete:** Still exhaust ambiguity across all dimensions (validation questions for low-relevance dimensions)

**Architecture Principles:**
- Maintain existing workflow structure (`.devagent/core/workflows/clarify-task.md`)
- Preserve question format (multiple-choice with letter labels A, B, C, D, E and "Other" option)
- Use framework as completeness checklist for validation, not inquiry template
- Format questions and answers with spacing for readability

**UX Principles:**
- Reduce friction by asking only relevant questions
- Maintain helpfulness through context-appropriate questioning
- Format questions and answers with spacing for easier reading

**Constitution Alignment:**
- **C1. Mission & Stakeholder Fidelity:** Workflow adapts to "actively ongoing work" context, advancing DevAgent mission
- **C3. Delivery Principles:** Maintains human-in-the-loop defaults, preserves traceable artifacts
- **C5. Evolution Without Backwards Compatibility:** Workflow evolves forward without maintaining backwards compatibility

### Scope Definition
**In Scope:**
- Update clarify workflow definition (`.devagent/core/workflows/clarify-task.md`) to implement gap-driven approach
- Update clarification questions framework documentation to clarify it's a completeness checklist, not a question template
- Update clarification packet template if needed to support new approach
- Remove requirement to visit all 8 dimensions systematically
- Implement gap-driven questioning with framework validation
- Ensure questions and answers are formatted with spacing for readability

**Out of Scope / Future:**
- Changing the multiple-choice question format (must maintain current format)
- Changing other workflows (this is only about the clarify workflow)
- Removing the 8-dimension framework entirely (dimensions can be used as a guide but not a mandate)
- Testing with sample tasks (should-have, not must-have for launch)

### Functional Narrative
**Flow: Gap-Driven Clarification Session**

**Trigger:**
- User invokes `devagent clarify-task` with task concept
- Workflow receives task hub path and existing documentation

**Experience Narrative:**
1. **Context Analysis Phase:**
   - Workflow analyzes task hub (AGENTS.md, research, plans, specs) to understand what's already documented
   - Compares existing documentation against 8-dimension framework to identify gaps
   - Prioritizes gaps (focus on critical gaps that block downstream work)
   - Classifies gaps (clarifiable vs. researchable)

2. **Gap-Driven Inquiry Phase:**
   - Workflow asks 2-3 targeted multiple-choice questions per turn that fill identified gaps
   - Questions are context-specific and reference existing documentation
   - Questions use multiple-choice format with letter labels (A, B, C, D, E) and "Other" option
   - Questions and answers are formatted with spacing for readability
   - After each response, workflow updates clarification document and saves to disk
   - Continues until all critical gaps are filled

3. **Framework Validation Phase:**
   - After gap-driven questions complete, workflow uses framework as completeness checklist
   - Systematically checks each dimension for remaining ambiguities
   - For dimensions not covered in gap-driven phase, asks validation multiple-choice questions (e.g., "Any [dimension] considerations? A. None, B. Yes - [describe], Other: [free-form]")
   - Continues until all dimensions validated and no ambiguities remain

4. **Completion:**
   - Workflow generates final clarification packet
   - All dimensions have been considered (even if marked as not applicable)
   - All tracked questions have status labels
   - Packet is ready for downstream workflows (create-plan)

**Acceptance Criteria:**
- Workflow adapts question selection based on task context
- Workflow asks only relevant questions (gap-driven) while maintaining completeness (framework validation)
- Questions use multiple-choice format with letter labels and "Other" option
- Questions and answers are formatted with spacing for readability
- Workflow still exhausts ambiguity (all dimensions checked)
- Framework used as guide/validation, not mandate

### Technical Notes & Dependencies
**Data Needs:**
- Task hub structure (AGENTS.md, research/, plan/, clarification/)
- Existing documentation content to analyze for gaps
- 8-dimension framework for gap analysis and validation

**Integrations:**
- Workflow reads from task hub structure
- Workflow writes clarification packets to task hub
- Downstream workflow (create-plan) consumes clarification packets

**Dependencies:**
- None - this is a self-contained workflow redesign
- Decision needed: Which brainstorm candidate to implement (recommend gap-driven + validation approach)

**Platform-Specific Impacts:**
- None - workflow is tool-agnostic (per C4)

---

## PART 2: IMPLEMENTATION PLAN

### Scope & Assumptions
- **Scope focus:** Redesign clarify workflow to be gap-driven and context-aware
- **Key assumptions:**
  - Context analysis can reliably identify gaps
  - Framework validation catches all remaining ambiguities
  - Gap-driven approach doesn't add unnecessary complexity
  - Users understand gap-driven questioning approach
- **Out of scope:** Changing question format, changing other workflows, removing framework entirely

### Implementation Tasks

#### Task 1: Update Clarify Workflow Definition to Implement Gap-Driven Approach
- **Objective:** Modify `.devagent/core/workflows/clarify-task.md` to implement gap-driven questioning with framework validation, removing requirement to visit all 8 dimensions systematically
- **Impacted Modules/Files:**
  - `.devagent/core/workflows/clarify-task.md` (primary file to modify)
- **References:**
  - Research: `.devagent/workspace/tasks/completed/2026-01-14_redesign-clarify-workflow-active-development/research/2026-01-14_clarify-workflow-flexibility-research.md`
  - Clarification: `.devagent/workspace/tasks/completed/2026-01-14_redesign-clarify-workflow-active-development/clarification/2026-01-14_initial-clarification.md`
  - Brainstorm: `.devagent/workspace/tasks/completed/2026-01-14_redesign-clarify-workflow-active-development/brainstorms/2026-01-14_flexible-clarify-workflow-approaches.md`
  - Current workflow: `.devagent/core/workflows/clarify-task.md`
- **Dependencies:** None
- **Acceptance Criteria:**
  - Workflow definition implements gap-driven approach (analyze context, identify gaps, ask targeted questions)
  - Workflow includes framework validation phase (use framework as completeness checklist after gap-driven questions)
  - Requirement to visit all 8 dimensions systematically is removed
  - Workflow maintains multiple-choice question format with letter labels and "Other" option
  - Workflow ensures questions and answers are formatted with spacing for readability
  - Workflow still exhausts ambiguity (all dimensions checked, even if with validation questions)
  - Framework used as guide/validation, not mandate
- **Testing Criteria:**
  - Review workflow definition for gap-driven approach implementation
  - Verify framework validation phase is clearly defined
  - Confirm requirement to visit all dimensions systematically is removed
  - Verify question format requirements are maintained
  - Verify readability formatting requirements are included
- **Subtasks:**
  1. **Update Context Analysis & Gap Identification section** — Enhance to emphasize gap identification and prioritization
     - Validation: Review section ensures gaps are identified before questioning
  2. **Update Gap-Driven Inquiry section** — Modify to emphasize targeted questioning based on identified gaps
     - Validation: Review section ensures questions are gap-driven, not template-driven
  3. **Add Framework Validation Phase** — Add new phase after gap-driven inquiry that uses framework as completeness checklist
     - Validation: Review section ensures framework validation phase is clearly defined
  4. **Update Completion Gate** — Modify to remove requirement to visit all 8 dimensions, instead require all dimensions to be considered (via gap-driven or validation)
     - Validation: Review section ensures completion gate reflects gap-driven approach
  5. **Update Q&A Formatting section** — Ensure spacing requirements for readability are included
     - Validation: Review section includes formatting requirements for spacing
- **Validation Plan:**
  - Review updated workflow definition against acceptance criteria
  - Verify alignment with research findings and clarification requirements
  - Check that all constraints are maintained (question format, completeness, readability)

#### Task 2: Update Clarification Questions Framework Documentation
- **Objective:** Update `.devagent/core/templates/clarification-questions-framework.md` to clarify it's a completeness checklist for gap analysis and validation, not a question template
- **Impacted Modules/Files:**
  - `.devagent/core/templates/clarification-questions-framework.md` (primary file to modify)
- **References:**
  - Current framework: `.devagent/core/templates/clarification-questions-framework.md`
  - Research findings on framework intent vs. implementation mismatch
- **Dependencies:** None (can be done in parallel with Task 1)
- **Acceptance Criteria:**
  - Framework documentation clearly states it's a completeness checklist, not a question template
  - Documentation emphasizes using framework for gap analysis and validation
  - Documentation clarifies dimensions can be used as a guide but not a mandate
  - Framework structure and content remain intact (only documentation/clarification changes)
- **Testing Criteria:**
  - Review framework documentation for clarity on gap analysis usage
  - Verify framework structure and content are preserved
  - Confirm documentation aligns with gap-driven approach
- **Subtasks:**
  1. **Update "How to Use This Framework" section** — Strengthen language about gap analysis vs. template usage
     - Validation: Review section clearly distinguishes gap analysis from template usage
  2. **Add explicit note about "guide not mandate"** — Clarify that dimensions are guides, not mandates
     - Validation: Review section includes "guide not mandate" language
  3. **Update dimension descriptions** — Ensure each dimension section emphasizes gap analysis usage
     - Validation: Review dimension sections for gap analysis emphasis
- **Validation Plan:**
  - Review updated framework documentation for clarity
  - Verify alignment with gap-driven approach
  - Check that framework structure is preserved

#### Task 3: Update Clarification Packet Template (If Needed)
- **Objective:** Review and update `.devagent/core/templates/clarification-packet-template.md` if needed to support gap-driven approach and readability formatting
- **Impacted Modules/Files:**
  - `.devagent/core/templates/clarification-packet-template.md` (may need updates)
- **References:**
  - Current template: `.devagent/core/templates/clarification-packet-template.md`
  - Clarification requirements for readability formatting
- **Dependencies:** None (can be done in parallel with Tasks 1-2)
- **Acceptance Criteria:**
  - Template supports gap-driven approach (if structural changes needed)
  - Template includes guidance on readable formatting (spacing for questions and answers)
  - Template structure remains compatible with existing clarification packets
  - Template is flexible (remove sections not applicable)
- **Testing Criteria:**
  - Review template for gap-driven approach support
  - Verify readability formatting guidance is included
  - Confirm template compatibility with existing packets
- **Subtasks:**
  1. **Review template structure** — Assess if template needs updates for gap-driven approach
     - Validation: Review determines if updates are needed
  2. **Add readability formatting guidance** — Include guidance on spacing questions and answers
     - Validation: Review section includes formatting guidance
  3. **Update template notes** — Ensure template notes reflect gap-driven approach
     - Validation: Review template notes for gap-driven alignment
- **Validation Plan:**
  - Review updated template (if changes made)
  - Verify readability formatting guidance is clear
  - Check template compatibility with existing packets

### Implementation Guidance

**From `.devagent/core/AGENTS.md` → Standard Workflow Instructions:**
- Date handling: When creating dated documents, always run `date +%Y-%m-%d` first to get current date in ISO format
- Metadata retrieval: To determine owner/author for metadata, run `git config user.name`
- Context gathering order: Review in order: (1) Internal agent documentation, (2) Workflow definitions, (3) Rules & conventions, (4) DevAgent workspace, (5) Fallback: README.* or docs/**
- Standard guardrails: Prefer authoritative sources, never expose secrets, tag uncertainties with `[NEEDS CLARIFICATION: ...]`, cite file paths with anchors
- Storage patterns: Dated artifacts use `YYYY-MM-DD_<descriptor>.md` format, task-scoped artifacts go in `.devagent/workspace/tasks/{status}/YYYY-MM-DD_task-slug/`

**From `.devagent/core/workflows/clarify-task.md` → Question Format Requirements:**
- Use multiple-choice format with letter labels (A, B, C, D, E)
- Include "All of the above" option when all answers are valid
- "Other" option doesn't need a letter label - it's just a prompt for custom answers
- Format questions and answers in chat for maximum readability:
  - Questions: Use **bold** for the question number and text
  - Answer options: Indent answer choices with 2 spaces, use bold for letter labels
  - Answer acknowledgment: Briefly restate the question in bold and the answer below it with indentation
  - Use consistent indentation (2 spaces) throughout to create visual hierarchy
  - **Spacing:** Questions and answers should be spread out for easier readability

**From `.devagent/workspace/memory/constitution.md` → C5. Evolution Without Backwards Compatibility:**
- Backwards compatible workflows add too much cruft—avoid compatibility shims, aliases, or dual naming
- When a workflow is superseded or a template is revised, remove it entirely
- Update all documentation and roster references to the new approach
- Teams adopting DevAgent should expect to adapt their local copies when pulling updates

**From Research Findings:**
- Gap-driven approach: Analyze existing documentation first, then ask only questions that fill actual gaps
- Framework as validation: Use framework as completeness checklist after gap-driven questioning, not as inquiry template
- Context-aware: Adapt question selection based on task type and context
- Maintain completeness: Still exhaust ambiguity across all dimensions (validation questions for low-relevance dimensions)

### Risks & Open Questions

| Item | Type | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Gap identification may miss subtle ambiguities | Risk | Workflow implementer | Framework validation phase catches missed ambiguities | TBD |
| Two-phase structure may feel artificial | Risk | Workflow implementer | Clear phase transitions and communication in workflow definition | TBD |
| Users may not understand gap-driven approach | Risk | Workflow implementer | Clear documentation and examples in workflow definition | TBD |
| Which specific gap-driven approach to implement? | Question | Jake Ruesink | Review brainstorm candidates, recommend gap-driven + validation approach | TBD |
| How to structure framework validation phase? | Question | Workflow implementer | Define clear validation phase structure in workflow definition | TBD |

---

## Progress Tracking
Refer to the AGENTS.md file in the task directory for instructions on tracking and reporting progress during implementation.

---

## Appendices & References

### Agent Documentation
- `AGENTS.md` (root): `.devagent/workspace/tasks/completed/2026-01-14_redesign-clarify-workflow-active-development/AGENTS.md`
- `.devagent/core/AGENTS.md`: Standard workflow instructions, context gathering order, storage patterns

### Research & Clarification Artifacts
- Research: `.devagent/workspace/tasks/completed/2026-01-14_redesign-clarify-workflow-active-development/research/2026-01-14_clarify-workflow-flexibility-research.md`
- Clarification: `.devagent/workspace/tasks/completed/2026-01-14_redesign-clarify-workflow-active-development/clarification/2026-01-14_initial-clarification.md`
- Brainstorm: `.devagent/workspace/tasks/completed/2026-01-14_redesign-clarify-workflow-active-development/brainstorms/2026-01-14_flexible-clarify-workflow-approaches.md`

### Workflow & Template Files
- Current workflow: `.devagent/core/workflows/clarify-task.md`
- Framework template: `.devagent/core/templates/clarification-questions-framework.md`
- Packet template: `.devagent/core/templates/clarification-packet-template.md`
- Plan template: `.devagent/core/templates/plan-document-template.md`

### Product Context
- Mission: `.devagent/workspace/product/mission.md`
- Constitution: `.devagent/workspace/memory/constitution.md`

### Related Clauses
- **C1:** Mission & Stakeholder Fidelity - Workflow adapts to "actively ongoing work" context
- **C3:** Delivery Principles - Maintains human-in-the-loop defaults, preserves traceable artifacts
- **C5:** Evolution Without Backwards Compatibility - Workflow evolves forward without backwards compatibility
