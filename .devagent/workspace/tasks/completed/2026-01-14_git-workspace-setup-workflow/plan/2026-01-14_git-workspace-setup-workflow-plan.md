# Git Workspace Setup Workflow Plan

- Owner: Jake Ruesink
- Last Updated: 2026-01-14
- Status: Draft
- Related Task Hub: `.devagent/workspace/tasks/completed/2026-01-14_git-workspace-setup-workflow/`
- Stakeholders: Jake Ruesink (AgentBuilder, Decision Authority)

---

## PART 1: PRODUCT CONTEXT

### Summary
Create two complementary deliverables for git workspace management: (1) A **DevAgent workflow** (`devagent new-worktree`) that provides manual, command-based worktree creation with optional uncommitted work migration, and (2) A **git-workspace skill** (open standard format) that enables automatic discovery and cross-platform usage of git worktree operations. This addresses the developer need to spin off unrelated feature work into separate worktrees while keeping work safe and organized, enabling concurrent development without context switching or stashing conflicts.

### Context & Problem
Developers working on one feature often need to start work on an unrelated feature without disrupting their current work. Current approaches (stashing, branch switching, multiple clones) have limitations: stashing requires context switching and can cause conflicts, branch switching loses uncommitted work context, and multiple clones consume disk space and require manual synchronization. Git worktrees provide an ideal solution—multiple checked-out branches sharing repository data but with independent working directories—but require manual git command knowledge and lack structured workflows for safe workspace management.

**Research findings** (`.devagent/workspace/tasks/completed/2026-01-14_git-workspace-setup-workflow/research/2026-01-14_workspace-best-practices-research.md`):
- Git worktrees enable concurrent development with shared repository data
- Cleanup is recommended but not automatic (safety checks prevent data loss)
- Common pattern: create worktree → work → commit → remove worktree
- Best practice for uncommitted work migration: stash → create worktree → apply stash

### Objectives & Success Metrics
- **Workflow Objective:** Developers can create new worktrees with a single command (`devagent new-worktree`) and optionally migrate uncommitted work safely
- **Skill Objective:** Agents automatically discover and use git workspace operations when relevant, enabling cross-platform portability
- **Success Metrics:**
  - Workflow successfully creates worktrees with proper branch management
  - Uncommitted work migration preserves git history and avoids conflicts
  - Skill auto-triggers when agents need git workspace operations
  - Both deliverables follow DevAgent's tool-agnostic design (Constitution C4)

### Users & Insights
- **Primary Users:** Developers using DevAgent workflows who need concurrent feature development
- **Secondary Users:** AI agents that need to work with git workspaces in any context
- **Key Insight:** Manual invocation (workflow) and automatic discovery (skill) serve complementary use cases—workflow for explicit workspace creation, skill for general git workspace operations

### Solution Principles
- **Tool-Agnostic Design (C4):** Both workflow and skill must work across Cursor, VS Code, GitHub, Codex, and other AI development tools
- **Human-in-the-Loop Defaults (C3):** Workflow prompts for confirmation on destructive operations (force removal, discarding uncommitted work)
- **Safety First:** Default to safe operations (clean removal, stash preservation), require explicit flags for destructive actions
- **Progressive Disclosure:** Skill uses metadata for discovery, detailed instructions loaded only when needed
- **Portability:** Workflow is part of `.devagent/core/` (portable), skill follows open standard format (cross-platform)

### Scope Definition
- **In Scope:**
  - DevAgent workflow (`devagent new-worktree`) for worktree creation and uncommitted work migration
  - Git-workspace skill (open standard) for automatic discovery of git worktree operations
  - Integration with DevAgent's workflow roster and command structure
  - Safety checks and error handling for workspace operations
- **Out of Scope / Future:**
  - Automatic cleanup automation (manual removal recommended per research)
  - Integration with specific CI/CD systems
  - Workspace management UI or visualization
  - Advanced worktree features (locking, submodule handling beyond basics)

### Functional Narrative

