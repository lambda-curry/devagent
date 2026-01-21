# DEV-36 Improving Agent Profiles + Consistent Test Loop Plan

- Owner: Jake Ruesink
- Last Updated: 2026-01-18
- Status: Draft
- Related Task Hub: `.devagent/workspace/tasks/completed/DEV-36_review-linear-issue/`
- Stakeholders: Jake Ruesink (Requestor, Decision Maker)
- Notes: Remove sections marked (Optional) if they do not apply.

---

## PART 1: PRODUCT CONTEXT

### Summary
DEV-36 improves agent profiles (design + QA) by standardizing skill references and establishes a consistent, resettable test loop for Ralph/Beads execution. The plan focuses on skill portability, clear agent instructions, and a canonical `ralph-e2e` workspace so QA evidence and expectations remain repeatable.

### Context & Problem
Current agent guidance relies on skills that are not consistently installed (notably `agent-browser`), Storybook is not present in this repo, and the resettable test loop lacks a canonical folder structure. This leads to skipped browser verification, inconsistent evidence capture, and unclear expectations across runs. Clarification and research confirm the needed artifacts and decisions but deferred run review/versioning choices must be resolved in this plan. Refer to the clarification and research packets for constraints and evidence.

### Objectives & Success Metrics
- **Skill discoverability:** `agent-browser` and the new `storybook` skill are listed in `.devagent/plugins/ralph/plugin.json` and appear in `.cursor/skills/` after setup.
- **Agent instruction alignment:** All agent instruction docs reference skills consistently and reflect QA failure semantics (`open` on fail, no `blocked`).
- **Repeatable test loop:** `.devagent/workspace/tests/ralph-e2e/` includes `plan/`, `expectations/`, and `runs/` with an expectations versioning scheme and a defined run review mechanism.
- **Follow-up readiness:** A dedicated task hub exists for Storybook setup in `apps/ralph-monitoring` with the Reportory reference captured as a dependency.

### Users & Insights
- **Primary users:** Internal agents (design, QA, implementation, PM) and maintainers who rely on consistent, discoverable skills.
- **Insights:** Missing skill wiring leads to skipped browser testing; Storybook is absent in the repo; QA should report evidence and return failures to `open` without modifying code.

### Solution Principles
- **Skill portability:** Skills are tool-focused and avoid project-specific references.
- **Process prompts live in agent instructions:** Agents reference skills rather than duplicating tool guidance.
- **QA evidence discipline:** Failures include expected vs actual, screenshot paths, and doc links.
- **No code changes by QA:** QA reports and returns tasks to `open` (never `blocked`).
- **Single canonical test loop:** `ralph-e2e` uses a shared plan and expectations set with screenshot-only run hubs.

### Scope Definition
- **In Scope:**
  - Add `agent-browser` + `storybook` to Ralph plugin skill manifest
  - Create Storybook skill doc and update agent-browser screenshot guidance
  - Create design agent instruction file and align all agent instruction docs to skill references
  - Establish `ralph-e2e` plan/expectations/runs structure with review + versioning decisions
  - Create follow-up task hub for Storybook setup in `apps/ralph-monitoring`
- **Out of Scope / Future:**
  - Implementing Storybook itself (tracked as a follow-up task)
  - Building enforcement tooling beyond instruction updates (e.g., automated gates)
  - Changing Beads runtime behavior beyond instructions (e.g., new status types)

### Functional Narrative

#### Skill Discovery & Usage
- Trigger: Ralph setup runs sync scripts.
- Experience narrative: Skills listed in `.devagent/plugins/ralph/plugin.json` are symlinked into `.cursor/skills/` for agent discovery. Agents reference skills in their instruction docs instead of embedding tool guidance.
- Acceptance criteria: New skills appear under `.cursor/skills/` after running setup; agents cite skill names in instructions.

#### Design Agent Guidance
- Trigger: Design agent participates in a Ralph execution.
- Experience narrative: Design agent uses Storybook skill guidance to document UI decisions and posts comments on engineering Beads tasks referencing Storybook stories.
- Acceptance criteria: Design agent instructions reference the Storybook skill and describe comment format/output expectations.

#### QA Review & Evidence Capture
- Trigger: QA agent verifies implementation tasks.
- Experience narrative: QA runs `agent-browser` for UI validation, captures required screenshots, and posts pass/fail comments with expected vs actual, screenshot paths, and doc links. Failures return tasks to `open`.
- Acceptance criteria: QA instructions mandate agent-browser usage for UI changes and specify `open` on fail.

