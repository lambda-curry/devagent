# Review Plan Workflow Plan

- Owner: Jake Ruesink
- Last Updated: 2026-01-14
- Status: Draft
- Related Task Hub: `.devagent/workspace/tasks/active/2026-01-14_review-plan-workflow/`
- Stakeholders: Jake Ruesink (Owner, Decision Maker)

---

## PART 1: PRODUCT CONTEXT

### Summary
Create a `devagent review-plan` workflow that allows users to interactively review plan documents before implementation. The workflow provides a high-level summary of the plan and adaptively suggests how to walk through it (based on plan complexity), enabling users to review specific sections on demand or walk through the entire plan step-by-step. The workflow updates the plan document directly during review (not a separate artifact), helping users validate that plans align with their expectations before proceeding to implementation.

### Context & Problem
Plans are created by `devagent create-plan` and executed by `devagent implement-plan`, but there's currently no workflow to validate plans before implementation. Users must manually review plan documents, which can be time-consuming and may miss alignment issues. When plans don't match user expectations, rework occurs during or after implementation, wasting effort. (Sources: `clarification/2026-01-14_initial-clarification.md`, `research/2026-01-14_review-plan-workflow-research.md`)

**Current State:**
- Plans are created via `devagent create-plan`
- Plans are executed via `devagent implement-plan`
- No interactive review workflow exists
- Users must manually review plan documents

**User Pain:**
- No structured way to validate plans before implementation
- Manual review is time-consuming and may miss alignment issues
- Misalignment between plan approach and user expectations leads to rework

**Business Trigger:**
Validating plans before implementation reduces wasted effort and ensures alignment with user goals, supporting DevAgent's mission to improve quality and turnaround time.

### Objectives & Success Metrics
- **Primary objective:** Users can interactively review plans to validate alignment with expectations before implementation
- **Success criteria:**
  - Workflow feels good to use (manual testing, qualitative feedback)
  - Saves time in the long run by ensuring good plans before implementation
  - Users report it helps catch alignment issues early
  - Reduces need for plan revisions after implementation starts

### Users & Insights
- **Primary users:** Developers/engineers using DevAgent workflows who create plans and want to ensure the plan's approach matches their goals before implementation begins
- **Key insights:**
  - Users want flexibility: ability to review specific sections or do full walkthrough
  - Users prefer adaptive suggestions based on plan complexity (not rigid modes)
  - Updating plan document directly during review is preferred over separate artifact
  - Keep it relatively simple—focus on core functionality
- **Demand signals:** User feedback indicates desire for plan validation before implementation (Source: `clarification/2026-01-14_initial-clarification.md`)

### Solution Principles
- **Constitution compliance:** Must follow C3 (human-in-the-loop defaults) and C4 (tool-agnostic design)
- **Architecture:** Pure prompt engineering (no code changes), following existing interactive workflow patterns
- **Simplicity:** Keep it relatively simple—focus on core functionality
- **Adaptive interaction:** Analyze plan complexity and offer helpful suggestions (not rigid modes), adapt to user preferences naturally
- **Direct updates:** Update plan document during review (not separate artifact)

### Scope Definition
- **In Scope:**
  - High-level plan summary with ability to review specific sections on demand
  - Full step-by-step walkthrough of entire plan capability
  - Adaptive suggestions based on plan complexity (not rigid modes)
  - Update plan document directly during review process
  - Interactive session model similar to clarify-task and brainstorm (2-3 questions per turn, progress tracking, incremental saving)
- **Out of Scope / Future:**
  - Automatic plan approval/rejection (must remain human decision)
  - Integration with external issue trackers (Linear, Jira) for plan status updates
  - Batch review of multiple plans at once
  - Separate structured review artifact output (update plan directly instead)
  - Interactive validation questions (optional feature, can be added later)

### Functional Narrative

