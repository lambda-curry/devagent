**Date:** 2026-01-11  
**Based On:** ralph-2026-01-10-AF44 session findings (Reportory PR #270)  
**Branch:** copilot/add-plan-to-beads-converter

## Overview

This change set keeps the same PR #270 intent (reduce Ralph execution failures), but simplifies earlier overcomplex solutions:

- Prefer **skills + existing project tooling** (typecheck/lint/tests) over bespoke bash utilities.
- Keep Beads compatibility front-and-center (notably `acceptance_criteria` must be a string).

## Improvements Implemented

### 1. ✅ Plan-to-Beads Conversion (Schema Compatibility)

**Problem:** Beads expects `acceptance_criteria` as a **string** (PR #270’s exact failure mode).

**Solution:**
- Keep conversion as part of the plan parsing process (generate markdown-string acceptance criteria during AI conversion).
- Make the runtime robust: `ralph.sh` now tolerates either a string or an array when reading `acceptance_criteria`.

**Files:**
- ✅ `.devagent/plugins/ralph/skills/plan-to-beads-conversion/SKILL.md`
- ✅ `.devagent/plugins/ralph/tools/ralph.sh`

### 2. ✅ Project Structure Discovery (Context Awareness)

**Problem:** Tests were being placed in the wrong package/location (e.g. missing vitest deps).

**Solution:**
- Replace script-heavy discovery with fast heuristics (workspace detection + quick test-file search + package.json inspection).

**Files:**
- ✅ `.devagent/plugins/ralph/skills/project-discovery/SKILL.md`
- ✅ `.devagent/plugins/ralph/workflows/execute-autonomous.md`

### 3. ✅ Reference Validation (Code Integrity)

**Problem:** Moves/renames can silently break imports/exports.

**Solution:**
- Use `git grep` for quick stale-reference checks.
- Use `npm run typecheck` as the primary integrity gate for missing modules.

**Files:**
- ✅ `.devagent/plugins/ralph/skills/reference-validation/SKILL.md`
- ✅ `.devagent/plugins/ralph/workflows/execute-autonomous.md`

### 4. ✅ Baseline Validation (Pre-Flight Quality Gates)

**Problem:** Pre-existing failures got conflated with Ralph-caused failures.

**Solution:**
- Keep Step 0 baseline checks in the workflow.

**Files:**
- ✅ `.devagent/plugins/ralph/workflows/execute-autonomous.md`

### 5. ✅ MCP Setup Guidance (Browser Testing)

**Problem:** MCP configuration differs by tool/version and can be brittle to automate.

**Solution:**
- Keep MCP setup as documented/manual guidance (e.g. `.cursor/mcp-config.json`, project-level `opencode.json` if supported).

**Files:**
- ✅ `.devagent/plugins/ralph/README.md`

## Notes

- Removed earlier utility scripts and the MCP auto-configuration skill in favor of simpler, lower-maintenance guidance.
- `bash -n` passes for `.devagent/plugins/ralph/tools/ralph.sh` after cleanup.