#### ralph-e2e Test Loop
- Trigger: A run is executed using the canonical plan.
- Experience narrative: `ralph-e2e` stores its plan and expectations in canonical folders, with each run capturing screenshots under `runs/YYYY-MM-DD_<epic-id>/`. Final run review is captured in the Beads epic comments referencing the expectations version and screenshot paths.
- Acceptance criteria: Expectations doc exists with versioning, run review mechanism is documented, and run hubs remain screenshot-only.

### Technical Notes & Dependencies (Optional)
- Skill sync mechanism: `.devagent/core/scripts/sync-plugin-assets.sh` and `.devagent/plugins/ralph/setup.sh` rely on `plugin.json` entries.
- Storybook: no Storybook setup exists in repo; follow-up task required for `apps/ralph-monitoring`.
- Agent-browser: CLI must be installed and available; skill guidance updated for `ralph-e2e` paths.

---

## PART 2: IMPLEMENTATION PLAN

### Scope & Assumptions
- Scope focus: DEV-36 workflow + documentation updates and test loop scaffolding
- Key assumptions:
  - `agent-browser` CLI is available in target environments.
  - Storybook setup will be handled in a follow-up task.
- Out of scope:
  - Building Storybook infrastructure or enforcing QA automation beyond documentation updates.

### Implementation Tasks

#### Task 1: Create Storybook skill + update agent-browser guidance
- **Objective:** Add a portable Storybook skill and update `agent-browser` guidance to support `ralph-e2e` screenshot paths and QA evidence format.
- **Impacted Modules/Files:**
  - `.devagent/plugins/ralph/skills/storybook/SKILL.md` (new)
  - `.devagent/plugins/ralph/skills/agent-browser/SKILL.md`
- **References:**
  - `.devagent/workspace/tasks/completed/DEV-36_review-linear-issue/clarification/2026-01-18_initial-clarification.md`
  - `.devagent/workspace/tasks/completed/DEV-36_review-linear-issue/research/2026-01-18_dev-36-skills-agent-browser-storybook-ralph-e2e.md`
- **Dependencies:** None
- **Acceptance Criteria:**
  - Storybook skill exists and describes usage patterns without project-specific references.
  - Agent-browser skill includes `ralph-e2e` screenshot routing rules and retains fallback guidance for normal task hubs.
  - QA evidence requirements (fail reason, expected vs actual, screenshot paths, doc links) are reinforced.
- **Testing Criteria:**
  - Manual verification: skill docs render, paths resolve, and references match clarified constraints.
- **Validation Plan:**
  - Spot-check skill docs against DEV-36 clarification decisions (Q25, Q34, Q36).

#### Task 2: Update Ralph plugin manifest for skills
- **Objective:** Ensure `agent-browser` and `storybook` skills are installed via Ralph setup.
- **Impacted Modules/Files:**
  - `.devagent/plugins/ralph/plugin.json`
- **References:**
  - `.devagent/core/scripts/sync-plugin-assets.sh`
  - `.devagent/plugins/ralph/setup.sh`
- **Dependencies:** Task 1
- **Acceptance Criteria:**
  - `plugin.json` lists `skills/agent-browser/SKILL.md` and `skills/storybook/SKILL.md`.
  - Running Ralph setup results in symlinks under `.cursor/skills/agent-browser` and `.cursor/skills/storybook`.
- **Testing Criteria:**
  - Run `.devagent/plugins/ralph/setup.sh` and confirm `.cursor/skills/` symlinks exist.
- **Validation Plan:**
  - Verify `sync-plugin-assets.sh` logs or filesystem entries for new skills.

#### Task 3: Align agent instruction docs with skills and QA semantics
- **Objective:** Add a design agent instruction file and update existing agent instructions to reference skills consistently and enforce QA fail behavior (`open`).
- **Impacted Modules/Files:**
  - `.devagent/plugins/ralph/agents/design-agent-instructions.md` (new)
  - `.devagent/plugins/ralph/agents/general-agent-instructions.md`
  - `.devagent/plugins/ralph/agents/engineering-agent-instructions.md`
  - `.devagent/plugins/ralph/agents/qa-agent-instructions.md`
  - `.devagent/plugins/ralph/agents/project-manager-agent-instructions.md`
- **References:**
  - `.devagent/workspace/tasks/completed/DEV-36_review-linear-issue/clarification/2026-01-18_initial-clarification.md`