#### Flow: Review Plan with High-Level Summary and Selective Review
- **Trigger:** User invokes `devagent review-plan` with plan path
- **Experience narrative:**
  1. AI analyzes plan structure (counts sections, tasks, complexity indicators)
  2. AI presents high-level summary: plan overview, key sections, implementation task count
  3. AI offers helpful suggestions based on plan complexity (e.g., "This looks straightforward. Would you like to review the key sections, or walk through everything step-by-step?")
  4. User responds naturally (e.g., "review the objectives" or "let's walk through task 3")
  5. AI adapts interaction based on user preference:
     - If user wants specific sections: AI presents those sections with validation questions (2-3 per section), updates plan document
     - If user wants full walkthrough: AI proceeds systematically through all sections
  6. AI updates plan document incrementally during review (marks sections as reviewed, adds notes)
  7. User can change approach mid-session (e.g., "actually, let's review task 3 in detail")
  8. When complete or user exits, plan document reflects review status
- **Acceptance criteria:**
  - High-level summary is presented accurately
  - Suggestions are helpful and based on plan complexity
  - User can review specific sections on demand
  - Plan document is updated during review process
  - User can exit early and resume later (progress preserved)

#### Flow: Full Step-by-Step Walkthrough
- **Trigger:** User invokes `devagent review-plan` with plan path and indicates full walkthrough intent (or requests it during session)
- **Experience narrative:**
  1. AI presents high-level summary
  2. AI asks: "Would you like to walk through the entire plan step-by-step?"
  3. If yes, AI walks through each section sequentially:
     - Product Context sections (Summary → Problem → Objectives → Users → Principles → Scope → Functional Narrative)
     - Implementation Plan sections (Scope & Assumptions → Tasks → Guidance → Risks)
  4. For each section: AI presents section content, asks 2-3 validation questions (optional), waits for answers, updates plan document
  5. AI tracks progress: shows which sections are reviewed (✅), in progress (⏳), not started (⬜)
  6. User can exit early: progress is saved, plan document reflects review status
  7. When complete, plan document shows all sections reviewed
- **Acceptance criteria:**
  - All plan sections are walked through systematically
  - Progress tracking is visible and accurate
  - Plan document is updated incrementally
  - User can exit early and resume later

### Technical Notes & Dependencies
- **Plan template structure:** Must work with existing plan template (`.devagent/core/templates/plan-document-template.md`) without requiring template changes
- **Interactive workflow patterns:** Adapt patterns from clarify-task and brainstorm workflows (question batching, progress tracking, incremental saving)
- **Pure prompt engineering:** No code changes required—workflow is a markdown file with prompt instructions
- **Dependencies:** None—uses existing workflow patterns and plan template structure

---

## PART 2: IMPLEMENTATION PLAN

### Scope & Assumptions
- **Scope focus:** Create `devagent review-plan` workflow file following DevAgent workflow structure, pure prompt engineering approach
- **Key assumptions:**
  - Plan documents follow unified template structure (validated in research)
  - Interactive workflow patterns from clarify-task/brainstorm are applicable (validated in research)
  - AI will follow explicit prompt instructions for adaptive suggestions and plan document updates
  - Users will engage in conversation format (answering questions, expressing preferences naturally)
- **Out of scope:** Code implementation, template changes, external integrations, separate review artifacts

### Implementation Tasks

#### Task 1: Create Review Plan Workflow File
- **Objective:** Create `.devagent/core/workflows/review-plan.md` workflow file following DevAgent workflow structure with interactive session model
- **Impacted Modules/Files:**
  - `.devagent/core/workflows/review-plan.md` (new file)
- **References:**
  - `.devagent/core/workflows/clarify-task.md` (interactive session model pattern)
  - `.devagent/core/workflows/brainstorm.md` (interactive session model pattern)
  - `.devagent/core/workflows/create-plan.md` (workflow structure reference)
  - `.devagent/core/templates/plan-document-template.md` (plan structure reference)
  - `.devagent/core/AGENTS.md` (standard workflow instructions)
  - `clarification/2026-01-14_initial-clarification.md` (validated requirements)
  - `research/2026-01-14_review-plan-workflow-research.md` (research findings)
