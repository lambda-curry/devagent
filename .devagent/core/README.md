# DevAgent Core Kit

The DevAgent **core** kit is a portable collection of workflow instruction sheets and reusable templates that enable structured product development workflows. Copy this entire `core/` directory to any project to gain immediate access to the full DevAgent roster and workflow templates.

## What's Included

- **Workflow Instruction Sheets** (`workflows/`) - Detailed briefs for 15+ specialized workflows covering ideation, research, specification, planning, and execution
- **Document Templates** (`templates/`) - Reusable structures for research packets, specs, task plans, and task hubs
- **Workflow Roster** (`AGENTS.md`) - Quick reference guide for when to invoke each workflow
- **Plugin System** (`PLUGINS.md`) - Documentation for extending DevAgent with optional plugins
- **Beads Setup Guide** (`docs/beads-setup.md`) - Low-noise Beads setup options and verification
- **This Setup Guide** (`README.md`) - Instructions for initializing DevAgent in new projects

## Core vs Workspace

DevAgent separates **portable** artifacts (core) from **project-specific** artifacts (workspace):

- **`.devagent/core/`** (this directory) - PORTABLE workflow kit that can be copied to any project
- **`.devagent/workspace/`** - PROJECT-SPECIFIC product mission, tasks, research, and decisions

This separation enables **5-minute setup** for new projects: copy `core/`, create `workspace/` skeleton, customize your mission, and start working.

## Directory Structure

```
.devagent/
├── core/                              # PORTABLE - Copy to any project
│   ├── workflows/                     # Workflow instruction sheets
│   │   ├── update-product-mission.md
│   │   ├── clarify-task.md
│   │   ├── brainstorm.md
│   │   ├── research.md
│   │   ├── new-task.md
│   │   ├── create-plan.md
│   │   ├── implement-plan.md
│   │   ├── handoff.md
│   │   ├── review-progress.md
│   │   ├── review-pr.md
│   │   ├── compare-prs.md
│   │   ├── update-tech-stack.md
│   │   ├── build-workflow.md
│   │   ├── update-constitution.md
│   │   ├── update-devagent.md
│   │   └── mark-task-complete.md
│   ├── templates/                     # Reusable document templates
│   │   ├── agent-brief-template.md
│   │   ├── brainstorm-packet-template.md
│   │   ├── clarification-packet-template.md
│   │   ├── clarification-questions-framework.md
│   │   ├── constitution-template.md
│   │   ├── research-packet-template.md
│   │   ├── spec-document-template.md
│   │   ├── plan-document-template.md
│   │   ├── task-plan-template.md
│   │   ├── task-prompt-template.md
│   │   ├── tech-stack-template.md
│   │   └── task-hub-template/         # Template for new task hubs
│   │       ├── README.md
│   │       ├── research/
│   │       └── plan/
│   ├── scripts/                       # Utility scripts
│   │   └── update-core.sh            # Core update script
│   ├── AGENTS.md                      # Workflow roster documentation
│   ├── PLUGINS.md                     # Plugin system documentation
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
    │   │       ├── clarification/
    │   │       └── plan/
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

### 4. Invoke Your First Workflow
Open your AI chat interface (Cursor, Codegen, etc.) and use:
```
devagent update-product-mission

Help me refine our product mission based on:
- Our target market is [X]
- Our key differentiator is [Y]
- Our success criteria are [Z]
```

Or reference the workflow file directly:
```
@.devagent/core/workflows/update-product-mission.md

[Include your mission context]
```

### 5. Start Building
- Use `devagent research` to explore new tasks or features
- Use `devagent create-plan` to document implementations and create task plans
- Use `devagent implement-plan` to execute tasks from plans
- All artifacts save to `workspace/` while `core/` remains portable

**Target Setup Time:** Under 5 minutes from copy to first workflow invocation.

## How Workflows Use This Structure

**Workflows Read From:**
- `core/workflows/` - To understand their role and instructions
- `core/templates/` - To structure their outputs consistently
- `workspace/product/` - To align with product mission and strategy
- `workspace/memory/` - To respect project constitution and decisions

**Workflows Write To:**
- `workspace/tasks/{status}/YYYY-MM-DD_task-slug/` - Research packets, clarification packets, plans (where {status} is active, planned, or completed)
- `workspace/memory/` - Constitution updates, decision journal entries
- `workspace/research/` - Cross-cutting research that spans multiple tasks
- `workspace/tasks/{status}/YYYY-MM-DD_task-slug/AGENTS.md` - Progress tracking and task metadata

**Key Principle:** `core/` provides the *how* (workflow instructions + templates), while `workspace/` captures the *what* (your project's specific artifacts).

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

## Workflow Roster Quick Reference

See `AGENTS.md` for full details. Common workflow sequences:

**Simple Enhancement:**
1. `devagent research` - Explore the problem space
2. `devagent create-plan` - Create implementation plan
3. `devagent implement-plan` - Execute tasks from plan

**Complex Feature:**
1. `devagent update-product-mission` - Validate mission alignment
2. `devagent brainstorm` - Generate solution ideas
3. `devagent research` - Gather technical context
4. `devagent clarify-task` - Validate requirements completeness
5. `devagent create-plan` - Create comprehensive plan (product context + implementation tasks)
6. `devagent implement-plan` - Execute tasks step by step

**When Requirements Are Unclear:**
- Use `devagent clarify-task` after ideation to validate completeness
- Use structured clarification sessions before committing to plans

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

**Questions or Issues?** Review individual workflow instructions in `workflows/` or see the root `README.md` for project-specific context.
