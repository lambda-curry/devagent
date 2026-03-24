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
