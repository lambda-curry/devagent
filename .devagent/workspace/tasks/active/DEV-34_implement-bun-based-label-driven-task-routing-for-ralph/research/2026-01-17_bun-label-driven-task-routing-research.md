# Research Packet — Bun-based Label-Driven Task Routing for Ralph

- Mode: Task
- Requested By: Jake Ruesink
- Last Updated: 2026-01-17
- Related Plan: (To be created)
- Storage Path: `.devagent/workspace/tasks/active/DEV-34_implement-bun-based-label-driven-task-routing-for-ralph/research/2026-01-17_bun-label-driven-task-routing-research.md`
- Stakeholders: Jake Ruesink (Developer)

## Request Overview

Replace current ad-hoc shell orchestration in the Ralph loop with a Bun-based, label-driven task router that assigns work to specialized agents. The system should use Beads labels to route tasks to appropriate agent profiles, which declare which labels they consume, model tier (cheap vs expensive), allowed actions, and output expectations. Bun scripts should watch the task queue, match labels to agent profiles, execute agent runs, and persist outputs back onto tasks.

**Key Clarification from Linear:** Beads acts as the router (no separate router agent needed). Agents update task statuses, and QA agents can leave comments and put tasks back to "to do" for another agent to pick up. A project management agent task could periodically review progress.

## Context Snapshot

- **Current State:** Ralph uses a bash script (`ralph.sh`) that:
  - Polls Beads for ready tasks (`bd ready --json`)
  - Filters by Epic ID
  - Invokes a single AI tool with task context
  - Updates task status in Beads
  - Runs quality gates
  - Loops until max iterations or no ready tasks

- **Target State:** Bun-based system that:
  - Watches Beads task queue for ready tasks with specific labels
  - Matches tasks to agent profiles based on label composition
  - Executes specialized agents (architecture, implementation, QA, review) based on labels
  - Supports multiple agents working on different aspects of the same task
  - Allows agents to comment and reference other tasks for cross-task communication

- **Task Reference:** Linear DEV-34

## Research Questions

| ID | Question | Status | Notes |
| --- | --- | --- | --- |
| RQ1 | How should Bun scripts watch/monitor the Beads task queue for ready tasks? | Answered | Use polling with `bd ready --json` or Beads daemon events |
| RQ2 | What is the optimal agent profile structure (labels consumed, model tier, actions, outputs)? | Answered | JSON-based profile config with label matching rules |
| RQ3 | How should label matching work (exclusive vs composable)? | Answered | Support composable labels with priority/weighting |
| RQ4 | How should multiple agents handle the same task (ownership vs shared)? | Answered | Shared ownership with status-based coordination |
| RQ5 | What Bun patterns support long-running task watchers and agent execution? | Answered | `fs.watch` for file monitoring, `Bun.spawn` for agent processes, Workers for isolation |
| RQ6 | How should agents persist outputs (comments, references, status) back to tasks? | Answered | Use Beads CLI commands (`bd comment`, `bd update`, `bd dep`) |

## Key Findings

1. **Bun File Watching:** Bun supports `fs.watch` (Node.js compatible) for monitoring file system changes, but Beads uses SQLite database, so polling `bd ready --json` is more appropriate than file watching. Bun's `Bun.spawn` is ideal for executing agent processes.

2. **Label System:** Beads labels are composable (tasks can have multiple labels), support AND/OR filtering (`--label` for AND, `--label-any` for OR), and can be used for routing. Labels follow patterns like `backend`, `frontend`, `needs-review`, `qa`, `architecture`.

3. **Agent Profile Architecture:** Profiles should be JSON configs declaring:
   - `labels`: Array of labels this agent consumes (supports AND/OR matching)
   - `model_tier`: `cheap` | `expensive` (determines which AI model to use)
   - `allowed_actions`: Array of actions (e.g., `implement`, `review`, `test`, `design`)
   - `output_expectations`: What the agent should produce (comments, status updates, references)

4. **Task Ownership:** Based on Linear comment, tasks should use status-based coordination rather than exclusive ownership. Agents update status (`in_progress`, `open`, `blocked`, `closed`), and multiple agents can work on different aspects (e.g., architecture agent comments, implementation agent implements, QA agent tests).

5. **Bun Script Patterns:** Use `Bun.spawn` for executing agent processes, support streaming output, and use Workers for isolated agent execution if needed. Long-running watchers can use `setInterval` for polling or `fs.watch` if monitoring Beads database file directly.

6. **No Router Agent Needed:** Beads itself acts as the router. Agents update statuses, and `bd ready` naturally surfaces the next available work. QA agents can leave failure comments and reset status to `open` for retry.

## Detailed Findings

### RQ1: Task Queue Monitoring Strategy

