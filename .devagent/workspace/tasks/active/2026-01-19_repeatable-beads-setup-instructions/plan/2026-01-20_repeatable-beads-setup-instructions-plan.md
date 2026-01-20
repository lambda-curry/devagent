# Repeatable Low-Noise Beads Setup Instructions Plan

- Owner: Jake Ruesink
- Last Updated: 2026-01-20
- Status: Draft
- Related Task Hub: `.devagent/workspace/tasks/active/2026-01-19_repeatable-beads-setup-instructions/`
- Stakeholders: Jake Ruesink (Requestor, Decision Maker)
- Notes: Remove sections marked (Optional) if they do not apply.

---

## PART 1: PRODUCT CONTEXT

### Summary
Deliver portable, copy/paste-friendly Beads setup instructions that keep Beads state out of code PR diffs and avoid Beads-only commits in the main repo, with a decision tree that treats “.beads submodule” as the target direction and sync-branch as the most evidenced fallback, plus a concrete validation checklist for the submodule approach before it can become the default. Sources: clarification packet and updated research. (`.devagent/workspace/tasks/active/2026-01-19_repeatable-beads-setup-instructions/clarification/2026-01-20_initial-clarification.md`, `.devagent/workspace/tasks/active/2026-01-19_repeatable-beads-setup-instructions/research/2026-01-20_low-noise-beads-submodule-setup-research.md`)

### Context & Problem
Beads syncing currently creates noise in code repo history and PR diffs (notably `.beads/issues.jsonl`), and “post-commit drift” can cause unexpected Beads changes after a commit. The preferred direction is to place `.beads/` in a separate git submodule repo so Beads state lives outside the code repo, while bundling submodule pointer updates only with real code commits. However, feasibility (submodule + hooks + daemon policy) is not yet validated and requires explicit experiments and documentation. Sources: clarification packet and research packets. (`.devagent/workspace/tasks/active/2026-01-19_repeatable-beads-setup-instructions/clarification/2026-01-20_initial-clarification.md`, `.devagent/workspace/tasks/active/2026-01-19_repeatable-beads-setup-instructions/research/2026-01-20_low-noise-beads-submodule-setup-research.md`, `.devagent/workspace/tasks/active/2026-01-19_repeatable-beads-setup-instructions/research/2026-01-19_beads-separate-repo-and-multi-repo-options.md`)

### Objectives & Success Metrics
- Provide portable docs in `.devagent/core/…` that are copy/paste-ready for new setups.
- Include a decision tree that clearly separates:
  - sync-branch (proven in internal docs),
  - submodule at `.beads/` (target but unvalidated), and
  - any `BEADS_DIR` / DB-only approach (documented as unverified unless validated).
- The recommended workflow does not produce routine Beads-only commits in the code repo history.
- `.beads/issues.jsonl` does not appear in code PR diffs under the recommended default.
- Clear, explicit mitigation for post-commit drift (e.g., blocking flush guidance) and where hooks must live.
- Validation checklist executed for the submodule approach with results recorded in task research.

### Users & Insights
- Primary users: DevAgent maintainers and contributors who want low-noise Beads sync while working in code repos.
- Secondary users: automation/agents (Ralph, internal tooling) that need reliable Beads sync without manual git babysitting.
- Insight: the strongest existing evidence is sync-branch mode, but the desired target is a separate repo (submodule) with bundled-only pointer updates and submodule-aware hooks. (`.devagent/workspace/tasks/active/2026-01-19_repeatable-beads-setup-instructions/research/2026-01-20_low-noise-beads-submodule-setup-research.md`)

### Solution Principles
- Low-noise by default: keep Beads artifacts out of code PR diffs and avoid Beads-only commits in code history.
- Evidence-first: treat submodule as “proposed” until validated; prefer documented internal evidence.
- Explicit drift mitigation: ensure post-commit drift is addressed with a clear, repeatable hook/flush policy.
- Portable and repeatable: instructions belong in `.devagent/core/…` and assume fresh clones.
- Ergonomic: prefer wrapper commands for Beads operations from the code repo when simple.

### Scope Definition
- **In Scope:**
  - Portable documentation in `.devagent/core/…` for setup options and decision tree.
  - Validation checklist/experiment plan for `.beads/` submodule feasibility (hooks, daemon policy, drift).
  - Troubleshooting/FAQ for common misconfigs and post-commit drift.
  - Guidance on “bundled-only” submodule pointer updates.
- **Out of Scope / Future:**
  - New Beads CLI features or changes to Beads itself.
  - Rollout/announcement tasks beyond documentation updates.
  - Long-term product analytics or adoption tracking.

