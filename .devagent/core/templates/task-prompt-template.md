# Task Prompt File Template

## Metadata
- `task_slug`: <task identifier used for downstream agents>
- `feature_slug`: <feature hub slug>
- `date_generated`: <ISO8601 timestamp>
- `source_type`: spec | issue
- `source_refs`: [<spec path or issue id/link>, ...]
- `repo`: <primary repo or service>
- `base_branch`: <branch name — include last fetch timestamp>
- `target_branch`: <planned working branch name or prefix>
- `owner`: <person or agent responsible for upkeep>

## Product Context
- Problem statement and customer impact.
- Link to mission/roadmap items or OKRs that frame the task.

## Research Summary
- Key finding with freshness note — cite research packets or interviews.
- Additional insight — highlight risks, constraints, or metrics.

## Task Scope
- Objective: <definition of done in one sentence>.
- Out of scope: <what remains untouched>.
- Dependencies: <upstream/downstream tasks or approvals>.

## Implementation Plan
1. **Step label** — describe the work, list functions or components to touch, reference code patterns.
2. **Step label** — include validation steps, instrumentation, or integration notes.
3. **Step label** — outline testing, documentation, or rollout tasks.

## Acceptance Criteria
- Testable condition tied to requirements.
- Quality guardrails (tests, lint, observability, performance).
- Edge cases and telemetry expectations.

## Reference Files
- `src/service/foo.py` — Reason this file matters.
- `docs/api.md` — Link to specs, schemas, or contracts.

## Constraints
- Architectural or compliance constraints to honour.
- Tooling, language, or dependency versions to maintain.

## Deliverables
1. <File or artifact> — expected change.
2. <Test or doc> — required validation or comms.

## Task Pack
| task-id | description | ai_prompt | status | file_hints | context_refs |
| --- | --- | --- | --- | --- | --- |
| slug-1 | Example task tied to source section | Plain-language instructions for executor agents (≤120 words). Include file paths or research docs to open. | planned | [`src/service/foo.py`] | [`spec.md#L42`, `research/2025-09-10_api.md`] |

Status values: `planned`, `in_progress`, `blocked`, `ready_for_review`, `done`.

## Status Log
- 2025-09-29T00:00Z — Initial breakdown.

## Research Links
- `.devagent/workspace/features/<feature_slug>/research/<date>_<topic>.md`
- Additional context files or dashboards referenced in prompts.

