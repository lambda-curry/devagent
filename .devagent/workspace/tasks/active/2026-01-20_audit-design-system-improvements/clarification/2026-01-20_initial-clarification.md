# Clarified Requirement Packet — Audit Design System Improvements

- Requestor: Jake Ruesink (Owner) **[INFERRED]**
- Decision Maker: Jake Ruesink (Owner) **[INFERRED]**
- Date: 2026-01-20
- Mode: Task Clarification
- Status: Complete
- Related Task Hub: `.devagent/workspace/tasks/active/2026-01-20_audit-design-system-improvements/`

## Inferred Task Concept
Audit the current design system, compare it to the preferred UI style shown in `@image[clip-1768952736827.png]`, and produce a concrete set of recommended improvements (and potentially implement them) so the product UI can move toward that style consistently.

**Reference image:** `.devagent/workspace/tasks/active/2026-01-20_audit-design-system-improvements/references/reference.png`

## Assumptions
- **[INFERRED]** The goal is to improve consistency/quality of the existing UI by refining tokens/components/patterns (not to pick a brand new design system from scratch).
- **[INFERRED]** The screenshot is the desired direction for layout density, spacing, typography, color, and component styling.
- **[INFERRED]** The “design system” refers to whatever tokens/components/docs currently power the UI in this repo (source-of-truth TBD).

## What we’ve already got
- Task hub exists and is in Draft state.
- No explicit stakeholders/decision makers beyond the repo owner are documented yet.
- The current design system’s source-of-truth is not yet identified.

## Question Tracker
| ID | Question | Status | Answer |
| --- | --- | --- | --- |
| Q1 | What output should this “audit” produce (deliverables)? | ✅ answered | Full implementation sweep (tokens + components + surfaces) |
| Q2 | Where is the current design system source-of-truth? | ✅ answered | “All of the above” (tokens + component library + Storybook + docs) |
| Q3 | Who are the stakeholders/decision makers for style changes? | ✅ answered | Jake is the sole decision maker |
| Q4 | Which UI areas should be the first “golden paths” to anchor rollout order? | ✅ answered | All of the above (app shell + board views + forms/dialogs + tables/lists/detail) |
| Q5 | What about the reference style is “must match” vs. flexible? | ✅ answered | Flexible; establish a cohesive “design language” to guide future work |
| Q6 | How should we verify the sweep is correct (definition of done)? | ✅ answered | Storybook coverage/review + “no ad-hoc CSS” rule (tokens/components only) |
| Q7 | Rollout strategy to avoid long-lived mixed styling? | ✅ answered | Big-bang rollout (update everything in one PR/short burst) |
| Q8 | “No ad-hoc CSS” exceptions allowed? | ✅ answered | Page-level layout composition allowed; per-page overrides allowed when component abstraction is overkill |
| Q9 | Which design-language “non-negotiables” should be defined up front? | ✅ answered | Define all: spacing scale, typography scale, surface system, color semantics, interaction states |

---

## Task Overview

### Context
- **Task name/slug:** `2026-01-20_audit-design-system-improvements`
- **Mission link:** Supports DevAgent’s mission of “faster delivery without sacrificing shared missions, specs, or code quality expectations” by tightening UI consistency and reducing ad-hoc styling. (`.devagent/workspace/product/mission.md`)
- **Business context (why now):** Desired UI polish/style alignment referenced via `@image[clip-1768952736827.png]`; exact trigger TBD.
- **Stakeholders:** **[INFERRED]** Jake Ruesink; others TBD.
- **Prior work:** Task hub only; no research/plan artifacts yet.

### Clarification Sessions
- Session 1: 2026-01-20 — Participants: TBD (async via CLI)

---

## Clarified Requirements

### Scope & End Goal

**What needs to be done?**
- Audit existing design tokens/components/patterns and identify improvements to match the preferred style direction.
- Define concrete recommended changes (tokens, components, layout patterns, and usage guidance).
- Implement the changes across tokens + shared components + product surfaces (full sweep).
 - Establish a cohesive design language (principles + conventions) that guides future UI work.

**What's the end goal architecture or state?**
- A cohesive design language + updated tokens/components/patterns applied across the product.
- Ongoing work can follow the design language without introducing one-off styling.

**In-scope (must-have):**
- Identify current DS source-of-truth (tokens/components/docs/storybook).
- Implement changes across tokens/components/surfaces to align with the desired style direction.
- Ensure key components are represented in Storybook for review as the source-of-truth.

