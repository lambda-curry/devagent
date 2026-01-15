# Brainstorm Packet — Flexible Clarify Workflow Approaches

- Mode: targeted
- Session Date: 2026-01-14
- Participants: Solo (Jake Ruesink)
- Storage Path: `.devagent/workspace/tasks/active/2026-01-14_redesign-clarify-workflow-active-development/brainstorms/2026-01-14_flexible-clarify-workflow-approaches.md`
- Related Artifacts: 
  - Research: `.devagent/workspace/tasks/active/2026-01-14_redesign-clarify-workflow-active-development/research/2026-01-14_clarify-workflow-flexibility-research.md`
  - Task hub: `.devagent/workspace/tasks/active/2026-01-14_redesign-clarify-workflow-active-development/`
  - Mission: `.devagent/workspace/product/mission.md`
  - Constitution: `.devagent/workspace/memory/constitution.md`

## Problem Statement

The clarify workflow is currently too regimented, systematically forcing all tasks through the same 8-dimension checklist regardless of context. This creates friction for active development work where certain questions (like timelines/deadlines) are irrelevant since DevAgent is designed for work that's actively being done, not future planning. Research has identified that:

- The workflow is template-driven rather than gap-driven
- Timeline questions are frequently irrelevant for active development
- Framework intent (gap analysis) doesn't match implementation (systematic coverage)
- Context analysis exists but isn't fully leveraged

**Brainstorm Mode:** **Targeted** — Generate solutions for redesigning the clarify workflow to be gap-driven, context-aware, and flexible while maintaining completeness. Solutions must address specific constraints and requirements identified in research.

**Known Constraints:**
- Technical: Must work within existing workflow structure (`.devagent/core/workflows/clarify-task.md`), maintain compatibility with clarification packet template
- Strategic: Must align with DevAgent mission (actively ongoing work, not future planning), respect constitution principles (C1: Mission fidelity, C3: Human-in-the-loop defaults)
- Functional: Must maintain completeness (critical dimensions covered), preserve traceability, support downstream workflows (create-plan)
- User Experience: Must reduce friction, ask only relevant questions, adapt to task context
- **Important Note:** Clarify sessions should NOT end early - the point is to exhaust any ambiguity from the agent's perspective. The workflow should continue until all relevant ambiguities are resolved, even if that means asking about dimensions that might seem less critical.
- **Question Format:** Must maintain current question format: multiple-choice questions with letter labels (A, B, C, D, E), optional "All of the above" when applicable, and "Other" option for free-form responses. Users can select guided responses or provide additional context/different direction. The redesign focuses on which questions to ask and when, not changing the question format itself.

## Ideas (Divergent Phase)

_Generating ideas using multiple techniques: constraint-based, gap-driven approaches, context-aware patterns, adaptive questioning strategies._

### REFINED IDEAS

1. **Mandatory Context Analysis with Gap Scoring** — Require comprehensive context analysis before any questions. Score each dimension's relevance (0-5) based on task type, existing documentation, and context. Ask questions for all dimensions with relevance score > 0, but prioritize high-scoring dimensions first. For dimensions with score = 0, mark as "not applicable" with brief rationale. Use framework as validation checklist at end to ensure no critical ambiguities were missed. **Question Format:** All questions use multiple-choice format with letter labels (A, B, C, D, E) and "Other" option. **Key:** Still covers all potentially relevant dimensions, just prioritizes and adapts questions based on context.

2. **Task Type Detection with Adaptive Dimension Coverage** — Detect task type (active development, new feature, bug fix, refactoring) and adapt questioning approach. Active development: Focus on Problem, Scope, Acceptance, Technical Constraints (ask detailed multiple-choice questions), but still check other dimensions for ambiguities (ask validation multiple-choice questions like "Any user concerns? A. No, B. Yes - [describe], C. Not sure"). New feature: Comprehensive coverage with detailed questions. **Question Format:** All questions use multiple-choice format with letter labels and "Other" option, whether detailed or validation questions. **Key:** Adapts depth and type of questions, but still exhausts ambiguity across all dimensions.

