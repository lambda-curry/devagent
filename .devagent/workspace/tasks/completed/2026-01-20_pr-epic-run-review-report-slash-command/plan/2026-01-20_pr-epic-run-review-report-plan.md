# PR Epic Run Review Report Slash Command Plan

- Owner: Jake Ruesink
- Last Updated: 2026-01-20
- Status: Draft
- Related Task Hub: `.devagent/workspace/tasks/completed/2026-01-20_pr-epic-run-review-report-slash-command/`
- Stakeholders: Jake Ruesink (Requestor/Decision Maker)
- Notes: Clarification complete; this plan converts the clarification packet into execution tasks.

---

## PART 1: PRODUCT CONTEXT

### Summary
Establish a repeatable “run review report” workflow and slash command that evaluates any PR + Beads epic run against the canonical `ralph-e2e` expectations. The workflow will produce a `run-report.md` artifact, post an epic summary, and update the PR description with a run summary so Ralph loops get tighter feedback and run outcomes are traceable.

### Context & Problem
The current `ralph-e2e` loop relies on Beads comments + screenshots to capture review outcomes, but there is no standardized report that aggregates evidence, evaluates against the rubric, and states next-run improvements. We also need to tighten run hygiene (early PR, PM setup task) and make loop-wide agent guidance configurable so collaboration norms stay consistent across runs. References: `.devagent/workspace/tests/ralph-e2e/expectations/expectations.md`, `.devagent/workspace/tests/ralph-e2e/runs/README.md`, `.devagent/plugins/ralph/tools/ralph.ts`.

### Objectives & Success Metrics
- A new slash command + `revise-report` workflow generates a run report for any PR + epic run and references the latest expectations rubric.
- A narrative `run-report.md` is written to `runs/YYYY-MM-DD_<epic-id>/` and referenced in Beads/PR summaries.
- PR hygiene is enforced: PR created early (draft OK), body contains run links + test plan, and run summary updates on final revise-report task.
- Loop-wide preamble and role sign-off conventions are configurable via run config and consistently applied.
- Working branch guardrails + per-task push cadence are enforced for Ralph runs.

### Users & Insights
Primary users are DevAgent maintainers running the `ralph-e2e` loop who need a reliable, quick way to assess run quality and identify next-run improvements. The clarified requirements emphasize using Beads as the source of truth while still storing a report artifact for review convenience.

### Solution Principles
- Keep evaluation grounded in the canonical expectations rubric.
- Store a report artifact in the run folder while still posting summaries in Beads + PR.
- Preserve loop audibility by linking evidence paths and configuration sources.
- Favor configurable, explicit agent guidance over hard-coded behavior.

### Scope Definition
- **In Scope:** New slash command + workflow, report generation, Beads summary + PR update, run-folder policy update, PM/coordinator setup task behavior, loop-wide preamble configuration, role sign-off convention, working-branch enforcement, per-task push guidance.
- **Out of Scope / Future:** Automatic edits to expectations or plan documents; full automation of GitHub review processes beyond PR description updates.

### Functional Narrative
#### Flow: Generate Run Review Report
- Trigger: User runs the slash command with PR reference + Beads epic id.
- Experience narrative:
  - Canonicalize the PR reference.
  - Resolve run folder from epic header comment or by searching `runs/*_<epic-id>/`.
  - Read latest expectations rubric and evaluate evidence sources.
  - Write `run-report.md` into the run folder and publish summaries to Beads + PR.
- Acceptance criteria:
  - Report is created at the expected path and includes rubric-aligned sections.
  - Beads epic comment includes a short summary and report link.
  - PR description includes a run summary section referencing the report.

### Technical Notes & Dependencies
- Ralph config location: `.devagent/plugins/ralph/tools/config.json` (base/working branch definitions).
- Prompt assembly and shared instructions: `.devagent/plugins/ralph/tools/ralph.ts` and `.devagent/plugins/ralph/AGENTS.md`.
- Run folder policy currently says screenshots-only; policy update required: `.devagent/workspace/tests/ralph-e2e/runs/README.md`.

---

## PART 2: IMPLEMENTATION PLAN

### Scope & Assumptions
- Scope focus: `ralph-e2e` loop review/reporting workflows and Ralph execution guidance.
- Key assumptions:
  - Slash command is a DevAgent workflow command (not Slack).
  - Latest `expectations/expectations.md` is always the rubric (no strict pinning).
  - PR reference will be canonicalized internally.
