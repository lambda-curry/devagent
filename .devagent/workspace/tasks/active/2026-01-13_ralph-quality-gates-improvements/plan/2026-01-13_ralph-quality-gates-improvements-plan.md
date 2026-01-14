# Ralph Quality Gates Improvements Plan

- Owner: Jake Ruesink
- Last Updated: 2026-01-13
- Status: Draft
- Related Task Hub: `.devagent/workspace/tasks/active/2026-01-13_ralph-quality-gates-improvements/`
- Stakeholders: Jake Ruesink (Owner, Decision Maker)
- Notes: Clarification + research complete. Manual validation only; no automated tests required.

---

## PART 1: PRODUCT CONTEXT

### Summary
Upgrade Ralph's quality gates from static templates to a hybrid, self-diagnosing model and fully integrate `agent-browser` for UI verification. Agents will generate a task-specific checklist at runtime, run project-appropriate verification commands, and consistently capture UI evidence when frontend changes occur.

### Context & Problem
Ralph currently relies on static JSON templates (e.g., `typescript.json`) that assume default `npm` commands and do not adapt to real project scripts or frameworks. This breaks in non-standard setups and leaves UI verification manual/ad-hoc. References: `.devagent/workspace/tasks/active/2026-01-13_ralph-quality-gates-improvements/clarification/2026-01-13_initial-clarification.md`, `.devagent/workspace/tasks/active/2026-01-13_ralph-quality-gates-improvements/research/2026-01-13_ralph-quality-gates-research.md`.

### Objectives & Success Metrics
- Agents autonomously verify the 7-point checklist (feedback, success criteria, standard checks, UI testing when needed, new tests when required, conventional commit, git push).
- Verification commands are derived from project scripts/frameworks (not static defaults).
- UI verification uses `agent-browser` with DOM assertions and failure screenshots; success screenshots are optional for design review.

### Users & Insights
- Primary users: Developers using Ralph for autonomous execution.
- Insight: Static quality gate assumptions and ad-hoc UI checks create brittle execution and inconsistent verification.

### Solution Principles
- Hybrid diagnosis: minimal upfront detection + agent-generated checklist at runtime.
- Lightweight enhancements: no multi-agent complexity; keep Ralph prompt + skills as the primary leverage.
- Evidence-driven UI testing: DOM assertions + failure screenshots; success screenshots only when design review is expected.

### Scope Definition
- **In Scope:**
  - Update `quality-gate-detection` skill for hybrid discovery (scripts + framework signals).
  - Update Ralph prompt to require agent-generated quality checklist and 7-point verification.
  - Integrate smart browser-testing defaults and evidence capture guidance.
  - Update documentation/guidance to reflect new quality gate expectations.
- **Out of Scope / Future:**
  - Building a new multi-agent orchestration layer.
  - CI/CD automation changes or new test infrastructure.
  - New UI snapshot tooling beyond `agent-browser`.

### Functional Narrative

#### Flow: Task Start → Self-Diagnosed Verification Plan
- Trigger: Ralph agent receives a task.
- Experience narrative: Agent reads task context, inspects `package.json`/project structure, then produces a task-specific verification checklist aligned to the 7-point quality gate requirements.
- Acceptance criteria:
  - Checklist explicitly covers all 7 quality points.
  - Verification commands reflect actual project scripts/frameworks.

#### Flow: UI Changes → Browser Verification
- Trigger: Agent detects frontend file changes (`.tsx`, `.css`) or UI-related work.
- Experience narrative: Agent runs `agent-browser`, performs DOM assertions, and captures failure screenshots (and optional success screenshots when design review is expected).
- Acceptance criteria:
  - DOM assertions are recorded for UI-relevant tasks.
  - Failure screenshots are saved with documented paths.

#### Flow: Task Completion → Evidence + Push
- Trigger: Task implementation completed.
- Experience narrative: Agent runs relevant quality gates, creates conventional commit, pushes code, and logs improvement feedback as Beads comments.
- Acceptance criteria:
  - Commit is conventional and pushed.
  - Improvement feedback comment is logged.

### Technical Notes & Dependencies (Optional)
- `ralph.sh` drives the prompt and currently injects static quality gate commands.
- `quality-gate-detection` skill and `agent-browser` skill define the verification guidance.
- `agent-browser` CLI must be available in PATH for UI checks.

---

## PART 2: IMPLEMENTATION PLAN

### Scope & Assumptions
- Scope focus: Ralph quality gate intelligence + browser verification integration.
- Key assumptions: Hybrid diagnosis; agent-generated checklist; push every task; `agent-browser` is the only browser automation path.
- Out of scope: CI changes, new testing frameworks, multi-agent orchestration.

### Implementation Tasks

#### Task 1: Redesign Quality Gate Detection for Hybrid Self-Diagnosis
- **Objective:** Update the `quality-gate-detection` skill to guide agents in detecting scripts/frameworks and generating task-specific verification commands rather than loading a static template.
- **Impacted Modules/Files:**
  - `.devagent/plugins/ralph/skills/quality-gate-detection/SKILL.md`
  - `.devagent/plugins/ralph/quality-gates/typescript.json` (baseline defaults; mark as fallback)
  - `.devagent/plugins/ralph/tools/config.json` (if a new mode/flag is needed to signal hybrid detection)
