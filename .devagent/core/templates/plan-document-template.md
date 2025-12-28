# <Feature / Project Name> Plan

- Owner: <PlanAuthor or DRI>
- Last Updated: <YYYY-MM-DD> **Populate by running `date +%Y-%m-%d` first to get the current date in ISO format.**
- Status: <Draft | In Review | Approved>
- Related Feature Hub: `.devagent/workspace/features/{status}/YYYY-MM-DD_feature-slug/`
- Stakeholders: <Name (Role, Decision Role)>
- Notes: Remove sections marked `(Optional)` if they do not apply.

---

## PART 1: PRODUCT CONTEXT

### Summary
Provide a one-paragraph overview of the problem, the proposed solution direction, and why it matters now.

### Context & Problem
Outline the current state, user pain, and business trigger. Cite research artifacts or analytics snapshots.

### Objectives & Success Metrics
List measurable product, business, and experience outcomes. Include baseline and target when available.

### Users & Insights
Describe target users or personas, key insights, and demand signals. Link to user research or feedback sources.

### Solution Principles
Capture guiding heuristics or non-negotiables (e.g., accessibility level, platform parity, quality bars).

### Scope Definition
- **In Scope:** <Capabilities or scenarios included>
- **Out of Scope / Future:** <Deferred capabilities, nice-to-haves>

### Functional Narrative
Break down the end-to-end experience. Use subheadings per flow, job story, or state change.

#### Flow Example
- Trigger:
- Experience narrative:
- Acceptance criteria:

### Experience References (Optional)
Link to wireframes, prototypes, content guidelines, or accessibility notes. Summarize key decisions that inform implementation.

### Technical Notes & Dependencies (Optional)
Document data needs, integrations, migrations, performance considerations, and platform-specific impacts.

---

## PART 2: IMPLEMENTATION PLAN

### Scope & Assumptions
- Scope focus: <Phase / Component / Platform>
- Key assumptions: <List>
- Out of scope: <Items>

### Implementation Tasks
Keep backlog slices to five tasks or fewer; duplicate backlog sections as needed for phases.

#### Task 1: <Task Title>
- **Objective:** <What this task slice delivers>
- **Impacted Modules/Files:** <Concrete list of files or modules>
- **Dependencies:** <Refs to other tasks or external dependencies>
- **Acceptance Criteria:** <List behavior-focused criteria; avoid performance metrics unless explicitly required>
<!-- Note: Strictly avoid performance metrics (e.g., load times, response times) unless explicitly documented as a business requirement. Favor practical criteria (e.g., "component renders on mobile" rather than "loads in <500ms"). Follow project testing standards. -->
- **Subtasks (optional):**
  1. `<Subtask title>` — Rationale / spec section
     - Validation: <Test hook or review gate following project testing standards>
  2. `<Subtask title>` — ...
- **Validation Plan:** <Tests, instrumentation, review gate following project testing standards>

#### Task 2: <Task Title>
<Repeat structure>

### Release & Delivery Strategy (Optional)
Outline the release strategy, milestones, and review gates without including dates or durations. Structure this section by milestones and dependencies. Note analytics or QA requirements for launch readiness.

### Approval & Ops Readiness (Optional)
List required approvals (product, design, legal, security) and any operational checklists (support, comms, training).

---

## Risks & Open Questions

| Item | Type (Risk / Question) | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |

---

## Progress Tracking
Refer to the AGENTS.md file in the feature directory for instructions on tracking and reporting progress during implementation.

---

## Appendices & References (Optional)
Reference research IDs, decision logs, analytics dashboards, or related documents.
