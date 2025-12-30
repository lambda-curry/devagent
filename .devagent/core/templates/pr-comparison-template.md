# PR Comparison: <task-description>

- Comparison Date: <date>
- Related Task/Feature: <task-description>
- PRs Compared: <pr-count> (<pr-1-url>, <pr-2-url>, ...)

## Executive Summary

**Recommended PR: #<pr-number>**

**Overall Assessment:**
- **Ranking:** 1. PR #<best> (Score: <score>), 2. PR #<second> (Score: <score>), ...
- **Key Differentiator:** <why-best-is-best>
- **Merge Recommendation:** <recommendation-with-rationale>

## PR Rankings

### 1. PR #<pr-number> (Recommended) ⭐

- **PR:** <pr-url>
- **Author:** <author>
- **Score:** <total-score>/100
- **Status:** <open/merged/draft>

**Summary:**
<brief-summary-of-why-this-is-best>

**Strengths:**
- <strength-1>
- <strength-2>
- <strength-3>

**Areas for Improvement:**
- <area-1>
- <area-2>

**Completeness:** <score>/100
- Requirements Coverage: <fully-addressed>/<total> requirements fully met
- Implementation Completeness: <assessment>

**Code Quality:** <score>/100
- Standards Compliance: <standards-met>/<total> standards met
- Issues Found: <count> (critical: <count>, major: <count>, minor: <count>)

**Ease of Working With:** <score>/100
- Review Comments: <blocking>/<critical>/<minor> open comments
- Code Structure: <assessment>
- Documentation: <assessment>

---

### 2. PR #<pr-number>

- **PR:** <pr-url>
- **Author:** <author>
- **Score:** <total-score>/100
- **Status:** <open/merged/draft>

**Summary:**
<brief-summary>

**Strengths:**
- <strength-1>
- <strength-2>

**Areas for Improvement:**
- <area-1>
- <area-2>

**Completeness:** <score>/100
- Requirements Coverage: <fully-addressed>/<total> requirements fully met
- Implementation Completeness: <assessment>

**Code Quality:** <score>/100
- Standards Compliance: <standards-met>/<total> standards met
- Issues Found: <count> (critical: <count>, major: <count>, minor: <count>)

**Ease of Working With:** <score>/100
- Review Comments: <blocking>/<critical>/<minor> open comments
- Code Structure: <assessment>
- Documentation: <assessment>

**Items to Consider Pulling into Recommended PR:**
- <item-1: specific code or pattern from this PR>
- <item-2: feature or improvement>
- <item-3: documentation or test>

---

<!-- Repeat for each PR being compared -->

## Detailed Comparison

### Requirements Coverage

| Requirement | PR #<best> | PR #<other-1> | PR #<other-2> | Notes |
|-------------|-----------|--------------|--------------|-------|
| <requirement-1> | ✅ Full | ⚠️ Partial | ❌ Missing | <notes> |
| <requirement-2> | ✅ Full | ✅ Full | ✅ Full | All PRs meet this |
| <requirement-3> | ⚠️ Partial | ✅ Full | ❌ Missing | <notes> |

### Code Quality Metrics

| Metric | PR #<best> | PR #<other-1> | PR #<other-2> |
|--------|-----------|--------------|--------------|
| Standards Compliance | <score>/100 | <score>/100 | <score>/100 |
| Critical Issues | <count> | <count> | <count> |
| Major Issues | <count> | <count> | <count> |
| Minor Issues | <count> | <count> | <count> |
| Test Coverage | <assessment> | <assessment> | <assessment> |
| Documentation | <assessment> | <assessment> | <assessment> |

### Ease of Working With

| Factor | PR #<best> | PR #<other-1> | PR #<other-2> |
|--------|-----------|--------------|--------------|
| Blocking Comments | <count> | <count> | <count> |
| Code Complexity | <assessment> | <assessment> | <assessment> |
| File Organization | <assessment> | <assessment> | <assessment> |
| Merge Conflicts Risk | <low/medium/high> | <low/medium/high> | <low/medium/high> |

## Recommendations

### For Recommended PR (#<pr-number>)

**To Enhance Completeness:**
- <recommendation-1: pull from other PRs or new work>
- <recommendation-2>

**To Improve Code Quality:**
- <recommendation-1>
- <recommendation-2>

**To Improve Ease of Working With:**
- <recommendation-1>
- <recommendation-2>

### Items to Pull from Other PRs

**From PR #<other-pr-number>:**
- <specific-item-1: code, pattern, or feature with location/reference>
- <specific-item-2>

**From PR #<other-pr-number>:**
- <specific-item-1>
- <specific-item-2>

### Items Unique to Other PRs Worth Considering

**From PR #<other-pr-number>:**
- <unique-strength-1>
- <unique-strength-2>

**From PR #<other-pr-number>:**
- <unique-strength-1>
- <unique-strength-2>

## Scoring Methodology

**Overall Score Calculation:**
- Completeness (40% weight): Requirements coverage and implementation completeness
- Code Quality (35% weight): Standards compliance, issue severity, test coverage
- Ease of Working With (25% weight): Review comments, code structure, documentation, merge complexity

**Score Breakdown:**
- **Completeness Score:** Based on requirements fully addressed, partially addressed, and missing
- **Code Quality Score:** Starts at 100, deducts for issues (critical -20, major -10, minor -5), adds for standards compliance
- **Ease of Working With Score:** Based on open review comments (blocking -30, critical -15, minor -5), code complexity, documentation quality

## Next Steps

- [ ] Review recommended PR (#<pr-number>) in detail
- [ ] Identify specific code/features to pull from other PRs
- [ ] Create plan to integrate improvements from other PRs into recommended PR
- [ ] Consider closing or declining other PRs if recommended PR is chosen
- [ ] Update Linear issues with comparison findings (if applicable)

## Notes

<additional-context-or-considerations>
