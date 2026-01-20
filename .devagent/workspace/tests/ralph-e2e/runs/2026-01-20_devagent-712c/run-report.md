# Ralph E2E Run Report — `devagent-712c` (2026-01-20)

## Run header (source of truth is Beads epic comment)

- **Beads epic**: `devagent-712c`
- **Run folder**: `.devagent/workspace/tests/ralph-e2e/runs/2026-01-20_devagent-712c/`
- **Expectations Version**: `v2026-01-19`
- **Expectations Commit**: `77b44bbf61a14364b3b7e8cb92dc9e9c4483191b`
- **PR**: [PR #58](https://github.com/lambda-curry/devagent/pull/58)
- **Result**: _(placeholder)_ `PASS|FAIL`

## Evidence index

- **Screenshots**: `.devagent/workspace/tests/ralph-e2e/runs/2026-01-20_devagent-712c/screenshots/`

## Notes (placeholder)

- This report is a narrative artifact; authoritative pass/fail lives in Beads comments per `expectations.md`.

## Setup friction points (Plan → Beads → Ralph config)

These are issues encountered during `setup-ralph-loop.md` for this run, with concrete improvements we can bake into the workflow/prompt and our run-folder process.

### 1) `bd show --json` shape + dependency fields are inconsistent

- **Observed**: `bd show <id> --json` sometimes returns an array, and dependency info may be present under `dependencies` with `dependency_type` while fields like `depends_on` remain `null`.
- **Why it matters**: verification snippets break easily; it’s hard to reliably assert “this task is blocked by X”.
- **Improve the prompt/workflow**:
  - Standardize on a “safe parse” pattern in docs/snippets: always treat `bd show --json` as an array and use `.[0]`.
  - When verifying deps, use `.[0].dependencies | map(select(.dependency_type == "blocks") | .id)` rather than `depends_on`.
- **Improve the run-folder process**:
  - Add a short “verification commands we ran” section (copy/paste-ready) in this run report so future runs reuse the stable jq patterns.

### 2) Epic existence check ambiguity (exit code vs stdout)

- **Observed**: an existence check via exit code alone can be misleading; the only reliable signal is the actual message content (e.g., “no issue found matching …”).
- **Why it matters**: can cause accidental ID reuse or false confidence that an epic exists/doesn’t exist.
- **Improve the prompt/workflow**:
  - Replace “check $? only” with: capture output, fail if it contains `no issue found`, otherwise proceed.
  - Prefer an explicit “create unique epic id” rule (see item 6) so existence checks become a safety net, not a core mechanism.
- **Improve the run-folder process**:
  - Record the final epic id derivation in the report (title used + hash used) so collisions are diagnosable.

### 3) Beads JSONL/export hash mismatch warning during setup

- **Observed**: Beads printed `JSONL file hash mismatch… Clearing export_hashes…`.
- **Why it matters**: looks like data corruption to humans; could spook reviewers or cause “did setup succeed?” confusion.
- **Improve the prompt/workflow**:
  - Add a note: this warning is non-fatal for setup; follow it with a quick validation checklist (`bd show <epic>`, `bd ready --parent …`, `bd dep tree …`).
- **Improve the run-folder process**:
  - If this warning appears, capture it verbatim in the run report under a “Warnings observed” section.

### 4) Canonical payload example drifted from expectations (missing PM task)

- **Observed**: older canonical `beads-payload.json` examples did not include the mandatory `project-manager` setup task required by `expectations.md`.
- **Why it matters**: encourages incorrect task structures; runs become non-comparable.
- **Improve the prompt/workflow**:
  - Make `.0` PM/Coordinator task explicitly required in the setup workflow (and in any example payload), with its acceptance criteria aligned to Stage 1 expectations.
- **Improve the run-folder process**:
  - Keep a short “Stage 1 checklist” section here that confirms required roles/tasks exist (PM/design/engineering/QA).

### 5) “READY” labeling confusion in `bd dep tree`

- **Observed**: `bd dep tree` can show `[READY]` in contexts that are confusing when tasks are obviously blocked by open deps.
- **Why it matters**: people chase the wrong signal; wastes time diagnosing “why is Ralph picking X?”
- **Improve the prompt/workflow**:
  - Explicitly state: `bd ready --parent <epic> --limit 200` is the source of truth for schedulable tasks; `bd dep tree` is for structure only.
- **Improve the run-folder process**:
  - In the report, always record the output of `bd ready --parent <epic> --limit 200` at kickoff time (list of ready tasks).

### 6) “New epic” needs an explicit uniqueness rule (hash collisions)

- **Observed**: hashing a static plan title is deterministic, so repeated runs can collide.
- **Why it matters**: the “new epic per run” requirement fails silently or forces manual cleanup.
- **Improve the prompt/workflow**:
  - Require the epic title to include a run identifier before hashing (e.g., `Ralph E2E Run YYYY-MM-DD — …`), and document that convention.
- **Improve the run-folder process**:
  - Store the run identifier convention in `runs/README.md` and keep this run report’s header aligned with it.

