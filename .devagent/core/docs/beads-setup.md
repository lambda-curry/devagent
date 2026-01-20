# Beads Setup Guide (Low-Noise Options)

This guide provides repeatable, copy/paste-friendly setup options for Beads with an emphasis on keeping Beads artifacts out of code PR diffs and avoiding Beads-only commits in the main code repo history.

## Evidence Levels

- **Strong:** Documented internally and used in this repo.
- **Medium:** Supported by internal tooling but missing full end-to-end validation.
- **Target / Not validated:** Intended direction but not yet verified (and may be blocked).

## Decision Tree (Evidence-Tagged)

Use the following decision tree to pick a setup. Evidence tags reflect how well each path is validated in this repo.

- **Need zero Beads artifacts in code PR diffs today?** → **Sync-Branch Mode**
  - Evidence: **Strong**
  - Recommended default for low-noise setups until submodule mode is validated.

- **Want Beads state in a separate repo at `.beads/`?** → **Submodule Mode**
  - Evidence: **Target / Not validated** (currently blocked by `bd sync` commit behavior; see validation report)

- **Need to keep Beads DB outside the repo for tooling/automation?** → **DB-Only Relocation** (`BEADS_DB`)
  - Evidence: **Medium** (tooling supports DB path override; JSONL relocation unverified)

If none of the above match, use **Normal Sync** and accept Beads artifacts in code history (most straightforward).

## Recommended Defaults

- **Low-noise default (today):** Sync-Branch Mode (evidence: Strong).
- **Target default (after validation):** Submodule Mode at `.beads/` with bundled-only pointer updates (currently blocked; see validation report).

## Setup Options

### Option A: Normal Sync (Baseline)
**Use when:** You accept Beads artifacts in the main branch history.

**Evidence:** Strong (documented internally).

**Summary:**
- `.beads/issues.jsonl` is tracked in the main repo
- Use `bd sync` or git hooks for pull-first merge

### Option B: Sync-Branch Mode (Low-Noise Proven)
**Use when:** You want a clean `main` branch and can review Beads changes separately.

**Evidence:** Strong (documented internally).

**Summary:**
- `main` stays free of `.beads/issues.jsonl`
- Beads commits go to `beads-sync` branch (worktree-backed)
- Periodically merge `beads-sync` into `main`

**Core commands (reference):**
```bash
bd config set sync.branch beads-sync
bd sync --status
```

### Option C: Submodule Mode at `.beads/` (Target, Not Validated)
**Use when:** You want Beads state in a separate repo while keeping code history clean.

**Evidence:** Target / Not validated (validation currently shows a commit-path blocker).

**Summary:**
- `.beads/` is a git submodule repo
- Beads commits happen inside the submodule
- Code repo only updates the submodule pointer when bundled with real code changes

**Critical caveats (as validated on 2026-01-20):**
- `bd sync` fails when run from the code repo because `git add .beads/issues.jsonl` is not allowed inside a submodule.
- Running `bd` inside the submodule repo does not find the DB because it expects a nested `.beads/` directory.
- Result: submodule mode is **blocked** without upstream support for a relocatable Beads root or submodule-aware sync.

### Option D: DB-Only Relocation (`BEADS_DB`)
**Use when:** You need tooling to read/write a DB outside the repo (e.g., automation)

**Evidence:** Medium (DevAgent tooling supports this; JSONL relocation is unverified).

**Summary:**
- Set `BEADS_DB` to an absolute path
- The DB moves, but `.beads/issues.jsonl` may still live in the repo

#### Ralph E2E variant: isolate runs with a dedicated Beads DB (DB-only)
**Use when:** You want Ralph E2E runs to use a clean, dedicated SQLite DB (so experiments and drift don’t touch your “main” Beads DB), without changing how Beads sync works in git.

**Evidence:** Strong for **DB path override** in Ralph tooling; **DB-only** isolation (not a full “separate Beads repo” relocation).

**How it works (DevAgent evidence):**
- Ralph reads `.devagent/plugins/ralph/tools/config.json` → `beads.database_path`.
- Ralph exports `BEADS_DB` from that value (absolute paths supported). See `.devagent/plugins/ralph/tools/ralph.sh`.

**Setup (copy/paste, minimal):**

```bash
# 1) Pick a dedicated DB path for the run (absolute path recommended)
export RALPH_E2E_DB="$PWD/.devagent/workspace/tests/ralph-e2e/runs/_local/beads.e2e.db"

# 2) Initialize that DB from the current JSONL snapshot
# (this creates a fresh DB containing the issues Ralph needs)
bd --db "$RALPH_E2E_DB" import -i .beads/issues.jsonl --force
bd --db "$RALPH_E2E_DB" migrate --update-repo-id --yes
bd --db "$RALPH_E2E_DB" migrate --yes

# 3) Point Ralph at the dedicated DB by setting beads.database_path to the absolute path:
#   .devagent/plugins/ralph/tools/config.json
#     { "beads": { "database_path": "/abs/path/to/beads.e2e.db" } }
#
# 4) Run Ralph as usual (Ralph will export BEADS_DB from config.json)
```

