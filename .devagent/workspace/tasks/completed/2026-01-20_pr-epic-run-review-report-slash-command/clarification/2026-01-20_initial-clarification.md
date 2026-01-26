# Clarified Requirement Packet — PR Epic Run Review Report Slash Command

- Requestor: Jake Ruesink (Engineering) [INFERRED]
- Decision Maker: Jake Ruesink (Engineering) [INFERRED]
- Date: 2026-01-20
- Mode: Task Clarification
- Status: Complete (with deferred items)
- Related Task Hub: `.devagent/workspace/tasks/active/2026-01-20_pr-epic-run-review-report-slash-command/`
- Notes: This packet is being built incrementally during an interactive clarification session.

## Task Overview

### Inferred Task Concept
Create a slash command that generates a run review report for any PR + Beads epic run, scoring/evaluating the run against the canonical `ralph-e2e` expectations rubric, and producing actionable insights on what to change to improve the next run. Also create a `revise-report` workflow that explicitly uses the expectations document as its rubric.

### Assumptions
- [INFERRED] “Slash command” means a DevAgent workflow invocation command (e.g., `devagent revise-report`) rather than a Slack/Discord slash command.
- [INFERRED] Inputs will be resolvable to a single PR (GitHub) and a single run (Beads epic id + run folder pointer) without ambiguous matching.
- [INFERRED] We will allow a narrative report file inside `runs/.../` (policy change).

### Context
- **Task name/slug:** `2026-01-20_pr-epic-run-review-report-slash-command`
- **Trigger:** Desire to standardize how we review runs vs. expectations and quickly identify “what to improve next run” across PR + epic runs.
- **Stakeholders:** Jake Ruesink (requestor/decision maker) [INFERRED]
- **Prior work / key references:**
  - `/.devagent/workspace/tests/ralph-e2e/expectations/expectations.md`
  - `/.devagent/workspace/tests/ralph-e2e/README.md`
  - `/.devagent/workspace/tests/ralph-e2e/runs/README.md`

### Clarification Sessions
- Session 1: 2026-01-20 — (interactive) task clarification kickoff + report inputs/outputs.

---

## Clarified Requirements

### Scope & End Goal

**What needs to be done?**
- Create a slash command for generating a run review report for any PR + Beads epic run.
- Create a `revise-report` workflow that uses the `ralph-e2e` expectations rubric to evaluate a run and suggest improvements for the next run.
- Ensure the “final revise report” Beads task for the epic runs this workflow as part of the end-to-end run.
- Ensure the PR is created early (draft is fine) so review can begin as work lands, and ensure PR hygiene items are present (links + test plan).
- Add an initial project manager/coordinator task to review the epic/task setup early and get the PR created.
- Add a **generic “Ralph loop preamble”** that is prepended to every agent’s prompt for loop runs. This should ground agents in:
  - Beads is the project management system (use it for status + comments),
  - stay focused on the assigned task scope,
  - other roles/agents exist (and how to coordinate),
  - how to communicate via Beads comments with a clear role signature so other agents know who is speaking.
- Update base agent instructions so agents **commit and push to the configured working branch** at the end of each assigned Beads task.

**What's the end goal architecture or state?**
- A repeatable workflow that takes PR + run identifiers, reads the relevant evidence sources, and produces a structured report suitable for human review and iteration.

**In-scope (must-have):**
- Report generation that references the expectations version (and preferably commit hash) used for the run.
- Generate a narrative report file in the run folder (user-approved policy change from “screenshots-only”).
- A clear list of “next run improvements” recommendations (expectations, handoffs, plan, quality gates).