### Functional Narrative
#### Flow: New project setup (low-noise target)
- Trigger: New repository or fresh clone needs Beads setup.
- Experience narrative:
  - Developer reads the core docs, chooses a path via the decision tree.
  - If submodule is chosen, they install the `.beads/` submodule, initialize hooks within the submodule, and use wrapper commands from the code repo.
  - If sync-branch is chosen, they follow the documented sync-branch workflow and verify Beads artifacts stay off `main`.
- Acceptance criteria:
  - Setup steps are copy/paste-friendly and succeed in a clean clone.
  - Beads artifacts do not appear in code PR diffs under the recommended default.
  - Post-commit drift is mitigated by documented flush/hook behavior.

### Technical Notes & Dependencies (Optional)
- Requires validating submodule compatibility with Beads (hooks, merge driver, daemon policy).
- Requires reconciling daemon/worktree guidance in existing docs before recommending daemon usage.
- Depends on confirming where hooks should live and how they are installed across repo boundaries.

---

## PART 2: IMPLEMENTATION PLAN

### Scope & Assumptions
- Scope focus: documentation + validation experiments for low-noise Beads setup.
- Key assumptions:
  - Submodule approach can be validated with a small local experiment.
  - Sync-branch mode remains the most evidence-backed fallback if submodule remains unvalidated.
- Out of scope: new Beads features or any code changes beyond minimal wrapper scripts (if needed).

### Implementation Tasks

#### Task 1: Define doc locations and outline the portable Beads setup guide
- **Objective:** Decide the canonical `.devagent/core/…` location(s) for Beads setup docs and create the outline/skeleton aligned with the decision tree.
- **Impacted Modules/Files:** `.devagent/core/README.md`, `.devagent/core/docs/beads-setup.md` (new), `.devagent/workspace/tasks/active/2026-01-19_repeatable-beads-setup-instructions/AGENTS.md`
- **References:** `.devagent/workspace/tasks/active/2026-01-19_repeatable-beads-setup-instructions/clarification/2026-01-20_initial-clarification.md`
- **Dependencies:** None
- **Acceptance Criteria:**
  - A draft Beads setup doc exists in `.devagent/core/…` with an explicit decision tree section.
  - The core README links to the new doc location.
- **Testing Criteria:**
  - Verify the document renders in markdown and paths are valid relative to `.devagent/core/README.md`.
- **Validation Plan:** Manual review of new doc and core README link.

#### Task 2: Document decision tree and recommended defaults (sync-branch vs submodule vs BEADS_DIR)
- **Objective:** Produce clear guidance on when to use sync-branch, when to consider submodule (target but unvalidated), and what “BEADS_DIR/DB-only” options mean based on evidence.
- **Impacted Modules/Files:** `.devagent/core/docs/beads-setup.md`
- **References:**
  - `.devagent/workspace/tasks/active/2026-01-19_repeatable-beads-setup-instructions/research/2026-01-20_low-noise-beads-submodule-setup-research.md`
  - `.devagent/workspace/tasks/active/2026-01-19_repeatable-beads-setup-instructions/research/2026-01-19_beads-separate-repo-and-multi-repo-options.md`
  - `.devagent/workspace/research/2026-01-14_beads-sync-branch-setup.md`
- **Dependencies:** Task 1
- **Acceptance Criteria:**
  - Decision tree calls out evidence level and risk for each path.
  - Submodule is explicitly marked as “requires validation” until confirmed.
  - Bundled-only submodule pointer policy is documented.
- **Testing Criteria:** Peer review against the clarification packet.
- **Validation Plan:** Cross-check decision tree with research packet claims.

#### Task 3: Validate submodule feasibility and document results
- **Objective:** Execute the minimal experiment to confirm submodule behavior (hooks, daemon policy, drift mitigation) and capture findings.
- **Impacted Modules/Files:** `.devagent/workspace/tasks/active/2026-01-19_repeatable-beads-setup-instructions/research/2026-01-20_beads-submodule-validation.md` (new), `.devagent/core/docs/beads-setup.md`
- **References:**
  - `.devagent/workspace/tasks/active/2026-01-19_repeatable-beads-setup-instructions/research/2026-01-20_low-noise-beads-submodule-setup-research.md`
  - `.devagent/workspace/research/2026-01-14_beads-syncing-setup.md`
- **Dependencies:** Task 2 (document structure), access to Beads primary docs or local experiment
- **Acceptance Criteria:**
  - A validation report exists with findings and any contradictions resolved or flagged.
  - The doc reflects validated behaviors and explicitly labels any remaining unknowns.
