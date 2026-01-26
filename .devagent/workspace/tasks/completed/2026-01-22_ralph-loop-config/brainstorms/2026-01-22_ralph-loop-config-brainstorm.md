# Brainstorm Packet — Ralph Loop Config with Task Setup

- Mode: exploratory
- Session Date: 2026-01-22
- Participants: Jake Ruesink (Solo)
- Storage Path: `.devagent/workspace/tasks/completed/2026-01-22_ralph-loop-config/brainstorms/2026-01-22_ralph-loop-config-brainstorm.md`
- Related Artifacts: 
  - Task hub: `.devagent/workspace/tasks/completed/2026-01-22_ralph-loop-config/AGENTS.md`
  - Current config: `.devagent/plugins/ralph/tools/config.json`
  - Setup workflow: `.devagent/plugins/ralph/workflows/setup-ralph-loop.md`
  - Mission: `.devagent/workspace/product/mission.md`
  - Constitution: `.devagent/workspace/memory/constitution.md`

## Problem Statement

Create a config-driven approach for Ralph loop setup that enables building Beads tasks programmatically from structured data (using JSON schema). This will improve task preparation for epics by allowing repeatable task loops, consistent setupTasks and teardownTasks that can be configured to always run before and after loops, and reusable templates. For example, a generic ralph loop could always have a setup task that gets a PR ready at the beginning and a teardown task that prepares the final review and does a final check of the project. We could also have pre-defined loops for common patterns like exploring a new task, which could be used without modification or with slight customization.

**Brainstorm Mode:** **Exploratory** — Open-ended ideation exploring config-driven approaches, templates, patterns, and programmatic task creation from structured data.

**Context Answers:**
- **Mode:** Exploratory (A)
- **Current State:** Initial config structure exists but needs task setup capabilities (A)
- **Constraints:** Must support JSON schema validation/structured data (B) AND must enable reusable templates (setupTasks, teardownTasks) (C)
- **Additional Notes:** Can adapt workflows to match new config, no backward compatibility needed, sole decision maker

**Known Constraints:**
- Technical: Must integrate with existing setup-ralph-loop workflow (can be adapted), must support JSON schema validation, must enable programmatic task creation from structured data
- Strategic: Aligns with DevAgent mission of reusable, structured workflows that compound improvements
- Timeline: No specific deadline mentioned
- Decision Authority: Sole decision maker (Jake Ruesink)

## Ideas (Divergent Phase)

_Generated using multiple ideation techniques: prompt-based, constraint-based, analogy, SCAMPER, "How Might We", perspective shifts (user, developer, business, technical)._

**Progress Tracker:**
`Problem ✅ | Ideas ✅ (8 ideas, refined) | Clustering ⏭️ deferred | Evaluation ⏭️ deferred | Prioritization ⏭️ deferred`

### Batch 1: Core Structure & Schema Ideas