3. **Progressive Disclosure with Completeness Validation** — Start with universally relevant dimensions (Problem, Scope, Acceptance) asking detailed multiple-choice questions. Then systematically check remaining dimensions, but adapt question depth: if dimension is less relevant, ask validation multiple-choice questions (e.g., "Any [dimension] concerns? A. None, B. Yes - [describe], C. Not sure, Other: [free-form]") rather than detailed probing. Continue until all dimensions are checked and user confirms no remaining ambiguities. **Question Format:** All questions use multiple-choice format with letter labels and "Other" option, maintaining guided response structure. **Key:** Prioritizes important dimensions but ensures all dimensions are considered for ambiguities.

4. **Smart Question Selection with Ambiguity Exhaustion** — Build a decision tree that analyzes: (a) task hub documentation completeness, (b) task type indicators, (c) dimension relevance heuristics. Algorithm outputs prioritized list of questions, but includes validation questions for all dimensions (even low-relevance ones). For low-relevance dimensions, ask lightweight validation multiple-choice questions (e.g., "Any [dimension] considerations? A. None, B. Yes - [describe], Other: [free-form]"). Framework used for final validation to catch any missed ambiguities. **Question Format:** All questions use multiple-choice format with letter labels and "Other" option, whether generated by algorithm or validation. **Key:** Prioritizes detailed questions but ensures all dimensions get at least validation coverage.

5. **Context-Aware Dimension Filtering with Exhaustive Check** — Before asking questions, run each dimension through a relevance filter: (1) Does existing documentation cover this comprehensively? (2) Is this dimension relevant for this task type? (3) Would answering this block downstream work? Dimensions that pass all three get detailed multiple-choice questions. Dimensions that fail get lightweight validation multiple-choice questions (e.g., "Any [dimension] concerns? A. None, B. Yes - [describe], Other: [free-form]"). All dimensions are checked before session ends. **Question Format:** All questions use multiple-choice format with letter labels and "Other" option, maintaining guided response structure. **Key:** Adapts question depth but ensures comprehensive ambiguity checking.

6. **Gap-Driven Question Generation with Framework Validation** — Replace systematic dimension coverage with gap-driven approach: (1) Analyze task hub for existing information, (2) Compare against framework to identify gaps, (3) Generate targeted multiple-choice questions for identified gaps, (4) After gap-driven questions complete, use framework as completeness checklist to identify any remaining ambiguities, (5) Ask validation multiple-choice questions for any dimensions that might have hidden ambiguities. **Question Format:** All questions use multiple-choice format with letter labels and "Other" option, whether gap-driven or validation questions. **Key:** Gap-driven primary questioning, but framework ensures no ambiguities slip through.

7. **Adaptive Questioning with Agent-Driven Validation** — Present dimension checklist upfront with relevance indicators. Agent asks detailed multiple-choice questions for high-relevance dimensions. For lower-relevance dimensions, agent asks validation multiple-choice questions (e.g., "Any [dimension] considerations? A. None, B. Yes - [describe], Other: [free-form]"). User can mark dimensions as "not applicable" but agent validates this choice with a multiple-choice confirmation question ("Just confirming: no [dimension] concerns? A. Correct, B. Actually yes - [describe], Other: [free-form]") before skipping. Framework used as final validation checklist. **Question Format:** All questions use multiple-choice format with letter labels and "Other" option, maintaining guided response structure throughout. **Key:** User input guides focus, but agent ensures ambiguity exhaustion.

8. **Two-Phase Approach: Gap-Driven Inquiry + Exhaustive Validation** — Phase 1 (Inquiry): Gap-driven questioning based on context analysis, ask detailed multiple-choice questions for identified gaps. Phase 2 (Validation): Use framework as completeness checklist, systematically check each dimension for remaining ambiguities. For dimensions not covered in Phase 1, ask validation multiple-choice questions (e.g., "Any [dimension] considerations? A. None, B. Yes - [describe], Other: [free-form]"). Continue until all dimensions validated and no ambiguities remain. **Question Format:** All questions in both phases use multiple-choice format with letter labels and "Other" option, maintaining consistent guided response structure. **Key:** Clear separation between targeted inquiry and comprehensive validation.

