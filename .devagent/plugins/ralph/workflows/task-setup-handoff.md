# Task Setup Handoff (Ralph Plugin)

## Mission
Create a **task setup handoff packet** for a Ralph/Beads epic so a new agent can start execution without re-discovering:
- plan + research context
- Beads epic/tasks + routing labels + dependencies
- Ralph config + branch requirements
- known gotchas + verification commands

This workflow is **documentation-only**. It does not execute the epic.

## Inputs
- Required:
  - Task hub path (e.g. `.devagent/workspace/tasks/active/YYYY-MM-DD_task-slug/`)
  - Epic ID (e.g. `devagent-300b`)
- Optional:
  - Plan path (if not in task hub)
  - Research path (if not obvious)
  - Ralph config path (default: `.devagent/plugins/ralph/tools/config.json`)

## References (Canonical)
- Beads CLI reference: `.devagent/plugins/ralph/skills/beads-integration/SKILL.md`
- Plan→Beads mapping rules: `.devagent/plugins/ralph/skills/plan-to-beads-conversion/SKILL.md`
- Setup plan→Beads+config workflow (for commands): `.devagent/plugins/ralph/workflows/setup-ralph-loop.md`
- Core handoff prompt workflow (for prompt shape, optional): `.devagent/core/workflows/handoff.md`

## Workflow Steps

### Step 1: Pull the minimal context set (don’t rediscover)
- Task hub:
  - `AGENTS.md` (progress + checklist + references)
  - `plan/*.md` (canonical implementation steps + acceptance criteria)
  - `research/*.md` (if present) OR `.devagent/workspace/research/<...>.md` (when research is centralized)
- Ralph config:
  - `.devagent/plugins/ralph/tools/config.json` (git branches + agent routing label keys)
- Beads:
  - Epic + child tasks: `bd show <EPIC_ID> --json`, `bd list --parent <EPIC_ID> --json`
  - Dependency graph: `bd dep tree <EPIC_ID>`

### Step 2: Capture known “setup gotchas” explicitly
Always write these down in the packet (even if “obvious”):
- **Active definition**: what exactly counts as “active” (Beads status? runtime state? both?)
- **Writer vs viewer contract**: log writer path + filename/sanitization must match viewer expectations
- **Branch/regression mismatch**: confirm whether a prior fix exists vs a true missing feature
- **Daemon staleness**: for write operations, default to direct mode: `BD_NO_DAEMON=1` or `bd ... --no-daemon`
- **Routing**: direct epic children must have exactly **one** routing label that exists in `.devagent/plugins/ralph/tools/config.json` → `agents` keys
- **Parent linkage** (safe by default): set parent explicitly for direct epic children so `bd ready --parent` works reliably
- **CLI drift**: if any `bd` flag looks suspicious, confirm with `bd create --help` / `bd update --help` (don’t guess)

### Step 3: Add a short verification checklist (copy/paste)
Include commands + what “good” looks like.

**Beads sanity:**
```bash
which bd
bd info --json
bd show <EPIC_ID> --json
bd list --parent <EPIC_ID> --json
bd dep tree <EPIC_ID>
```

**Routing labels (must be exactly one per direct epic child):**
```bash
jq -r '.agents | keys[]' .devagent/plugins/ralph/tools/config.json
bd label list <EPIC_ID>.1
bd label list <EPIC_ID>.2
bd label list <EPIC_ID>.3
# ... direct epic children only
```

**Parent + ready list (must not be silently empty):**
```bash
# Note: bd ready defaults to --limit 10
bd ready --parent <EPIC_ID> --limit 200 --json
```
Expected: returns **at least** the first unblocked task(s) (usually `.1`).

**Dependencies (spot-check):**
```bash
bd show <EPIC_ID>.4 --json
bd show <EPIC_ID>.5 --json
```
Expected: `.4` depends on earlier tasks as described in the plan; `.5` depends on `.1–.4` (or equivalent).

**Ralph git config (safe by default):**
```bash
jq '.git' .devagent/plugins/ralph/tools/config.json
WORKING_BRANCH="$(jq -r '.git.working_branch' .devagent/plugins/ralph/tools/config.json)"
git rev-parse --verify "$WORKING_BRANCH" >/dev/null
[ "$(git branch --show-current)" = "$WORKING_BRANCH" ]
```
Expected: working branch exists locally and matches current checkout.

