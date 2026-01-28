# Workflow Roster — DevAgent Project

This file documents how workflows work within the DevAgent project itself. For the portable agent kit that can be copied to other projects, see `.devagent/core/AGENTS.md`.

## Project Context

DevAgent is a development workspace system that uses AI workflows to coordinate product work, research, specifications, and implementation. This project uses its own workflow system to develop itself.

**Key workspace locations:**
- `.devagent/workspace/product/` — Mission, roadmap, and guiding questions for DevAgent
- `.devagent/workspace/tasks/` — Active and completed tasks with research, specs, and plans
- `.devagent/workspace/research/` — General research artifacts
- `.devagent/workspace/memory/` — Constitution, decision journal, and tech stack
- `.devagent/core/` — Portable agent kit (templates, workflow definitions)

## How Workflows Work in This Project

Workflows can be invoked when referenced with `devagent [workflow-name]` (for example, `devagent research`) or when their workflow file is mentioned (for example, `research.md`). Note: `devagent` is a workflow invocation convention in this environment, not a standalone CLI binary.

**How to think about workflows:**
- Workflows are structured prompt sequences that run inside this environment; they are not separate people to schedule meetings with.
- You trigger a workflow by writing `devagent [workflow-name]` with required inputs; the response is the workflow run.
- The executing developer has standing approval to invoke any workflow immediately; if a review is needed, capture it in a log after the run instead of delaying execution.
- Provide all context and artifacts in the invocation, because workflows cannot gather it unless another workflow is tasked.
- You remain the coordinator: log decisions and move artifacts forward rather than expecting workflow-to-workflow conversations.
- Choose the lightest sequence that fits the work; simple enhancements can go straight to `devagent research` → `devagent create-plan`, while complex initiatives chain through `devagent update-product-mission` → `devagent clarify-task` → `devagent research` → `devagent create-plan`.
- Workflows trigger manually—there is no background scheduler—so note any recurring reviews in change logs when you perform them.

**Working with DevAgent tasks:**
- When developing new DevAgent capabilities, use the full workflow: `devagent update-product-mission` → `devagent clarify-task` → `devagent research` → `devagent create-plan`
- For workflow template updates or improvements to existing workflows, use: `devagent research` → `devagent create-plan`
- For documentation updates or small fixes, use: `devagent research` (quick workflow)

**Project-specific patterns:**
- All task work is tracked in `.devagent/workspace/tasks/` with dated folders
- Research packets reference the constitution (`.devagent/workspace/memory/constitution.md`) for alignment
- Plans follow the template at `.devagent/core/templates/plan-document-template.md` and combine product context with implementation tasks
- Completed tasks move to `.devagent/workspace/tasks/completed/`

**Meta-development considerations:**
- Changes to workflow definitions require validation against existing workflows
- Template updates should be tested with `devagent create-plan` before committing
- Core structure changes affect portability—verify they work for both DevAgent and external projects

## Standard Workflow Instructions

Before executing any workflow, review and follow these standard instructions.

### Date Handling

- When creating dated documents, always run `date +%Y-%m-%d` first to get current date in ISO format.
- Use the output for YYYY-MM-DD portions of filenames (e.g., `YYYY-MM-DD_<descriptor>.md`).
- Do not infer or assume the date.

### Metadata Retrieval

- To determine owner/author for metadata: run `git config user.name`.
- Use this value when owner is not explicitly provided in inputs.

### Context Gathering (Standard Order)

When gathering context, review in this order:

1. Internal agent documentation: `AGENTS.md` (root) and `.devagent/core/AGENTS.md`
2. Workflow definitions: `.devagent/core/workflows/**/*.md`
3. Rules & conventions: cursor rules, `.github/*.md` policy docs
4. DevAgent workspace:
   - `.devagent/workspace/product/**` (mission, roadmap, guiding-questions)
   - `.devagent/workspace/tasks/**` (task hubs, specs, task plans)
   - `.devagent/workspace/memory/**` (constitution, decisions, tech stack)
   - `.devagent/workspace/research/**` (prior research packets)
5. Fallback: `README.*` or `docs/**` if above are insufficient

### Standard Guardrails

