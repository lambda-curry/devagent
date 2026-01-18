# Ralph plugin

Ralph is a DevAgent plugin that runs autonomous execution loops and **mutates Beads issues** as it works (status updates, comments, etc.).

## Beads pre-commit flush race (important)

Beads runs a daemon that periodically flushes/export changes from the Beads DB to `.beads/issues.jsonl`. We observed a race where:

- Ralph (or you) updates issues in the DB
- the daemon export lags
- `git commit` happens before the export
- the commit includes a **stale** `.beads/issues.jsonl`

### Recommended mitigation

Force a **blocking** flush right before the commit runs:

```bash
bd sync --flush-only
```

`--flush-only` is preferred over a full `bd sync` to avoid pull/push/network behavior and reduce flakiness.

### Where to apply the fix

Git hooks under `.git/hooks/` are **local-only** (not committed). Apply this on **each machine** that does commits:

- Edit `.git/hooks/pre-commit`
- If it delegates to Beads via `exec bd hooks run pre-commit "$@"`, insert:

```bash
bd sync --flush-only || exit $?
```

immediately before that `exec`, keeping the existing “bd not found → exit 0” behavior.

### Validation

1. Make a Beads change (e.g. `bd update <id> ...`).
2. Immediately run `git commit ...`.
3. Confirm `.beads/issues.jsonl` includes the change (no missing updates due to export lag).

