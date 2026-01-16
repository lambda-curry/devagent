# Research Packet — Review Plan Workflow

- Mode: Task
- Requested By: Jake Ruesink
- Last Updated: 2026-01-14
- Related Task Hub: `.devagent/workspace/tasks/completed/2026-01-14_review-plan-workflow/`
- Storage Path: `.devagent/workspace/tasks/completed/2026-01-14_review-plan-workflow/research/2026-01-14_review-plan-workflow-research.md`
- Stakeholders: Jake Ruesink (Owner)

## Request Overview

Create a review plan workflow that provides a high-level summary of a plan and allows users to interactively walk through plan steps in detail. The workflow should enable users to either review specific plan steps they're interested in or walk through the entire plan step-by-step, with thoughtful questions to ensure the plan aligns with their expectations and accomplishes what they want. This workflow will help validate plans before implementation, ensuring alignment between the plan's approach and the user's goals.

**Desired outcomes:**
- Workflow that can review plan documents interactively
- High-level summary presentation with adaptive suggestions based on plan complexity
- Flexible walkthrough capability that adapts to user preferences (not rigid modes)
- Ability to review specific plan sections on demand
- Thoughtful questions that ensure plan alignment with user expectations
- Natural, helpful interaction rather than regimented structure

## Context Snapshot

- Task summary: Create `devagent review-plan` workflow that validates plans before implementation
- Existing decisions:
  - Plans use unified template with "Product Context" and "Implementation Plan" sections (`.devagent/core/templates/plan-document-template.md`)
  - Interactive workflows (clarify-task, brainstorm) use incremental question-asking patterns (2-3 questions per turn)
  - Review workflows (review-pr) use structured validation against requirements
  - Constitution C3 requires human-in-the-loop defaults for all agent interactions
  - Plans are created by `devagent create-plan` and executed by `devagent implement-plan`
- Related work:
  - Interactive workflows pattern established in `2025-12-14_interactive-brainstorm-clarify` task
  - Review patterns established in `2025-12-25_pr-review-agent` task

## Research Questions

| ID | Question | Status (Planned / Answered / Follow-up) | Notes |
| --- | --- | --- | --- |
| RQ1 | What are the key sections of plan documents that need review? | Answered | Plans have Product Context (Summary, Problem, Objectives, Users, Solution Principles, Scope, Functional Narrative) and Implementation Plan (Tasks, Dependencies, Acceptance Criteria) |
| RQ2 | How do existing interactive workflows structure incremental question-asking? | Answered | clarify-task and brainstorm use 2-3 questions per turn, track progress by dimensions/phases, save incrementally, allow early exit |
| RQ3 | How do review workflows validate artifacts against requirements? | Answered | review-pr validates against Linear issues, checks code quality, produces structured review artifacts with confidence scores |
| RQ4 | What validation questions should be asked for each plan section? | Answered | Questions should validate alignment with user goals, check completeness, identify gaps, confirm approach matches expectations |
| RQ5 | How should the workflow handle both high-level summary and detailed walkthrough? | Answered | Analyze plan complexity, offer helpful suggestions (not rigid modes), adapt to user preferences naturally |
| RQ6 | What should happen after plan review is complete? | Answered | Generate review artifact, update plan status if needed, provide recommendations for plan approval or revision |

## Key Findings

1. **Plan Structure:** Plans follow a two-part structure: Product Context (business/product guardrails) and Implementation Plan (concrete execution tasks). Review should validate both sections for alignment with user expectations.

2. **Interactive Pattern:** Existing interactive workflows (clarify-task, brainstorm) use proven patterns: 2-3 questions per turn, progress tracking, incremental document saving, early exit support. This pattern should be adapted for plan review.

3. **Review Validation:** Review workflows (review-pr) use structured validation: compare against requirements, check completeness, identify gaps, produce confidence scores. Similar approach should be used for plan review.