- Prefer authoritative sources and project-internal context first.
- Never expose secrets or credentials; redact as `{{SECRET_NAME}}`.
- Tag uncertainties with `[NEEDS CLARIFICATION: ...]`.
- Cite file paths with anchors when available.

### Handling Command File References

When you encounter a reference to a command file (e.g., `@.agents/commands/research.md` or `.agents/commands/create-plan.md`), **DO NOT attempt to execute it as a shell command**. These are instructional markdown files.

**Correct protocol:**

1. **Read**: Use the `read_file` tool to retrieve the content of the referenced markdown file.
2. **Interpret**: Analyze the steps and workflows defined within the file.
3. **Execute**: Autonomously perform the actions described in the file using your standard toolset (e.g., `write_file`, `run_terminal_cmd`, `search_replace`).

Command files in `.agents/commands/` are templates that reference workflows in `.devagent/core/workflows/` and provide structured input placeholders. They are meant to be read and followed, not executed as commands.

### Execution Directive (Standard)

When invoked with `devagent [workflow-name]` and required inputs, **EXECUTE IMMEDIATELY**.

- Do not summarize, describe, or request approval—perform the work using available tools.
- The executing developer has standing approval to invoke workflows.
- Only pause for missing REQUIRED inputs, blocking errors, or when explicit human confirmation is required for external actions.
- Note exceptional findings in the response rather than blocking the run.

### Storage Patterns

- Dated artifacts: Use `YYYY-MM-DD_<descriptor>.md` format (date from `date +%Y-%m-%d`).
- Quick clarifications: reply inline only.
- Significant outputs: Creating artifacts (files) is good practice when they serve a purpose beyond communication—for example, when they're referenced by downstream workflows, need to persist for future sessions, or provide structured data. However, some workflows are designed to provide outputs in responses only (e.g., `devagent handoff`, `devagent update-devagent`). Always follow the workflow's specific instructions when they explicitly specify where outputs should go.
- Task-scoped artifacts: `.devagent/workspace/tasks/{status}/YYYY-MM-DD_task-slug/`
- General artifacts: `.devagent/workspace/research/` or `.devagent/workspace/reviews/`

## Workflows

