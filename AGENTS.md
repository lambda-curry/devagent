# Agent Roster

Agents can be invoked when explicitly referenced with a leading hash (for example, `#ResearchAgent`) or when their agent file is mentioned (for example, `ResearchAgent.md`)

## How to Think About Agents

- Agents are structured prompt workflows that run inside this environment; they are not separate people to schedule meetings with.
- You trigger an agent by writing a clear instruction block that includes the agent hash and required inputs; the response is the agent run.
- The executing developer has standing approval to invoke any agent immediately; if a review is needed, capture it in a log after the run instead of delaying execution.
- Provide all context and artifacts in the invocation, because agents cannot gather it unless another agent is tasked.
- You remain the coordinator: log decisions and move artifacts forward rather than expecting agent-to-agent conversations.
- Choose the lightest sequence that fits the work; simple enhancements can go straight to #ResearchAgent → #TaskExecutor, while complex features chain through #ProductMissionPartner → #FeatureClarifyAgent → #ResearchAgent → #SpecArchitect → #TaskPlanner → #TaskExecutor.
- Choose the lightest sequence that fits the work; simple enhancements can go straight to #ResearchAgent → #TaskExecutor, while complex features chain through #ProductMissionPartner → #FeatureBrainstormAgent → #ResearchAgent → #SpecArchitect → #TaskPlanner → #TaskExecutor.
- Workflows trigger manually—there is no background scheduler—so note any recurring reviews in change logs when you perform them.

## Workflow Triggers

You can initiate agent workflows using natural trigger phrases. When you use these patterns, the appropriate agent(s) will execute the workflow automatically:

### Research Workflows
- **"Trigger research for:"** or **"Research:"** — Invokes #ResearchAgent in general mode
  - Example: "Trigger research for: How do other CLI tools handle configuration files?"
  - Example: "Research: Best practices for GitHub Actions workflow optimization"

### Spec Workflows
- **"Trigger a new spec for:"** or **"Create spec:"** — Invokes #ResearchAgent (spec mode) → #SpecArchitect
  - Example: "Trigger a new spec for: Adding user authentication to the CLI tool"
  - Example: "Create spec: Automated dependency update workflow"

### Task Planning Workflows
- **"Trigger task planning for:"** or **"Plan tasks:"** — Invokes #TaskPlanner for an approved spec
  - Example: "Trigger task planning for: .devagent/workspace/features/2025-01-15_auth/spec/2025-01-15_auth-spec.md"
  - Example: "Plan tasks: The authentication spec we just completed"

### Feature Development Workflows
- **"Trigger full feature workflow for:"** or **"Start feature:"** — Invokes complete workflow chain
  - Example: "Trigger full feature workflow for: Adding export functionality to reports"
  - Flow: #ProductMissionPartner → #FeatureClarifyAgent → #ResearchAgent → #SpecArchitect → #TaskPlanner → #TaskExecutor

### Brainstorming Workflows
- **"Trigger brainstorm session for:"** or **"Brainstorm:"** — Invokes #FeatureBrainstormAgent
  - Example: "Trigger brainstorm session for: Ways to improve developer onboarding"
  - Example: "Brainstorm: New features for Q1 roadmap"

### Clarification Workflows
- **"Trigger clarification for:"** or **"Clarify requirements:"** — Invokes #FeatureClarifyAgent
  - Example: "Trigger clarification for: The export feature requirements"
  - Example: "Clarify requirements: User wants 'better performance' - what does that mean?"

### Implementation Workflows
- **"Trigger implementation:"** or **"Execute task:"** — Invokes #TaskExecutor
  - Example: "Trigger implementation: task-2-5 from the auth feature task plan"
  - Example: "Execute task: Add validation to login form"

### Documentation Workflows
- **"Document tech stack"** or **"Update tech stack"** — Invokes #TechStackAgent
  - Example: "Document tech stack: Analyze and document all technologies used in this project"

### Quick Workflows (Lightweight)
- **"Quick research and implement:"** — Invokes #ResearchAgent → #TaskExecutor (skips formal spec)
  - Example: "Quick research and implement: Add --version flag to CLI"
  - Use for: Small enhancements, bug fixes, minor improvements

## Agents

- #ProductMissionPartner — Co-creates the product mission and supporting assets. Utilize when product context or mission updates are needed. See `.devagent/core/agents/ProductMissionPartner.md`.
- #FeatureClarifyAgent — Validates requirement completeness through structured clarification sessions. Utilize when feature ideas need validation before spec work, when specs have requirement gaps, or when requirements need completeness review. See `.devagent/core/agents/FeatureClarifyAgent.md`.
- #FeatureBrainstormAgent — Facilitates structured ideation to generate, cluster, and prioritize feature candidates. Utilize when exploring solution spaces before research or when generating ideas from mission goals. See `.devagent/core/agents/FeatureBrainstormAgent.md`.
- #ResearchAgent — Maps open questions and gathers vetted references. Utilize when a new feature needs discovery or spec clarification. See `.devagent/core/agents/ResearchAgent.md`.
- #SpecArchitect — Synthesizes research into review-ready specs. Utilize when a spec draft or revision is required. See `.devagent/core/agents/SpecArchitect.md`.
- #TaskPlanner — Breaks approved specs into sequenced, test-aware tasks. Utilize when planning implementation work. See `.devagent/core/agents/TaskPlanner.md`.
- #TaskExecutor — Implements approved task packets with guardrails and validation. Utilize when tasks are ready for execution. See `.devagent/core/agents/TaskExecutor.md`.
- #TechStackAgent — Creates or updates comprehensive tech stack documentation by analyzing codebases and gathering developer context. Utilize when documenting technology choices for a new or existing project. See `.devagent/core/agents/TechStackAgent.md`.
- #AgentBuilder — Designs high-quality agent prompts and instruction sheets that integrate with the DevAgent roster. Utilize when creating new agents or updating agent templates. See `.devagent/core/agents/AgentBuilder.md`.
- #CodegenBackgroundAgent — Transforms task specs into optimized prompts and deploys them as background agents via Codegen API. Utilize when tasks can be executed asynchronously with external AI agents. See `.devagent/core/agents/codegen/CodegenBackgroundAgent.md`.
