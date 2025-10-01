# Simple vs Complex Feature Workflows Task Plan

- Owner: TaskPlanner (Codex)
- Last Updated: 2025-09-30
- Status: Draft — contingent on spec approval
- Related Spec: `.devagent/features/simple-vs-complex-feature-workflows/spec/2025-09-30_simple-vs-complex-feature-workflows.md`
- Reviewers: SpecArchitect (Spec), Jaruesink (Executing Developer)
- Notes: Keep backlog slices to five tasks or fewer; duplicate backlog sections as needed.
- File Location: `.devagent/features/simple-vs-complex-feature-workflows/tasks/2025-09-30_simple-vs-complex-feature-workflows-task-plan.md`

## Summary
Frame and deliver a dual-lane workflow that classifies feature work as Simple or Complex, accelerates low-risk execution, and preserves rigor for higher-risk initiatives. Planning emphasizes creating the intake checklist, codifying Simple lane guardrails, ensuring fast escalation, and aligning Complex lane hand-offs across DevAgent agents per the 2025-09-30 spec.

## Scope & Assumptions
- Scope focus: Process artifacts and agent guidance updates required to operationalize the Simple/Complex workflow inside the DevAgent CLI environment.
- Key assumptions:
  - Spec will be approved without structural changes before build begins; outstanding Draft items get resolved in parallel review.
  - A lightweight compliance contact is available to confirm the Simple lane checklist guardrails.
  - No new automation is required beyond templated markdown/log updates.
- Out of scope:
  - Building analytics dashboards or automated ticket integrations.
  - Changing core agent capabilities beyond documented invocation patterns.
  - Long-term retrospective rituals after initial rollout.

## Tasks
### Task 1
- Objective: Finalize intake & classification foundation so developers can reliably select a lane.
- Dependencies: #ResearchAgent for baseline metrics pull; compliance stakeholder (TBD) for checklist confirmation.
- Tasks:
  1. Intake checklist & template — Draft the intake prompt snippet and classification checklist aligning with "Intake & Classification" acceptance criteria; capture triggers and owner logging format. (Spec §Intake & Classification)
     - Acceptance: Checklist reviewed with compliance contact; stored alongside feature intake template in repo.
  2. Baseline metrics discovery task — Coordinate with #ResearchAgent to define baseline cycle time/rework sampling plan noted in Risks. (Spec §Context & Problem)
     - Acceptance: Research request filed with data fields, expected due date logged in feature hub.
  3. Classification logging approach — Define location and format for timestamped classification decisions and rationale. (Spec §Intake & Classification)
     - Acceptance: Logging workflow documented; dry-run example added to change log template.
- Validation plan: Run through one historical feature as a dry run to ensure checklist + logging captures decision path end-to-end.

### Slice 2
- Objective: Enable Simple lane execution with clear prompts, validation, and documentation flow.
- Dependencies: Executing developer for prompt vetting; existing TaskExecutor guidance.
- Tasks:
  1. Simple lane prompt template — Create a TaskExecutor invocation template capturing success criteria and rollback expectations. (Spec §Simple Lane Execution)
     - Acceptance: Template stored with feature assets; peer review confirms clarity.
  2. Lightweight validation checklist — Define smoke validation and rollback confirmation steps for Simple lane completions. (Spec §Simple Lane Execution)
     - Acceptance: Checklist appended to Simple lane runbook; validated via mock execution.
  3. Post-completion logging update — Extend change log format to include Simple lane outcome summary and follow-ups. (Spec §Simple Lane Execution)
     - Acceptance: Updated change log reviewed with executing developer; fields populated in example entry.
- Validation plan: Simulate a Simple lane feature using the new template; confirm documentation captures intake → execution → completion with no missing fields.

### Slice 3
- Objective: Solidify escalation mechanics and ensure Complex lane stays aligned across agents.
- Dependencies: SpecArchitect for risk handling expectations; #ProductMissionPartner and #TaskExecutor for hand-off confirmation.
- Tasks:
  1. Escalation trigger documentation — Detail the triggers and notification flow when Simple work reclassifies as Complex. (Spec §Escalation to Complex)
     - Acceptance: Escalation steps validated with stakeholders; async summary template drafted.
  2. Complex lane hand-off mapping — Map each agent engagement (ProductMissionPartner → ResearchAgent → SpecArchitect → TaskPlanner → TaskExecutor) with entry/exit criteria. (Spec §Complex Lane Delivery)
     - Acceptance: Hand-off table added to plan; reviewed with respective agent owners for gaps.
  3. Risk & open question owner alignment — Translate spec risk table into actionable follow-ups with assigned owners/dates. (Spec §Risks & Open Questions)
     - Acceptance: Owners acknowledge assignments; due dates logged in feature hub.
- Validation plan: Walk through hypothetical escalation case to ensure ownership and artifacts transition cleanly without dual workstreams.

### Slice 4
- Objective: Roll out workflow and monitor adoption once artifacts are in place.
- Dependencies: Feature hub maintainer for summary updates; compliance contact for audit notes.
- Tasks:
  1. Rollout communication package — Draft update summarizing new workflow, classification rules, and expected developer actions. (Spec §Summary & Objectives)
     - Acceptance: Communication shared with developer cohort; acknowledgment captured.
  2. Adoption tracking checklist — Define initial metrics capture (cycle time deltas, reclassification count) and review cadence. (Spec §Objectives & Success Metrics)
     - Acceptance: Tracking sheet created with baseline placeholders and owners.
  3. Post-launch review hooks — Specify checkpoints to revisit workflow after first month, including survey of developer clarity. (Spec §Objectives & Success Metrics)
     - Acceptance: Calendar reminders or backlog items logged; survey draft prepared.
- Validation plan: Confirm all communications, metrics trackers, and survey artifacts stored in feature hub; schedule retrospection review.

## Risks & Open Questions
| Item | Type | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Spec approval pending (currently Draft) | Risk | SpecArchitect | Confirm approval window or required edits before execution, update status in feature hub | 2025-10-01 |
| Compliance checklist validation | Question | Executing Developer | Identify compliance reviewer, secure sign-off on Simple lane guardrails | 2025-10-04 |
| Baseline metrics availability | Risk | #ResearchAgent | Provide initial cycle time/rework samples or flag data gaps | 2025-10-03 |
| Tooling support for logging | Risk | Executing Developer | Validate existing change log tooling; adjust or propose alternative | 2025-10-05 |
| Role mapping for escalations | Question | SpecArchitect | Clarify any additional stakeholders required when escalation occurs | 2025-10-02 |

## Decision Log (Optional)
| Date | Decision | Notes |
| --- | --- | --- |
| 2025-09-30 | Proceed with planning while spec is Draft | Pending approval; tasks include confirmation gate |

## Follow-ups & Hand-offs
- Reviewer requests: Confirm spec approval, compliance checklist sign-off, and hand-off mappings before TaskExecutor begins build tasks.
- Handoff summary: Executor should start with Slice 1 to ensure classification assets are ready, then progress sequentially; loop in respective agents as dependencies indicate.

## Change Log
| Date | Change | Author |
| --- | --- | --- |
| 2025-09-30 | Initial draft | Codex |