- `devagent update-product-mission` — Co-creates the product mission and supporting assets. Utilize when product context or mission updates are needed. See `.devagent/core/workflows/update-product-mission.md`.
- `devagent clarify-task` — Validates requirement completeness through structured clarification sessions. Utilize when task or feature ideas need validation before plan work, when specs have requirement gaps, or when requirements need completeness review. See `.devagent/core/workflows/clarify-task.md`.
- `devagent brainstorm` — Facilitates structured ideation to generate, cluster, and prioritize candidates (often product features). Utilize when exploring solution spaces before research or when generating ideas from mission goals. See `.devagent/core/workflows/brainstorm.md`.
- `devagent research` — Maps open questions and gathers vetted references. Utilize when a new task or feature needs discovery or spec clarification. See `.devagent/core/workflows/research.md`.
- `devagent new-task` — From a short description, scaffold the minimal task hub with a populated `AGENTS.md` (no empty directory scaffolding), then recommend next workflows. See `.devagent/core/workflows/new-task.md`.
- `devagent new-worktree` — Creates a new git worktree and optionally migrates uncommitted work from the current workspace to the new worktree, enabling concurrent feature development without context switching or stashing conflicts. Utilize when you need to work on multiple features simultaneously or spin off unrelated work into a separate worktree. See `.devagent/core/workflows/new-worktree.md`.
- `devagent create-plan` — Synthesizes research into comprehensive plans combining product context and implementation tasks. Utilize when planning a task or major work item. See `.devagent/core/workflows/create-plan.md`.
- `devagent review-plan` — Enables interactive review of plan documents before implementation, providing high-level summaries and adaptive suggestions for walking through plans to validate alignment with expectations. Utilize when you want to validate a plan created by `devagent create-plan` before proceeding to implementation. See `.devagent/core/workflows/review-plan.md`.
- `devagent implement-plan` — Executes implementation tasks from plan documents, performing coding work sequentially and tracking progress in AGENTS.md files. Utilize when ready to implement tasks from a plan document created by `devagent create-plan`. See `.devagent/core/workflows/implement-plan.md`.
- `devagent execute-full-task` — Executes a full task lifecycle end-to-end with complexity-based routing and task hub execution summaries. Utilize when you want a single prompt to run from task intake through completion. See `.devagent/core/workflows/execute-full-task.md`.
- `devagent handoff` — Generates a structured handoff prompt for starting a new agent thread while preserving current context. Utilize when you need a manual copy/paste handoff to continue work in a fresh session. See `.devagent/core/workflows/handoff.md`.
- `devagent review-progress` — Captures task progress state and identifies remaining work for efficient resumption after context loss. Utilize when stopping work for the day or switching contexts to preserve progress state. See `.devagent/core/workflows/review-progress.md`.
- `devagent review-pr` — Reviews pull requests by analyzing code changes, validating against Linear issue requirements (when present), and checking code quality against project standards. Produces structured review artifacts in `.devagent/workspace/reviews/` for traceability. Utilize when reviewing PRs that need requirements validation or code quality assessment. See `.devagent/core/workflows/review-pr.md`.
- `devagent compare-prs` — Compares multiple pull requests accomplishing the same task to determine which one is better to work with based on completeness, code quality, and ease of working with. Produces structured comparison artifacts that recommend the best PR and identify strengths from other PRs worth integrating. Utilize when evaluating multiple PRs addressing the same feature or task. See `.devagent/core/workflows/compare-prs.md`.
- `devagent update-tech-stack` — Creates or updates comprehensive tech stack documentation by analyzing codebases and gathering developer context. Utilize when documenting technology choices for a new or existing project. See `.devagent/core/workflows/update-tech-stack.md`.
- `devagent build-workflow` — Designs high-quality agent prompts and instruction sheets that integrate with the DevAgent roster. Utilize when creating new agents or updating agent templates. See `.devagent/core/workflows/build-workflow.md`.
- `devagent update-constitution` — Updates the project constitution and related governance documents. Utilize when constitutional changes or updates are needed. See `.devagent/core/workflows/update-constitution.md`.
- `devagent update-devagent` — Updates DevAgent core files, plugins, commands, and skills by running update scripts and summarizing changes. Utilize when syncing with the DevAgent repository. See `.devagent/core/workflows/update-devagent.md`.
- `devagent verify-plugins` — Verifies that configured plugins are properly installed, valid, and wired. See `.devagent/core/workflows/verify-plugins.md`.
- `devagent setup-ai-rules` — Initializes the ai-rules source hub and generates platform-specific AI instructions. See `.devagent/core/workflows/setup-ai-rules.md`.
- `devagent mark-task-complete` — Moves a completed task (task hub) from `active/` to `completed/` status, updating all status references and path references throughout the task directory. Utilize when a task is complete and ready to be archived. See `.devagent/core/workflows/mark-task-complete.md`.

## Workflow Naming Convention

Workflows follow a consistent `action-target` naming pattern for clarity and memorability. The action verb describes the primary function, and the target noun specifies the scope.

| Workflow Name | Rationale |
|---------------|-----------|
| update-product-mission | Creates/updates product mission and assets |
| clarify-task | Validates and clarifies task requirements |
| brainstorm | Generates and prioritizes idea candidates |
| research | Researches and gathers references for tasks |
| setup-ai-rules | Initializes unified AI rules system |
| create-plan | Designs plans combining product context and implementation tasks |
| review-plan | Reviews plan documents interactively to validate alignment before implementation |
| implement-plan | Executes implementation tasks from plan documents with progress tracking |
| execute-full-task | Executes a full task lifecycle end-to-end with complexity-based routing |
| handoff | Generates a structured handoff prompt for starting a new agent thread |
| new-task | Scaffolds a minimal task hub from a short description |
| new-worktree | Creates a new git worktree and optionally migrates uncommitted work |
| review-progress | Captures progress state for efficient resumption |
| review-pr | Reviews pull requests with requirements validation and code quality assessment |
| compare-prs | Compares multiple PRs to determine which is best to work with |
| update-tech-stack | Documents technology stack choices |
| build-workflow | Builds new agent prompts and templates |
| update-constitution | Updates project constitution and governance |
| update-devagent | Updates DevAgent core files, plugins, commands, and skills |
| verify-plugins | Verifies plugin installation and wiring |
| mark-task-complete | Moves completed tasks to archived status with path updates |
