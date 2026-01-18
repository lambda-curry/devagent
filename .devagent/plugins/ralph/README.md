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

