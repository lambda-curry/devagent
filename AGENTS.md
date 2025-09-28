# Agent Roster

Agents should only be invoked when explicitly referenced with a leading hash (for example, `#ResearchAgent`).

- #ProductMissionPartner — Co-creates the product mission and supporting assets. Utilize when product context or mission updates are needed. See `.devagent/agents/ProductMissionPartner.md`.
- #ResearchAgent — Maps open questions and gathers vetted references. Utilize when a new feature needs discovery or spec clarification. See `.devagent/agents/ResearchAgent.md`.
- #SpecArchitect — Synthesizes research into review-ready specs. Utilize when a spec draft or revision is required. See `.devagent/agents/SpecArchitect.md`.
- #TaskPlanner — Breaks approved specs into sequenced, test-aware tasks. Utilize when planning implementation work. See `.devagent/agents/TaskPlanner.md`.
- #Executor — Implements planned tasks with guardrails and validation. Utilize when tasks are ready for execution. See `.devagent/agents/Executor.md`.

