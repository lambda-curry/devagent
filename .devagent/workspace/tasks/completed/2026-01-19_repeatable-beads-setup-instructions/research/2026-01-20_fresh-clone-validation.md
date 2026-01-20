# Fresh-Clone Validation (Sync-Branch Default)

**Date:** 2026-01-20  
**Task Hub:** `.devagent/workspace/tasks/completed/2026-01-19_repeatable-beads-setup-instructions/`

## Goal
Validate the fresh-clone onboarding steps for sync-branch mode, ensuring the documented setup instructions work end-to-end.

## Environment
- Local clone from `/Users/jaruesink/projects/devagent`
- Fresh clone path: `/tmp/devagent-fresh-clone.JZkruJ`

## Steps + Results

### 1) Fresh clone
```bash
git clone /Users/jaruesink/projects/devagent /tmp/devagent-fresh-clone.JZkruJ
```
**Result:** Clone succeeded. `.beads/issues.jsonl` present, but no `.beads/beads.db` (expected, DB is gitignored).

### 2) Initial Beads check (expected failure)
```bash
bd where --json
bd sync --status
```
**Result:** Both commands report **"no beads database found"** and suggest `bd init --from-jsonl` or `bd --no-db`.

### 3) Initialize DB from JSONL
```bash
bd init --from-jsonl --skip-hooks --skip-merge-driver
```
**Result:** DB created at `.beads/beads.db` and issues imported successfully.

### 4) Sync-branch status
```bash
bd sync --status
```
**Result:** Failed with **"sync branch 'beads-sync' does not exist"** (local branch missing).

### 5) Create local sync branch and re-check
```bash
git branch beads-sync origin/beads-sync
bd sync --status
```
**Result:** `bd sync --status` succeeded and showed expected commit diffs between `beads-sync` and the current branch.

## Conclusion
Fresh-clone onboarding works when the user:
1) runs `bd init --from-jsonl` to create the DB, and
2) creates a local `beads-sync` branch tracking `origin/beads-sync`.

These steps should be explicitly documented in the setup guide.
