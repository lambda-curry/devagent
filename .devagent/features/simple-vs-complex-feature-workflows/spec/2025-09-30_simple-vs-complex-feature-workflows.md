# Simple vs Complex Feature Workflows

- Owner: SpecArchitect (DRI TBD)
- Last Updated: 2025-09-30
- Status: Draft
- Related Feature Hub: `.devagent/features/simple-vs-complex-feature-workflows/`
- Stakeholders: Jaruesink (Executing Developer, Default Owner); note any additional roles in the change log when they become relevant

## Summary
Create a two-lane delivery workflow that automatically treats incoming requests as Simple or Complex, preserving rigor for high-risk initiatives while allowing low-risk enhancements to ship quickly. The framework centers a single developer invoking DevAgent agents, defines objective escalation triggers, and documents the handoffs among DevAgent agents.

## Context & Problem
Every feature request currently routes through the full complex workflow, regardless of scope. The result is bottlenecks for small changes, frustration from developers needing only prompt support, and inconsistent use of downstream agents. Recent lightweight check-ins with the executing developer highlight missed opportunities to ship small wins quickly. We lack a formal research packet or baseline metrics, so capturing current cycle times and rework rates is a priority follow-up.

## Objectives & Success Metrics
- Reduce median cycle time for features classified as Simple by at least 30% versus today (baseline to be captured).
- Maintain or improve rework rate (<5% of Simple lane work requiring reclassification post-start).
- Achieve 100% clarity for the executing developer on when to involve ProductMissionPartner, ResearchAgent, and SpecArchitect (self-reported survey after first month).
- Track governance decisions for every Complex classification in the spec change log.

## Users & Insights
Primary users are developers initiating feature work and directly coordinating downstream agents. Early insights (informal execution debriefs) show developers want the ability to move fast on low-risk updates while trusting that larger changes will still be shepherded through a rigorous process. A quick follow-up with whoever owns compliance ensures Simple changes stay within guardrails.

## Solution Principles
- Default to the lightweight Simple lane unless clear triggers mark the work as Complex.
- Transparency first: document classification decisions and handoffs for auditability.
- Keep Simple lane artifact requirements minimal (prompt + execution checklist) to avoid ceremony.
- Ensure Complex lane remains thorough, integrating all relevant agents and checkpoints.
- Escalation must be fast: the executing developer or anyone involved in the work can flag risks that move work into the Complex lane.
- Make minimal assumptions about delivery rituals; when workflows depend on sprints, QA roles, or stakeholder cadences, document the assumption and point to the source agent guide for confirmation.

## Scope Definition
- **In Scope:** Classification rules, workflows for Simple and Complex lanes, agent invocation guidelines, governance model, success metrics, and rollout plan for adoption.
- **In Scope:** Classification rules, workflows for Simple and Complex lanes, agent invocation guidelines, governance model, success metrics, rollout plan for adoption, and audit requirements for agent guides to default to single-developer execution.
- **Out of Scope / Future:** Automated tooling changes, analytics dashboard implementation beyond definition, integration with external ticketing systems, and retrospective process updates after launch.

## Functional Narrative

### Intake & Classification
- Trigger: Developer or product lead identifies a feature need.
- Experience narrative: Submit a short intake snippet capturing goal, impact, and perceived risk. Apply the classification checklist (impact size, cross-team dependencies, compliance touchpoints, and irreversible changes). Default to Simple unless any trigger is true.
- Acceptance criteria:
  - Checklist stored with the work item.
  - If any Complex trigger is checked, move to Complex lane within same session.
  - Classification decision logged with timestamp and owner.

### Simple Lane Execution
- Trigger: Intake classified as Simple.
- Experience narrative: Developer crafts a clear implementation prompt, optionally consults lightweight design/accessibility notes, then invokes #TaskExecutor with prompt plus acceptance checks. The executing developer runs smoke validation and notes any additional validation that occurs. No spec is produced; work is logged in lightweight change log.
- Acceptance criteria:
  - Checklist confirms no compliance or cross-team impacts.
  - #TaskExecutor prompt includes success criteria and rollback plan.
  - Post-completion note records outcome, validation performed, and any follow-up.

