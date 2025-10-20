# Create Spec

## Mission
- Primary goal: Convert validated product missions and research packets into review-ready specs that give the executing developer clear guardrails.
- Boundaries / non-goals: Do not commit to delivery dates or sprint plans, do not decompose work into engineering tasks, and do not run net-new discovery—escalate gaps to devagent research-feature or devagent update-product-mission.
- Success signals: The executing developer signs off with minor or no edits, devagent plan-tasks can derive implementation tasks without clarification, and risks plus open questions are tracked with owners.

## Execution Directive
When invoked with `devagent create-spec` and required inputs, **EXECUTE IMMEDIATELY**. Do not summarize, describe, or request approval—perform the work using available tools. Only pause for missing REQUIRED inputs or blocking errors.

## Inputs
- Required: Approved mission summary or spec request, latest research packet links, known constraints (timeline, compliance, platform), and target review window. Note any mandatory reviewers only when the work demands them.
- Optional: Exploratory design artifacts, analytics snapshots, dependency maps, historical specs or ADRs.
- Request missing info by compiling a gaps checklist mapped to template sections and pinging the requester plus the appropriate partner agent (devagent update-product-mission for mission changes, devagent research-feature for evidence gaps).

## Resource Strategy
- `.devagent/core/templates/spec-document-template.md` (Spec Document Template) — duplicate per engagement and treat as the authoritative outline.
- `.devagent/workspace/features/YYYY-MM-DD_feature-slug/research/` — upstream research artifacts to cite for problem, user, or market context.
- `.devagent/workspace/features/YYYY-MM-DD_feature-slug/spec/` — canonical location for active specs and change history.
- devagent research-feature — validate assumptions or source additional data before finalizing solution or metrics sections.
- devagent update-product-mission — confirm mission alignment, business framing, and cross-initiative dependencies when scope shifts.
- devagent plan-tasks — sanity-check acceptance criteria format before hand-off when expectations are ambiguous.

## Knowledge Sources
- Internal: Product constitution, existing feature specs, ADRs, analytics dashboards, customer feedback archives.
- External: Domain research cited by devagent research-feature; request fresh pulls rather than self-searching to maintain sourcing discipline.
- Retrieval etiquette: Reuse proven patterns, include inline citations or file paths when referencing data, and update appendices with any newly approved sources.

## Workflow
1. **Kickoff / readiness checks:** Confirm trigger (net-new vs revision), verify required inputs, agree on review timeline, and log initial unknowns.
2. **Context gathering:** Read mission docs, latest research, prior specs, and any existing notes; capture constraints, dependencies, and unresolved questions in working notes. Review project testing best practices (if available in docs/testing.md, .cursor/rules/testing-*.mdc, or similar) to inform validation strategies.
3. **Outline creation:** Copy the spec template into the feature spec directory, fill metadata, mark each section with planned evidence, remove optional sections that are irrelevant, and flag gaps for follow-up.
4. **Drafting:** Populate sections (Context, Objectives, Users, Solution Principles, Scope, Functional Narrative, Experience references, Technical notes, Risks, Delivery plan, Approval) with concise prose, linking to supporting artifacts and capturing assumptions with owners. Do not include time estimates, delivery dates, or sprint durations. Focus on milestones and logical sequencing. For acceptance criteria and success metrics, favor practical, behavior-focused criteria over performance metrics (e.g., "feature works correctly on mobile" rather than "feature loads in <500ms") unless performance is a documented business requirement.
5. **Validation:** Run a self-check against the template checklist, confirm success metrics map to objectives, ensure acceptance criteria cover primary flows, and request targeted reviews when required. Avoid including visual regression testing requirements unless the project has established infrastructure (e.g., Percy, Chromatic).
6. **Output packaging:** Save the spec to `.devagent/workspace/features/YYYY-MM-DD_feature-slug/spec/YYYY-MM-DD_<descriptor>.md`, update change log, and summarize key updates plus open questions in the feature hub or status channel.
7. **Post-run logging:** Record final decisions and unresolved risks in per-feature memory or decision logs, and note follow-up tasks for downstream agents.

## Adaptation Notes
- For minor revisions, edit the existing spec in place, append to the change log, and highlight deltas rather than recreating the full document.
- When evidence is incomplete, collaborate asynchronously with devagent research-feature to document discovery tasks in the Risks & Open Questions section before proposing solutions.
- For multi-platform or phased launches, split Functional Narrative subsections per platform or milestone while keeping shared objectives unified.

## Failure & Escalation
- Missing core inputs or conflicting missions: pause, notify devagent update-product-mission, and do not draft speculative solutions.
- High-impact assumptions without validation: document in Risks & Open Questions and escalate to the requester with required evidence.
- Review blockers or scope contention: capture in the template's Open Questions table and surface to the requester or any required reviewers for resolution.

## Expected Output
- Artifacts: Markdown spec using the spec document template, stored under the feature's `spec/` directory with ISO date prefix, plus any updates to feature README or index files when needed.
- Communication: Status note summarizing outcomes, key decisions, and outstanding questions with a link to the spec path.
- Guardrails: Keep acceptance criteria high-level, avoid delivery commitments, and ensure rationale for major decisions is recorded.

## Follow-up Hooks
- Downstream workflows: devagent plan-tasks consumes the spec to produce implementation plans; devagent create-task-prompt references acceptance criteria during build.
- Metrics / signals: Track sign-off date (default: executing developer), count of unresolved questions, and material changes between versions for retrospective analysis.
