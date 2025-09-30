# Agent Roster

Agents should only be invoked when explicitly referenced with a leading hash (for example, `#ResearchAgent`).

## How to Think About Agents

- Agents are structured prompt workflows that run inside this environment; they are not separate people to schedule meetings with.
- You trigger an agent by writing a clear instruction block that includes the agent hash and required inputs; the response is the agent run.
- Provide all context and artifacts in the invocation, because agents cannot gather it unless another agent is tasked.
- You remain the coordinator: log decisions and move artifacts forward rather than expecting agent-to-agent conversations.
- Choose the lightest sequence that fits the work; simple enhancements can go straight to #ResearchAgent → #TaskExecutor, while complex features chain through #ProductMissionPartner → #ResearchAgent → #SpecArchitect → #TaskPlanner → #TaskExecutor.
- Workflows trigger manually—there is no background scheduler—so note any recurring reviews in change logs when you perform them.

## Agents

- #ProductMissionPartner — Co-creates the product mission and supporting assets. Utilize when product context or mission updates are needed. See `.devagent/agents/ProductMissionPartner.md`.
- #ResearchAgent — Maps open questions and gathers vetted references. Utilize when a new feature needs discovery or spec clarification. See `.devagent/agents/ResearchAgent.md`.
- #SpecArchitect — Synthesizes research into review-ready specs. Utilize when a spec draft or revision is required. See `.devagent/agents/SpecArchitect.md`.
- #TaskPlanner — Breaks approved specs into sequenced, test-aware tasks. Utilize when planning implementation work. See `.devagent/agents/TaskPlanner.md`.
- #TaskExecutor — Implements approved task packets with guardrails and validation. Utilize when tasks are ready for execution. See `.devagent/agents/TaskExecutor.md`.
