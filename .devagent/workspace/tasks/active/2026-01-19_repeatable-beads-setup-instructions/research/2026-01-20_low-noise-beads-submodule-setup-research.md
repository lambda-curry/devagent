# Research: “Low-Noise” Beads Setup — Submodule Target (Updated from Clarification)

**Date:** 2026-01-20  
**Task Hub:** `.devagent/workspace/tasks/active/2026-01-19_repeatable-beads-setup-instructions/`  

## Classification & Assumptions
- **Classification:** Workflow/documentation research (updated requirements + internal consistency scan).

### Inferred Problem Statement
Based on the clarification packet, we want a repeatable Beads setup that keeps Beads task syncing reliable while avoiding:
- Beads-only commits mixed into the **code repo** history,
- `.beads/issues.jsonl` merge noise in the code repo, and
- Beads artifacts showing up in code PR diffs.

The current preferred direction is to make `.beads/` a **git submodule repo** that contains `.beads/issues.jsonl` (code repo should not track it), while allowing the code repo to occasionally update the submodule pointer **only bundled with real code commits**.

### Assumptions
- [INFERRED] “Using only `.devagent/**`” means we can only rely on internal documentation right now; any Beads-submodule feasibility claims require follow-up validation against Beads primary docs and/or a small experiment.
- [INFERRED] The “post-commit drift” symptom is the already-documented Beads export debounce / timing race where `.beads/issues.jsonl` updates after a commit, causing follow-up churn. See `.devagent/workspace/tasks/active/2026-01-18_improve-beads-task-labeling-and-syncing/research/2026-01-18_beads-label-routing-and-post-commit-sync-churn.md`.

## Research Plan (what was validated)
- Map the clarified “submodule” target to the existing documented setups (normal sync, sync-branch, daemon + flush).
- Identify internal knobs/patterns we already have that relate to “separate state”:
  - `BEADS_DB` (DB path override), `BEADS_NO_DAEMON` (force direct mode)
  - pre-commit flush guidance `bd sync --flush-only`
- Identify where current docs would need to change for a submodule approach (hooks/merge driver/config boundaries).
- Produce an updated recommendation and a “next validation” checklist.

## Sources (internal)
- Clarified requirements:
  - `.devagent/workspace/tasks/active/2026-01-19_repeatable-beads-setup-instructions/clarification/2026-01-20_initial-clarification.md`
- Existing setup docs:
  - `.devagent/workspace/research/2026-01-14_beads-syncing-setup.md`
  - `.devagent/workspace/research/2026-01-14_beads-sync-branch-setup.md`
- Drift/churn analysis + mitigation:
  - `.devagent/workspace/tasks/active/2026-01-18_improve-beads-task-labeling-and-syncing/research/2026-01-18_beads-label-routing-and-post-commit-sync-churn.md`
- Prior “separate repo” research baseline:
  - `.devagent/workspace/tasks/active/2026-01-19_repeatable-beads-setup-instructions/research/2026-01-19_beads-separate-repo-and-multi-repo-options.md`

## Findings & Tradeoffs
### 1) The most evidenced “keep Beads out of code PR diffs” pattern today is sync-branch mode (same repo, separate branch)
The existing sync-branch doc explicitly describes a state where `main` has **no** `.beads/issues.jsonl`, and Beads state lives on a separate branch/worktree:

- `.devagent/workspace/research/2026-01-14_beads-sync-branch-setup.md` (Architecture section) states:
  - `Main Branch (main): ... (No .beads/issues.jsonl - stays in sync branch)`
  - `Sync Branch (beads-sync): .beads/issues.jsonl ...`

**Tradeoff:** This meets the “PR diffs stay clean” goal for code PRs on `main`, but it is not a “separate repo” solution. It also introduces a “merge/review Beads changes” workflow.

### 2) A submodule approach changes the unit of “noise”, but doesn’t magically remove it
If `.beads/` is a submodule:
- The code repo will frequently show “`.beads` has new commits” unless the submodule pointer is updated.
- This is acceptable per clarification, but it is a *different* kind of “noise” (git status noise vs commit history noise).

**Key implication:** Keeping Beads state in a submodule does **not** eliminate sync churn; it relocates it to the submodule repo. That’s still good if the primary pain is code repo commit history + PR diffs.