#### Flow 1: Create New Workspace (Workflow)
- **Trigger:** Developer runs `devagent new-worktree` with optional parameters (branch name, path, migrate uncommitted work)
- **Experience narrative:**
  1. Workflow validates git repository state and checks for existing worktrees
  2. If uncommitted work migration requested: stash current work, create worktree with new branch, apply stash to new worktree
  3. If no migration: create worktree with new branch (or existing branch if specified)
  4. Verify worktree creation and provide summary with path and branch name
  5. Recommend next steps (e.g., `cd` to new workspace, start working)
- **Acceptance criteria:**
  - Worktree created successfully at specified path
  - Branch created or checked out as specified
  - Uncommitted work (if migrated) preserved in new worktree
  - Main worktree remains clean (if migration occurred) or unchanged (if no migration)
  - Error messages clear and actionable

#### Flow 2: Agent Discovers Git Workspace Operations (Skill)
- **Trigger:** Agent needs to work with git workspaces (e.g., "create a worktree for feature X", "list existing worktrees", "remove worktree")
- **Experience narrative:**
  1. Skill metadata (name, description) triggers based on user request context
  2. Agent loads SKILL.md body with git worktree operation instructions
  3. Agent executes appropriate git commands with safety checks
  4. Agent references detailed patterns from `references/` if needed
- **Acceptance criteria:**
  - Skill auto-triggers when git workspace operations are mentioned
  - Instructions provide clear command patterns and safety considerations
  - Cross-platform compatibility maintained (works in Cursor, VS Code, GitHub, etc.)

### Technical Notes & Dependencies
- **Git Requirements:** Git 2.5+ (worktree support introduced in 2.5)
- **Dependencies:** None beyond standard git installation
- **Platform Considerations:** Path handling must work on Windows, macOS, and Linux
- **Git Limits:** Git has limits on number of worktrees (typically 2-3 per repository, configurable); workflow should handle gracefully
- **Integration Points:**
  - Workflow follows DevAgent workflow structure (`.devagent/core/workflows/new-worktree.md`)
  - Command file follows DevAgent command pattern (`.agents/commands/new-worktree.md` + `.cursor/commands/` symlink)
  - Skill follows open standard format (`.cursor/skills/git-workspace/SKILL.md`)

---

## PART 2: IMPLEMENTATION PLAN

### Scope & Assumptions
- **Scope focus:** Both workflow and skill implementation, following DevAgent patterns and open standard formats
- **Key assumptions:**
  - Git 2.5+ installed and available in PATH
  - Users have basic git knowledge (branching, stashing concepts)
  - Workflow invoked manually (explicit control)
  - Skill auto-discovered by agents (automatic activation)
- **Out of scope:** CI/CD integration, UI tooling, advanced worktree features

### Implementation Tasks

#### Task 1: Create DevAgent Workflow Definition
- **Objective:** Create the workflow definition file that orchestrates workspace creation and optional uncommitted work migration
- **Impacted Modules/Files:**
  - New: `.devagent/core/workflows/new-worktree.md`
- **References:**
  - Research: `.devagent/workspace/tasks/completed/2026-01-14_git-workspace-setup-workflow/research/2026-01-14_workspace-best-practices-research.md`
  - Workflow template: `.devagent/core/workflows/new-task.md` (structure reference)
  - Constitution: `.devagent/workspace/memory/constitution.md` (C3, C4)
  - Standard instructions: `.devagent/core/AGENTS.md`
- **Dependencies:** None
- **Acceptance Criteria:**
  - Workflow file follows DevAgent workflow structure (Mission, Standard Instructions Reference, Execution Directive, Inputs, Outputs, Workflow steps)
  - Workflow handles workspace creation with branch management
  - Workflow supports optional uncommitted work migration (stash → create → apply pattern)
  - Workflow includes safety checks (verify git repo, check for existing worktrees, validate paths)
  - Workflow follows tool-agnostic design (C4) and human-in-the-loop defaults (C3)
  - Workflow provides clear error messages and next-step recommendations
- **Testing Criteria:**
  - Manual testing: Run workflow with various inputs (with/without migration, different branch names, path conflicts)
  - Verify worktree creation, branch management, and uncommitted work preservation
  - Test error handling (invalid paths, existing worktrees, git errors)
