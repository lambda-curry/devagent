# Plugin Setup and Update Command Improvements Plan

- Owner: Jake Ruesink
- Last Updated: 2026-01-12
- Status: Draft
- Related Task Hub: `.devagent/workspace/tasks/completed/2026-01-12_plugin-setup-update-command-improvements/`
- Stakeholders: Jake Ruesink (Owner / Decision Maker)
- Notes: Synthesizes `research/2026-01-12_plugin-setup-update-command-research.md` + `clarification/2026-01-12_initial-clarification.md` into execution tasks.

---

## PART 1: PRODUCT CONTEXT

### Summary
Make DevAgent plugin management **configuration-driven** and **self-healing**: only plugins explicitly listed in `.devagent/plugins.json` are installed/updated, and their skills + commands are reliably wired into `.cursor` (canonical entrypoint) with compatibility symlinks into `.codex/skills/`.

### Context & Problem
Current state (per `research/2026-01-12_plugin-setup-update-command-research.md` and `.devagent/core/plugin-system/README.md`):
- Plugins are discovered by scanning `.devagent/plugins/*/plugin.json`, but there is no config-driven enable/disable and no consistent install/update story.
- `update-core.sh` installs/updates core, `.agents/commands/`, and `.codex/skills/` only; it does not install/update plugins.
- Command symlinks exist (`.agents/commands/` → `.cursor/commands/`) but there is no equivalent, systematic wiring for plugin skills and plugin commands.
- Skills have an unclear source-of-truth. Decision: `.cursor` is canonical for skills + commands; `.codex/skills/` is supported via symlinks (and optional `.claude/skills/` documented).

### Objectives & Success Metrics
- **Config-driven behavior:** Only plugins listed in `.devagent/plugins.json` are installed/updated.
- **Reliable wiring:** Configured plugin skills are available under `.cursor/skills/` and reachable via `.codex/skills/` compatibility symlinks.
- **Command availability:** Configured plugin commands are available under `.cursor/commands/` (via the existing `.agents/commands/` symlink pattern).
- **Basic failures are obvious:** Missing plugin, invalid `plugin.json`, invalid config, or symlink errors produce clear messages and stop safely.
- **Backward compatible:** Existing core commands + skills continue working; `ralph` plugin remains usable.

### Users & Insights
- Primary users: DevAgent maintainers and teams dogfooding DevAgent plugins.
- Needs: Explicit control over which plugins are active, and predictable “install/update/verify/remove” flows that an AI agent can execute.

### Solution Principles
- **Opt-in only:** No plugin is installed/updated unless configured.
- **`.cursor` is the canonical integration surface:** Cursor + Codex shop at core; `.cursor/*` should be “what works”.
- **Keep scripts minimal:** Setup/delete scripts do file copies + symlinks only; complex recovery is handled by the AI agent.
- **Prefer relative symlinks:** Match the established command symlink style (`.cursor/commands/*.md` → `../../.agents/commands/*.md`).
- **Fail safe:** On errors, don’t partially install silently; prefer exiting with actionable instructions.

### Scope Definition
- **In Scope (Must-have):**
  - Define `.devagent/plugins.json` format and validation rules.
  - Implement symlink creation for plugin skills (`.cursor/skills/` → `.codex/skills/`) and plugin commands (`.agents/commands/` → `.cursor/commands/`).
  - Define + implement simple plugin `setup.sh` and `delete.sh` patterns (starting with `ralph`).
  - Update docs to reflect `.cursor` as canonical and describe configuration-driven usage.
- **Out of Scope / Future (Should/Could-have):**
  - Dependency resolution, marketplace/discovery, advanced recovery flows.
  - Version pinning / lockfiles (optional future).
  - Auto-migration of *all* core skills from `.codex/skills/` to `.cursor/skills/` (plan as a follow-up phase).

### Functional Narrative

#### Flow 1: Configure plugins (opt-in)
- **Trigger:** User edits `.devagent/plugins.json`.
- **Experience narrative:** Config declares which plugins should be present and wired up.
- **Acceptance criteria:**
  - Config is easy to read and validate.
  - Missing/invalid config yields clear errors and guidance.

#### Flow 2: Install/update configured plugins
- **Trigger:** User runs the update flow (DevAgent “update” command/workflow).
- **Experience narrative:** Core updates, then only configured plugins are installed/updated; wiring is repaired if broken.
- **Acceptance criteria:**
  - Plugins not in config are not installed/updated.
  - Configured plugins are present under `.devagent/plugins/<name>/` with valid `plugin.json`.
  - Plugin commands + skills are available via `.cursor/commands/` and `.codex/skills/` symlinks.

#### Flow 3: Remove a plugin
- **Trigger:** User requests removal (AI agent executes plugin delete script).
- **Experience narrative:** Plugin assets and wiring are removed cleanly.
- **Acceptance criteria:**
  - Commands and skills installed by the plugin are removed.
  - Plugin directory can be removed (explicit removal flow), with verification guidance.

