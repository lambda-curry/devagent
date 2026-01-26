# Orchestrator Prototype

This directory contains a prototype implementation for testing the orchestrator end-to-end flow.

## Structure

- `plan/objective-plan.md` - Test objective plan with Epic A and Epic B (input for setup workflows)
- `run/objective-loop.json` - Loop config used to sync Beads tasks
- `epic-a/` - Workspace for Epic A (created during execution)
- `epic-b/` - Workspace for Epic B (created during execution)
- `config.json` - Orchestrator configuration (created during execution)

## Test Flow

1. **Setup Objective**: Create hub branch `feature/orchestrator-prototype-hub`
2. **Sync Loop Config**: Sync objective-loop.json to Beads tasks
3. **Kickoff Epic A**: Create branch, trigger Epic A execution
4. **Suspend**: Wait for Epic A completion signal
5. **Resume**: Detect Epic A completion (review-needed label)
6. **Review Epic A**: Verify Epic A completion
7. **Merge Epic A**: Merge Epic A branch to hub
8. **Kickoff Epic B**: Create branch, trigger Epic B execution
9. **Suspend**: Wait for Epic B completion signal
10. **Resume**: Detect Epic B completion
11. **Review Epic B**: Verify Epic B completion
12. **Merge Epic B**: Merge Epic B branch to hub
13. **Teardown**: Finalize objective

## Running the Prototype

The orchestrator workflow should be executed manually following the steps in `.devagent/plugins/ralph/workflows/orchestrator-loop.md`.

## Notes

- This is a minimal prototype for testing the orchestrator system
- Epic A and Epic B are simple test epics that create files
- The prototype demonstrates suspend/resume, merging, and sequential execution