- **Subtasks:**
  1. **Draft workflow structure** — Create workflow file with standard sections
     - Validation: Review against `.devagent/core/workflows/new-task.md` structure
  2. **Define input/output contracts** — Specify required/optional inputs, expected outputs
     - Validation: Inputs cover all use cases, outputs provide actionable information
  3. **Document git command sequences** — Specify exact git commands for each operation
     - Validation: Commands tested manually, follow research recommendations (stash → apply pattern)
  4. **Add safety checks and error handling** — Include validation steps and error messages
     - Validation: Error scenarios tested, messages clear and actionable
- **Validation Plan:** Review workflow against DevAgent standards, test with sample scenarios, verify tool-agnostic compliance

#### Task 2: Create Workflow Command File
- **Objective:** Create command file that provides standardized interface for workflow execution
- **Impacted Modules/Files:**
  - New: `.agents/commands/new-worktree.md`
  - New: `.cursor/commands/new-worktree.md` (symlink to `.agents/commands/new-worktree.md`)
- **References:**
  - Command template: `.cursor/commands/research.md` (structure reference)
  - Command README: `.cursor/commands/README.md` (integration patterns)
- **Dependencies:** Task 1 (workflow definition)
- **Acceptance Criteria:**
  - Command file follows DevAgent command structure (Instructions, Input Context placeholder)
  - Command file references workflow file correctly (`.devagent/core/workflows/new-worktree.md`)
  - Symlink created from `.cursor/commands/` to `.agents/commands/`
  - Command appears in Cursor command palette when symlinked
- **Testing Criteria:**
  - Verify command file structure matches template
  - Test symlink creation and Cursor integration
  - Verify workflow reference path is correct
- **Subtasks:**
  1. **Create command file** — Write `.agents/commands/new-worktree.md` following template
     - Validation: Structure matches `.cursor/commands/research.md` pattern
  2. **Create symlink** — Create symlink from `.cursor/commands/new-worktree.md` to `.agents/commands/new-worktree.md`
     - Validation: Symlink works, command appears in Cursor
  3. **Update command roster** — Add entry to `.cursor/commands/README.md` (if applicable)
     - Validation: Documentation updated, command discoverable
- **Validation Plan:** Verify command file structure, test symlink, confirm Cursor integration

#### Task 3: Create Git-Workspace Skill
- **Objective:** Create skill that teaches agents how to work with git workspaces/worktrees automatically
- **Impacted Modules/Files:**
  - New: `.cursor/skills/git-workspace/SKILL.md`
  - Optional: `.cursor/skills/git-workspace/references/git-worktree-patterns.md` (if detailed patterns needed)
- **References:**
  - Skill creator: `.cursor/skills/skill-creator/SKILL.md` (skill creation guide)
  - Skill example: `.cursor/skills/github-cli-operations/SKILL.md` (structure reference)
  - Research: `.devagent/workspace/tasks/completed/2026-01-14_git-workspace-setup-workflow/research/2026-01-14_workspace-best-practices-research.md`
  - Workflow vs skill guide: `.devagent/workspace/research/2025-12-25_workflow-vs-skill-decision-guide.md`
- **Dependencies:** None (skill is standalone)
- **Acceptance Criteria:**
  - Skill follows open standard format (SKILL.md with YAML frontmatter: name, description)
  - Description in frontmatter comprehensive enough for auto-discovery (includes "when to use" triggers)
  - SKILL.md body provides clear instructions for git worktree operations
  - Instructions cover: create, list, remove, prune operations with safety considerations
  - Skill is cross-platform portable (works in Cursor, VS Code, GitHub, etc.)
  - Skill follows progressive disclosure (metadata for discovery, body for details, references if needed)
- **Testing Criteria:**
  - Verify skill auto-triggers when git workspace operations mentioned
  - Test skill instructions with sample git worktree operations
  - Verify cross-platform compatibility (test in different environments if possible)
