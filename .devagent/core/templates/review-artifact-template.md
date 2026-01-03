# PR Review: #<pr-number>

- PR: <pr-url>
- Author: <author>
- Date: <review-date>
- Related Task: <task-hub-link> (optional, remove if not applicable)
- Linear Issues: <issue-ids> (if present) / ⚠️ No Linear issues linked

## Requirements Validation

### Linear Issue Requirements

<!-- If Linear issues are present: -->
<!-- For each Linear issue, include a section like this: -->

**Issue: <issue-id>**
- Issue Title: <issue-title>
- Issue URL: <issue-url>
- Acceptance Criteria:
  - [ ] <criterion 1> - ✅ Addressed / ⚠️ Partial / ❌ Missing
  - [ ] <criterion 2> - ✅ Addressed / ⚠️ Partial / ❌ Missing
  - [ ] <criterion 3> - ✅ Addressed / ⚠️ Partial / ❌ Missing

**Requirements Summary:**
- ✅ Fully Addressed: <count>
- ⚠️ Partially Addressed: <count>
- ❌ Missing: <count>

<!-- If no Linear issues are present: -->
<!-- Use this section instead: -->

⚠️ **No Linear issues linked to this PR**

- Review focused on code quality and standards compliance
- Consider creating/attaching Linear issue for requirements traceability

### Gaps Identified

<!-- List any requirements gaps or missing implementations -->
- <gap 1: specific requirement not addressed>
- <gap 2: incomplete implementation>
- <gap 3: missing acceptance criteria>

<!-- If no gaps, use: -->
None identified.

## Open Review Comments

<!-- Analyze existing PR review comments and their importance -->
- **Total open comments:** <count>
- **Blocking comments:** <count> (must address before merge)
  - <comment 1: author, summary>
  - <comment 2: author, summary>
- **Critical comments:** <count> (should address)
  - <comment 1: author, summary>
  - <comment 2: author, summary>
- **Minor comments:** <count> (nice to have)
  - <comment 1: author, summary>

<!-- If no open comments, use: -->
No open review comments.

## Code Quality Assessment

### Standards Compliance

- [ ] Follows AGENTS.md guidelines
- [ ] Follows Cursor rules (`.cursorrules` or workspace rules)
- [ ] Proper error handling implemented
- [ ] Tests included (if required by project standards)
- [ ] Documentation updated (code comments, README, etc.)
- [ ] TypeScript/types properly defined (if applicable)
- [ ] No hardcoded secrets or credentials
- [ ] Follows project code style conventions

### Issues Found

<!-- List specific code quality issues -->
- <issue 1: description and file location>
- <issue 2: description and file location>
- <issue 3: description and file location>

<!-- If no issues, use: -->
None identified.

### Strengths

<!-- Highlight positive aspects of the code -->
- <strength 1: well-structured code, good patterns, etc.>
- <strength 2: comprehensive tests, clear documentation, etc.>

## Review Summary

### ✅ Strengths

- <strength 1: specific positive observation>
- <strength 2: specific positive observation>
- <strength 3: specific positive observation>

### ⚠️ Concerns

- <concern 1: area that needs attention>
- <concern 2: potential issue or improvement>
- <concern 3: missing consideration>

### 📊 Confidence Score

**Overall Confidence: <score>% (<label: High/Medium/Low>)**

**Score Breakdown:**
- **Requirements Coverage:** <score>% (<fully-addressed>/<total> requirements met, <missing> missing, <partial> partial)
- **Code Quality:** <score>% (<issues-count> issues found, <standards-count>/<total> standards met)
- **Open Review Comments:** <score>% (<blocking-count> blocking, <critical-count> critical, <minor-count> minor, <total> total)
- **Risk Factors:** <count> critical items identified

**Confidence Factors:**
- ✅ Positive indicators: <positive factors>
- ⚠️ Concerns affecting confidence: <concerns>
- 🔴 Blockers: <blocking items> (if any)

**Recommendation:**
- <Ready to merge / Needs minor fixes / Needs significant work / Blocked>

*Confidence score calculated based on requirements validation, code quality assessment, open review comments, and identified risk factors. Scores are guidelines; use professional judgment for final decisions.*

### 🔗 Related Work

- Task Hub: <link> (if applicable) / None
- Linear Issues: <links> (if present) / None linked
- Related PRs: <links> (if any)
- Related Research: <links> (if any)

## Next Steps

- [ ] <action item 1: specific task to address>
- [ ] <action item 2: specific task to address>
- [ ] <action item 3: specific task to address>
- [ ] Consider creating/attaching Linear issue (if no Linear issues present and appropriate)
- [ ] Post review to GitHub PR (optional, requires human confirmation)
- [ ] Post review to Linear issue(s) (optional, requires human confirmation, only if Linear issues present)

## Notes

<!-- Any additional context, assumptions, or questions -->
<additional-notes>