### Technical Notes & Dependencies
- Existing update mechanism: `.devagent/core/scripts/update-core.sh` (git + sparse checkout + rsync).
- Existing command symlink pattern: `.cursor/commands/*.md` symlink to `../../.agents/commands/*.md` (see `.codex/skills/create-slash-command/scripts/create_symlink.py`).
- Plugin manifests: `.devagent/plugins/*/plugin.json` (see `.devagent/plugins/ralph/plugin.json`).

---

## PART 2: IMPLEMENTATION PLAN

### Scope & Assumptions
- Scope focus: Establish a minimal, configuration-driven plugin setup/update flow and standardize wiring for plugin commands + skills.
- Assumptions:
  - `.devagent/plugins.json` is the only source of truth for “enabled plugins”.
  - Plugin artifacts are stored in `.devagent/plugins/<name>/` with `plugin.json` manifests.
  - `.agents/commands/` remains the authored command source; `.cursor/commands/` remains the symlinked integration surface.
  - Plugin skills are installed into `.cursor/skills/` and surfaced into `.codex/skills/` via symlinks (optional `.claude/skills/` is documented only).

### Implementation Tasks (Phase 1 — Must-have MVP)

#### Task 1: Define plugin configuration file + validation rules
- **Objective:** Introduce `.devagent/plugins.json` as the opt-in plugin allowlist with a stable schema and clear errors.
- **Impacted Modules/Files:**
  - `.devagent/plugins.json` (new; committed example file)
  - `.devagent/core/plugin-system/README.md` (document config format and behavior)
- **Dependencies:** None
- **Acceptance Criteria:**
  - Config supports at minimum: `{"plugins":[{"name":"ralph"}]}` and rejects invalid shapes with actionable messages.
  - Documented rules include: name format, duplication handling, and default enabled behavior.
- **Validation Plan:** Manual validation by deliberately breaking config (missing file, malformed JSON, duplicate names) and confirming errors are readable.

#### Task 2: Create shared “sync plugin assets” logic (commands + skills)
- **Objective:** Provide a single, reusable implementation for wiring a plugin into `.cursor` + `.codex` based on its `plugin.json`.
- **Impacted Modules/Files:**
  - `.devagent/core/scripts/` (new script(s), e.g. `sync-plugin-assets.sh` and/or `plugin-lib.sh`)
  - `.devagent/core/plugin-system/README.md` (document what the script does + expected directory layout)
- **Dependencies:** Task 1
- **Acceptance Criteria:**
  - Given a valid plugin folder + manifest, the sync logic:
    - Copies plugin commands into `.agents/commands/` (or creates symlinks if that approach is chosen) and creates `.cursor/commands/*.md` symlinks.
    - Copies plugin skills into `.cursor/skills/<skill>/` and creates `.codex/skills/<skill>` symlink(s).
  - Handles basic errors: missing referenced files in manifest, invalid manifest, symlink creation failure.
- **Validation Plan:** Use the existing `ralph` plugin as the first real-world test fixture.

#### Task 3: Implement config-driven plugin install/update orchestration
- **Objective:** Only install/update plugins listed in `.devagent/plugins.json`, and repair wiring on each run.
- **Impacted Modules/Files:**
  - Option A (preferred for separation): `.devagent/core/scripts/update-plugins.sh` (new; sparse-checkout only configured `.devagent/plugins/<name>/`)
  - Option B (single entrypoint): `.devagent/core/scripts/update-core.sh` (extend to also sparse-checkout configured plugins)
  - `.agents/commands/update-devagent.md` and `.devagent/core/workflows/update-devagent.md` (document the new behavior and steps)
- **Dependencies:** Task 1, Task 2
- **Acceptance Criteria:**
  - Running the update flow installs/updates core, then installs/updates only configured plugins.
  - Plugin wiring is re-applied after updates (idempotent).
  - Plugins not listed in config are left untouched (no installs, no updates).
- **Validation Plan:** Add a “golden path” manual runbook in the plan’s testing notes and execute it in a clean clone.

#### Task 4: Standardize per-plugin `setup.sh` and `delete.sh` (start with `ralph`)
- **Objective:** Make plugin lifecycle actions discoverable and consistent for AI agents.
- **Impacted Modules/Files:**
  - `.devagent/plugins/ralph/setup.sh` (new)
  - `.devagent/plugins/ralph/delete.sh` (new)
  - `.devagent/plugins/ralph/plugin.json` (optional: document scripts via convention or README entry)
  - `.devagent/core/plugin-system/README.md` (document required/optional plugin scripts)
- **Dependencies:** Task 2
- **Acceptance Criteria:**
  - `setup.sh` only copies files + creates symlinks; no dependency installation.
  - `delete.sh` removes plugin-installed commands/skills/symlinks and can remove plugin directory in an explicit removal flow.
  - Scripts are safe to rerun (idempotent where possible).
- **Validation Plan:** Run `setup.sh` twice; run `delete.sh`; verify removal; rerun `setup.sh`.