9. **Dimension Relevance Scoring with Comprehensive Coverage** — Score each dimension's relevance (0-5) based on: task type, existing docs, downstream needs. Dimensions with score ≥ 3 get detailed multiple-choice questions. Dimensions with score 1-2 get validation multiple-choice questions (e.g., "Any [dimension] concerns? A. None, B. Yes - [describe], Other: [free-form]"). Dimensions with score 0 get explicit "not applicable" confirmation with a multiple-choice rationale question. All dimensions are addressed before session ends. Framework validates that no critical ambiguities were missed. **Question Format:** All questions use multiple-choice format with letter labels and "Other" option, regardless of relevance score. **Key:** Adapts question depth based on relevance but ensures all dimensions are considered.

10. **Contextual Question Templates with Exhaustive Validation** — Create contextual question sets: "Active Development Questions" (detailed multiple-choice: Problem, Scope, Acceptance, Technical Constraints; validation multiple-choice: Users, Success, Principles, Dependencies), "New Feature Questions" (all dimensions detailed multiple-choice), "Bug Fix Questions" (detailed multiple-choice: Problem, Scope, Acceptance, Dependencies; validation multiple-choice: others). Select template based on context analysis. After template questions complete, use framework to validate no ambiguities remain in validation dimensions. **Question Format:** All questions in all templates use multiple-choice format with letter labels and "Other" option, maintaining guided response structure. **Key:** Templates guide primary questioning, but framework ensures comprehensive ambiguity checking.

## Clustered Themes

### Theme 1: Scoring/Relevance-Based Approaches
**Pattern:** Use numerical scoring or relevance assessment to determine which dimensions get detailed questions vs. validation questions.

**Ideas:** #1 (Mandatory Context Analysis with Gap Scoring), #9 (Dimension Relevance Scoring with Comprehensive Coverage)

### Theme 2: Task Type Detection Approaches
**Pattern:** Detect task type and use pre-defined profiles or templates to adapt questioning approach.

**Ideas:** #2 (Task Type Detection with Adaptive Dimension Coverage), #10 (Contextual Question Templates with Exhaustive Validation)

### Theme 3: Gap-Driven with Validation Approaches
**Pattern:** Primary questioning is gap-driven, then use framework as validation checklist to catch any missed ambiguities.

**Ideas:** #6 (Gap-Driven Question Generation with Framework Validation), #8 (Two-Phase Approach: Gap-Driven Inquiry + Exhaustive Validation)

### Theme 4: Algorithm/Filter-Based Approaches
**Pattern:** Use decision trees, algorithms, or filtering logic to determine which questions to ask and in what depth.

**Ideas:** #4 (Smart Question Selection with Ambiguity Exhaustion), #5 (Context-Aware Dimension Filtering with Exhaustive Check)

### Theme 5: Progressive Disclosure
**Pattern:** Start with universally relevant dimensions, then systematically check remaining dimensions with adapted question depth.

**Ideas:** #3 (Progressive Disclosure with Completeness Validation)

### Theme 6: User-Guided Adaptive
**Pattern:** Present dimension checklist upfront, allow user input to guide focus, but agent ensures ambiguity exhaustion.

**Ideas:** #7 (Adaptive Questioning with Agent-Driven Validation)

## Evaluation Matrix

