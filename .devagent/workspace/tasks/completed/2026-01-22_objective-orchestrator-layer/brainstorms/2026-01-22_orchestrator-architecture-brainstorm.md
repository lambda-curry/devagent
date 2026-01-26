# Brainstorm Packet — Objective Orchestrator Layer

- Mode: Exploratory
- Session Date: 2026-01-22
- Participants: Jake Ruesink (Solo)
- Storage Path: `.devagent/workspace/tasks/active/2026-01-22_objective-orchestrator-layer/brainstorms/2026-01-22_orchestrator-architecture-brainstorm.md`
- Related Artifacts: 
  - Task hub: `.devagent/workspace/tasks/active/2026-01-22_objective-orchestrator-layer/AGENTS.md`
  - Ralph config: `.devagent/plugins/ralph/tools/config.json`
  - Setup workflow: `.devagent/plugins/ralph/workflows/setup-ralph-loop.md`

## Problem Statement

We need an "Objective Orchestrator" layer above individual Ralph epics to manage multi-epic objectives. This layer must coordinate the kickoff of multiple epics, ensure all work happens on a dedicated feature branch, manage stacked dependent branches for concurrent epic execution, and orchestrate the sequence and dependencies between multiple Ralph loops.

## Ideas (Divergent Phase)

_Generated using multiple ideation techniques._

**Progress Tracker:**
`Problem ✅ | Ideas ⏳ (1 ideas) | Clustering ⬜ | Evaluation ⬜ | Prioritization ⬜`

1. **Orchestrator as a Specialized "Admin" Epic**
   - **Concept:** The Orchestrator runs as a standard Ralph loop (an "Epic" in Beads terms), but with a distinct `type: "orchestration"`.
   - **Roles:** It uses a specialized agent roster: `LoopStarter`, `BranchCoordinator`, `ObjectivePlanner`.
   - **Mechanism:** Its "tasks" are meta-actions (e.g., "Prepare Branch Strategy", "Trigger Epic A", "Review Epic A"). This preserves the consistent "Loop > Task" shape but changes the *domain* of work from code to coordination.
   - **Status:** Modified (User Input)

2. **Objective Defined via Beads Tasks (No External Artifact)**
   - **Concept:** The "Objective" plan is defined purely by the tasks within the Orchestrator Epic.
   - **Mechanism:** Instead of reading an `objective.json`, the Orchestrator Epic has tasks like "Execute User Auth Epic", "Execute Dashboard Epic". The dependencies *between* these Orchestrator tasks define the execution order.
   - **Status:** Modified (User Input)

3. **Branch Coordinator Agent Role (Prompt-Driven)**
   - **Concept:** Instead of a rigid programmatic tool, use a specialized `BranchCoordinator` agent role with comprehensive instructions.
   - **Mechanism:** This agent is prompted with "Git Flow Strategies" and "Stacking Best Practices". It uses standard `bash` tools (git commands) but follows a strict protocol defined in its system prompt/instructions.
   - **Status:** Modified (User Input)

4. **Context Handoff via Beads Comments**
   - **Concept:** Use Beads comments as the primary mechanism for inter-epic communication.
   - **Mechanism:** When Epic A finishes, the Orchestrator (or the finishing agent) posts a summary comment on Epic B's Beads issue (e.g., "Dependency Epic A completed. Key changes: X, Y. Open risks: Z.").
   - **Status:** Modified (User Input)

5. **Re-Planning via Standard Beads Management (Re-open/Add)**
   - **Concept:** Dynamic adjustments are handled by standard Beads operations: re-opening closed Epics/Tasks or adding new ones.
   - **Mechanism:** If the Orchestrator (during a review task) finds issues, it simply re-opens the failed Epic or adds a new "Fix It" task/epic to the queue. The loop then naturally picks these up.
   - **Status:** Modified (User Input)

6. **Blocked State Propagation (Safety Valve)**
   - **Concept:** Epic-level blocks bubble up to the Orchestrator task.
   - **Mechanism:** If a child Epic is blocked and cannot be auto-resolved, the Orchestrator marks its own "Execute Epic" task as blocked.
   - **Why:** Acts as a safety valve. While autonomy is the goal, we need a mechanism to stop the train if a bridge is out. Hopefully rare.
   - **Status:** Modified (User Input)

## Clustered Themes

1.  **Architecture & Data Model**
    *   Orchestrator as a Specialized "Admin" Epic (Idea 1)
    *   Objective Defined via Beads Tasks (Idea 2)
    *   Context Handoff via Beads Comments (Idea 4)

2.  **Execution & Control**
    *   Branch Coordinator Agent Role (Idea 3)
    *   Re-Planning via Standard Beads Management (Idea 5)
    *   Blocked State Propagation (Idea 6)

## Prioritized Candidates (Top 3-5)

1.  **Orchestrator as Admin Epic** — The foundational concept. Reuses the Ralph loop engine for meta-coordination.
2.  **Plan via Beads Tasks** — Simplifies the "Objective" definition to just be the tasks within the Orchestrator loop.
3.  **Branch Coordinator Role** — Critical for enabling the "hybrid stacking" strategy without rigid tooling.
4.  **Standard Re-Planning** — Ensures the system is dynamic and self-healing using existing primitives.

## Research Questions for #ResearchAgent

1.  What are the specific prompt requirements for a `BranchCoordinator` agent to safely handle rebasing stacked branches?
2.  How do we structure the `start-epic-loop` tool to ensure the child process is monitored correctly by the parent loop?

## Parking Lot (Future Ideas)
*   Visual dashboard for the dependency graph (out of scope for backend architecture).
*   Cross-repo orchestration (future).

## Session Log

**Context Answers:**
1. **Trigger:** High-level product goal or multi-plan dependency graph (A/B).
2. **Branching:** Hybrid of Feature Branch Hub (C) and Optimistic Stacking (B). Orchestrator manages this complexity.
3. **Role:** Active Driver (B). Orchestrator runs as its own loop, triggering epic loops and re-evaluating state between them (Orchestrator -> Epic Loop -> Orchestrator).

## Ideas (Divergent Phase)