- **Dependencies:** Task 1 (skills should exist for references)
- **Acceptance Criteria:**
  - All agent instruction docs reference relevant skills (Beads, agent-browser, Storybook where applicable).
  - QA instructions explicitly set failed tasks back to `open` and prohibit `blocked` for MVP.
  - Design agent instructions specify Storybook usage and Beads task comment guidance.
- **Testing Criteria:**
  - Manual review to ensure consistent skill references and QA semantics across instructions.
- **Validation Plan:**
  - Use `rg "skill" .devagent/plugins/ralph/agents` to confirm references and consistency.

#### Task 4: Establish `ralph-e2e` plan + expectations structure
- **Objective:** Create the canonical test loop structure and document review + versioning decisions.
- **Impacted Modules/Files:**
  - `.devagent/workspace/tests/ralph-e2e/plan/` (new)
  - `.devagent/workspace/tests/ralph-e2e/expectations/expectations.md` (new)
  - `.devagent/workspace/tests/ralph-e2e/expectations/CHANGELOG.md` (new)
  - `.devagent/workspace/tests/ralph-e2e/runs/` (new)
- **References:**
  - `.devagent/workspace/tasks/completed/DEV-36_review-linear-issue/clarification/2026-01-18_initial-clarification.md`
- **Dependencies:** None
- **Acceptance Criteria:**
  - Directory structure matches `plan/`, `expectations/`, `runs/YYYY-MM-DD_<epic-id>/` convention.
  - Expectations doc includes explicit versioning and a change log.
  - Run review mechanism is documented: final review captured via Beads epic comment referencing expectations version + screenshot paths (no run report file).
- **Testing Criteria:**
  - Manual filesystem verification and spot-check expectations doc content.
- **Validation Plan:**
  - Create a placeholder run folder with a README or `.gitkeep` only if required by tooling; otherwise keep `runs/` empty.

#### Task 5: Create follow-up task hub for Storybook setup
- **Objective:** Track Storybook setup for `apps/ralph-monitoring` as a separate task with explicit dependencies.
- **Impacted Modules/Files:**
  - `.devagent/workspace/tasks/active/YYYY-MM-DD_storybook-setup-ralph-monitoring/AGENTS.md` (new task hub)
- **References:**
  - `.devagent/workspace/tasks/completed/DEV-36_review-linear-issue/research/2026-01-18_dev-36-skills-agent-browser-storybook-ralph-e2e.md`
- **Dependencies:** Reportory Storybook setup reference (repo/path/snippets)
- **Acceptance Criteria:**
  - New task hub exists with clear scope, owners, and dependencies.
  - Task explicitly captures the Reportory reference as a required input.
- **Testing Criteria:**
  - N/A (documentation-only deliverable).
- **Validation Plan:**
  - Verify task hub appears under `active/` with correct ISO date prefix.

### Implementation Guidance (Optional)
- **From `.devagent/core/AGENTS.md` → Standard Workflow Instructions (Date Handling):**
  - Use `date +%Y-%m-%d` to stamp all new files and updates that require an ISO date. (`.devagent/core/AGENTS.md`)
- **From `.devagent/core/AGENTS.md` → Storage Patterns:**
  - Task hubs belong under `.devagent/workspace/tasks/{status}/YYYY-MM-DD_task-slug/` and new artifacts should follow dated filenames. (`.devagent/core/AGENTS.md`)
- **From `.devagent/workspace/tasks/completed/DEV-36_review-linear-issue/clarification/2026-01-18_initial-clarification.md`:**
  - QA failures return Beads tasks to `open` and must include evidence links (expected vs actual, screenshots, doc links).

---

## Risks & Open Questions

| Item | Type (Risk / Question) | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| `agent-browser` CLI availability across environments | Risk | Jake | Confirm install and add to setup notes if missing | Before implementation |
| Reportory Storybook setup reference location | Question | Jake | Capture repo/path/snippets in follow-up Storybook task hub | Next planning pass |

---

## Progress Tracking
Refer to the AGENTS.md file in the task directory for instructions on tracking and reporting progress during implementation.

---

## Appendices & References (Optional)
- `.devagent/workspace/tasks/completed/DEV-36_review-linear-issue/clarification/2026-01-18_initial-clarification.md`
- `.devagent/workspace/tasks/completed/DEV-36_review-linear-issue/research/2026-01-18_dev-36-skills-agent-browser-storybook-ralph-e2e.md`
- `.devagent/plugins/ralph/plugin.json`
- `.devagent/plugins/ralph/skills/agent-browser/SKILL.md`
- `.devagent/core/scripts/sync-plugin-assets.sh`
