# Research: Beads Label Routing and Post-Commit Sync Churn

**Date:** 2026-01-18  
**Task Hub:** `.devagent/workspace/tasks/completed/2026-01-18_improve-beads-task-labeling-and-syncing/`  

## Classification & Assumptions
- **Classification:** Workflow/process investigation (label-driven routing + Beads sync/flush behavior).
- **Problem statement:** The last run routed most/all work to the project manager agent, likely due to missing/misapplied Beads labels. Additionally, `.beads/issues.jsonl` often changes after commits (a “thinking issue” / post-commit churn), forcing extra follow-up commits to sync Beads state. We want a cleaner default: direct epic children are the main execution units and should be labeled for the correct agent; deeper sub-issues are context-only and should not require labels. We also want to prevent unnecessary extra commits caused by Beads export timing.
- **Assumptions:** Beads is running with a daemon/export debounce window on this machine, and Beads DB mutations can occur shortly before `git commit`.

## Research Plan (what was validated)
- Confirm how Ralph chooses an agent from Beads task labels (and what happens with no label / unknown labels).
- Confirm the canonical label taxonomy and where labels are expected to be assigned (top-level tasks vs subtasks).
- Identify repo-documented causes and mitigations for `.beads/issues.jsonl` changing after commits.
- Map the above to actionable workflow changes (label assignment + pre-commit flush guidance).

## Sources (internal)
- `.devagent/plugins/ralph/tools/ralph.ts` (freshness: 2026-01-18) — label-driven router behavior (first matching label; fallback to `general`).
- `.devagent/plugins/ralph/tools/config.json` (freshness: 2026-01-18) — label → agent profile mapping (`general` → project-manager agent; `engineering` → implementation agent; etc.).
- `.devagent/plugins/ralph/workflows/setup-ralph-loop.md` (freshness: 2026-01-18) — plan→Beads task creation guidance, label assignment rules, and explicit note that subtasks can be created without labels.
- `.devagent/plugins/ralph/agents/project-manager-agent-instructions.md` (freshness: 2026-01-18) — PM agent dual role (fallback implementer vs explicitly labeled coordinator).
- `.devagent/plugins/ralph/README.md` (freshness: 2026-01-18) — explains Beads daemon export race and recommends `bd sync --flush-only` pre-commit.
- `.devagent/workspace/reviews/2026-01-18_devagent-6979-improvements.md` (freshness: 2026-01-18) — calls out “beads-sync follow-up commit churn” and recommends running sync earlier (pre-commit).

## Findings & Tradeoffs
### 1) Why the project manager agent becomes the “everything” agent
Ralph resolves an agent by reading labels from `bd label list <task-id>`, then selecting the **first label** that matches a key in `config.agents`. If there are **no labels**, or none match the mapping, Ralph falls back to the configured `general` agent.

- In this repo’s config, `general` maps to the **project manager agent** (`project-manager-agent.json`), so missing/mismatched labels naturally route work to the PM agent. See `.devagent/plugins/ralph/tools/ralph.ts` + `.devagent/plugins/ralph/tools/config.json`.

**Tradeoff:** The fallback is useful for robustness, but it masks labeling problems; you’ll only notice misrouting after the loop starts.

### 2) Label taxonomy exists, but responsibilities are slightly contradictory
The setup workflow describes a canonical label taxonomy (`engineering`, `qa`, `design`, `general`) and also mentions using `project-manager` sparingly for check-ins/final review; config supports both `general` and `project-manager` labels.

However, PM agent instructions explicitly say:
- **No label / fallback:** PM agent can execute implementation work.
- **Explicit `project-manager` label:** PM agent should coordinate and delegate, not implement.

This mismatch can create two failure modes:
- Teams lean on fallback (unlabeled tasks), accidentally making PM “do everything”.
- Teams apply `project-manager` label too broadly, also making PM “own everything” (but with instructions that say it shouldn’t implement).

**Tradeoff:** Keeping PM as fallback reduces failure to start; making PM strictly delegation-only increases correctness but can stall if labels are missing.

