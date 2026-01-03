# Audit Slash Commands Plan

- Owner: Jake Ruesink
- Last Updated: 2026-01-02
- Status: Draft
- Related Task Hub: `.devagent/workspace/tasks/active/2026-01-02_audit-slash-commands/`
- Stakeholders: Jake Ruesink (DRI), [NEEDS CLARIFICATION: reviewer(s) + decision role]
- Notes: Optional sections removed where not applicable.

---

## PART 1: PRODUCT CONTEXT

### Summary
Audit all slash commands in `.agents/commands/` to ensure each command aligns with its workflow in `.devagent/core/workflows/`, maintains the snippet/template model, and provides accurate input guidance. The outcome is a clear set of updates (if needed) that keep command behavior consistent and predictable for agents executing workflows.

### Context & Problem
The command set has grown to 15 files while workflows total 14. One command (`update-devagent.md`) lacked a confirmed workflow reference, and interactive workflows may require more explicit session guidance. Without a systematic audit, command instructions can drift from workflow expectations, leading to execution ambiguity and inconsistent agent behavior. Research packet: `.devagent/workspace/tasks/active/2026-01-02_audit-slash-commands/research/2026-01-02_slash-command-audit-requirements.md`.

### Objectives & Success Metrics
- All 16 commands map cleanly to existing workflows (or are explicitly re-scoped) with verified references.
- Each command follows the snippet/template model with a single input context area.
- Command instructions explicitly match workflow input requirements, including any workflow-specific guidance.
- Audit artifacts clearly document findings and updates to support future maintenance.

### Users & Insights
Primary users are internal agents and maintainers who rely on slash commands to invoke workflows consistently. Insights: the command structure is intended to be a simple snippet template, with workflow-specific guidance in instructions rather than multi-field forms.

### Solution Principles
- Keep commands as lightweight snippets with a single input context area.
- Maintain consistent instruction patterns across commands.
- Add workflow-specific guidance only when required for correct execution.

### Scope Definition
- **In Scope:** Audit all commands in `.agents/commands/`, verify workflow references, align input guidance, and update commands where required.
- **Out of Scope / Future:** Workflow redesign, new workflow creation (unless explicitly required to resolve missing mappings), or broader tooling changes beyond command files.

### Functional Narrative
#### Audit Flow
- Trigger: Plan approval and audit kickoff.
- Experience narrative: Inventory commands, confirm workflow references, compare instructions to workflow inputs, document findings, and implement minimal updates.
- Acceptance criteria: Each command is either aligned and unchanged or updated with documented rationale.

### Technical Notes & Dependencies
- Command structure reference: `.codex/skills/create-slash-command/references/command-structure.md`.
- Core workflow docs: `.devagent/core/workflows/`.
- Commands directory: `.agents/commands/` (symlinked to `.cursor/commands/`).

---

## PART 2: IMPLEMENTATION PLAN

### Scope & Assumptions
- Scope focus: Slash command audit + alignment updates.
- Key assumptions:
  - Existing workflows remain authoritative.
  - Commands must remain snippet templates with a single input context area.
  - Repo entry points: `.agents/commands/`, `.devagent/core/workflows/`, `.devagent/core/AGENTS.md`, `.codex/skills/create-slash-command/references/command-structure.md`.
- Out of scope: New workflows or major workflow refactors without explicit approval.
- Review window: Immediate / no fixed window (execute upon completion).

### Implementation Tasks

#### Task 1: Build command→workflow audit matrix
- **Objective:** Create a single source of truth for command/workflow mapping and audit status.
- **Impacted Modules/Files:** `.devagent/workspace/tasks/active/2026-01-02_audit-slash-commands/plan/command-audit-matrix.md`
- **Dependencies:** Research packet, command structure reference.
- **Acceptance Criteria:**
  - All 16 commands listed with workflow references and existence checks.
  - Matrix includes columns for structure alignment, input guidance alignment, and update decisions.
- **Validation Plan:** Manual review against `.agents/commands/` and `.devagent/core/workflows/`.

#### Task 2: Verify workflow references + structure compliance
- **Objective:** Confirm each command references the correct workflow file and follows the snippet/template model.
- **Impacted Modules/Files:** `.agents/commands/*.md`, `.devagent/core/workflows/*.md`, audit matrix file.
- **Dependencies:** Task 1.
- **Acceptance Criteria:**
  - Each command has a valid workflow reference or a documented exception.
  - Single input context placeholder is preserved for all commands.
- **Validation Plan:** Spot-check commands against `command-structure.md` and record results in audit matrix.

#### Task 3: Align command instructions with workflow inputs
- **Objective:** Ensure command instructions clearly reflect workflow input requirements, including interactive session guidance where needed.
- **Impacted Modules/Files:** `.agents/commands/brainstorm.md`, `.agents/commands/clarify-task.md`, other affected command files, audit matrix file.
- **Dependencies:** Task 2.
- **Acceptance Criteria:**
  - Required inputs are explicitly stated in command instructions.
  - Interactive workflows note the session-based execution model.
  - No command introduces multi-field or complex forms.
- **Validation Plan:** Compare instructions to workflow inputs and note alignment in audit matrix.

#### Task 4: Resolve missing workflow mappings
- **Objective:** Determine the intended workflow for `update-devagent.md` and update references or scope.
- **Impacted Modules/Files:** `.agents/commands/update-devagent.md`, possibly `.devagent/core/workflows/`, `.agents/commands/README.md`, `.cursor/commands/` symlinks (if renamed).
- **Dependencies:** Task 2 findings.
- **Acceptance Criteria:**
  - Each command has a documented, existing workflow target or is explicitly deprecated with a decision note.
- **Validation Plan:** Confirm workflow files exist and update matrix + task hub notes.

#### Task 5: Publish audit outcomes and update task hub
- **Objective:** Record decisions, update checklist status, and surface any open questions for review.
- **Impacted Modules/Files:** `.devagent/workspace/tasks/active/2026-01-02_audit-slash-commands/AGENTS.md`, audit matrix file.
- **Dependencies:** Tasks 1–4.
- **Acceptance Criteria:**
  - Feature hub reflects audit completion status and links to audit artifacts.
  - Open questions and risks are captured with owners.
- **Validation Plan:** Manual review of `AGENTS.md` for updated logs and references.

---

## Risks & Open Questions

| Item | Type (Risk / Question) | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Missing workflow target for `update-devagent` | Risk | Jake Ruesink | Investigate intended workflow; decide to add, retarget, or deprecate | [NEEDS CLARIFICATION] |
| Overfitting command instructions beyond snippet model | Risk | Jake Ruesink | Keep guidance minimal; validate against `command-structure.md` | [NEEDS CLARIFICATION] |

---

## Progress Tracking
Refer to the AGENTS.md file in the task directory for instructions on tracking and reporting progress during implementation.

---

## Appendices & References
- Research packet: `.devagent/workspace/tasks/active/2026-01-02_audit-slash-commands/research/2026-01-02_slash-command-audit-requirements.md`
- Command structure reference: `.codex/skills/create-slash-command/references/command-structure.md`
- Commands directory: `.agents/commands/`
- Workflows directory: `.devagent/core/workflows/`