- **Subtasks:**
  1. **Create skill directory and SKILL.md** — Initialize skill structure with YAML frontmatter
     - Validation: Frontmatter format correct, description comprehensive for auto-discovery
  2. **Write skill body** — Document git worktree operations, patterns, safety checks
     - Validation: Instructions clear, cover all common operations, include safety considerations
  3. **Add reference documentation (if needed)** — Create `references/` file for detailed patterns if SKILL.md exceeds ~500 lines
     - Validation: Progressive disclosure maintained, references properly linked
  4. **Test auto-discovery** — Verify skill triggers appropriately in different contexts
     - Validation: Skill discovered when relevant, not triggered inappropriately
- **Validation Plan:** Review against skill-creator guidelines, test auto-discovery, verify cross-platform compatibility

#### Task 4: Update Workflow Roster Documentation
- **Objective:** Add new workflow to DevAgent workflow roster and update related documentation
- **Impacted Modules/Files:**
  - Modify: `.devagent/core/AGENTS.md` (workflow roster section)
  - Modify: `.cursor/commands/README.md` (command list, if applicable)
- **References:**
  - Workflow roster: `.devagent/core/AGENTS.md` (existing workflow entries)
  - Command README: `.cursor/commands/README.md` (command documentation pattern)
- **Dependencies:** Tasks 1, 2 (workflow and command created)
- **Acceptance Criteria:**
  - Workflow added to roster in `.devagent/core/AGENTS.md` with description and usage guidance
  - Command added to command list in `.cursor/commands/README.md` (if applicable)
  - Documentation follows existing patterns and formatting
- **Testing Criteria:**
  - Verify workflow appears in roster with correct description
  - Verify command appears in command list
  - Check documentation formatting and links
- **Subtasks:**
  1. **Add workflow to roster** — Insert entry in `.devagent/core/AGENTS.md` workflow list
     - Validation: Entry matches format of other workflows, description clear
  2. **Update command documentation** — Add command to `.cursor/commands/README.md` if applicable
     - Validation: Command documented, follows existing patterns
- **Validation Plan:** Review documentation updates, verify formatting, test links

### Implementation Guidance