- **Dependencies:** None
- **Acceptance Criteria:**
  - Workflow file exists at `.devagent/core/workflows/review-plan.md`
  - Workflow follows DevAgent workflow structure (Mission, Standard Instructions Reference, Execution Directive, Inputs, Resource Strategy, Workflow steps)
  - Workflow includes interactive session model with question batching (2-3 per turn), progress tracking, incremental saving
  - Workflow includes adaptive suggestion logic (analyze plan complexity, offer helpful suggestions, not rigid modes)
  - Workflow includes instructions for updating plan document during review (not separate artifact)
  - Workflow follows Constitution C3 (human-in-the-loop defaults) and C4 (tool-agnostic design)
- **Testing Criteria:**
  - Manual review: Workflow file structure matches existing workflow patterns
  - Manual review: Workflow instructions are clear and follow DevAgent conventions
  - Manual review: Interactive session model matches clarify-task/brainstorm patterns
- **Subtasks:**
  1. Create workflow file with standard DevAgent structure (Mission, Standard Instructions Reference, Execution Directive, Inputs, Resource Strategy, Workflow steps)
     - Validation: File exists and follows workflow template structure
  2. Define mission, execution directive, and inputs
     - Validation: Workflow clearly states purpose, execution model, and required inputs (plan path)
  3. Implement interactive session model (question batching, progress tracking, incremental saving)
     - Validation: Workflow includes instructions for 2-3 questions per turn, progress tracking, incremental document saving
  4. Implement adaptive suggestion logic (analyze plan complexity, offer helpful suggestions)
     - Validation: Workflow includes instructions for analyzing plan structure and offering adaptive suggestions (not rigid modes)
  5. Implement plan document update instructions (update plan directly during review)
     - Validation: Workflow includes instructions for updating plan document during review (not separate artifact)
  6. Add human-in-the-loop defaults (C3 compliance)
     - Validation: Workflow explicitly requires human input for all decisions, no automatic approval
- **Validation Plan:** Manual review of workflow file against acceptance criteria and existing workflow patterns. Test workflow structure and instructions for clarity.

#### Task 2: Create Review Plan Command File
- **Objective:** Create `.agents/commands/review-plan.md` command file that provides standardized interface for invoking the review-plan workflow
- **Impacted Modules/Files:**
  - `.agents/commands/review-plan.md` (new file)
- **References:**
  - `.agents/commands/clarify-task.md` (command file structure reference)
  - `.agents/commands/create-plan.md` (command file structure reference)
  - `.devagent/core/workflows/review-plan.md` (workflow definition from Task 1)
- **Dependencies:** Task 1 (workflow definition)
- **Acceptance Criteria:**
  - Command file exists at `.agents/commands/review-plan.md`
  - Command file follows DevAgent command structure (references workflow file, includes input context placeholder)
  - Command file is properly formatted for agent execution
- **Testing Criteria:**
  - Manual review: Command file structure matches existing command file patterns
  - Manual review: Command file correctly references workflow file
- **Validation Plan:** Manual review of command file against acceptance criteria and existing command file patterns.

#### Task 3: Update Workflow Roster Documentation
- **Objective:** Update `.devagent/core/AGENTS.md` workflow roster to include `devagent review-plan` workflow
- **Impacted Modules/Files:**
  - `.devagent/core/AGENTS.md` (update workflow roster section)
- **References:**
  - `.devagent/core/AGENTS.md` (workflow roster section)
  - `.devagent/core/workflows/review-plan.md` (workflow definition from Task 1)
- **Dependencies:** Task 1 (workflow definition)
- **Acceptance Criteria:**
  - Workflow roster includes `devagent review-plan` entry
  - Entry includes brief description and usage guidance
  - Entry follows existing workflow roster format
- **Testing Criteria:**
  - Manual review: Workflow roster entry is present and follows format
  - Manual review: Description accurately reflects workflow purpose
- **Validation Plan:** Manual review of workflow roster update against acceptance criteria and existing roster format.

### Implementation Guidance