- Out of scope: automated expectations edits.

### Implementation Tasks

#### Phase 1: Alignment + Policy Updates (decision closure and documentation)

#### Task 1: Close deferred decisions + define config schema for loop-wide preamble
- **Objective:** Resolve deferred decisions and codify how the preamble and role sign-offs are configured and enforced.
- **Impacted Modules/Files:**
  - `.devagent/plugins/ralph/tools/config.json`
  - `.devagent/plugins/ralph/AGENTS.md`
  - `.devagent/plugins/ralph/tools/ralph.ts`
  - `.devagent/workspace/tasks/active/2026-01-20_pr-epic-run-review-report-slash-command/clarification/2026-01-20_initial-clarification.md`
- **References:** Clarification packet (decision list), Ralph config + prompt assembly.
- **Dependencies:** None.
- **Acceptance Criteria:**
  - A decided schema for the loop-wide preamble (string vs path) is recorded and reflected in config + docs.
  - Role-name mapping list and sign-off strictness (every comment vs handoff-only) are documented.
  - Enforcement behavior for “working_branch should never be main” is decided and recorded.
- **Testing Criteria:** Manual review of config and workflow docs for consistency.
- **Validation Plan:** Cross-check plan assumptions against updated config and workflow docs.

#### Task 2: Update run-folder policy docs to allow `run-report.md`
- **Objective:** Align run folder documentation with the new report artifact policy.
- **Impacted Modules/Files:**
  - `.devagent/workspace/tests/ralph-e2e/runs/README.md`
  - `.devagent/workspace/tests/ralph-e2e/README.md`
  - `.devagent/workspace/tests/ralph-e2e/expectations/expectations.md` (references to screenshots-only policy)
- **References:** Clarification decision to allow `run-report.md` in run folders.
- **Dependencies:** Task 1 (policy language should match decisions).
- **Acceptance Criteria:**
  - Run-folder docs explicitly allow `run-report.md` alongside screenshots.
  - “Source of truth” guidance remains clear (Beads comments still authoritative).
- **Testing Criteria:** N/A (documentation-only).
- **Validation Plan:** Ensure all references to screenshots-only policy are updated or qualified.

#### Phase 2: Workflow + Ralph loop enhancements

#### Task 3: Implement `revise-report` generation (report + Beads summary + PR update)
- **Objective:** Build the `revise-report` workflow that generates `run-report.md`, posts a Beads epic summary, and updates the PR description.
- **Impacted Modules/Files:**
  - `.devagent/plugins/ralph/workflows/generate-revise-report.md`
  - `.devagent/plugins/ralph/workflows/` (new revise-report workflow or new slash command entry)
  - `.agents/commands/` + `.cursor/commands/` (new command interface)
  - `.devagent/workspace/tests/ralph-e2e/expectations/expectations.md` (rubric input)
- **References:** Clarification packet; expectations rubric; run folder conventions.
- **Dependencies:** Task 1 (config schema decisions), Task 2 (policy alignment).
- **Acceptance Criteria:**
  - Workflow accepts PR reference + epic id and canonicalizes PR input.
  - Run folder resolution uses epic header comment first, fallback to `runs/*_<epic-id>/` search.
  - Report is written to `runs/YYYY-MM-DD_<epic-id>/run-report.md` and references expectations version.
  - Beads epic comment receives a concise summary with report link.
  - PR description includes a “Run Summary” section updated by the final revise-report task.
- **Testing Criteria:** Dry-run the workflow locally with sample inputs (no live PR edits unless explicitly requested).
- **Validation Plan:** Check output paths and content structure; verify summary placement in Beads/PR update instructions.

#### Task 4: Add PM/coordinator setup task behavior + PR finalized requirements
- **Objective:** Ensure the epic includes an initial PM/coordinator setup task and PR hygiene expectations are enforced.
- **Impacted Modules/Files:**
  - `.devagent/plugins/ralph/workflows/setup-ralph-loop.md`
  - `.devagent/plugins/ralph/workflows/task-setup-handoff.md` (if used for PM setup)
  - `.devagent/workspace/tests/ralph-e2e/expectations/expectations.md` (Stage 1 and Stage 5 updates as needed)
