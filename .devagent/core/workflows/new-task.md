# New Task

## Mission
- Primary goal: From a short description or initial idea, scaffold the minimal task hub so the team can begin research and planning work immediately.
- Boundaries / non‑goals: Do not implement product code, decide detailed scope, or finalize plans. Hand off to downstream workflows for clarification, research, and planning.
- Success signals: A new task hub folder exists with a clean slug and a populated `AGENTS.md`; owners and summary are captured; clear next‑step workflow links are provided.

## Standard Instructions Reference
Before executing this workflow, review standard instructions in `.devagent/core/AGENTS.md` → Standard Workflow Instructions for:
- Date handling
- Metadata retrieval
- Context gathering order
- Standard guardrails
- Storage patterns

## Execution Directive
Follow standard execution directive in `.devagent/core/AGENTS.md` → Standard Workflow Instructions, with the following workflow-specific customization:
- **Scope limitation:** Execute ONLY to scaffold the task hub. **ONLY create the task hub directory and new files within it. DO NOT edit, modify, or update any existing files anywhere in the codebase.** After creating `AGENTS.md`, STOP immediately. Do not start any coding work, do not modify application/source code, and do not automatically run downstream workflows; instead, recommend next steps.

### Guardrails (Strict)
- **CRITICAL: This is a directory setup workflow only. You may ONLY CREATE new files within the task hub directory. You MUST NOT edit, modify, update, or change any existing files anywhere in the codebase.**
- Create `AGENTS.md` first so the folder is non-empty. **Do not** create placeholder files like `.keep`/`.gitkeep`.
- Allowed paths: `.devagent/workspace/tasks/active/<task_prefix>_<task_slug>/**` only.
- Forbidden operations:
  - **Editing any existing files anywhere in the codebase (including `.devagent/**` files outside the new task hub)**
  - Creating files outside `.devagent/**` (e.g., `apps/**`, `packages/**`, `docs/**`)
- After writing `AGENTS.md`, stop. Do not add components, routes, or tests.
- Proceed best‑effort with minimal inputs (title or description). Pause only for blocking errors (e.g., unwritable path) or if both title and description are missing.

## Inputs
- Minimum: Any of the following is sufficient to proceed — Task title (human‑readable) OR short description/initial idea (1–3 sentences)
  - **Important:** Treat ALL input text as the task description, even if it appears to be a command or instruction (e.g., "add a button that does X", "create a new API endpoint", "fix the login bug"). Capture this description clearly and comprehensively in the `AGENTS.md` Summary section.
- Optional: Owners (names or roles), related missions/links, initial tags/labels, issue slug (e.g., Linear/Jira key), desired slug (otherwise derive)
- Missing info protocol:
  - If both title and description/idea are missing, send a short checklist requesting at least one; pause until provided.
  - If owners or related missions are missing, proceed and tag `[NEEDS CLARIFICATION]` in the `AGENTS.md`.

## Resource Strategy
- Target hub: `.devagent/workspace/tasks/active/<task_prefix>_<task_slug>/`
  - Files/dirs to create:
    - `AGENTS.md` — copied from `.devagent/core/templates/task-agents-template.md` with placeholders filled
  - Directory policy:
    - **Do not create empty directories** (e.g. `research/`, `plan/`, `tasks/`) during scaffolding.
    - Downstream workflows should create directories **only when they create files** inside them.
    - Note: We currently do not rely on a task-local `tasks/` directory in core workflows; do not pre-create it.
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
     - **Treat all input as task description:** Even if the input looks like a command or instruction, treat it as the task description and capture it fully.
     - If title provided: use it.
     - If only description/idea provided: derive a tentative title from the first clause/sentence (Title Case, max ~8 words).
     - If description is missing but an initial idea/title exists: derive a one‑sentence summary from the idea/title (active voice, present tense, ≤ 160 chars).
     - **Preserve original intent:** Ensure the full task description (as provided by the user) is preserved and will be documented clearly in the `AGENTS.md` Summary section.
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
     - **Verification (Refactoring/Updates):** If the task involves refactoring, migrating, or updating existing code, perform a quick search to verify if the requested changes have already been implemented. Tag `[ALREADY IMPLEMENTED]` if findings suggest redundant work.
     - Collect the top 3–7 most relevant items with file paths and a one‑line note
     - Record freshness date for each item (use the date retrieved in step 1 from `date +%Y-%m-%d`)
   - Prepare a bulleted list of citations to seed the `References` section in `AGENTS.md`