**Notes / caveats:**
- This isolates the **SQLite DB** used by Ralph; it does **not** relocate `.beads/issues.jsonl` or change sync-branch behavior.
- Updating `.devagent/plugins/ralph/tools/config.json` is a repo change—treat it as a **local-only** tweak during E2E runs (don’t commit it unless you intend to change defaults).

## Drift Mitigation (All Modes)

Beads exports to `.beads/issues.jsonl` can lag behind DB writes. To avoid post-commit churn, run a blocking flush before commits:

```bash
bd sync --flush-only
```

**Policy:** If you commit Beads state (in any repo), you must flush before commit. Prefer enforcing this via a pre-commit hook.

## Health Checks (Recommended)

Run `bd doctor` after setup changes, upgrades, or unexpected JSONL churn:

```bash
bd doctor
```

If `bd doctor` flags sync-branch drift or missing git index flags, use:

```bash
bd doctor --fix
```

**Note:** `bd doctor --fix` may reset the sync branch to match `main` and update git index flags. Only run it if you are OK resetting `beads-sync` to a clean metadata-only state.

## Hook Installation (Normal Sync + Sync-Branch)

Install hooks in the repo that tracks `.beads/issues.jsonl` (the code repo in normal or sync-branch mode):

```bash
bd hooks install
```

After upgrading `bd`, refresh shims to avoid version drift:

```bash
bd hooks install --force
bd hooks list
```

Minimum required hook behavior:
- **pre-commit:** `bd sync --flush-only`
- **post-merge / post-checkout:** import JSONL into DB
- **pre-push:** export DB to JSONL

## Hook + Merge Driver Strategy (Repo Boundaries)

- **Normal Sync / Sync-Branch:** hooks + merge driver live in the code repo.
- **Submodule Mode (blocked today):** if/when supported, hooks + merge driver would live in the `.beads/` submodule repo.
  - The code repo should not track `.beads/issues.jsonl`.
  - Wrapper scripts in the code repo should call `bd` against the submodule path.

## Fresh Clone Setup (Sync-Branch Default)

When cloning a repo that already tracks `.beads/issues.jsonl`:

```bash
# 1) Initialize DB from JSONL (required on fresh clones)
bd init --from-jsonl --skip-hooks --skip-merge-driver

# 2) Ensure local sync branch exists (if using sync-branch mode)
git branch beads-sync origin/beads-sync

# 3) Verify status
bd sync --status
```

If you only need read-only access, you can use `bd --no-db` instead of initializing a DB.

## Troubleshooting

- **`.beads/issues.jsonl` shows up in code PRs**
  - You are not in sync-branch or submodule mode. Re-check setup.
- **Fresh clone: “no beads database found”**
  - Run `bd init --from-jsonl` to create the DB, or use `bd --no-db` for read-only workflows.
- **Fresh clone: `sync branch ... does not exist`**
  - Create a local tracking branch: `git branch beads-sync origin/beads-sync`.
- **Post-commit Beads churn**
  - Add `bd sync --flush-only` to pre-commit hook in the repo where Beads commits happen.
- **Sync branch behind main (doctor warning)**
  - Run `bd doctor --fix` to reset the sync branch to a clean metadata-only state.
  - If you need to preserve unmerged Beads metadata, merge or push it before resetting.
- **Hooks not firing**
  - Confirm hooks are installed in the correct repo (`.git/hooks` inside the repo that tracks `.beads/issues.jsonl`).
- **Daemon + worktree warnings**
  - Use direct mode (`BEADS_NO_DAEMON=1`) if you rely on worktrees, unless validated otherwise.

## Verification Checklist

Run these checks after setup (or on a fresh clone):

1. **Beads status is clean after sync**
   - Run `bd sync --status` and confirm expected branch/submodule behavior.
2. **No Beads artifacts in code PR diffs**
   - `git status` in the code repo should not show `.beads/issues.jsonl` (sync-branch or submodule mode).
3. **Flush before commit works**
   - `bd sync --flush-only` completes and no new JSONL changes appear after commit.
4. **Hooks installed in the right repo**
   - Hooks exist in `.git/hooks` for the repo that tracks `.beads/issues.jsonl`.
5. **Doctor clean or understood**
   - Run `bd doctor` and resolve (or explicitly accept) any sync-branch warnings.

## References

- `.devagent/workspace/research/2026-01-14_beads-syncing-setup.md`
- `.devagent/workspace/research/2026-01-14_beads-sync-branch-setup.md`
- `.devagent/workspace/tasks/active/2026-01-18_improve-beads-task-labeling-and-syncing/research/2026-01-18_beads-label-routing-and-post-commit-sync-churn.md`
- `.devagent/workspace/tasks/active/2026-01-19_repeatable-beads-setup-instructions/research/2026-01-20_low-noise-beads-submodule-setup-research.md`
- `.devagent/workspace/tasks/active/2026-01-19_repeatable-beads-setup-instructions/research/2026-01-19_beads-separate-repo-and-multi-repo-options.md`
- `.devagent/workspace/tasks/active/2026-01-19_repeatable-beads-setup-instructions/research/2026-01-20_beads-submodule-validation.md`
- `.devagent/workspace/tasks/active/2026-01-19_repeatable-beads-setup-instructions/research/2026-01-20_fresh-clone-validation.md`