- **References:** Clarification packet (PM/coordinator responsibilities, PR finalized definition).
- **Dependencies:** Task 1 (role/sign-off decisions) and Task 3 (revise-report workflow behavior).
- **Acceptance Criteria:**
  - Setup workflow creates (or instructs creation of) a PM/coordinator task with explicit responsibilities.
  - PR hygiene requirements (links + concrete test plan, early draft PR) are documented and enforced in setup guidance.
  - “Finalized” PR requirements are referenced in expectations or setup guidance.
- **Testing Criteria:** Review the setup workflow output to confirm new task is included.
- **Validation Plan:** Confirm requirements are clearly stated and traceable in setup docs.

#### Task 5: Enforce working-branch guardrails + per-task push behavior
- **Objective:** Ensure Ralph runs never use `main` as a working branch and that agents commit + push at the end of each Beads task.
- **Impacted Modules/Files:**
  - `.devagent/plugins/ralph/tools/config.json`
  - `.devagent/plugins/ralph/tools/ralph.ts`
  - `.devagent/plugins/ralph/AGENTS.md`
- **References:** Clarification packet; Ralph config.
- **Dependencies:** Task 1 (decision on enforcement behavior).
- **Acceptance Criteria:**
  - Enforcement behavior for `git.working_branch !== "main"` is implemented (fail-fast, auto-create, or warn per decision).
  - Agent instructions explicitly require commit + push at end of each task (already present, but ensure aligns with new preamble and enforcement).
  - Config-driven branch usage is the single source of truth.
- **Testing Criteria:** Config validation or unit-level check in prompt assembly (if added).
- **Validation Plan:** Verify prompt output includes branch/push guidance and enforcement behavior triggers correctly.

### Implementation Guidance
- **From `.devagent/core/AGENTS.md` → Standard Workflow Instructions:** Follow date handling (`date +%Y-%m-%d`), context gathering order, and storage patterns for new workflow docs and command files.
- **From `.devagent/plugins/ralph/AGENTS.md` → Task Execution Flow & Task Commenting:** Tasks must end with validation, commit, and Beads status updates; comments should include revision learnings and commit references.
- **From `.devagent/plugins/ralph/tools/ralph.ts` → Prompt assembly:** Agent-specific instructions are combined with shared Ralph instructions; integrate loop-wide preamble here once schema is decided.
- **From `.devagent/workspace/tests/ralph-e2e/expectations/expectations.md` → Run header + evaluation rubric:** Run headers must include run folder and expectations version; revise-report output should align to rubric stages.
- **From `.devagent/workspace/tests/ralph-e2e/runs/README.md` → Run folder policy:** Update to allow `run-report.md` while preserving screenshots organization and Beads as the authoritative review channel.

---

## Risks & Open Questions

| Item | Type (Risk / Question) | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Decide loop-wide preamble schema (string vs path). | Question | Jake | Resolve in Task 1 and update config + prompt assembly. | 2026-01-20 |
| Finalize fun role-name mapping + sign-off strictness. | Question | Jake | Document mapping list and enforcement in Task 1. | 2026-01-20 |
| Define enforcement behavior for `working_branch` on `main`. | Question | Jake | Choose fail-fast vs warn vs auto-create in Task 1. | 2026-01-20 |
| Ensure report publication doesn’t conflict with Beads source-of-truth guidance. | Risk | Jake | Update policy docs and clarify summary vs source-of-truth in Task 2 + 3. | 2026-01-20 |

---

## Progress Tracking
Refer to `.devagent/workspace/tasks/active/2026-01-20_pr-epic-run-review-report-slash-command/AGENTS.md` for implementation tracking.

---

## Appendices & References
- Clarification packet: `.devagent/workspace/tasks/active/2026-01-20_pr-epic-run-review-report-slash-command/clarification/2026-01-20_initial-clarification.md`
- Task hub: `.devagent/workspace/tasks/active/2026-01-20_pr-epic-run-review-report-slash-command/AGENTS.md`
- Expectations rubric: `.devagent/workspace/tests/ralph-e2e/expectations/expectations.md`
- Run policy docs: `.devagent/workspace/tests/ralph-e2e/runs/README.md`, `.devagent/workspace/tests/ralph-e2e/README.md`
- Ralph config + prompt assembly: `.devagent/plugins/ralph/tools/config.json`, `.devagent/plugins/ralph/tools/ralph.ts`
- Ralph instructions: `.devagent/plugins/ralph/AGENTS.md`
