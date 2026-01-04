# Create Plan

## Mission
- Primary goal: Convert validated product missions and research packets directly into execution-focused implementation plans that give developers clear guardrails and concrete work packets without requiring a separate spec stage.
- Boundaries / non-goals: Do not run net-new discovery (escalate to devagent research), commit to delivery dates, write production code, or include rollout/process tasks (announcements, support windows, adoption tracking).
- Success signals: The executing developer signs off with minor or no edits, each task specifies concrete files/modules to modify with acceptance criteria, plan is free of blocking ambiguities, and risks plus open questions are tracked with owners.

## Standard Instructions Reference
Before executing this workflow, review standard instructions in `.devagent/core/AGENTS.md` → Standard Workflow Instructions for:
- Date handling
- Metadata retrieval
- Context gathering order
- Standard guardrails
- Storage patterns

## Execution Directive
Follow standard execution directive in `.devagent/core/AGENTS.md` → Standard Workflow Instructions.

## Inputs
- Required: Approved mission summary or plan request, latest research packet links, task slug and repository entry points, and known technical constraints or dependencies.
- Optional: Architecture diagrams, telemetry snapshots, design prototypes, prior implementation retrospectives, exploratory artifacts, and staffing assumptions.
- Request missing info by compiling a gaps checklist mapped to template sections and pinging the requester plus the appropriate partner agent (devagent update-product-mission for mission changes, devagent research for evidence gaps).

