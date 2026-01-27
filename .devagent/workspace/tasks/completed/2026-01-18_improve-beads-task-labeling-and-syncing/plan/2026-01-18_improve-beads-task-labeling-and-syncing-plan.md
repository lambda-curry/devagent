# Improve Beads Task Labeling and Syncing Plan

- Owner: Jake Ruesink
- Last Updated: 2026-01-18
- Status: Draft
- Related Task Hub: `.devagent/workspace/tasks/completed/2026-01-18_improve-beads-task-labeling-and-syncing/`
- Stakeholders: Jake Ruesink (Engineering, Decision Maker)
- Notes: Plan request was “to fix these” with additional context in the task hub + research packet; some inputs remain unspecified and are tracked in Risks & Open Questions.

---

## PART 1: PRODUCT CONTEXT

### Summary
Recent Ralph/Beads runs are showing two sources of friction: (1) Beads tasks are falling back to the project manager agent because labels are missing/mismatched for the epic’s direct child tasks, and (2) `.beads/issues.jsonl` still changes “after commits,” creating extra follow-up commits even though a `bd sync --flush-only` pre-commit flush is already present. This plan tightens the plan→Beads setup contract (labeling + verification) and adds deterministic diagnostics so we can identify what is still mutating Beads after commits and eliminate unnecessary churn.

### Context & Problem
- **Label routing problem:** Ralph selects an agent based on Beads task labels and falls back to `general` if there are no labels or no matching labels. In this repo, `general` maps to the project-manager agent, so missing labels route tasks to PM. (Refs: `.devagent/plugins/ralph/tools/ralph.ts`, `.devagent/plugins/ralph/tools/config.json`, research packet below.)
- **Beads sync churn problem:** Beads can export DB changes to `.beads/issues.jsonl` on a debounce window (daemon). Even with a pre-commit `bd sync --flush-only`, `.beads/issues.jsonl` can still change after commits if Beads is mutated after the pre-commit flush (or if hooks are bypassed). (Refs: `.devagent/plugins/ralph/README.md`, `.git/hooks/pre-commit` local observation.)
- **Hierarchy semantics:** Only “one level under the epic” should be considered primary execution units for routing; deeper sub-issues should be context-only by default. This aligns with existing Ralph “epic context injection” patterns and the setup workflow’s labeling focus on top-level tasks. (Refs: `.devagent/plugins/ralph/workflows/setup-ralph-loop.md`, `.devagent/plugins/ralph/tools/ralph.ts`.)

References:
- Research: `.devagent/workspace/tasks/completed/2026-01-18_improve-beads-task-labeling-and-syncing/research/2026-01-18_beads-label-routing-and-post-commit-sync-churn.md`

### Objectives & Success Metrics
- **Objective:** Direct epic child tasks are consistently labeled with exactly one routing label, so agent selection matches intent (engineering/qa/design/general) and PM is not the default execution agent.
- **Objective:** Post-commit `.beads/issues.jsonl` churn is either eliminated or reduced to a well-understood, intentional cause with a documented mitigation.
- **Success (practical):**
  - A label audit step catches unlabeled/unmapped tasks before the Ralph loop starts.
  - A run can complete without requiring an extra “beads-sync follow-up commit” for `.beads/issues.jsonl` drift.

### Users & Insights
- **Primary user:** The Ralph execution loop (and its agents) needs predictable routing + minimal churn.
- **Secondary user:** Humans reviewing runs need confidence that Beads state and git history aren’t fighting each other.

### Solution Principles
- **Deterministic routing:** Direct epic children must map to one known routing label; avoid ambiguous multi-label behavior.
- **One-level labeling rule:** Label only epic direct children by default; treat deeper sub-issues as context-only unless intentionally routed.
- **Minimize commit churn:** Prefer flush/diagnose-before-commit over “always do a second sync commit.”

### Scope Definition
- **In Scope:**
  - Tighten and align workflow/docs around label assignment for direct epic child tasks.
  - Add verification and diagnostics to detect missing labels / unmapped labels and to explain residual `.beads/issues.jsonl` drift.
  - Clarify the PM agent’s intended behavior (delegation-first) so fallback doesn’t become “do all work.”
