# Final Agent Workflow for PR Creation and Reporting Plan

- Owner: Jake Ruesink
- Last Updated: 2026-01-13
- Status: Draft
- Related Task Hub: `.devagent/workspace/tasks/active/2026-01-13_final-agent-pr-creation-reporting/`
- Stakeholders: Jake Ruesink (AgentBuilder, Decision Authority)

---

## PART 1: PRODUCT CONTEXT

### Summary
Design and implement two Ralph-specific agents to fully automate the execution lifecycle: a **Setup Agent** that prepares the workspace before execution, and a **Final Review Agent** that handles PR creation and reporting after execution (success or failure). This replaces the current shell-script-based PR automation in `ralph.sh` with agent-driven intelligence, enabling richer PR summaries, automated git management, and integrated revise reports without human intervention.

### Context & Problem
Currently, standard DevAgent workflows leave changes uncommitted and require manual PR creation. The Ralph plugin has basic PR automation via shell scripts (`ralph.sh`), but it lacks the intelligence to generate comprehensive summaries or handle complex git states gracefully. We need to elevate this process to use agents that can "understand" the work done, summarize it effectively in a PR, and manage the git workspace autonomously.

### Objectives & Success Metrics
- **Automated Setup:** Setup agent successfully validates epic/tasks and prepares the git branch/workspace before the main Ralph loop starts.
- **Rich Reporting:** Final review agent creates/updates PRs with comprehensive, intelligent summaries of work accomplished and blocking issues.
- **Cycle Visibility:** PRs are created/updated on *every* cycle break (error or clean completion), ensuring visibility into autonomous runs.
- **Seamless Integration:** Both agents run automatically as part of the `ralph.sh` execution flow with no human-in-the-loop.

### Users & Insights
- **Engineering Managers/Leads:** Need visibility into what the autonomous agent accomplished during a run without reading raw logs.
- **Developers:** Need a consistent PR artifact to review code and process improvements (revise reports).

### Solution Principles
- **Ralph-Specific:** These are plugin-specific workflows living in `.devagent/plugins/ralph/`, not general-purpose DevAgent workflows.
- **Fully Automated:** No human confirmation steps; the goal is autonomous execution from plan to PR.
- **Agent-Driven:** Use LLM prompts to generate summaries and decisions, not just static shell scripts.
- **Fail-Safe:** Setup failure prevents execution; Final Review failure is logged but tries to preserve evidence.

### Scope Definition
- **In Scope:**
  - `setup-workspace` workflow: Git prep, branch management, epic validation.
  - `final-review` workflow: PR creation, summary generation, revise report generation.
  - Integration with `ralph.sh` (replacing existing shell logic).
- **Out of Scope:**
  - General-purpose PR creation for manual DevAgent workflows.
  - Interactive/Human-in-the-loop confirmation steps for these specific agents.

---

## PART 2: IMPLEMENTATION PLAN

### Scope & Assumptions
- **Scope:** Ralph Plugin (`.devagent/plugins/ralph/`).
- **Assumption:** `gh` CLI is installed and authenticated.
- **Assumption:** Users working with Ralph have accepted the "no human-in-the-loop" model for this plugin.

### Implementation Tasks

#### Task 1: Create Setup Agent Workflow
- **Objective:** Create the workflow that prepares the environment for Ralph execution.
- **Impacted Modules/Files:**
  - New: `.devagent/plugins/ralph/workflows/setup-workspace.md`
- **Acceptance Criteria:**
  - Workflow validates that the Epic and Tasks exist and are readable.
  - Workflow checks for a clean git state (or handles stash/discard based on policy).
  - Workflow determines the correct branch name (`ralph/<epic-id>`) and creates/checks it out.
  - Workflow ensures the branch is pushed/upstreamed.
- **Validation Plan:** Run `devagent setup-workspace` manually with a test Epic ID and verify git branch state.

#### Task 2: Create Final Review Agent Workflow
- **Objective:** Create the workflow that wraps up execution and reports results.
- **Impacted Modules/Files:**
  - New: `.devagent/plugins/ralph/workflows/final-review.md`
- **References:** `.devagent/plugins/ralph/workflows/generate-revise-report.md`
- **Acceptance Criteria:**
  - Workflow reads the execution context (Tasks statuses, comments).
  - Workflow generates a natural language summary of work completed and any blockers.
  - Workflow invokes (or integrates) the `generate-revise-report` logic to append process improvements.
  - Workflow uses `gh pr create` (or `edit`) to publish the PR with the generated summary.
  - Workflow handles both "Clean Success" and "Error/Blocked" states.
- **Validation Plan:** Run `devagent final-review` manually after a mock task execution and verify a PR is created on GitHub with the expected content.

#### Task 3: Integrate Agents into Ralph Script
- **Objective:** Wire the new agents into the `ralph.sh` execution loop.
- **Impacted Modules/Files:**
  - Modify: `.devagent/plugins/ralph/tools/ralph.sh`
- **Acceptance Criteria:**
  - `setup-workspace` runs *before* the main loop. If it fails, the loop does not start.
  - Existing shell-script PR creation logic (lines 281-357) is removed/disabled.
  - `final-review` runs in the `finish` trap or after the loop breaks, ensuring it runs on both success and error.
  - Execution context (Epic ID, Task IDs) is correctly passed to the agents.
- **Validation Plan:** Execute a full `ralph.sh` cycle (dry run or test epic) and observe the logs for Setup and Final Review agent execution.

#### Task 4: Documentation & Cleanup
- **Objective:** Update plugin documentation to reflect the new agent-driven flow.
- **Impacted Modules/Files:**
  - Modify: `.devagent/plugins/ralph/AGENTS.md`
- **Acceptance Criteria:**
  - Documentation explains the role of the Setup and Final Review agents.
  - Updated troubleshooting guide for agent failures.
- **Validation Plan:** Review `AGENTS.md` for clarity and accuracy.

### Implementation Guidance

**From `.devagent/plugins/ralph/AGENTS.md` → Commit Messaging Guidelines:**
> - Follow **Conventional Commits v1.0.0** when composing the subject line.
> - Reference the Beads task ID in the subject or the first line of the body.
> - Preserve the `Co-authored-by: Ralph <ralph@autonomous>` trailer.

**From `.devagent/workspace/memory/constitution.md` → Delivery Principles:**
> - All agent outputs must link to mission metrics and cite research inputs.
> - All code changes must be traceable to specific tasks via commit messages and comments.

**From `.devagent/plugins/ralph/tools/ralph.sh` (Current PR Logic):**
> Current logic checks for `gh`, pushes branch, generates a markdown report from task statuses, and runs `gh pr create`. The new agent should replicate the *intent* of these steps but generate the *content* dynamically.

---

## Risks & Open Questions

| Item | Type | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| GitHub CLI Availability | Risk | Jake Ruesink | Ensure `ralph.sh` checks for `gh` before invoking agents, or agents handle missing `gh` gracefully. | Implementation |
| Token Usage | Risk | Jake Ruesink | Agent-driven reporting consumes tokens; verify costs are acceptable for frequent runs. | Implementation |
| Loop/Cycle Break Handling | Question | Jake Ruesink | Need to ensure `trap` logic in `ralph.sh` correctly captures the exit code/reason to pass to the Final Review agent. | Task 3 |

---

## Progress Tracking
Refer to the `AGENTS.md` file in the task directory for instructions on updating the progress log.
