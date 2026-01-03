# New Task

## Mission
- Primary goal: From a short description or initial idea, scaffold the minimal task hub so the team can begin research and planning work immediately.
- Boundaries / non‑goals: Do not implement product code, decide detailed scope, or finalize plans. Hand off to downstream workflows for clarification, research, and planning.
- Success signals: A new task hub folder exists with a clean slug, populated `AGENTS.md`, and standard subfolders; owners and summary are captured; clear next‑step workflow links are provided.

## Standard Instructions Reference
Before executing this workflow, review standard instructions in `.devagent/core/AGENTS.md` → Standard Workflow Instructions for:
- Date handling
- Metadata retrieval
- Context gathering order
- Standard guardrails
- Storage patterns

## Execution Directive
Follow standard execution directive in `.devagent/core/AGENTS.md` → Standard Workflow Instructions, with the following workflow-specific customization:
- **Scope limitation:** Execute ONLY to scaffold the task hub. Create the directory structure and `AGENTS.md` and then STOP. Do not start any coding work, do not modify application/source code, and do not automatically run downstream workflows; instead, recommend next steps.

### Guardrails (Strict)
- Create `AGENTS.md` first so the folder is non-empty. **Do not** create placeholder files like `.keep`/`.gitkeep`.
- Allowed paths: `.devagent/workspace/tasks/active/<task_prefix>_<task_slug>/**` only.
- Forbidden edits: anything outside `.devagent/**` (e.g., `apps/**`, `packages/**`, `docs/**`).
- After writing `AGENTS.md`, stop. Do not add components, routes, or tests.
Proceed best‑effort with minimal inputs (title or description). Pause only for blocking errors (e.g., unwritable path) or if both title and description are missing.

## Inputs
- Minimum: Any of the following is sufficient to proceed — Task title (human‑readable) OR short description/initial idea (1–3 sentences)
- Optional: Owners (names or roles), related missions/links, initial tags/labels, issue slug (e.g., Linear/Jira key), desired slug (otherwise derive)
- Missing info protocol:
  - If both title and description/idea are missing, send a short checklist requesting at least one; pause until provided.
  - If owners or related missions are missing, proceed and tag `[NEEDS CLARIFICATION]` in the `AGENTS.md`.

## Resource Strategy
- Target hub: `.devagent/workspace/tasks/active/<task_prefix>_<task_slug>/`
  - Files/dirs to create:
    - `AGENTS.md` — copied from `.devagent/core/templates/task-agents-template.md` with placeholders filled
    - `research/` — empty folder (optionally seed an initial packet later via `devagent research`)
    - `plan/` — empty folder (plans created later via `devagent create-plan`)
    - `tasks/` — empty folder (reserved for tracking task execution status during implementation)
- Templates:
  - `.devagent/core/templates/task-agents-template.md`
  - Optionally referenced later: `research-packet-template.md`, `spec-document-template.md`, `task-prompt-template.md`

## Knowledge Sources
- Internal: Task hub template; `.devagent/workspace/product/` (e.g., `mission.md`, `roadmap.md`, `guiding-questions.md`); `.devagent/workspace/memory/` (e.g., `constitution.md`, `tech-stack.md`, decision journals)
- Retrieval etiquette: Cite file paths with anchors when available and include freshness as an ISO date; keep summaries to 1–2 lines each
- External: None by default; only use links explicitly provided in inputs

## Workflow
1. Kickoff
   - Establish working title and summary:
     - If title provided: use it.
     - If only description/idea provided: derive a tentative title from the first clause/sentence (Title Case, max ~8 words) and mark `[DERIVED]` in metadata.
     - If description is missing but an initial idea/title exists: derive a one‑sentence summary from the idea/title (active voice, present tense, ≤ 160 chars) and mark `[DERIVED]`.
   - Get current date: Before determining `task_prefix`, review Standard Workflow Instructions in `.devagent/core/AGENTS.md` for date handling.
   - Determine `task_prefix`:
     - If an issue slug is provided (e.g., Linear/Jira), use it as‑is (trim spaces).
     - Otherwise, use the date retrieved from `date +%Y-%m-%d` in ISO format (YYYY-MM-DD).
   - Derive `task_slug`:
     - Prefer provided slug if valid (lowercase, a‑z0‑9‑, no leading/trailing dashes, collapse repeats).
     - Otherwise derive from title (or derived title) by lowercasing, replacing non‑alphanumerics with dashes, and trimming consecutive/edge dashes.
   - Determine owner:
     - If owners are provided in inputs: use them.
     - Otherwise, review Standard Workflow Instructions in `.devagent/core/AGENTS.md` for metadata retrieval.
