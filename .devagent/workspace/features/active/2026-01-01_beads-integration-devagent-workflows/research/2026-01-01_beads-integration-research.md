# Beads Integration for DevAgent Workflows — Research

## Classification & Assumptions
- Classification: Implementation design research for integrating a graph-based issue tracker into DevAgent workflows.
- Assumptions:
  - Beads (`bd`) can be installed in contributor environments and is acceptable for optional workflow enhancements. [NEEDS CLARIFICATION]
  - DevAgent can store new state under a git-tracked directory (e.g., `.beads/`) without violating repository constraints. [NEEDS CLARIFICATION]

## Research Plan
- Validate Beads core storage model, CLI commands, and workflow primitives.
- Identify integration surfaces with DevAgent workflows (research, create-plan, implement-plan, review-progress).
- Confirm Beads support for git-based collaboration (branching, merge safety, and auto-sync).
- Evaluate how Beads' compaction and dependency graph map to DevAgent's task + progress artifacts.
- Note guardrails needed to keep DevAgent tool-agnostic and constitution-aligned.

## Sources
- `.devagent/workspace/product/mission.md` (2026-01-01): Mission alignment for workflow tooling.
- `.devagent/workspace/memory/constitution.md` (2026-01-01): Clauses C1-C4 (mission fidelity, chronological artifacts, delivery principles, tool-agnostic design).
- `.devagent/workspace/memory/tech-stack.md` (2026-01-01): Git-based state management and tool-agnostic constraints.
- https://raw.githubusercontent.com/steveyegge/beads/main/README.md (accessed 2026-01-01): Beads overview, storage model, commands, and features.
- https://raw.githubusercontent.com/steveyegge/beads/main/AGENT_INSTRUCTIONS.md (accessed 2026-01-01): Operational guidance on auto-sync, git integration, and agent usage.

## Findings & Tradeoffs
- Beads stores issues as JSONL under `.beads/` and uses git for versioning, branching, and merges, which aligns with DevAgent’s git-based state and artifact chronology principles. This makes Beads a natural fit for tracking tasks as structured data instead of markdown task lists. (README.md)
- The `bd` CLI provides task creation, dependency links, and “ready” detection, enabling automatic identification of unblocked work and a dependency graph that can augment DevAgent task planning and execution workflows. (README.md)
- Auto-sync, background daemon behavior, and optional protected-branch workflows introduce operational complexity that DevAgent users will need to understand, especially around auto-commits and merge flows. (AGENT_INSTRUCTIONS.md)
- Beads supports “stealth” mode and protected branch initialization, which could address teams that do not want `.beads/` data in the main branch, but this adds coordination overhead. (README.md, AGENT_INSTRUCTIONS.md)
- Beads' compaction feature could complement DevAgent’s long-horizon memory goals, but the workflow for summarizing and linking to DevAgent artifacts needs to be defined to preserve traceability expectations. (README.md, constitution.md)

## Recommendation
Adopt Beads as an optional, tool-agnostic task-tracking backend for DevAgent workflows, starting with a lightweight integration that:
- Maps DevAgent “tasks” and “plan” artifacts to Beads issues (epic/task/sub-task hierarchy) and references Beads IDs in DevAgent docs.
- Adds guidance in workflow prompts to use `bd` for dependency management and ready-task detection without removing existing markdown artifacts (maintains portability and fallback paths).
- Defines a minimal integration contract: how to initialize Beads, where `.beads/` lives, and when to use protected branch or stealth mode.

## Repo Next Steps
- Decide integration mode: default vs. optional opt-in; main branch vs. protected branch `.beads/` storage.
- Draft workflow prompt updates for `devagent create-plan`, `devagent implement-plan`, and `devagent review-progress` to incorporate Beads IDs and “ready” detection.
- Create an integration guide covering `bd init`, task creation, dependency linking, and sync behavior for DevAgent users.
- Prototype a sample feature hub wired to Beads to validate the workflow mapping.

## Risks & Open Questions
- How to keep Beads integration tool-agnostic while it introduces a specific CLI dependency? [NEEDS CLARIFICATION]
- What is the recommended default for `.beads/` storage (main branch vs. protected branch vs. stealth) in shared DevAgent repos? [NEEDS CLARIFICATION]
- How should Beads compaction summaries be linked back to DevAgent research/plan artifacts to preserve traceability? [NEEDS CLARIFICATION]
