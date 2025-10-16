# devagent

DevAgent coordinates a roster of specialized workflows that carry product ideas from mission alignment through research, specs, planning, and execution. The repo stores shared context, workflow briefs, and feature hubs so every hand-off stays traceable.

## Repository Structure

DevAgent separates **portable** tools (core) from **project-specific** artifacts (workspace):

- **`.devagent/core/`** - PORTABLE workflow kit with instruction sheets and templates. Copy to any project for 5-minute setup. See [core/README.md](.devagent/core/README.md) for setup guide.
- **`.devagent/workspace/`** - PROJECT-SPECIFIC mission, features, research, and decisions that evolve with your product.

This separation means you can **reuse the workflow system across projects** while keeping each product's context isolated.

## How the System Fits Together
- The update-product-mission workflow curates product direction inside `.devagent/workspace/product/` while referencing long-term guardrails in `.devagent/workspace/memory/overview.md` and `constitution.md`.
- The research and create-spec workflows work out of `.devagent/workspace/features/YYYY-MM-DD_feature-slug/` to keep discovery packets and specs co-located.
- The plan-tasks and execute-tasks workflows convert approved specs into backlogs and implementations under `.devagent/workspace/features/YYYY-MM-DD_feature-slug/tasks/`; all execution tracking happens via git commits and PR descriptions.
- The run-codegen-background-agent workflow transforms tasks into optimized prompts and creates workflow runs via the Codegen API for asynchronous execution.
- The parent `README.md` acts as the quick orientation surface; individual workflow briefs in `.devagent/core/workflows/` capture detailed workflows and filing rules.

## Directory Map

### Core (Portable Workflow Kit)
- `.devagent/core/workflows/` - Instruction sheets for each workflow (`research.md`, `create-spec.md`, `plan-tasks.md`, `execute-tasks.md`, `update-product-mission.md`, `run-codegen-background-agent.md`, etc.).
- `.devagent/core/templates/` - Reusable document templates for research packets, specs, task plans, and feature hubs.
- `.devagent/core/AGENTS.md` - Quick reference roster showing when to invoke each workflow.
- `.devagent/core/README.md` - Setup guide for initializing DevAgent in new projects.

### Workspace (Project-Specific Artifacts)
- `.devagent/workspace/product/` - Mission, roadmap, guiding questions, and other top-of-funnel product context.
- `.devagent/workspace/memory/` - Long-lived principles (`constitution.md`), decision journal, tech stack, and extended overview (`overview.md`).
- `.devagent/workspace/features/` - Active feature hubs; copy `.devagent/core/templates/feature-hub-template/` into a dated slug (e.g. `2025-09-30_feature-slug`) to start a new initiative and file research/spec artifacts with ISO dates.
- `.devagent/workspace/features/YYYY-MM-DD_feature-slug/tasks/` - Task packets and planning updates stored alongside the spec and research hub.
- `.devagent/workspace/research/` - Cross-cutting research that spans multiple features.

## Getting Started
1. **New to DevAgent?** See [.devagent/core/README.md](.devagent/core/README.md) for 5-minute setup instructions.
2. Review relevant workflow brief(s) in `.devagent/core/workflows/` before kicking off work.
3. For a new feature, copy `.devagent/core/templates/feature-hub-template/` into `.devagent/workspace/features/` with a dated slug (e.g. `$(date +%F)_feature-slug`) and follow the embedded research/spec guidance.
4. Keep artifacts date-prefixed and cross-link specs, tasks, and execution notes so downstream workflows have the full story.
5. When mission or guardrails change, update `.devagent/workspace/product/` and `.devagent/workspace/memory/` first, then notify affected feature hubs.
6. For background workflow execution, install Codegen CLI (`uv tool install codegen`), authenticate (`codegen login --token $CODEGEN_API_TOKEN`), and use `devagent deploy-codegen-agent` to create optimized workflow runs.

## Related Resources
- `.devagent/core/README.md` – Setup guide for initializing DevAgent in new projects (< 5 minutes).
- `.devagent/core/AGENTS.md` – Workflow roster showing when to invoke each workflow.
- `.devagent/workspace/memory/overview.md` – Explains the memory layering model and shared working agreements.
- `.devagent/core/templates/` – Reusable shells for research packets, specs, task plans, and more.
- Workflow instructions in `.devagent/core/workflows/` explain when to invoke `devagent update-product-mission`, `devagent research`, `devagent create-spec`, `devagent plan-tasks`, `devagent execute-tasks`, and `devagent run-codegen-background-agent`.
