# devagent

DevAgent coordinates a roster of specialized workflows that carry product ideas from mission alignment through research, specs, planning, and execution. The repo stores shared context, workflow briefs, and task hubs so every hand-off stays traceable.

## Repository Structure

DevAgent separates **portable** tools (core) from **project-specific** artifacts (workspace):

- **`.devagent/core/`** - PORTABLE workflow kit with instruction sheets and templates. Copy to any project for 5-minute setup. See [core/README.md](.devagent/core/README.md) for setup guide.
- **`.devagent/workspace/`** - PROJECT-SPECIFIC mission, tasks, research, and decisions that evolve with your product.

This separation means you can **reuse the workflow system across projects** while keeping each product's context isolated.

## How the System Fits Together
- The update-product-mission workflow curates product direction inside `.devagent/workspace/product/` while referencing long-term guardrails in `.devagent/workspace/memory/overview.md` and `constitution.md`.
- The research and create-plan workflows work out of `.devagent/workspace/tasks/{status}/YYYY-MM-DD_task-slug/` to keep discovery packets and plans co-located (where {status} is active, planned, or completed).
- The create-plan workflow produces comprehensive plans combining product context and implementation tasks under `.devagent/workspace/tasks/{status}/YYYY-MM-DD_task-slug/plan/`; all execution tracking happens via git commits and PR descriptions.
- The parent `README.md` acts as the quick orientation surface; individual workflow briefs in `.devagent/core/workflows/` capture detailed workflows and filing rules.

## Directory Map

### Core (Portable Workflow Kit)
- `.devagent/core/workflows/` - Instruction sheets for each workflow (`research.md`, `create-plan.md`, `update-product-mission.md`, etc.).
- `.devagent/core/templates/` - Reusable document templates for research packets, specs, task plans, and task hubs.
- `.devagent/core/AGENTS.md` - Quick reference roster showing when to invoke each workflow.
- `.devagent/core/README.md` - Setup guide for initializing DevAgent in new projects.
- `.devagent/core/PLUGINS.md` - Plugin system documentation.

### Workspace (Project-Specific Artifacts)
- `.devagent/workspace/product/` - Mission, roadmap, guiding questions, and other top-of-funnel product context.
- `.devagent/workspace/memory/` - Long-lived principles (`constitution.md`), decision journal, tech stack, and extended overview (`overview.md`).
- `.devagent/workspace/tasks/` - Task hubs organized by status (active, planned, completed); copy `.devagent/core/templates/task-hub-template/` into the appropriate status directory with a dated slug (e.g. `active/2025-09-30_task-slug`) to start a new initiative and file research/spec artifacts with ISO dates.
- `.devagent/workspace/tasks/{status}/YYYY-MM-DD_task-slug/plan/` - Plan documents combining product context and implementation tasks, stored alongside the research hub.
- `.devagent/workspace/research/` - Cross-cutting research that spans multiple tasks.

### Plugins (Optional Extensions)
- `.devagent/plugins/` - Optional plugins that extend DevAgent functionality (e.g., `ralph/` for autonomous execution).

## Getting Started
1. **New to DevAgent?** See [.devagent/core/README.md](.devagent/core/README.md) for 5-minute setup instructions.
2. **First time using workflows?** Read [.devagent/DEVELOPER-GUIDE.md](.devagent/DEVELOPER-GUIDE.md) for step-by-step examples and best practices.
3. **Want to learn from experience?** Check [.devagent/learned-lessons.md](.devagent/learned-lessons.md) for real-world usage patterns and common questions.
4. Review relevant workflow brief(s) in `.devagent/core/workflows/` before kicking off work.
5. For a new task or feature, use `devagent new-task` to scaffold a task hub, then follow the workflow sequence: `devagent research` → `devagent clarify-task` → `devagent create-plan` → `devagent implement-plan`.
6. Keep artifacts date-prefixed and cross-link research, plans, and exencution notes so downstream workflows have the full story.
7. When mission or guardrails change, update `.devagent/workspace/product/` and `.devagent/workspace/memory/` first, then notify affected task hubs.

## Workflow Quickstart

Use this map to select the right workflow chain based on your goal. Update this table when workflows change.

| Goal | Recommended Chain | Notes |
| --- | --- | --- |
| Explore new feature ideas | `brainstorm` → `research` → `create-plan` | Use exploratory mode for broad ideation. |
| Validate a fuzzy requirement | `clarify-task` → `research` → `create-plan` | Use for requirement completeness checks. |
| Setup unified AI rules | `setup-ai-rules` | Initializes `ai-rules` source hub. |
| Execute a full task end-to-end | `execute-full-task` | Runs new-task through implement-plan. |
| Implement from an approved plan | `implement-plan` | Requires a plan document path. |
| Archive a finished task hub | `mark-task-complete` | Moves task from active to completed. |

## Installing and Updating DevAgent Core

The `update-core.sh` script works for both **fresh installations** and **updates** to existing installations:

**For new installations:**
```bash
# Download and run the install script from your project root
curl -fsSL https://raw.githubusercontent.com/lambda-curry/devagent/main/.devagent/core/scripts/update-core.sh | bash
```

**For existing installations:**
```bash
# Run the update script (if you already have DevAgent installed)
.devagent/core/scripts/update-core.sh
```

This script:
- Automatically detects whether this is a fresh install or an update
- Performs a Git sparse checkout to fetch only the `.devagent/core/` directory (and related files)
- Creates a timestamped backup of your existing core before updating (for updates only)
- Replaces the local core with the latest version from the repository
- Provides clear feedback on the install/update process and next steps

## Cursor Integration

To make DevAgent commands available in Cursor's command palette, paste this prompt into Cursor's chat:

