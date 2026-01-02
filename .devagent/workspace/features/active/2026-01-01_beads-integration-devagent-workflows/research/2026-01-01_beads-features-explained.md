# Beads Features & DevAgent Integration Explained

## What is Beads?

**Beads** (`bd`) is a distributed, git-backed task management system designed specifically for AI coding agents. It stores tasks as structured data (JSONL format) in a `.beads/` directory within your git repository, making it perfect for DevAgent's git-based state management approach.

## Core Beads Features

### 1. **Dependency Graph (DAG - Directed Acyclic Graph)**
**What it is:**
- Tasks can have dependencies on other tasks
- Beads builds a dependency graph to understand task relationships
- Creates a visual/queryable structure: "Task B depends on Task A"

**Example:**
```
Task: "Implement authentication" (ID: beads-123)
├─ Depends on: "Set up database schema" (beads-122)
└─ Blocks: "Add login UI" (beads-124), "Test auth flow" (beads-125)
```

**How DevAgent Uses It:**
- **Problem solved:** Currently, task dependencies in markdown are hard to track and often drift
- **DevAgent benefit:** When `devagent create-plan` breaks down a feature into tasks, it can create Beads issues with proper dependency links
- **Workflow enhancement:** `devagent review-progress` can query Beads to see the full dependency graph and identify what's blocked vs. ready

### 2. **"Ready" Detection**
**What it is:**
- Beads can automatically identify tasks that are "ready" to work on
- A task is "ready" when all its dependencies are completed
- Query with: `bd ready` or similar commands

**Example:**
```
Task A: "Design API" [COMPLETE]
Task B: "Implement API endpoint" [PENDING] ← Depends on Task A
Task C: "Write tests" [PENDING] ← Depends on Task B

Beads reports: Task B is READY (because Task A is done)
Task C is NOT READY (because Task B is still pending)
```

**How DevAgent Uses It:**
- **Problem solved:** No more manually scanning markdown to find "what can I work on next?"
- **DevAgent benefit:** `devagent implement-plan` can query Beads for ready tasks automatically
- **Workflow enhancement:** AI agents can prioritize work based on what's actually unblocked

### 3. **Git-Backed Storage (`.beads/` directory)**
**What it is:**
- All task data stored in `.beads/` directory as JSONL files
- Committed to git like any other files
- No external database or server needed
- Works across branches, merges, and collaboration

**Example:**
```
repo/
├── .beads/
│   ├── issues.jsonl
│   └── metadata.json
├── src/
└── .devagent/
```

**How DevAgent Uses It:**
- **Problem solved:** DevAgent already uses git for state management (Constitution C2)
- **DevAgent benefit:** Perfect alignment with DevAgent's git-based philosophy
- **Workflow enhancement:** Task tracking history is versioned, reviewable, and mergeable just like code

### 4. **Structured Task Data (JSONL format)**
**What it is:**
- Tasks stored as structured JSON objects (not markdown text)
- Queryable and parseable by agents
- Rich metadata: status, dependencies, descriptions, labels, etc.

**Example Task Structure:**
```json
{
  "id": "beads-123",
  "title": "Implement authentication",
  "status": "pending",
  "dependencies": ["beads-122"],
  "blocks": ["beads-124", "beads-125"],
  "description": "...",
  "created": "2026-01-01T10:00:00Z",
  "updated": "2026-01-01T10:00:00Z"
}
```

**How DevAgent Uses It:**
- **Problem solved:** Markdown task lists are unstructured and hard to query
- **DevAgent benefit:** AI agents can programmatically query Beads for task info
- **Workflow enhancement:** Tasks become first-class structured data instead of text in markdown

### 5. **Long-Horizon Memory (Compaction)**
**What it is:**
- Beads can "compact" old completed tasks into summaries
- Preserves essential information while reducing repository size
- Maintains traceability to original tasks

**Example:**
```
After 100 tasks completed:
- Beads can create a "compacted" summary: "Q1 2026: Implemented authentication, database, and UI"
- Original task details still accessible but summarized
- Dependency history preserved
```

**How DevAgent Uses It:**
- **Problem solved:** Long-horizon memory fragmentation (tasks from months ago are hard to track)
- **DevAgent benefit:** `devagent review-progress` can understand project history across long timeframes
- **Workflow enhancement:** AI agents can reference "what we did before" more effectively

