# Task Prompt File Template

## Overview
- `source_type`: spec | issue
- `source_ref`: <spec path or issue id/link>
- `repo`: <primary repo or service>
- `last_updated`: <ISO8601 timestamp>
- `owner`: <person or agent responsible for upkeep>
- `summary`: One sentence describing the initiative.

## Branches
- `base_branch`: <e.g., main | develop — include last fetch timestamp>
- `feature_branch`: <planned working branch name or prefix>

## Relevant Files
- `src/service/foo.py` — Main entry point affected by tasks.
- `docs/api.md` — Reference for request/response contract.

## Task Table
| task-id | description | ai_prompt | status | file_hints | context_refs |
| --- | --- | --- | --- | --- | --- |
| slug-1 | Example task tied to source section | Plain-language instructions for Executor agents (≤120 words). Include file paths or research docs to open. | planned | [`src/service/foo.py`] | [`spec.md#L42`, `research/2025-09-10_api.md`] |

Status values: `planned`, `in_progress`, `blocked`, `ready_for_review`, `done`.

## Status Log
- 2025-09-29T00:00Z — Initial breakdown.

## Research Links
- `.devagent/tasks/<slug>/research/<date>_<topic>.md`
- Additional context files or dashboards referenced in prompts.

> Copy this template into `.devagent/tasks/<slug>/tasks.md` and update sections as the plan evolves.