4. **Question Types:** Review questions should validate: (a) alignment with user goals, (b) completeness of plan sections, (c) approach matches expectations, (d) dependencies are clear, (e) acceptance criteria are testable.

5. **Adaptive Approach:** Workflow should analyze plan complexity and offer helpful suggestions for how to review (not rigid modes). User can express preferences naturally, and workflow adapts flexibly.

6. **Review Artifact:** Similar to review-pr, workflow should produce a structured review artifact documenting validation status, identified gaps, recommendations, and approval status.

## Detailed Findings

### RQ1: Plan Document Structure

**Summary:** Plans use a unified template (`.devagent/core/templates/plan-document-template.md`) with two main parts: Product Context and Implementation Plan.

**Supporting evidence:**
- Plan template structure: `.devagent/core/templates/plan-document-template.md` (2026-01-14)
- Example plan: `.devagent/workspace/tasks/active/2026-01-13_ralph-monitoring-ui/plan/2026-01-14_ralph-monitoring-ui-mvp-plan.md` (2026-01-14)

**Plan sections requiring review:**
- **Product Context:**
  - Summary (problem, solution direction, why now)
  - Context & Problem (current state, user pain, business trigger)
  - Objectives & Success Metrics (measurable outcomes)
  - Users & Insights (target users, key insights)
  - Solution Principles (guiding heuristics)
  - Scope Definition (in-scope vs. out-of-scope)
  - Functional Narrative (end-to-end experience flows)
- **Implementation Plan:**
  - Scope & Assumptions (scope focus, key assumptions)
  - Implementation Tasks (ordered tasks with objectives, impacted files, dependencies, acceptance criteria)
  - Implementation Guidance (coding standards, testing patterns)
  - Release & Delivery Strategy (milestones, review gates)
  - Risks & Open Questions (tracked risks and unresolved questions)

**Freshness:** 2026-01-14

### RQ2: Interactive Workflow Patterns

**Summary:** Existing interactive workflows (clarify-task, brainstorm) use incremental question-asking with 2-3 questions per turn, progress tracking, and incremental document saving.

**Supporting evidence:**
- clarify-task workflow: `.devagent/core/workflows/clarify-task.md` (2026-01-14)
- brainstorm workflow: `.devagent/core/workflows/brainstorm.md` (2026-01-14)
- Interactive workflows plan: `.devagent/workspace/tasks/completed/2025-12-14_interactive-brainstorm-clarify/plan/2025-12-14_interactive-workflows-plan.md` (2026-01-14)

**Key patterns:**
1. **Question batching:** Ask exactly 2-3 questions per turn, wait for answers before proceeding
2. **Progress tracking:** Show progress header with dimension/phase checklist (✅ complete, ⏳ in progress, ⬜ not started)
3. **Incremental saving:** Save document to disk after each user response to preserve progress
4. **Early exit support:** Remind users they can end session by saying "all done" or exiting
5. **Status labels:** Use consistent status labels (✅, ⏳, ⬜, ❓, 🔍, ⚠️, 🚫, ⏭️, 🚧)
6. **Completion gate:** Don't generate final document until all dimensions/phases have status labels

**Adaptation for plan review:**
- Use similar question batching (2-3 questions per plan section)
- Track progress by plan sections (Product Context sections, Implementation Tasks)
- Save review artifact incrementally
- Support early exit with partial review artifact
- Use status labels for validation status (✅ aligned, ⚠️ needs adjustment, ❌ misaligned, ❓ unclear)

**Freshness:** 2026-01-14

### RQ3: Review Workflow Validation Patterns

**Summary:** Review workflows (review-pr) use structured validation: compare against requirements, check completeness, identify gaps, produce confidence scores and recommendations.

**Supporting evidence:**
- review-pr workflow: `.devagent/core/workflows/review-pr.md` (2026-01-14)
- PR review agent plan: `.devagent/workspace/tasks/completed/2025-12-25_pr-review-agent/plan/2025-12-25_pr-review-agent-plan.md` (2026-01-14)

