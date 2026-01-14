# New Workspace

## Mission
- Primary goal: Create a new git worktree for isolated development work, with optional automatic setup via post-checkout hooks.
- Boundaries / non-goals: Do not modify existing worktrees, commit changes, or install hooks without user confirmation.
- Success signals: Worktree created successfully, hook setup offered (if applicable), and user has clear next steps.

## Standard Instructions Reference
Before executing this workflow, review standard instructions in `.devagent/core/AGENTS.md` → Standard Workflow Instructions for:
- Date handling
- Metadata retrieval
- Context gathering order
- Standard guardrails

## Execution Directive
Follow standard execution directive in `.devagent/core/AGENTS.md` → Standard Workflow Instructions.

## Inputs
- Required: Worktree path (relative or absolute), branch name (optional, defaults to new branch based on path)
- Optional: Base branch (defaults to current branch or main), migrate uncommitted changes flag

## Workflow

### 1. Validate Inputs
- Verify worktree path is valid and doesn't already exist
- Check git repository is in valid state
- Determine branch name (use provided or generate from path)

### 2. Create Worktree
- Run `git worktree add <path> <branch>` (or create new branch if specified)
- Handle uncommitted changes migration if requested
- Verify worktree creation succeeded

### 3. Check for Post-Checkout Hook
- Check if `.git/hooks/post-checkout` exists
- If exists, check if it's a worktree-setup hook (look for worktree-setup-hook signature/comment)
- If no hook exists:
  - Inform user that automatic worktree setup is available
  - Reference `worktree-setup-hook` skill for hook templates and setup instructions
  - Offer to help set up the hook (requires user confirmation per Constitution C3)
- If existing hook is not worktree-setup hook:
  - Inform user about existing hook
  - Suggest backup/append options
  - Reference skill for integration guidance
- If worktree-setup hook already exists:
  - Confirm hook is configured
  - Note that setup will run automatically for future worktrees

### 4. Hook Setup (if user confirms)
- If user confirms hook setup:
  - Reference `worktree-setup-hook` skill to get hook template
  - Create backup of existing hook (if any): `.git/hooks/post-checkout.backup`
  - Copy hook template: `cp .cursor/skills/worktree-setup-hook/assets/hook-templates/post-checkout .git/hooks/post-checkout`
  - Make hook executable: `chmod +x .git/hooks/post-checkout`
  - Verify hook installation
  - Inform user that hook is installed and will run automatically for future worktrees

### 5. Completion
- Report worktree creation success
- Provide next steps (cd to worktree, start working)
- Note hook status (installed, available, or existing hook present)

## Output
- Worktree created at specified path
- Hook status and setup guidance (if applicable)
- Next steps for using the worktree

## Related Skills
- `worktree-setup-hook` - Provides hook templates and setup instructions for automatic worktree configuration
