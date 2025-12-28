# Workflow Roster — DevAgent Project

This file documents how workflows work within the DevAgent project itself. For the portable agent kit that can be copied to other projects, see `.devagent/core/AGENTS.md`.

## Project Context

DevAgent is a development workspace system that uses AI workflows to coordinate product work, research, specifications, and implementation. This project uses its own workflow system to develop itself.

**Key workspace locations:**
- `.devagent/workspace/product/` — Mission, roadmap, and guiding questions for DevAgent
- `.devagent/workspace/features/` — Active and completed features with research, specs, and tasks
- `.devagent/workspace/research/` — General research artifacts
- `.devagent/workspace/memory/` — Constitution, decision journal, and tech stack
- `.devagent/core/` — Portable agent kit (templates, workflow definitions)

## How Workflows Work in This Project

Workflows can be invoked when referenced with `devagent [workflow-name]` (for example, `devagent research`) or when their workflow file is mentioned (for example, `research.md`).

**How to think about workflows:**
- Workflows are structured prompt sequences that run inside this environment; they are not separate people to schedule meetings with.
- You trigger a workflow by writing `devagent [workflow-name]` with required inputs; the response is the workflow run.
- The executing developer has standing approval to invoke any workflow immediately; if a review is needed, capture it in a log after the run instead of delaying execution.
- Provide all context and artifacts in the invocation, because workflows cannot gather it unless another workflow is tasked.
- You remain the coordinator: log decisions and move artifacts forward rather than expecting workflow-to-workflow conversations.
- Choose the lightest sequence that fits the work; simple enhancements can go straight to `devagent research` → `devagent create-plan`, while complex features chain through `devagent update-product-mission` → `devagent clarify-feature` → `devagent research` → `devagent create-plan`.
- Workflows trigger manually—there is no background scheduler—so note any recurring reviews in change logs when you perform them.

**Working with DevAgent features:**
- When developing new DevAgent capabilities, use the full workflow: `devagent update-product-mission` → `devagent clarify-feature` → `devagent research` → `devagent create-plan`
- For workflow template updates or improvements to existing workflows, use: `devagent research` → `devagent create-plan`
- For documentation updates or small fixes, use: `devagent research` (quick workflow)

**Project-specific patterns:**
- All feature work is tracked in `.devagent/workspace/features/` with dated folders
- Research packets reference the constitution (`.devagent/workspace/memory/constitution.md`) for alignment
- Plans follow the template at `.devagent/core/templates/plan-document-template.md` and combine product context with implementation tasks
- Completed features move to `.devagent/workspace/features/completed/`

**Meta-development considerations:**
- Changes to workflow definitions require validation against existing workflows
- Template updates should be tested with `devagent create-plan` before committing
- Core structure changes affect portability—verify they work for both DevAgent and external projects

## Workflows

- `devagent update-product-mission` — Co-creates the product mission and supporting assets. Utilize when product context or mission updates are needed. See `.devagent/core/workflows/update-product-mission.md`.
- `devagent clarify-feature` — Validates requirement completeness through structured clarification sessions. Utilize when feature ideas need validation before spec work, when specs have requirement gaps, or when requirements need completeness review. See `.devagent/core/workflows/clarify-feature.md`.
- `devagent brainstorm` — Facilitates structured ideation to generate, cluster, and prioritize feature candidates. Utilize when exploring solution spaces before research or when generating ideas from mission goals. See `.devagent/core/workflows/brainstorm.md`.
- `devagent research` — Maps open questions and gathers vetted references. Utilize when a new feature needs discovery or spec clarification. See `.devagent/core/workflows/research.md`.
- `devagent new-feature` — From a short description, scaffold the minimal feature hub with standard folders and a populated README, then recommend next workflows. See `.devagent/core/workflows/new-feature.md`.
- `devagent create-plan` — Synthesizes research into comprehensive plans combining product context and implementation tasks. Utilize when planning a feature or major work item. See `.devagent/core/workflows/create-plan.md`.
- `devagent implement-plan` — Executes implementation tasks from plan documents, performing coding work sequentially and tracking progress in AGENTS.md files. Utilize when ready to implement tasks from a plan document created by `devagent create-plan`. See `.devagent/core/workflows/implement-plan.md`.
- `devagent review-progress` — Captures task progress state and identifies remaining work for efficient resumption after context loss. Utilize when stopping work for the day or switching contexts to preserve progress state. See `.devagent/core/workflows/review-progress.md`.
- `devagent review-pr` — Reviews pull requests by analyzing code changes, validating against Linear issue requirements (when present), and checking code quality against project standards. Produces structured review artifacts in `.devagent/workspace/reviews/` for traceability. Utilize when reviewing PRs that need requirements validation or code quality assessment. See `.devagent/core/workflows/review-pr.md`.
- `devagent compare-prs` — Compares multiple pull requests accomplishing the same task to determine which one is better to work with based on completeness, code quality, and ease of working with. Produces structured comparison artifacts that recommend the best PR and identify strengths from other PRs worth integrating. Utilize when evaluating multiple PRs addressing the same feature or task. See `.devagent/core/workflows/compare-prs.md`.
- `devagent update-tech-stack` — Creates or updates comprehensive tech stack documentation by analyzing codebases and gathering developer context. Utilize when documenting technology choices for a new or existing project. See `.devagent/core/workflows/update-tech-stack.md`.
- `devagent build-workflow` — Designs high-quality agent prompts and instruction sheets that integrate with the DevAgent roster. Utilize when creating new agents or updating agent templates. See `.devagent/core/workflows/build-workflow.md`.
- `devagent update-constitution` — Updates the project constitution and related governance documents. Utilize when constitutional changes or updates are needed. See `.devagent/core/workflows/update-constitution.md`.
- `devagent mark-feature-complete` — Moves a completed feature from `active/` to `completed/` status, updating all status references and path references throughout the feature directory. Utilize when a feature is complete and ready to be archived. See `.devagent/core/workflows/mark-feature-complete.md`.

## Workflow Naming Convention

Workflows follow a consistent `action-target` naming pattern for clarity and memorability. The action verb describes the primary function, and the target noun specifies the scope.

| Workflow Name | Rationale |
|---------------|-----------|
| update-product-mission | Creates/updates product mission and assets |
| clarify-feature | Validates and clarifies feature requirements |
| brainstorm | Generates and prioritizes feature ideas |
| research | Researches and gathers references for features |
| create-plan | Designs plans combining product context and implementation tasks |
| implement-plan | Executes implementation tasks from plan documents with progress tracking |
| new-feature | Scaffolds a minimal feature hub from a short description |
| review-progress | Captures progress state for efficient resumption |
| review-pr | Reviews pull requests with requirements validation and code quality assessment |
| compare-prs | Compares multiple PRs to determine which is best to work with |
| update-tech-stack | Documents technology stack choices |
| build-workflow | Builds new agent prompts and templates |
| update-constitution | Updates project constitution and governance |
| mark-feature-complete | Moves completed features to archived status with path updates |