**Key validation patterns:**
1. **Requirements validation:** Compare artifact against requirements (Linear issues for PRs, user goals for plans)
2. **Completeness check:** Verify all required sections are present and complete
3. **Gap identification:** Identify missing or incomplete sections
4. **Confidence scoring:** Calculate quantitative assessment (0-100) based on validation criteria
5. **Structured artifact:** Produce review artifact with validation status, gaps, recommendations
6. **Recommendation:** Provide clear next steps (Ready / Needs revision / Blocked)

**Adaptation for plan review:**
- Validate plan against user goals (from task hub or user input)
- Check completeness of plan sections (Product Context, Implementation Plan)
- Identify gaps: missing sections, unclear requirements, incomplete tasks
- Calculate confidence score based on: (a) alignment with user goals, (b) completeness, (c) clarity of approach
- Produce review artifact with validation status per section, identified gaps, recommendations
- Provide recommendation: Ready for implementation / Needs revision / Needs clarification

**Freshness:** 2026-01-14

### RQ4: Validation Questions for Plan Sections

**Summary:** Review questions should validate alignment with user goals, check completeness, identify gaps, and confirm approach matches expectations.

**Question categories by plan section:**

**Product Context validation:**
- **Summary:** Does the summary accurately capture the problem and solution direction? Does it align with your goals?
- **Context & Problem:** Is the problem statement accurate? Are user pain points correctly identified?
- **Objectives & Success Metrics:** Do the objectives match what you want to achieve? Are success metrics measurable and relevant?
- **Users & Insights:** Are target users correctly identified? Do insights align with your understanding?
- **Solution Principles:** Do the principles align with your expectations? Are there missing principles?
- **Scope Definition:** Is the scope correct? Are there items in-scope that should be out, or vice versa?
- **Functional Narrative:** Do the flows match your expectations? Are there missing flows or scenarios?

**Implementation Plan validation:**
- **Scope & Assumptions:** Are assumptions reasonable? Are there missing assumptions?
- **Implementation Tasks:** Do tasks cover all necessary work? Are dependencies correct? Are acceptance criteria testable?
- **Implementation Guidance:** Is guidance sufficient for implementation? Are coding standards clear?
- **Risks & Open Questions:** Are risks identified? Are open questions tracked with owners?

**Question format (from clarify-task pattern):**
- Use multiple-choice format with letter labels (A, B, C, D, E) when applicable
- Include "All of the above" option when all answers are valid
- Include "Other" option for custom answers
- Frame questions specifically to the plan being reviewed

**Freshness:** 2026-01-14

### RQ5: Adaptive Review Approach Based on Plan Complexity

**Summary:** Workflow should be adaptive and helpful, offering suggestions based on plan complexity/extensiveness rather than rigid modes. The approach should be flexible and natural, not regimented.

**Adaptive Review Approach:**
- **Trigger:** User invokes `devagent review-plan` with plan path
- **Experience:**
  1. AI analyzes plan structure: counts sections, tasks, complexity indicators
  2. AI presents high-level summary: plan overview, key sections, implementation task count
  3. AI offers helpful suggestions based on plan complexity:
     - **Simple plans (few tasks, clear structure):** "This looks straightforward. Would you like to review the key sections, or walk through everything step-by-step?"
     - **Complex plans (many tasks, multiple flows):** "This plan has several sections and tasks. We could review the high-level approach first, then dive into specific tasks you're most concerned about. Or we can walk through everything systematically."
     - **Medium plans:** "I can walk you through the main sections, or we can focus on specific areas you want to validate. What would be most helpful?"
  4. User responds naturally (not constrained to mode selection)
  5. AI adapts interaction based on user preference:
     - If user wants to review specific sections: focus on those sections with validation questions
     - If user wants full walkthrough: proceed systematically through all sections
  6. AI remains flexible throughout: user can change approach mid-session ("actually, let's review task 3 in detail" or "let's do a full walkthrough")
  7. Generate review artifact when complete or user exits early

