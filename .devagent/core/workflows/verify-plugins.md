# Verify Plugins

## Mission
- Primary goal: Verify that all configured plugins are properly installed and wired into the environment.
- Boundaries / non-goals: Does not automatically fix issues (unless trivial); primarily a diagnostic tool.
- Success signals: Script runs and reports status of all plugins.

## Standard Instructions Reference
Before executing this workflow, review standard instructions in `.devagent/core/AGENTS.md` → Standard Workflow Instructions for:
- Date handling
- Metadata retrieval
- Context gathering order
- Standard guardrails
- Storage patterns

## Execution Directive
Follow standard execution directive in `.devagent/core/AGENTS.md` → Standard Workflow Instructions.

## Inputs
- Required: None.
- Optional: Specific plugin name to verify (if supported by script, currently checks all).

## Resource Strategy
- Script: `.devagent/core/scripts/verify-plugins.sh`

## Workflow
1. **Kickoff**:
   - Confirm script exists.

2. **Execute**:
   - Run `.devagent/core/scripts/verify-plugins.sh`.

3. **Report**:
   - Output the script results.
   - If failures occur, suggest `devagent update-devagent` or manual `setup.sh` execution.

## Expected Output
- Text report of plugin status.
