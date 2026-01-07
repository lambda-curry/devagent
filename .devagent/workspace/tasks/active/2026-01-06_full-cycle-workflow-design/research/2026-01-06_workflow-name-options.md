# Workflow Name Options for Full-Cycle Orchestrator

**Date:** 2026-01-06  
**Purpose:** Brainstorm and evaluate alternative names for the full-cycle workflow orchestrator

## Naming Convention Context

DevAgent workflows follow the `action-target` pattern:
- **Action verb** describes the primary function
- **Target noun** specifies the scope
- Examples: `create-plan`, `implement-plan`, `clarify-task`, `mark-task-complete`

## Name Options

### Category 1: End-to-End Execution (Recommended)

| Name | Rationale | Pros | Cons |
|------|-----------|------|------|
| **`execute-task`** | Direct, action-oriented, follows naming pattern | Clear intent, matches `implement-plan` style | Could be confused with `implement-plan` |
| **`complete-task`** | Emphasizes finishing the entire lifecycle | Clear outcome-focused | Might imply task is already done |
| **`run-task`** | Simple, direct, execution-focused | Short, memorable | Less descriptive of orchestration |
| **`deliver-task`** | Emphasizes end-to-end delivery | Outcome-focused, professional | Might imply shipping/deployment |

**Top Pick:** `execute-task` - Clear, follows pattern, action-oriented

### Category 2: Orchestration/Coordination

| Name | Rationale | Pros | Cons |
|------|-----------|------|------|
| **`orchestrate-task`** | Emphasizes coordination of multiple workflows | Accurate description | Longer, less common word |
| **`chain-workflows`** | Describes the chaining behavior | Descriptive of mechanism | Less user-friendly, technical |
| **`coordinate-task`** | Emphasizes coordination role | Clear coordination intent | Less action-oriented |

**Top Pick:** None - These are too technical/internal-facing

### Category 3: Lifecycle/Cycle

| Name | Rationale | Pros | Cons |
|------|-----------|------|------|
| **`full-cycle`** | Current name, emphasizes complete cycle | Already established | "Full" is vague, "cycle" is abstract |
| **`task-lifecycle`** | Explicit about lifecycle concept | Descriptive | Longer, hyphenated |
| **`complete-lifecycle`** | Emphasizes completion | Clear | Redundant with "complete" |

**Top Pick:** None - Current name is okay but could be clearer

### Category 4: Automation/One-Shot

| Name | Rationale | Pros | Cons |
|------|-----------|------|------|
| **`auto-task`** | Emphasizes automation | Short, modern | Less descriptive |
| **`one-shot-task`** | Emphasizes single-prompt execution | Highlights key benefit | Informal, might not age well |
| **`automate-task`** | Clear automation intent | Descriptive | Might imply no user control |

**Top Pick:** None - These emphasize mechanism over outcome

### Category 5: Ship/Deliver Focus

| Name | Rationale | Pros | Cons |
|------|-----------|------|------|
| **`ship-task`** | Emphasizes delivery/shipping | Modern, outcome-focused | Might imply deployment |
| **`ship-feature`** | Feature-focused delivery | Clear outcome | Doesn't match "task" terminology |
| **`deliver-feature`** | Professional delivery focus | Outcome-focused | Doesn't match "task" terminology |

**Top Pick:** None - These don't match task terminology

### Category 6: Simple Action Verbs

| Name | Rationale | Pros | Cons |
|------|-----------|------|------|
| **`build-task`** | Simple, action-oriented | Short, clear | Could be confused with building code |
| **`do-task`** | Ultra-simple | Very short | Too informal, vague |
| **`work-task`** | Simple work verb | Short | Vague, doesn't convey orchestration |

**Top Pick:** None - Too vague

## Recommended Options (Top 3)