- **Testing Criteria:** Run the experiment steps in a clean repo/submodule setup and confirm expected git status and Beads behavior.
- **Validation Plan:** Verify findings against Beads docs (or log gaps as [NEEDS CLARIFICATION]).

#### Task 4: Define drift-mitigation and hook strategy across repo boundaries
- **Objective:** Document the required hook/flush policy to prevent post-commit drift, including where hooks live in submodule mode and how to install them repeatably.
- **Impacted Modules/Files:** `.devagent/core/docs/beads-setup.md`
- **References:** `.devagent/workspace/tasks/active/2026-01-18_improve-beads-task-labeling-and-syncing/research/2026-01-18_beads-label-routing-and-post-commit-sync-churn.md`
- **Dependencies:** Task 3 (validated hook behavior), Task 2 (decision tree)
- **Acceptance Criteria:**
  - Post-commit drift mitigation is explicit and actionable.
  - Hook setup instructions specify repo boundaries and installation steps.
- **Testing Criteria:** Simulate a commit in the Beads repo with and without flush to verify drift is mitigated.
- **Validation Plan:** Ensure recommended hook placement matches verified behavior in submodule mode.

#### Task 5: Produce troubleshooting + verification checklist and run a fresh-clone validation
- **Objective:** Add FAQ/troubleshooting and a verification checklist; validate the instructions in a fresh clone or clean worktree.
- **Impacted Modules/Files:** `.devagent/core/docs/beads-setup.md`, `.devagent/workspace/tasks/active/2026-01-19_repeatable-beads-setup-instructions/AGENTS.md`
- **References:** `.devagent/workspace/research/2026-01-14_beads-syncing-setup.md`
- **Dependencies:** Tasks 1-4
- **Acceptance Criteria:**
  - A troubleshooting section covers common misconfigs (hooks not firing, submodule pointer drift, daemon conflicts).
  - A verification checklist exists and is executed at least once on a clean setup.
- **Testing Criteria:** Follow the checklist in a fresh clone/worktree and confirm expected outcomes.
- **Validation Plan:** Record the validation outcome in the task hub progress log and/or a short validation note.

### Implementation Guidance (Optional)
- **From `.devagent/core/AGENTS.md` → Standard Workflow Instructions:**
  - Use `date +%Y-%m-%d` for dated artifacts and store plans under `.devagent/workspace/tasks/{status}/.../plan/`.
- **From `.devagent/workspace/tasks/active/2026-01-19_repeatable-beads-setup-instructions/AGENTS.md` → Agent Update Instructions:**
  - Update “Last Updated” and append progress log entries using the current date; maintain the checklist for task progress.

---

## Risks & Open Questions

| Item | Type (Risk / Question) | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Beads submodule compatibility (hooks, merge driver, repo binding) is unverified. | Risk | Jake Ruesink | Run submodule validation experiment; consult Beads docs. | TBD |
| Daemon + worktree guidance appears inconsistent across internal docs. | Risk | Jake Ruesink | Reconcile docs; confirm recommended daemon policy per mode. | TBD |
| Best onboarding step for updating submodule tasks is unsettled (`git -C .beads pull` vs `git submodule update --remote`). | Question | Jake Ruesink | Include in validation checklist and choose one based on results. | TBD |
| `BEADS_DIR` semantics are unclear in internal docs. | Question | Jake Ruesink | Avoid hard claims until validated; document as “unverified.” | TBD |

---

## Progress Tracking
Refer to the AGENTS.md file in the task directory for instructions on tracking and reporting progress during implementation.

---

## Appendices & References (Optional)
- `.devagent/workspace/tasks/active/2026-01-19_repeatable-beads-setup-instructions/clarification/2026-01-20_initial-clarification.md`
- `.devagent/workspace/tasks/active/2026-01-19_repeatable-beads-setup-instructions/research/2026-01-20_low-noise-beads-submodule-setup-research.md`
- `.devagent/workspace/tasks/active/2026-01-19_repeatable-beads-setup-instructions/research/2026-01-19_beads-separate-repo-and-multi-repo-options.md`
- `.devagent/workspace/research/2026-01-14_beads-sync-branch-setup.md`
- `.devagent/workspace/research/2026-01-14_beads-syncing-setup.md`
- `.devagent/workspace/tasks/active/2026-01-18_improve-beads-task-labeling-and-syncing/research/2026-01-18_beads-label-routing-and-post-commit-sync-churn.md`
