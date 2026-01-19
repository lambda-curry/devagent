# Epic Revise Report - DEV-36 Improving Agent Profiles + Consistent Test Loop Plan

**Date:** 2026-01-18  
**Epic ID:** devagent-6979  
**Status:** closed (after final quality gate)

## Executive Summary
This epic standardized Ralph agent “skills” references (agent-browser + storybook) and aligned agent instruction docs with consistent QA semantics. It also established a canonical, resettable `ralph-e2e` workspace structure for expectations + evidence, making the loop easier to review and reproduce.

## Task Status

| Task ID | Status | Title |
| :--- | :--- | :--- |
| devagent-6979.1 | closed | Create Storybook skill + update agent-browser guidance |
| devagent-6979.2 | closed | Update Ralph plugin manifest for skills |
| devagent-6979.3 | closed | Align agent instruction docs with skills and QA semantics |
| devagent-6979.4 | closed | Establish ralph-e2e plan + expectations structure |
| devagent-6979.5 | closed | Create follow-up task hub for Storybook setup |
| devagent-6979.6 | closed | Generate Epic Revise Report |

## Traceability Matrix

| Task ID | Title | Status | Commit |
| :--- | :--- | :--- | :--- |
| devagent-6979.1 | Create Storybook skill + update agent-browser guidance | closed | `4a51c770` - docs(ralph): add storybook skill and qa evidence (devagent-6979.1) |
| devagent-6979.2 | Update Ralph plugin manifest for skills | closed | `62c7b884` - chore(ralph): install agent-browser + storybook (devagent-6979.2) |
| devagent-6979.3 | Align agent instruction docs with skills and QA semantics | closed | `75d10614` - docs(ralph): align agent skills + QA fail semantics (devagent-6979.3) |
| devagent-6979.4 | Establish ralph-e2e plan + expectations structure | closed | `01d254d8` - docs(ralph-e2e): add expectations + versioning (devagent-6979.4) |
| devagent-6979.5 | Create follow-up task hub for Storybook setup | closed | `7b905e11` - docs(tasks): add storybook setup task hub (devagent-6979.5) |
| devagent-6979.6 | Generate Epic Revise Report | closed | *See this report commit* |

## Evidence & Screenshots

- **Screenshot Directory (preferred)**: `.devagent/workspace/reviews/devagent-6979/screenshots/`
- **Screenshots Captured**: 0 (docs/process changes only)

## Improvement Recommendations

### Documentation
- [ ] **[High] Reduce instruction drift**: Agent instruction docs had drift in skill references and QA fail semantics. Keep a single canonical skill list/order across agent instruction files and enforce a single QA fail rule: FAIL ⇒ status `open` + evidence; reserve `blocked` for true external dependencies.  
  - **Files**: `.devagent/plugins/ralph/agents/*-agent-instructions.md`
- [ ] **[Medium] Keep agent-browser aligned to ralph-e2e**: agent-browser guidance previously defaulted to task-hub screenshots and lacked ralph-e2e run-hub routing + a consistent QA evidence template. Keep the skill doc aligned with `ralph-e2e` conventions and include copy/paste PASS/FAIL templates.  
  - **Files**: `.devagent/plugins/ralph/skills/agent-browser/SKILL.md`, `.devagent/plugins/ralph/skills/storybook/SKILL.md`
- [ ] **[Medium] Expectations need a default policy**: a resettable loop needs a default expectations versioning/review policy. Keep a living `expectations.md` with CalVer + `CHANGELOG.md`, and require run reviews to cite expectations version + commit hash in Beads.  
  - **Files**: `.devagent/workspace/tests/ralph-e2e/expectations/expectations.md`, `.devagent/workspace/tests/ralph-e2e/expectations/CHANGELOG.md`

### Process
- [ ] **[High] Make revise-report generation executable**: The workflow references `devagent ralph-revise-report`, but the `devagent` CLI may not exist in all environments/shells. Provide a repo-local executable entrypoint (e.g. `bun ./...`) and document it in the workflow/skill docs.  
  - **Files**: `.devagent/plugins/ralph/commands/generate-revise-report.md`, `.devagent/plugins/ralph/skills/revise-report-generation/SKILL.md`
- [ ] **[Medium] Clarify symlink artifacts from setup**: Running Ralph setup creates untracked symlinks under `.cursor/skills` and `.codex/skills` that can distract during later git work. Document this as expected behavior, or add targeted `.gitignore` rules if these paths should never be committed.  
  - **Files**: `.devagent/core/scripts/sync-plugin-assets.sh`, `.devagent/plugins/ralph/setup.sh`
- [ ] **[Medium] Avoid “beads-sync follow-up commit” churn**: `bd sync` modifies `.beads/issues.jsonl` after code/docs commits, often requiring a second commit. Run `bd sync` earlier (pre-commit) or plan for a follow-up beads-sync commit in the validation checklist.  
  - **Files**: `.beads/issues.jsonl`, `AGENTS.md`

### Rules & Standards
- No cross-cutting rules issues recorded in this epic’s revision learnings.

### Tech Architecture
- No architecture issues recorded in this epic’s revision learnings.

## Action Items
1. [ ] **[High]** Add and document a repo-local `ralph-revise-report` command (or `devagent` wrapper) that works in non-interactive shells. *(Process)*
2. [ ] **[High]** Enforce canonical skill references + QA fail semantics across agent instruction docs (keep in sync). *(Documentation)*
3. [ ] **[Medium]** Document (or ignore) `.cursor/skills` + `.codex/skills` symlink artifacts created by setup. *(Process)*
4. [ ] **[Medium]** Keep `ralph-e2e` expectations versioning policy explicit (CalVer + changelog + Beads citation). *(Documentation)*
5. [ ] **[Medium]** Adjust workflow ordering to reduce beads-sync “extra commit” churn. *(Process)*

