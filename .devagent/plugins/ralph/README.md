# Ralph (DevAgent Plugin)

Ralph is a DevAgent plugin for **autonomous plan execution** backed by **Beads (`bd`)** issue tracking.

## Quick start

- **Setup workspace + branches**: run the `setup-ralph-loop` workflow in this repo's standard way.
- **Run the loop**: use the `start-ralph-execution` workflow.

See `AGENTS.md` in this folder for execution rules and validation gates.

## Beads + git commits: ensure JSONL is flushed before committing

Ralph (and agents) often mutate Beads issues in the SQLite DB. Beads then exports those changes to `.beads/issues.jsonl` on a debounce window (daemon) or via hooks.

### Problem: commits can race the daemon auto-flush

Beads runs a daemon that periodically flushes/export changes from the Beads DB to `.beads/issues.jsonl`. If you run agents/commands that update Beads issues and then immediately run `git commit`, the daemon may not have finished exporting DB → JSONL yet. Your commit can land while `.beads/issues.jsonl` is still stale.

### Recommended mitigation

Force a **blocking** flush right before the commit runs:

```bash
bd sync --flush-only
```

This **blocks** until the export is complete, avoiding the "in-memory changes not yet exported" window. `--flush-only` is preferred over a full `bd sync` to avoid pull/push/network behavior and reduce flakiness.

### Where to apply the fix

Git hooks under `.git/hooks/` are **local-only** (not committed). Apply this on **each machine** that does commits:

- Edit `.git/hooks/pre-commit`
- If it delegates to Beads via `exec bd hooks run pre-commit "$@"`, insert:

```bash
bd sync --flush-only || exit $?
```

immediately before that `exec`, keeping the existing "bd not found → exit 0" behavior.

### Validation

1. Make a Beads change (e.g. `bd update <id> ...`).
2. Immediately run `git commit ...`.
3. Confirm `.beads/issues.jsonl` includes the change (no missing updates due to export lag).

### If `.beads/issues.jsonl` still changes after commit (diagnostic)

Use this checklist to identify what is still mutating Beads state after a commit.

1. **Verify hooks are actually running**
   - Confirm your commit flow runs git hooks (some GUI/IDE commit flows skip them).
   - Avoid `git commit --no-verify` for Beads-managed repos.
2. **Confirm `bd sync --flush-only` is executed**
   - Check `.git/hooks/pre-commit` for the `bd sync --flush-only` line.
   - Run `bd sync --flush-only` manually and confirm exit code 0.
3. **Check for post-commit Beads mutations**
   - If `.beads/issues.jsonl` changes after commit, something wrote to the DB **after** the flush.
   - Common sources: a running Ralph loop, a background tool calling `bd update`, or a delayed Beads daemon flush.
4. **Distinguish expected vs unexpected changes**
   - **Expected:** You intentionally updated Beads after the commit (status/comments/labels).
   - **Unexpected:** No Beads commands were run post-commit, but JSONL still changed.
5. **Capture a minimal repro**
   - Note the exact commit command, timestamp, and whether hooks ran.
   - Run `bd sync --flush-only` again and compare diffs to see if new changes are still queued.