| Theme/Idea | Mission Alignment | User Impact | Technical Feasibility | Estimated Effort | Total Score | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| **Theme 1: Scoring/Relevance-Based** | 4 | 4 | 3 | 3 | 14 | Good approach but requires scoring logic implementation. May be complex to tune scoring thresholds. |
| **Theme 2: Task Type Detection** | 5 | 5 | 4 | 4 | 18 | Excellent alignment with mission (active dev vs planning). Clear, understandable approach. Moderate implementation effort. |
| **Theme 3: Gap-Driven with Validation** | 5 | 5 | 4 | 4 | 18 | Directly implements research findings. Leverages existing context analysis. High impact, moderate effort. |
| **Theme 4: Algorithm/Filter-Based** | 4 | 4 | 3 | 2 | 13 | Good approach but complex to implement and maintain. Decision trees/filters may be brittle. |
| **Theme 5: Progressive Disclosure** | 4 | 4 | 5 | 5 | 18 | Simple, straightforward approach. Easy to implement. Good user experience. |
| **Theme 6: User-Guided Adaptive** | 3 | 3 | 4 | 4 | 14 | Adds user interaction complexity. Depends on user engagement. May not scale well. |
| **Idea #8 (Two-Phase)** | 5 | 5 | 4 | 4 | 18 | Standout: Clear separation of concerns. Explicit gap-driven + validation phases. Easy to understand and implement. |
| **Idea #10 (Templates)** | 5 | 5 | 5 | 4 | 19 | Standout: Pre-defined templates are easy to maintain. Clear adaptation to task types. High user impact. |

## Prioritized Candidates (Top 5)

### Candidate 1: Contextual Question Templates with Exhaustive Validation (Idea #10)
**Score:** 19/20
**Description:** Create contextual question sets (templates) for different task types: "Active Development Questions", "New Feature Questions", "Bug Fix Questions". Select template based on context analysis. Templates define which dimensions get detailed questions vs. validation questions. After template questions complete, use framework to validate no ambiguities remain.

**Mission Alignment:** Directly addresses mission by providing different question sets for active development (focused) vs. new features (comprehensive). Aligns with "actively ongoing work" focus.

**Expected Impact:** 
- High user impact: Clear, predictable adaptation to task context
- Reduces friction: Active development tasks get focused questions, avoiding irrelevant timeline questions
- Maintains completeness: Framework validation ensures no ambiguities missed
- Easy to understand: Templates are transparent and maintainable

**Implementation Approach:**
- Define 3-4 task type templates (Active Development, New Feature, Bug Fix, Refactoring)
- Each template specifies: detailed dimensions, validation dimensions
- Context analysis determines task type and selects template
- Template questions asked first, then framework validation for completeness
- Maintain multiple-choice question format throughout

**Key Assumptions:**
- Task types can be reliably detected from context
- Templates cover majority of use cases
- Framework validation catches edge cases

**Risks:**
- Templates may not cover all edge cases (mitigated by framework validation)
- Task type detection may be ambiguous (need clear heuristics)
- Templates require maintenance as patterns evolve

**Next Steps:** 
- Research question: What task type detection heuristics are most reliable?
- Validate: Test template approach with sample active development tasks
- Design: Create initial template definitions based on research findings

### Candidate 2: Two-Phase Approach: Gap-Driven Inquiry + Exhaustive Validation (Idea #8)
**Score:** 18/20
**Description:** Explicit two-phase approach. Phase 1 (Inquiry): Gap-driven questioning based on context analysis, ask detailed multiple-choice questions for identified gaps. Phase 2 (Validation): Use framework as completeness checklist, systematically check each dimension for remaining ambiguities. For dimensions not covered in Phase 1, ask validation multiple-choice questions.

**Mission Alignment:** Directly implements research findings (gap-driven approach). Aligns with mission by focusing on relevant questions while ensuring completeness.

**Expected Impact:**
- High user impact: Asks only relevant questions first, then validates completeness
- Clear structure: Two-phase approach is easy to understand
- Maintains completeness: Framework validation ensures no ambiguities missed
- Reduces friction: Gap-driven primary questioning avoids irrelevant questions

**Implementation Approach:**
- Phase 1: Enhance existing context analysis to identify gaps, generate targeted questions for gaps
- Phase 2: Use framework as systematic checklist, ask validation questions for uncovered dimensions
- Maintain multiple-choice format throughout both phases
- Clear phase transitions in workflow

**Key Assumptions:**
- Context analysis can reliably identify gaps
- Framework validation catches all remaining ambiguities
- Two-phase structure doesn't add unnecessary complexity

**Risks:**
- Phase transition may feel artificial (mitigated by clear communication)
- May duplicate some questioning if gaps aren't well-identified (mitigated by good context analysis)
- Requires careful implementation to avoid feeling like two separate sessions

