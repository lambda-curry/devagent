# Setup AI Rules

## Mission
- Primary goal: Initialize the `ai-rules` system in a project to provide a single source of truth for AI agent instructions and coding guidelines.
- Boundaries / non‑goals: Do not migrate existing rules (use `devagent research` and `devagent implement-plan` for migration); do not commit changes automatically.
- Success signals: `ai-rules/` directory exists with a config file; initial project context rule is created; platform-specific files (`CLAUDE.md`, `AGENTS.md`, `.cursor/rules/`) are generated.

## Standard Instructions Reference
Before executing this workflow, review standard instructions in `.devagent/core/AGENTS.md` → Standard Workflow Instructions for date handling, metadata retrieval, context gathering order, guardrails, and storage patterns.

## Execution Directive
Follow standard execution directive in `.devagent/core/AGENTS.md`.

## Workflow
1. **Prerequisite Check**
   - Check if `ai-rules` CLI is installed (`which ai-rules`).
   - If not found, provide installation instructions: `curl -fsSL https://raw.githubusercontent.com/block/ai-rules/main/install.sh | bash`.

2. **Migrate Existing Rules**
   - Scan for existing agent rules: `.cursor/rules/*.mdc`, `.cursorrules`, `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`.
   - If found, migrate each to `ai-rules/<name>.md` with frontmatter:
     ```markdown
     ---
     description: "<description of rule>"
     alwaysApply: true
     ---
     <original content>
     ```
   - Skip this step if no existing rules are found.

3. **Initialization**
   - Run `ai-rules init` in the repository root.
   - Verify `ai-rules/` directory and `ai-rules-config.yaml` (or `.yaml`) are created.

4. **Configuration**
   - Update `ai-rules-config.yaml` to include all relevant agents: `[claude, cursor, copilot, codex, opencode, gemini]`.
   - Ensure `gitignore: false` (or as preferred by the user).

5. **Project Context Scaffolding**
   - Create `ai-rules/00-project-context.md` (if not migrated from existing).
   - Populate with high-level project summary, tech stack, and structure.
   - Set `alwaysApply: true` in frontmatter.

6. **Initial Generation**
   - Run `ai-rules generate`.
   - Confirm creation of `CLAUDE.md`, `AGENTS.md`, and `.cursor/rules/`.

7. **Cleanup & Next Steps**
   - Recommend adding the `ai-rules/` directory to the repository.

## Expected Output
- `ai-rules/` directory with configuration and initial context rule.
- Generated platform files (`CLAUDE.md`, `AGENTS.md`, etc.).
- Summary of the setup and instructions for adding new rules.
