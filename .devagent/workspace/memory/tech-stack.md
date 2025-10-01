# Tech Stack (DevAgent)

This documents the technology stack for the DevAgent repository. Refer to `.devagent/memory/tech-stack-template.md` for the canonical template structure.

## Context

DevAgent is a meta-development system that coordinates specialized AI agents for product planning, research, specification, and task execution. It's repository-based, tool-agnostic, and designed to work with any AI coding assistant (Cursor, Codegen, GitHub Copilot, etc.).

## Core Stack

### Application Framework & Runtime
- Format: Markdown-based agent workflows
- Language: Markdown for documentation, supports Python/TypeScript/any language for target projects
- Runtime: Runs in any AI coding assistant environment (Cursor, Codegen, etc.)
- Package manager: Tool-specific (target projects may use npm, pip, uv, etc.)

### Build & Development Tools
- Monorepo tooling: N/A (single repository structure)
- Build tool: N/A (documentation-driven)
- Module system: File-based agent composition

### Agent Orchestration
- Agent framework: Custom markdown-based agent briefs
- Agent coordination: Manual trigger via hash references (e.g., `#ResearchAgent`, `#TaskExecutor`)
- Agent roster: Defined in `AGENTS.md` and `.devagent/agents/` directory
- Background execution: Codegen API via `#CodegenBackgroundAgent`

### Data & State Management
- State storage: Git repository (commits, branches, PRs)
- Memory system: `.devagent/memory/` (constitution, overview, decision journal)
- Feature state: `.devagent/features/YYYY-MM-DD_feature-slug/` folders
- Context persistence: Markdown files with ISO date prefixes

### Documentation & Templates
- Agent briefs: Markdown following `.devagent/templates/agent-brief-template.md`
- Feature templates: `.devagent/features/_template/`
- Spec documents: `.devagent/templates/spec-document-template.md`
- Task planning: `.devagent/templates/task-plan-template.md`

### Quality & Validation
- Testing: Agent validation through execution and user feedback
- Review process: Human-in-the-loop approval gates
- Constitution enforcement: `.devagent/memory/constitution.md`
- Decision tracking: `.devagent/memory/decision-journal.md`

### External Integrations
- AI/LLM: Tool-agnostic (works with any AI coding assistant)
- Background execution: Codegen API for async agent runs
- CLI tools: `uv` for Python package management, `codegen` CLI for API access
- Version control: Git and GitHub for all state and coordination

## Product Capabilities

DevAgent enables:
- **Structured product planning** via `#ProductMissionPartner`
- **Feature ideation** via `#FeatureBrainstormAgent`
- **Requirement validation** via `#FeatureClarifyAgent`
- **Research coordination** via `#ResearchAgent`
- **Spec creation** via `#SpecArchitect`
- **Task decomposition** via `#TaskPlanner`
- **Implementation execution** via `#TaskExecutor`
- **Background agent deployment** via `#CodegenBackgroundAgent`
- **Agent creation** via `#AgentBuilder`

## Constraints & Requirements

Technical and design principles:
- **Tool-agnostic**: Must work with any AI coding assistant (Cursor, Codegen, GitHub Copilot, etc.)
- **Repository-based**: All state lives in Git, no external databases
- **Markdown-first**: Human-readable, version-controlled documentation
- **Date-prefixed artifacts**: ISO dates for chronological organization
- **Manual triggers**: Explicit agent invocation via hash references
- **Traceable hand-offs**: Clear input/output contracts between agents
- **Constitution-aligned**: All agent actions respect `.devagent/memory/constitution.md`

## Future Integrations (Roadmap)

Planned additions:
- **Multi-agent orchestration**: Parallel and sequential agent execution patterns
- **Metrics dashboard**: Observability for agent performance and outcomes
- **Template versioning**: Structured evolution of agent briefs and templates
- **Cross-project memory**: Shared learnings across multiple codebases

## Architecture Decisions

Why key approaches were chosen:

- **Markdown-based agents**: Enables version control, human readability, and tool portability. Any AI assistant can read and execute agent briefs without custom tooling.

- **File-based state**: Git provides natural versioning, branching, and collaboration primitives. No separate database or service layer needed.

- **Hash-triggered invocation**: Explicit `#AgentName` syntax makes agent coordination transparent and searchable in conversation history.

- **Dated feature folders**: ISO date prefixes (`YYYY-MM-DD_feature-slug`) enable chronological browsing and automatic sorting without metadata.

- **Tool-agnostic design**: Nested tool-specific agents (`.devagent/agents/codegen/`) allow specialized integrations while keeping core workflows portable.

- **Constitution-first**: Central principles in `.devagent/memory/constitution.md` ensure consistent behavior across all agents and features.

---

**Tech Stack Version**: 1.0  
**Last Updated**: 2025-10-01

