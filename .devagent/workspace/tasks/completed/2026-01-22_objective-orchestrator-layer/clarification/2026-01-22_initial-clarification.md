# Clarification Packet — Objective Orchestrator Layer

- Task Hub: `.devagent/workspace/tasks/active/2026-01-22_objective-orchestrator-layer/`
- Requestor: Jake Ruesink
- Decision Maker: Jake Ruesink
- Status: ⏳ in progress
- Last Updated: 2026-01-22

## Task Overview

Establish an "Objective Orchestrator" layer above individual Ralph epics to manage multi-epic objectives. Key responsibilities include coordinating multi-epic kickoffs, ensuring work occurs on a dedicated feature branch, and managing stacked dependent branches for concurrent epic execution.

## Progress Header

Clarification for the Objective Orchestrator is starting. I have context from the brainstorm session: an "Admin Epic" approach, plan via Beads tasks, branch coordinator agent, and context handoff via comments. We need to define the specific mechanics of the "Admin Loop" and the branching strategy.

- **What's next:** Clarifying the branching mechanics and the "Admin Loop" structure.

## Question Tracker

| ID | Question | Status |
| --- | --- | --- |
| 1 | How should the Orchestrator handle the "hybrid" branching strategy (hub + stacking)? | ⏳ in progress |
| 2 | What specific tasks/steps should exist in the "Admin Loop" template? | ⏳ in progress |
| 3 | How do we define the interface between the Orchestrator and the child Epics? | ⏳ in progress |

## Clarified Requirements

### Core Technical Dimensions

- **Scope & End Goal:** Deliver an Orchestrator system that runs as a Ralph loop (Admin Epic) to coordinate multiple child Epics.
- **Branching Strategy:** "Hub + Stacking" model. 
  - A long-lived `feature/objective-hub` branch serves as the integration point.
  - Child epics branch off the hub (or each other if dependent).
  - Merges go back to the hub.
- **Admin Loop Structure:**
  - `Setup Objective`: Create hub branch, validate plan.
  - `Kickoff Epic`: Trigger child loop.
  - `Review Epic`: Check status/report.
  - `Merge Epic`: Merge to hub.
  - `Teardown Objective`: Cleanup.
- **Monitoring Strategy:** Suspend/Resume (B). The Orchestrator task marks itself as `blocked`/`waiting` and the loop exits. It requires an external trigger (cron/webhook/human) to wake up and check the child epic's status.
- **Rebasing Strategy:** Auto-Rebase (A). The `BranchManager` agent is responsible for performing git rebases autonomously. No human-in-the-loop for standard rebase operations.
- **Plan Source:** Hybrid (B). A markdown `objective-plan.md` serves as the source of truth, from which the Orchestrator generates/updates the Beads tasks.

### Technical Constraints
- Must use existing Ralph loop engine.
- Must use Beads tasks for state tracking.
- Branching logic must be robust (handle conflicts or pause).
- Orchestrator loop must support "waking up" to check status without continuous polling.

---

## Clarification Session Log

### Session 1: 2026-01-22
**Participants:** Jake Ruesink (Owner)

**Questions & Answers:**

1. **How should the Orchestrator manage the `feature/hub` branch?**
   - **Answer:** Long-lived hub branch (A). It persists for the objective, serves as the integration target.

2. **What specific tasks should be in the "Admin Loop" template?**
   - **Answer:** All suggested: Setup, Kickoff, Review, Merge, Teardown. Each with specialized agent roles.

3. **How does the Orchestrator know when a child Epic is "done"?**
   - **Answer:** Event/Callback (B). Child epic updates the parent Orchestrator task upon completion.

4. **Specific Callback Mechanism?**
   - **Answer:** Beads Label/Comment (B). Child adds a label/comment. Need to verify if we can "trigger" off this.

5. **Agent Roles for Admin Loop?**
   - **Answer:** Distinct roles (A+C): `ObjectivePlanner`, `BranchManager` (GitSpecialist), `EpicCoordinator`.

6. **Who handles rebasing stacked branches?**
   - **Answer:** The Orchestrator (A). It manages the dependency graph and runs rebase tasks.

7. **Monitoring Strategy (Waiting for Child)?**
   - **Answer:** Suspend/Resume (B). Loop exits and waits for re-trigger.

8. **Rebasing Autonomy?**
   - **Answer:** Auto-Rebase (A). AI manages it fully; no human-in-the-loop desired.

9. **Plan Definition Source?**
   - **Answer:** Hybrid (B). Markdown `objective-plan.md` is source; Beads tasks are execution.

---
