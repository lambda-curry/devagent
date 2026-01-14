# Research Packet: Ralph Self-Diagnosing Quality Gates

- **Date:** 2026-01-13
- **Author:** Jake Ruesink
- **Classification:** Implementation Design
- **Status:** Draft
- **Source Context:** Migrated from combined task `2026-01-13_ralph-quality-gates-and-monitoring-ui`

## Problem Statement
Move Ralph's quality gates from static JSON templates to "self-diagnosing" patterns. Agents should analyze the project structure (e.g., `package.json`, file types) to determine the appropriate verification steps (test, lint, typecheck) dynamically. Additionally, integrate `agent-browser` for autonomous UI verification.

## Findings & Tradeoffs

### 1. Self-Diagnosing Quality Gates
- **Current State:** Static `typescript.json` defines standard commands (`npm test`, `npm run lint`).
- **Proposed Pattern:**
  - **Project Discovery:** Agent analyzes `package.json` and project structure to find available scripts and test frameworks.
  - **Context-Aware Verification:** Agent proposes specific commands relevant to the task (e.g., running only the affected test file using `jest -t "pattern"`).
  - **Skill Update:** The `quality-gate-detection` skill should be updated to guide the agent in *performing* discovery rather than just loading a file.

### 2. Browser Testing Integration
- **Current State:** `agent-browser` skill exists but integration is manual/ad-hoc.
- **Proposed Pattern:**
  - **Visual Verification:** Integrated use of `agent-browser` to capture screenshots and verify DOM state for UI changes.
  - **Evidence Collection:** Agents should be prompted to capture "before" and "after" evidence for UI tasks.

## Recommendations

1.  **Skill Refinement:** Update the `quality-gate-detection` skill to emphasize agent-driven discovery.
2.  **Prompt Engineering:** Modify the Ralph prompt in `ralph.sh` (or the agent instruction template) to explicitly ask the agent to "diagnose the verification strategy" before starting work.
3.  **Browser Integration:** Update `agent-browser` skill to include standard "verification patterns" (e.g., check console for errors, verify element visibility).

## Repo Next Steps
- [ ] Update `quality-gate-detection/SKILL.md` to support dynamic discovery.
- [ ] Prototype a "Self-Diagnosing" prompt for Ralph agents.
