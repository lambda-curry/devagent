# Traceability and Revision Quality Gates Integration Plan

- Owner: Jake Ruesink
- Last Updated: 2026-01-12
- Status: Draft
- Related Task Hub: `.devagent/workspace/tasks/active/2026-01-12_traceability-revision-quality-gates/`
- Stakeholders: Ralph Developers, Team Leads

---

## PART 1: PRODUCT CONTEXT

### Summary
Enhance Ralph's autonomous process by enforcing traceability (linking commits to tasks) and capturing localized revision learnings. This involves updating `ralph.sh` to post commit hashes and learnings as task comments, replacing centralized JSON revision logs. An Epic-level report will aggregate these comments to drive process improvements.

### Context & Problem
Currently, Ralph's revision learnings are siloed in JSON files, and traceability between commits and tasks relies on ad-hoc discipline. This disconnects learnings from the specific work context. We need localized learning captured directly on the tasks and a way to aggregate these insights for higher-level review.

### Objectives & Success Metrics
- **Objective 1: Ensure Traceability.** 100% of completed Ralph tasks must have a comment with the Commit Hash + Subject.
- **Objective 2: Capture Localized Learning.** 100% of completed Ralph tasks must have a "Learning/Status" comment.
- **Objective 3: Epic-level Aggregation.** Automatically generate an "Epic Retrospective Report" summarizing insights from all task comments in an epic.
- **Success Metrics:** 
  - Automated presence of commit and learning comments on all Ralph-processed tasks.
  - Generation of a categorized Epic report (Process, Docs, Tooling, Code).

### Users & Insights
- **Developers using Ralph:** Need a low-friction way to log learnings without context switching to JSON files.
- **Team Leads/Process Owners:** Require a high-level summary of execution patterns and friction points to improve workflows.

### Solution Principles
- **Localized Learning:** Capture insights *where* they happen (on the task).
- **Automated Aggregation:** Use AI to summarize and categorize the stream of task comments.
- **Mandatory Reflection:** Require an explicit note for every task, even if "nothing to report."

### Scope Definition
- **In Scope:**
  - Updating `ralph.sh` to enforce commit hash comments and learning comments.
  - Updating Ralph workflows to prompt for structured learning output.
  - Developing the "Epic Report Generator" workflow.
  - Categorizing insights into Process, Documentation, Tooling/CLI, Architecture/Code.
- **Out of Scope:**
  - Complex Git verification (hash presence is sufficient).
  - Manual report formatting.

---

## PART 2: IMPLEMENTATION PLAN

### Scope & Assumptions
- Scope focus: Ralph Plugin (`.devagent/plugins/ralph/`)
- Key assumptions: 
  - Beads CLI `bd list --parent` and `bd comments --json` work as expected.
  - AI tool output can be reliably parsed for a "Learning" section.

### Implementation Tasks

#### Task 1: Update `ralph.sh` for Traceability and Learning Comments
- **Objective:** Modify the autonomous loop to capture commit hashes and post them as comments, alongside a learning summary.
- **Impacted Modules/Files:** `.devagent/plugins/ralph/tools/ralph.sh`
- **Dependencies:** None
- **Acceptance Criteria:**
  - After a successful or failed task implementation, the script captures the latest commit hash.
  - The script posts a comment to the Beads task with the format: `Commit: <hash> - <subject>`.
  - The script extracts a "Learning" section from the AI tool output and posts it as a separate comment.
- **Subtasks:**
  1. Modify success/failure blocks to perform `git commit` *before* final `bd comments add`.
  2. Capture commit hash using `git rev-parse HEAD`.
  3. Extract "Learning" section from the AI output (stored in a variable/file).
  4. Post both comments using `bd comments add`.
- **Validation Plan:** Run `ralph.sh` on a dummy task and verify comments appear on the task in Beads.