### Escalation to Complex
- Trigger: New information surfaces (scope creep, risk, outside request) during Simple execution.
- Experience narrative: Developer pauses execution, documents the trigger in the change log, and notes whether another person needs to weigh in. The executing developer confirms reclassification or records who did so. Work transitions to Complex lane, carrying forward gathered context.
- Acceptance criteria:
  - Escalation logged with reason and approver.
  - Stakeholders notified via async summary.
  - No work continues in Simple lane after escalation decision.

### Complex Lane Delivery
- Trigger: Intake flagged as Complex or escalated from Simple.
- Experience narrative: Follow full workflow—ProductMissionPartner validates mission context, #ResearchAgent fills evidence gaps, #SpecArchitect drafts spec using template, #TaskPlanner sequences work, #TaskExecutor builds with acceptance validation. The executing developer remains the default decision-maker, inviting additional reviewers only when required for the scope.
- Acceptance criteria:
  - Spec stored at `.devagent/features/<slug>/spec/YYYY-MM-DD_<descriptor>.md`.
  - Risks & Open Questions populated with owners.
  - Task plan produced before build.
  - Final summary circulated with decision log update.

## Experience References (Optional)
- Placeholder: create lightweight flow diagram showing Simple vs Complex path. (Owner TBD.)

## Technical Notes & Dependencies (Optional)
- Need simple classification checklist template stored alongside spec.
- Ensure automation or scripts (if any) reference existing agent invocation patterns.
- Confirm compatibility with current DevAgent CLI prompts.

## Governance & Auditing
- Maintain an audit log of assumptions and their status in `.devagent/governance/assumptions.md` (create if missing).
- Review AGENTS.md and each agent guide every two months for implicit team-structure assumptions; default recommendations must support a solo developer, with any extra roles documented as explicit exceptions.
- Document deviations from the single-developer default alongside the relevant agent guide and link back here.

## Risks & Open Questions
| Item | Type (Risk / Question) | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Baseline cycle time/rework metrics missing | Question | #ResearchAgent | Pull recent cycle-time samples and summarize | 2025-10-03 |
| Compliance checklist for Simple lane unclear | Question | Execution Owner (default: developer) | Draft low-risk validation checklist and route to any compliance stakeholder if required | 2025-10-04 |
| Role mapping needs clarity | Question | Executing Developer | Document any additional roles that must be noted and when to involve them | 2025-10-02 |
| Tooling support for classification logging | Risk | Execution Owner | Evaluate if current tracking tools suffice; propose lightweight log | 2025-10-05 |
| Delivery assumptions tied to agile sprints and specific roles | Risk | SpecArchitect | Audit agent docs for implicit assumptions; update spec and guides with neutral language | 2025-10-06 |

## Delivery Plan (Optional)
- Within 3 days of spec approval: Finalize classification rules and gather missing data.
- Within 1 week of the first production use: Review draft spec against real usage feedback and capture adjustments.
- After two Simple-lane executions: Pilot retro to confirm metrics collection and lane clarity.
- Before fourth Complex-lane engagement: Publish documentation update and optional walkthrough.

## Approval & Ops Readiness (Optional)
- Default approval rests with the executing developer.
- If additional approvals are needed, capture the confirmations alongside the change log.
- Update onboarding docs and AGENTS.md references to new workflow before rollout.

## Appendices & References (Optional)
- TBD: add link to execution feedback summary once compiled.
- TBD: include checklist template path.

## Change Log
| Date | Change | Author |
| --- | --- | --- |
| 2025-09-30 | Initial draft | SpecArchitect (via Codex) |
| 2025-09-30 | Removed role-specific assumptions and added execution-focused defaults | Codex |