## Resource Strategy
- `.devagent/core/templates/plan-document-template.md` (Plan Document Template) — unified template combining product context and execution planning; duplicate per engagement and treat as the authoritative outline.
- `.devagent/workspace/tasks/{status}/<task_prefix>_<task_slug>/research/` — upstream research artifacts to cite for problem, user, or market context. (Note: `<task_prefix>` is typically a date like `YYYY-MM-DD` but may vary based on the engagement's naming conventions.)
- `.devagent/workspace/tasks/{status}/<task_prefix>_<task_slug>/plan/` — canonical location for active plans and change history. (Note: replacing previous `spec/` and `tasks/` separation.)
- **Date retrieval:** Review Standard Workflow Instructions in `.devagent/core/AGENTS.md` for date handling.
- devagent research — validate assumptions or source additional data before finalizing objectives or acceptance criteria.
- devagent update-product-mission — confirm mission alignment, business framing, and cross-initiative dependencies when scope shifts.


## Knowledge Sources
- Internal: Product constitution, existing task plans, ADRs, analytics dashboards, customer feedback archives, prior research packets.
- External: Domain research cited by devagent research; request fresh pulls rather than self-searching to maintain sourcing discipline.
- Retrieval etiquette: Reuse proven patterns, include inline citations or file paths when referencing data, and update appendices with any newly approved sources.

## Workflow
1. **Kickoff / readiness checks:** Confirm trigger (net-new vs revision), verify required inputs, and log initial unknowns. Determine owner by reviewing Standard Workflow Instructions in `.devagent/core/AGENTS.md` for metadata retrieval. Classify scope (full task vs phase).
2. **Context gathering:** Review Standard Workflow Instructions in `.devagent/core/AGENTS.md` for context gathering order. Read mission docs, latest research, prior plans, and any existing notes; capture constraints, dependencies, and unresolved questions in working notes. Review project testing best practices (if available in docs/testing.md, .cursor/rules/testing-*.mdc, or similar) to inform validation strategies.
3. **Outline creation:** Copy the plan template into the task plan directory, fill metadata, mark each section with planned evidence, remove optional sections that are irrelevant, and flag gaps for follow-up.
4. **Product context drafting:** Populate sections (Summary, Context & Problem, Objectives & Success Metrics, Users & Insights, Solution Principles) with concise prose, linking to supporting artifacts and capturing assumptions with owners. Ensure business/product guardrails are clear and reviewable. Do not include time estimates or delivery dates.
5. **Implementation planning:** Break work into ordered, execution-focused tasks with concrete deliverables (files changed, functions added, tests written). Each task should specify: what to build/change, which files/modules are affected, and how to validate the change (tests, automated verification). Map spec-like objectives to concrete implementation work (file creation, modifications, deletions, config changes).
6. **Implementation guidance extraction:** Review `AGENTS.md` (root) and `.devagent/core/AGENTS.md` for relevant standard workflow instructions, coding conventions, and implementation patterns. Review cursor rules and related documentation files (`.cursorrules`, `.cursor/rules/*.mdc`, workspace rules, `README.md`, `docs/**`, `.github/*.md` policy docs, and other relevant documentation) for coding standards, style guidelines, and project-specific conventions. Extract and embed relevant snippets or sections that guide implementation into the plan's "Implementation Guidance" section. Include: coding standards, testing patterns, file organization patterns, naming conventions, and any other relevant guidance that will help during implementation. Cite source file paths for each snippet. If no relevant guidance is found, note that the section can be omitted.
7. **Acceptance criteria refinement:** Favor practical, behavior-focused acceptance criteria over performance metrics (e.g., "page renders correctly on mobile" rather than "page loads in <500ms"). Only include performance requirements when explicitly specified as critical business requirements. Avoid visual regression testing deliverables unless the project has established infrastructure (e.g., Percy, Chromatic); default to project testing standards instead.
8. **Dependency & risk mapping:** Highlight technical blockers (missing APIs, unclear requirements, system dependencies) and product ambiguities (business assumptions, user needs); log them in the plan and escalate where ownership is unclear.
9. **Validation:** Self-check that every product objective has traceable implementation tasks, technical validation (tests/linting) is embedded in implementation tasks, business context is clear for cross-functional review, and no pure-process tasks remain (rollout, support, announcements, manual testing, user acceptance testing should be handled outside task planning).
10. **Get current date:** Review Standard Workflow Instructions in `.devagent/core/AGENTS.md` for date handling.
11. **Output packaging:** Save the plan to `.devagent/workspace/tasks/{status}/<task_prefix>_<task_slug>/plan/YYYY-MM-DD_<descriptor>.md` (using the date retrieved in step 10), update the task hub summary, and communicate key product decisions plus implementation strategy to the requester.
12. **Post-run logging:** Record final decisions, unresolved risks, and approval gates in per-task memory or decision logs, and note follow-up tasks for downstream agents.

## Adaptation Notes
- For minor revisions, edit the existing plan in place, append to the change log, and highlight deltas rather than recreating the full document.
- When evidence is incomplete, collaborate asynchronously with devagent research to document discovery tasks in the Risks & Open Questions section before proposing implementation.
- For multi-platform or phased launches, split implementation sections per platform or milestone while keeping shared objectives unified.
- For quick fixes or small deltas, leverage the template's lightweight view (single task group) and focus on regression risks and product/business context.

## Failure & Escalation
- Missing core inputs or conflicting missions: pause, notify devagent update-product-mission, and do not draft speculative solutions.
- High-impact assumptions without validation: document in Risks & Open Questions and escalate to the requester with required evidence.
- Spec gaps or conflicting success metrics: document the issue in the plan and route back to devagent research or devagent update-product-mission as appropriate.
- Blocking dependencies or approvals: record in the Risks section with owner and raise via the agreed communication channel.
- Insufficient engineering coverage or unclear ownership: flag to requester and suggest a staffing check before proceeding.

## Expected Output
- Artifacts: Markdown plan using the unified plan document template, stored under the task's `plan/` directory with ISO date prefix, plus any updates to task README or index files when needed.
- Communication: Status note summarizing outcomes, key product decisions, implementation strategy, and outstanding questions with a link to the plan path.
- Guardrails: Ensure product context (users, objectives, principles) is clear for multi-stakeholder review, keep implementation tasks execution-focused (concrete code changes only), avoid process tasks (rollouts, announcements, external validation, support windows, manual testing, user acceptance testing), ensure every task specifies affected files/modules, embed validation as part of implementation (not separate tasks), follow project testing standards for validation approaches, and favor practical acceptance criteria over performance metrics unless performance is a critical business requirement.

## Follow-up Hooks
- Downstream workflows: devagent research may follow up on outstanding discovery tasks; execute tasks directly from the Implementation Plan section of the plan artifact.
- Communication: Surface plan to reviewing stakeholders (product, design, engineering leads) per team conventions; record approval and any waivers in task hub.
- Metrics / signals: Track planning completion date, count of unresolved dependencies, and variance between initial and final task counts for retrospectives.

## Related Workflows
- **Deprecated:** devagent create-spec (replaced by this workflow)
- **Predecessor:** devagent research
- **Successor:** Direct execution using the Implementation Plan section of the plan artifact
