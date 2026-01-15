# Research Packet — Clarify Workflow Flexibility for Active Development

- Mode: Task
- Requested By: Jake Ruesink
- Last Updated: 2026-01-14
- Related Plan: `.devagent/workspace/tasks/active/2026-01-14_redesign-clarify-workflow-active-development/plan/2026-01-14_redesign-clarify-workflow-plan.md`
- Storage Path: `.devagent/workspace/tasks/active/2026-01-14_redesign-clarify-workflow-active-development/research/2026-01-14_clarify-workflow-flexibility-research.md`
- Stakeholders: Jake Ruesink (Owner, Decision Maker)

## Request Overview

**Problem Statement:** The clarify workflow is too regimented, systematically forcing all tasks through the same 8-dimension checklist regardless of context. This creates friction for active development work where certain questions (like timelines/deadlines) are irrelevant since DevAgent is designed for work that's actively being done, not future planning. The workflow needs to be redesigned to be more flexible, context-aware, and helpful rather than rigidly following a template.

**Desired Outcomes:**
- Understand current clarify workflow implementation and pain points
- Identify how the workflow is used in practice across different task types
- Determine what makes a clarify workflow "helpful" vs. "regimented"
- Design principles for a more flexible, context-appropriate clarify workflow
- Recommendations for redesigning the workflow to adapt to task context

**Review Date:** N/A (active development work)

## Context Snapshot

- **Task summary:** Redesign clarify workflow to be more flexible and contextually appropriate for active development work, rather than forcing all tasks through the same rigid dimension checklist
- **Task reference:** `.devagent/workspace/tasks/active/2026-01-14_redesign-clarify-workflow-active-development/`
- **Existing decisions:** 
  - DevAgent is designed for actively ongoing work (not future planning) per product mission (`.devagent/workspace/product/mission.md`)
  - Current workflow uses 8-dimension framework that must be visited for all tasks (`.devagent/core/workflows/clarify-task.md`)
  - Framework is intended as a "completeness checklist" not a question template, but workflow still requires visiting all dimensions (`.devagent/core/templates/clarification-questions-framework.md`)

## Research Questions

| ID | Question | Status | Notes |
| --- | --- | --- | --- |
| RQ1 | What are the current pain points with the clarify workflow's regimented approach? | Answered | Workflow forces all tasks through 8 dimensions, asks irrelevant questions (timelines for active work) |
| RQ2 | How is the clarify workflow actually being used in practice? | Answered | Review of clarification packets shows many tasks mark timeline constraints as "None" or skip dimensions |
| RQ3 | What makes a clarify workflow "helpful" vs. "regimented"? | Answered | Helpful = context-aware, flexible, relevant questions. Regimented = template-driven, one-size-fits-all |
| RQ4 | How should the workflow adapt to different task contexts (active development vs. planning)? | Answered | Need context detection and adaptive questioning based on task type and existing documentation |
| RQ5 | Which dimensions/questions are universally relevant vs. context-specific? | Answered | Problem, Scope, Acceptance are usually relevant. Timeline, Users, Success vary by context |
| RQ6 | How can we maintain completeness without forcing irrelevant questions? | Answered | Use framework as gap analysis tool, not template. Ask targeted questions based on context gaps |

## Key Findings

1. **Current workflow is template-driven, not gap-driven:** Despite instructions saying the framework is a "completeness checklist, not a question template," the workflow still requires visiting all 8 dimensions and asks questions systematically rather than based on actual gaps.

2. **Timeline questions are frequently irrelevant:** For active development work, timeline/deadline questions consistently get marked as "None" or "Not applicable," indicating these questions don't add value for this context.

3. **Framework intent vs. implementation mismatch:** The clarification-questions-framework.md explicitly states it's a "completeness checklist" and should be used for gap analysis, but the workflow implementation still enforces systematic dimension coverage.

4. **Context analysis exists but isn't fully leveraged:** The workflow includes context analysis steps (reading task hub, identifying gaps), but then still asks questions from all dimensions rather than only filling identified gaps.

5. **Active development work has different needs:** DevAgent's mission emphasizes "actively being done" work, which means questions about deadlines, milestones, and future planning are less relevant than questions about current blockers, technical constraints, and immediate scope.

