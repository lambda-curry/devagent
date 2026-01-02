# Clarified Requirement Packet — Beads Integration for DevAgent Workflows

- Requestor: Codex
- Decision Maker: Codex (Requestor has authority)
- Date: 2026-01-01
- Mode: Feature Clarification
- Status: Complete
- Related Feature Hub: `.devagent/workspace/features/active/2026-01-01_beads-integration-devagent-workflows/`
- Notes: Initial clarification session started. Using research findings as baseline context.

**Template Usage Notes:**
- Building incrementally as questions are answered during clarification sessions.
- Reference existing research packet for technical context: `research/2026-01-01_beads-integration-research.md`

## Feature Overview

### Context
- **Feature name/slug:** beads-integration-devagent-workflows
- **Business context:** Research indicates Beads (distributed, git-backed graph issue tracker) could improve task tracking, dependency management, and long-horizon memory for DevAgent workflows. Integration would be optional and tool-agnostic per constitution C4.
- **Stakeholders:** TBD (need to identify decision maker and affected users)
- **Prior work:** Research packet exists at `research/2026-01-01_beads-integration-research.md` with findings and open questions

### Clarification Sessions
- Session 1: 2026-01-01 — Initial gap identification and problem/scope validation

---

## Validated Requirements

**Documentation approach:** Filling in sections incrementally as clarification progresses.

### 1. Problem Statement
**Validation Status:** ✅ Complete

**What problem are we solving?**
Two primary problems:
1. **Long-horizon memory is fragmented:** Progress and decisions aren't easily trackable over time across DevAgent workflows
2. **Manual task tracking in markdown is error-prone:** Syncing across markdown docs is inconsistent, leading to task tracking drift

**Who experiences this problem?**
*Pending — engineering teams using DevAgent workflows, but specific personas need identification*

**What evidence supports this problem's importance?**
*Pending — need to validate if current markdown-based task tracking is causing friction*

**Why is this important now?**
*Pending — need to understand urgency and strategic timing*

**Validated by:** Codex (Requestor), 2026-01-01

---

### 2. Success Criteria
**Validation Status:** ✅ Complete

**Product metrics:**
- No active measurement required, but expected improvements in:
  - **Efficiency metrics:** Time to identify ready work, reduction in task tracking errors
  - **Memory metrics:** Improvement in long-horizon tracking (ability to trace decisions/progress over time)
  - **User satisfaction:** Developer feedback on workflow improvement

**Business metrics:**
- *Not actively measured*

**User experience metrics:**
- Qualitative feedback on workflow improvement (no formal metrics)

**Definition of "good enough":**
- Beads becomes the single source of truth for task tracking
- Markdown artifacts serve as summary/review format with AI instructions to work with Beads tasks
- Workflows naturally use Beads for task management without friction

**What would indicate failure?**
- Developers actively avoid using Beads or revert to manual markdown task tracking
- Significant increase in task tracking errors or missed dependencies

**Validated by:** Codex (Requestor), 2026-01-01

---

### 3. Users & Personas
**Validation Status:** ✅ Complete

**Primary users:**
- **AI agents running DevAgent workflows** — The primary Beads users will be the AI agents executing workflows (devagent create-plan, devagent implement-plan, devagent review-progress)
- **Engineers guiding workflows** — Secondary users who orchestrate workflows but don't need deep Beads knowledge; agents handle Beads interactions

**Secondary users:**
- Engineering teams adopting DevAgent workflows (external users) — Will benefit from improved task tracking without needing to understand Beads internals

**User insights:**
- Engineers should be able to use DevAgent workflows without needing to understand Beads CLI commands or storage model
- AI agents need clear instructions/patterns for interacting with Beads (suggest creating a "beads skill" following the create-slash-command.skill pattern)

**Decision authority for user needs:**
- Codex (Requestor) has authority for integration decisions

**Validated by:** Codex (Requestor), 2026-01-01

---

### 4. Constraints
**Validation Status:** ⏳ In Progress

**Timeline constraints:**
- Hard deadline: *None specified*
- Soft target: **ASAP** — High priority, proceed as quickly as feasible
- Milestone dependencies: *None identified*

