# Post-Checkout Hook Setup Implementation Plan

- Owner: Jake Ruesink
- Last Updated: 2026-01-14
- Status: Draft
- Related Task Hub: `.devagent/workspace/tasks/completed/2026-01-14_git-workspace-setup-workflow/`
- Stakeholders: Jake Ruesink (Developer, Decision Role)
- Notes: This plan extends the existing git workspace management system with automatic worktree setup via post-checkout hooks.

---

## PART 1: PRODUCT CONTEXT

### Summary

Currently, when developers create new git worktrees using the `new-workspace` workflow, they must manually configure each worktree (copy environment files, install dependencies, set up project-specific configurations). This manual setup is repetitive and error-prone. This plan adds automatic worktree setup via git post-checkout hooks that detect new worktree creation and run appropriate setup scripts based on project type. The solution includes a reusable `worktree-setup-hook` skill that provides hook templates and setup instructions, plus enhancements to the `new-workspace` workflow to check for existing hooks and guide users through setup.

### Context & Problem

**Current State:**
- The `new-workspace` workflow (`.devagent/core/workflows/new-workspace.md`) successfully creates git worktrees with optional uncommitted work migration
- The `git-workspace` skill (`.cursor/skills/git-workspace/SKILL.md`) provides auto-discovered skill for git worktree operations
- Initial git workspace management deliverables are implemented and committed (PR #32 ready for review)
- Research completed on post-checkout hook patterns, worktree detection, and setup best practices

**User Pain:**
- After creating a worktree, developers must manually:
  - Copy `.env` files or environment configuration
  - Run project-specific install commands (e.g., `npm install`, `pip install -r requirements.txt`)
  - Configure project-specific settings
  - Set up symlinks or other project dependencies
- This manual setup is repetitive across multiple worktrees
- Easy to forget steps, leading to broken worktrees
- No standardized approach for different project types (Node.js, Python, Rust, Go, Ruby)

**Business Trigger:**
- Git workspace management system is in place and working
- Research validates post-checkout hook approach for automatic setup
- Need to complete the workflow by adding automatic setup capabilities
- Follows DevAgent's "teach by doing" principle (Constitution C3) by automating repetitive setup tasks

**Research Artifacts:**
- Research packet: `.devagent/workspace/tasks/completed/2026-01-14_git-workspace-setup-workflow/research/2026-01-14_post-checkout-hook-worktree-setup-research.md` (findings on hook detection, environment variables, setup best practices, skill structure, workflow integration)

### Objectives & Success Metrics

**Product Outcomes:**
- Developers can create worktrees that automatically configure themselves
- Setup process is consistent across project types
- Hook setup is discoverable and guided through workflow integration

**Business Outcomes:**
- Reduced time to productive worktree (from manual setup to ready-to-work)
- Fewer broken worktrees due to missed setup steps
- Standardized worktree setup patterns across the organization

**Experience Outcomes:**
- Workflow guides users through hook setup with clear instructions
- Skill provides reusable templates that work across platforms
- Hook detection logic correctly identifies new worktrees (not regular checkouts)

**Success Metrics:**
- Hook setup skill created and available for auto-discovery
- Workflow successfully detects existing hooks and offers setup guidance
- Hook templates work for at least 3 project types (Node.js, Python, Rust)
- Hook correctly detects new worktree creation (previous HEAD is null-ref)
- Cross-platform compatibility verified (Mac, Linux, Windows)

### Users & Insights

**Target Users:**
- Developers using git worktrees for feature isolation
- Teams adopting the DevAgent git workspace management system
- Developers working with multiple project types (Node.js, Python, Rust, Go, Ruby)

**Key Insights:**
- Developers want automation for repetitive setup tasks
- Setup patterns vary by project type but follow common themes (env files, install commands, config setup)
- Human-in-the-loop confirmation is important (Constitution C3) - workflow should offer setup, not force it
- Tool-agnostic design (Constitution C4) ensures skill works across AI development tools

**Demand Signals:**
- Initial git workspace management system completed and ready for enhancement
- Research validates technical approach and identifies best practices
- Pattern matches existing DevAgent skill structure (git-workspace skill as reference)

### Solution Principles

1. **Human-in-the-loop defaults (Constitution C3):** Workflow checks for hooks and offers to set them up, but requires explicit user confirmation before modifying git hooks
2. **Tool-agnostic design (Constitution C4):** Skill and workflow work across platforms (Mac, Linux, Windows) and AI development tools (Cursor, Codegen, etc.)
3. **Progressive disclosure:** Skill provides templates and references, loaded only when needed
4. **Backward compatibility:** Existing worktrees continue to work; hook setup is optional enhancement
5. **Project type detection:** Hook templates include logic to detect project type and run appropriate setup
6. **Safe hook management:** Workflow handles existing hooks gracefully (backup, append, or skip)

### Scope Definition

- **In Scope:**
  - `worktree-setup-hook` skill with hook templates for Node.js, Python, Rust, Go, Ruby
  - Hook templates with generic project review for setup needs
  - Setup instructions and best practices documentation in skill
  - Enhancement to `new-workspace` workflow to check for existing hooks
  - Workflow guidance for hook setup with references to skill
  - Hook detection logic (previous HEAD is null-ref for new worktrees)
  - Cross-platform compatibility (POSIX-compliant shell scripts)

- **Out of Scope / Future:**
  - Automatic hook installation without user confirmation (violates C3)
  - Support for non-POSIX platforms without shell support
  - Custom setup scripts beyond standard project type patterns
  - Hook management UI or graphical interfaces
  - Integration with other git hooks (pre-commit, post-merge, etc.)
  - Automatic dependency detection beyond standard project files (package.json, requirements.txt, Cargo.toml, etc.)

### Functional Narrative

#### Flow 1: Creating Worktree with Hook Setup

- **Trigger:** Developer runs `devagent new-workspace` workflow to create a new worktree
- **Experience narrative:**
  1. Workflow creates worktree as usual (existing functionality)
  2. After worktree creation, workflow checks for existing post-checkout hook in `.git/hooks/post-checkout`
  3. If no hook exists:
     - Workflow informs user that automatic setup is available
     - Provides reference to `worktree-setup-hook` skill
     - Offers to help set up the hook (with human confirmation)
  4. If hook exists:
     - Workflow checks if it's a worktree-setup hook (by checking for skill signature/comment)
     - If not, informs user about existing hook and suggests backup/append options
     - If yes, confirms hook is already configured
  5. If user confirms hook setup:
     - Workflow references skill to get appropriate hook template
     - Creates backup of existing hook (if any)
     - Installs hook template with project type detection
     - Verifies hook is executable
     - Tests hook detection logic (simulated or documented)
  6. Workflow completes with worktree ready and hook configured (if user opted in)
- **Acceptance criteria:**
  - Workflow detects presence/absence of post-checkout hook
  - Workflow offers hook setup with clear instructions
  - Hook setup requires explicit user confirmation
  - Hook template is installed correctly and is executable
  - Hook includes worktree detection logic (previous HEAD null-ref check)

#### Flow 2: New Worktree Auto-Setup (After Hook Installation)

- **Trigger:** Developer creates a new worktree after hook is installed
- **Experience narrative:**
  1. Developer runs `git worktree add <path> <branch>` (or via workflow)
  2. Git automatically runs post-checkout hook after checkout completes
  3. Hook checks if previous HEAD is `0000000000000000000000000000000000000000` (null-ref)
  4. If null-ref detected (new worktree):
     - Hook reviews project for setup needs:
       - Looks for env files to copy (.env, .env.local, etc.)
       - Detects package manager and installs dependencies (package.json → npm/yarn, requirements.txt → pip, Cargo.toml → cargo, go.mod → go, Gemfile → bundle, etc.)
       - Checks for setup scripts or instructions in project
     - Logs setup actions for visibility
  5. If not null-ref (regular checkout):
     - Hook exits silently (no setup needed)
  6. Developer has fully configured worktree ready to use
- **Acceptance criteria:**
  - Hook correctly detects new worktree creation (null-ref check)
  - Hook does not run setup for regular checkouts
  - Hook reviews project generically for setup needs (env files, package managers)
  - Setup commands execute successfully
  - Hook logs actions for debugging/visibility

### Technical Notes & Dependencies

**Technical Constraints:**
- Git 2.5+ required (worktree support)
- Hooks must be POSIX-compliant shell scripts for cross-platform compatibility
- All worktrees share the same `.git/hooks/` directory (hook applies to all worktrees)
- Hook runs for all checkouts, not just worktrees (requires detection logic)

**Dependencies:**
- Existing `new-workspace` workflow (`.devagent/core/workflows/new-workspace.md`)
- Existing `git-workspace` skill (`.cursor/skills/git-workspace/SKILL.md`) as pattern reference
- Skill creator guidelines (`.cursor/skills/skill-creator/SKILL.md`) for skill structure
- Research findings on hook detection and setup patterns

**Integration Points:**
- Skill location: `.cursor/skills/worktree-setup-hook/` (auto-discovered)
- Workflow enhancement: `.devagent/core/workflows/new-workspace.md`
- Hook templates: `.cursor/skills/worktree-setup-hook/assets/hook-templates/`
- Setup instructions: `.cursor/skills/worktree-setup-hook/references/setup-guide.md`

**Platform Considerations:**
- Windows: Git Bash or WSL required for POSIX shell scripts
- Mac/Linux: Native POSIX shell support
- Hook must handle both absolute and relative paths correctly

---

## PART 2: IMPLEMENTATION PLAN

### Scope & Assumptions

- **Scope focus:** Skill creation and workflow enhancement for post-checkout hook setup
- **Key assumptions:**
  - Git 2.5+ is available (worktree support)
  - Users have shell access (POSIX-compliant)
  - Project types follow standard conventions (package.json for Node.js, requirements.txt for Python, etc.)
  - Users want automatic setup but appreciate human-in-the-loop confirmation
  - Existing worktrees continue to work without hooks (backward compatible)
- **Out of scope:**
  - Automatic hook installation without confirmation
  - Non-POSIX platforms without shell support
  - Custom setup scripts beyond standard patterns
  - Other git hooks (pre-commit, post-merge, etc.)

### Implementation Tasks

#### Task 1: Create worktree-setup-hook Skill

- **Objective:** Create a reusable skill that provides post-checkout hook templates and setup instructions for automatically configuring new git worktrees. The hook reviews the project for setup instructions, env files to copy, and packages to install with the preferred package manager.

- **Impacted Modules/Files:**
  - `.cursor/skills/worktree-setup-hook/SKILL.md` (new - main skill file)
  - `.cursor/skills/worktree-setup-hook/assets/hook-templates/post-checkout` (new - main hook template)
  - `.cursor/skills/worktree-setup-hook/references/setup-guide.md` (new - setup instructions)

- **References:**
  - Research packet: `.devagent/workspace/tasks/completed/2026-01-14_git-workspace-setup-workflow/research/2026-01-14_post-checkout-hook-worktree-setup-research.md`
  - Skill creator: `.cursor/skills/skill-creator/SKILL.md`
  - Existing skill pattern: `.cursor/skills/git-workspace/SKILL.md`
  - Constitution: `.devagent/workspace/memory/constitution.md` (C3, C4)

- **Dependencies:**
  - Research findings on hook detection patterns and setup best practices
  - Skill creator guidelines for structure and progressive disclosure

- **Acceptance Criteria:**
  - Skill file created with proper YAML frontmatter (name, description)
  - Description includes triggers for when to use the skill (hook setup, worktree configuration)
  - Skill provides hook template with worktree detection logic (null-ref check)
  - Hook template reviews project for setup instructions, env files to copy, and packages to install with preferred package manager
  - Hook template is generic and works across project types (no hardcoded project type detection)
  - Setup guide document explains how to install and configure hooks
  - Skill follows progressive disclosure pattern (core in SKILL.md, details in references)
  - Skill is tool-agnostic (works across platforms and AI tools)
  - Hook template is POSIX-compliant shell script

- **Testing Criteria:**
  - Skill validates with `package_skill.py` script (no validation errors)
  - Hook template syntax is valid shell script (test with `sh -n`)
  - Hook template detects null-ref correctly (test with simulated git environment)
  - Hook template reviews project structure generically (no hardcoded project types)
  - Hook template is executable after installation
  - Skill description triggers appropriately when hook setup is mentioned

- **Subtasks:**
  1. **Initialize skill structure** — Use `init_skill.py` to create skill directory and template files
     - Validation: Skill directory created with proper structure (SKILL.md, assets/, references/)
  2. **Create hook template** — Write main post-checkout hook template with worktree detection and generic project review for setup
     - Validation: Hook template passes shell syntax check, includes null-ref detection, reviews project generically for env files and package managers
  3. **Create setup guide** — Write reference document with installation instructions and best practices
     - Validation: Guide includes step-by-step installation, backup procedures, troubleshooting
  4. **Write SKILL.md** — Create main skill file with frontmatter, usage instructions, and references to bundled resources
     - Validation: Frontmatter includes name and description, body references bundled resources, follows progressive disclosure
  5. **Package and validate skill** — Run `package_skill.py` to validate and package the skill
     - Validation: Package script reports no errors, .skill file created successfully

- **Validation Plan:**
  - Run skill validation script to check structure and frontmatter
  - Test hook template with shell syntax checker
  - Verify skill triggers appropriately with test queries
  - Test hook template in isolated git repository with worktree creation
  - Review skill follows skill-creator guidelines and progressive disclosure patterns

#### Task 2: Enhance new-workspace Workflow with Hook Setup

- **Objective:** Enhance the `new-workspace` workflow to check for existing post-checkout hooks and guide users through hook setup using the `worktree-setup-hook` skill.

- **Impacted Modules/Files:**
  - `.devagent/core/workflows/new-workspace.md` (modify - add hook checking and setup guidance)
  - `.devagent/core/commands/new-workspace.md` (modify - if exists, update to reference workflow changes)

- **References:**
  - Existing workflow: `.devagent/core/workflows/new-workspace.md`
  - Worktree-setup-hook skill: `.cursor/skills/worktree-setup-hook/SKILL.md` (created in Task 1)
  - Research findings: `.devagent/workspace/tasks/completed/2026-01-14_git-workspace-setup-workflow/research/2026-01-14_post-checkout-hook-worktree-setup-research.md`
  - Constitution: `.devagent/workspace/memory/constitution.md` (C3 - human-in-the-loop)

- **Dependencies:**
  - Task 1 must be completed (skill must exist for workflow to reference)

- **Acceptance Criteria:**
  - Workflow checks for existing post-checkout hook after worktree creation
  - Workflow detects if hook is worktree-setup hook (by checking for skill signature/comment)
  - Workflow offers hook setup with clear instructions when no hook exists
  - Workflow handles existing hooks gracefully (informs user, suggests backup/append options)
  - Workflow references `worktree-setup-hook` skill for hook templates and setup instructions
  - Hook setup requires explicit user confirmation (human-in-the-loop per C3)
  - Workflow provides clear next steps after hook setup (or if user declines)
  - Workflow maintains backward compatibility (existing worktrees continue to work)

- **Testing Criteria:**
  - Workflow correctly detects absence of post-checkout hook
  - Workflow correctly detects existing post-checkout hook
  - Workflow correctly identifies worktree-setup hook (by signature/comment)
  - Workflow offers setup with appropriate messaging
  - Workflow requires confirmation before modifying hooks
  - Workflow references skill correctly
  - Workflow works when user declines hook setup
  - Existing worktree creation functionality remains unchanged

- **Subtasks:**
  1. **Review existing workflow** — Read current `new-workspace.md` to understand structure and integration points
     - Validation: Understand workflow flow, identify where to add hook checking
  2. **Add hook detection logic** — Add step to check for existing post-checkout hook after worktree creation
     - Validation: Detection logic correctly identifies hook presence/absence and type
  3. **Add hook setup guidance** — Add workflow steps to offer hook setup with skill reference
     - Validation: Guidance is clear, references skill correctly, requires user confirmation
  4. **Handle existing hooks** — Add logic to detect and handle existing hooks gracefully
     - Validation: Workflow informs user about existing hooks, suggests options, doesn't overwrite without confirmation
  5. **Update workflow documentation** — Ensure workflow instructions are clear about hook setup feature
     - Validation: Documentation explains hook setup feature, when it's offered, and how to use it
  6. **Test workflow integration** — Test workflow with and without existing hooks, with user confirmation and decline
     - Validation: Workflow works correctly in all scenarios, maintains backward compatibility

- **Validation Plan:**
  - Test workflow with no existing hook (should offer setup)
  - Test workflow with existing worktree-setup hook (should confirm already configured)
  - Test workflow with existing non-worktree-setup hook (should inform and suggest options)
  - Test workflow with user confirming hook setup (should install hook correctly)
  - Test workflow with user declining hook setup (should continue normally)
  - Verify existing worktree creation functionality unchanged
  - Review workflow follows human-in-the-loop principles (C3)

### Implementation Guidance

- **From `.devagent/core/AGENTS.md` → Standard Workflow Instructions:**
  - Date handling: Use `date +%Y-%m-%d` for dated artifacts
  - Metadata retrieval: Use `git config user.name` for owner/author
  - Context gathering: Review internal docs first, then workspace, then fallback
  - Storage patterns: Dated artifacts use `YYYY-MM-DD_<descriptor>.md` format
  - Execution directive: Execute immediately when invoked with required inputs

- **From `.cursor/skills/skill-creator/SKILL.md` → Skill Creation Guidelines:**
  - Progressive disclosure: Keep SKILL.md body under 500 lines, move details to references
  - Frontmatter: Include `name` and `description` (description is primary trigger mechanism)
  - Description: Include both what the skill does and specific triggers/contexts for when to use it
  - Body: Use imperative/infinitive form for instructions
  - Bundled resources: Scripts for deterministic reliability, references for detailed docs, assets for output files
  - Avoid duplication: Information should live in either SKILL.md or references, not both

- **From `.devagent/workspace/memory/constitution.md` → Delivery Principles (C3):**
  - Human-in-the-loop defaults: Every agent interaction produces drafts that require explicit human confirmation before downstream automation proceeds
  - Workflow should offer hook setup but require user confirmation before modifying git hooks

- **From `.devagent/workspace/memory/constitution.md` → Tool-Agnostic Design (C4):**
  - Agents, workflows, and tooling must be designed to be tool-agnostic by default
  - Skill and workflow should work across platforms (Mac, Linux, Windows) and AI development tools
  - Hook templates must be POSIX-compliant shell scripts

- **From Research Findings → Hook Detection Patterns:**
  - Post-checkout hook runs after `git worktree add` unless `--no-checkout` is used
  - Detect new worktree by checking if previous HEAD is `0000000000000000000000000000000000000000` (null-ref)
  - Environment variables available: `GIT_WORK_TREE`, `GIT_DIR`
  - All worktrees share the same `.git/hooks/` directory

- **From Research Findings → Setup Best Practices:**
  - Copy environment files (`.env`, `.env.local`, etc.) from main worktree or template
  - Detect project type by checking for standard files (package.json, requirements.txt, Cargo.toml, go.mod, Gemfile)
  - Run appropriate install commands based on project type
  - Log setup actions for visibility and debugging
  - Handle errors gracefully (don't fail worktree creation if setup fails)

### Release & Delivery Strategy

**Milestone 1: Skill Creation**
- Complete Task 1 (worktree-setup-hook skill)
- Validate skill structure and packaging
- Test hook template with sample projects
- Skill available for auto-discovery

**Milestone 2: Workflow Enhancement**
- Complete Task 2 (new-workspace workflow enhancement)
- Test workflow integration with skill
- Verify human-in-the-loop confirmation works
- Test backward compatibility

**Dependencies:**
- Task 1 must complete before Task 2 (workflow references skill)
- Both tasks can be tested independently (skill standalone, workflow with mock skill reference)

**Review Gates:**
- Skill validation: Package script passes, hook template syntax valid
- Workflow testing: All scenarios tested (no hook, existing hook, user confirm/decline)
- Integration testing: Workflow successfully references and uses skill
- Backward compatibility: Existing worktrees continue to work

---

## Risks & Open Questions

| Item | Type (Risk / Question) | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Hook runs for all checkouts (not just worktrees) | Risk | Developer | Hook includes null-ref detection to only run for new worktrees; test with regular checkouts to verify | Task 1 |
| Shared hooks directory means hook applies to all worktrees | Risk | Developer | Document this behavior clearly in skill and workflow; this is expected and desired | Task 1 |
| Generic project review accuracy | Risk | Developer | Test with various project types to ensure hook correctly identifies env files and package managers | Task 1 |
| Hook overwriting existing hooks | Risk | Developer | Workflow checks for existing hooks and requires confirmation; creates backup before installation | Task 2 |
| Cross-platform compatibility (Windows) | Risk | Developer | Use POSIX-compliant shell scripts; test on Windows with Git Bash or WSL; document requirements | Task 1 |
| Skill auto-discovery not working | Risk | Developer | Follow skill-creator guidelines for frontmatter and structure; test skill discovery in Cursor | Task 1 |
| Workflow integration complexity | Risk | Developer | Keep workflow changes minimal and focused; test each scenario independently | Task 2 |
| User confusion about hook setup | Question | Developer | Provide clear instructions in workflow and skill; include troubleshooting in setup guide | Task 1, Task 2 |

---

## Progress Tracking

Refer to the AGENTS.md file in the task directory for instructions on tracking and reporting progress during implementation.

---

## Appendices & References

### Agent Documentation
- `AGENTS.md` (root) - Project-level agent context and workflow roster
- `.devagent/core/AGENTS.md` - Portable workflow kit documentation and standard instructions

### Coding Standards and Conventions
- `.cursorrules` - Project coding rules and conventions
- `.cursor/skills/skill-creator/SKILL.md` - Skill creation guidelines and patterns

### Related Documentation
- `.devagent/core/workflows/new-workspace.md` - Existing workflow to enhance
- `.cursor/skills/git-workspace/SKILL.md` - Related skill pattern reference
- `.devagent/core/templates/plan-document-template.md` - Plan document template

### Research Artifacts
- `.devagent/workspace/tasks/completed/2026-01-14_git-workspace-setup-workflow/research/2026-01-14_post-checkout-hook-worktree-setup-research.md` - Complete research findings on post-checkout hooks, detection patterns, setup best practices, and integration recommendations

### Constitution References
- `.devagent/workspace/memory/constitution.md` - C3 (human-in-the-loop defaults), C4 (tool-agnostic design)

### Related Plans
- Initial git workspace management implementation (PR #32) - Completed work that this plan extends
