---
name: Revise Report Generation
description: >-
  Generates structured revise reports for Ralph autonomous execution sessions.
  Use when: (1) Completing a Ralph execution session and wanting to capture issues,
  (2) Needing to document workflow improvements, system updates, or documentation fixes,
  (3) Tracking things that didn't go smoothly during execution for future optimization.
---

# Revise Report Generation

Generates structured revise reports to capture issues, improvements, and optimization opportunities from Ralph execution sessions.

## Prerequisites

- Ralph execution session completed or in progress
- Output directory for generated reports (default: `.devagent/workspace/reviews/`)
- Current date for report naming

## Report Structure

### Revise Report Categories

**1. Ralph Systems Issues**
- Plugin/skill malfunctions or unexpected behavior
- Beads integration problems
- Quality gate failures or configuration issues
- Performance bottlenecks in autonomous execution

**2. Workflow & Process Issues**
- Steps that didn't flow as expected
- Missing or unclear instructions in workflows
- Handoff problems between different components
- Resource gathering inefficiencies

**3. Code Rules & Documentation**
- Missing validation rules or linting gaps
- Documentation inconsistencies or gaps
- Template issues that caused confusion
- API/reference documentation problems

**4. Skills & Prompts**
- Skill execution failures or unexpected outputs
- Prompt clarity or instruction issues
- Missing error handling or edge cases
- Integration problems between skills

**5. Infrastructure & Tooling**
- Missing dependencies or environment issues
- CLI command problems or version conflicts
- File system permission or path issues
- External service integrations

## Report Generation Process

### Step 1: Initialize Report Structure

**Current Date:** Run `date +%Y-%m-%d` for report filename
**Report Format:** `YYYY-MM-DD_revise-report-session-<id>.md`
**Storage Location:** `.devagent/workspace/reviews/`

**Template Structure:**
```markdown
# Revise Report - Session <session-id>

**Date:** YYYY-MM-DD
**Session Context:** <brief description of what was being executed>
**Report Type:** End-of-Session Review

## Executive Summary
<2-3 sentence overview of key issues and recommendations>

## Issues Identified

### Ralph Systems
- **Issue:** <brief description>
- **Impact:** <how it affected execution>
- **Recommendation:** <proposed fix or improvement>
- **Priority:** [High|Medium|Low]

### Workflows & Process
[Repeat structure for each category]

## Action Items
1. [ ] <specific action item>
2. [ ] <another action item>

## System Improvements
<broader recommendations for Ralph system enhancements>

## Follow-up Required
- [ ] Code changes needed
- [ ] Documentation updates required
- [ ] Configuration adjustments
```

### Step 2: Issue Collection & Classification

**During Execution - Real-time Capture:**
- Log unexpected errors or behaviors immediately
- Note when manual intervention was required
- Track where automation broke down
- Record workarounds that were used

**End of Session - Comprehensive Review:**
- Review execution logs for patterns
- Analyze quality gate failure reasons
- Examine task completion rates and bottlenecks
- Identify recurring issues across multiple tasks

### Step 3: Report Population

**Issue Documentation Standards:**
- Use specific, actionable descriptions
- Include error messages or symptoms when relevant
- Note the frequency/reproducibility of issues
- Capture the context that led to the problem

**Classification Rules:**
- **Ralph Systems:** Core autonomous execution engine issues
- **Workflows:** Process flow and instruction problems  
- **Documentation:** Reference material and guidance issues
- **Skills:** Individual skill execution problems
- **Infrastructure:** Tooling and environment problems

### Step 4: Prioritization & Recommendations

**Priority Matrix:**
- **High:** Blocked execution, required manual intervention, data loss risk
- **Medium:** Slowed execution, required workarounds, quality impact
- **Low:** Minor inconveniences, cosmetic issues, optimization opportunities

**Recommendation Categories:**
- **Immediate Fix:** Code/configuration changes needed
- **Process Improvement:** Workflow or instruction updates
- **Documentation:** Clarification or addition of guidance
- **Future Enhancement:** System-level improvements

## Integration Points

### With Ralph Execution Loop
- Capture issues automatically during task execution
- Log quality gate failures with context
- Track manual intervention points
- Monitor Beads integration problems

### With DevAgent Workflows
- Feed recommendations into `devagent update-constitution` for governance updates
- Inform `devagent build-workflow` for workflow improvements
- Guide `devagent update-tech-stack` for infrastructure changes
- Connect to `devagent research` for deeper investigation

### With Code Quality Systems
- Update linting rules based on discovered issues
- Enhance type checking with new patterns
- Improve test coverage for edge cases found
- Add new quality gates for recurring problems

## Output Generation

**Files Generated:**
- **Primary Report:** `.devagent/workspace/reviews/YYYY-MM-DD_revise-report-session-<id>.md`
- **Action Items (optional):** `.devagent/workspace/reviews/YYYY-MM-DD_revise-actions-<id>.json` (for tracking)
- **Metrics (optional):** `.devagent/workspace/reviews/YYYY-MM-DD_revise-metrics-<id>.json` (for analysis)

**Action Items JSON Structure:**
```json
{
  "session_id": "<session-id>",
  "date": "YYYY-MM-DD",
  "action_items": [
    {
      "id": "<item-id>",
      "category": "systems|workflows|documentation|skills|infrastructure",
      "description": "<action description>",
      "priority": "high|medium|low",
      "estimated_effort": "hours",
      "assigned_to": "<role or system>",
      "dependencies": [],
      "status": "pending|in_progress|completed"
    }
  ],
  "metrics": {
    "total_issues": 0,
    "high_priority_issues": 0,
    "automation_breakdowns": 0,
    "manual_interventions": 0
  }
}
```

## Review & Follow-up Process

### Immediate Actions
- Review report within 24 hours of session completion
- Assign high-priority items to appropriate owners
- Create tasks in task management system for tracking
- Update documentation for low-hanging improvements

### Systemic Improvements
- Look for patterns across multiple reports
- Identify recurring issues that indicate architectural problems
- Plan system-level enhancements based on report data
- Update training and onboarding materials

### Continuous Integration
- Incorporate learnings into skill development
- Update workflow templates based on findings
- Enhance error detection and recovery mechanisms
- Improve monitoring and alerting for common issues

## Validation

Before finalizing report:
1. **Completeness Check:** All issues documented with sufficient detail
2. **Actionability:** Each issue has clear recommendation and priority
3. **Consistency:** Classification follows established patterns
4. **Integration:** Report connects to existing improvement processes
5. **Follow-up:** Clear ownership and timeline for action items

## Reference Documentation

- **Ralph Plugin:** See `.devagent/plugins/ralph/` for integration points
- **Quality Gates:** See `quality-gates/typescript.json` for configuration
- **Workflow System:** See `.devagent/core/AGENTS.md` for workflow documentation
- **Task Management:** See `.devagent/workspace/tasks/` for task tracking patterns