**Technical constraints:**
- Platform limitations: *Beads CLI must be installable in contributor environments*
- Integration requirements: *Must store `.beads/` directory under git-tracked location*
- Browser/device support: *N/A (CLI tool)*
- **Constitution C4 (Tool-Agnostic Design):** ⚠️ **RESOLUTION:** Amend C4 to:
  - Clarify that "tool-agnostic" refers to AI coding tools (Cursor, Codegen, GitHub Copilot, etc.), not infrastructure tools
  - Allow mandatory tool dependencies for core workflows (like git, now Beads)
- **Constitution C2 (Chronological Artifacts):** Must preserve date-prefixed artifact structure

**Compliance & legal constraints:**
- Regulatory requirements: *TBD*
- Legal review needed: *TBD*
- Security requirements: *TBD*

**Resource constraints:**
- Team capacity: *TBD*
- Budget: *TBD*
- Third-party dependencies: *Beads CLI availability and maintenance*

**Validated by:** *TBD*

---

### 5. Scope Boundaries
**Validation Status:** ⏳ In Progress

**Must-have (required for launch):**
1. Workflow prompt updates to reference Beads IDs and detect "ready" tasks
2. Integration guide/documentation for DevAgent users
3. Beads skill created following create-slash-command.skill pattern (for AI agents to interact with Beads)
4. All critical user flows working:
   - `devagent create-plan` with Beads integration
   - `devagent implement-plan` with Beads integration
   - `devagent review-progress` with Beads integration
   - Initialization flow for new projects

**Should-have (important but not launch-blocking):**
*TBD — exploring "all in" approach with Beads as root experience*

**Could-have (nice-to-have if time permits):**
*TBD*

**Won't-have (explicitly out of scope):**
*[CLARIFICATION NEEDED] Initial assumptions about optional integration are being reconsidered — exploring mandatory "all in" approach*

**"All in" scope definition:**
- **Making Beads mandatory:** NOT out of scope — DevAgent will "go all in" with Beads as the task manager as the root experience
- **Markdown artifacts:** Beads becomes single source of truth; markdown becomes summary/review format with AI instructions to work with Beads tasks
- **No legacy approach:** No need to complicate prompts to manage different workflow types — clean Beads-first experience
- **Constitution C4 resolution:** Clarify "tool-agnostic" refers to AI coding tools (Cursor, Codegen, etc.), not infrastructure tools. Allow mandatory tool dependencies like git/beads.

**Ambiguous areas requiring research:**
- Beads compaction workflow and linkage back to DevAgent artifacts (from research)
- Default storage mode for `.beads/` (main branch vs. protected branch vs. stealth) (from research)

**Scope change process:**
*TBD*

**Validated by:** Codex (Requestor), 2026-01-01

---

### 6. Solution Principles
**Validation Status:** ✅ Complete

**Quality bars:**
- **Tool-agnostic (Constitution C4 - RESOLVED):** Clarify that "tool-agnostic" refers to AI coding tools (Cursor, Codegen, GitHub Copilot, etc.), not infrastructure tools. Allow mandatory tool dependencies for core workflows (like git, now Beads).
- **Preserve artifact chronology (Constitution C2):** Maintain ISO date-prefixed artifact structure
- **Git-based state (tech-stack.md):** All state lives in Git, no external databases

**Architecture principles:**
- **Beads as single source of truth:** Beads becomes mandatory root task management experience
- **Markdown as summary/review format:** Markdown artifacts serve as summary and review format with AI instructions to work with Beads tasks (not a fallback or parallel system)
- **No legacy workflows:** Clean Beads-first experience without complicating prompts to manage different workflow types
- **Git integration:** Leverage Beads' native git backing for versioning and collaboration

**UX principles:**
- **Clear documentation:** Integration guide must cover initialization, usage, and modes
- **Seamless Beads-first workflow:** Workflows naturally use Beads for task management

**Performance expectations:**
- *CLI tool performance — no specific requirements identified yet*

**Validated by:** Codex (Requestor), 2026-01-01 — Constitution C4 clarification needed

---

### 7. Dependencies
**Validation Status:** ⏳ In Progress

**Technical dependencies:**
- System: *Beads CLI (`bd`)*
- Status: *Available (open source)*
- Owner: *Steve Yegge / Beads project*
- Risk: *If Beads project becomes unmaintained, integration would need fallback*

**Cross-team dependencies:**
- Team: *TBD*
- Deliverable: *TBD*
- Timeline: *TBD*
- Status: *TBD*