**Answer:** Use polling with `bd ready --json` rather than file watching, as Beads uses SQLite database.

**Supporting Evidence:**
- Current `ralph.sh` already uses `bd ready --json` successfully (line 172)
- Beads daemon handles database synchronization, so polling is reliable
- Bun's `fs.watch` could monitor `.beads/beads.db` file changes, but SQLite file watching is less reliable than polling
- Polling interval can be configurable (e.g., every 5-10 seconds)

**Freshness:** 2026-01-17

**Alternative Consideration:** If Beads daemon exposes events (check `.beads/docs/DAEMON.md`), event-driven approach could be more efficient, but polling is simpler and proven.

### RQ2: Agent Profile Structure

**Answer:** JSON-based configuration files defining label matching, model tier, actions, and output expectations.

**Proposed Structure:**
```json
{
  "name": "implementation-agent",
  "labels": {
    "required": ["implementation"],
    "optional": ["backend", "frontend"],
    "excluded": ["blocked", "needs-review"]
  },
  "model_tier": "cheap",
  "allowed_actions": ["implement", "test", "commit"],
  "output_expectations": {
    "comments": true,
    "status_updates": true,
    "references": true
  },
  "ai_tool": {
    "name": "cursor",
    "command": "agent"
  }
}
```

**Supporting Evidence:**
- Current `ralph.sh` uses `config.json` for AI tool configuration (lines 100-104)
- Beads labels support AND/OR filtering (`.beads/docs/LABELS.md`)
- Model tier separation allows cost optimization (cheap models for simple tasks, expensive for complex)

**Freshness:** 2026-01-17

### RQ3: Label Matching (Exclusive vs Composable)

**Answer:** Support composable labels with priority/weighting. Multiple agents can match the same task, but execution order is determined by label priority or agent priority.

**Supporting Evidence:**
- Beads labels are inherently composable (tasks can have multiple labels)
- Linear comment clarifies: "architecture + review on the same task" suggests composability
- Current system processes one task at a time, but new system should support parallel agent execution on different task aspects

**Matching Algorithm:**
1. Query `bd ready --json` for ready tasks
2. For each task, check labels against agent profiles
3. If multiple agents match, use priority/weighting to determine execution order
4. Support sequential execution (agent A completes, then agent B) or parallel (if task aspects are independent)

**Freshness:** 2026-01-17

### RQ4: Task Ownership Model

**Answer:** Shared ownership with status-based coordination. No exclusive ownership—agents update status to coordinate.

**Supporting Evidence:**
- Linear comment: "agents are updating the statuses of their task that they're working on then beads helps keep track of what's ready"
- QA agents can "leave a comment of why a task failed and put it back to to do so that another agent can pick it up"
- Current `ralph.sh` uses status workflow: `open` → `in_progress` → `closed` (or `blocked`)

**Coordination Pattern:**
- Agent claims task: `bd update <id> --status in_progress`
- Agent completes: `bd update <id> --status closed` (or `open` if needs more work)
- Agent blocks: `bd update <id> --status blocked` with comment
- Multiple agents can work sequentially: Architecture agent comments → Implementation agent implements → QA agent tests

**Freshness:** 2026-01-17

### RQ5: Bun Patterns for Long-Running Watchers

**Answer:** Use `setInterval` for polling `bd ready`, `Bun.spawn` for agent execution, and `fs.watch` optionally for database file monitoring.

**Supporting Evidence from Bun Docs:**
- `Bun.spawn` supports streaming I/O and process management (Context7 query results)
- `fs.watch` from `node:fs/promises` supports async iteration with `for await...of` (Context7 query results)
- Workers can be used for isolated agent execution if needed

**Implementation Pattern:**
```typescript
// Polling-based watcher
const watcher = setInterval(async () => {
  const readyTasks = await getReadyTasks(); // bd ready --json
  for (const task of readyTasks) {
    const matchingAgents = findMatchingAgents(task);
    for (const agent of matchingAgents) {
      await executeAgent(agent, task);
    }
  }
}, POLL_INTERVAL);

// Agent execution
const proc = Bun.spawn({
  cmd: [agent.config.ai_tool.command, ...args],
  stdout: "pipe",
  stderr: "pipe",
  env: { ...process.env, BEADS_DB: beadsDbPath }
});
```

**Freshness:** 2026-01-17

### RQ6: Agent Output Persistence

**Answer:** Use Beads CLI commands (`bd comment`, `bd update`, `bd dep`) to persist outputs back to tasks.

**Supporting Evidence:**
- Current `ralph.sh` uses `bd update` and `bd comment` (lines 206, 277, 362)
- Beads integration skill (`.devagent/plugins/ralph/skills/beads-integration/SKILL.md`) documents these commands
- Agents can create cross-task references using `bd dep add` for discovered dependencies

