# Research — DEV-36: skills wiring, agent-browser, Storybook, ralph-e2e context

- Mode: Task
- Requested By: Jake Ruesink
- Last Updated: 2026-01-18
- Related Plan: (not yet created)
- Storage Path: `.devagent/workspace/tasks/completed/DEV-36_review-linear-issue/research/2026-01-18_dev-36-skills-agent-browser-storybook-ralph-e2e.md`
- Stakeholders: Jake Ruesink (Decision Maker)

## Request Overview
DEV-36 aims to improve agent profiles (design + QA) and establish a consistent, resettable test loop. This research pass focuses on internal evidence for:
- How “skills” are wired into `.cursor/skills/` today
- The current state of `agent-browser` integration (and why it may be skipped in practice)
- Storybook current state in this repo + what we’ll need to do to make Storybook-based design work practical
- How these constraints affect the proposed `ralph-e2e` run hub and screenshot storage conventions

## Research Questions
| ID | Question | Status | Notes |
| --- | --- | --- | --- |
| RQ1 | How are Ralph plugin skills installed and made available to Cursor (`.cursor/skills/`)? | Answered | Confirmed: `sync-plugin-assets.sh` + `ralph/setup.sh` |
| RQ2 | Is `agent-browser` currently installed/synced as a skill for Cursor, and is there a runbook for using it? | Answered (partial) | Documented as a skill, but not included in Ralph plugin manifest → not synced |
| RQ3 | Is Storybook already set up in this repo (esp. `apps/ralph-monitoring`)? | Answered | No evidence of Storybook in repo (no `.storybook`, no `@storybook/*`) |
| RQ4 | What gaps should be resolved before `devagent create-plan` so DEV-36 is implementable? | Follow-up | “Run results review vs expectations” + Reportory Storybook reference remain open |

## Key Findings
- **Skill wiring exists and is Cursor-first**: plugin skills are symlinked into `.cursor/skills/<skill>` via `.devagent/core/scripts/sync-plugin-assets.sh`, invoked by `.devagent/plugins/ralph/setup.sh`.
- **Ralph currently does *not* publish `agent-browser` as an installed skill**: `.devagent/plugins/ralph/plugin.json` lists only 3 skills; `agent-browser` is not among them, so setup will not sync it into `.cursor/skills/`. This likely contributes to “browser testing skipped” failures.
- **`agent-browser` is treated as a documented practice, not an enforced/automated step**: Ralph prompts mention it, but there’s no hard enforcement; a historical gap report documents skipped browser testing in UI tasks.
- **Storybook is not currently present in this repo**: there are no Storybook config directories or deps; DEV-36’s Storybook-based design workflow requires adding Storybook (you requested a follow-up task for `apps/ralph-monitoring`, inspired by Reportory).

## Detailed Findings

### RQ1 — Skill installation & `.cursor/skills/` wiring
**Answer:** The repo already has a canonical mechanism to wire plugin-defined skills into `.cursor/skills/` as symlinks.

**Evidence:**
- `.devagent/core/scripts/sync-plugin-assets.sh` (2026-01-18) — creates `.cursor/skills/` and symlinks each skill directory based on `plugin.json`:
  - Creates `.cursor/skills` and `.codex/skills` (`mkdir -p .cursor/skills`, etc.)
  - For each `skills/<skill>/SKILL.md` in `plugin.json`, symlinks:
    - `.cursor/skills/<skill>` → `../../.devagent/plugins/<plugin>/skills/<skill>`
    - `.codex/skills/<skill>` → `../../.cursor/skills/<skill>`
- `.devagent/plugins/ralph/setup.sh` (2026-01-18) — runs the sync script for the `ralph` plugin.
- `.devagent/core/PLUGINS.md` (2026-01-18) — documents “plugin skills are installed to `.cursor/skills/<skill-name>/`”.

**Implication for DEV-36:** If we add new skills (e.g., `storybook`) or want existing skills (e.g., `agent-browser`) to be discoverable via Cursor, they must be included in `.devagent/plugins/ralph/plugin.json`.

### RQ2 — `agent-browser` integration reality check
**Answer (partial):** `agent-browser` is documented as a skill and referenced by Ralph instructions, but it is not installed/synced by the Ralph plugin today.

**Evidence:**
- `.devagent/plugins/ralph/skills/agent-browser/SKILL.md` — documents using `agent-browser` and provides screenshot directory guidance.
- `.devagent/plugins/ralph/AGENTS.md` — instructs agents to use `agent-browser` and capture screenshots for failures.
- `.devagent/plugins/ralph/agents/qa-agent-instructions.md` — directs QA to use agent-browser for UI verification.
- `.devagent/plugins/ralph/plugin.json` — does **not** include `skills/agent-browser/SKILL.md` in its `skills` list, so it will not be synced to `.cursor/skills/` by setup.
- `.devagent/workspace/reviews/2026-01-14_ralph-browser-testing-gap.md` — documents a real incident where UI tasks completed without browser testing/screenshots.

