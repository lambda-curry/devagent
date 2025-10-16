# Workflow Roster

Workflows can be invoked when referenced with `devagent [workflow-name]` (for example, `devagent research`) or when their workflow file is mentioned (for example, `Research.md`)

## How to Think About Workflows

- Workflows are structured prompt sequences that run inside this environment; they are not separate people to schedule meetings with.
- You trigger a workflow by writing `devagent [workflow-name]` with required inputs; the response is the workflow run.
- The executing developer has standing approval to invoke any workflow immediately; if a review is needed, capture it in a log after the run instead of delaying execution.
- Provide all context and artifacts in the invocation, because workflows cannot gather it unless another workflow is tasked.
- You remain the coordinator: log decisions and move artifacts forward rather than expecting workflow-to-workflow conversations.
- Choose the lightest sequence that fits the work; simple enhancements can go straight to `devagent research` → `devagent execute-tasks`, while complex features chain through `devagent create-product-mission` → `devagent clarify-feature` → `devagent research` → `devagent architect-spec` → `devagent plan-tasks` → `devagent execute-tasks`.
- Choose the lightest sequence that fits the work; simple enhancements can go straight to `devagent research` → `devagent execute-tasks`, while complex features chain through `devagent create-product-mission` → `devagent brainstorm-features` → `devagent research` → `devagent architect-spec` → `devagent plan-tasks` → `devagent execute-tasks`.
- Workflows trigger manually—there is no background scheduler—so note any recurring reviews in change logs when you perform them.

## Workflows

- `devagent update-product-mission` — Co-creates the product mission and supporting assets. Utilize when product context or mission updates are needed. See `.devagent/core/workflows/update-product-mission.md`.
- `devagent clarify-feature` — Validates requirement completeness through structured clarification sessions. Utilize when feature ideas need validation before spec work, when specs have requirement gaps, or when requirements need completeness review. See `.devagent/core/workflows/clarify-feature.md`.
- `devagent brainstorm` — Facilitates structured ideation to generate, cluster, and prioritize feature candidates. Utilize when exploring solution spaces before research or when generating ideas from mission goals. See `.devagent/core/workflows/brainstorm.md`.
- `devagent research` — Maps open questions and gathers vetted references. Utilize when a new feature needs discovery or spec clarification. See `.devagent/core/workflows/research.md`.
- `devagent create-spec` — Synthesizes research into review-ready specs. Utilize when a spec draft or revision is required. See `.devagent/core/workflows/create-spec.md`.
- `devagent plan-tasks` — Breaks approved specs into sequenced, test-aware tasks. Utilize when planning implementation work. See `.devagent/core/workflows/plan-tasks.md`.
- `devagent execute-tasks` — Implements approved task packets with guardrails and validation. Utilize when tasks are ready for execution. See `.devagent/core/workflows/execute-tasks.md`.
- `devagent update-tech-stack` — Creates or updates comprehensive tech stack documentation by analyzing codebases and gathering developer context. Utilize when documenting technology choices for a new or existing project. See `.devagent/core/workflows/update-tech-stack.md`.
- `devagent build-workflow` — Designs high-quality agent prompts and instruction sheets that integrate with the DevAgent roster. Utilize when creating new agents or updating agent templates. See `.devagent/core/workflows/build-workflow.md`.
- `devagent run-codegen-background-agent` — Transforms task specs into optimized prompts and deploys them as background agents via Codegen API. Utilize when tasks can be executed asynchronously with external AI agents. See `.devagent/core/workflows/codegen/run-codegen-background-agent.md`.

## Workflow Naming Convention

Workflows follow a consistent `action-target` naming pattern for clarity and memorability. The action verb describes the primary function, and the target noun specifies the scope.

| Agent | Workflow Name | Rationale |
|-------|---------------|-----------|
| ProductMissionPartner | update-product-mission | Creates/updates product mission and assets |
| FeatureClarifyAgent | clarify-feature | Validates and clarifies feature requirements |
| FeatureBrainstormAgent | brainstorm | Generates and prioritizes feature ideas |
| ResearchAgent | research | Researches and gathers references for features |
| SpecArchitect | create-spec | Designs and synthesizes specifications |
| TaskPlanner | plan-tasks | Plans implementation tasks |
| TaskExecutor | execute-tasks | Executes approved task packets |
| TechStackAgent | update-tech-stack | Documents technology stack choices |
| AgentBuilder | build-workflow | Builds new agent prompts and templates |
| CodegenBackgroundAgent | run-codegen-background-agent | Deploys codegen agents asynchronously |