**Out-of-scope (won't-have):**
- Fully automated edits to expectations/plan/docs without human review (unless explicitly decided later).
- N/A — user explicitly approved changing the run folder content policy to allow a narrative report.

**Nice-to-have (could be deferred):**
- Automatic posting of the report to both PR and Beads (if we decide a single source of truth is sufficient).

---

### Technical Constraints & Requirements

**Constraints inferred from existing docs:**
- Existing docs currently say screenshots-only, but user wants to change this to allow a report file in `runs/.../`.
- Must treat `expectations/expectations.md` as the evaluation rubric, but we will evaluate against the latest expectations each time (no strict version/commit pinning required).
- Preferred additional publication: also post a short summary to the Beads epic comment.

---

### Dependencies & Blockers

**Dependencies (likely):**
- Access to PR metadata/content (e.g., GitHub PR URL/number).
- Access to Beads epic comments/tasks for run header and evaluation notes.
- Access to run evidence pointers (screenshots folder path).
- Access to Ralph run configuration that defines base branch and working branch (working branch must not be `main`).
  - Current config location: `/.devagent/plugins/ralph/tools/config.json` with `git.base_branch` and `git.working_branch`.

**Blockers:**
- None yet; key unknowns are around canonical inputs and where to publish output.

---

### Implementation Approach

**Approach (placeholder):**
- Implement as a DevAgent workflow (`revise-report`) and/or a command that orchestrates:
  - Identify PR + Beads epic run.
  - Collect evidence pointers (Beads comments + run folder path + expectations version).
  - Generate a structured report with a rubric-aligned breakdown and “next run improvements”.
  - Update PR description with a short “run summary” section (final revise-report task), and update Beads epic comment summary.

---

### Acceptance Criteria & Verification

**How will we verify this works?**
- Given a PR reference and a Beads epic id, the workflow produces a report that:
  - evaluates against the latest expectations (no strict version pin),
  - enumerates which expectations were met vs. not met with evidence pointers,
  - outputs actionable recommendations for improving the next run.
  - updates the PR description with a short run summary (when configured to do so),
  - posts a summary to the Beads epic comment.
- Agents participating in the loop reliably:
  - work on the configured working branch (never `main`),
  - commit and push at end of each Beads task,
  - leave Beads comments with a role signature for handoffs/coordination.

**Definition of done (initial):**
- [ ] Inputs and outputs are clearly specified (PR identifier, run identifier, publication target).
- [ ] Report structure is defined and aligned to `expectations/expectations.md` stages.
- [ ] “Next run improvements” section is concrete and actionable.

---

## Assumptions Log

| Assumption | Owner | Validation Required | Validation Method | Due Date | Status |
| --- | --- | --- | --- | --- | --- |
| “Slash command” refers to a DevAgent command/workflow, not Slack. | Jake | Yes | Decide target UX and invocation surface | 2026-01-20 | Pending |
| Reports should not be stored inside `runs/.../` (narrative belongs in Beads/PR). | Jake | No | User decided to allow a report file in the run folder | 2026-01-20 | Invalidated |
| The run folder may contain a narrative report file in addition to screenshots. | Jake | No | User decided filename: `run-report.md` | 2026-01-20 | Validated |
| The report should also be summarized in a Beads epic comment. | Jake | Yes | Confirm summary format + whether it links to `run-report.md` path | 2026-01-20 | Pending |
| The workflow always evaluates against the latest `expectations.md` (no version/commit pinning). | Jake | No | User decided to always use latest | 2026-01-20 | Validated |
| The epic includes a “PM/coordinator setup” task that ensures tasks are well-formed and a PR exists early. | Jake | Yes | Confirm exact responsibilities + required artifacts | 2026-01-20 | Pending |
| Base agent instructions should commit + push to the configured branch. | Jake | No | User clarified: loop-wide prompt preamble + push at end of each task | 2026-01-20 | Validated |
| “Configured branch” means the Ralph run config provides a base branch and a working branch (working branch must not be `main`). | Jake | Yes | Confirm config file path + field names + enforcement behavior | 2026-01-20 | Pending |
| Agents should push at the end of each assigned Beads task. | Jake | No | User decided: push at end of task | 2026-01-20 | Validated |
| Loop-wide preamble should include Beads coordination guidance and role-signature comment convention. | Jake | Yes | Confirm signature format and minimum required guidance | 2026-01-20 | Pending |
| The loop-wide preamble should be configurable via Ralph run config. | Jake | No | User decided: config-driven prompts | 2026-01-20 | Validated |
| Agents should sign off Beads comments with “- name, role” (using named roles). | Jake | Yes | Confirm canonical role→name mapping list | 2026-01-20 | Pending |
| PR should be created early (draft OK) and include core hygiene items (links + test plan) to be “finalized”. | Jake | No | User clarified: “reviewable early” + PR body hygiene | 2026-01-20 | Validated |

---

## Gaps Requiring Research

None identified yet (may emerge depending on desired integrations for PR/Beads publishing).

---

## Clarification Session Log

### Session 1: 2026-01-20
**Participants:** Jake Ruesink (requestor/decision maker) [INFERRED]

**Questions tracker (this session):**
1. Report publication target(s): ✅ answered — Run folder report file (policy change OK)
2. Canonical PR input format: ✅ answered — Accept both (canonicalize internally)
3. Canonical epic run input format + evidence sources: ✅ answered — Beads epic id (derive the rest)

4. Run folder report filename: ✅ answered — `run-report.md`
5. Additional publication: ✅ answered — also post summary to Beads epic comment

6. How to determine run folder path from epic id: ✅ answered — try epic run header comment first, fallback to searching `runs/*_<epic-id>/`
7. How to select expectations rubric: ✅ answered — always use latest expectations (no strict version/commit pinning)

8. PR “finalized” definition: ✅ answered — draft PR created early (“reviewable early”) + PR body hygiene items (links + test plan)
9. PM/coordinator setup task responsibilities: ✅ answered — all of A/B/C (task breakdown + PR creation + run header fields + run folder readiness)
10. Final revise-report task updates: ✅ answered — write `run-report.md` + update Beads epic summary + update PR description run summary section

11. Where to put “base agent instructions”: ✅ answered — loop-wide preamble prepended to agent prompts (not a single static file decision yet)
12. “Configured branch” definition: ✅ answered — Ralph run config has base + working branch (working branch never `main`)
13. Push cadence: ✅ answered — push at end of each Beads task

14. Where the loop-wide preamble lives: ✅ answered — in Ralph run config (configurable prompts)
15. Role signature format: ✅ answered — sign off comments as “- name, role” (with named roles)
16. Ralph run config path/fields: ⏳ in progress — user believes it’s under `.devagent/**`, exact path unknown yet
17. Found config path + branch field names: ✅ answered — `/.devagent/plugins/ralph/tools/config.json` with `git.base_branch` + `git.working_branch`
18. Where base/shared agent instructions currently come from: ✅ answered — prompt builder appends `/.devagent/plugins/ralph/AGENTS.md` as “Shared Ralph Instructions”

 19. Config schema for the loop-wide preamble (string vs path): ⏭️ deferred
 20. Canonical mapping of “fun role names” to `project-manager/design/engineering/qa`: ⏭️ deferred
 21. When sign-offs are required (every comment vs handoffs only): ⏭️ deferred
 22. Enforcement behavior for “working_branch should never be main”: ⏭️ deferred

**Answers captured:**
1. Publication target(s): User wants the report stored in `runs/.../` (changing screenshots-only policy).
2. PR input: Accept both PR URL and PR number; canonicalize internally.
3. Epic run input: Beads epic id only.
4. Run folder report filename: `runs/YYYY-MM-DD_<beads-epic-id>/run-report.md`
5. Also publish: summary to Beads epic comment.
6. Run folder resolution: parse epic run header first; fallback to searching for `runs/YYYY-MM-DD_<beads-epic-id>/` by epic id suffix.
7. Expectations selection: evaluate against the latest `expectations/expectations.md` each time.
8. PR “finalized”: draft PR should exist early for continuous review; PR body should include core links (Beads epic/tasks) and a concrete test plan.
9. PM/coordinator setup task: ensure task breakdown/roles, create PR early, add run header fields, ensure run folder readiness.
10. Final revise-report task: generates `run-report.md`, posts Beads epic summary, and updates PR description with a run summary section.
11. Base instructions: add a loop-wide preamble prepended before agent-specific instructions; include Ralph loop context, Beads usage, stay-on-task guidance, other agents, and Beads comment role signatures.
12. Configured branch: use Ralph run config’s base branch + working branch; working branch should never be `main`.
13. Push cadence: push at end of each assigned Beads task.
14. Preamble location: store prompts/preamble in the Ralph run config (so prompts are configurable).
15. Signature format: sign comments with `- <name>, <role>`; roles can have playful names.
16. Config location: under `.devagent/**` (exact file/path TBD).
17. Config path/fields: `/.devagent/plugins/ralph/tools/config.json` with `git.base_branch` and `git.working_branch`.
18. Prompt assembly today: agent-specific instructions are loaded, then `/.devagent/plugins/ralph/AGENTS.md` is appended as “Shared Ralph Instructions” (so a configurable preamble likely needs to plug into this assembly).
19. Deferred: decide the exact config schema for the preamble.
20. Deferred: decide the role-name mapping list.
21. Deferred: decide whether sign-offs are required on every comment or only key comment types.
22. Deferred: decide/implement enforcement behavior for working branch (and what to do if it’s `main`).

---

## Next Steps

### Spec Readiness Assessment
**Status:** ☑ Ready for Spec | ⬜ Research Needed | ⬜ More Clarification Needed

**Rationale:**
- Core inputs/outputs and integration points are clear enough to plan implementation. A few details are explicitly deferred (preamble config schema, role-name mapping, sign-off strictness, branch enforcement behavior).

### Recommended Actions
- [ ] `devagent create-plan` (use this clarification packet as primary input)
- [ ] In the plan: include updating the `ralph-e2e` run folder policy docs to allow `run-report.md` (policy change)
- [ ] In the plan: choose concrete config keys for preamble + role names + sign-off rules (or keep them optional with sensible defaults)

---

## Change Log
- 2026-01-20: Created initial clarification packet from inferred context (no direct user-provided Input Context on invocation).
- 2026-01-20: Captured first-round answers: report stored in run folder (policy change), PR input (URL or number), epic run input (Beads epic id).
- 2026-01-20: Captured second-round answers: accept PR URL/number (canonicalize), report filename `run-report.md`, also post Beads epic summary.
- 2026-01-20: Captured third-round answers: resolve run folder via epic header then folder search; always use latest expectations; added requirements for PM/coordinator setup task, PR finalization, and base agent commit/push instruction update.
- 2026-01-20: Captured fourth-round answers: PR “finalized” means reviewable early + hygiene; PM/coordinator task responsibilities; final revise-report task updates PR description + Beads epic summary.
- 2026-01-20: Captured fifth-round answers: loop-wide agent preamble (Beads/roles/signatures); branch selection via run config (base+working, never main); push at end of each task.
- 2026-01-20: Captured sixth-round answers: preamble stored in run config; sign-off format `- name, role` with named roles; run config lives under `.devagent/**` but path TBD.
- 2026-01-20: Located run config + prompt assembly: `/.devagent/plugins/ralph/tools/config.json` (`git.base_branch`, `git.working_branch`) and shared base instructions from `/.devagent/plugins/ralph/AGENTS.md`.