#### Task 5: Documentation + examples
- **Objective:** Make the system usable without tribal knowledge.
- **Impacted Modules/Files:**
  - `.devagent/core/plugin-system/README.md` (authoritative plugin management doc)
  - `.devagent/core/README.md` and/or `.devagent/DEVELOPER-GUIDE.md` (how plugin setup/update fits the standard DevAgent lifecycle)
  - `.agents/commands/README.md` (clarify that plugin commands should also be symlinked into `.cursor/commands/`)
- **Dependencies:** Tasks 1–4
- **Acceptance Criteria:**
  - Docs cover: config format, install/update/remove flows, symlink topology, and troubleshooting.
  - Includes a worked example for `ralph` using the real file paths in this repo.
- **Validation Plan:** Follow docs in a fresh clone and confirm no missing steps.

### Implementation Tasks (Phase 2 — Should-have follow-ups)

#### Task 6: Add a “verify plugins” command/workflow (self-check + repair hints)
- **Objective:** Provide a fast validation tool for AI agents and humans to confirm plugin state matches config.
- **Impacted Modules/Files:**
  - `.devagent/core/workflows/` (new workflow, e.g. `verify-plugins.md`)
  - `.agents/commands/` + `.cursor/commands/` symlink (new command file)
  - `.devagent/core/scripts/` (optional: reusable validator script)
- **Dependencies:** Phase 1 complete
- **Acceptance Criteria:**
  - Reports: configured plugins, installed plugin dirs, manifest validity, and required symlinks present.
  - Produces actionable remediation steps when mismatched.
- **Validation Plan:** Deliberately break symlinks / delete a skill folder and confirm the report catches it.

#### Task 7: Migrate core skills to `.cursor/skills/` as canonical (optional but aligns with decision)
- **Objective:** Fully align the repository with the “`.cursor` is source of truth” decision for skills.
- **Impacted Modules/Files:**
  - `.devagent/core/scripts/update-core.sh` (update skill install location and create compatibility symlinks)
  - `.devagent/core/workflows/update-devagent.md` (update referenced directories)
  - `.devagent/core/plugin-system/README.md` and any workflow docs referencing `.codex/skills/`
- **Dependencies:** Phase 1 complete; requires coordination to avoid breaking downstream tooling.
- **Acceptance Criteria:**
  - Core skills live under `.cursor/skills/` and `.codex/skills/` becomes compatibility symlinks (or a documented compat layer).
  - No workflow references are left pointing at outdated skill roots.
- **Validation Plan:** Run a full “update devagent” and confirm skills remain discoverable to Codex.

#### Task 8: Add optional support for `.claude/skills/` via documentation and/or config
- **Objective:** Support users who want Anthropic-compatible skill placement without making it mandatory.
- **Impacted Modules/Files:**
  - `.devagent/core/plugin-system/README.md` (document optional symlink recipe)
  - `.devagent/core/README.md` (optional mention)
- **Dependencies:** Phase 1 complete
- **Acceptance Criteria:**
  - Docs show how to create `.claude/skills/` symlinks pointing at `.cursor/skills/` safely.
- **Validation Plan:** Create the symlink in a test repo and ensure nothing breaks when it’s absent.

---

## Risks & Open Questions

| Item | Type (Risk / Question) | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Collision policy for plugin command/skill names | Risk | Jake Ruesink | Start with “fail on collision with clear error”; add prefixing/aliasing only if needed | Phase 1 |
| Where plugin “installed state” should live (registry vs derived) | Question | Jake Ruesink | Prefer derived state from config + filesystem; defer lock/registry file to a later phase | Phase 1 |
| Whether updates should overwrite locally modified plugin files | Risk | Jake Ruesink | Document “upstream-managed” expectation; consider `--keep-backup` behavior for plugins similar to core | Phase 1 |
| Full migration of core skills to `.cursor/skills/` | Risk | Jake Ruesink | Keep as Phase 2; ship plugin wiring first; update docs incrementally | Phase 2 |

---

## Progress Tracking
Refer to `.devagent/workspace/tasks/completed/2026-01-12_plugin-setup-update-command-improvements/AGENTS.md` for checklist/progress logging during implementation.

---

## Appendices & References
- Task hub: `.devagent/workspace/tasks/completed/2026-01-12_plugin-setup-update-command-improvements/AGENTS.md`
- Clarification packet: `.devagent/workspace/tasks/completed/2026-01-12_plugin-setup-update-command-improvements/clarification/2026-01-12_initial-clarification.md`
- Research packet: `.devagent/workspace/tasks/completed/2026-01-12_plugin-setup-update-command-improvements/research/2026-01-12_plugin-setup-update-command-research.md`
- Plugin system docs: `.devagent/core/plugin-system/README.md`
- Example plugin manifest: `.devagent/plugins/ralph/plugin.json`
- Existing command symlink reference: `.codex/skills/create-slash-command/scripts/create_symlink.py`

