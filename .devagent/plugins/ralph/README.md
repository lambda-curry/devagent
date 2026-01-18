# Ralph (DevAgent Plugin)

Ralph is a DevAgent plugin for **autonomous plan execution** backed by **Beads (`bd`)** issue tracking.

## Quick start

- **Setup workspace + branches**: run the `setup-ralph-loop` workflow in this repo’s standard way.
- **Run the loop**: use the `start-ralph-execution` workflow.

See `AGENTS.md` in this folder for execution rules and validation gates.

## Beads + git commits: ensure JSONL is flushed before committing

Ralph (and agents) often mutate Beads issues in the SQLite DB. Beads then exports those changes to `.beads/issues.jsonl` on a debounce window (daemon) or via hooks.

### Problem: commits can race the daemon auto-flush

If you:
- run agents/commands that update Beads issues, then
- immediately run `git commit`,

the daemon may not have finished exporting DB → JSONL yet. Your commit can land while `.beads/issues.jsonl` is still stale.

### Recommended fix: flush-only in pre-commit

Before committing code changes, force Beads to flush pending DB changes to JSONL:

```bash
bd sync --flush-only
```

- This **blocks** until the export is complete, avoiding the “in-memory changes not yet exported” window.
- Prefer **flush-only** over full `bd sync` in a hook, because full sync may pull/push and make commits slower/flaky.

### Team enforcement

Git hooks in `.git/hooks/` are **not versioned**. If you want this behavior for everyone, adopt a versioned hooks directory (e.g. `.githooks/`) and point `core.hooksPath` at it during setup, or rely on Beads’ own hook installer (`bd hooks install`) and ensure it flushes immediately before commits.

