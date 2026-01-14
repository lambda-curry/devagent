# AGENTS.md Structure Analysis

- Analysis Date: 2026-01-14
- Current File: `.devagent/plugins/ralph/AGENTS.md`
- Current Length: 140 lines
- Target Length: 80-100 lines
- Related Plan: `.devagent/workspace/tasks/active/2026-01-14_improve-ralph-prompt/plan/2026-01-14_improve-ralph-prompt-plan.md`
- Related Research: `.devagent/workspace/tasks/active/2026-01-14_improve-ralph-prompt/research/2026-01-14_ralph-prompting-best-practices.md`

## Current Structure Analysis

### Section Breakdown with Line Counts

| Section | Lines | Line Range | Verbosity | Notes |
|---------|-------|------------|-----------|-------|
| Title | 2 | 1-2 | Low | Standard header |
| **Commit Messaging Guidelines** | 19 | 3-21 | **High** | Very detailed with examples, CI/CD rules, body structure |
| **Task Context & Beads Integration** | 19 | 23-41 | Medium | Detailed but necessary context |
| Ralph Automation Agents | 11 | 43-53 | Low | Brief, reference-style |
| **Quality Gates & Verification** | 23 | 55-77 | Medium | Checklist format, needs reframing as mandatory blockers |
| **Task Commenting for Traceability** | 33 | 79-111 | **Very High** | Extremely detailed with multiple subsections, formats, examples |
| Decision-Making Expectations | 4 | 113-116 | Low | Brief, can merge with commit messaging |
| Failure Management & Status Updates | 7 | 118-124 | Low | Brief, needs enhancement with explicit criteria |
| Epic Quality Gate & Retrospectives | 11 | 126-136 | Low | Reference-style, keep as-is |
| References | 3 | 138-140 | Low | Standard references |

**Total: 140 lines**

### Verbose Sections Identified

1. **Commit Messaging Guidelines (19 lines)** - Lines 3-21
   - Detailed CI/CD optimization rules with exceptions
   - Body structure with 6 recommended sections
   - Can be consolidated to 8-10 lines with concise rules and examples

2. **Task Commenting for Traceability (33 lines)** - Lines 79-111
   - Very detailed mandatory steps (6 steps)
   - Multiple comment format examples
   - Screenshot documentation details
   - Can be reduced to 12-15 lines with essential requirements only

3. **Quality Gates & Verification (23 lines)** - Lines 55-77
   - While not overly verbose, needs structural change: reframe as mandatory validation checkpoints
   - UI verification section is detailed but necessary
   - Can be streamlined to 15-18 lines with mandatory blocker framing

### Missing High-Level Guidance

**Critical Gap:** The document lacks a high-level execution strategy section at the top. Current structure jumps directly into detailed commit messaging guidelines without explaining:
- Ralph's role and approach
- Overall execution flow
- Key principle: no task complete until all gates pass

## Research Recommendations Mapping

### Recommendation 1: Restructure with Hierarchical Organization
**Status:** ✅ Mapped
**Current Issue:** No high-level strategy section
**Change Needed:** Add "High-Level Execution Strategy" section at the top (NEW - 5-7 lines)

### Recommendation 2: Make Quality Gates Mandatory Blockers
**Status:** ✅ Mapped
**Current Issue:** Quality gates presented as checklist to "generate and verify" but not explicitly blocking
**Change Needed:** 
- Reframe section title: "Quality Gates & Verification" → "Validation Gates"
- Add explicit rule: "You MUST NOT update task status to 'closed' until ALL validation gates pass"
- Add failure handling: "If any validation gate fails, you MUST fix the issue or mark task as 'blocked' with reason"
- Estimated impact: +2-3 lines for mandatory blocker language

### Recommendation 3: Add High-Level Execution Strategy Section
**Status:** ✅ Mapped
**Current Issue:** Missing entirely
**Change Needed:** 
- Add new section at top (after title, before detailed guidelines)
- Content: Ralph's role, approach (read → plan → implement → verify → review → commit → update status), key principle
- Estimated length: 5-7 lines

### Recommendation 4: Enhance Status Management with Explicit Criteria
**Status:** ✅ Mapped
**Current Issue:** "Failure Management & Status Updates" section is brief (7 lines) and lacks explicit criteria
**Change Needed:**
- Enhance with explicit criteria for each status:
  - `closed`: All acceptance criteria met, all validation gates passed, work committed
  - `blocked`: Cannot proceed due to external dependency or unresolvable issue (with reason)
  - `in_progress`: Work in progress, retry needed, or waiting for next iteration
- Estimated impact: +3-4 lines

### Recommendation 5: Simplify Verbose Sections
**Status:** ✅ Mapped
**Current Issue:** Commit messaging (19 lines) and task commenting (33 lines) are too verbose
**Change Needed:**
- Commit Messaging: Consolidate to 8-10 lines with concise rules and examples
- Task Commenting: Reduce to 12-15 lines with essential requirements only
- Estimated reduction: ~20-25 lines saved