**Output Patterns:**
- **Comments:** `bd comment <id> --body "..."` for progress, learnings, screenshots
- **Status Updates:** `bd update <id> --status <status>` for coordination
- **References:** `bd dep add <id> <depends-on>` for cross-task dependencies
- **Labels:** `bd label add <id> <label>` for metadata (e.g., `ai-generated`, `needs-review`)

**Freshness:** 2026-01-17

## Comparative / Alternatives Analysis

### Alternative 1: Keep Bash Script, Add Label Filtering
**Pros:** Minimal changes, proven approach
**Cons:** Doesn't address agent specialization, still single-agent-per-task model

### Alternative 2: Full Router Agent (Rejected)
**Pros:** Could auto-label and triage tasks
**Cons:** Linear comment explicitly states "We don't need a router agent, beads acts as the router"

### Alternative 3: Bun-Based Label Router (Selected)
**Pros:** 
- Enables agent specialization (architecture, implementation, QA, review)
- Supports composable labels and multiple agents per task
- Better process management with `Bun.spawn`
- TypeScript/JavaScript ecosystem for complex logic
**Cons:** 
- Requires migration from bash to Bun
- More complex than current system

## Implications for Implementation

### Scope Adjustments
1. **No Router Agent:** Remove any router agent design from scope. Beads is the router.
2. **Status-Based Coordination:** Focus on status updates (`open`, `in_progress`, `closed`, `blocked`) rather than ownership locks.
3. **Agent Profiles:** Create JSON config system for agent profiles with label matching rules.
4. **Bun Script Architecture:** Replace `ralph.sh` with Bun TypeScript script that:
   - Polls `bd ready --json` for ready tasks
   - Matches tasks to agent profiles based on labels
   - Executes matching agents using `Bun.spawn`
   - Handles agent output and status updates

### Acceptance Criteria Impacts
- System must support multiple agents working on the same task (different aspects)
- System must use Beads labels for routing (not a separate router)
- System must allow agents to comment, update status, and create references
- System must support agent profiles with label matching, model tier, and action constraints

### Validation Needs
- Test label matching algorithm with various label combinations
- Test multiple agents processing the same task sequentially
- Test agent output persistence (comments, status, references)
- Test polling performance and agent execution isolation

## Risks & Open Questions

| Item | Type | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Label matching conflicts when multiple agents match | Risk | Dev | Implement priority/weighting system | Planning |
| Agent execution order for same task | Question | Dev | Define sequential vs parallel execution rules | Planning |
| Model tier selection logic | Question | Dev | Determine when to use cheap vs expensive models | Planning |
| Agent profile configuration location | Question | Dev | Decide: `.devagent/plugins/ralph/agents/` or `config.json` | Planning |
| Beads daemon event integration | Question | Dev | Research if daemon exposes events for event-driven approach | Research |
| Migration path from bash to Bun | Risk | Dev | Create migration plan preserving existing functionality | Planning |

## Recommended Follow-ups

1. **Clarify Task Execution Model:** Determine if multiple agents can work on the same task simultaneously (parallel) or must work sequentially. This affects the polling and execution architecture.

2. **Design Agent Profile Schema:** Create detailed JSON schema for agent profiles including label matching rules, priority, and execution constraints.

3. **Prototype Label Matching:** Build a small prototype to test label matching algorithm with various label combinations and agent profiles.

4. **Research Beads Daemon Events:** Check if Beads daemon exposes events that could enable event-driven task processing instead of polling.

5. **Create Implementation Plan:** Use `devagent create-plan` to break down implementation into tasks after this research is reviewed.

## Sources

| Reference | Type | Freshness | Access Notes |
| --- | --- | --- | --- |
| Linear Issue DEV-34 | Issue | 2026-01-17 | https://linear.app/lambdacurry/issue/DEV-34 |
| Ralph Script (`ralph.sh`) | Code | 2026-01-17 | `.devagent/plugins/ralph/tools/ralph.sh` |
| Beads Labels Documentation | Documentation | 2026-01-17 | `.beads/docs/LABELS.md` |
| Beads Integration Skill | Documentation | 2026-01-17 | `.devagent/plugins/ralph/skills/beads-integration/SKILL.md` |
| Bun File Watching Guide | External Docs | 2026-01-17 | Context7: `/oven-sh/bun` - `fs.watch` patterns |
| Bun Process Management | External Docs | 2026-01-17 | Context7: `/oven-sh/bun` - `Bun.spawn` and Workers |
| Ralph Plugin Instructions | Documentation | 2026-01-17 | `.devagent/plugins/ralph/AGENTS.md` |
| Ralph Autonomous Execution Flow | Documentation | 2026-01-17 | `.devagent/plugins/ralph/autonomous-execution-flow.md` |
