# DevAgent Core Kit

The DevAgent **core** kit is a portable collection of agent instruction sheets and reusable templates that enable structured product development workflows. Copy this entire `core/` directory to any project to gain immediate access to the full DevAgent roster and workflow templates.

## What's Included

- **Agent Instruction Sheets** (`agents/`) - Detailed briefs for 10+ specialized agents covering ideation, research, specification, planning, and execution
- **Document Templates** (`templates/`) - Reusable structures for research packets, specs, task plans, and task hubs
- **Agent Roster** (`AGENTS.md`) - Quick reference guide for when to invoke each agent
- **This Setup Guide** (`README.md`) - Instructions for initializing DevAgent in new projects

## Core vs Workspace

DevAgent separates **portable** artifacts (core) from **project-specific** artifacts (workspace):

- **`.devagent/core/`** (this directory) - PORTABLE agent kit that can be copied to any project
- **`.devagent/workspace/`** - PROJECT-SPECIFIC product mission, tasks, research, and decisions

This separation enables **5-minute setup** for new projects: copy `core/`, create `workspace/` skeleton, customize your mission, and start working.

## Directory Structure

```
.devagent/
├── core/                              # PORTABLE - Copy to any project
│   ├── agents/                        # Agent instruction sheets
│   │   ├── ProductMissionPartner.md
│   │   ├── FeatureClarifyAgent.md
│   │   ├── FeatureBrainstormAgent.md
│   │   ├── ResearchAgent.md
│   │   ├── SpecArchitect.md
│   │   ├── TaskPlanner.md
│   │   ├── TaskExecutor.md
│   │   ├── TechStackAgent.md
│   │   ├── AgentBuilder.md
│   │   └── codegen/
│   │       └── CodegenBackgroundAgent.md
│   ├── templates/                     # Reusable document templates
│   │   ├── agent-brief-template.md
│   │   ├── brainstorm-packet-template.md
│   │   ├── clarification-packet-template.md
│   │   ├── clarification-questions-framework.md
│   │   ├── constitution-template.md
│   │   ├── research-packet-template.md
│   │   ├── spec-document-template.md
│   │   ├── task-plan-template.md
│   │   ├── task-prompt-template.md
│   │   ├── tech-stack-template.md
│   │   └── task-hub-template/      # Template for new task hubs
│   │       ├── README.md
│   │       ├── research/
│   │       └── spec/
│   ├── AGENTS.md                      # Agent roster documentation
│   └── README.md                      # Core kit usage & setup instructions
│
└── workspace/                         # PROJECT-SPECIFIC - Changes per project
    ├── product/                       # Product mission & strategy
    │   ├── mission.md
    │   ├── roadmap.md
    │   └── guiding-questions.md
    ├── memory/                        # Project constitution & decisions
    │   ├── constitution.md
    │   ├── decision-journal.md
    │   ├── tech-stack.md
    │   ├── overview.md
    │   └── _archive/                  # Historical constitution snapshots
    ├── tasks/                         # Task hubs with research & plans
    │   ├── README.md
    │   ├── active/                    # Tasks currently being worked on
    │   │   └── YYYY-MM-DD_task-slug/
    │   │       ├── AGENTS.md
    │   │       ├── research/
    │   │       ├── plan/
    │   │       └── tasks/
    │   ├── planned/                   # Tasks queued for future work
    │   │   └── YYYY-MM-DD_task-slug/
    │   └── completed/                 # Shipped and stable tasks
    │       └── YYYY-MM-DD_task-slug/
    └── research/                      # Cross-cutting research
        └── YYYY-MM-DD_topic.md
```

## Quick Setup (< 5 Minutes)

Initialize DevAgent in a new project with these steps:

### 1. Install the Core Kit

**Option A: Manual copy (for new installations)**
```bash
# From an existing DevAgent project
cp -r .devagent/core /path/to/new-project/.devagent/

# Or clone this repository and copy core/
git clone <this-repo-url>
cp -r devagent/.devagent/core /path/to/new-project/.devagent/
```

