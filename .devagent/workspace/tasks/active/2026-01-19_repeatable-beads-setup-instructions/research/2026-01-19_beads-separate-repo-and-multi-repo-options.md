# Research: Beads “Separate Repo” (`BEADS_DIR`) + Multi-Repo Options (DevAgent)

**Date:** 2026-01-19  
**Task Hub:** `.devagent/workspace/tasks/active/2026-01-19_repeatable-beads-setup-instructions/`  

## Classification & Assumptions
- **Classification:** Implementation/workflow documentation research (setup patterns + validation checklist).

### Inferred Problem Statement
We need **repeatable, copy/paste-friendly** Beads setup instructions that cover:
- existing DevAgent patterns (normal sync, sync-branch, daemon/direct mode, pre-commit flush), and
- **how to keep Beads state outside the code repo** (task hub calls this a “separate sister repo via `BEADS_DIR`”), plus any “multi-repo routing/hydration” variants,
with clear verification + troubleshooting guidance.

### Assumptions
- [INFERRED] We want to minimize “repo noise” (extra commits / `.beads` changes on `main`) while keeping Beads sync reliable.
- [INFERRED] We should prefer **documented-in-this-repo** behaviors over inventing new Beads behaviors.
- [INFERRED] “Separate repo via `BEADS_DIR`” is a desired setup target, but may not yet be documented in DevAgent’s workspace docs.
- [INFERRED] “Multi-repo routing/hydration” likely means: one agent/tooling process needs to **read/write Beads tasks while operating across multiple repos**, or in a “code repo” while storing Beads state elsewhere.

## Research Plan (what was validated)
- Confirm what setup modes are already documented in DevAgent workspace research and Ralph plugin docs.
- Confirm which env/config knobs DevAgent already supports for “Beads location”:
  - DB path override (`BEADS_DB`)
  - daemon control (`BEADS_NO_DAEMON`)
  - Ralph config `beads.database_path`
- Identify what is **missing / undocumented** inside `.devagent/**` regarding `BEADS_DIR` and multi-repo behavior.
- Produce a safe recommendation that avoids unverified claims and identifies concrete validation steps.

## Sources (internal, within `.devagent/**`)
- `.devagent/workspace/tasks/active/2026-01-19_repeatable-beads-setup-instructions/AGENTS.md` — explicitly calls out “separate sister repo via `BEADS_DIR`” and multi-repo routing/hydration as targets.
- `.devagent/workspace/research/2026-01-14_beads-syncing-setup.md` — documented sync modes, hooks patterns, and verification commands.
- `.devagent/workspace/research/2026-01-14_beads-sync-branch-setup.md` — “sync branch mode” and repository fingerprint binding note.
- `.devagent/workspace/tasks/active/2026-01-18_improve-beads-task-labeling-and-syncing/research/2026-01-18_beads-label-routing-and-post-commit-sync-churn.md` — documents post-commit `.beads/issues.jsonl` churn + `bd sync --flush-only` mitigation.
- `.devagent/plugins/ralph/workflows/setup-ralph-loop.md` — daemon recommendations + `BEADS_NO_DAEMON=1`.
- `.devagent/plugins/ralph/tools/ralph.sh` — exports `BEADS_DB` based on `.devagent/plugins/ralph/tools/config.json` (`beads.database_path`).
- `.devagent/workspace/tasks/active/2026-01-17_extend-task-metadata-for-error-tracking/research/2026-01-17_task-metadata-extension-research.md` — DB path resolution pattern (`process.env.BEADS_DB || join(repoRoot, '.beads', 'beads.db')`).

## Findings & Tradeoffs
### 1) “Separate repo” is not yet documented in `.devagent/**` beyond the task hub mention
Inside `.devagent/**`, `BEADS_DIR` is only referenced in the active task hub’s `AGENTS.md`. There are **no internal docs** describing:
- what `BEADS_DIR` does,
- how it interacts with git sync / merge driver,
- how it interacts with the Beads CLI’s notion of “repo root”, or
- what files would live in the “sister repo”.

**Tradeoff:** We can’t safely document `BEADS_DIR` behavior without external/primary Beads docs or a validated experiment, because that would be unverified.

### 2) DevAgent already supports “separate location” for Beads via `BEADS_DB` (DB-only)
DevAgent tooling already has a concept of “the Beads database can live somewhere else”:

- `.devagent/plugins/ralph/tools/ralph.sh` exports `BEADS_DB` from config and supports **absolute** paths.
- Prior workspace research describes a standard DB path resolution pattern in code: `process.env.BEADS_DB || join(repoRoot, '.beads', 'beads.db')`.

**What this enables (validated in-repo):**
- Ralph (and code that follows the same pattern) can target a Beads SQLite DB **outside** the repo by setting `BEADS_DB` (or by setting an absolute `beads.database_path` in Ralph config so `ralph.sh` exports it).

**What this does *not* prove (not documented in `.devagent/**`):**
- Whether `bd` (the Beads CLI) will also treat `.beads/issues.jsonl` and other Beads files as “relocated” when only `BEADS_DB` is set.
- Whether this achieves a “separate sister repo” in the sense of “all Beads state and git history live elsewhere.”