#### Task 2: Update Ralph Workflows and Prompting
- **Objective:** Ensure the AI tool provides a structured "Revision Learning" section in its output for extraction and remove deprecated JSON logging instructions.
- **Impacted Modules/Files:** 
  - `.devagent/plugins/ralph/workflows/execute-autonomous.md`
  - `.devagent/plugins/ralph/AGENTS.md`
- **Dependencies:** Task 1
- **Acceptance Criteria:**
  - Workflows instruct the agent to include a `### Revision Learning` section in its final response.
  - The section must contain either a specific insight or "Nothing to report (and why)".
  - **Removal:** Instructions to create/log to `revise-issues.json` are removed from `execute-autonomous.md`.
- **Validation Plan:** Review updated workflow files and test with an agent run to ensure the section is present and JSON file is not requested.

#### Task 3: Refactor Revise Report Workflow to Epic Scope
- **Objective:** Overhaul the existing `generate-revise-report` workflow to aggregate comments from tasks in an epic instead of reading a session JSON file.
- **Impacted Modules/Files:** 
  - `.devagent/plugins/ralph/workflows/generate-revise-report.md` (Update to use Beads comments)
  - `.agents/commands/generate-revise-report.md` (Update inputs/instructions)
  - `.devagent/plugins/ralph/skills/revise-report-generation/SKILL.md` (Update data source strategy)
- **Dependencies:** None (can be developed in parallel)
- **Acceptance Criteria:**
  - Workflow inputs changed to accept an "Epic ID" or "Task List" instead of just "Session Context".
  - Workflow steps updated to fetch children of the epic and their comments using Beads CLI.
  - Report generation logic updated to summarize these comments into the standard categories (Process, Docs, Tooling, Code).
  - Deprecate/Remove "Step 2: Gather Execution Data" (JSON based) in favor of "Step 2: Aggregate Task Comments".
- **Validation Plan:** Manually trigger the updated workflow for an Epic ID and verify the generated report content.

#### Task 4: Finalize Quality Gates & Instructions
- **Objective:** Update `ralph/AGENTS.md` and standard instructions to reflect the new quality gates.
- **Impacted Modules/Files:** 
  - `.devagent/plugins/ralph/AGENTS.md`
  - `.devagent/workspace/memory/constitution.md` (Optional: add traceability principle)
- **Acceptance Criteria:**
  - Documentation clearly states that commit hash and learning comments are mandatory.
  - Instructions for the "Epic Quality Gate" are added.
- **Validation Plan:** Verify documentation accuracy.

### Implementation Guidance

- **From `.devagent/plugins/ralph/AGENTS.md` → Commit Messaging Guidelines:**
  - Follow Conventional Commits v1.0.0.
  - Reference Beads task ID in the subject.
- **From `.devagent/core/workflows/review-pr.md` → Traceability patterns:**
  - Linking review artifacts to task hubs and Linear issues (apply similar pattern for Epic reports).
- **From `bd comments --help`:**
  - Use `bd comments <id> --json` for machine-readable comment retrieval.

---

## Risks & Open Questions

| Item | Type | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Beads CLI performance with many comments | Risk | Jake | Test with a mock epic containing 20+ tasks and 100+ comments. | 2026-01-13 |
| AI tool output parsing reliability | Risk | Jake | Use a clear delimiter (e.g. `### Revision Learning`) and fallback if not found. | 2026-01-13 |
| How to handle tasks that span multiple epics? | Question | Jake | Assume single parent for now as per Ralph current workflow. | 2026-01-13 |

---

## Progress Tracking
Refer to the AGENTS.md file in the task directory for instructions on tracking and reporting progress during implementation.

---

## Appendices & References
- Clarification Packet: `.devagent/workspace/tasks/active/2026-01-12_traceability-revision-quality-gates/clarification/2026-01-12_initial-clarification.md`
- Ralph Script: `.devagent/plugins/ralph/tools/ralph.sh`
- Ralph AGENTS.md: `.devagent/plugins/ralph/AGENTS.md`