- **Dependencies:** None.
- **Acceptance Criteria:**
  - Skill instructs agents to read `package.json` scripts and detect frameworks (e.g., Jest vs. Vitest) to derive test/lint/typecheck commands.
  - Skill specifies a fallback path when scripts are missing (document default commands + require agent confirmation).
  - Output format supports passing discovery results into Ralph prompt context (commands + rationale).
- **Testing Criteria:**
  - Validate against a sample `package.json` with non-standard scripts and confirm derived commands are correct.
- **Validation Plan:** Manual: run the skill guidance against a known repo and confirm the generated commands match existing scripts.

#### Task 2: Update Ralph Prompt to Enforce the 7-Point Checklist + Dynamic Gates
- **Objective:** Modify `ralph.sh` prompt construction to require the agent-generated checklist, dynamic quality gate commands, and smart browser verification instructions.
- **Impacted Modules/Files:**
  - `.devagent/plugins/ralph/tools/ralph.sh`
  - `.devagent/plugins/ralph/AGENTS.md` (quality gate requirements + 7-point checklist reference)
- **Dependencies:** Task 1 (quality-gate-detection guidance).
- **Acceptance Criteria:**
  - Prompt explicitly requires the 7-point checklist and task-specific verification steps.
  - Prompt instructs agents to run standard checks based on detected scripts/frameworks, not hard-coded defaults.
  - Prompt includes UI testing trigger guidance (frontend file changes, UI tasks) and references `agent-browser` for DOM assertions + failure screenshots.
  - Prompt reminds agents to push after each task and log improvement feedback via Beads comments.
- **Testing Criteria:**
  - Inspect generated prompt for a sample task and verify checklist + quality gate instructions appear.
- **Validation Plan:** Manual: run `ralph.sh` against a test task and confirm prompt contents include new quality gate guidance.

#### Task 3: Strengthen Agent-Browser Guidance for Smart Defaults + Evidence Capture
- **Objective:** Update `agent-browser` skill to standardize triggers, DOM assertion requirements, and screenshot behavior aligned with the clarified requirements.
- **Impacted Modules/Files:**
  - `.devagent/plugins/ralph/skills/agent-browser/SKILL.md`
- **Dependencies:** None.
- **Acceptance Criteria:**
  - Skill calls out smart defaults: detect `.tsx`/`.css` changes (or UI tasks) to trigger browser testing.
  - Failure screenshots are mandatory; success screenshots are optional and tied to design review needs.
  - DOM assertions are required for UI verification (not screenshots alone).
  - Beads comment format for screenshots is clearly documented.
- **Testing Criteria:**
  - Dry-run the instructions for a UI task and confirm the steps are unambiguous and actionable.
- **Validation Plan:** Manual: follow the updated instructions on a sample UI change and verify evidence paths + comments.

### Implementation Guidance (Optional)
- **From `.devagent/plugins/ralph/AGENTS.md` → Commit Messaging Guidelines:**
  - Use Conventional Commits with task IDs and preserve the Ralph co-author trailer; include quality gate results in the commit body.
- **From `.devagent/plugins/ralph/AGENTS.md` → Task Commenting for Traceability:**
  - After completion, add comments for revision learning, screenshots (if any), and commit information.
- **From `.devagent/plugins/ralph/skills/agent-browser/SKILL.md` → Screenshot Management:**
  - Save screenshots under `.devagent/workspace/reviews/[epic-id]/...` and include paths in task comments.

---

## Risks & Open Questions

| Item | Type (Risk / Question) | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Detection heuristics may miss non-standard scripts (pnpm/yarn custom commands) | Risk | Implementation | Provide fallback guidance and require agent confirmation when scripts are missing or ambiguous | TBD |
| UI trigger logic may be inconsistent if relying only on file extensions | Risk | Implementation | Require agent to also consider task intent/description when deciding on browser tests | TBD |
| Agent-browser CLI availability across environments | Risk | Implementation | Document CLI requirement and explicit failure handling in skill | TBD |
| How to pass detection outputs into prompt (inline vs. file output) | Question | Owner | Decide whether `quality-gates.json` remains or shift to prompt-only context | TBD |

---

## Progress Tracking
Refer to the AGENTS.md file in the task directory for instructions on tracking and reporting progress during implementation.

---

## Appendices & References (Optional)
- Clarification packet: `.devagent/workspace/tasks/active/2026-01-13_ralph-quality-gates-improvements/clarification/2026-01-13_initial-clarification.md`
- Research packet: `.devagent/workspace/tasks/active/2026-01-13_ralph-quality-gates-improvements/research/2026-01-13_ralph-quality-gates-research.md`
- Ralph plugin instructions: `.devagent/plugins/ralph/AGENTS.md`
- Quality gate template: `.devagent/plugins/ralph/quality-gates/typescript.json`
- Ralph execution loop: `.devagent/plugins/ralph/tools/ralph.sh`
