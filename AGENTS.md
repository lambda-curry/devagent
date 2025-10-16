# Agent Roster — DevAgent Project

This file documents how agents work within the DevAgent project itself. For the portable agent kit that can be copied to other projects, see `.devagent/core/AGENTS.md`.

## Project Context

DevAgent is a development workspace system that uses AI agents to coordinate product work, research, specifications, and implementation. This project uses its own agent system to develop itself.

**Key workspace locations:**
- `.devagent/workspace/product/` — Mission, roadmap, and guiding questions for DevAgent
- `.devagent/workspace/features/` — Active and completed features with research, specs, and tasks
- `.devagent/workspace/research/` — General research artifacts
- `.devagent/workspace/memory/` — Constitution, decision journal, and tech stack
- `.devagent/core/` — Portable agent kit (templates, agent definitions)

## How Agents Work in This Project

Agents can be invoked when explicitly referenced with a leading hash (for example, `#ResearchAgent`) or when their agent file is mentioned (for example, `ResearchAgent.md`).

**Working with DevAgent features:**
- When developing new DevAgent capabilities, use the full workflow: #ProductMissionPartner → #FeatureClarifyAgent → #ResearchAgent → #SpecArchitect → #TaskPlanner
- For agent template updates or improvements to existing agents, use: #ResearchAgent → #SpecArchitect
- For documentation updates or small fixes, use: #ResearchAgent (quick workflow)

**Project-specific patterns:**
- All feature work is tracked in `.devagent/workspace/features/` with dated folders
- Research packets reference the constitution (`.devagent/workspace/memory/constitution.md`) for alignment
- Specs follow the template at `.devagent/core/templates/spec-document-template.md`
- Task plans break down specs into implementation packets
- Completed features move to `.devagent/workspace/features/completed/`

**Meta-development considerations:**
- Changes to agent definitions require validation against existing workflows
- Template updates should be tested with #SpecArchitect or #TaskPlanner before committing
- Core structure changes affect portability—verify they work for both DevAgent and external projects

## Workflows

- #ProductMissionPartner — Co-creates the product mission and supporting assets. Utilize when product context or mission updates are needed. See `.devagent/core/agents/ProductMissionPartner.md`.
- #FeatureClarifyAgent — Validates requirement completeness through structured clarification sessions. Utilize when feature ideas need validation before spec work, when specs have requirement gaps, or when requirements need completeness review. See `.devagent/core/agents/FeatureClarifyAgent.md`.
- #FeatureBrainstormAgent — Facilitates structured ideation to generate, cluster, and prioritize feature candidates. Utilize when exploring solution spaces before research or when generating ideas from mission goals. See `.devagent/core/agents/FeatureBrainstormAgent.md`.
- #ResearchAgent — Maps open questions and gathers vetted references. Utilize when a new feature needs discovery or spec clarification. See `.devagent/core/agents/ResearchAgent.md`.
- #SpecArchitect — Synthesizes research into review-ready specs. Utilize when a spec draft or revision is required. See `.devagent/core/agents/SpecArchitect.md`.
- #TaskPlanner — Breaks approved specs into sequenced, test-aware tasks. Utilize when planning implementation work. See `.devagent/core/agents/TaskPlanner.md`.

- #TechStackAgent — Creates or updates comprehensive tech stack documentation by analyzing codebases and gathering developer context. Utilize when documenting technology choices for a new or existing project. See `.devagent/core/agents/TechStackAgent.md`.
- #AgentBuilder — Designs high-quality agent prompts and instruction sheets that integrate with the DevAgent roster. Utilize when creating new agents or updating agent templates. See `.devagent/core/agents/AgentBuilder.md`.
- #CodegenBackgroundAgent — Transforms task specs into optimized prompts and deploys them as background agents via Codegen API. Utilize when tasks can be executed asynchronously with external AI agents. See `.devagent/core/agents/codegen/CodegenBackgroundAgent.md`.