### 3) Git integration/hook strategy must be rethought across the repo boundary
Current documented “git hooks” patterns in `.devagent/workspace/research/2026-01-14_beads-syncing-setup.md` assume `.beads/issues.jsonl` is in the current repo (example hooks call `bd import -i .beads/issues.jsonl` etc).

If `.beads/` is a submodule and the code repo no longer tracks `.beads/issues.jsonl`:
- Any merge driver configuration and hooks that operate on `.beads/issues.jsonl` must live/configure within the **submodule repo**, not the code repo.
- The code repo may still want wrapper scripts for ergonomics (“run from code repo”), but the canonical git integration still needs to be correct in `.beads/`.

**Tradeoff:** This likely improves separation but increases setup complexity; a setup script becomes more important.

### 4) “Post-commit drift” is still relevant inside the Beads repo unless we adopt a blocking flush convention
Internal docs already describe:
- The daemon/export debounce can update `.beads/issues.jsonl` after you commit, forcing an extra follow-up commit.
- A targeted mitigation is a blocking pre-commit flush: `bd sync --flush-only`.

Even if `.beads/` is a separate repo, drift can still occur in that repo unless the mitigation is applied where commits happen.

**Tradeoff:** Daemon can still be “okay”, but it needs a policy:
- either disable daemon for predictability (direct mode), or
- keep daemon but enforce a blocking flush in the Beads repo before commits/pushes.

### 5) Internal docs contain a potential contradiction we should resolve before publishing a “daemon is fine” recommendation
- `.devagent/workspace/research/2026-01-14_beads-syncing-setup.md` says: “Daemon does NOT work with git worktrees.”
- `.devagent/workspace/research/2026-01-14_beads-sync-branch-setup.md` describes daemon usage alongside a worktree-based sync-branch architecture.

**Tradeoff / risk:** Before we publish any “daemon is OK” guidance, we need to reconcile this in the documented modes (or clearly scope where daemon is allowed).

## Recommendation (based on internal evidence only)
### Updated decision tree for “low-noise” docs
1) **If the goal is primarily “no Beads artifacts in code PR diffs”** (and you can tolerate a separate Beads review/merge flow):
- Recommend **sync-branch mode** as the most internally evidenced solution today.

2) **If the goal is “separate repo entirely”** (submodule at `.beads/`):
- Treat this as an *intended* default but **not yet validated** in internal docs.
- Document it as “proposed / needs validation”, and provide a concrete experiment checklist before recommending it.

### Drift mitigation guidance to carry forward (regardless of mode)
Make the “blocking flush before commit” guidance (`bd sync --flush-only`) first-class, but ensure it’s applied in the repo where Beads commits occur:
- normal sync: hooks/flush in the code repo
- sync-branch mode: ensure the branch/worktree flow does the flush at the right time
- submodule mode: ensure hooks/flush live in the `.beads/` submodule repo (and that agents invoking Beads do so through a wrapper that honors it)

## Repo Next Steps (checklist)
- [ ] **Validate feasibility** of the `.beads/` submodule pattern (requires primary Beads docs and/or a minimal experiment run). Record results in this task hub.
- [ ] Decide and document a single drift-mitigation policy for the recommended default:
  - (A) daemon off by default + explicit sync commands, or
  - (B) daemon allowed + required blocking flush before commit.
- [ ] Define the intended hook/setup strategy for submodule mode:
  - which hooks exist in `.beads/.git/hooks/`,
  - whether the code repo needs any hooks at all, and
  - how to ensure “run from code repo” wrapper still executes the correct behavior.
- [ ] Reconcile the daemon/worktree contradiction in existing internal docs before turning this into portable core docs.

## Risks & Open Questions
- **[🔍 needs research]** Does Beads support relocating its “project root” state cleanly into a submodule at `.beads/` (including any repo-fingerprint binding mentioned in sync-branch docs)?
- **[🔍 needs research]** What is the correct merge driver + hooks setup when `.beads/issues.jsonl` is in a submodule repo (and how do we install it repeatably)?
- **[⏭️ deferred]** Onboarding “get latest tasks” standard step: `git -C .beads pull` vs `git submodule update --remote`.
- **[🔍 needs research]** Daemon policy: Is daemon truly safe in the desired setup, or do we need direct mode to eliminate drift?

