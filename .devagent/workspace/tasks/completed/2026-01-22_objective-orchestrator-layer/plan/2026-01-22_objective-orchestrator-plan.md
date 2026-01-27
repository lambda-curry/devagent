# Objective Orchestrator Layer Plan

- Owner: Jake Ruesink
- Last Updated: 2026-01-22
- Status: Draft
- Related Task Hub: `.devagent/workspace/tasks/active/2026-01-22_objective-orchestrator-layer/`
- Stakeholders: Jake Ruesink (Owner)

---

## PART 1: PRODUCT CONTEXT

### Summary
Implement an "Objective Orchestrator" layer above individual Ralph epics to manage multi-epic objectives. This system coordinates the execution of multiple dependent epics, manages a dedicated feature branch hub with stacked dependencies, and orchestrates the sequence of work using a "Suspend/Resume" loop model. It enables fully autonomous execution of large-scale objectives without human intervention for branching or coordination.

### Context & Problem
Currently, Ralph operates at the Epic level. Large objectives that span multiple epics require manual coordination: creating branches, stacking PRs, ensuring dependencies are met, and kicking off new loops when previous ones finish. This manual overhead limits the scale of autonomous work.

### Objectives & Success Metrics
- **Objective:** Enable an "Admin Loop" to manage the lifecycle of a multi-epic Objective.
- **Objective:** Automate "Hub + Stacking" branching strategy with autonomous rebasing.
- **Objective:** Implement a "Suspend/Resume" execution model for efficient waiting.
- **Metric:** An Objective with 3 dependent Epics runs to completion with 0 human git interventions.
- **Metric:** Orchestrator correctly detects "Review Needed" signals and resumes execution.

### Users & Insights
- **Primary User:** The `Objective Orchestrator` (AI Agent).
- **Secondary User:** Developers defining high-level objectives in markdown.
- **Insight:** Agents are capable of managing git complexity if given specialized roles (`BranchManager`) and clear protocols.

### Solution Principles
- **Admin Loop:** Reuse the Ralph loop engine; don't build a new execution platform.
- **Hybrid Planning:** Markdown for human intent (`objective-plan.md`), Beads tasks for machine execution.
- **Autonomous Git:** The agent owns the git graph; no "pause for human rebase."
- **Event-Driven:** Loops don't busy-wait; they suspend and wake up on signals (labels/comments).

### Scope Definition
- **In Scope:**
    - "Admin Loop" definition and templates.
    - `ObjectivePlanner`, `BranchManager`, `EpicCoordinator` agent roles.
    - `objective-plan.md` -> Beads Task sync logic.
    - Autonomous rebase and branch stacking logic.
    - Suspend/Resume loop control mechanism.
- **Out of Scope / Future:**
    - Cross-repository orchestration.
    - Visual dashboarding of the dependency graph.

### Functional Narrative

#### Setup & Kickoff
- **Trigger:** User creates `objective-plan.md` and starts the Orchestrator loop.
- **Action:** `ObjectivePlanner` reads the plan, creates the `feature/hub` branch, and generates Beads tasks for each Epic.
- **Action:** `EpicCoordinator` kicks off the first Epic (creating its branch off the hub) and triggers its loop.

#### Monitoring & Resume
- **State:** Orchestrator loop suspends (exits) while child Epic runs.
- **Trigger:** Child Epic finishes and adds `review-needed` label to its parent task.
- **Action:** Orchestrator loop wakes up (re-triggered), `EpicCoordinator` reviews the work, and `BranchManager` merges it to the hub (or updates stacks).

#### Dependency Management
- **Scenario:** Epic A merges to hub. Epic B (in progress) is now behind.
- **Action:** `BranchManager` autonomously detects the update and rebases Epic B's branch onto the new hub tip.

---

## PART 2: IMPLEMENTATION PLAN

### Scope & Assumptions
- **Scope focus:** Ralph Plugin (Orchestrator Logic & Roles)
- **Key assumptions:** Beads CLI supports necessary label/comment operations. `git` access is unrestricted.
- **Out of Scope:** Changes to the core Beads DB schema.

