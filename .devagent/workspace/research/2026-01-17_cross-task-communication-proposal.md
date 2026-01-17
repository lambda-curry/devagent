# Cross-Task Communication Proposal

**Date:** 2026-01-17  
**Context:** Based on PR #48 (Bun-based label-driven task routing) and discussion about enabling agents to communicate across tasks  
**Status:** Proposal

## Problem Statement

Currently, agents working on tasks have limited visibility into:
- Other tasks in the same epic
- Related or dependent tasks
- The overall epic context and progress
- Opportunities for cross-task coordination

While agents can run `bd show <epic-id>` to view epic details, this requires:
1. Proactive discovery (agents may not think to check)
2. Manual CLI execution (not integrated into the prompt context)
3. No structured guidance on when/how to communicate with other tasks

## Current State

### What Agents Currently See

From `buildPrompt()` in `.devagent/plugins/ralph/tools/ralph.ts`:

```typescript
CONTEXT:
You are working on task ${task.id} which is part of Epic ${epicId || "null"}.
You can view the epic details and other tasks using: bd show ${epicId || task.id}
```

**Limitations:**
- Only mentions the epic ID, no task list
- No visibility into related tasks or dependencies
- No guidance on cross-task communication patterns
- Agents must manually discover related work

### What's Available But Not Used

The system already has infrastructure to:
- Fetch all tasks in an epic (`filterTasksByEpic`, `getTaskDetails`)
- Get task relationships (`parent_id`, hierarchical IDs like `epic.1.1`)
- Query task status and details via Beads CLI
- Add comments to tasks (`bd comments add`)

## Proposed Solutions

### Solution 1: Epic Task List Injection (Recommended)

**Approach:** Enhance `buildPrompt()` to fetch and inject a summary of all tasks in the epic.

**Implementation:**

1. **Add function to fetch epic tasks:**
```typescript
/**
 * Get all tasks in an epic (including subtasks)
 */
function getEpicTasks(epicId: string): Array<{
  id: string;
  title: string;
  status: string;
  priority: number;
  parent_id?: string;
}> {
  try {
    // Get all ready tasks
    const allTasks = getReadyTasks();
    
    // Also get tasks that might not be ready but are in the epic
    const result = Bun.spawnSync(["bd", "show", epicId, "--json"], {
      stdout: "pipe",
      stderr: "pipe",
    });
    
    if (result.exitCode !== 0) {
      console.warn(`Warning: Failed to get epic tasks for ${epicId}`);
      return [];
    }
    
    const output = result.stdout.toString().trim();
    const epicData = JSON.parse(output);
    const epic = Array.isArray(epicData) ? epicData[0] : epicData;
    
    // Collect tasks by hierarchical ID pattern (epic.1, epic.1.1, etc.)
    const epicTasks: Array<{ id: string; title: string; status: string; priority: number; parent_id?: string }> = [];
    
    // Get tasks that start with epic ID
    const hierarchicalTasks = allTasks.filter(t => t.id.startsWith(epicId + "."));
    
    // Get tasks with parent_id matching epic
    const childTasks = allTasks.filter(t => {
      try {
        const details = getTaskDetails(t.id);
        return details.parent_id === epicId;
      } catch {
        return false;
      }
    });
    
    // Combine and get full details
    const allEpicTasks = Array.from(
      new Map([...hierarchicalTasks, ...childTasks].map((t) => [t.id, t])).values()
    );
    
    for (const task of allEpicTasks) {
      try {
        const details = getTaskDetails(task.id);
        epicTasks.push({
          id: details.id,
          title: details.title || task.title,
          status: details.status,
          priority: details.priority,
          parent_id: details.parent_id,
        });
      } catch {
        // Fallback to basic task info
        epicTasks.push({
          id: task.id,
          title: task.title,
          status: task.status,
          priority: task.priority,
        });
      }
    }
    
    return epicTasks;
  } catch (error) {
    console.warn(`Warning: Error fetching epic tasks: ${error}`);
    return [];
  }
}
```

