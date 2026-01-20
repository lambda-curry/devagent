# Validation: Beads Submodule Feasibility (Low-Noise Target)

**Date:** 2026-01-20  
**Task Hub:** `.devagent/workspace/tasks/completed/2026-01-19_repeatable-beads-setup-instructions/`

## Goal
Validate whether `.beads/` can be a git submodule repo while still supporting standard `bd` workflows (init, create, sync, hooks) without Beads-only commits in the code repo.

## Environment
- Local temp repos under `/tmp`
- `bd` CLI available at `/Users/jaruesink/.local/bin/bd`
- Git submodule created using local file path (file protocol allowed)

## Experiment Steps

### 1) Create repos and add `.beads` as a submodule
```bash
# Create temp repos
/tmp/beads-submodule-validation.<id>/beads-state   # submodule repo
/tmp/beads-submodule-validation.<id>/code-repo     # code repo

# Add submodule
git -c protocol.file.allow=always submodule add /tmp/.../beads-state .beads
```

### 2) Initialize Beads from the code repo
```bash
cd /tmp/.../code-repo
bd init --skip-hooks --skip-merge-driver
```
**Result:** Init succeeded. Database created at `.beads/beads.db` and Beads files written under the submodule path.

### 3) Confirm Beads location and create an issue
```bash
bd where --json
bd create "Test issue" -t task -p 2
```
**Result:**
- `bd where` reports the active path as `.../code-repo/.beads` (the submodule).
- `bd create` wrote `issues.jsonl` inside the submodule repo.

### 4) Sync branch status (code repo)
```bash
bd config set sync.branch beads-sync
# create branch in code repo
git checkout -b beads-sync

git checkout main
bd sync --status
```
**Result:** `bd sync --status` succeeds after the sync branch exists in the **code repo**.

### 5) Commit path failure in code repo
```bash
git add .beads/issues.jsonl
# -> fatal: Pathspec '.beads/issues.jsonl' is in submodule '.beads'

bd sync --no-pull --no-push
# -> Error: committing: git add failed: exit status 128
```
**Result:** `bd sync` fails when it tries to `git add` inside the parent repo, because `.beads/issues.jsonl` is inside a submodule.

### 6) Run `bd` inside the submodule repo
```bash
cd /tmp/.../code-repo/.beads
bd where --json
```
**Result:** `bd` fails to find a database, because it expects `.beads/*.db` relative to the current repo root. In submodule root, the DB is at `./beads.db` (not `./.beads/beads.db`).

### 7) Attempt to point `bd` at the DB explicitly (submodule)
```bash
bd --db ./beads.db where --json
```
**Result:** Command crashed with a stack overflow in daemon auto-start logic (unexpected failure). This likely indicates unsupported path/config for this mode.

## Findings
- **Running `bd` from the code repo works for reads/writes** (`bd create`, `bd where`, JSONL export).
- **`bd sync` cannot commit** when `.beads` is a submodule because `git add .beads/issues.jsonl` fails in the parent repo.
- **Running `bd` from inside the submodule fails** to find the DB because it expects a nested `.beads/` directory under the repo root.
- **Explicit `--db` override in submodule triggered a crash** (stack overflow), suggesting this mode is not supported.

## Conclusion
Submodule mode (with `.beads/` as a git submodule root and `bd` executed from the code repo) is **not currently feasible** for full `bd sync` workflows because commits cannot be created from the parent repo. The submodule repo itself cannot run `bd` without introducing a nested `.beads/` directory or upstream support for a relocated Beads root.

## Implications for Docs
- Treat submodule mode as **Target / Not Validated** (and currently blocked) until Beads supports:
  - running `bd` with a configurable Beads root, or
  - committing inside the submodule repo while still allowing code-repo invocation.
- Keep **sync-branch mode** as the primary recommended low-noise option.

## Open Questions
- Can Beads support a configurable “beads root” so repo root can be `.beads/` without nested `.beads` directories?
- Is there a supported workflow to run `bd` in a submodule while committing in the submodule repo?
- Is the `--db` crash reproducible in a clean env or specific to daemon auto-start?
