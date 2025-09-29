# Memory Layering

A shared memory surface keeps long-lived principles, active feature context, and day-to-day execution notes aligned. Use this directory to anchor the durable layer that informs feature hubs and downstream tasks.

## Layer Stack

1. **Constitution (long-term guardrails):** Captures the non-negotiable principles and operating constraints for the product org. Update sparingly and version changes explicitly.
2. **Feature Hubs (mid-term initiatives):** Each hub in `.devagent/features/` references the constitution and pulls forward the clauses that matter for its scope. Chronological filenames (`YYYY-MM-DD_<slug>.md`) show how thinking evolved.
3. **Run Logs & Tasks (short-term execution):** `.devagent/tasks/` and sprint notes record daily actions. When a log uncovers a new rule or breaks an existing one, promote the learning back into the constitution or relevant feature hub.

## Governance Routines

- **Quarterly review:** Confirm the constitution still matches live mission, principles, and compliance requirements. Note changes in `constitution_update_checklist.md`.
- **Feature kickoff:** When spinning up a new feature hub, copy the "Constitution Clauses to Watch" section into the hub README and add date-stamped research/spec files.
- **Incident or discovery spike:** If research reveals conflicting guidance, log the gap in the feature hub, escalate via ResearchAgent, and schedule a constitution review.

## Directory Contents

- `constitution.md` — canonical guardrails and clauses with owners, review cadence, and traceability notes.
- `decision-journal.md` — running log of mission-level decisions tied back to feature hubs and clause updates.
- `constitution_update_checklist.md` — quick workflow to evaluate proposed changes and notify downstream agents.
- `README.md` (this file) — explains how the memory layer fits with feature hubs and chronological artifacts.

## Working Agreements

- Call out cross-links at the end of every research/spec artifact (e.g. `Related Clauses: C1, C3`).
- When a clause changes, append a dated entry to the `Amendment Log` in `constitution.md` and ping affected feature hub owners.
- Archive superseded constitution versions under `.devagent/memory/_archive/YYYY-MM-DD/` before committing updates to keep history accessible.