2. **Enhance buildPrompt() to include task list:**
```typescript
function buildPrompt(
  task: BeadsTask & { description?: string; acceptance_criteria?: string | string[]; parent_id?: string },
  epicId: string | null,
  agentInstructions: string
): string {
  // ... existing code ...
  
  // Build epic context section
  let epicContext = "";
  if (epicId) {
    const epicTasks = getEpicTasks(epicId);
    
    if (epicTasks.length > 0) {
      // Group by status for better visibility
      const byStatus = epicTasks.reduce((acc, t) => {
        if (!acc[t.status]) acc[t.status] = [];
        acc[t.status].push(t);
        return acc;
      }, {} as Record<string, typeof epicTasks>);
      
      epicContext = `
### EPIC CONTEXT: ${epicId}

**All Tasks in This Epic:**
${Object.entries(byStatus).map(([status, tasks]) => `
**${status.toUpperCase()}** (${tasks.length}):
${tasks.map(t => {
  const priority = t.priority !== undefined ? ` [P${t.priority}]` : '';
  const current = t.id === task.id ? ' ← **YOU ARE HERE**' : '';
  return `  - ${t.id}: ${t.title}${priority}${current}`;
}).join('\n')}
`).join('\n')}

**Cross-Task Communication:**
- If your work affects or depends on other tasks, add comments to those tasks using: \`bd comments add <task-id> "<message>"\`
- Check task status before starting work that depends on others: \`bd show <task-id> --json\`
- If you discover issues that block other tasks, notify them immediately
- Document learnings that might help other tasks in the epic
`;
    }
  }
  
  return `Task: ${description}
Task ID: ${task.id}
Parent Epic ID: ${epicId || "null"}

Acceptance Criteria:
${acceptance}

${qualityInfo}
CONTEXT:
You are working on task ${task.id} which is part of Epic ${epicId || "null"}.
${epicContext}
You can view full epic details using: bd show ${epicId || task.id}

### AGENT OPERATING INSTRUCTIONS
${agentInstructions}
// ... rest of prompt ...
`;
}
```

**Benefits:**
- ✅ Agents see the big picture immediately
- ✅ No manual discovery required
- ✅ Clear visibility into dependencies
- ✅ Structured guidance on communication

**Considerations:**
- Performance: Fetching all tasks adds overhead (mitigated by caching or async loading)
- Prompt length: More context = longer prompts (but structured for easy scanning)
- Accuracy: Task status may change between prompt generation and execution

### Solution 2: Dependency Graph Visualization

**Approach:** Show task dependencies and relationships in the prompt.

**Implementation:**
- Parse `depends_on` fields from task details
- Build a dependency graph
- Show which tasks block/are blocked by current task

**Example Output:**
```
**Task Dependencies:**
- Blocks: devagent-a8fa.2, devagent-a8fa.3
- Blocked by: devagent-a8fa.1 (status: closed)
- Related: devagent-a8fa.4 (same parent, different branch)
```

**Benefits:**
- Clear dependency visibility
- Helps agents understand impact

**Considerations:**
- Requires `depends_on` to be properly set
- More complex to implement
- May be redundant if task list is comprehensive

### Solution 3: Cross-Task Comment Helper

**Approach:** Add a helper function and prompt guidance for leaving structured comments on related tasks.

**Implementation:**

1. **Add helper function:**
```typescript
/**
 * Add a comment to a related task with structured format
 */