**Key principles:**
- **Not regimented:** No rigid mode selection, no forced structure
- **Helpful suggestions:** AI offers guidance based on plan complexity, but user has full control
- **Natural interaction:** User can express preferences naturally, workflow adapts
- **Flexible mid-session:** User can change approach at any time

**Freshness:** 2026-01-14 (Updated: Removed rigid mode concept, replaced with adaptive suggestion-based approach)

### RQ6: Post-Review Actions

**Summary:** After plan review, workflow should generate review artifact, update plan status if needed, provide recommendations for plan approval or revision.

**Review artifact structure:**
- **Review metadata:** Plan path, review date, reviewer, review approach (how the review was conducted—e.g., "high-level summary with selective deep-dive", "full walkthrough", "focused on tasks 1-3")
- **High-level summary:** Plan overview, key findings, overall confidence score
- **Section-by-section validation:**
  - For each plan section: validation status (✅ aligned, ⚠️ needs adjustment, ❌ misaligned, ❓ unclear)
  - Validation questions asked and answers received
  - Identified gaps or concerns
- **Confidence score:** Overall score (0-100) with breakdown by section
- **Recommendations:** Ready for implementation / Needs revision / Needs clarification
- **Action items:** Specific changes needed, sections to revise, questions to resolve

**Plan status updates:**
- If plan is approved: Update plan status to "In Review" or "Approved" (if plan has status field)
- If plan needs revision: Keep status as "Draft", note revision needed in review artifact
- If plan needs clarification: Note in review artifact, recommend `devagent clarify-task` or `devagent research`

**Handoff to downstream workflows:**
- **Ready for implementation:** Hand to `devagent implement-plan` with approved plan
- **Needs revision:** Return to `devagent create-plan` with specific revision requests
- **Needs clarification:** Hand to `devagent clarify-task` or `devagent research` with specific questions

**Freshness:** 2026-01-14

## Comparative / Alternatives Analysis

### Alternative 1: Automated Plan Validation (No Interactive Review)
- **Approach:** Workflow automatically validates plan against checklist, produces validation report
- **Pros:** Fast, consistent, no user interaction required
- **Cons:** Doesn't validate alignment with user goals, misses nuanced expectations
- **Verdict:** Not sufficient—user goals and expectations require interactive validation

### Alternative 2: Full Walkthrough Only (No Summary Mode)
- **Approach:** Always walk through entire plan step-by-step
- **Pros:** Comprehensive, ensures nothing is missed
- **Cons:** High cognitive load, time-consuming, may be overkill for simple plans
- **Verdict:** Should be suggested for complex plans, but not forced—user should have flexibility

### Alternative 3: Review Artifact Only (No Interactive Session)
- **Approach:** Generate review artifact without interactive questions
- **Pros:** Fast, produces artifact immediately
- **Cons:** Doesn't validate alignment with user goals, misses user input
- **Verdict:** Not sufficient—interactive questions are essential for alignment validation

### Recommended Approach: Adaptive Interactive Review
- **Adaptive suggestions:** Analyze plan complexity and offer helpful suggestions (not rigid modes)
- **Flexible interaction:** User can express preferences naturally; workflow adapts to user needs
- **Natural flow:** Start with high-level summary, then adapt based on user response and plan complexity
- **Interactive questions:** Use 2-3 questions per section, incremental saving, early exit support
- **Structured output:** Generate review artifact with confidence score and recommendations regardless of review approach

## Implications for Implementation

### Workflow Structure
- Follow standard DevAgent workflow structure: Mission, Execution Directive, Inputs, Resource Strategy, Workflow steps
- Use interactive session model similar to clarify-task and brainstorm
- **Adaptive approach:** Analyze plan complexity and offer helpful suggestions, but remain flexible to user preferences (not rigid modes)