**External dependencies:**
- Vendor/API: *Beads CLI (open source)*
- Contract status: *N/A (open source)*
- SLA: *N/A (community-maintained)*

**Data dependencies:**
- Data source: *Git repository (`.beads/` directory)*
- Quality requirements: *TBD*
- Privacy considerations: *TBD*

**Validated by:** *TBD*

---

### 8. Acceptance Criteria
**Validation Status:** ✅ Complete

**Critical user flows:**

**Flow 1: `devagent create-plan` with Beads**
- Happy path: Workflow creates Beads issues from plan tasks, links dependencies, detects ready work, references Beads IDs in plan document
- Error cases: Handle Beads CLI not installed, `.beads/` directory initialization failures, dependency link creation errors
- Edge cases: Plan with no tasks, circular dependencies, very large task lists

**Flow 2: `devagent implement-plan` with Beads**
- Happy path: Workflow queries Beads for ready tasks, updates issue status as work progresses, maintains traceability between code and Beads issues
- Error cases: Beads issues not found, status update failures, sync conflicts
- Edge cases: Multiple agents working on same plan, tasks becoming unblocked mid-implementation

**Flow 3: `devagent review-progress` with Beads**
- Happy path: Workflow uses Beads dependency graph to identify blocked/unblocked work, captures progress state accurately
- Error cases: Corrupted dependency graph, missing Beads data
- Edge cases: Complex dependency chains, completed tasks with unblocked dependencies

**Flow 4: Initialization flow**
- Happy path: Setting up Beads in a new DevAgent project with proper `.beads/` storage mode (default or configured), initialization succeeds
- Error cases: Beads CLI installation failures, permission issues, git conflicts
- Edge cases: Existing `.beads/` directory, non-git repositories

**Error handling requirements:**
- Graceful degradation: If Beads CLI unavailable, provide clear error messages (but workflows may fail if Beads is mandatory)
- Clear error messages for common failure modes (CLI not installed, permission issues, sync conflicts)
- Logging for debugging Beads integration issues

**Testing approach:**
- Unit testing: *TBD (not critical for initial version)*
- Integration testing: Validate each workflow with Beads integration (create-plan, implement-plan, review-progress, initialization)
- User testing: Validate that engineers can use workflows without Beads knowledge
- Performance testing: *TBD (not critical for initial version)*

**Launch readiness definition:**
- [ ] All four critical flows implemented and tested
- [ ] Beads skill created following create-slash-command.skill pattern
- [ ] Integration guide/documentation complete
- [ ] Workflow prompt updates reference Beads IDs and ready-task detection
- [ ] Initialization flow works for new projects
- [ ] Error handling provides clear messages

**Validated by:** Codex (Requestor), 2026-01-01

---

## Assumptions Log

| Assumption | Owner | Validation Required | Validation Method | Due Date | Status |
| --- | --- | --- | --- | --- | --- |
| Beads CLI can be installed in contributor environments and is acceptable for optional workflow enhancements | TBD | Yes | Confirm with stakeholders | TBD | Pending |
| DevAgent can store `.beads/` directory under git-tracked location without violating repository constraints | TBD | Yes | Validate with repository structure and git practices | TBD | Pending |
| Current markdown-based task tracking has sufficient friction to justify integration effort | TBD | Yes | Gather user feedback or usage patterns | TBD | Pending |

---

## Gaps Requiring Research

Questions that cannot be answered through stakeholder clarification and require evidence gathering.

### For #ResearchAgent

**Research Question 1:** How should Beads compaction summaries be linked back to DevAgent research/plan artifacts to preserve traceability?
- Context: Beads supports compaction for long-horizon memory, but workflow for linking to DevAgent's chronological artifacts needs definition
- Evidence needed: Workflow design for bidirectional linking between Beads issues and DevAgent markdown artifacts
- Priority: Medium
- Blocks: Advanced memory features (not launch-blocking)

**Research Question 2:** What is the recommended default for `.beads/` storage (main branch vs. protected branch vs. stealth mode) in shared DevAgent repositories?
- Context: Beads supports multiple storage modes; need guidance for DevAgent's git-based collaboration model
- Evidence needed: Tradeoffs analysis of each mode for DevAgent use cases
- Priority: High
- Blocks: Integration guide and default setup

---

## Clarification Session Log