### Recommendation 6: Add Task Execution Flow Section
**Status:** ✅ Mapped
**Current Issue:** No explicit step-by-step flow section
**Change Needed:**
- Add "Task Execution Flow" section after high-level strategy
- Natural progression: read context → plan → implement → verify → review → commit → update status
- Estimated length: 6-8 lines

### Recommendation 7: Error Handling Enhancement
**Status:** ✅ Mapped
**Current Issue:** Error handling mentioned briefly in "Failure Management" but not explicit
**Change Needed:**
- Enhance error handling with explicit rules:
  - "If task cannot be completed, mark status as 'blocked' with reason"
  - "Never proceed silently when operations fail"
  - "Log decisions and state changes for debugging"
- Can be integrated into "Status Management" section
- Estimated impact: +2-3 lines

## Proposed New Structure

### Hierarchical Organization (High-Level First)

1. **Title** (2 lines) - Keep as-is

2. **High-Level Execution Strategy** (NEW - 5-7 lines)
   - Ralph's role: Execute tasks autonomously with built-in quality verification
   - Approach: Read context → Plan → Implement → Verify → Review → Commit → Update Status
   - Key principle: No task is complete until all validation gates pass and work is verified

3. **Task Execution Flow** (NEW - 6-8 lines)
   - Step-by-step high-level flow
   - Natural progression without artificial phase boundaries
   - Reference to detailed sections below

4. **Task Context & Beads Integration** (15-17 lines, reduced from 19)
   - Keep essential content, simplify wording
   - Remove redundancy

5. **Validation Gates** (15-18 lines, reframed from 23)
   - Reframe from "Quality Gates & Verification"
   - Explicit mandatory blocker language
   - Keep 7-point checklist but frame as validation gates
   - UI verification rules (keep but streamline)

6. **Status Management** (10-12 lines, enhanced from 7)
   - Merge "Failure Management & Status Updates" and "Decision-Making Expectations"
   - Add explicit criteria for each status (closed, blocked, in_progress)
   - Add error handling rules

7. **Commit Messaging Guidelines** (8-10 lines, reduced from 19)
   - Consolidate to concise rules with examples
   - Keep essential: Conventional Commits format, CI/CD optimization, task ID reference
   - Simplify body structure guidance

8. **Task Commenting for Traceability** (12-15 lines, reduced from 33)
   - Essential requirements only
   - Keep: Commit comment, Revision Learning format, screenshot documentation
   - Remove excessive detail and examples

9. **Ralph Automation Agents** (11 lines) - Keep as-is

10. **Epic Quality Gate & Retrospectives** (11 lines) - Keep as-is

11. **References** (3 lines) - Keep as-is

### Estimated Line Counts

| Section | Current | Proposed | Change |
|---------|---------|----------|--------|
| Title | 2 | 2 | 0 |
| High-Level Execution Strategy | 0 | 6 | +6 |
| Task Execution Flow | 0 | 7 | +7 |
| Task Context & Beads Integration | 19 | 16 | -3 |
| Validation Gates | 23 | 16 | -7 |
| Status Management | 11 | 11 | 0 |
| Commit Messaging Guidelines | 19 | 9 | -10 |
| Task Commenting for Traceability | 33 | 13 | -20 |
| Ralph Automation Agents | 11 | 11 | 0 |
| Epic Quality Gate & Retrospectives | 11 | 11 | 0 |
| References | 3 | 3 | 0 |
| **Total** | **140** | **98** | **-42** |

**Target Achievement:** 98 lines (within 80-100 line target range)

## Key Changes Summary

1. **Add high-level guidance first** - Strategy and flow sections at top
2. **Reframe quality gates** - Make explicit mandatory blockers
3. **Enhance status management** - Add explicit criteria for each status
4. **Simplify verbose sections** - Reduce commit messaging and task commenting by ~30 lines
5. **Maintain all functionality** - No information lost, just reorganized and streamlined

## Validation Checklist for Task 2

- [ ] High-Level Execution Strategy section added at top
- [ ] Task Execution Flow section added with natural progression
- [ ] Quality Gates reframed as "Validation Gates" with mandatory blocker language
- [ ] Status Management enhanced with explicit criteria for closed/blocked/in_progress
- [ ] Commit Messaging Guidelines simplified to 8-10 lines
- [ ] Task Commenting for Traceability simplified to 12-15 lines
- [ ] Error Handling rules integrated into Status Management
- [ ] Total length reduced to 80-100 lines
- [ ] All existing functionality preserved
- [ ] Prompt construction compatibility verified (ralph.sh lines 231-280)

## Compatibility Notes

**ralph.sh Prompt Construction (lines 231-280):**
- Loads AGENTS.md via `cat "$AGENTS_MD_FILE"` (line 235)
- Injects as `### AGENT OPERATING INSTRUCTIONS` (line 265)
- No parsing or structure-dependent logic
- **Compatibility:** ✅ Any markdown structure will work - no changes needed to ralph.sh