### Question Framework
- Adapt clarify-task question framework for plan sections
- Use 2-3 questions per plan section
- Use multiple-choice format with letter labels when applicable
- Track progress by plan sections with status labels

### Review Artifact Template
- Create new template: `.devagent/core/templates/plan-review-artifact-template.md`
- Include: review metadata, high-level summary, section-by-section validation, confidence score, recommendations, action items
- Similar structure to review-pr artifact but focused on plan validation

### Integration Points
- **Input:** Plan document path (required)
- **Output:** Review artifact in `.devagent/workspace/tasks/{status}/YYYY-MM-DD_task-slug/reviews/` or `.devagent/workspace/reviews/`
- **Downstream:** `devagent implement-plan` (if approved), `devagent create-plan` (if needs revision), `devagent clarify-task` or `devagent research` (if needs clarification)

### Constitution Compliance
- **C3 (Human-in-the-loop defaults):** Interactive questions require user input, no automatic plan approval
- **C4 (Tool-agnostic design):** Workflow is prompt-based, no tool-specific code
- **C2 (Chronological artifacts):** Review artifacts use dated filenames, preserve history

## Risks & Open Questions

| Item | Type (Risk / Question) | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Question framework completeness | Risk | Jake Ruesink | Validate question framework against multiple plan examples, refine based on usage | Before implementation |
| Plan complexity analysis | Question | Jake Ruesink | Define how to assess plan complexity (task count, section count, flow complexity) to offer helpful suggestions | Before implementation |
| Confidence score calculation | Question | Jake Ruesink | Define scoring criteria: alignment weight, completeness weight, clarity weight | Before implementation |
| Review artifact storage location | Question | Jake Ruesink | Determine if reviews go in task hub `reviews/` subdirectory or general `.devagent/workspace/reviews/` | Before implementation |
| Integration with plan status | Question | Jake Ruesink | Clarify if workflow should update plan status field or leave status management to user | Before implementation |

## Recommended Follow-ups

1. **Clarify requirements:** Run `devagent clarify-task` to validate review workflow requirements, interaction patterns, and validation criteria
2. **Create implementation plan:** Run `devagent create-plan` to create detailed implementation plan for the review workflow
3. **Validate question framework:** Test question framework against multiple plan examples to ensure completeness
4. **Design review artifact template:** Create `.devagent/core/templates/plan-review-artifact-template.md` with structured format

## Sources

| Reference | Type | Freshness | Access Notes |
| --- | --- | --- | --- |
| `.devagent/core/templates/plan-document-template.md` | Internal template | 2026-01-14 | Plan structure reference |
| `.devagent/core/workflows/clarify-task.md` | Internal workflow | 2026-01-14 | Interactive question-asking pattern |
| `.devagent/core/workflows/brainstorm.md` | Internal workflow | 2026-01-14 | Interactive session model |
| `.devagent/core/workflows/review-pr.md` | Internal workflow | 2026-01-14 | Review validation pattern |
| `.devagent/core/workflows/create-plan.md` | Internal workflow | 2026-01-14 | Plan creation workflow |
| `.devagent/core/workflows/implement-plan.md` | Internal workflow | 2026-01-14 | Plan execution workflow |
| `.devagent/workspace/tasks/completed/2025-12-14_interactive-brainstorm-clarify/plan/2025-12-14_interactive-workflows-plan.md` | Internal plan | 2026-01-14 | Interactive workflow design example |
| `.devagent/workspace/tasks/active/2026-01-13_ralph-monitoring-ui/plan/2026-01-14_ralph-monitoring-ui-mvp-plan.md` | Internal plan example | 2026-01-14 | Real-world plan structure |
| `.devagent/workspace/memory/constitution.md` | Internal principles | 2026-01-14 | C3, C4 compliance requirements |
