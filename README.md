# devagent

DevAgent coordinates a roster of specialized workflows that carry product ideas from mission alignment through research, specs, planning, and execution. The repo stores shared context, workflow briefs, and feature hubs so every hand-off stays traceable.

## Repository Structure

DevAgent separates **portable** tools (core) from **project-specific** artifacts (workspace):

- **`.devagent/core/`** - PORTABLE workflow kit with instruction sheets and templates. Copy to any project for 5-minute setup. See [core/README.md](.devagent/core/README.md) for setup guide.
- **`.devagent/workspace/`** - PROJECT-SPECIFIC mission, features, research, and decisions that evolve with your product.

This separation means you can **reuse the workflow system across projects** while keeping each product's context isolated.

## How the System Fits Together
- The update-product-mission workflow curates product direction inside `.devagent/workspace/product/` while referencing long-term guardrails in `.devagent/workspace/memory/overview.md` and `constitution.md`.
- The research and create-plan workflows work out of `.devagent/workspace/features/{status}/YYYY-MM-DD_feature-slug/` to keep discovery packets and plans co-located (where {status} is active, planned, or completed).
- The create-plan workflow produces comprehensive plans combining product context and implementation tasks under `.devagent/workspace/features/{status}/YYYY-MM-DD_feature-slug/plan/`; all execution tracking happens via git commits and PR descriptions.
- The parent `README.md` acts as the quick orientation surface; individual workflow briefs in `.devagent/core/workflows/` capture detailed workflows and filing rules.

## Directory Map

### Core (Portable Workflow Kit)
- `.devagent/core/workflows/` - Instruction sheets for each workflow (`research.md`, `create-plan.md`, `create-task-prompt.md`, `update-product-mission.md`, etc.).
- `.devagent/core/templates/` - Reusable document templates for research packets, specs, task plans, and feature hubs.
- `.devagent/core/AGENTS.md` - Quick reference roster showing when to invoke each workflow.
- `.devagent/core/README.md` - Setup guide for initializing DevAgent in new projects.

### Workspace (Project-Specific Artifacts)
- `.devagent/workspace/product/` - Mission, roadmap, guiding questions, and other top-of-funnel product context.
- `.devagent/workspace/memory/` - Long-lived principles (`constitution.md`), decision journal, tech stack, and extended overview (`overview.md`).
- `.devagent/workspace/features/` - Feature hubs organized by status (active, planned, completed); copy `.devagent/core/templates/feature-hub-template/` into the appropriate status directory with a dated slug (e.g. `active/2025-09-30_feature-slug`) to start a new initiative and file research/spec artifacts with ISO dates.
- `.devagent/workspace/features/{status}/YYYY-MM-DD_feature-slug/plan/` - Plan documents combining product context and implementation tasks, stored alongside the research hub.
- `.devagent/workspace/research/` - Cross-cutting research that spans multiple features.

## Getting Started
1. **New to DevAgent?** See [.devagent/core/README.md](.devagent/core/README.md) for 5-minute setup instructions.
2. **First time using workflows?** Read [.devagent/DEVELOPER-GUIDE.md](.devagent/DEVELOPER-GUIDE.md) for step-by-step examples and best practices.
3. **Want to learn from experience?** Check [.devagent/learned-lessons.md](.devagent/learned-lessons.md) for real-world usage patterns and common questions.
4. Review relevant workflow brief(s) in `.devagent/core/workflows/` before kicking off work.
5. For a new feature, use `devagent new-feature` to scaffold a feature hub, then follow the workflow sequence: `devagent research` → `devagent clarify-feature` → `devagent create-plan` → `devagent implement-plan`.
6. Keep artifacts date-prefixed and cross-link research, plans, and execution notes so downstream workflows have the full story.
7. When mission or guardrails change, update `.devagent/workspace/product/` and `.devagent/workspace/memory/` first, then notify affected feature hubs.

## Updating DevAgent Core

Projects using DevAgent can update their core workflow files and agents from the latest main branch:

```bash
.devagent/core/scripts/update-core.sh
```

This script:
- Performs a Git sparse checkout to fetch only the `.devagent/core/` directory
- Creates a timestamped backup of your existing core before updating
- Replaces the local core with the latest version from the repository
- Provides clear feedback on the update process and backup location

Run this periodically to get the latest workflow improvements, agent updates, and bug fixes.

## Related Resources

### Getting Started Guides
- **[.devagent/DEVELOPER-GUIDE.md](.devagent/DEVELOPER-GUIDE.md)** – Comprehensive step-by-step guide with examples for implementing features using DevAgent workflows. Start here for your first feature.
- **[.devagent/learned-lessons.md](.devagent/learned-lessons.md)** – Real-world lessons learned from first-time usage, including common questions, workflow patterns, and best practices.

### Core Documentation
- `.devagent/core/README.md` – Setup guide for initializing DevAgent in new projects (< 5 minutes).
- `.devagent/core/AGENTS.md` – Workflow roster showing when to invoke each workflow.
- `.devagent/workspace/memory/overview.md` – Explains the memory layering model and shared working agreements.
- `.devagent/core/templates/` – Reusable shells for research packets, plans, and more.
- Workflow instructions in `.devagent/core/workflows/` explain when to invoke `devagent update-product-mission`, `devagent research`, `devagent create-plan`, `devagent implement-plan`, and other workflows.