**Implication for DEV-36:**
- Add `skills/agent-browser/SKILL.md` to `.devagent/plugins/ralph/plugin.json` so it is actually installed and discoverable in Cursor.
- Consider aligning the router/prompt rules so UI verification is harder to skip (at least via clearer prompts; enforcement is a separate design decision).
- DEV-36’s `ralph-e2e` run hub requirement (screenshots living under tests run hub) requires updating screenshot path guidance in the `agent-browser` skill (today it prefers `.devagent/workspace/tasks/active/.../screenshots/` with fallbacks under `reviews/`).

### RQ3 — Storybook status in this repo
**Answer:** No Storybook setup was found in the repo as of 2026-01-18.

**Evidence:**
- No `.storybook` directory found in the repo (search result: none).
- No `@storybook/*` packages referenced in the repo (search result: none).

**Implication for DEV-36:** The Storybook-based part of the design agent workflow needs a dedicated “set up Storybook for `apps/ralph-monitoring`” task (as you requested). The “inspiration from Reportory” is currently an external dependency (needs a path/repo reference).

## Comparative / Alternatives Analysis (Optional)
- **“Skills in plugin vs docs-only” tradeoff:**
  - Skills installed via plugin wiring are more reliably discoverable by Cursor.
  - Docs-only skills living under `.devagent/plugins/ralph/skills/**` but not in `plugin.json` risk being “real but undiscoverable” for agents relying on auto-discovery.

## Implications for Implementation
- **Update Ralph plugin manifest**: include `agent-browser` and new `storybook` skill paths in `.devagent/plugins/ralph/plugin.json` so setup syncs them.
- **Align QA failure semantics**: current Ralph base instructions lean toward `blocked`/`in_progress` behaviors in some places; DEV-36 clarified QA fail should return tasks to `open`. Planning should include aligning the instruction set accordingly.
- **Test loop layout feasibility**: `.devagent/workspace/tests/ralph-e2e/...` is new; the plan should include creating this structure and updating screenshot path guidance to route `ralph-e2e` runs there.

## Risks & Open Questions
| Item | Type | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| How final run results are reviewed vs expectations (screenshots-only run hubs) | Question | Jake | Decide whether this is a PM final task, epic comment, or separate report artifact | Next planning pass |
| Expectations doc versioning strategy (single canonical vs dated snapshots) | Question | Jake | Decide in create-plan; add a small runbook section either way | Next planning pass |
| Reportory Storybook setup reference location | Question | Jake | Provide repo/path/snippets so we can copy the working pattern | Next planning pass |

## Recommendation
Proceed to `devagent create-plan` with these constraints baked in:
- Treat skill discoverability as “manifest-driven”: add skills to `.devagent/plugins/ralph/plugin.json` or they won’t show up in `.cursor/skills/`.
- Create `storybook` skill at `.devagent/plugins/ralph/skills/storybook/SKILL.md` and add it to the manifest.
- Add `agent-browser` skill to the manifest and update screenshot path guidance to support `ralph-e2e` run hubs.
- Add an explicit task to set up Storybook for `apps/ralph-monitoring` (using Reportory as a reference once provided).

## Repo Next Steps
- [ ] Add `agent-browser` to `.devagent/plugins/ralph/plugin.json` skills list
- [ ] Create `skills/storybook/SKILL.md` and add it to `plugin.json`
- [ ] Create `.devagent/workspace/tests/ralph-e2e/` layout (plan/expectations/runs)
- [ ] Update `agent-browser` skill screenshot routing to support `ralph-e2e` run hubs
- [ ] Update agent instruction docs (including new `design-agent-instructions.md`) to reference the relevant skills consistently
- [ ] Create follow-up task: set up Storybook for `apps/ralph-monitoring` (Reportory-inspired)
- [ ] Resolve review mechanism + expectations versioning decisions during planning

## Sources
| Reference | Type | Freshness | Access Notes |
| --- | --- | --- | --- |
| `.devagent/core/scripts/sync-plugin-assets.sh` | Internal | 2026-01-18 | Skill/command wiring mechanism |
| `.devagent/plugins/ralph/setup.sh` | Internal | 2026-01-18 | Calls sync script for Ralph |
| `.devagent/plugins/ralph/plugin.json` | Internal | 2026-01-18 | Declares which skills get installed |
| `.devagent/plugins/ralph/skills/agent-browser/SKILL.md` | Internal | 2026-01-18 | Browser automation + screenshot guidance |
| `.devagent/plugins/ralph/AGENTS.md` | Internal | 2026-01-18 | Base agent policy; references agent-browser |
| `.devagent/workspace/reviews/2026-01-14_ralph-browser-testing-gap.md` | Internal | 2026-01-14 | Evidence of skipped browser testing |
| `.devagent/workspace/tasks/completed/DEV-36_review-linear-issue/clarification/2026-01-18_initial-clarification.md` | Internal | 2026-01-18 | Decisions + constraints for DEV-36 |
