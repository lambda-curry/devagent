# Decision Journal

Central log for mission-level and strategic decisions that should persist beyond individual task hubs. Each entry captures the context needed to understand why a change happened and who owns follow-up work.

## When to Use

Decision journal entries should be reserved for **significant strategic decisions**, including:

- **Mission-level strategic decisions:** Changes to product mission, vision, or core direction
- **Architecture or design pattern changes:** Fundamental shifts in how the system or workflows operate
- **Significant policy or process changes:** Updates to governance, principles, or operating models that affect multiple teams or long-term direction
- **Decisions that impact multiple teams or long-term direction:** Cross-cutting changes with broad organizational impact

## When NOT to Use

Do NOT create decision journal entries for routine maintenance or administrative updates:

- **Path corrections or file structure updates:** Fixing broken links, updating file paths, reorganizing directories
- **Date refreshes or administrative updates:** Updating review dates, refreshing timestamps, routine cadence updates
- **Bug fixes or minor corrections:** Fixing typos, correcting formatting, minor clarifications
- **Routine quarterly reviews without substantive changes:** Standard review cycles that don't result in new decisions or strategic shifts

For routine constitution maintenance (path corrections, date refreshes, administrative fixes), updating the Amendment Log in `constitution.md` is sufficient documentation—no decision journal entry is needed.

## How to Use

1. Add a new entry at the top with ISO date, facilitator/author, decision summary, impacted artifacts, and follow-up owners.
2. Link to supporting notes (task research packets, workshop transcripts, stakeholder approvals) so future readers can trace the rationale.
3. When a decision alters constitution clauses, record it here **and** create an Amendment Log entry in `constitution.md` (for substantive strategic changes only; routine maintenance only needs the Amendment Log).
4. Close the loop by tagging affected task hubs and notifying responsible agents.

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
