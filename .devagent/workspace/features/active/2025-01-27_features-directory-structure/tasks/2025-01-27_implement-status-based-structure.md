# Task Prompt File Template

## Metadata
- `task_slug`: implement-status-based-structure
- `feature_slug`: 2025-01-27_features-directory-structure
- `date_generated`: 2025-01-27T20:00:00Z
- `source_type`: spec
- `source_refs`: [`.devagent/workspace/product/brainstorms/2025-01-27_features-folder-structure.md`]
- `repo`: devagent
- `base_branch`: main @ 2025-01-27T20:00:00Z
- `target_branch`: feature/features-directory-structure
- `owner`: Jake Ruesink

## Product Context
- Problem statement: Current features directory uses flat chronological organization with only `completed/` as a subdirectory. As DevAgent scales and more features move through different lifecycle stages (backlog, in-progress, completed), we need a more sophisticated organization system that maintains chronological traceability while supporting clear workflow states.
- Link to mission/roadmap items: Supports C2 (Chronological Feature Artifacts) and provides clear workflow states for engineering teams, directly advancing the mission of supporting engineering teams with structured AI workflows.

## Research Summary
- Key finding: Enhanced Status-Based Structure scored highest (20/20) in evaluation matrix for mission alignment, user impact, technical feasibility, and effort estimation. Generated 30 organizational ideas across 5 themes, with status-based organization being the clear winner.
- Additional insight: The structure maintains existing chronological benefits while adding immediate clarity on feature status. Risk of features getting "stuck" in wrong status folder requires discipline to maintain.

## Task Scope
- Objective: Implement Enhanced Status-Based Structure with `active/`, `planned/`, `completed/` subdirectories while maintaining chronological organization within each.
- Out of scope: Creating subfolders within status directories, implementing automated status transitions, or changing individual feature folder structures.
- Dependencies: None - this is a pure organizational change.

## Progress Tracking
- Review the AGENTS.md file in the feature directory for current progress and decisions.
- Upon completion, append new entries to the Progress Log section of AGENTS.md with completion status, key decisions, and references to supporting files (research, spec, task plan, prompts), preserving historical entries to maintain a progress timeline.
- If this task corresponds to a high-level item in the AGENTS.md Implementation Checklist, update its status: mark as [x] only if fully completed; for partial completion, mark as [~] in progress and add a brief note on progress made.

## Implementation Plan
1. **Create new directory structure** — Create `active/` and `planned/` subdirectories alongside existing `completed/` directory.
2. **Migrate existing features** — Move features from root level to appropriate status directories based on current state.
3. **Update workflows and templates** — Update all workflow files and templates to reference status-based paths (see IMPLEMENTATION-CHANGES.md).
4. **Update documentation** — Update `.devagent/workspace/features/README.md`, `.devagent/core/README.md`, and root `README.md` with new organizational structure documentation.
5. **Validate structure** — Ensure all features are properly categorized and chronological naming is maintained within each status directory.

## Acceptance Criteria
- Three status directories exist: `active/`, `planned/`, `completed/`
- All existing features are moved to appropriate status directories
- Date-prefixed naming is maintained within each status directory
- All workflow files reference status-based paths using `{status}` placeholder
- All template files reference status-based paths using `{status}` placeholder
- Documentation files (README.md, .devagent/core/README.md) explain status-based organization
- No features remain in the root features directory (except README.md)
- All existing feature functionality remains intact

## Reference Files
- `.devagent/workspace/features/README.md` — Current structure documentation to update
- `.devagent/workspace/product/brainstorms/2025-01-27_features-folder-structure.md` — Source specification and rationale
- `.devagent/workspace/memory/constitution.md` — C2 clause for chronological artifacts
- `.devagent/workspace/features/` — Current directory structure to reorganize

## Constraints
- Must maintain C2 (Chronological Feature Artifacts) requirements
- Must preserve existing feature folder structures and contents
- Must maintain chronological naming within each status directory
- No subfolders within status directories

## Deliverables
1. New directory structure with `active/`, `planned/`, `completed/` folders
2. All workflow files updated to reference status-based paths
3. All template files updated to reference status-based paths
4. Updated documentation (`.devagent/workspace/features/README.md`, `.devagent/core/README.md`, root `README.md`)
5. All existing features properly categorized in appropriate status directories