### 6. **Auto-Sync & Daemon Mode (Optional)**
**What it is:**
- Beads can run as a background daemon
- Automatically syncs changes (commits to git)
- Can work in protected branch mode (tasks on separate branch)

**How DevAgent Uses It:**
- **Note:** This adds operational complexity
- **DevAgent approach:** Likely use simpler manual sync approach initially
- **Future consideration:** Could enable auto-sync for smoother agent workflows

## How This Maps to DevAgent Workflows

### Current DevAgent Problem → Beads Solution

| DevAgent Problem | Beads Feature | How It Helps |
|-----------------|---------------|--------------|
| **Task dependencies drift in markdown** | Dependency graph (DAG) | Structured dependency links that stay in sync |
| **Hard to find "ready" work** | Ready detection | `bd ready` queries identify unblocked tasks |
| **Long-horizon memory fragmented** | Compaction + git history | Structured task history with summarization |
| **Manual task status updates error-prone** | Structured JSONL + CLI | Programmatic task updates by AI agents |
| **Task tracking not versioned well** | Git-backed storage | Tasks committed to git like code |

### DevAgent Workflow Integration Points

#### 1. `devagent create-plan`
**Current:** Creates plan document with markdown task list

**With Beads:**
```
1. Agent creates plan as before
2. Agent runs: bd create "Task 1: ..." --depends-on "Task 2: ..."
3. Agent gets Beads IDs: beads-123, beads-124, etc.
4. Agent updates plan document with Beads ID references
5. Markdown plan becomes "summary/review format" pointing to Beads
```

**Result:** Tasks exist as structured Beads issues with dependency graph

#### 2. `devagent implement-plan`
**Current:** Manually checks markdown tasks, updates status

**With Beads:**
```
1. Agent queries: bd ready (finds unblocked tasks)
2. Agent picks ready task (e.g., beads-125)
3. Agent implements code
4. Agent updates: bd update beads-125 --status complete
5. Beads automatically marks dependent tasks as "ready"
```

**Result:** Automatic ready-work detection, status tracking, dependency propagation

#### 3. `devagent review-progress`
**Current:** Scans markdown files to understand progress

**With Beads:**
```
1. Agent queries: bd list --status pending (all pending tasks)
2. Agent queries: bd graph beads-123 (dependency graph for task)
3. Agent identifies: What's blocked, what's ready, what's complete
4. Agent generates markdown summary from Beads data
```

**Result:** Rich progress understanding from structured data, not text parsing

## The "All In" Approach

Based on clarification decisions:

1. **Beads as Single Source of Truth:**
   - All task data lives in Beads (`.beads/` directory)
   - Markdown task lists become generated summaries/review documents
   - AI agents always work with Beads first

2. **AI Agents are Primary Users:**
   - Engineers don't need to know Beads commands
   - Agents use Beads CLI via a "Beads skill" (following create-slash-command.skill pattern)
   - Engineers see markdown summaries but agents manage Beads

3. **Clean Workflow:**
   - No "legacy" markdown-only workflow
   - No complicated prompts managing two systems
   - Beads-first, markdown as presentation layer

## Example Workflow: Feature Development

**Traditional (Markdown-only):**
```
1. Create plan.md with task list
2. Manually track: "Task 1 done, Task 2 in progress..."
3. Hope dependencies are remembered correctly
4. Review progress by reading all markdown files
```

**With Beads Integration:**
```
1. Create plan.md (high-level summary)
2. Agent creates Beads issues: beads-123, beads-124, beads-125
3. Agent links dependencies: beads-125 depends on beads-124
4. Agent queries: bd ready → finds beads-124 is ready
5. Agent implements beads-124, updates status
6. Beads automatically marks beads-125 as ready
7. Agent queries: bd graph → sees full dependency tree
8. Markdown summary generated from Beads data for human review
```

## Key Benefits Summary

1. **Structured Data:** Tasks become queryable, not just text
2. **Automatic Dependency Tracking:** Graph-based dependencies stay accurate
3. **Ready Work Detection:** No more manual scanning for "what's next"
4. **Git Integration:** Tasks versioned alongside code
5. **Long-Horizon Memory:** Compaction preserves project history
6. **Agent-Friendly:** Designed for AI agents to interact with programmatically

---

**Next Steps:**
- Create Beads skill for AI agents (following create-slash-command.skill pattern)
- Update workflow prompts to use Beads CLI commands
- Generate markdown summaries from Beads data for human review
