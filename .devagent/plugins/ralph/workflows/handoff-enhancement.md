# Ralph Handoff Enhancement

## Mission
Extend the core handoff workflow (`.devagent/core/workflows/handoff.md`) with Ralph-specific enhancements when working with Beads Epics. This includes linking improvement reports, referencing screenshots, and including top improvements in handoff summaries.

## When to Use
- When generating a handoff after completing or substantially progressing a Beads Epic
- When improvement reports exist for the Epic
- When screenshots were captured during Epic execution

## Prerequisites
- Core handoff workflow: `.devagent/core/workflows/handoff.md` (base workflow)
- Epic ID available (from context or explicit input)
- Improvement report may exist: `.devagent/workspace/reviews/YYYY-MM-DD_<epic-id>-improvements.md`

## Enhancement Steps

### Step 1: Check for Ralph Artifacts
After following the core handoff workflow, check for Ralph-specific artifacts:

1. **Improvement Report:**
   - Check for: `.devagent/workspace/reviews/YYYY-MM-DD_<epic-id>-improvements.md`
   - Or legacy: `.devagent/workspace/reviews/YYYY-MM-DD_revise-report-epic-<epic-id>.md`
   - If found, extract top 3-5 critical/high priority improvements

2. **Screenshots:**
   - Check for: `.devagent/workspace/reviews/<epic-id>/screenshots/`
   - Count screenshots and identify key ones for reference

### Step 2: Enhance Handoff Prompt
Add the following sections to the handoff prompt (after "Current State"):

**Quick Status (Optional)**
- Tasks completed: X/Y (if available from Epic context)
- Critical issues: [count] (from improvement report if available)
- **Screenshots**: `.devagent/workspace/reviews/[epic-id]/screenshots/` (if available)
- **See Improvement Report**: `.devagent/workspace/reviews/[epic-id]-improvements.md` (if available)

**Top Improvements (Optional - Full list in improvement report)**
1. **[Priority] [Category]**: [improvement description] - [impact]
2. **[Priority] [Category]**: [improvement description] - [impact]
3. **[Priority] [Category]**: [improvement description] - [impact]

### Step 3: Add References
If improvement report or screenshots exist, add them to the References section:
- `.devagent/workspace/reviews/[epic-id]-improvements.md` — Comprehensive improvement analysis with categorized recommendations
- `.devagent/workspace/reviews/[epic-id]/screenshots/` — Visual evidence from Epic execution

## Integration with Core Handoff
This enhancement extends the core handoff workflow. Follow these steps:

1. **First:** Execute the core handoff workflow (`.devagent/core/workflows/handoff.md`)
2. **Then:** Apply these Ralph-specific enhancements if Epic ID is available
3. **Output:** Enhanced handoff prompt with Ralph context included

## Notes
- These enhancements are optional and only apply when Epic context is available
- The core handoff workflow remains unchanged and portable
- Improvement reports use categories: Documentation, Process, Rules & Standards, Tech Architecture
- Priorities: Critical, High, Medium, Low
