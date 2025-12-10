# Simplify Workflow: Create-Plan + Remove Spec Progress Tracker

- Owner: Jake Ruesink
- Last Updated: 2025-12-10
- Status: Completed
- Feature Hub: `.devagent/workspace/features/active/2025-12-10_simplify-workflow-create-plan/`

## Summary

Evaluate the cost-benefit of the `create-spec` workflow and explore consolidating spec generation into a unified `create-plan` workflow. This streamlines the workflow roster by removing redundant spec-generation steps and moving directly from research to actionable task planning.

## Mission Link

Relates to `.devagent/workspace/product/mission.md` — specifically the goal of packaging prompts and guardrails that teams can adopt incrementally while preserving delivery rhythms and shared standards.

## Key Decisions

- [2025-12-10] Decision: Scope this as a workflow refactoring effort, not a product feature. Will use `devagent research` → `devagent build-workflow` to design the new `create-plan` workflow and document rationale for removing `create-spec`.

## Progress Log

- [2025-12-10] Event: Feature hub scaffolded. Initial context gathered from constitution (C3: Delivery Principles) and mission. Ready to begin research phase.
- [2025-12-10] Event: Research complete. Recommendation: proceed with Option A (consolidate into unified create-plan workflow). See `research/2025-12-10_workflow-consolidation-analysis.md`.
- [2025-12-10] Event: Build-Workflow executed. Created:
  - New `create-plan.md` workflow at `.devagent/core/workflows/create-plan.md`
  - Unified `plan-document-template.md` at `.devagent/core/templates/plan-document-template.md`
  - Updated `.devagent/core/AGENTS.md` with new workflow roster (replaced create-spec and plan-tasks with create-plan)
  - Deleted obsolete workflows (no archives, no deprecation)
  - Added C5 (Evolution Without Backwards Compatibility) to constitution

## Implementation Checklist

- [x] **Research:** Analyze current `create-spec` and `plan-tasks` workflows to identify overlaps and design the unified `create-plan` workflow.
- [x] **Design:** Draft the new `create-plan` workflow specification.
- [x] **Deprecation Plan:** Document the retirement path for `create-spec` and update downstream workflow recommendations.
- [x] **Update AGENTS.md:** Revise `.devagent/core/AGENTS.md` to remove `create-spec` and add `create-plan`.
- [x] **Build Workflow:** Implement the `create-plan.md` workflow in `.devagent/core/workflows/`.
- [x] **Constitution Update:** Added C5 (Evolution Without Backwards Compatibility) establishing forward-only evolution model.

## Open Questions

- Should `create-plan` generate a spec-like artifact (for review) or go directly to task prompts?
- What feedback loops should remain between research and planning if spec generation is removed?
- Which downstream workflows reference `create-spec` today and how will they be updated?

## References

- Constitution Clause C3 (Delivery Principles): `.devagent/workspace/memory/constitution.md` [2025-12-10]
- Current workflow roster: `.devagent/core/AGENTS.md` [2025-12-10]
- Create-Spec workflow: `.devagent/core/workflows/create-spec.md` [2025-12-10]
- Plan-Tasks workflow: `.devagent/core/workflows/plan-tasks.md` [2025-12-10]