6. **Flexibility requires adaptive questioning:** A helpful clarify workflow should detect task context (active development vs. new feature planning), analyze existing documentation, and ask only questions that fill actual gaps rather than following a template.

## Detailed Findings

### RQ1: Current Pain Points with Regimented Approach

**Summary:** The workflow systematically forces all tasks through 8 dimensions regardless of context, leading to irrelevant questions and friction.

**Evidence:**
- Workflow requires visiting all 8 dimensions: "Do not generate the final Clarification Packet until: 1. Every dimension has been visited" (`.devagent/core/workflows/clarify-task.md:52-54`)
- Question framework includes timeline questions that are frequently irrelevant: "What timeline constraints exist? Is there a hard deadline? Why?" (`.devagent/core/templates/clarification-questions-framework.md:192-195`)
- Example clarification packet shows timeline constraints marked as "None" for active development work

**Freshness:** 2026-01-14 (current workflow definition and examples)

**Implication:** The workflow creates friction by asking questions that don't apply to active development work, reducing its helpfulness and causing users to mark dimensions as "not applicable" rather than getting value from clarification.

### RQ2: How Clarify Workflow is Used in Practice

**Summary:** Review of clarification packets shows patterns of skipping or marking dimensions as "not applicable," indicating the framework doesn't fit all contexts.

**Evidence:**
- Multiple clarification packets show incomplete dimension coverage, with many sections marked as "To be filled during clarification" or left empty
- Timeline constraints frequently marked as "None" or "Not applicable" for active development tasks
- Some tasks complete only 1-2 dimensions (Problem, Scope) while others attempt full coverage
- Workflow instructions acknowledge this: "Remove sections that are not applicable to your task" (`.devagent/core/templates/clarification-packet-template.md:12-14`)

**Freshness:** 2026-01-14 (review of recent clarification packets)

**Implication:** Users are already adapting the workflow by skipping irrelevant sections, but the workflow still enforces visiting all dimensions, creating unnecessary friction.

### RQ3: Helpful vs. Regimented Clarify Workflow

**Summary:** A helpful workflow is context-aware and gap-driven; a regimented workflow is template-driven and one-size-fits-all.

**Helpful Workflow Characteristics:**
- **Context-aware:** Detects task type (active development, new feature, bug fix) and adapts questions accordingly
- **Gap-driven:** Analyzes existing documentation first, then asks only questions that fill actual gaps
- **Flexible:** Allows skipping irrelevant dimensions without forcing completion
- **Targeted:** Asks specific questions relevant to the task, not generic template questions
- **Progressive:** Builds on what's already known rather than starting from scratch

**Regimented Workflow Characteristics:**
- **Template-driven:** Follows a fixed checklist regardless of context
- **Systematic:** Requires visiting all dimensions even if not relevant
- **Generic:** Asks the same questions for all tasks
- **Rigid:** Doesn't adapt to task type or existing documentation
- **Completeness-focused:** Prioritizes filling out the template over getting useful information

**Evidence:**
- Framework explicitly states it's a "completeness checklist, not a question template" (`.devagent/core/templates/clarification-questions-framework.md:3`)
- Workflow includes context analysis steps but doesn't fully leverage them (`.devagent/core/workflows/clarify-task.md:110-115`)
- Product mission emphasizes "actively being done" work, which has different clarification needs than future planning (`.devagent/workspace/product/mission.md`)

**Freshness:** 2026-01-14

**Implication:** The workflow needs to shift from template-driven to gap-driven, using context analysis to determine which questions are actually needed rather than systematically covering all dimensions.

### RQ4: Adapting to Different Task Contexts

**Summary:** The workflow should detect task context and adapt questioning accordingly, with different approaches for active development vs. new feature planning.

**Context Detection Strategies:**
1. **Task Hub Analysis:** Read existing AGENTS.md, research, plans to understand what's already documented
2. **Task Type Inference:** Active development tasks typically have existing context; new features need more foundational questions
3. **Dimension Relevance Scoring:** Score each dimension's relevance based on task context and existing documentation

