# Ralph Browser Testing Enforcement Plan

- Owner: Jake Ruesink
- Last Updated: 2026-01-14
- Status: Draft
- Related Task Hub: `.devagent/workspace/tasks/completed/2026-01-14_process-pasted-content/`
- Stakeholders: Jake Ruesink (Owner, Decision Maker), Ralph maintainers
- Notes: Documentation-only task to improve Ralph's browser testing compliance

---

## PART 1: PRODUCT CONTEXT

### Summary
Ralph (an autonomous agent) skipped browser testing for all 3 UI tasks in an epic, despite explicit instructions in AGENTS.md requiring it. This represents a process gap where Ralph is not following required testing procedures for UI work. This plan addresses the gap by updating documentation to clarify when browser testing is required, how to detect UI tasks, and how to enforce browser testing through a dynamic checklist in task acceptance requirements. The solution references the existing agent-browser skill and keeps improvements simple and concise while giving the agent appropriate control.

### Context & Problem
**Current State:**
- Ralph has explicit instructions in `.devagent/plugins/ralph/AGENTS.md` requiring browser testing for UI tasks (step 5 of the 7-Point Checklist)
- The agent-browser skill exists at `.devagent/plugins/ralph/skills/agent-browser/SKILL.md` with clear guidance on when and how to use browser testing
- Despite these instructions, Ralph skipped browser testing for all 3 UI tasks in a recent epic
- Epic report documented "0 screenshots captured"
- Only manual testing was performed ("bun dev runs successfully")

**User Pain:**
- Ralph maintainers cannot rely on Ralph to follow browser testing requirements
- Teams using Ralph for UI work may receive untested changes
- Process gap undermines confidence in autonomous execution

**Business Trigger:**
- Analysis document prepared with evidence, impact analysis, and recommendations
- Active issue requiring immediate documentation improvements to prevent recurrence

**Evidence:**
- Clarification packet: `.devagent/workspace/tasks/completed/2026-01-14_process-pasted-content/clarification/2026-01-14_initial-clarification.md`
- Analysis document with evidence of 3 UI tasks missing browser testing

### Objectives & Success Metrics

**Product Metrics:**
- **Metric:** Ralph automatically detects UI tasks and enforces browser testing requirements
- **Baseline:** Ralph currently skips browser testing for UI tasks despite instructions
- **Target:** Ralph automatically generates a dynamic checklist in task acceptance requirements that must be fully checked off (or have good reason why one is sufficient) before marking task as complete
- **Timeline:** To be determined

**Definition of "good enough":**
- Ralph automatically detects when browser testing is required for UI tasks
- A dynamically generated checklist appears in task acceptance requirements
- All checklist items must be checked off (or justified) before task completion
- No manual intervention required for enforcement

**What would indicate failure:**
- Ralph continues to skip browser testing for UI tasks
- Manual intervention still required to ensure browser testing happens
- Checklist items can be bypassed without justification

### Users & Insights

**Primary Users:**
- **Persona:** Ralph (autonomous agent)
- **Goals:** Follow instructions to complete UI tasks with proper browser testing
- **Current pain:** Instructions exist but are not being followed consistently
- **Expected benefit:** Clear, actionable instructions that Ralph can automatically follow

**Secondary Users:**
- Ralph maintainers who need to ensure Ralph follows testing requirements
- Teams relying on Ralph for UI work that requires browser verification

**User Insights:**
- Analysis document prepared with evidence showing Ralph skipped browser testing for 3 UI tasks
- Instructions in AGENTS.md exist but may not be clear enough or enforced
- Agent-browser skill exists and is documented but may not be referenced clearly enough

### Solution Principles

**Quality Bars:**
- Instructions must be clear enough for Ralph to automatically detect UI tasks
- Documentation should specify how to generate and enforce the dynamic checklist
- Instructions should include guidance on when checklist items can be justified as "good enough"
- Keep improvements simple and concise

**Architecture Principles:**
- Reference existing agent-browser skill rather than creating new documentation
- Build on existing instruction patterns in AGENTS.md
- Maintain consistency with existing Ralph workflow documentation

**UX Principles:**
- Not too regimented - give the agent some power of control
- Balance clarity with flexibility
- Enable autonomous decision-making within clear boundaries

**Performance Expectations:**
- Documentation should be easily discoverable and referenceable
- Instructions should be actionable without requiring additional interpretation

### Scope Definition

- **In Scope:**
  - Update `.devagent/plugins/ralph/AGENTS.md` to clarify when browser testing is required and how to detect UI tasks
  - Update task acceptance requirements (7-Point Checklist) to include dynamic checklist concept for browser testing
  - Reference existing agent-browser skill (`.devagent/plugins/ralph/skills/agent-browser/SKILL.md`) in documentation
  - Provide guidance on when checklist items can be justified as "good enough for now"
  - Keep improvements simple and concise

- **Out of Scope / Future:**
  - Implementation of fixes/enhancements to ralph.sh (out of scope - documentation only)
  - Direct coordination with Ralph maintainers (may happen but not required)
  - Research and design of solutions (focus is on documentation updates)
  - Creating new browser agent skill (skill already exists, just needs to be referenced)