### 1. **`execute-full-task`** ⭐⭐ (Top Choice - User Selected)
- **Rationale:** Combines clear action verb with explicit "full" lifecycle emphasis
- **Pros:** 
  - Clear, direct, action-oriented
  - "Execute" avoids ambiguity (unlike "run" which can confuse AI)
  - "Full" explicitly communicates complete lifecycle orchestration
  - Matches existing workflow style (`implement-plan`, `create-plan`)
  - Professional and memorable
  - Clearly distinct from `implement-plan` (which implements a plan, not the full task)
- **Cons:** 
  - Slightly longer than `execute-task`
- **Usage:** `devagent execute-full-task`

### 2. **`execute-task`**
- **Rationale:** Follows `action-target` pattern perfectly
- **Pros:** 
  - Clear, direct, action-oriented
  - Matches existing workflow style (`implement-plan`, `create-plan`)
  - Emphasizes execution from start to finish
  - Professional and memorable
- **Cons:** 
  - Could be confused with `implement-plan` (but they're different: one orchestrates, one implements)
  - Less explicit about "full" lifecycle
- **Usage:** `devagent execute-task`

### 3. **`complete-task`**
- **Rationale:** Outcome-focused, emphasizes finishing
- **Pros:**
  - Clear outcome (completion)
  - Follows naming pattern
  - Professional
- **Cons:**
  - Might imply task is already done
  - Less action-oriented than `execute-task`
- **Usage:** `devagent complete-task`

## Comparison with Existing Workflows

| Existing Workflow | Pattern | New Workflow Option | Consistency |
|------------------|---------|-------------------|-------------|
| `new-task` | `action-target` | `execute-full-task` | ✅ Matches |
| `create-plan` | `action-target` | `execute-full-task` | ✅ Matches |
| `implement-plan` | `action-target` | `execute-full-task` | ✅ Matches |
| `mark-task-complete` | `action-target` | `execute-full-task` | ✅ Matches |

**Note:** While `execute-full-task` uses a modifier ("full"), it still follows the `action-target` pattern and is clearly distinct from `implement-plan` which only implements a plan, not the full task lifecycle.

## User Experience Considerations

### Clarity
- **`execute-task`**: Very clear - "I want to execute this task"
- **`complete-task`**: Clear - "I want to complete this task"
- **`run-task`**: Clear but less specific

### Memorability
- **`execute-task`**: Easy to remember, follows pattern
- **`complete-task`**: Easy to remember
- **`run-task`**: Very easy to remember

### Discoverability
- **`execute-task`**: Users might search for "execute" or "run"
- **`complete-task`**: Users might search for "complete" or "finish"
- **`run-task`**: Users might search for "run" or "execute"

## Final Recommendation

**Primary Recommendation: `execute-task`**

**Rationale:**
1. Follows `action-target` naming convention perfectly
2. Clear, professional, action-oriented
3. Matches existing workflow style (`implement-plan`, `create-plan`)
4. Emphasizes execution from start to finish
5. Memorable and discoverable

**Alternative if `execute-task` feels too similar to `implement-plan`:**
- **`complete-task`** - Emphasizes the outcome (completion) rather than the mechanism (execution)

## Example Usage

### With `execute-task`:
```
/devagent execute-task

Task: Add a "Copy" button to the user profile page that copies the user's ID to clipboard.
```

### With `complete-task`:
```
/devagent complete-task

Task: Implement user authentication with email/password login and JWT tokens.
```

### With `run-task`:
```
/devagent run-task

Task: Redesign the user dashboard to improve engagement metrics.
```

## Decision Criteria

When choosing the final name, consider:
1. **Consistency** with existing workflow naming patterns
2. **Clarity** - Does it clearly communicate what it does?
3. **Memorability** - Is it easy to remember?
4. **Discoverability** - Will users find it when searching?
5. **Professionalism** - Does it sound professional?
6. **Distinctiveness** - Is it clearly different from similar workflows?

Based on these criteria, **`execute-task`** scores highest across all dimensions.