**Active Development Context:**
- **High relevance:** Problem (what needs fixing), Scope (what's in/out), Acceptance (how to verify), Technical Constraints (what's blocking)
- **Low relevance:** Timeline (work is ongoing), Users (often already known), Success Metrics (may not be needed for fixes)
- **Approach:** Focus on immediate blockers, technical constraints, and scope boundaries

**New Feature Planning Context:**
- **High relevance:** Problem (why build this), Users (who needs it), Success (how to measure), Timeline (when to deliver)
- **Low relevance:** May need all dimensions depending on feature complexity
- **Approach:** More comprehensive coverage, but still gap-driven based on existing documentation

**Evidence:**
- Workflow already includes context analysis: "Analyze task hub context first: Read the task hub's AGENTS.md, existing research files, plans, specs" (`.devagent/core/workflows/clarify-task.md:111`)
- But then still requires visiting all dimensions: "verify all 8 dimensions have been considered" (`.devagent/core/workflows/clarify-task.md:146`)

**Freshness:** 2026-01-14

**Implication:** The workflow should use context analysis to determine which dimensions are relevant, then only ask questions for those dimensions rather than requiring coverage of all 8.

### RQ5: Universal vs. Context-Specific Dimensions

**Summary:** Some dimensions are usually relevant (Problem, Scope, Acceptance), while others vary by context (Timeline, Users, Success Metrics).

**Universal Relevance (Most Tasks):**
- **Problem Statement:** Almost always relevant—need to understand what's being solved
- **Scope Boundaries:** Critical for preventing scope creep—what's in/out
- **Acceptance Criteria:** Needed to know when work is done—how to verify completion

**Context-Specific Relevance:**
- **Timeline Constraints:** Relevant for planned features with deadlines, irrelevant for active development work
- **Users & Personas:** Relevant for user-facing features, less relevant for internal tooling or bug fixes
- **Success Criteria:** Relevant for features with metrics, less relevant for bug fixes or refactoring
- **Solution Principles:** Relevant when architecture/quality matters, less relevant for simple fixes
- **Dependencies:** Relevant when work depends on other systems/teams, less relevant for isolated work

**Evidence:**
- Framework acknowledges not all dimensions apply: "Not all dimensions apply to every task. Focus on dimensions where gaps exist" (`.devagent/core/templates/clarification-questions-framework.md:10`)
- But workflow still requires visiting all: "verify all 8 dimensions have been considered (even if marked as not applicable)" (`.devagent/core/workflows/clarify-task.md:146`)

**Freshness:** 2026-01-14

**Implication:** The workflow should prioritize universally relevant dimensions and only ask about context-specific dimensions when they're actually relevant to the task.

### RQ6: Maintaining Completeness Without Forcing Irrelevant Questions

**Summary:** Use the framework as a gap analysis tool rather than a template, asking targeted questions only for dimensions where gaps exist.

**Gap-Driven Approach:**
1. **Context Analysis First:** Read task hub documentation to understand what's already known
2. **Gap Identification:** Compare existing documentation against framework to identify missing information
3. **Targeted Questioning:** Ask questions only for dimensions where gaps exist
4. **Relevance Filtering:** Skip dimensions that aren't relevant to the task context
5. **Completeness Validation:** Verify critical dimensions are covered, but don't require all 8

**Implementation Strategy:**
- Remove requirement to visit all 8 dimensions
- Make context analysis mandatory and use it to determine relevant dimensions
- Allow dimensions to be marked as "not applicable" without requiring questions
- Focus on critical gaps that would block downstream work (planning, implementation)
- Use framework as a completeness checklist during validation, not a question template during inquiry

**Evidence:**
- Framework already states this approach: "Use it to identify gaps in existing documentation, not to systematically ask every question" (`.devagent/core/templates/clarification-questions-framework.md:3-9`)
- Workflow includes gap identification but doesn't fully implement it: "Identify gaps: Compare existing documentation against the 8-dimension framework" (`.devagent/core/workflows/clarify-task.md:112`)

**Freshness:** 2026-01-14

**Implication:** The workflow should fully implement the gap-driven approach already described in the framework, using it to determine which questions to ask rather than systematically covering all dimensions.

