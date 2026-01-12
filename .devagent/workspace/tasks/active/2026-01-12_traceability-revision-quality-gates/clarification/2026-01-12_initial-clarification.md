# Clarification Packet: Traceability & Revision Quality Gates

- **Task:** 2026-01-12_traceability-revision-quality-gates
- **Date:** 2026-01-12
- **Mode:** Task Clarification
- **Status:** Validated

## Feature Overview
**Goal:** Enhance Ralph's autonomous process by enforcing traceability (linking commits to tasks) and capturing localized revision learnings, culminating in an AI-generated Epic-level improvement report.

**Context:** Currently, revision reports are often JSON-based and centralized, which disconnects learnings from the specific work context. We want to move to a model where learnings are captured as comments on the specific task, and then aggregated by AI into a meaningful report to drive process and documentation improvements.

## Validated Requirements

### 1. Problem Statement
- **Current State:** Revision learnings are siloed in JSON files; traceability between commits and tasks relies on ad-hoc discipline.
- **Desired State:** Every task explicitly links its delivering commit and captures execution learnings (or explicit "no issues" statements).
- **Validation:** ✅ Answered (User confirms need for localized learning & traceability).

### 2. Success Criteria
- **Task Level:**
  - 100% of completed Ralph tasks have a comment with Commit Hash + Subject.
  - 100% of completed Ralph tasks have a "Learning/Status" comment (even if just "no issues").
- **Epic Level:**
  - Automatic generation of an aggregated "Epic Retrospective Report" upon Epic completion.
  - Report successfully categorizes insights into: Process, Documentation, Tooling/CLI, Architecture/Code.
- **Validation:** ✅ Answered (Metrics defined: Existence of report & comments).

### 3. Users & Personas
- **Primary:** Developers using Ralph (need low-friction way to log).
- **Secondary:** Team Leads/Process Owners (consumers of the Epic report).
- **Validation:** ✅ Answered (Implicit in "our final report").

### 4. Constraints
- **Data Source:** Must use *all* comments from the tasks to ensure full context is captured.
- **Noise Management:** Must use AI summarization to filter noise vs. raw dump.
- **Validation:** ✅ Answered (AI Summarization required).

### 5. Scope Boundaries
- **In-Scope:**
  - Updating `ralph.sh` to enforce/post commit comments.
  - Updating Ralph workflows to prompt/require learning comments.
  - Developing the "Epic Report Generator" skill/workflow (AI-driven).
  - Categorization: Process, Documentation, Tooling/CLI, Architecture/Code.
- **Out-of-Scope:**
  - Manual formatting of reports (must be automated).
  - Complex Git verification (just hash/subject presence is sufficient for now).
- **Validation:** ✅ Answered.

### 6. Solution Principles
- **Localized Learning:** Capture insights *where* they happen (on the task).
- **Automated Aggregation:** Don't make humans compile reports; use AI.
- **Mandatory Reflection:** Even "nothing to report" requires an explicit note to ensure the step wasn't skipped.
- **Validation:** ✅ Answered.

### 7. Dependencies
- **Beads CLI:** Ability to read/fetch comments from multiple tasks programmatically.
- **LLM Access:** For summarizing and categorizing the comment stream.
- **Validation:** ✅ Answered (Implicit in implementation plan).

### 8. Acceptance Criteria
- **Quality Gate (Task):** Task cannot be marked "Complete" without:
  1. A comment containing Commit Hash & Subject.
  2. A comment containing a Learning or "Nothing to report" statement.
- **Quality Gate (Epic):** Epic cannot be marked "Complete" until the `Epic Retrospective Report` exists in `.devagent/workspace/reviews/`.
- **Report Format:** Markdown file containing categorized summaries (Process, Docs, Tooling, Code).
- **Validation:** ✅ Answered.

## Assumptions Log
| Assumption | Owner | Validation Required | Method |
|------------|-------|---------------------|--------|
| Beads CLI supports fetching comments for a list of tasks efficiently | Jake | Yes | Tech Spike during Plan |
| AI context window can handle the volume of "all comments" for an Epic | Jake | Yes | Estimate token count in Plan |

## Clarification Session Log

**Q1: How should "Revision Learning" be enforced?**
- **A:** Interactive/Checklist. Space provided for learnings; mandatory to report something (even if "why nothing").

**Q2: Format for "Epic-level final report"?**
- **A:** Aggregated Markdown file in `.devagent/workspace/reviews/`.

**Q3: Traceability content in comments?**
- **A:** Minimal: Commit Hash + Subject line.

**Q4: How to identify "learning" comments?**
- **A:** Use *all* comments as input; let AI filter/summarize.

**Q5: Trigger for Epic report?**
- **A:** Automatic Epic Quality Gate (when last task is done/Epic is closing).

**Q6: Report Categories?**
- **A:** Process Improvements, Documentation Updates.

**Q7: Handling "All Comments" noise?**
- **A:** AI Summarization (not raw dump).

**Q8: Additional Categories?**
- **A:** Tooling/CLI, Architecture/Code.

**Q9: Block task if no comments?**
- **A:** Yes. "Very rarely would we have nothing to report, but if there is nothing let's report why."

## Next Steps
- **Readiness:** **Ready for Planning.** Requirements are clear.
- **Action:** Run `devagent create-plan` to design the technical implementation for `ralph.sh` updates and the new "Epic Report" agent skill.