## Task Pack
| task-id | description | ai_prompt | status | file_hints | context_refs |
| --- | --- | --- | --- | --- | --- |
| create-directories | Create new status-based directory structure | Create `active/` and `planned/` subdirectories in `.devagent/workspace/features/` alongside the existing `completed/` directory. Ensure proper permissions and that the directories are empty and ready for feature migration. | planned | [`.devagent/workspace/features/`] | [`.devagent/workspace/product/brainstorms/2025-01-27_features-folder-structure.md#L103-115`] |
| migrate-features | Move existing features to appropriate status directories | Analyze current features in `.devagent/workspace/features/` and move them to appropriate status directories: `active/` for features currently being worked on (like `2025-10-20_progress-tracker/`), `planned/` for any queued features, and `completed/` for finished features. Maintain all existing folder structures and contents exactly as they are. | planned | [`.devagent/workspace/features/`] | [`.devagent/workspace/product/brainstorms/2025-01-27_features-folder-structure.md#L103-115`] |
| update-workflows | Update workflow files to reference status-based paths | Update all workflow files in `.devagent/core/workflows/` to reference status-based feature paths using the pattern `.devagent/workspace/features/{status}/YYYY-MM-DD_feature-slug/` where `{status}` is `active`, `planned`, or `completed`. See IMPLEMENTATION-CHANGES.md for specific files and line numbers to update. Maintain the placeholder approach for documentation clarity. | planned | [`.devagent/core/workflows/`] | [`IMPLEMENTATION-CHANGES.md`, `.devagent/workspace/product/brainstorms/2025-01-27_features-folder-structure.md#L103-115`] |
| update-templates | Update template files to reference status-based paths | Update all template files in `.devagent/core/templates/` to reference status-based feature paths using the pattern `.devagent/workspace/features/{status}/YYYY-MM-DD_feature-slug/` where `{status}` is `active`, `planned`, or `completed`. See IMPLEMENTATION-CHANGES.md for specific files and line numbers to update. Maintain the placeholder approach for documentation clarity. | planned | [`.devagent/core/templates/`] | [`IMPLEMENTATION-CHANGES.md`, `.devagent/workspace/product/brainstorms/2025-01-27_features-folder-structure.md#L103-115`] |
| update-documentation | Update README files with new organizational structure | Update `.devagent/workspace/features/README.md`, `.devagent/core/README.md`, and root `README.md` to document the new status-based organization with `active/`, `planned/`, and `completed/` directories. Include guidance on when to use each directory, how to maintain chronological naming within each, and how status transitions work. Reference the brainstorm packet for rationale and implementation details. | planned | [`.devagent/workspace/features/README.md`, `.devagent/core/README.md`, `README.md`] | [`.devagent/workspace/product/brainstorms/2025-01-27_features-folder-structure.md#L103-115`, `.devagent/workspace/memory/constitution.md#C2`] |
| validate-structure | Verify new structure meets requirements | Verify that all three status directories exist, all features are properly categorized, chronological naming is maintained within each directory, all workflows and templates reference status-based paths correctly, documentation is updated, and no features remain in the root features directory (except README.md). Ensure the structure aligns with C2 requirements and the brainstorm specifications. | planned | [`.devagent/workspace/features/`, `.devagent/core/`] | [`.devagent/workspace/product/brainstorms/2025-01-27_features-folder-structure.md#L103-115`, `.devagent/workspace/memory/constitution.md#C2`, `IMPLEMENTATION-CHANGES.md`] |

Status values: `planned`, `in_progress`, `blocked`, `ready_for_review`, `done`.

## Status Log
- 2025-01-27T20:00:00Z — Initial breakdown created from brainstorm results.
- 2025-01-27T21:30:00Z — Reviewed all workflows and templates; created IMPLEMENTATION-CHANGES.md documenting all required updates; expanded task pack to include workflow and template update tasks.

## Research Links
- `.devagent/workspace/product/brainstorms/2025-01-27_features-folder-structure.md`
- `.devagent/workspace/memory/constitution.md`
- `.devagent/workspace/features/README.md`