- **Out of Scope / Future:**
  - Changing Beads upstream behavior or schema.
  - Disabling Beads daemon globally without evidence it’s the root cause (evaluate after diagnostics).

### Functional Narrative
#### Flow 1: Plan → Beads task setup yields correct routing
- Trigger: We convert a plan into a Beads epic and tasks.
- Experience narrative:
  - Each **direct epic child task** is created with exactly one routing label (`engineering` / `qa` / `design` / `general`).
  - A verification step confirms each label exists and is present in the router’s `agents` mapping.
  - Subtasks/sub-issues are created without labels by default (context-only).
- Acceptance criteria:
  - No top-level task is unlabeled or mapped to an unknown label.
  - The PM agent does not receive most tasks unless the tasks are truly `general` or explicitly `project-manager`.

#### Flow 2: Git commits don’t create surprise Beads JSONL diffs
- Trigger: After a run or after manual Beads updates, a developer commits.
- Experience narrative:
  - The system either guarantees `.beads/issues.jsonl` is up-to-date at commit time, or clearly reports what still updates it afterwards (so the cause can be fixed).
- Acceptance criteria:
  - After a commit, `git status` does not immediately show `.beads/issues.jsonl` modified (or, if it does, we can point to a specific root cause and mitigation).

### Technical Notes & Dependencies (Optional)
- Local git hooks are not committed; mitigations that rely on hooks must be documented as “per-machine setup.” (Ref: `.devagent/plugins/ralph/README.md`.)
- Ralph routing is label-first-match; multi-label ordering could be a footgun if Beads label list order is not stable. (Ref: `.devagent/plugins/ralph/tools/ralph.ts`.)

---

## PART 2: IMPLEMENTATION PLAN

### Scope & Assumptions
- Scope focus: Ralph/Beads workflow + documentation + small tooling tweaks inside `.devagent/**`.
- Key assumptions:
  - Label routing failures are primarily due to setup/creation steps not enforcing labels for direct epic children.
  - Remaining post-commit churn is caused by a known, diagnosable source (daemon timing, hook bypass, or post-commit Beads mutations from another process).
- Out of scope:
  - Large redesign of Ralph’s execution loop.

### Implementation Tasks

#### Task 1: Enforce label assignment + verification for direct epic child tasks
- **Objective:** Make it hard to create unlabeled/unmapped direct epic child tasks, and catch problems immediately.
- **Impacted Modules/Files:**
  - `.devagent/plugins/ralph/workflows/setup-ralph-loop.md` (label assignment step + add “verify label” step)
  - `.devagent/plugins/ralph/skills/plan-to-beads-conversion/SKILL.md` (document one-level labeling rule; clarify when to label subtasks)
  - `.devagent/plugins/ralph/tools/config.json` (ensure documented canonical labels match mapping; avoid confusing aliases)
- **References:**
  - `.devagent/workspace/tasks/completed/2026-01-18_improve-beads-task-labeling-and-syncing/research/2026-01-18_beads-label-routing-and-post-commit-sync-churn.md`
  - `.devagent/plugins/ralph/tools/ralph.ts` (router behavior)
- **Dependencies:** None.
- **Acceptance Criteria:**
  - Setup docs explicitly state: “direct epic child tasks must have exactly one routing label from the config mapping.”
  - Setup docs include a verification step that checks labels exist and are mapped (and what to do if not).
  - The one-level labeling rule is explicit: deeper sub-issues are unlabeled by default unless intentionally routed.
- **Testing Criteria:** N/A (docs-only).
- **Validation Plan:** Read-through + ensure instructions are consistent with actual router behavior and config mapping.

#### Task 2: Make PM agent behavior delegation-first (and clarify `general` vs `project-manager`)
- **Objective:** Reduce the likelihood that missing labels causes PM to “do all work” by default, while keeping a safe fallback.
- **Impacted Modules/Files:**
  - `.devagent/plugins/ralph/agents/project-manager-agent-instructions.md` (make fallback behavior emphasize triage → label → delegate; keep implementation as an explicit exception)
  - `.devagent/plugins/ralph/agents/general-agent-instructions.md` (ensure it matches the intended fallback semantics)
  - `.devagent/plugins/ralph/workflows/setup-ralph-loop.md` (align language: when to use `general` vs `project-manager`)
