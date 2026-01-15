# Ralph Syncing Instructions - Summary

**Date:** 2026-01-14  
**Status:** ✅ Updated for sync branch mode

## What Changed

Ralph's instructions have been updated to reflect that **syncing is automatic** with our sync branch setup.

## Key Points for Ralph

### Automatic Syncing ✅

**Ralph does NOT need to manually sync:**
- Daemon auto-commits task changes to `beads-sync` branch
- Git hooks auto-sync on commit/push/pull
- Changes are automatically synced to remote

### Sync Branch Mode

**How it works:**
- Ralph's code commits → `main` (or feature branch)
- Beads task commits → `beads-sync` branch (automatic)
- No action needed from Ralph

### When Manual Sync Might Be Needed

**Rare cases:**
1. **End of session verification:**
   ```bash
   bd sync --status  # Check sync state (optional)
   ```

2. **If daemon not running:**
   ```bash
   bd sync  # Force immediate sync
   ```

3. **Troubleshooting:**
   ```bash
   bd sync  # Resolve sync divergence
   ```

## Updated Instructions

**In `.devagent/plugins/ralph/AGENTS.md`:**

1. **Core Rules:** Changed from "Use `bd sync` at end of session" to "Syncing is automatic"
2. **Quick Reference:** `bd sync` marked as "usually automatic"
3. **New Section:** "Syncing (Automatic)" explains sync branch mode and when manual sync might be needed

## Ralph's Workflow (Unchanged)

Ralph's workflow remains the same:
1. Read task context
2. Implement
3. Verify
4. Commit code (to `main`/feature branch)
5. Update task status (auto-committed to `beads-sync`)

**No manual `bd sync` needed** - everything is automatic!

## Benefits

✅ **Simpler for Ralph:** No need to remember to sync
✅ **More reliable:** Automatic sync prevents missed syncs
✅ **Clean separation:** Code commits vs Beads commits
✅ **Protected branches:** Works with branch protection rules

## Verification

Ralph can verify sync state if needed:
```bash
# Check sync status (optional, for verification)
bd sync --status
```

But this is **not required** - syncing happens automatically.
