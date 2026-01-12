---
name: Revise Report Generation
description: >-
  Generates structured revise reports for Epics by aggregating task comments and learnings.
  Use when: (1) An Epic is completed or substantially progressed,
  (2) You want to consolidate "Revision Learning" comments from multiple tasks,
  (3) You need a traceability report linking tasks to commits.
---

# Revise Report Generation

Generates structured revise reports to capture insights, learnings, and traceability from Beads Epics.

## Prerequisites

- Beads Epic ID (e.g., `bd-1234`)
- Beads CLI (`bd`) installed and configured
- Tasks within the Epic populated with comments (specifically "Revision Learning" and "Commit")

## Report Structure

### Epic Revise Report

**1. Epic Summary**
- Status of the Epic and child tasks.
- Overall completion rate.

**2. Traceability Matrix**
- Table mapping Task ID -> Title -> Status -> Commit Hash.

**3. Consolidated Learnings**
- **Process & Workflow:** Insights about how we work.
- **Tooling & Infrastructure:** Issues/Improvements for Ralph, CLI, etc.
- **Code & Architecture:** Learnings about the codebase.
- **Documentation:** Gaps in docs/specs.

**4. Action Items**
- Concrete steps to improve the process or codebase based on the learnings.

## Report Generation Process

### Step 1: Data Gathering

**Command:** `bd list --parent <EpicID> --json`
- Retrieves all child tasks.

**For each task:** `bd comments <TaskID> --json`
- Retrieves all comments.
- **Filter:** Look for comments starting with:
    - `Revision Learning:`
    - `Commit:`
    - `Quality gates failed` (to track rework)

### Step 2: Analysis & Categorization

**Traceability:**
- Extract Commit Hash and Subject from `Commit:` comments.
- If missing, flag as "Missing Traceability".

**Learning Categorization:**
- Parse text after `Revision Learning:`.
- Classify into:
    - **Process:** Instructions, prompting, workflow steps.
    - **Tooling:** Ralph script, Beads CLI, terminal issues.
    - **Code:** Coding patterns, libraries, APIs.
    - **Docs:** Missing context, unclear specs.
    - **Other:** specific task details.

### Step 3: Report Construction

**Filename:** `YYYY-MM-DD_revise-report-epic-<EpicID>.md`
**Location:** `.devagent/workspace/reviews/`

**Template:**
```markdown
# Epic Revise Report - <Epic Title>

**Date:** YYYY-MM-DD
**Epic ID:** <EpicID>
**Status:** <EpicStatus>

## Executive Summary
<2-3 sentence overview of the epic's execution and key takeaways>

## Traceability Matrix

| Task ID | Title | Status | Commit |
| :--- | :--- | :--- | :--- |
| bd-xxxx.1 | Implement Feature X | closed | `a1b2c3d` - feat: ... |
| bd-xxxx.2 | Fix Bug Y | in_progress | *Pending* |

## Consolidated Learnings

### Process & Workflow
- <Learning 1> (from Task bd-xxxx.1)
- <Learning 2>

### Tooling & Infrastructure
- <Learning>

### Code & Architecture
- <Learning>

### Documentation
- <Learning>

## Action Items
1. [ ] <Action Item>
2. [ ] <Action Item>
```

## Validation

- Ensure every "Revision Learning" is captured.
- Ensure every "Commit" is linked.
- Verify Action Items are actionable.