1. **JSON Schema Task Definition System** — Define a JSON schema that describes task structure (title, objective, labels, dependencies, metadata). The config.json would reference this schema, and setup-ralph-loop would validate and generate Beads tasks from schema-compliant JSON files. Enables type-safe, validated task creation.
   - **Refined:** Keep schema simple and system-agnostic (don't align too closely with Beads structure in case systems change later). Metadata support is good but depends on completing the metadata extension task first (active task exists). Schema should validate both individual task definitions and full loop config structure. Schema can live in separate file (e.g., `task-schema.json`) or embedded in docs.

2. **Template Library with Preset Loops** — Create a `.devagent/plugins/ralph/templates/` directory with pre-defined loop configurations (e.g., `generic-ralph-loop.json`, `exploration-loop.json`, `epic-preparation-loop.json`). Each template includes setupTasks, main tasks structure, and teardownTasks. 
   - **Refined:** Templates are separate files that can be copied and overridden. The AI/workflow setting up the loop copies the template and applies overrides as needed. This provides flexibility while maintaining reusable base patterns. Templates can be referenced by name/path, and the setup process handles copying + customization.

3. **Setup/Teardown Task Hooks in Config** — Extend config.json (or templates) with `loop: { setupTasks: [...], teardownTasks: [...] }` sections. Each task entry follows a structured format (title, objective, labels, agent routing). These tasks are automatically prepended/appended to the main task list during loop setup.
   - **Refined:** Setup/teardown tasks should be defined in templates, enabling consistent lifecycle tasks across loops that use the same template while allowing the middle section (main tasks from plan) to vary. Example: generic-ralph-loop template has setup tasks (review everything, setup PR) and teardown tasks (final review, revise report), while the main tasks come from the plan. This pattern enables reusable loop structures with varying core work.

4. ~~**Task Generator Functions**~~ — **REMOVED:** Static JSON is sufficient since AI workflows can help set up loops. No need for programmatic generator functions.

5. **Config Composition with Extends** — Allow config.json (or loop configs) to extend base templates via `"extends": "templates/generic-ralph-loop.json"` and override specific sections. Supports inheritance and composition patterns, making it easy to customize preset loops while maintaining consistency.
   - **Refined:** Works with template copying approach (Idea 2). The `extends` syntax provides a declarative way to reference a template, and the setup workflow handles copying the template and applying overrides. This enables composition patterns where you can extend a base template and selectively override setupTasks, teardownTasks, or other sections.

6. **Available Agents Array in Loop Config** — Loop config includes an array of available agents that can be utilized for the flow. The AI agent setting up the loop reads from the skill/template to determine how to pull from this available agents array based on the loop's purpose and structure. This enables intelligent, context-aware agent routing while constraining selection to configured agents.

7. **Validation Layer with Schema Enforcement** — Add a validation step in setup-ralph-loop that checks task definitions against a JSON schema before creating Beads tasks. Provides early error detection, type safety, and clear error messages for malformed configs.
   - **Refined:** Required because we'll build a script to create Beads tasks from JSON, so formatting must be correct. The script needs to support adding labels, dependent tasks, and other metadata from the JSON structure. Validation ensures the JSON matches the expected schema before the script attempts to create Beads tasks.

8. **Workflow Integration via Config-Driven Pipeline** — Refactor setup-ralph-loop to set up a loop from a template and a goal/plan. The workflow pipeline: select/copy template → read plan/goal → extract main tasks from plan → combine with template's setupTasks and teardownTasks → validate schema → generate complete task list → create Beads tasks via script. The workflow orchestrates template selection, plan parsing, task combination, validation, and Beads task creation.

## Clustered Themes

⏭️ **Deferred** — Clustering phase not completed. Ideas captured above are ready for clustering in future session.

## Evaluation Matrix

⏭️ **Deferred** — Evaluation phase not completed. Ideas are ready for evaluation against mission metrics, constitution principles, and technical feasibility.

## Prioritized Candidates (Top 3-5)

⏭️ **Deferred** — Prioritization phase not completed. After evaluation, top candidates should be identified with scoring rationale.

## Research Questions for #ResearchAgent

_To be formulated after prioritization. Potential research areas:_

- JSON schema design patterns for task definitions (system-agnostic approach)
- Beads metadata extension capabilities (dependency: active task exists)
- Template composition and inheritance patterns
- Script design for Beads task creation from JSON (labels, dependencies, metadata)

**Research Mode Recommendation:** task — Research should focus on implementation details for the config-driven loop setup system.

## Parking Lot (Future Ideas)

_No ideas deferred to parking lot during this session._

## Session Log

**Ideation Techniques Used:** 
- Prompt-based generation
- Constraint-based creativity
- Refinement through Q&A

**Constitution Clauses Referenced:**
- C3 (Delivery Principles): Iterate in thin slices, guardrails before generation
- C5 (Evolution Without Backwards Compatibility): No need for backward compatibility
- C6 (Simplicity Over Rigidity): Keep schema simple and system-agnostic

**Mission Metrics Considered:**
- Reusable workflows that compound improvements
- Structured way to help developers tap AI agents confidently

**Conflicts/Blockers Encountered:** None

**Follow-up Actions:**
- [ ] Complete metadata extension task (dependency for Idea 1)
- [ ] Hand off refined ideas to research workflow for implementation details
- [ ] Consider clustering and evaluation in follow-up session if needed

## Recommended Next Steps

1. **Research implementation details** — Run `devagent research` to investigate JSON schema patterns, Beads task creation script requirements, and template composition approaches.

2. **Create implementation plan** — Run `devagent create-plan` to develop a detailed plan for implementing the config-driven loop setup system based on the refined ideas.

3. **Address dependency** — Complete the metadata extension task for Beads (active task exists) before implementing metadata support in the schema (Idea 1).
