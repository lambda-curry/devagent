# AI Rules Consolidation Plan

- Owner: Jake Ruesink
- Last Updated: 2026-01-21
- Status: Draft
- Related Task Hub: `.devagent/workspace/tasks/active/2026-01-21_consolidate-ai-rules/`
- Stakeholders: Engineering Team

---

## PART 1: PRODUCT CONTEXT

### Summary
We are consolidating all AI coding rules, commands, and skills into a single "Source Hub" directory (`ai-rules/`) to serve as the source of truth for all AI agents (Opencode, Cursor, Claude Code, GitHub Copilot, etc.). This ensures consistency across tools and simplifies maintenance.

### Context & Problem
Currently, our AI rules are fragmented across `.cursor/rules/`, `.devagent/plugins/ralph/agents/`, and implicit knowledge. Managing these separately for each tool (Cursor, Opencode, Claude, Copilot) leads to drift and redundancy. We need a unified system similar to `block/ai-rules` to manage this complexity.

### Objectives & Success Metrics
- **Centralized Rules:** All rules live in `ai-rules/` with metadata (frontmatter) defining their applicability.
- **Multi-Agent Support:** Automated generation/syncing of configuration files for:
    - Cursor (`.cursor/rules/*.mdc`)
    - Claude Code (`CLAUDE.md`, `.claude/skills/`)
    - GitHub Copilot (`.github/copilot-instructions.md`)
    - Opencode (via `AGENTS.md` or prompt context)
- **Maintainability:** Updates in `ai-rules/` propagate to all agents.

### Users & Insights
- **Developers:** Want consistent behavior from AI assistants regardless of the tool they use.
- **Agent Operators:** Need a single place to update guidelines (e.g., "Always use `bun run test`") without editing 5 different files.

### Solution Principles
- **Source of Truth:** The `ai-rules/` directory is authoritative. Platform-specific files are build artifacts.
- **Metadata-Driven:** Use YAML frontmatter to control rule targeting (e.g., `agent: ["cursor", "claude"]`).
- **Zero-Config Consumption:** Generated files should require no extra setup for the end-user tool (e.g., Cursor just works).

### Scope Definition
- **In Scope:**
    - Installing and initializing the `ai-rules` CLI.
    - Creating `ai-rules/` directory structure using `ai-rules init`.
    - Migrating existing `.cursor/rules/` and `ralph` agents to the source hub.
    - Configuring `ai-rules.json` for multi-agent output (Cursor, Claude, Opencode, GitHub Copilot).
- **Out of Scope:**
    - Writing custom sync scripts (we rely entirely on `ai-rules generate`).
    - Full reimplementation of CLI logic.

---

## PART 2: IMPLEMENTATION PLAN

### Scope & Assumptions
- **Scope focus:** Repo-level infrastructure and configuration.
- **Key assumptions:** We will use the off-the-shelf `ai-rules` CLI instead of writing a custom script, as it natively supports our targets (Cursor, Claude, and AGENTS.md for Opencode).

### Implementation Tasks

#### Task 1: Install & Initialize ai-rules
- **Objective:** Install the `ai-rules` CLI and initialize the repository structure.
- **Impacted Modules/Files:**
    - `ai-rules/` (created by init)
    - `.gitignore` (updated to ignore generated files if desired)
- **References:**
    - https://github.com/block/ai-rules#installation
- **Acceptance Criteria:**
    - `ai-rules` binary is installed and executable.
    - `ai-rules init` has been run.
    - `ai-rules/` directory exists with default structure.

#### Task 2: Migrate Rules to Source Hub
- **Objective:** Migrate existing internal rules into the `ai-rules/` source directory.
- **Impacted Modules/Files:**
    - `ai-rules/rules/*.md` (new source files)
    - `.cursor/rules/*.mdc` (source for migration)
    - `.devagent/plugins/ralph/agents/` (source for migration)
- **Acceptance Criteria:**
    - All valuable content from `.cursor/rules/` is ported to `ai-rules/rules/`.
    - Rules use correct frontmatter (e.g., `alwaysApply`, `fileMatching`).
    - `ai-rules generate` successfully creates the target files (e.g., new `.cursor/rules/*.mdc`).
    - Legacy manual files are removed/replaced.

#### Task 3: Configure Platform Targets
- **Objective:** Ensure `ai-rules.json` (or config) is set up to generate for all our required platforms.
- **Impacted Modules/Files:**
    - `ai-rules.json` (configuration)
    - `CLAUDE.md` (generated)
    - `AGENTS.md` (generated - for Opencode)
- **Acceptance Criteria:**
    - `ai-rules generate` produces `AGENTS.md` (for Opencode).
    - `ai-rules generate` produces `CLAUDE.md`.
    - `ai-rules generate` produces `.cursor/rules/`.
    - `ai-rules generate` produces `.github/copilot-instructions.md` (if supported, or via custom post-processing).

#### Task 4: Documentation & CI/CD
- **Objective:** Document the workflow and ensure it's easy to keep rules in sync.
- **Impacted Modules/Files:**
    - `README.md`
- **Acceptance Criteria:**
    - Documentation explains "Edit `ai-rules/`, then run `ai-rules generate`".
    - `ai-rules status` usage is documented.

### Implementation Guidance
- **From `.devagent/core/AGENTS.md` → Standard Guardrails:**
    - Ensure no secrets are committed in rule examples.
    - Use `bun` for scripts as per repo convention.

---

## Risks & Open Questions

| Item | Type | Owner | Mitigation | Due |
| --- | --- | --- | --- | --- |
| Managing conflict between generated files and manual edits | Risk | Jake | Add "DO NOT EDIT - GENERATED" warnings to output files | Task 2 |
| How to handle "Skills" complex logic (vs simple text rules) | Question | Jake | Start with text rules; research skill generation if needed later | Task 2 |

---

## Progress Tracking
Refer to the AGENTS.md file in the task directory for instructions on tracking and reporting progress during implementation.