### Functional Narrative

#### Flow: Ralph Executes UI Task with Browser Testing

- **Trigger:** Ralph begins work on a task that involves UI changes (detected via file extensions, task description, or explicit requirement)

- **Experience narrative:**
  1. Ralph reads task context and identifies it as a UI task (based on file extensions `.tsx`, `.jsx`, `.css`, `.html`, or task description indicating UI work)
  2. Ralph generates a dynamic checklist in task acceptance requirements that includes browser testing items
  3. Ralph follows the 7-Point Checklist, reaching step 5 (UI Verification)
  4. Ralph references the agent-browser skill for guidance on browser testing execution
  5. Ralph performs browser testing using agent-browser CLI, capturing screenshots as required
  6. Ralph checks off browser testing items in the dynamic checklist
  7. Ralph completes remaining checklist items and marks task as complete only when all items are checked (or justified)

- **Acceptance criteria:**
  - Ralph automatically detects UI tasks
  - Dynamic checklist is generated and includes browser testing requirements
  - Browser testing is performed before task completion
  - Checklist items cannot be bypassed without justification

### Technical Notes & Dependencies

**Technical Dependencies:**
- Existing agent-browser skill: `.devagent/plugins/ralph/skills/agent-browser/SKILL.md` (Available)
- AGENTS.md file: `.devagent/plugins/ralph/AGENTS.md` (Available)

**Integration Points:**
- 7-Point Checklist in AGENTS.md (step 5: UI Verification)
- Agent-browser skill documentation
- Task acceptance requirements mechanism

**No External Dependencies:**
- Documentation-only task, no code changes required
- No API or service dependencies

---

## PART 2: IMPLEMENTATION PLAN

### Scope & Assumptions

- **Scope focus:** Documentation updates to AGENTS.md and task acceptance requirements
- **Key assumptions:**
  - Ralph reads and follows instructions in AGENTS.md
  - Dynamic checklist can be implemented as part of the existing 7-Point Checklist structure
  - Agent-browser skill reference will help Ralph understand when and how to use browser testing
  - Simple, concise documentation will be more effective than complex rules
- **Out of scope:** Implementation changes to ralph.sh or other tooling

### Implementation Tasks

#### Task 1: Update AGENTS.md with Enhanced Browser Testing Instructions
- **Objective:** Clarify when browser testing is required, how to detect UI tasks, and strengthen the connection to the agent-browser skill
- **Impacted Modules/Files:**
  - `.devagent/plugins/ralph/AGENTS.md` (Quality Gates & Verification section, specifically step 5: UI Verification)
- **References:**
  - Clarification packet: `.devagent/workspace/tasks/completed/2026-01-14_process-pasted-content/clarification/2026-01-14_initial-clarification.md`
  - Agent-browser skill: `.devagent/plugins/ralph/skills/agent-browser/SKILL.md`
  - Current AGENTS.md: `.devagent/plugins/ralph/AGENTS.md`
- **Dependencies:** None
- **Acceptance Criteria:**
  - AGENTS.md clearly states when browser testing is required (UI tasks, frontend file changes)
  - Instructions reference the agent-browser skill explicitly
  - Instructions explain how to detect UI tasks (file extensions, task description)
  - Instructions include guidance on dynamic checklist generation for browser testing
  - Documentation is simple and concise
- **Testing Criteria:**
  - Review documentation for clarity and completeness
  - Verify agent-browser skill reference is correct and accessible
  - Ensure instructions are actionable without additional interpretation
- **Subtasks:**
  1. **Enhance step 5 (UI Verification) in 7-Point Checklist** — Add explicit detection criteria and dynamic checklist requirement
     - Validation: Documentation review
  2. **Add reference to agent-browser skill** — Link to `.devagent/plugins/ralph/skills/agent-browser/SKILL.md` in relevant sections
     - Validation: Verify link is correct and skill file exists
  3. **Add guidance on dynamic checklist** — Explain that browser testing items should be part of a dynamically generated checklist that must be completed before task completion
     - Validation: Documentation review for clarity
  4. **Add justification guidance** — Include guidance on when checklist items can be marked as "good enough for now" with appropriate justification
     - Validation: Documentation review
- **Validation Plan:** Documentation review to ensure clarity, completeness, and that it addresses the problem. Verify all references are correct.

#### Task 2: Enhance Task Acceptance Requirements with Dynamic Checklist Concept
- **Objective:** Update the 7-Point Checklist structure to emphasize dynamic checklist generation and enforcement for browser testing
- **Impacted Modules/Files:**
  - `.devagent/plugins/ralph/AGENTS.md` (Quality Gates & Verification section, The 7-Point Checklist)
- **References:**
  - Clarification packet: `.devagent/workspace/tasks/completed/2026-01-14_process-pasted-content/clarification/2026-01-14_initial-clarification.md`
  - Current AGENTS.md: `.devagent/plugins/ralph/AGENTS.md`
- **Dependencies:** Task 1 (should be done first to understand full context)
- **Acceptance Criteria:**
  - 7-Point Checklist includes instruction to generate a dynamic checklist at task start
  - Dynamic checklist includes browser testing items for UI tasks
  - Instructions clarify that all checklist items must be checked off (or justified) before task completion
  - Instructions balance clarity with flexibility (not too regimented)
