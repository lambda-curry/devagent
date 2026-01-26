# Clarified Requirement Packet — Ralph Branching Flow Simplification

- Requestor: Jake Ruesink (Owner)
- Decision Maker: Jake Ruesink
- Date: 2026-01-16
- Mode: Task Clarification
- Status: Complete
- Related Task Hub: `.devagent/workspace/tasks/active/DEV-32_ralph-branching-flow/`
- Related Research: `.devagent/workspace/tasks/active/DEV-32_ralph-branching-flow/research/2026-01-16_ralph-branching-flow-research.md`

## Task Overview

### Context
- **Task name/slug:** DEV-32_ralph-branching-flow
- **Business context:** Setup agent sometimes fails when creating branches, causing execution issues. Simplifying the flow by removing setup and final review agents and moving branch configuration to config.json will reduce complexity and failure points.
- **Stakeholders:** Jake Ruesink (Owner, Decision Maker)
- **Prior work:** 
  - Research completed: `.devagent/workspace/tasks/active/DEV-32_ralph-branching-flow/research/2026-01-16_ralph-branching-flow-research.md`
  - Linear Issue: [DEV-32](https://linear.app/lambdacurry/issue/DEV-32/ralph-branching-flow)

### Clarification Sessions
- Session 1: 2026-01-16 — Complete

---

## Clarified Requirements

### Scope & End Goal

**What needs to be done?**
Remove setup agent and final review agent from Ralph execution flow. Add branch configuration to config.json. Update ralph.sh to read branch configuration and perform basic validation.

**What's the end goal architecture or state?**
- config.json includes `git` section with `base_branch` and `working_branch`
- ralph.sh reads branch config and validates Epic/branches directly (no agent invocation)
- Setup agent and final review agent invocations removed from ralph.sh
- User configures branches before running ralph.sh

**In-scope (must-have):**
- Add `git` section to config.json schema
- Remove setup agent invocation from ralph.sh
- Remove final review agent trap from ralph.sh
- Add Epic validation to ralph.sh (direct check, not via agent)
- Add branch validation to ralph.sh (check current branch matches config)
- Update documentation to reflect new configuration requirements

**Out-of-scope (won't-have):**
- Automatic branch creation (user must create branches manually)
- PR automation (removed with final review agent)
- Workspace cleanup automation (user responsibility)

**Nice-to-have (could be deferred):**
- Backward compatibility handling (graceful degradation if git section missing)
- Enhanced error messages for configuration issues

---

### Technical Constraints & Requirements

**Platform/technical constraints:**
- Must work with existing bash script (ralph.sh)
- Must integrate with existing config.json structure
- Must preserve existing Epic validation logic (move to ralph.sh)
- Must work with existing setup/start Ralph workflows (`setup-ralph-loop`, `start-ralph-execution`)

**Architecture requirements:**
- config.json schema must include `git` section with `base_branch` and `working_branch`
- ralph.sh must read and validate git configuration
- setup-ralph-loop workflow must write `git` config fields (no branch creation/switching)

**Quality bars:**
- Clear error messages for all failure cases
- Fail fast on configuration errors
- No breaking changes to existing config.json structure (additive only)

---

### Dependencies & Blockers

**Technical dependencies:**
- System: Beads CLI (for Epic validation)
- Status: Available
- Owner: Existing system
- Risk: None

**Cross-team/external dependencies:**
- None identified

**Blockers or risks:**
- None identified

---

### Implementation Approach

**Implementation strategy:**
- Add `git` section to config.json schema (required fields: `base_branch`, `working_branch`)
- Update ralph.sh to read git config and validate Epic/branches directly
- Remove setup agent invocation (line 93 in ralph.sh)
- Remove final review agent trap (lines 114-124 in ralph.sh)
- Replace main branch check with working branch check
- Add Epic validation directly in ralph.sh (simple `bd show` check)
- Update setup-ralph-loop workflow Step 7 to write `git` config fields (no branch creation/switching)

**Patterns:**
- Follow existing config.json structure pattern (similar to `ai_tool` section)
- Use clear error messages for all validation failures
- Fail fast on configuration errors

**Design principles:**
- Simplicity: Remove agent invocations, use direct validation
- Explicit configuration: User controls branches upfront
- Clear errors: All failure cases have helpful error messages

---

### Acceptance Criteria & Verification

**How will we verify this works?**
- Test cases:
  1. ralph.sh fails with clear error if `git` section missing from config.json
  2. ralph.sh fails with clear error if `working_branch` doesn't exist
  3. ralph.sh fails with clear error if current branch doesn't match `working_branch`
  4. ralph.sh validates Epic ID directly (no agent invocation)
  5. setup-ralph-loop workflow writes `git` config fields and preserves existing settings

**What does "done" look like?**
- [ ] `git` section added to config.json schema
- [ ] ralph.sh reads and validates git configuration
- [ ] Setup agent invocation removed from ralph.sh
- [ ] Final review agent trap removed from ralph.sh
- [ ] Epic validation moved to ralph.sh (direct check)
- [ ] Branch validation added to ralph.sh (check current branch matches config)
- [ ] setup-ralph-loop workflow updated to write `git` config fields (no branch creation)
- [ ] Documentation updated to reflect new configuration requirements
- [ ] All test cases pass

**Testing approach:**
- Manual testing: Run ralph.sh with various configuration scenarios
- Manual testing: Run setup-ralph-loop workflow and verify `git` config fields are written/preserved (no branch creation)
- Verify error messages are clear and helpful

---

## Question Tracker

| Question | Status | Notes |
| --- | --- | --- |
| Should git section be required or optional in config.json? | ✅ answered | Required - fail immediately if missing. Also add a setup step in setup-ralph-loop to write git config fields (no branch creation). |
| What should happen if configured working branch doesn't exist? | ✅ answered | Fail immediately with clear error message (branch should have been created already) |
| What should happen if user is on wrong branch? | ✅ answered | Fail immediately with clear error message |
| How should setup-ralph-loop workflow handle git setup? | ✅ answered | Write `git.base_branch` and `git.working_branch` into config.json while preserving other settings (no branch creation/switching) |
| Should we preserve Epic validation? | ✅ answered | Yes - move to ralph.sh directly |
| Should we preserve workspace cleanup logic? | ✅ answered | No - user responsibility |

---

## Clarification Session Log

### Session 1: 2026-01-16
**Participants:** Jake Ruesink (Owner)

**Questions Asked:**

**1. Configuration Schema Design**
Should the `git` section be required or optional in config.json?
→ **Answer: A - Required** (fail immediately if missing). Also add setting these up as a step to the setup-ralph-loop workflow (no branch creation). (Jake Ruesink)

**2. Error Handling: Branch Existence**
What should happen if the configured `working_branch` doesn't exist locally?
→ **Answer: A - Fail immediately** with clear error message. We should have created it already. (Jake Ruesink)

**3. Error Handling: Wrong Branch**
What should happen if the user runs ralph.sh on a branch that doesn't match the configured `working_branch`?
→ **Answer: A - Fail immediately** with clear error message. (Jake Ruesink)

**4. Setup Ralph Loop: Git Configuration**
How should the git setup step work in the setup-ralph-loop workflow?
→ **Answer: A - Write `git.base_branch` and `git.working_branch` into config.json (preserving other settings). No branch creation or switching.** (Jake Ruesink)

---

## Assumptions Log

| Assumption | Owner | Validation Required | Validation Method | Due Date | Status |
| --- | --- | --- | --- | --- | --- |
| User will create branches manually before running ralph.sh | Jake Ruesink | No | N/A | N/A | Accepted |
| Epic validation logic can be moved to ralph.sh without issues | Jake Ruesink | No | Implementation testing | TBD | Accepted |
| Removing PR automation is acceptable tradeoff for simplicity | Jake Ruesink | No | N/A | N/A | Accepted |

---

## Gaps Requiring Research

None identified. All questions answered through clarification.

---

## Next Steps

### Spec Readiness Assessment
**Status:** ✅ Ready for Spec | ⬜ Research Needed | ⬜ More Clarification Needed

**Plan Readiness Assessment:**
- Critical gaps: All addressed
- Blockers: None identified
- Information: All key questions answered

**Rationale:**
All critical requirements have been clarified:
- Configuration schema: Required `git` section with `base_branch` and `working_branch`
- Error handling: Fail immediately for all validation failures with clear error messages
- Setup workflow integration: Write `git` config fields during setup (no branch creation/switching)
- Implementation approach: Remove agent invocations, add direct validation to ralph.sh
- Acceptance criteria: Clear test cases defined

Ready to proceed with plan creation.

### Recommended Actions

**Ready for plan creation:**
- [x] Hand validated requirement packet to `devagent create-plan`
- [x] Provide link to this clarification packet: `.devagent/workspace/tasks/active/DEV-32_ralph-branching-flow/clarification/2026-01-16_initial-clarification.md`
- [x] Highlight key decisions:
  - `git` section required in config.json (fail if missing)
  - Fail immediately for all validation errors (missing branch, wrong branch)
  - setup-ralph-loop writes git config fields (no branch creation/switching)
  - Remove setup and final review agent invocations
  - Move Epic validation to ralph.sh directly

---

## Change Log

| Date | Change | Author |
| --- | --- | --- |
| 2026-01-16 | Initial clarification session completed | Jake Ruesink |
