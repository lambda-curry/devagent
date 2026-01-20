# `ralph-e2e` expectations (per-stage)

**Expectations Version:** `v2026-01-19`  
**Last Updated:** 2026-01-19  

This document defines the **per-stage expectations** used to evaluate the canonical resettable test loop under `.devagent/workspace/tests/ralph-e2e/`.

## Goals

- Provide a stable, comparable evaluation rubric across runs.
- Keep run artifacts **screenshots-only** (per MVP policy) while still enabling rigorous review.
- Keep the “source of truth” for pass/fail outcomes in **Beads comments**, not ad-hoc markdown files.
- Ensure the loop validates **multi-agent collaboration** (design → implementation → QA) for UI-sensitive work.

## Run review mechanism (source of truth)

- **Evidence**: screenshots under `../runs/YYYY-MM-DD_<beads-epic-id>/...`
- **Pass/Fail + rationale**: Beads comments on the epic/tasks
- **Evaluation criteria**: this file (`expectations.md`)

### Required “run header” in the Beads epic comment

For each run, the reviewer should add a top-level Beads epic comment that includes:

- **Run folder**: `.devagent/workspace/tests/ralph-e2e/runs/YYYY-MM-DD_<beads-epic-id>/`
- **Expectations Version**: the version string at the top of this file
- **Expectations Commit (recommended)**: the git commit hash that contains the expectations version used for the run
- **Result**: overall pass/fail and 3–7 bullets of key outcomes

This lets us review runs later without storing a narrative report inside `runs/.../`.

## Expectations versioning policy

This expectations set is a **living document**.

- **Version format (CalVer)**: `vYYYY-MM-DD`
- **Where changes are recorded**: `CHANGELOG.md`
- **When to bump**:
  - Bump the version whenever an expectation meaningfully changes (new/removed gates, changed evidence requirements, changed “pass” criteria).
  - Do **not** bump for spelling/formatting-only edits.
- **No per-run snapshots (MVP)**: we intentionally do not copy expectations into run folders; instead, reference the version + commit in Beads.

## Stage 0 — Roles, responsibilities, and collaboration contract

**Objective:** Every `ralph-e2e` run must exercise the full multi-agent loop with clear handoffs and accountability.

### Required roles (MVP)

All runs **must** involve these roles:

- **Coordinator (Run Lead)**: ensures the epic is set up correctly, keeps the run moving, and maintains the epic-level “run header” + post-run summary.
- **Design Agent**: provides UI/UX guidance as observable acceptance criteria and (when applicable) design artifacts.
- **Implementation Agent**: implements the scoped work and meets quality + traceability expectations.
- **QA Agent**: verifies acceptance criteria and quality gates with evidence and enforces fail semantics.

### Collaboration expectations (handoffs are required)

Each task must have an explicit handoff comment when moving between roles. The handoff comment should include:

- **What changed**: brief summary of intent (1–3 bullets)
- **Acceptance checklist**: what should be true after the change (observable)
- **How to verify**: commands + manual steps
- **Evidence pointers**: screenshot paths (if applicable) and/or test names
- **Risk / known gaps**: anything QA should focus on

**Failure expectation:** “Passing” is not only correctness; it also requires clean handoffs that allow the next agent to proceed without guesswork.

## Stage 1 — Plan → Beads epic setup

**Objective:** A stable, reproducible epic + task breakdown that matches the canonical plan and is easy to evaluate.

**Expectations:**

- **Structure is correct**: tasks match the plan’s intended breakdown (no missing core tasks; no unrelated tasks).
- **All required roles are represented**: at minimum there is a `design` task, an `implementation` task, and a `qa` task (or equivalent breakdown that clearly routes work across roles).
- **Statuses start sane**: work begins as `open`, moves to `in_progress` when claimed, and ends `closed` when verified.
- **Dependencies are accurate**: blocking relationships reflect real ordering constraints.
- **Where evidence lives**:
  - Any “setup” screenshots (if needed) go in the run folder under `setup/`.
  - The authoritative record of setup correctness is still the Beads epic + comments.

## Stage 2 — Task execution (implementation agent work)

**Objective:** The implementation agent produces changes that match scope, follow repo standards, and are verifiable.

**Expectations:**

- **Scope discipline**: the agent edits only what’s needed for the task.
- **Quality gates are respected**: the agent runs the repository’s real scripts (see root `package.json`) and reports results.
- **Traceability**: commits reference the Beads task id(s), and Beads comments include commit hash + verification performed.
- **Handoff is QA-ready**: the final implementation comment includes a clear handoff (what changed, how to verify, what to watch).

## Stage 3 — QA verification (QA agent work)

**Objective:** The QA agent verifies behavior against expectations with evidence, and enforces failure semantics.

**Expectations:**

- **Evidence-first**: pass/fail is supported by:
  - checklist-style bullets (short),
  - screenshots (when UI/visual behavior is involved),
  - links to relevant framework/library docs when asserting “should” behavior.
- **Failure semantics (MVP)**:
  - On fail, set the Beads task back to **`open`**.
  - Do **not** set tasks to `blocked` for QA failures in MVP.
- **Minimum fail comment format (keep it simple)**:
  - Fail reason
  - Expected vs actual
  - Screenshot paths (if applicable)
  - Doc links (if applicable)

## Stage 4 — Post-run summary

**Objective:** Capture “what we learned” so the loop actually improves the system.

**Expectations:**

- The epic comment includes a concise summary:
  - what went well,
  - what failed and why,
  - top friction points that suggest workflow/docs improvements.
- If follow-up work is discovered, it should be tracked as new Beads tasks (not left as untracked notes).

## Stage 5 — PR “definition of done” (run-level acceptance)

**Objective:** The run culminates in a PR that is reviewable, traceable, and demonstrably complete.

**Expectations:**

- **PR is traceable**:
  - Links to the Beads epic and the primary tasks.
  - Includes the expectations version used for the run (`vYYYY-MM-DD`) and (recommended) the commit hash.
- **PR has a concrete test plan**:
  - Commands run (and results) for the repo’s quality gates.
  - Manual verification notes for user-visible behavior (when applicable).
- **Evidence is complete**:
  - Screenshots exist for required UI states (per the canonical plan) and are referenced in Beads comments.
- **Multi-agent accountability is visible**:
  - There is at least one clear design decision comment, an implementation verification/handoff comment, and a QA pass/fail comment.
- **Epic closure rule**:
  - The epic may be marked “done” only when all tasks are `closed` and the epic has a run header + post-run summary + PR link.

