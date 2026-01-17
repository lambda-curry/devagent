# Epic Revise Report - Implement Bun-based label-driven task routing for Ralph Plan

**Date:** 2026-01-17
**Epic ID:** devagent-a8fa
**Status:** open

## Executive Summary

This epic successfully implemented a Bun-based label-driven task routing system for Ralph, replacing the shell-based loop with a more flexible agent profile system. All four tasks completed successfully with 100% completion rate. Key achievements include agent profile schema definition, Bun router foundation, sequential execution with error handling, and workflow documentation updates. The implementation revealed several architectural considerations around path resolution, CLI output parsing, and failure tracking that should inform future improvements.

## Traceability Matrix

| Task ID | Title | Status | Commit |
| :--- | :--- | :--- | :--- |
| devagent-a8fa.1 | Define agent profile schema and config mapping | closed | `5f8d9f49` - feat(ralph): add agent profile schema and config mapping [skip ci] |
| devagent-a8fa.2 | Build Bun router foundation for label matching | closed | `90d80439` - feat(ralph): add Bun router foundation for label-driven task routing [skip ci] |
| devagent-a8fa.3 | Implement sequential execution loop with error handling | closed | `b9e09548` - feat(ralph): implement sequential execution loop with error handling [skip ci]<br>`2fbbb5bc` - fix(ralph): update Beads comment command to use 'comments add' [skip ci] |
| devagent-a8fa.4 | Update execute-autonomous workflow to assign agent labels | closed | `f3fb3012` - docs(ralph): add agent label assignment to execute-autonomous workflow [skip ci] |

## Evidence & Screenshots

- **Screenshot Directory**: No screenshots captured for this epic
- **Screenshots Captured**: 0 screenshots
- **Key Screenshots**: N/A

## Improvement Recommendations

### Documentation

- [ ] **[Medium] Gap**: Workflow documentation needed explicit instructions for agent label assignment to enable label-driven routing. Without clear guidance, tasks might be created without labels, breaking the routing system. - Workflow instructions should always reference configuration files (like config.json) when documenting feature usage. Include fallback rules explicitly to prevent ambiguity. - `.devagent/plugins/ralph/workflows/execute-autonomous.md` (Source: devagent-a8fa.4)

### Process

*No process-related improvements identified in this epic.*

### Rules & Standards

*No rules & standards improvements identified in this epic.*

### Tech Architecture

- [ ] **[Low] Structure**: Agent profile structure uses relative paths for instructions_path which may need resolution logic in the router implementation. - Consider documenting path resolution strategy (relative to config.json location vs absolute paths) in the router implementation task. - `.devagent/plugins/ralph/agents/*.json` (instructions_path field) (Source: devagent-a8fa.1)

- [ ] **[Low] Pattern**: Initial implementation used simple line splitting for label parsing, which failed to handle Beads CLI's formatted output with emoji header and dash-prefixed labels. - When parsing CLI output, always account for formatted output (headers, prefixes, whitespace). Use regex matching for structured parsing rather than naive line splitting. - `.devagent/plugins/ralph/tools/ralph.ts` (getTaskLabels function) (Source: devagent-a8fa.2)

- [ ] **[Medium] Structure**: The Bun router execution loop needed to handle failure tracking by parsing task comments, which requires fetching comments for each task. This adds overhead but is necessary since Beads doesn't have a built-in failure counter field. - Consider adding a failure_count field to Beads task schema or storing failure count in task notes/design field as JSON for more efficient tracking. Alternatively, use a local state file to track failures across runs. - `.devagent/plugins/ralph/tools/ralph.ts` (getTaskFailureCount, getTaskComments functions) (Source: devagent-a8fa.3)

## Action Items

1. [ ] **[Medium]** Update workflow documentation to explicitly reference config.json when documenting agent label assignment, including fallback rules - Documentation (Source: devagent-a8fa.4)
2. [ ] **[Medium]** Investigate adding failure_count field to Beads task schema or alternative failure tracking mechanism to reduce overhead from comment parsing - Tech Architecture (Source: devagent-a8fa.3)
3. [ ] **[Low]** Document path resolution strategy for agent profile instructions_path (relative vs absolute) - Tech Architecture (Source: devagent-a8fa.1)
4. [ ] **[Low]** Review CLI output parsing patterns across codebase to ensure consistent handling of formatted output - Tech Architecture (Source: devagent-a8fa.2)