### Step 4: Produce the handoff packet (template)
Save the packet as a markdown artifact adjacent to the task hub (recommended location):
- `.devagent/workspace/tasks/active/<task>/handoff/YYYY-MM-DD_task-setup-handoff.md`

Use this template (fill in every section; remove optional sections only if truly empty):

```md
**Goal / Intent**
<what the epic is trying to fix, in one paragraph>

**Current State**
- What’s set up already (plan/research done, epic/tasks created, config ready)
- What has NOT been executed yet (explicitly)

**Critical Issues / Known Gotchas**
1. Active definition: <current ambiguity + what to verify>
2. Writer vs viewer contract: <path + naming + env vars involved>
3. Branch/regression mismatch: <what to check first to avoid reinventing>

**Plan**
- <path to plan>
- Key tasks (1–4) summary

**Research**
- <path to research>
- Verification checklist summary (what to validate first)

**Beads Epic / Tasks**
- Epic ID: <EPIC_ID>
- Task graph:
  - .1 → unblocks .2, .3
  - .4 depends on .1, .2, .3
  - .5 depends on .1–.4
- Routing:
  - Valid labels are keys in `.devagent/plugins/ralph/tools/config.json` → `agents`
  - Direct epic children must have exactly one routing label
- Parent linkage:
  - Ensure each direct child has `parent=<EPIC_ID>` so `bd ready --parent <EPIC_ID>` works

**Ralph Config**
- Config path: `.devagent/plugins/ralph/tools/config.json`
- base_branch: <value>
- working_branch: <value> (must exist + match current checkout)

**Verification Checklist**
- labels valid + exactly one per direct epic child
- deps wired
- `bd ready --parent <EPIC_ID> --limit 200` returns at least task .1
- working_branch exists and matches current checkout

**Example Runbook (Copy/Paste)**
<commands to validate and then continue with start-ralph-execution>
```

## Concrete Example: “Fix Beads Live Log Viewing”

### Context
- Task hub: `.devagent/workspace/tasks/active/2026-01-20_fix-beads-live-log-viewing/AGENTS.md`
- Plan: `.devagent/workspace/tasks/active/2026-01-20_fix-beads-live-log-viewing/plan/2026-01-20_beads-live-log-viewing-plan.md`
- Research: `.devagent/workspace/research/2026-01-20_beads-live-log-viewing-file-not-found.md`

### Intent Summary (what’s broken)
Ralph Monitoring live log viewing consistently shows “can’t find the log files”. The fix focus is **only stream logs for active tasks**; inactive tasks should not surface noisy errors.

### Epic / Graph
- Epic ID (expected): `devagent-300b`
- Task graph (expected):
  - `.1` → unblocks `.2`, `.3`
  - `.4` depends on `.1`, `.2`, `.3`
  - `.5` depends on `.1–.4`

### Setup Verification (copy/paste)
```bash
# Beads
bd info --json
bd show devagent-300b --json
bd list --parent devagent-300b --json
bd dep tree devagent-300b
bd ready --parent devagent-300b --limit 200 --json

# Routing labels
jq -r '.agents | keys[]' .devagent/plugins/ralph/tools/config.json
bd label list devagent-300b.1
bd label list devagent-300b.2
bd label list devagent-300b.3
bd label list devagent-300b.4
bd label list devagent-300b.5

# Ralph config: working branch must exist and match checkout
jq '.git' .devagent/plugins/ralph/tools/config.json
WORKING_BRANCH="$(jq -r '.git.working_branch' .devagent/plugins/ralph/tools/config.json)"
git rev-parse --verify "$WORKING_BRANCH" >/dev/null
[ "$(git branch --show-current)" = "$WORKING_BRANCH" ]
```

If `bd show devagent-300b` returns “not found”, treat it as a **setup blocker**:
- verify you’re in the correct repo
- verify Beads is pointing at the expected DB (`bd info --json`)
- if needed, rerun the plan→Beads setup workflow: `.devagent/plugins/ralph/workflows/setup-ralph-loop.md`

### Continuation
After the packet is written and verification passes, proceed with:
- `.devagent/plugins/ralph/workflows/start-ralph-execution.md` using epic `devagent-300b`