### Implementation Tasks

#### Task 1: Define Orchestrator Schema & Roles
- **Objective:** Create the template and role definitions for the Admin Loop.
- **Impacted Modules/Files:**
    - `.devagent/plugins/ralph/templates/orchestrator-loop.json` (New)
    - `.devagent/plugins/ralph/roles/objective-planner.md` (New)
    - `.devagent/plugins/ralph/roles/branch-manager.md` (New)
    - `.devagent/plugins/ralph/roles/epic-coordinator.md` (New)
- **References:** Clarification Packet
- **Acceptance Criteria:**
    - `orchestrator-loop.json` defines the standard Admin tasks.
    - Role prompts include specific instructions for Git Stacking and Plan Sync.
- **Validation Plan:** Manual review of role prompts.

#### Task 2: Implement Plan Sync Logic (`ObjectivePlanner`)
- **Objective:** Build the logic to sync `objective-plan.md` to Beads tasks.
- **Impacted Modules/Files:**
    - `.devagent/plugins/ralph/tools/sync-objective.ts` (New)
- **References:** Clarification Packet
- **Acceptance Criteria:**
    - Script parses markdown list/graph.
    - Creates/Updates Beads tasks to match.
    - Sets correct dependencies in Beads.
- **Validation Plan:** Unit test with sample markdown.

#### Task 3: Implement Autonomous Git Logic (`BranchManager`)
- **Objective:** Equip the `BranchManager` with robust git capabilities.
- **Impacted Modules/Files:**
    - `.devagent/plugins/ralph/tools/git-manager.ts` (New wrapper or extensive prompt instructions)
- **References:** Clarification Packet (Idea 3)
- **Acceptance Criteria:**
    - Agent can create `feature/hub`.
    - Agent can checkout feature branch off hub.
    - Agent can perform `git rebase origin/feature/hub` and handle standard conflicts (theirs/ours strategies).
- **Validation Plan:** Simulation script creating conflicting branches and asking agent to rebase.

#### Task 4: Implement Loop Suspend/Resume Logic
- **Objective:** Enable the "Wait for Signal" behavior.
- **Impacted Modules/Files:**
    - `.devagent/plugins/ralph/workflows/orchestrator-loop.md` (New)
    - `.devagent/plugins/ralph/tools/check-child-status.ts` (New)
- **References:** Clarification Packet
- **Acceptance Criteria:**
    - Workflow includes a step to check child task labels.
    - If label missing, workflow exits (Suspend).
    - If label present, workflow continues (Resume).
- **Validation Plan:** End-to-end test with a dummy child task.

#### Task 5: End-to-End Orchestrator Prototype
- **Objective:** Run a full multi-epic objective with the new system.
- **Impacted Modules/Files:**
    - `.devagent/workspace/tasks/active/2026-01-22_objective-orchestrator-layer/prototype/`
- **Dependencies:** Tasks 1-4
- **Acceptance Criteria:**
    - Orchestrator creates hub.
    - Kicks off Epic A.
    - Suspends.
    - Resumes upon Epic A completion.
    - Merges Epic A.
    - Kicks off Epic B.
- **Validation Plan:** Live run.

---

## Risks & Open Questions

| Item | Type | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Rebase Conflicts | Risk | Jake Ruesink | Prompt `BranchManager` to abort and alert on complex conflicts. | - |
| Loop Re-triggering | Question | Jake Ruesink | How do we automate the "Wake Up"? (Cron vs. Event). MVP = Manual/Cron. | - |

---

## Progress Tracking
Refer to the AGENTS.md file in the task directory for instructions on tracking and reporting progress during implementation.

---

## Appendices & References
- **Clarification Packet:** `.devagent/workspace/tasks/active/2026-01-22_objective-orchestrator-layer/clarification/2026-01-22_initial-clarification.md`
- **Brainstorm Packet:** `.devagent/workspace/tasks/active/2026-01-22_objective-orchestrator-layer/brainstorms/2026-01-22_orchestrator-architecture-brainstorm.md`