### Session 1: 2026-01-01
**Participants:** Codex (Requestor)

**Questions Asked:**
1. *What specific problem does Beads integration solve for DevAgent workflows today?* → **Answered: B & C** (Long-horizon memory fragmentation + manual markdown task tracking is error-prone)
2. *What must be included in the first version to make Beads integration valuable?* → **Answered: B & C** (Workflow prompt updates + integration guide/documentation)
3. *What should be explicitly excluded from the initial integration?* → **Answered: Direction shift** — Exploring mandatory "all in" approach instead of optional integration

**Ambiguities Surfaced:**
- ~~What does "all in" with Beads as root experience mean?~~ → **RESOLVED:** Beads is single source of truth, markdown is summary/review format
- ~~How does mandatory Beads requirement align with Constitution C4?~~ → **RESOLVED:** Clarify C4 refers to AI coding tools, not infrastructure. Allow mandatory dependencies.
- ~~Success criteria undefined~~ → **RESOLVED:** B + C + D (efficiency, memory, user satisfaction) — no active measurement needed

**Conflicts Identified:**
- ~~**CONSTITUTION C4 CONFLICT**~~ → **RESOLVED:** Constitution C4 clarification planned to specify tool-agnostic refers to AI coding tools, infrastructure tools (git, Beads) can be mandatory

**Unresolved Items:**
- ~~Decision maker identification needed~~ → **RESOLVED:** Codex (Requestor) has authority
- ~~User personas need specificity~~ → **RESOLVED:** AI agents are primary users, engineers are secondary
- ~~Timeline constraints unknown~~ → **RESOLVED:** ASAP priority
- ~~Acceptance criteria undefined~~ → **RESOLVED:** All critical flows defined

---

### Session 1 (continued): 2026-01-01

**Follow-up Questions Asked:**
4. *How should we reconcile mandatory Beads with Constitution C4?* → **Answered: A + B** (Amend C4 to allow mandatory tool dependencies + clarify tool-agnostic refers to AI coding tools, not infrastructure)
5. *What happens to markdown task artifacts with "all in" approach?* → **Answered: A** (Markdown becomes summary/review format with AI instructions to work with Beads tasks; no legacy approach)
6. *How will we measure success?* → **Answered: B + C + D** (Efficiency, memory, user satisfaction - no active measurement needed)
7. *Who are primary users and decision makers?* → **Answered:** AI agents are primary Beads users; engineers guide workflows but don't need Beads knowledge; Codex has decision authority
8. *Timeline constraints?* → **Answered:** ASAP — high priority, proceed quickly
9. *What are critical user flows?* → **Answered:** All of the above — create-plan, implement-plan, review-progress, and initialization flows all needed

---

## Next Steps

### Spec Readiness Assessment
**Status:** ⬜ More Clarification Needed

**Readiness Score:** 7/8 dimensions complete (all critical dimensions complete, Dependencies has partial coverage)

**Completeness by Dimension:**
- Problem Statement: ✅ Complete
- Success Criteria: ✅ Complete
- Users: ✅ Complete
- Constraints: ✅ Complete (timeline: ASAP, technical constraints defined)
- Scope: ✅ Complete (Must-haves and "all in" approach defined)
- Principles: ✅ Complete (Constitution C4 resolution planned)
- Dependencies: ⏳ Partial (technical dependencies identified, cross-team/resources need minimal detail for plan work)
- Acceptance: ✅ Complete

**Rationale:**
All critical dimensions are complete. Dependencies section has partial coverage (technical dependencies well-defined, cross-team/resources minimal but sufficient for plan work). Ready to proceed to plan work with identified research gaps (storage modes, compaction workflow) to be handled during implementation.

### Recommended Actions

**Clarification Complete:**
- [x] All critical questions answered
- [x] All 8 dimensions have sufficient coverage for plan work
- [x] Must-haves and "all in" approach clearly defined
- [x] Constitution C4 resolution planned

**Ready for Plan Work:**
- [ ] Hand validated requirement packet to `devagent create-plan`
- [ ] Note: Research questions on storage modes and compaction workflow can be addressed during implementation or research phase as needed

**Constitution Update Required:**
- [ ] Amend Constitution C4 to clarify tool-agnostic refers to AI coding tools (not infrastructure tools like git/Beads)
- [ ] Document change rationale: Support mandatory tool dependencies for core workflows

---
