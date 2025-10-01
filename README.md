# devagent

DevAgent coordinates a roster of specialized agents that carry product ideas from mission alignment through research, specs, planning, and execution. The repo stores shared context, agent briefs, and feature hubs so every hand-off stays traceable.

## How the System Fits Together
- ProductMissionPartner curates product direction inside `.devagent/product/` while referencing long-term guardrails in `.devagent/memory/overview.md` and `constitution.md`.
- ResearchAgent and SpecArchitect work out of `.devagent/features/YYYY-MM-DD_feature-slug/` to keep discovery packets and specs co-located.
- TaskPlanner and TaskExecutor convert approved specs into backlogs and implementation logs under `.devagent/features/YYYY-MM-DD_feature-slug/tasks/` and `.devagent/execution/`.
- CodegenBackgroundAgent transforms tasks into optimized prompts and creates agent runs via the Codegen API for asynchronous execution.
- The parent `README.md` acts as the quick orientation surface; individual agent briefs capture detailed workflows and filing rules.

## Directory Map
- `.devagent/agents/` - playbooks for each agent (`ResearchAgent.md`, `SpecArchitect.md`, `TaskPlanner.md`, `TaskExecutor.md`, `ProductMissionPartner.md`, `CodegenBackgroundAgent.md`, etc.).
- `.devagent/product/` - mission, roadmap, guiding questions, and other top-of-funnel product context.
- `.devagent/memory/` - long-lived principles (`constitution.md`), decision journal, and extended overview (`overview.md`).
- `.devagent/features/` - active feature hubs; copy `_template/` into a dated slug (e.g. `2025-09-30_feature-slug`) to start a new initiative and file research/spec artifacts with ISO dates.
- `.devagent/features/YYYY-MM-DD_feature-slug/tasks/` - task packets and planning updates stored alongside the spec and research hub.
- `.devagent/execution/` - implementation logs and retrospectives linked back to feature hubs.
- `.devagent/features/_archive/` - optional history for shipped or paused initiatives, organized by year and feature slug.

## Getting Started
1. Review relevant agent brief(s) in `.devagent/agents/` before kicking off work.
2. For a new feature, duplicate `.devagent/features/_template/` into a dated, slugged folder (e.g. `$(date +%F)_feature-slug`) and follow the embedded research/spec guidance.
3. Keep artifacts date-prefixed and cross-link specs, tasks, and execution notes so downstream agents have the full story.
4. When mission or guardrails change, update `.devagent/product/` and `.devagent/memory/` first, then notify affected feature hubs.
5. For background agent execution, install Codegen CLI (`uv tool install codegen`), authenticate (`codegen login --token $CODEGEN_API_TOKEN`), and use `#CodegenBackgroundAgent` to create optimized agent runs.

## Related Resources
- `.devagent/memory/overview.md` – explains the memory layering model and shared working agreements.
- `.devagent/templates/` – reusable shells for agent briefs and supporting docs (if populated).
- Agent roster instructions in `.devagent/agents/` explain when to involve #ProductMissionPartner, #ResearchAgent, #SpecArchitect, #TaskPlanner, #TaskExecutor, and #CodegenBackgroundAgent.
