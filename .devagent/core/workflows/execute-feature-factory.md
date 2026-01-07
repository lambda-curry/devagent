# Execute Feature Factory

## Mission
- Primary goal: Automate the discovery and implementation of multiple improvements by chaining the brainstorm and execute-full-task workflows.
- Boundaries / non-goals: Do not bypass audit trails or skip task hub creation. Do not execute more than 5 tasks in a single run to avoid context exhaustion.
- Success signals: 5 prioritized features brainstormed, 5 task hubs created and executed through their respective lifecycle, and clear audit trails preserved in each task hub's AGENTS.md.

## Standard Instructions Reference
Before executing this workflow, review standard instructions in `.devagent/core/AGENTS.md` -> Standard Workflow Instructions for:
- Date handling
- Metadata retrieval
- Context gathering order
- Standard guardrails
- Storage patterns

## Execution Directive
Follow standard execution directive in `.devagent/core/AGENTS.md` -> Standard Workflow Instructions, with the following workflow-specific customization:
- Execute the brainstorm workflow in `exploratory` mode first.
- Proceed to execute-full-task for the top 5 candidates sequentially.
- Do not pause between the brainstorm and the first task unless missing required inputs.

## Inputs
- Required: A high-level goal or area for improvement (e.g., "improve devagent automation", "enhance developer experience").
- Optional: Number of features (default 5), complexity hint for tasks (default complex), specific focus areas or constraints.

## Workflow
1. **Initial Brainstorm:**
   - Execute `devagent brainstorm` in `exploratory` mode for the provided goal.
   - Generate 15-20 ideas, then cluster and prioritize them.
   - Finalize the Brainstorm Packet in `.devagent/workspace/product/brainstorms/`.
2. **Candidate Selection:**
   - Identify the top 5 candidates from the "Prioritized Candidates" section of the Brainstorm Packet.
3. **Task Execution Loop:**
   - For each of the 5 candidates:
     - Execute `devagent execute-full-task` with the candidate's description.
     - Use `complexity: complex` (or user-provided hint).
     - Ensure the task hub is created and the execution summary is updated in `AGENTS.md` after each phase.
4. **Final Summary:**
   - Provide a high-level summary of the brainstorm results.
   - List the 5 tasks created and their final status.
   - Provide links to all 5 task hubs for review.

## Failure & Escalation
- If brainstorm fails to produce 5 viable candidates: proceed with available candidates and report the shortfall.
- If a specific task execution fails: document the failure in that task's hub, report it in the final summary, and proceed to the next candidate.
- Context exhaustion: If the context window becomes too large, use `devagent handoff` to continue the next task in a fresh session.

## Expected Output
- 1 Brainstorm Packet.
- 5 New Task Hubs, each with a completed or in-progress `execute-full-task` lifecycle.
- Final summary report with status and links for all items.
