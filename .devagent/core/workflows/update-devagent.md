# Update DevAgent

## Mission
- Primary goal: Update DevAgent core files, commands, and skills by running the core update script and summarizing the changes.
- Boundaries / non-goals: Do not commit changes, do not alter script behavior, and do not edit workflow content beyond the update outputs.
- Success signals: Update script completes successfully, changes are summarized with affected directories and files, and the working tree remains uncommitted for review.

## Standard Instructions Reference
Before executing this workflow, review standard instructions in `.devagent/core/AGENTS.md` → Standard Workflow Instructions for:
- Date handling
- Metadata retrieval
- Context gathering order
- Standard guardrails
- Storage patterns

## Execution Directive
Follow standard execution directive in `.devagent/core/AGENTS.md` → Standard Workflow Instructions, with the following workflow-specific customization:
- Provide the update summary directly in your response. Do not create summary files.

## Inputs
- Required:
  - Confirmation to run `.devagent/core/scripts/update-core.sh`
- Optional:
  - Preferred summary depth (brief vs detailed)
  - Any directories or skills to highlight in the summary
  - Notes on whether backups should be retained or cleaned up
- Request missing info by: Ask for explicit confirmation to run the update script if not provided.

## Resource Strategy
- Update scripts: 
  - `.devagent/core/scripts/update-core.sh`
  - `.devagent/core/scripts/update-plugins.sh`
- Repo state: `git status -sb`, `git diff --stat` for summarizing changes
- Escalation: If the script fails, dependencies are missing, or the repo has merge conflicts, pause and request guidance

## Workflow
1. **Kickoff / readiness checks**:
   - Confirm the repository root and script paths
   - Confirm explicit approval to run the update scripts
   - Check git status to note existing local changes

2. **Execute update**:
   - Run `.devagent/core/scripts/update-core.sh`
   - Run `.devagent/core/scripts/update-plugins.sh`
   - Capture any output or errors

3. **Summarize changes**:
   - Review `git status -sb` and `git diff --stat`
   - Note which directories changed (`.devagent/core/`, `.agents/commands/`, `.codex/skills/`)
   - Call out any added/removed command or workflow files
   - Record any backups created by the script (if present)

4. **Report results**:
   - Provide a concise update summary directly in your response (do not create summary files)
   - Confirm no commits were made
   - List follow-up actions if manual review is recommended

## Failure & Escalation
- Script missing or not executable: Report blocker and request guidance
- Script failure: Capture error output and stop
- Dirty working tree: Proceed only with confirmation; otherwise pause

## Expected Output
- A summary of updated directories and key files (provided in the response, not as a file)
- Confirmation that changes are left uncommitted
- Any blockers or follow-up actions

## Follow-up Hooks
- `devagent review-progress` if the update is part of a broader maintenance task
- `devagent update-constitution` if core governance files changed

---

**Agent Version**: 1.0  
**Created**: 2026-01-02  
**Template Source**: `.devagent/core/templates/agent-brief-template.md`