**Option B: Using the install/update script**
```bash
# If you already have DevAgent installed, run from your project root:
.devagent/core/scripts/update-core.sh

# The script works for both fresh installations and updates
# (It automatically detects whether core already exists)
```

### 2. Create Workspace Skeleton
```bash
cd /path/to/new-project/.devagent
mkdir -p workspace/{product,memory,tasks,research}
mkdir -p workspace/memory/_archive
```

### 3. Initialize Product Mission
```bash
# Create your product mission document
cat > workspace/product/mission.md << 'EOF'
# Product Mission

## Vision
[What does success look like?]

## Target Users
[Who are we building for?]

## Core Value Proposition
[What unique value do we provide?]

## Success Metrics
[How will we measure impact?]
EOF
```

### 4. Invoke Your First Agent
Open your AI chat interface (Cursor, Codegen, etc.) and reference:
```
@.devagent/core/agents/ProductMissionPartner.md

Help me refine our product mission based on:
- Our target market is [X]
- Our key differentiator is [Y]
- Our success criteria are [Z]
```

### 5. Start Building
- Use `#ResearchAgent` to explore new tasks or features
- Use `#SpecArchitect` to document implementations
- Use `#TaskPlanner` and `#TaskExecutor` to break down work
- All artifacts save to `workspace/` while `core/` remains portable

**Target Setup Time:** Under 5 minutes from copy to first agent invocation.

## How Agents Use This Structure

**Agents Read From:**
- `core/agents/` - To understand their role and workflow
- `core/templates/` - To structure their outputs consistently
- `workspace/product/` - To align with product mission and strategy
- `workspace/memory/` - To respect project constitution and decisions

**Agents Write To:**
- `workspace/tasks/{status}/YYYY-MM-DD_task-slug/` - Research packets, specs (where {status} is active, planned, or completed)
- `workspace/memory/` - Constitution updates, decision journal entries
- `workspace/research/` - Cross-cutting research that spans multiple tasks
- `workspace/tasks/` - Task execution logs (future capability)

**Key Principle:** `core/` provides the *how* (agent instructions + templates), while `workspace/` captures the *what* (your project's specific artifacts).

## Usage Notes

### Updating the Core Kit
- When DevAgent core is updated, simply replace your `core/` directory with the new version
- Your `workspace/` remains untouched during core updates
- Review changelog below before updating to understand changes

### Customizing for Your Team
- **Recommended:** Keep `core/` unmodified for easy updates
- **Team-specific customizations:** Add to `workspace/memory/constitution.md` instead
- **Template extensions:** Reference core templates but save customized versions in your project docs

### Cross-Project Learning
- Share research and patterns by copying specific `workspace/` subdirectories between projects
- The portable `core/` kit means setup is always < 5 minutes
- Consider maintaining an internal "DevAgent template project" with your team's baseline `workspace/` structure

## Agent Roster Quick Reference

See `AGENTS.md` for full details. Common workflows:

**Simple Enhancement:**
1. `#ResearchAgent` - Explore the problem space
2. `#TaskExecutor` - Implement directly from research

**Complex Feature:**
1. `#ProductMissionPartner` - Validate mission alignment
2. `#FeatureBrainstormAgent` - Generate solution ideas
3. `#ResearchAgent` - Gather technical context
4. `#SpecArchitect` - Document the design
5. `#TaskPlanner` - Break into tasks
6. `#TaskExecutor` - Implement step by step

**When Requirements Are Unclear:**
- Insert `#FeatureClarifyAgent` after ideation to validate completeness
- Use structured clarification sessions before committing to specs

## Updates & Changelog

### Version History
- **2025-10-01** - Initial core-workspace split release
  - Separated portable core from project-specific workspace
  - Added comprehensive setup documentation
  - Established < 5 minute setup target

### Upcoming Features
- Enhanced task execution logging in `workspace/tasks/`
- Agent-to-agent handoff automation
- Template versioning and migration tools

---

**Questions or Issues?** Review individual agent instructions in `agents/` or see the root `README.md` for project-specific context.