**Next Steps:**
- Research question: How to best structure two-phase approach to feel natural?
- Validate: Test gap identification accuracy with sample tasks
- Design: Define clear phase transition criteria

### Candidate 3: Task Type Detection with Adaptive Dimension Coverage (Idea #2)
**Score:** 18/20
**Description:** Detect task type (active development, new feature, bug fix, refactoring) and adapt questioning approach. Active development: Focus on Problem, Scope, Acceptance, Technical Constraints (detailed questions), but still check other dimensions for ambiguities (validation questions). New feature: Comprehensive coverage with detailed questions.

**Mission Alignment:** Excellent alignment - directly addresses active development vs. planning distinction. Different question sets for different contexts.

**Expected Impact:**
- High user impact: Clear adaptation to task context
- Reduces friction: Active development gets focused questions
- Maintains completeness: All dimensions still checked
- Easy to understand: Task type detection is intuitive

**Implementation Approach:**
- Develop task type detection heuristics (analyze task hub, task description, existing docs)
- Define dimension profiles per task type (which get detailed vs. validation questions)
- Adapt questioning based on detected type
- Use framework for final validation

**Key Assumptions:**
- Task types can be reliably detected
- Dimension profiles cover use cases
- Users understand task type classification

**Risks:**
- Task type detection may be ambiguous (need clear heuristics)
- Profiles may need refinement based on usage (iterative improvement)
- May not handle hybrid task types well (mitigated by framework validation)

**Next Steps:**
- Research question: What are reliable task type detection heuristics?
- Validate: Test task type detection accuracy
- Design: Define dimension profiles for each task type

### Candidate 4: Progressive Disclosure with Completeness Validation (Idea #3)
**Score:** 18/20
**Description:** Start with universally relevant dimensions (Problem, Scope, Acceptance) asking detailed multiple-choice questions. Then systematically check remaining dimensions, but adapt question depth: if dimension is less relevant, ask validation multiple-choice questions rather than detailed probing. Continue until all dimensions are checked and user confirms no remaining ambiguities.

**Mission Alignment:** Good alignment - prioritizes important dimensions while ensuring completeness. Adapts to context through question depth.

**Expected Impact:**
- Good user impact: Starts with most relevant questions
- Simple approach: Easy to understand and implement
- Maintains completeness: All dimensions systematically checked
- Low complexity: Straightforward sequential approach

**Implementation Approach:**
- Define universally relevant dimensions (Problem, Scope, Acceptance)
- Start with detailed questions for universal dimensions
- Systematically check remaining dimensions with validation questions
- Adapt question depth based on dimension relevance
- Use framework for final validation

**Key Assumptions:**
- Problem, Scope, Acceptance are universally relevant
- Validation questions are sufficient for less relevant dimensions
- Sequential approach doesn't feel too long

**Risks:**
- May feel sequential/regimented (mitigated by adaptive question depth)
- Less sophisticated than other approaches (but simpler to implement)
- May not adapt as well to different contexts (mitigated by validation questions)

**Next Steps:**
- Research question: Are Problem, Scope, Acceptance truly universally relevant?
- Validate: Test progressive disclosure flow with sample tasks
- Design: Define validation question templates for less relevant dimensions

### Candidate 5: Gap-Driven Question Generation with Framework Validation (Idea #6)
**Score:** 18/20
**Description:** Replace systematic dimension coverage with gap-driven approach: (1) Analyze task hub for existing information, (2) Compare against framework to identify gaps, (3) Generate targeted multiple-choice questions for identified gaps, (4) After gap-driven questions complete, use framework as completeness checklist to identify any remaining ambiguities, (5) Ask validation multiple-choice questions for any dimensions that might have hidden ambiguities.

**Mission Alignment:** Directly implements research findings. Aligns with mission by being gap-driven rather than template-driven.

**Expected Impact:**
- High user impact: Asks only questions that fill actual gaps
- Maintains completeness: Framework validation ensures nothing missed
- Reduces friction: No irrelevant questions
- Flexible: Adapts to what's already documented