- **Testing Criteria:**
  - Review documentation for clarity and completeness
  - Ensure dynamic checklist concept is clearly explained
  - Verify instructions give agent appropriate control while maintaining requirements
- **Subtasks:**
  1. **Add dynamic checklist generation instruction** — Update checklist introduction to require generating a dynamic checklist at task start
     - Validation: Documentation review
  2. **Enhance step 5 with checklist integration** — Connect browser testing requirements to the dynamic checklist
     - Validation: Documentation review
  3. **Add checklist completion requirement** — Clarify that all checklist items must be completed (or justified) before marking task as complete
     - Validation: Documentation review
- **Validation Plan:** Documentation review to ensure the dynamic checklist concept is clear and actionable. Verify it addresses the enforcement gap.

### Implementation Guidance

**From `.devagent/plugins/ralph/AGENTS.md` → Quality Gates & Verification:**
- The 7-Point Checklist structure exists and should be enhanced, not replaced
- Step 5 (UI Verification) already mentions browser testing but needs strengthening
- Current instruction: "IF frontend changes (.tsx, .css, .html) or UI tasks: Run `agent-browser` to visit the local URL. Perform DOM assertions to verify elements. **Capture Failure Screenshots** if assertions fail. **Capture Success Screenshots** ONLY if visual design review is expected."
- Enhancement needed: Make detection criteria more explicit, add dynamic checklist requirement, strengthen connection to agent-browser skill

**From `.devagent/plugins/ralph/skills/agent-browser/SKILL.md` → Smart Defaults & Triggers:**
- When to Run Browser Tests:
  1. **Explicit Requirement:** Task description demands UI verification.
  2. **Frontend Changes:** You modified `.tsx`, `.jsx`, `.css`, `.html`, or `tailwind` config.
  3. **UI Logic:** You changed client-side state management or routing.
- This guidance should be referenced in AGENTS.md to help Ralph detect when browser testing is required

**From `.devagent/workspace/memory/constitution.md` → C3. Delivery Principles:**
- Principle 3: "Iterate in thin slices" - Keep improvements simple and concise
- Principle 4: "Guardrails before generation" - Establish constraints (tools, permissions, review gates) prior to code generation
- These principles support the documentation-only approach and simple, concise improvements

**From Clarification Packet → Solution Principles:**
- Not too regimented - give the agent some power of control
- Balance clarity with flexibility
- Enable autonomous decision-making within clear boundaries
- Keep improvements simple and concise

### Release & Delivery Strategy

**Milestone 1: Documentation Updates Complete**
- Task 1: Update AGENTS.md with enhanced browser testing instructions
- Task 2: Enhance task acceptance requirements with dynamic checklist concept
- Review and validation of documentation updates

**Review Gates:**
- Documentation review to ensure clarity and completeness
- Verification that all references are correct and accessible
- Validation that documentation addresses the problem

**Launch Readiness:**
- All documentation files updated
- Agent-browser skill referenced appropriately
- Documentation reviewed and validated
- Changes committed to repository
- Documentation is simple and concise

### Approval & Ops Readiness

**Required Approvals:**
- Jake Ruesink (Owner, Decision Maker) - Documentation review and approval

**Operational Checklist:**
- Documentation changes committed to repository
- No operational changes required (documentation-only)

---

## Risks & Open Questions

| Item | Type (Risk / Question) | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Ralph may still not follow enhanced instructions | Risk | Jake Ruesink | Monitor Ralph's behavior on next UI tasks. If issue persists, consider implementation changes (separate task). | Ongoing |
| Dynamic checklist concept may be unclear | Risk | Jake Ruesink | Review documentation for clarity. Test with sample task to ensure instructions are actionable. | Before commit |
| Agent-browser skill reference may be broken | Risk | Jake Ruesink | Verify skill file exists and reference is correct before committing. | Before commit |
| Where exactly should dynamic checklist be documented? | Question | Jake Ruesink | Document in 7-Point Checklist section as part of the checklist structure. | Resolved in plan |

---

## Progress Tracking

Refer to the AGENTS.md file in the task directory (`.devagent/workspace/tasks/completed/2026-01-14_process-pasted-content/AGENTS.md`) for instructions on tracking and reporting progress during implementation.

---

## Appendices & References

### Agent Documentation
- `AGENTS.md` (root): `.devagent/plugins/ralph/AGENTS.md`
- `.devagent/core/AGENTS.md`: Standard workflow instructions

### Related Documentation
- Agent-browser skill: `.devagent/plugins/ralph/skills/agent-browser/SKILL.md`
- Constitution: `.devagent/workspace/memory/constitution.md`

### Task Artifacts
- Clarification packet: `.devagent/workspace/tasks/completed/2026-01-14_process-pasted-content/clarification/2026-01-14_initial-clarification.md`
- This plan: `.devagent/workspace/tasks/completed/2026-01-14_process-pasted-content/plan/2026-01-14_ralph-browser-testing-enforcement-plan.md`