**Out-of-scope (won't-have):**
- TBD.

**Nice-to-have (could be deferred):**
- Implement a first slice of the proposed changes in a “golden path” screen to validate the direction.

---

### Technical Constraints & Requirements
- Unknown until we identify the current DS implementation (tokens, CSS vars, Tailwind config, component library, etc.).

---

### Dependencies & Blockers
- Stakeholder sign-off on the desired direction (who decides?).
- Identifying the current DS source-of-truth.

---

### Implementation Approach
- Start with inventory + screenshots of current UI (golden paths), then map deltas against the desired style direction.
- Prefer incremental updates: tokens/patterns first, then components, then surfaces.
- Use Storybook to review component changes and keep the design language consistent across the system.
- Prefer token/component changes over page-level overrides; avoid ad-hoc CSS.
- Rollout strategy: big-bang change set (target short burst) to avoid prolonged mixed styling.
- “No ad-hoc CSS” interpretation:
  - Allowed: page-level layout composition (grid/flex/stacking).
  - Allowed: per-page overrides when a component abstraction would be overkill.
  - Prefer: tokens + shared components as the primary home for visual styling.

---

### Acceptance Criteria & Verification
- We can clearly answer: “What changed, where, and why?” and apply it consistently.
- A “golden path” page matches the intended direction without one-off CSS.
- The updated direction is reflected in tokens + shared components, not just page-level tweaks.
- Storybook provides coverage for the key building-block components, and the changes can be reviewed there.
- Big-bang rollout: the app is not left in a mixed-style state after the implementation window.

---

## Assumptions Log
| Assumption | Owner | Validation Required | Validation Method | Due Date | Status |
| --- | --- | --- | --- | --- | --- |
| The screenshot represents the desired UI direction to emulate. | Jake (Owner) | Yes | Confirm verbally + capture the key traits to emulate. | 2026-01-20 | Pending |
| The design system spans multiple sources-of-truth (tokens + components + Storybook + docs). | Jake (Owner) | No | Confirmed in clarification session. | 2026-01-20 | Validated |
| “No ad-hoc CSS” means: visual styling should prefer tokens/components; page-level layout composition is allowed; per-page overrides are allowed when a component abstraction is overkill. | Jake (Owner) | No | Confirmed in clarification session. | 2026-01-20 | Validated |
| The design language non-negotiables will be explicitly defined (spacing, type, surfaces, colors, interaction states) before/during implementation. | Jake (Owner) | Yes | Create a short “Design Language” section and apply it consistently across components. | 2026-01-20 | Pending |

---

## Gaps Requiring Research
### For #ResearchAgent
None yet. (If we need competitive/UI pattern research, we’ll add it.)

---

## Clarification Session Log
### Session 1: 2026-01-20
**Participants:** Jake Ruesink (Owner) **[INFERRED]**

**Questions Asked:**
1. Q1 (deliverables) → Full implementation sweep (tokens + components + surfaces). (Jake)
2. Q2 (source-of-truth) → All of the above (tokens + component library + Storybook + docs). (Jake)
3. Q3 (stakeholders) → Jake is sole decision maker. (Jake)
4. Q4 (golden paths) → All of the above (app shell + board views + forms/dialogs + tables/lists/detail). (Jake)
5. Q5 (must-match vs flexible) → Flexible; define a cohesive design language to guide future work. (Jake)
6. Q6 (verification) → Storybook review + “no ad-hoc CSS” (tokens/components only). (Jake)
7. Q7 (rollout strategy) → Big-bang change set (short burst) to avoid long-lived mixed styling. (Jake)
8. Q8 (no ad-hoc CSS exceptions) → Allow page-level layout composition; allow per-page overrides when component abstraction is overkill. (Jake)
9. Q9 (design-language non-negotiables) → Define all: spacing, typography, surfaces, colors, interaction states. (Jake)

**Unresolved Items:**
- Concretize the design language into specific decisions:
  - Spacing scale + density tiers (values, naming)
  - Typography scale (sizes/weights/line-heights)
  - Surface system (radius/shadow/border policies)
  - Color semantics (neutral ramp + accent/status mappings)
  - Interaction states (hover/focus/active/disabled patterns)
- Identify the current DS source-of-truth locations concretely in-repo (paths) before implementation begins.
- Define the minimum Storybook coverage set (“key building-block components”) for review.
- Add the actual reference screenshot file into the task folder (see note at top) so it’s available to future agents.

---

## Next Steps
### Spec Readiness Assessment
**Status:** ⬜ Ready for Spec | ⬜ Research Needed | ⬜ More Clarification Needed

**Plan Readiness Assessment:**
- We now know this is a full implementation sweep and Jake is the decision maker.
- We will cover all major UI areas and use Storybook + “no ad-hoc CSS” as primary verification.
- Rollout is big-bang (short burst) to avoid long-lived mixed styling.
- Still need concrete design language decisions (tokens/policies) and DS source-of-truth paths, but this is plan-ready: the plan can include tasks to define these up-front and apply them.

**Rationale:**
Plan-ready with a “define design language first” first-slice; details are intentionally deferred into plan tasks.

### Recommended Actions
- [ ] Run `devagent create-plan` using this clarification packet as input.
- [ ] In the plan, start with a “Design Language” definition slice (tokens/policies) before wide component/surface refactors.
- [ ] Enumerate DS source-of-truth paths (tokens/components/storybook/docs) as an explicit early task.

---

## Change Log
- 2026-01-20: Created initial clarification packet with inferred concept and initial questions. (Agent)

