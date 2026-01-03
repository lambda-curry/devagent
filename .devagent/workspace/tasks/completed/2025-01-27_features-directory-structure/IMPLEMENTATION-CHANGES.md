# Implementation Changes for Status-Based Feature Structure

## Overview
This document tracks all files that need updates to support the new status-based feature directory structure (`active/`, `planned/`, `completed/`).

## Change Strategy

### Core Principle
All references to `.devagent/workspace/features/YYYY-MM-DD_feature-slug/` should be updated to indicate that features live within status-based subdirectories. However, within documentation, we should use a generic pattern that indicates features could be in any status directory.

### Pattern Update
- **Old Pattern:** `.devagent/workspace/features/YYYY-MM-DD_feature-slug/`
- **New Pattern:** `.devagent/workspace/features/{status}/YYYY-MM-DD_feature-slug/` where `{status}` is `active`, `planned`, or `completed`

### Documentation Approach
For documentation files that provide examples or templates:
- Use `{status}` placeholder when teaching the structure
- Use explicit `active/` or `completed/` only when illustrating a specific workflow or context

## Files Requiring Updates

### Workflow Files (7 files)
All workflows that reference feature directories need updates:

1. **`.devagent/core/workflows/research.md`** (line 24)
   - Current: `.devagent/workspace/features/YYYY-MM-DD_feature-slug/research/`
   - Update: `.devagent/workspace/features/{status}/YYYY-MM-DD_feature-slug/research/`

2. **`.devagent/core/workflows/create-spec.md`** (lines 18-19)
   - Current: `.devagent/workspace/features/YYYY-MM-DD_feature-slug/research/` and `spec/`
   - Update: `.devagent/workspace/features/{status}/YYYY-MM-DD_feature-slug/research/` and `spec/`

3. **`.devagent/core/workflows/plan-tasks.md`** (lines 18-20)
   - Current: `.devagent/workspace/features/YYYY-MM-DD_feature-slug/spec/`, `research/`, `tasks/`
   - Update: `.devagent/workspace/features/{status}/YYYY-MM-DD_feature-slug/spec/`, etc.

4. **`.devagent/core/workflows/clarify-feature.md`** (line 22)
   - Current: `.devagent/workspace/features/YYYY-MM-DD_feature-slug/clarification/`
   - Update: `.devagent/workspace/features/{status}/YYYY-MM-DD_feature-slug/clarification/`

5. **`.devagent/core/workflows/review-progress.md`** (lines 17, 19, 45)
   - Current: `.devagent/workspace/features/YYYY-MM-DD_feature-slug/progress/` and `AGENTS.md` references
   - Update: `.devagent/workspace/features/{status}/YYYY-MM-DD_feature-slug/progress/`

6. **`.devagent/core/workflows/brainstorm.md`** (lines 19, 57, 65, 80)
   - Current: `.devagent/workspace/features/YYYY-MM-DD_feature-slug/brainstorms/`
   - Update: `.devagent/workspace/features/{status}/YYYY-MM-DD_feature-slug/brainstorms/`

8. **`.devagent/core/workflows/new-feature.md`** (line 26)
   - Current: `.devagent/workspace/features/<feature_prefix>_<feature_slug>/`
   - Update: `.devagent/workspace/features/active/<feature_prefix>_<feature_slug>/` (new features go to active)

### Template Files (6 files)

1. **`.devagent/core/templates/feature-agents-template.md`** (line 6)
   - Current: `.devagent/workspace/features/<feature_prefix>_<feature_slug>/`
   - Update: `.devagent/workspace/features/{status}/<feature_prefix>_<feature_slug>/`

2. **`.devagent/core/templates/feature-hub-template/README.md`**
   - No explicit paths, but may need status documentation
   - Review context for status assignment guidance

3. **`.devagent/core/templates/spec-document-template.md`** (line 6)
   - Current: `.devagent/workspace/features/YYYY-MM-DD_feature-slug/`
   - Update: `.devagent/workspace/features/{status}/YYYY-MM-DD_feature-slug/`

4. **`.devagent/core/templates/research-packet-template.md`** (lines 6-7)
   - Current: `.devagent/workspace/features/YYYY-MM-DD_feature-slug/spec/` and `tasks/`
   - Update: `.devagent/workspace/features/{status}/YYYY-MM-DD_feature-slug/spec/` etc.

5. **`.devagent/core/templates/task-plan-template.md`** (lines 6, 8)
   - Current: `.devagent/workspace/features/YYYY-MM-DD_feature-slug/spec/` and `tasks/`
   - Update: `.devagent/workspace/features/{status}/YYYY-MM-DD_feature-slug/spec/` etc.

6. **`.devagent/core/templates/task-prompt-template.md`** (line 67)
   - Current: `.devagent/workspace/features/<feature_slug>/research/`
   - Update: `.devagent/workspace/features/{status}/<feature_slug>/research/`

7. **`.devagent/core/templates/clarification-packet-template.md`** (line 8)
   - Current: `.devagent/workspace/features/YYYY-MM-DD_feature-slug/`
   - Update: `.devagent/workspace/features/{status}/YYYY-MM-DD_feature-slug/`

8. **`.devagent/core/templates/brainstorm-packet-template.md`** (line 8)
   - Current: `.devagent/workspace/features/YYYY-MM-DD_feature-slug/brainstorms/`
   - Update: `.devagent/workspace/features/{status}/YYYY-MM-DD_feature-slug/brainstorms/`

### Documentation Files (2 files)

1. **`.devagent/core/README.md`**
   - Lines 68-74: Update directory structure diagram
   - Add explanation of status-based organization
   - Update setup instructions for new structure

2. **`.devagent/core/AGENTS.md`**
   - No direct path references found in review
   - Add note about status-based organization

3. **`README.md`** (root)
   - Line 16: Update example paths
   - Line 32: Update directory description
   - Line 39: Update "Getting Started" instruction

## Implementation Notes

### Key Considerations
1. **New Features**: When using `devagent new-feature`, features should be created in `active/` directory by default
2. **Template Guidance**: Templates should explain status selection criteria
3. **Migration**: Existing features in root will be moved to appropriate status directories
4. **Backward Compatibility**: No backward compatibility needed (clean cut implementation)

### Status Assignment Logic
- **active/**: Features currently being worked on (in research, spec, or implementation phases)
- **planned/**: Features queued for future work (approved but not yet started)
- **completed/**: Features that are shipped and stable (mirrors existing `completed/` subdirectory)

### Documentation Updates
Update documentation to explain:
- When to use each status directory
- How to move features between statuses
- How to maintain chronological naming within each directory

## Testing Strategy
1. Create sample features in each status directory
2. Run workflows to ensure they can find and work with features in status subdirectories
3. Verify all templates render correctly with new paths
4. Confirm core/README.md provides clear guidance on the new structure