**From `.devagent/core/AGENTS.md` → Standard Workflow Instructions:**
- Date handling: When creating dated documents, always run `date +%Y-%m-%d` first to get current date in ISO format
- Metadata retrieval: To determine owner/author for metadata, run `git config user.name`
- Context gathering order: Review internal agent documentation, workflow definitions, rules & conventions, DevAgent workspace, then fallback sources
- Standard guardrails: Prefer authoritative sources, never expose secrets, tag uncertainties with `[NEEDS CLARIFICATION: ...]`
- Storage patterns: Task-scoped artifacts go to `.devagent/workspace/tasks/{status}/YYYY-MM-DD_task-slug/`, use `YYYY-MM-DD_<descriptor>.md` format for dated artifacts
- Execution directive: Execute immediately when invoked, only pause for missing REQUIRED inputs or blocking errors

**From `.devagent/core/workflows/clarify-task.md` → Interactive Session Model:**
- Question batching: Ask exactly 2-3 questions per turn, wait for answers before proceeding
- Progress tracking: Show progress header with dimension/phase checklist (✅ complete, ⏳ in progress, ⬜ not started)
- Incremental saving: Save document to disk after each user response to preserve progress
- Early exit support: Remind users they can end session by saying "all done" or by exiting
- Status labels: Use consistent status labels (✅, ⏳, ⬜, ❓, 🔍, ⚠️, 🚫, ⏭️, 🚧)

**From `.devagent/core/workflows/brainstorm.md` → Adaptive Interaction:**
- Adaptive questioning: Analyze context first, then adapt approach based on user preferences
- Natural interaction: User can express preferences naturally, workflow adapts flexibly
- No rigid modes: Offer helpful suggestions based on complexity, but remain flexible to user preferences

**From `.devagent/workspace/memory/constitution.md` → C3. Delivery Principles:**
- Human-in-the-loop defaults: Every agent interaction produces drafts that require explicit human confirmation before downstream automation proceeds
- Traceable artifacts: All agent outputs must link to mission metrics and cite research inputs

**From `.devagent/workspace/memory/constitution.md` → C4. Tool-Agnostic Design:**
- Tool-agnostic by default: Workflows must be designed to be tool-agnostic, enabling use across any AI development tool
- Pure prompt engineering: Core workflows remain tool-agnostic (no tool-specific code)

### Release & Delivery Strategy

**Implementation Approach:**
- Sequential task execution (Task 1 → Task 2 → Task 3)
- Pure prompt engineering: Modify workflow markdown files only, no code changes
- Test workflow manually after each task to ensure it feels good to use

**Validation Gates:**
- Task 1: Workflow file review against DevAgent patterns and acceptance criteria
- Task 2: Command file review against existing command file patterns
- Task 3: Workflow roster update review for completeness and accuracy
- Final: Manual testing of workflow with sample plan to ensure it feels good and works as expected

---

## Risks & Open Questions

| Item | Type (Risk / Question) | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Workflow complexity | Risk | Jake Ruesink | Keep it relatively simple—focus on core functionality, iterate based on usage | During implementation |
| Plan document update approach | Question | Jake Ruesink | Clarify exact format for updating plan document (comments, status markers, etc.) | Task 1 |
| Adaptive suggestion effectiveness | Risk | Jake Ruesink | Test with sample plans of varying complexity, refine suggestion logic based on feedback | After Task 1 |

---

## Progress Tracking
Refer to the AGENTS.md file in the task directory for instructions on tracking and reporting progress during implementation.

---

## Appendices & References

**Agent documentation:**
- `AGENTS.md` (root), `.devagent/core/AGENTS.md`

**Research and clarification:**
- `research/2026-01-14_review-plan-workflow-research.md` — Research on plan review patterns, interactive workflows, and validation approaches
- `clarification/2026-01-14_initial-clarification.md` — Validated requirements for review plan workflow

**Related workflows:**
- `.devagent/core/workflows/clarify-task.md` — Interactive clarification workflow (pattern reference)
- `.devagent/core/workflows/brainstorm.md` — Interactive brainstorm workflow (pattern reference)
- `.devagent/core/workflows/create-plan.md` — Plan creation workflow (predecessor)
- `.devagent/core/workflows/implement-plan.md` — Plan execution workflow (successor)

**Templates:**
- `.devagent/core/templates/plan-document-template.md` — Plan document template structure

**Constitution:**
- `.devagent/workspace/memory/constitution.md` — C3 (human-in-the-loop defaults), C4 (tool-agnostic design)