- **References:**
  - `.devagent/plugins/ralph/agents/project-manager-agent-instructions.md`
  - `.devagent/plugins/ralph/tools/config.json`
- **Dependencies:** Task 1 (so labels are “the” contract).
- **Acceptance Criteria:**
  - Docs clearly differentiate:
    - **Fallback (`general` / unlabeled):** triage and apply the right label, delegate when specialized.
    - **Explicit `project-manager` label:** coordination-only tasks (phase check-ins, final review).
  - Label taxonomy references match `config.json` keys.
- **Testing Criteria:** N/A (docs-only).
- **Validation Plan:** Ensure no contradictions remain across PM/general/setup docs.

#### Task 3: Add a repeatable diagnostic for “why `.beads/issues.jsonl` still changes after commit”
- **Objective:** Provide a deterministic checklist to identify which mechanism is still mutating Beads state after commits despite pre-commit flush.
- **Impacted Modules/Files:**
  - `.devagent/plugins/ralph/README.md` (add a “If churn persists…” diagnostic section)
  - `.devagent/workspace/tasks/completed/2026-01-18_improve-beads-task-labeling-and-syncing/research/2026-01-18_beads-label-routing-and-post-commit-sync-churn.md` (append findings once reproduced)
- **References:**
  - `.devagent/plugins/ralph/README.md` (existing guidance: `bd sync --flush-only`)
  - Local hook reality: `.git/hooks/pre-commit` contains `bd sync --flush-only` (local-only; document how to verify hook execution)
- **Dependencies:** None.
- **Acceptance Criteria:**
  - The diagnostic covers at least:
    - verifying hooks are actually running (CLI vs GUI commit flows),
    - verifying `bd sync --flush-only` exits 0 and blocks,
    - confirming whether Beads daemon is exporting after commit due to later DB mutations.
  - Guidance clearly distinguishes “expected” vs “unexpected” `.beads/issues.jsonl` changes.
- **Testing Criteria:** N/A (docs-only).
- **Validation Plan:** Follow the diagnostic steps on a machine exhibiting the problem and record what was found.

#### Task 4: Reduce label-order ambiguity and improve visibility when routing falls back
- **Objective:** Make it obvious when routing fell back (and why) so we catch labeling gaps early.
- **Impacted Modules/Files:**
  - `.devagent/plugins/ralph/tools/ralph.ts` (improve logging/message around fallback and unmapped labels; avoid leaking env)
  - `.devagent/plugins/ralph/workflows/setup-ralph-loop.md` (document expected router output / interpretation)
- **References:**
  - `.devagent/plugins/ralph/tools/ralph.ts` (resolveAgentForTask + current logs)
- **Dependencies:** Task 1.
- **Acceptance Criteria:**
  - When a task is unlabeled, output makes it explicit that it is using `general` fallback and that label assignment is missing.
  - When labels exist but none match mapping, output lists the observed labels and recommends the valid mapping keys.
- **Testing Criteria:**
  - `bun run typecheck`
  - `bun run lint`
- **Validation Plan:** Run router mode and confirm the fallback messaging is clear and safe.

### Implementation Guidance (Optional)
- **From `.devagent/plugins/ralph/tools/ralph.ts`:**
  - Agent selection is “first matching label in config mapping; otherwise fallback to `general`.”
- **From `.devagent/plugins/ralph/README.md`:**
  - Preferred pre-commit mitigation is `bd sync --flush-only` (blocking flush; avoids full sync behavior).

---

## Risks & Open Questions

| Item | Type (Risk / Question) | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| What is still mutating `.beads/issues.jsonl` post-commit even with `--flush-only` in pre-commit? | Question | Jake | Follow diagnostic (Task 3) and record concrete cause; escalate to deeper research if ambiguous | Next run |
| Confusion between `general` and `project-manager` labels | Risk | Jake | Align docs + recommend one canonical approach; consider removing/avoiding aliasing if it causes misroutes | During implementation |
| Multi-label ordering ambiguity | Risk | Jake | Enforce “exactly one label” rule for routable tasks; document it and add verification | During implementation |

---

## Progress Tracking
Refer to the `AGENTS.md` file in the task directory for instructions on tracking and reporting progress during implementation.