**Tradeoff:** DB-only relocation may reduce coupling for *readers* (e.g., `ralph-monitoring` reading tasks), but may not eliminate `.beads/issues.jsonl` churn in the code repo unless Beads also supports relocating the JSONL/export root.

### 3) The best-documented “keep code commits clean” option is sync-branch mode (same repo, separate branch)
DevAgent has strong internal documentation for using Beads “sync branch mode” (`beads-sync`) to isolate Beads commits from the main development branch.

**Why this matters for “minimize repo noise”:**
- It keeps Beads history on a dedicated branch while allowing normal code development on `main`.

**Tradeoff:** This is still a single repo solution (not a sister repo), but it’s the **most evidenced** way (in this repo) to keep Beads changes from cluttering code commits on `main`.

### 4) Post-commit `.beads/issues.jsonl` churn already has a targeted mitigation: `bd sync --flush-only`
Internal research explicitly documents the “JSONL export happened after commit” failure mode and recommends a blocking pre-commit flush:

- `bd sync --flush-only`

**Tradeoff:** Adds a small delay before committing, but avoids repeated follow-up “beads sync” commits and reduces uncertainty about whether Beads state made it into the commit you just created.

### 5) Daemon vs direct mode needs a single clear recommendation (docs show nuance/conflict)
Internal docs recommend forcing direct mode for agent-driven setup (`export BEADS_NO_DAEMON=1`) to avoid daemon startup penalties.

Separately, internal Beads setup docs mention daemon/worktree interaction constraints (notably around worktrees) while sync-branch mode uses a worktree.

**Tradeoff / risk:** We should avoid hard claims here until we validate the precise combination we recommend for each setup pattern (normal sync vs sync-branch vs any future separate-repo mode).

### 6) “Multi-repo routing/hydration” is not defined anywhere inside `.devagent/**` today
Within `.devagent/**` there’s no explicit definition of:
- what “routing/hydration” means in the context of Beads, or
- whether DevAgent expects to read/write tasks from multiple repos, or
- what the desired user flow is (e.g., “code repo runs Ralph but stores tasks in separate repo”, vs “central tasks repo drives multiple code repos”).

**Tradeoff:** We can’t confidently recommend a multi-repo architecture without first defining the desired flow and validating Beads’ support for relocating all relevant state (DB + JSONL + config/metadata).

## Recommendation
### What we *can* document immediately (based on current internal evidence)
- **Primary default:** Document **Normal Sync** and **Sync-Branch Mode** as the two proven setups, and when to choose each. Sources: `.devagent/workspace/research/2026-01-14_beads-syncing-setup.md`, `.devagent/workspace/research/2026-01-14_beads-sync-branch-setup.md`.
- **Make “pre-commit flush” a first-class recommendation** to prevent post-commit churn: `bd sync --flush-only`. Source: `.devagent/workspace/tasks/active/2026-01-18_improve-beads-task-labeling-and-syncing/research/2026-01-18_beads-label-routing-and-post-commit-sync-churn.md`.
- **Document DB-path override support** as a DevAgent capability (for tooling like `ralph-monitoring` / Ralph execution): `BEADS_DB` and absolute `beads.database_path`. Make it explicit that this is **DB-only** based on current evidence.

### What we should *not* document as fact yet
- Any specific behavior of `BEADS_DIR`, or any claim that it “moves all Beads state into a sister repo,” because that behavior is not documented anywhere inside `.devagent/**` today.
- Any “multi-repo routing/hydration” architecture, until we define the intended workflow and validate Beads’ support.

## Repo Next Steps (checklist)
- [ ] Define the intended “separate repo” user flow precisely (what moves: DB, JSONL, hooks, merge driver, sync history).
- [ ] Add a small validation experiment plan for `BEADS_DIR` (run locally and capture outputs) and store results in this task’s `research/` folder. **Note:** requires consulting Beads primary docs and/or running `bd` experiments; not currently evidenced in `.devagent/**`.
- [ ] Decide whether DevAgent’s “separate repo” story is:
  - (A) “use sync-branch mode” (most evidenced, same repo), or
  - (B) “use `BEADS_DB` external DB” (tooling-supported, DB-only), or
  - (C) “true sister repo” (requires validated `BEADS_DIR` semantics).
- [ ] If we proceed with (B) or (C), update Ralph/monitoring documentation to recommend **absolute** DB paths (so worktrees and varied working directories are safer).

## Risks & Open Questions
- **[NEEDS CLARIFICATION] `BEADS_DIR` semantics:** What does it relocate (DB? JSONL? config? all of the above), and how does it interact with git integration?
- **[NEEDS CLARIFICATION] Repo fingerprint binding:** sync-branch setup notes the DB is “bound to this repository.” If we store Beads state in a separate repo, does that become the “bound” repo, and what does that mean for running `bd` from the code repo?
- **[NEEDS CLARIFICATION] JSONL location/source of truth:** If Beads JSONL remains in the code repo but DB is external, what is the intended source of truth and sync flow?
- **[NEEDS CLARIFICATION] Daemon + worktree compatibility:** internal docs imply constraints; sync-branch mode uses a worktree. We need a crisp recommendation per pattern.