**Implementation Approach:**
- Enhance context analysis to identify gaps systematically
- Generate targeted questions for identified gaps
- Use framework as validation checklist after gap-driven questions
- Ask validation questions for uncovered dimensions

**Key Assumptions:**
- Context analysis can reliably identify gaps
- Framework validation catches all remaining ambiguities
- Gap identification is accurate enough to avoid missing critical information

**Risks:**
- Gap identification may miss subtle ambiguities (mitigated by framework validation)
- May require sophisticated context analysis (moderate implementation effort)
- Less predictable than templates (but more flexible)

**Next Steps:**
- Research question: How to improve gap identification accuracy?
- Validate: Test gap identification with sample tasks
- Design: Define gap identification heuristics and validation process

## Research Questions for #ResearchAgent

| ID | Question | Candidate | Priority |
| --- | --- | --- | --- |
| RQ1 | What task type detection heuristics are most reliable? (Analyze task hub structure, task description patterns, existing documentation indicators) | #10, #2, #3 | High |
| RQ2 | How should two-phase approach be structured to feel natural and not like two separate sessions? | #8 | High |
| RQ3 | What are the minimum required dimensions for plan readiness across different task types? | All | High |
| RQ4 | How accurate is gap identification when analyzing task hub documentation? What patterns indicate gaps vs. complete coverage? | #8, #6 | Medium |
| RQ5 | Are Problem, Scope, and Acceptance truly universally relevant across all task types? | #3 | Medium |
| RQ6 | What validation question templates work best for low-relevance dimensions? (Lightweight questions that still exhaust ambiguity) | All | Medium |
| RQ7 | How do users perceive template-based vs. gap-driven approaches? Which feels more helpful? | #10, #8 | Low |

## Parking Lot (Future Ideas)

- **Hybrid Approach:** Combine templates (#10) with gap-driven validation (#8) - use templates for primary questioning, gap-driven analysis for validation phase
- **Scoring System Refinement:** If scoring-based approaches (#1, #9) are pursued, develop more sophisticated scoring algorithms based on usage patterns
- **User Feedback Loop:** Implement mechanism to collect user feedback on question relevance to continuously improve dimension relevance detection
- **Adaptive Learning:** System learns which dimensions are relevant for different task types based on historical clarification sessions
- **Question Bank:** Create reusable question bank organized by dimension and task type, allowing dynamic question selection

## Session Log

**Ideation Techniques Used:** 
- Constraint-based ideation (addressing specific constraints from research)
- Gap-driven approaches (implementing research findings)
- Context-aware patterns (adapting to task context)
- Adaptive questioning strategies (maintaining question format while improving selection)

**Constitution Clauses Referenced:** 
- C1: Mission & Stakeholder Fidelity (all ideas align with DevAgent mission)
- C3: Delivery Principles (human-in-the-loop defaults maintained, traceable artifacts preserved)

**Mission Metrics Considered:**
- Actively ongoing work focus (not future planning)
- Reducing friction in AI-assisted workflows
- Maintaining quality and completeness

**Conflicts/Blockers Encountered:**
- Initial ideas suggested "early exit" which conflicts with ambiguity exhaustion requirement - resolved by refining all ideas
- Question format constraint clarified - all ideas updated to maintain multiple-choice format

**Follow-up Actions:**
- [ ] Hand off research questions to #ResearchAgent for validation
- [ ] Review prioritized candidates with stakeholders
- [ ] Select primary candidate for implementation planning

## Recommended Next Steps

1. **Review prioritized candidates** - Evaluate top 5 candidates (#10, #8, #2, #3, #6) against specific implementation constraints and team preferences
2. **Conduct research** - Hand off research questions to #ResearchAgent, particularly RQ1 (task type detection) and RQ2 (two-phase structure)
3. **Create implementation plan** - Use `devagent create-plan` to develop detailed implementation plan for selected candidate(s)
4. **Consider hybrid approach** - Evaluate combining templates (#10) with gap-driven validation (#8) for best of both worlds
5. **Test with sample tasks** - Validate selected approach with sample active development tasks from DevAgent workspace
