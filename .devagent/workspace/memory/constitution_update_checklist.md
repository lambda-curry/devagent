# Constitution Update Checklist

Follow this workflow whenever you introduce, edit, or retire a constitution clause.

## 1. Capture the Proposal
- Summarize the change (purpose, clause IDs, triggering event) in a dated research note under `.devagent/workspace/tasks/<task>/research/` or `.devagent/workspace/research/drafts/`.
- Link to the source signal (mission update, regulatory change, incident review).

## 2. Validate Alignment
- Re-read `.devagent/product/mission.md` and the existing constitution clauses to confirm the change supports current direction.
- Check whether existing clauses already cover the scenario; prefer amendments over duplicates.

## 3. Impact Sweep
- **Feature hubs:** List hubs impacted by the change and notify their owners.
- **Agent briefs:** Identify any steps or resources that need edits (ResearchAgent, SpecArchitect, TaskPlanner, Executor).
- **Tasks:** Flag in-flight tasks that require updated acceptance criteria.

## 4. Decide & Document
- Secure steward approval(s) listed in the clause entries.
- Update `constitution.md` and append an entry to the `Amendment Log`; rely on git history for previous versions.

## 5. Broadcast & Follow-up
- Announce the update in the shared channel with a link to the change summary.
- Schedule the next review date in the Clause Directory.
- Ensure ResearchAgent incorporates the new guidance in upcoming packets.
