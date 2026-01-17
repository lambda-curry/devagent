# Clarified Requirement Packet — Implement Bun-based label-driven task routing for Ralph

- Requestor: Jake Ruesink (Developer)
- Decision Maker: Jake Ruesink (Developer)
- Date: 2026-01-17
- Mode: Task Clarification
- Status: Complete
- Related Task Hub: `.devagent/workspace/tasks/active/DEV-34_implement-bun-based-label-driven-task-routing-for-ralph/`
- Notes: Clarification session complete. All critical requirements clarified.

## Task Overview

### Context
- **Task name/slug:** DEV-34_implement-bun-based-label-driven-task-routing-for-ralph
- **Business context:** Replace current ad-hoc shell orchestration in the Ralph loop with a Bun-based, label-driven task router that assigns work to specialized agents. This enables agent specialization (architecture, implementation, QA, review) and supports multiple agents working on different aspects of the same task.
- **Stakeholders:** Jake Ruesink (Developer, Decision Maker)
- **Prior work:** 
  - Research packet: `.devagent/workspace/tasks/active/DEV-34_implement-bun-based-label-driven-task-routing-for-ralph/research/2026-01-17_bun-label-driven-task-routing-research.md`
  - Linear Issue: [DEV-34](https://linear.app/lambdacurry/issue/DEV-34/implement-bun-based-label-driven-task-routing-for-ralph)
  - Current Ralph implementation: `.devagent/plugins/ralph/tools/ralph.sh`

### Clarification Sessions
- Session 1: 2026-01-17 — Initial clarification (complete)

---

## Clarified Requirements

*Documentation approach: Fill in sections incrementally as clarification progresses.*

---

### Scope & End Goal

**What needs to be done?**
Replace the current bash-based `ralph.sh` script with a Bun-based label-driven task routing system that:
- Assigns tasks to specialized agents based on a single agent label per task
- Uses agent profiles stored as separate JSON files in `.devagent/plugins/ralph/agents/`
- Manages agent-to-label assignments via a parent config file
- Executes agents sequentially (no polling needed - loop restarts when agent finishes if tasks remain ready)
- Migrates incrementally, replacing parts of `ralph.sh` one at a time

**What's the end goal architecture or state?**
- Bun TypeScript script replaces `ralph.sh` bash script
- Agent profiles as JSON files in `.devagent/plugins/ralph/agents/` (e.g., `implementation-agent.json`, `qa-agent.json`)
- Parent config file manages which agents are assigned to which labels
- Tasks have a single agent label that determines which agent processes them
- Sequential agent execution: when an agent finishes, loop restarts if ready tasks remain
- Incremental migration preserves existing functionality while transitioning to new system

**In-scope (must-have):**
- Bun-based task routing script
- Agent profile system with JSON files per agent
- Parent config managing agent-to-label assignments
- Label-based task matching (one label per task)
- Sequential agent execution loop
- Incremental migration from bash to Bun

**Out-of-scope (won't-have):**
- Polling/monitoring system (not needed - sequential execution handles this)
- Multiple labels per task (simplified to single label)
- Parallel agent execution (sequential only)
- Router agent (Beads acts as router)

---

### Technical Constraints & Requirements

**Platform/technical constraints:**
- Runtime: Bun (replacing bash script)
- Integration: Beads CLI for task management (`bd ready --json`, `bd update`, `bd comment`)
- Configuration: Extend existing `config.json` at `.devagent/plugins/ralph/tools/config.json` with new `agents` section
- Agent profiles: JSON files in `.devagent/plugins/ralph/agents/` directory

**Architecture requirements:**
- Default/fallback agent: "general" agent handles tasks with no label or unmapped labels
- Label-to-agent mapping: Configured in parent `config.json` `agents` section
- Sequential execution: No polling - loop restarts when agent finishes if ready tasks remain

**Quality bars:**
- Error handling: On agent execution failure, reset task to `open` status with error comment and continue to next task
- Iteration tracking: Loop keeps track of iterations per task; after 5 failures, mark task as `blocked` to prevent infinite retry loops
- Backward compatibility: Incremental migration preserves existing functionality

---

### Dependencies & Blockers

**Technical dependencies:**
- Execute-autonomous workflow: Must be updated to assign agent labels to tasks when creating them
- Status: In Development (needs update as part of this work)
- Owner: Developer
- Risk: Low - workflow update is straightforward

**Cross-team/external dependencies:**
- None identified

**Blockers or risks:**
- Execute-autonomous workflow needs instruction on how label assignment works for agent routing
- No blockers - can proceed with implementation

---

### Implementation Approach

**Implementation strategy:**
- Incremental migration: Start with minimal Bun script that reads config and agent profiles, then gradually add functionality
- Agent profiles: Separate JSON files per agent in `.devagent/plugins/ralph/agents/` directory
- Parent config: Extend existing `config.json` at `.devagent/plugins/ralph/tools/config.json` with new `agents` section mapping labels to agent profile files
- Default agent: "general" agent handles tasks with no label or unmapped labels (some labels may mean something else, not agent routing)
- Sequential execution: Agents execute one at a time; loop restarts when agent finishes if ready tasks remain
- No polling: Simple sequential loop handles task processing without need for polling/monitoring

**Patterns:**
- Use Bun's `Bun.spawn` for executing agent processes
- Use Beads CLI (`bd ready --json`, `bd update`, `bd comment`) for task management
- Label-based matching: Each task has one agent label that determines which agent processes it
- Fallback logic: Tasks without labels or with unmapped labels route to default "general" agent
- Agent profile structure: Minimal fields - `name`, `label`, `ai_tool` (name and command), `model_tier` (cheap/expensive), plus mapping to agent instructions markdown file
- Config structure: Simple mapping in `config.json` `agents` section: `{ "agents": { "implementation": "implementation-agent.json", "qa": "qa-agent.json", "general": "general-agent.json" } }`
- Error handling: Track iterations per task; after 5 failures, mark as `blocked` to prevent infinite retry loops

---

### Acceptance Criteria & Verification

**How will we verify this works?**
- Manual testing: Try it and see if it works - no automated tests needed for this loop yet (out of scope)
- Verify correct agent assignment based on task labels
- Verify fallback to general agent for unmapped labels
- Verify iteration tracking and blocking after 5 failures
- Verify sequential execution loop restarts when agent finishes

**What does "done" look like?**
- [ ] Bun script reads config and agent profiles
- [ ] Label-based task matching works correctly
- [ ] Agents execute sequentially based on task labels
- [ ] Fallback to general agent for unmapped labels
- [ ] Error handling with iteration tracking (block after 5 failures)
- [ ] Manual verification shows system works as expected
- [ ] Execute-autonomous workflow updated to assign labels to tasks

**Testing approach:**
- Manual testing only (automated tests out of scope for this work)
- Test with real tasks and verify agent assignment
- Verify error handling and iteration tracking

---

## Assumptions Log

| Assumption | Owner | Validation Required | Validation Method | Due Date | Status |
| --- | --- | --- | --- | --- | --- |

---

## Gaps Requiring Research

*To be populated during clarification*

---

## Clarification Session Log

### Session 1: 2026-01-17
**Participants:** Jake Ruesink (Developer, Decision Maker)

**Questions Asked:**

1. **When multiple agents match the same task (e.g., a task has both `architecture` and `implementation` labels), how should they execute?**
   → Answer: Each task will only have ONE agent label assigned to it (simplest approach). This eliminates the need for multi-agent coordination on the same task. (Jake Ruesink)

2. **Where should agent profiles be stored and how should they be organized?**
   → Answer: Separate JSON files per agent in `.devagent/plugins/ralph/agents/` directory (e.g., `implementation-agent.json`, `qa-agent.json`), with a parent config that manages which agents are assigned to which labels along with other configuration. (Jake Ruesink)

3. **What's the migration strategy from the current `ralph.sh` bash script?**
   → Answer: Incremental migration - replace parts of `ralph.sh` one at a time. (Jake Ruesink)

**Additional Clarifications:**
- No polling needed: Agents execute sequentially, and when an agent finishes, the loop begins again if there are tasks still in the ready state. This is simpler than the polling approach suggested in research.

4. **What should the parent config structure look like, and where should it live?**
   → Answer: Extend existing `config.json` at `.devagent/plugins/ralph/tools/config.json` with a new `agents` section mapping labels to agent profile files. (Jake Ruesink)

5. **What should happen when a task has a label but no agent profile matches that label?**
   → Answer: Fall back to a default "general" agent. There might be other labels that mean something else (not agent routing), so no label or unmapped label routes to the general agent. (Jake Ruesink)

6. **For the incremental migration, what should be the first part of `ralph.sh` to replace?**
   → Answer: Start with a minimal Bun script that just reads config and agent profiles, then gradually add functionality. (Jake Ruesink)

7. **What fields should each agent profile JSON file contain?**
   → Answer: Minimal fields: `name`, `label` (the label this agent handles), `ai_tool` (name and command), `model_tier` (cheap/expensive), plus mapping to agent instructions markdown file. (Jake Ruesink)

8. **What should the `agents` section in `config.json` look like?**
   → Answer: Simple mapping: `{ "agents": { "implementation": "implementation-agent.json", "qa": "qa-agent.json", "general": "general-agent.json" } }` - keep it simple. (Jake Ruesink)

9. **What should happen when an agent execution fails?**
   → Answer: Reset task to `open` status with error comment, continue to next task. Loop should keep track of iterations per task; after 5 failures, mark task as `blocked` to prevent infinite retry loops. (Jake Ruesink)

10. **How should we verify the new Bun-based routing system works correctly?**
    → Answer: Manual testing - try it and see if it works. No need to automate any tests for this loop yet (out of scope). (Jake Ruesink)

11. **Are there any dependencies or blockers we should be aware of?**
    → Answer: Agents will get assigned their labels in the execute-autonomous workflow, so we'll need to instruct that workflow how it works. (Jake Ruesink)

**Ambiguities Surfaced:**
*(To be populated)*

**Conflicts Identified:**
*(To be populated)*

**Unresolved Items:**
*(To be populated)*

---

## Next Steps

### Spec Readiness Assessment
**Status:** ✅ Ready for Plan | ⬜ Research Needed | ⬜ More Clarification Needed

**Plan Readiness Assessment:**
- ✅ Critical gaps addressed: Scope, approach, constraints, and acceptance criteria are clear
- ✅ No blockers: Can proceed with implementation planning
- ✅ Enough information: All key technical decisions made (label matching, agent profiles, config structure, error handling, migration approach)

**Rationale:**
All critical technical dimensions have been clarified:
- **Scope & End Goal:** Clear - replace bash script with Bun-based label-driven routing
- **Technical Constraints:** Defined - Bun runtime, Beads CLI integration, config structure
- **Implementation Approach:** Specified - incremental migration starting with minimal script
- **Dependencies:** Identified - execute-autonomous workflow needs label assignment update
- **Acceptance Criteria:** Defined - manual testing approach, iteration tracking, error handling

The requirements are sufficient for creating an implementation plan. The execute-autonomous workflow dependency is straightforward and can be handled as part of the implementation work.

### Recommended Actions

**Ready for plan work:**
- [ ] Hand validated requirement packet to `devagent create-plan`
- [ ] Provide link to this clarification packet: `.devagent/workspace/tasks/active/DEV-34_implement-bun-based-label-driven-task-routing-for-ralph/clarification/2026-01-17_initial-clarification.md`
- [ ] Highlight key decisions:
  - Single label per task (simplifies matching)
  - Agent profiles as separate JSON files with markdown instructions mapping
  - Simple config mapping: `{ "agents": { "label": "profile-file.json" } }`
  - Fallback to general agent for unmapped labels
  - Sequential execution with iteration tracking (block after 5 failures)
  - Incremental migration starting with minimal Bun script
  - Execute-autonomous workflow needs label assignment update

---