3. Collision check
   - If `.devagent/workspace/tasks/active/<task_prefix>_<task_slug>/` already exists, append a numeric suffix to the slug portion (e.g., `<task_prefix>_<task_slug>-2`) and note the adjustment in the README.
4. Structure creation
   - Create the task hub directory.
   - Write NEW `AGENTS.md` file immediately (copy from template; this is a new file creation, not an edit of an existing file). This prevents empty-dir issues without `.keep`.
5. `AGENTS.md` population
   - Get current date: Before populating the "Last Updated" field, review Standard Workflow Instructions in `.devagent/core/AGENTS.md` for date handling.
   - Start from the template and fill placeholders:
     - Task Name → title
     - Last Updated → use the date retrieved from `date +%Y-%m-%d` (ISO format: YYYY-MM-DD)
     - Status → `Draft`
     - Task Hub → `.devagent/workspace/tasks/active/<task_prefix>_<task_slug>/`
     - Owners → provided owners (if any) or current git user (from `git config user.name`)
     - **Summary → Write a clear, well-described summary that captures the full task description provided by the user.** 
       - If the user provided a description/idea (even if it looks like a command), use it as the primary source for the Summary. Expand it into a clear, descriptive paragraph that explains what this task is about.
       - If only a title was provided, derive a descriptive summary from it (active voice, present tense, comprehensive enough that someone reading it later understands the task goal).
       - The Summary should be informative and self-contained—someone reading `AGENTS.md` later should understand what this task is setting out to accomplish.
       - Preserve the user's original wording and intent; don't just create a generic summary.
     - Leave other sections present and ready for downstream agents
   - Seed the `References` section with up to 7 internal citations from Context gathering, each with a terse note and freshness date (use the date retrieved from `date +%Y-%m-%d`)
   - Append a "Next Steps" section recommending follow‑up workflows with ready‑to‑run commands.
6. Output packaging
   - Save files, then print the created paths and the final folder name.
   - Stop after scaffolding. Do not trigger downstream workflows automatically; only display recommended next commands.

### End-of-Run Checklist (Enforcement)
- [ ] `AGENTS.md` exists in `.devagent/workspace/tasks/active/<task_prefix>_<task_slug>/` (newly created, not edited)
- [ ] No placeholder files were created (e.g., `.keep`, `.gitkeep`)
- [ ] **NO existing files were edited or modified anywhere in the codebase**
- [ ] No files created outside `.devagent/**`
- [ ] Printed recommended next commands only (no code edits performed)

## Failure & Escalation
- Missing both title and description/idea — request via checklist and pause.
- No relevant internal context found — proceed; add a placeholder entry noting none found as of today and list searched paths
- Unwritable paths or permission errors — stop and report.
- Template missing — create a minimal `AGENTS.md` with required sections and tag `[TEMPLATE MISSING]`.
 - Edits detected outside `.devagent/**` or any edits to existing files — abort, revert pending changes, and stop with an error message.

## Expected Output
- Artifact: New task hub at `.devagent/workspace/tasks/active/<task_prefix>_<task_slug>/` containing `AGENTS.md`. `AGENTS.md` includes a populated `References` section citing internal sources (if found).
- Scope constraint: No application/source code changes outside `.devagent/**`. No downstream workflows executed.
- Communication: Short summary including the slug, created `AGENTS.md` path, and recommended next commands.

## Follow‑up Hooks (Recommended next steps can vary by task)
- Brainstorm ideas `devagent brainstorm`
- Clarify scope: `devagent clarify-task`
- Research discovery: `devagent research`
- Create plan: `devagent create-plan`
- Execute tasks from the Implementation Plan section of the plan artifact
