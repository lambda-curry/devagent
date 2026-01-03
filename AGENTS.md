# DevAgent Project — AI Agent Context

This file provides high-level context about the DevAgent project for AI agents working in this codebase. For detailed workflow documentation, see [`.devagent/core/AGENTS.md`](.devagent/core/AGENTS.md).

## What This Project Is

**DevAgent is a meta-project about designing smart prompting workflows.** This repository contains:

1. **A reusable workflow system** (`.devagent/core/`) — Portable agent-ready prompts and instruction sheets that teams can copy into any project
2. **A testing ground** (`.devagent/workspace/`) — Where we develop, test, and refine workflows by using them to build DevAgent itself
3. **Command interfaces** (`.agents/commands/`) — Standardized command files that provide a consistent interface for executing workflows

The project follows a "dogfooding" approach: we use our own workflows to develop DevAgent, which helps us validate that the workflows work in practice and improve them based on real usage.

## Project Structure

### `.devagent/core/` — Portable Workflow Kit
This is the **reusable, portable** part of DevAgent that can be copied to any project:
- **Workflows** (`.devagent/core/workflows/`) — Instruction sheets for each workflow (research, create-plan, brainstorm, etc.)
- **Templates** (`.devagent/core/templates/`) — Document templates for research packets, plans, task hubs
- **AGENTS.md** (`.devagent/core/AGENTS.md`) — **The authoritative workflow roster** — see this file for complete workflow documentation, usage patterns, and sequencing guidance

### `.devagent/workspace/` — Project-Specific Workspace
This is where **we test and develop workflows** by using them to build DevAgent itself:
- **Product** (`.devagent/workspace/product/`) — DevAgent's own mission, roadmap, and guiding questions
- **Tasks** (`.devagent/workspace/tasks/`) — Active and completed tasks where we test workflows (e.g., "simplify-workflow-create-plan", "interactive-brainstorm-clarify")
- **Research** (`.devagent/workspace/research/`) — Cross-cutting research artifacts
- **Memory** (`.devagent/workspace/memory/`) — Constitution, decision journal, tech stack for DevAgent

**Key insight:** When you see task work in `.devagent/workspace/tasks/`, that's us using our own workflows to develop DevAgent. This workspace serves as both the product context AND the testing ground.

### `.agents/commands/` — Command Files
Standardized command interfaces that match each workflow:
- Each workflow in `.devagent/core/workflows/` has a corresponding command file in `.agents/commands/` with the same name
- Command files follow a simple template: they reference the workflow file and provide an "Input Context" placeholder
- These are used by AI agents and can be symlinked to `.cursor/commands/` for Cursor IDE integration

### `.cursor/commands/` — Cursor Integration
Symlinks to `.agents/commands/` that make workflows available in Cursor IDE's command palette.

## How to Work in This Project

### For Workflow Development
When developing or improving workflows:
1. Use the workflows themselves: `devagent research` → `devagent create-plan` (see `.devagent/core/AGENTS.md` for full workflow roster)
2. Test changes in `.devagent/workspace/tasks/` by creating tasks that use the workflows
3. Update both `.devagent/core/` (portable kit) and `.agents/commands/` (command interfaces) when workflows change

### For Task Work
When working on DevAgent tasks (in `.devagent/workspace/tasks/`):
- Follow the standard workflow sequence documented in `.devagent/core/AGENTS.md`
- Use the nested `.devagent/` structure as if this were any project using DevAgent
- This is how we validate that workflows work in practice

### When Workflows Change
If you add, remove, or rename workflows:
1. Update `.devagent/core/workflows/` (the workflow definitions)
2. Update `.devagent/core/AGENTS.md` (the workflow roster)
3. Update `.agents/commands/` (add/remove/rename command files)
4. Update `.cursor/commands/` symlinks: `rm .cursor/commands/<old-name>.md && ln -sf ../../.agents/commands/<new-name>.md .cursor/commands/<new-name>.md`
5. Update `.agents/commands/README.md` (command list)

## Key Principles

- **Dogfooding:** We use our own workflows to build DevAgent, ensuring they work in practice
- **Portability:** `.devagent/core/` is designed to be copied to any project
- **Separation:** Core (portable) vs. workspace (project-specific) keeps concerns clean
- **Command consistency:** Every workflow should have a matching command file

## Where to Find Things

- **Workflow documentation:** [`.devagent/core/AGENTS.md`](.devagent/core/AGENTS.md) — Complete workflow roster, usage patterns, sequencing
- **Workflow definitions:** `.devagent/core/workflows/*.md` — Individual workflow instruction sheets
- **Product mission:** `.devagent/workspace/product/mission.md` — What DevAgent is trying to achieve
- **Constitution:** `.devagent/workspace/memory/constitution.md` — Principles and guardrails
- **Command files:** `.agents/commands/*.md` — Standardized command interfaces

## Quick Reference

- **"How do I use workflows?"** → See [`.devagent/core/AGENTS.md`](.devagent/core/AGENTS.md)
- **"What workflows exist?"** → See [`.devagent/core/AGENTS.md`](.devagent/core/AGENTS.md) workflow roster
- **"How do I invoke a workflow?"** → Use `devagent [workflow-name]` or reference the workflow file (note: `devagent` is a workflow invocation convention in this environment, not a standalone CLI binary)
- **"Where do I put task work?"** → `.devagent/workspace/tasks/active/YYYY-MM-DD_task-slug/`
- **"Where are the portable workflows?"** → `.devagent/core/workflows/`