> Create the `.cursor/commands/` directory if it doesn't exist, then create symlinks from `.cursor/commands/` to all files in `.agents/commands/` so that DevAgent workflows are accessible through Cursor's command palette. Use relative symlinks (e.g., `ln -sf ../.agents/commands/* .cursor/commands/`).

After running this prompt, all DevAgent workflows will be accessible through Cursor's command palette. For more details, see [.agents/commands/README.md](.agents/commands/README.md).

**For new installations:** The script will install core files and provide setup instructions for creating your workspace.

**For existing installations:** Run this periodically to get the latest workflow improvements, workflow updates, and bug fixes.

## Plugins

DevAgent supports plugins that extend core functionality with optional features. Plugins can add workflows, commands, tools, and skills while keeping the core system lightweight.

### Ralph Plugin

The **Ralph plugin** enables autonomous execution of DevAgent plans using Beads-backed task management. It converts implementation plans into Beads task structures and orchestrates AI agents to execute tasks autonomously with quality gates and progress tracking.

**Key Features:**
- Converts DevAgent plans to Beads task hierarchies
- Autonomous execution loop with quality gate verification
- Task status tracking and progress synchronization
- Revision learning and improvement reporting

**Documentation:**
- Plugin instructions: [.devagent/plugins/ralph/AGENTS.md](.devagent/plugins/ralph/AGENTS.md)
- Plugin system overview: [.devagent/core/PLUGINS.md](.devagent/core/PLUGINS.md)

For details on installing, configuring, and using plugins, see the [plugin system documentation](.devagent/core/PLUGINS.md).

## AI Rules Management

This project uses [ai-rules](https://github.com/block/ai-rules) to maintain consistent AI coding rules across all AI assistants (Cursor, Claude Code, GitHub Copilot, Opencode, etc.). The `ai-rules/` directory serves as the **source of truth** for all AI coding guidelines.

### Workflow

**To update AI rules:**

1. **Edit source files** in the `ai-rules/` directory (e.g., `ai-rules/react-router-7.md`, `ai-rules/testing-best-practices.md`)
2. **Generate platform-specific files** by running:
   ```bash
   ai-rules generate
   ```

This command automatically generates the following files from the source rules:
- **`CLAUDE.md`** - Rules for Claude Code
- **`AGENTS.md`** - Rules for Opencode and other agents (copilot, codex, opencode, gemini)
- **`.cursor/rules/*.mdc`** - Rules for Cursor
- **`.github/copilot-instructions.md`** - Symlink to AGENTS.md for GitHub Copilot

### Checking Sync Status

To verify that generated files are in sync with source files, run:

```bash
ai-rules status
```

This will show the sync status for all configured agents:
- ✅ `in sync` - Generated files match source files
- ⚠️ `out of sync` - Source files have been modified and need regeneration

You can also check status for specific agents:

```bash
ai-rules status --agents claude,cursor
```

### Configuration

The `ai-rules/ai-rules-config.yaml` file configures which agents to generate rules for. The default configuration generates rules for all supported agents: `claude`, `cursor`, `copilot`, `codex`, `opencode`, and `gemini`.

### Important Notes

- **Never edit generated files directly** (e.g., `CLAUDE.md`, `.cursor/rules/*.mdc`, `AGENTS.md`). These are build artifacts that will be overwritten when you run `ai-rules generate`.
- **Always edit source files** in `ai-rules/` and then run `ai-rules generate` to sync changes to all platforms.
- **Commit both source and generated files** to ensure all team members have consistent AI rules across their tools.

## Managing DevAgent Files in Git

DevAgent generates files in the `.devagent/workspace/` directory that can be quite long (research packets, plans, task hubs, etc.). You have two options for managing these files in your repository:

### Option 1: Hide in GitHub Diffs (Recommended for Teams)

If you're committing DevAgent files to your repository (useful for team collaboration and traceability), you can hide them from GitHub diffs by marking them as generated files. This keeps PR reviews clean while still preserving the files in version control.

Create or edit a `.gitattributes` file in your repository root:

```bash
# Mark DevAgent workspace files as generated to hide them in GitHub diffs
.devagent/workspace/** linguist-generated
```

This uses GitHub's `linguist-generated` attribute to collapse these files by default in pull request diffs, making reviews more focused on code changes while still keeping the DevAgent artifacts available in the repository.

### Option 2: Exclude from Git (Recommended for Individual Contributors)

If you're working solo or prefer to keep DevAgent files local, add `.devagent/workspace/` to your `.gitignore`:

```bash
# DevAgent workspace files (project-specific artifacts)
.devagent/workspace/
```

**Note:** Only exclude `.devagent/workspace/` (project-specific artifacts), not `.devagent/core/` (the portable workflow kit that should be committed).

## Related Resources

### Getting Started Guides
- **[.devagent/DEVELOPER-GUIDE.md](.devagent/DEVELOPER-GUIDE.md)** – Comprehensive step-by-step guide with examples for implementing tasks using DevAgent workflows. Start here for your first task.
- **[.devagent/learned-lessons.md](.devagent/learned-lessons.md)** – Real-world lessons learned from first-time usage, including common questions, workflow patterns, and best practices.

### Core Documentation
- `.devagent/core/README.md` – Setup guide for initializing DevAgent in new projects (< 5 minutes).
- `.devagent/core/AGENTS.md` – Workflow roster showing when to invoke each workflow.
- `.devagent/workspace/memory/overview.md` – Explains the memory layering model and shared working agreements.
- `.devagent/core/templates/` – Reusable shells for research packets, plans, and more.
- Workflow instructions in `.devagent/core/workflows/` explain when to invoke `devagent update-product-mission`, `devagent research`, `devagent create-plan`, `devagent implement-plan`, and other workflows.