**From `.devagent/core/AGENTS.md` → Standard Workflow Instructions:**
- **Date handling:** When creating dated documents, always run `date +%Y-%m-%d` first to get current date in ISO format. Use the output for YYYY-MM-DD portions of filenames.
- **Metadata retrieval:** To determine owner/author for metadata: run `git config user.name`. Use this value when owner is not explicitly provided in inputs.
- **Context gathering order:** Review in this order: (1) Internal agent documentation, (2) Workflow definitions, (3) Rules & conventions, (4) DevAgent workspace, (5) Fallback: README.* or docs/**
- **Storage patterns:** Task-scoped artifacts go to `.devagent/workspace/tasks/{status}/YYYY-MM-DD_task-slug/`, use `YYYY-MM-DD_<descriptor>.md` format for dated artifacts.

**From `.devagent/workspace/memory/constitution.md` → C3. Delivery Principles:**
- **Human-in-the-loop defaults:** Every agent interaction produces drafts that require explicit human confirmation before downstream automation proceeds.
- **Traceable artifacts:** All agent outputs must link to mission metrics and cite research inputs. All code changes must be traceable to specific tasks via commit messages and comments.
- **Iterate in thin slices:** Limit planning waves to five tasks and ensure each slice can deliver observable value within a week.

**From `.devagent/workspace/memory/constitution.md` → C4. Tool-Agnostic Design:**
- **Statement:** Agents, workflows, and tooling must be designed to be tool-agnostic by default, enabling use across any AI development tool (Cursor, Codegen, Codex, GitHub Copilot, etc.). Tool-specific implementations must be organized under clearly labeled tool-specific directory structures.

**From `.cursor/skills/skill-creator/SKILL.md` → Skill Creation Guidelines:**
- **Frontmatter description:** Include both what the Skill does and specific triggers/contexts for when to use it. Include all "when to use" information here - Not in the body. The body is only loaded after triggering.
- **Progressive disclosure:** Keep SKILL.md body to the essentials and under 500 lines to minimize context bloat. Split content into separate files when approaching this limit.
- **Concise is key:** Default assumption: Claude is already very smart. Only add context Claude doesn't already have.

**From `.devagent/workspace/research/2025-12-25_workflow-vs-skill-decision-guide.md` → Decision Framework:**
- **Workflow characteristics:** Manual/explicit invocation, part of DevAgent's structured workflow model, produces artifacts in `.devagent/workspace/` hierarchy.
- **Skill characteristics:** Automatic/discovery-based activation, cross-platform portability, standalone capability, specialized domain knowledge bundle.

### Release & Delivery Strategy
- **Milestone 1: Workflow Implementation** — Complete workflow definition and command file (Tasks 1, 2)
- **Milestone 2: Skill Implementation** — Complete git-workspace skill (Task 3)
- **Milestone 3: Documentation** — Update workflow roster and command documentation (Task 4)
- **Review Gates:** 
  - Workflow review: Verify workflow follows DevAgent patterns and safety checks
  - Skill review: Verify skill follows open standard format and auto-discovery works
  - Documentation review: Verify roster and command list updated correctly

### Approval & Ops Readiness
- **Required Approvals:** 
  - AgentBuilder (Jake Ruesink) — Workflow and skill design approval
- **Operational Checklist:**
  - Workflow tested with sample scenarios
  - Skill auto-discovery verified
  - Documentation updated and links verified
  - Cross-platform compatibility confirmed (if possible)

---

## Risks & Open Questions

| Item | Type | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Git worktree limits | Risk | Jake Ruesink | Document Git's worktree limits in workflow, handle gracefully with clear error messages | During Task 1 |
| Cross-platform path handling | Risk | Jake Ruesink | Test path handling on Windows/Mac/Linux, use git's path normalization where possible | During Task 1 |
| Skill auto-discovery accuracy | Risk | Jake Ruesink | Test skill triggers in various contexts, refine description if needed | During Task 3 |
| Uncommitted work migration edge cases | Question | Jake Ruesink | Test stash → apply pattern with various git states (conflicts, untracked files, etc.) | During Task 1 |
| Integration with existing setup agent | Question | Jake Ruesink | Determine if workflow should reference or integrate with setup agent patterns | Before Task 1 |
| Workspace path naming convention | Question | Jake Ruesink | Define standard (e.g., `../workspace-<slug>`, `../<branch-name>`) or make configurable | During Task 1 |

---

## Progress Tracking
Refer to the AGENTS.md file in the task directory (`.devagent/workspace/tasks/completed/2026-01-14_git-workspace-setup-workflow/AGENTS.md`) for instructions on tracking and reporting progress during implementation.

---

## Appendices & References

### Agent Documentation
- `AGENTS.md` (root) — Project-level agent context
- `.devagent/core/AGENTS.md` — Standard workflow instructions and workflow roster

### Coding Standards and Conventions
- `.devagent/workspace/memory/constitution.md` — Delivery principles (C3) and tool-agnostic design (C4)
- `.cursor/skills/skill-creator/SKILL.md` — Skill creation guidelines

### Related Documentation
- Research: `.devagent/workspace/tasks/completed/2026-01-14_git-workspace-setup-workflow/research/2026-01-14_workspace-best-practices-research.md` — Workspace best practices, cleanup strategies, git worktree patterns
- Workflow vs Skill Guide: `.devagent/workspace/research/2025-12-25_workflow-vs-skill-decision-guide.md` — Decision criteria for choosing workflow vs skill
- Task Hub: `.devagent/workspace/tasks/completed/2026-01-14_git-workspace-setup-workflow/AGENTS.md` — Task progress tracker

### Related Plans
- Setup Agent Plan: `.devagent/workspace/tasks/completed/2026-01-13_final-agent-pr-creation-reporting/plan/2026-01-13_final-agent-plan.md` — Related work on setup agent that prepares git workspace

### External References
- [Git Worktree Documentation](https://git-scm.com/docs/git-worktree) — Official git-scm.com documentation
- [Agent Skills Open Standard](https://agentskills.io) — Open standard specification for skills