### 3) “Sub-issues don’t need labels” is consistent with existing workflow guidance
`setup-ralph-loop` labels **top-level tasks** during creation (one label per task) but creates **subtasks** without a label step, which matches your intended rule: deeper sub-issues are context scaffolding, not separately routed work units. See `.devagent/plugins/ralph/workflows/setup-ralph-loop.md` and the existing “sub-issues as context” approach in `.devagent/plugins/ralph/tools/ralph.ts` prompt construction.

**Tradeoff:** If a subtask actually requires a different agent/tooling, the “no label” default will route it to `general` (PM) unless you explicitly label it later.

### 4) The post-commit `.beads/issues.jsonl` churn is already documented (and has a targeted fix)
The repo documents a specific failure mode: Beads updates live in the SQLite DB and are exported to `.beads/issues.jsonl` on a debounce window (daemon). If you commit too quickly, the JSONL export can happen **after** your commit, forcing an extra “sync” commit.

The recommended mitigation is a **blocking flush** right before the commit:

- `bd sync --flush-only`

This is explicitly recommended in `.devagent/plugins/ralph/README.md`, and the same churn is called out in `.devagent/workspace/reviews/2026-01-18_devagent-6979-improvements.md`.

**Tradeoff:** This adds a small pre-commit delay, but avoids repeated follow-up commits and reduces “did we commit Beads state?” ambiguity.

## Recommendation
### A) Make label assignment non-optional for **direct epic child tasks**
- Treat “direct children of the epic” as the main execution units and require exactly **one** label from: `engineering`, `qa`, `design`, `general`.
- Reserve `project-manager` label for explicitly coordination-only tasks (phase check-ins, final review / revise report).
- Add an explicit “label verification” step to the setup process (e.g., after creation, run `bd label list <task-id>` for each top-level task and confirm it’s in the config mapping).

### B) Document and enforce the “one level deep” labeling rule
- Explicitly state: **Only the epic’s direct child tasks must be labeled** for agent routing.
- Subtasks/sub-issues should generally be unlabeled and treated as context; label them only when you intentionally want distinct routing.

### C) Fix the “post-commit Beads churn” by flushing before commit (not by adding more commits)
- Adopt the repo’s documented mitigation: run `bd sync --flush-only` **before** committing (ideally via a pre-commit hook).
- Prefer `--flush-only` over full `bd sync` to avoid any network/push/pull behavior and reduce flakiness.

### D) Reframe the PM agent’s fallback behavior to be delegation-first
- Keep PM as the “safety net” fallback, but change the default behavior to: quickly triage → apply the correct label → delegate (rather than implementing by default).
- Only allow PM to implement when the task is truly “general implementation” (or when no other agents exist / labeling is impossible).

## Repo Next Steps (checklist)
- [ ] Update/clarify plan→Beads setup guidance to enforce a single-label requirement for **top-level** tasks and add a “verify labels exist in config mapping” step.
- [ ] Add a short doc section that codifies: “labels only required one-level under epic; deeper sub-issues are context-only by default.”
- [ ] Roll out the pre-commit mitigation for Beads export timing: run `bd sync --flush-only` before `git commit`.
- [ ] Decide PM agent default: “delegation-first” vs “fallback implementer” and align instructions accordingly.

## Risks & Open Questions
- **[NEEDS CLARIFICATION]** Which workflow path created the unlabeled tasks (setup-ralph-loop CLI creation vs plan-to-beads JSON conversion vs some other automation)?
- **[NEEDS CLARIFICATION]** Is the unwanted “thinking issue” specifically “`.beads/issues.jsonl` changed after commit”, or a different Beads-side artifact/event?
- If multiple labels are present on a task, Ralph picks the **first matching** label; ordering may matter if Beads returns labels in a non-deterministic order. Consider enforcing one-label-only as a hard rule.

## Diagnostic Notes (2026-01-18)
- Verified local `.git/hooks/pre-commit` includes `bd sync --flush-only` immediately before `exec bd hooks run pre-commit "$@"` (hook present and configured).
- Still need to validate whether the commit flow in use (CLI vs GUI/IDE) is executing hooks and whether any Beads mutations happen **after** the flush step.