## Comparative / Alternatives Analysis

### Current Approach (Template-Driven)
**Pros:**
- Ensures comprehensive coverage
- Consistent structure across tasks
- Easy to validate completeness

**Cons:**
- Asks irrelevant questions (timelines for active work)
- Creates friction for users
- Doesn't adapt to task context
- Forces "not applicable" responses

### Proposed Approach (Gap-Driven, Context-Aware)
**Pros:**
- Asks only relevant questions
- Adapts to task context
- Builds on existing documentation
- More efficient and helpful

**Cons:**
- Requires better context analysis
- May miss important dimensions if analysis is incomplete
- More complex to implement

### Hybrid Approach (Recommended)
**Implementation:**
1. Mandatory context analysis before asking questions
2. Use framework to identify gaps, not as question template
3. Prioritize universally relevant dimensions (Problem, Scope, Acceptance)
4. Ask context-specific dimensions only when relevant
5. Allow early completion if critical gaps are filled
6. Use framework as validation checklist, not inquiry template

**Tradeoffs:**
- Balances completeness with flexibility
- Maintains structure while adapting to context
- Reduces friction while ensuring critical information is captured

## Implications for Implementation

### Scope Adjustments
- **Remove:** Requirement to visit all 8 dimensions
- **Add:** Context-aware dimension relevance scoring
- **Modify:** Question selection to be gap-driven rather than template-driven
- **Enhance:** Context analysis to determine which dimensions are relevant

### Acceptance Criteria Impacts
- Workflow should detect task context (active development vs. planning)
- Workflow should analyze existing documentation before asking questions
- Workflow should ask targeted questions based on gaps, not template
- Workflow should allow skipping irrelevant dimensions
- Workflow should validate completeness based on relevant dimensions, not all 8

### Validation Needs
- Test with active development tasks (should skip timeline questions)
- Test with new feature planning (should ask comprehensive questions)
- Test with bug fixes (should focus on problem, scope, acceptance)
- Verify critical dimensions are still covered
- Ensure workflow doesn't miss important information

## Risks & Open Questions

| Item | Type | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| May miss important dimensions if context analysis is incomplete | Risk | Workflow designer | Use framework as validation checklist after gap-driven questioning | TBD |
| How to determine dimension relevance automatically? | Question | Workflow designer | Develop heuristics based on task type and existing documentation | TBD |
| What are the minimum required dimensions for plan readiness? | Question | Workflow designer | Identify critical dimensions that must be covered (likely Problem, Scope, Acceptance) | TBD |
| How to balance flexibility with completeness? | Question | Workflow designer | Use framework for validation, not inquiry; allow early completion if critical gaps filled | TBD |
| Will users understand the new gap-driven approach? | Risk | Workflow designer | Update workflow documentation and examples to show gap-driven questioning | TBD |

## Recommended Follow-ups

1. **Design gap-driven question selection algorithm:** Develop heuristics for determining which dimensions are relevant based on task context and existing documentation
2. **Identify critical dimensions:** Determine which dimensions are universally required vs. context-specific
3. **Update workflow implementation:** Modify clarify-task.md to implement gap-driven approach rather than template-driven
4. **Update framework documentation:** Clarify that framework is for gap analysis and validation, not systematic questioning
5. **Test with sample tasks:** Validate new approach with active development tasks, new features, and bug fixes
6. **Create examples:** Document examples of gap-driven clarification sessions to guide users

## Sources

| Reference | Type | Freshness | Access Notes |
| --- | --- | --- | --- |
| `.devagent/core/workflows/clarify-task.md` | Internal workflow definition | 2026-01-14 | Current workflow implementation |
| `.devagent/core/templates/clarification-questions-framework.md` | Internal template | 2026-01-14 | Framework that should guide gap analysis |
| `.devagent/core/templates/clarification-packet-template.md` | Internal template | 2026-01-14 | Output structure template |
| `.devagent/workspace/product/mission.md` | Internal product context | 2026-01-14 | Emphasizes "actively being done" work |
| `.devagent/core/AGENTS.md` | Internal workflow instructions | 2026-01-14 | Standard workflow instructions and context gathering order |
