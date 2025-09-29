# Decision Journal

Central log for mission-level and strategic decisions that should persist beyond individual feature hubs. Each entry captures the context needed to understand why a change happened and who owns follow-up work.

## How to Use

1. Add a new entry at the top with ISO date, facilitator/author, decision summary, impacted artifacts, and follow-up owners.
2. Link to supporting notes (feature research packets, workshop transcripts, stakeholder approvals) so future readers can trace the rationale.
3. When a decision alters constitution clauses, record it here **and** create an Amendment Log entry in `constitution.md`.
4. Close the loop by tagging affected feature hubs and notifying responsible agents.

## Entry Template

```
## 2025-09-29 — Mission Reset Workshop
- Facilitator(s): ProductMissionPartner, ResearchAgent
- Decision: Reframed mission narrative around agentic prompt suite adoption for Lambda Curry teams.
- Artifacts updated: `.devagent/product/mission.md`, `.devagent/product/roadmap.md`, `.devagent/product/guiding-questions.md`
- Follow-up owners: ResearchAgent (measurement signals), TaskPlanner (pilot rollout tasks)
- Related clauses: C1, C3
- Notes: Link to workshop recording and research appendices.
```

Start each new entry with `## YYYY-MM-DD — <Title>` so history remains chronological when rendered.