function addCrossTaskComment(
  targetTaskId: string,
  currentTaskId: string,
  message: string,
  type: 'dependency' | 'blocking' | 'learning' | 'coordination' = 'coordination'
): void {
  const prefix = {
    dependency: '🔗 Dependency Update',
    blocking: '⚠️ Blocking Issue',
    learning: '💡 Learning/Insight',
    coordination: '🤝 Coordination',
  }[type];
  
  const comment = `${prefix} from ${currentTaskId}:\n\n${message}`;
  
  Bun.spawnSync(["bd", "comments", "add", targetTaskId, comment], {
    stdout: "pipe",
    stderr: "pipe",
  });
}
```

2. **Add prompt guidance:**
```typescript
**When to Comment on Other Tasks:**
- **Dependency Update**: Your task completes work another task depends on
- **Blocking Issue**: You discover something that blocks another task
- **Learning/Insight**: You learn something that would help another task
- **Coordination**: You need to coordinate changes with another task

**Example:**
\`\`\`
bd comments add devagent-a8fa.2 "🔗 Dependency Update from devagent-a8fa.1: 
Schema changes are complete. The new agent profile structure is ready for use."
\`\`\`
```

**Benefits:**
- Structured communication patterns
- Easy to discover relevant comments
- Encourages proactive communication

**Considerations:**
- Requires agents to be proactive
- May generate noise if overused
- Comments are one-way (no reply mechanism)

### Solution 4: Epic Progress Summary

**Approach:** Include a high-level progress summary in the prompt.

**Implementation:**
```typescript
function getEpicProgressSummary(epicId: string): string {
  const tasks = getEpicTasks(epicId);
  const total = tasks.length;
  const closed = tasks.filter(t => t.status === 'closed').length;
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;
  const blocked = tasks.filter(t => t.status === 'blocked').length;
  const open = tasks.filter(t => t.status === 'open').length;
  
  return `
**Epic Progress:** ${closed}/${total} complete | ${inProgress} in progress | ${blocked} blocked | ${open} open
**Completion:** ${Math.round((closed / total) * 100)}%
`;
}
```

**Benefits:**
- Quick progress visibility
- Motivates completion
- Helps prioritize work

**Considerations:**
- Simple addition, low overhead
- May not be necessary if task list is comprehensive

## Recommended Implementation Plan

### Phase 1: Core Task List (High Priority)
1. Implement `getEpicTasks()` function
2. Enhance `buildPrompt()` to include task list grouped by status
3. Add basic cross-task communication guidance
4. Test with existing epics

### Phase 2: Enhanced Context (Medium Priority)
1. Add dependency graph visualization
2. Implement epic progress summary
3. Add helper functions for cross-task comments

### Phase 3: Advanced Features (Low Priority)
1. Related task discovery (by labels, keywords)
2. Automatic dependency detection
3. Cross-task coordination workflows

## Alternative: Lightweight Approach

If full implementation is too heavy, a **minimal viable enhancement** would be:

```typescript
// In buildPrompt(), add:
const epicContext = epicId ? `
**Epic Tasks:** Run \`bd show ${epicId} --json\` to see all tasks in this epic.
**Related Tasks:** Check task dependencies and parent relationships.
**Communication:** Use \`bd comments add <task-id> "<message>"\` to notify other tasks.
` : "";
```

This provides guidance without fetching overhead, but relies on agent proactivity.

## Questions for Discussion

1. **Performance vs. Context Trade-off**: Is the overhead of fetching all epic tasks acceptable, or should we use a lighter approach?
2. **Prompt Length**: How much context is too much? Should we make the task list collapsible or summarized?
3. **Real-time Updates**: Should we fetch fresh task status on each execution, or is cached/stale data acceptable?
4. **Communication Patterns**: Should we enforce structured comment formats, or keep it flexible?
5. **Dependency Discovery**: Should we automatically detect dependencies, or rely on explicit `depends_on` fields?

## References

- PR #48: Bun-based label-driven task routing implementation
- `.devagent/plugins/ralph/tools/ralph.ts`: Current prompt building logic
- `.devagent/plugins/ralph/AGENTS.md`: Agent instructions and task commenting guidelines
- `.devagent/workspace/tasks/active/DEV-34_implement-bun-based-label-driven-task-routing-for-ralph/`: Related task context