2. Context gathering
   - Scan internal sources for related context using the title, derived slug, and key terms from the summary:
     - Search `.devagent/workspace/product/` and `.devagent/workspace/memory/` for matching phrases and adjacent sections
     - Collect the top 3–7 most relevant items with file paths and a one‑line note
     - Record freshness date for each item (use the date retrieved in step 1 from `date +%Y-%m-%d`)
   - Prepare a bulleted list of citations to seed the `References` section in `AGENTS.md`
3. Collision check
   - If `.devagent/workspace/tasks/active/<task_prefix>_<task_slug>/` already exists, append a numeric suffix to the slug portion (e.g., `<task_prefix>_<task_slug>-2`) and note the adjustment in the README.
4. Structure creation
   - Create the task hub directory with subfolders: `research/`, `plan/`, `tasks/`.
   - Write `AGENTS.md` immediately (prevents empty-dir issues without `.keep`).
5. `AGENTS.md` population
   - Get current date: Before populating the "Last Updated" field, review Standard Workflow Instructions in `.devagent/core/AGENTS.md` for date handling.
   - Start from the template and fill placeholders:
     - Task Name → title (append " [DERIVED]" if inferred from description/idea)
     - Last Updated → use the date retrieved from `date +%Y-%m-%d` (ISO format: YYYY-MM-DD)
     - Status → `Draft`
     - Task Hub → `.devagent/workspace/tasks/active/<task_prefix>_<task_slug>/`
     - Owners → provided owners (if any) or current git user (from `git config user.name`)
     - Summary → provided description/idea or derived one‑sentence summary (append " [DERIVED]")
     - Leave other sections present and ready for downstream agents
   - Seed the `References` section with up to 7 internal citations from Context gathering, each with a terse note and freshness date (use the date retrieved from `date +%Y-%m-%d`)
   - Append a "Next Steps" section recommending follow‑up workflows with ready‑to‑run commands.
6. Output packaging
   - Save files, then print the created paths and the final folder name.
   - Stop after scaffolding. Do not trigger downstream workflows automatically; only display recommended next commands.

### End-of-Run Checklist (Enforcement)
- [ ] `AGENTS.md` exists in `.devagent/workspace/tasks/active/<task_prefix>_<task_slug>/`
- [ ] No placeholder files were created (e.g., `.keep`, `.gitkeep`)
- [ ] No changes outside `.devagent/**`
- [ ] Printed recommended next commands only (no code edits performed)

## Failure & Escalation
- Missing both title and description/idea — request via checklist and pause.
- No relevant internal context found — proceed; add a placeholder entry noting none found as of today and list searched paths
- Unwritable paths or permission errors — stop and report.
- Template missing — create a minimal `AGENTS.md` with required sections and tag `[TEMPLATE MISSING]`.
 - Edits detected outside `.devagent/**` — abort, revert pending changes, and stop with an error message.

## Expected Output
- Artifact: New task hub at `.devagent/workspace/tasks/active/<task_prefix>_<task_slug>/` containing `AGENTS.md`, `research/`, `plan/`, and `tasks/`. `AGENTS.md` includes a populated `References` section citing internal sources (if found).
- Scope constraint: No application/source code changes outside `.devagent/**`. No downstream workflows executed.
- Communication: Short summary including the slug, created `AGENTS.md` path, and recommended next commands.

## Follow‑up Hooks (Recommended next steps can vary by task)
- Brainstorm ideas `devagent brainstorm`
- Clarify scope: `devagent clarify-task`
- Research discovery: `devagent research`
- Create plan: `devagent create-plan`
- Execute tasks from the Implementation Plan section of the plan artifact
