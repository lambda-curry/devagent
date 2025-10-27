# New Feature

## Mission
- Primary goal: From a short description or initial idea, scaffold the minimal feature hub so the team can begin research/spec work immediately.
- Boundaries / non‑goals: Do not implement product code, decide detailed scope, or finalize specs. Hand off to downstream workflows for clarification, research, and planning.
- Success signals: A new feature hub folder exists with a clean slug, populated `AGENTS.md`, and standard subfolders; owners and summary are captured; clear next‑step workflow links are provided.

## Execution Directive
When invoked with `devagent new-feature`, **EXECUTE IMMEDIATELY**. Do not summarize or seek approval—perform the scaffolding. Proceed best‑effort with minimal inputs (title or description). Pause only for blocking errors (e.g., unwritable path) or if both title and description are missing.

## Inputs
- Minimum: Any of the following is sufficient to proceed — Feature title (human‑readable) OR short description/initial idea (1–3 sentences)
- Optional: Owners (names or roles), related missions/links, initial tags/labels, desired slug (otherwise derive)
- Missing info protocol:
  - If both title and description/idea are missing, send a short checklist requesting at least one; pause until provided.
  - If owners or related missions are missing, proceed and tag `[NEEDS CLARIFICATION]` in the `AGENTS.md`.

## Resource Strategy
- Target hub: `.devagent/workspace/features/<feature_slug>/`
  - Files/dirs to create:
    - `AGENTS.md` — copied from `.devagent/core/templates/feature-agents-template.md` with placeholders filled
    - `research/` — empty folder (optionally seed an initial packet later via `devagent research`)
    - `spec/` — empty folder (specs created later via `devagent create-spec`)
    - `tasks/` — empty folder (task prompts created later via `devagent create-task-prompt`)
- Templates:
  - `.devagent/core/templates/feature-agents-template.md`
  - Optionally referenced later: `research-packet-template.md`, `spec-document-template.md`, `task-prompt-template.md`

## Knowledge Sources
- Internal: Feature hub template; `.devagent/workspace/product/` (e.g., `mission.md`, `roadmap.md`, `guiding-questions.md`); `.devagent/workspace/memory/` (e.g., `constitution.md`, `tech-stack.md`, decision journals)
- Retrieval etiquette: Cite file paths with anchors when available and include freshness as an ISO date; keep summaries to 1–2 lines each
- External: None by default; only use links explicitly provided in inputs

## Workflow
1. Kickoff
   - Establish working title and summary:
     - If title provided: use it.
     - If only description/idea provided: derive a tentative title from the first clause/sentence (Title Case, max ~8 words) and mark `[DERIVED]` in metadata.
     - If description is missing but an initial idea/title exists: derive a one‑sentence summary from the idea/title (active voice, present tense, ≤ 160 chars) and mark `[DERIVED]`.
   - Derive `feature_slug`:
     - Prefer provided slug if valid (lowercase, a‑z0‑9‑, no leading/trailing dashes, collapse repeats).
     - Otherwise derive from title (or derived title) by lowercasing, replacing non‑alphanumerics with dashes, and trimming consecutive/edge dashes.
2. Context gathering
   - Scan internal sources for related context using the title, derived slug, and key terms from the summary:
     - Search `.devagent/workspace/product/` and `.devagent/workspace/memory/` for matching phrases and adjacent sections
     - Collect the top 3–7 most relevant items with file paths and a one‑line note
     - Record freshness (today’s date) for each item
   - Prepare a bulleted list of citations to seed the `References` section in `AGENTS.md`
3. Collision check
   - If `.devagent/workspace/features/<feature_slug>/` already exists, append a numeric suffix (e.g., `-2`) and note the adjustment in the README.
4. Structure creation
   - Create the feature hub directory with subfolders: `research/`, `spec/`, `tasks/`.
5. `AGENTS.md` population
   - Start from the template and fill placeholders:
     - Feature Name → title (append " [DERIVED]" if inferred from description/idea)
     - Last Updated → today (ISO date)
     - Status → `Draft`
     - Feature Hub → `.devagent/workspace/features/<feature_slug>/`
     - Owners → provided owners or `[NEEDS CLARIFICATION]`
     - Summary → provided description/idea or derived one‑sentence summary (append " [DERIVED]")
     - Leave other sections present and ready for downstream agents
   - Seed the `References` section with up to 7 internal citations from Context gathering, each with a terse note and freshness date
   - Append a "Next Steps" section recommending follow‑up workflows with ready‑to‑run commands.
6. Output packaging
   - Save files, then print the created paths and the derived slug.

## Failure & Escalation
- Missing both title and description/idea — request via checklist and pause.
- No relevant internal context found — proceed; add a placeholder entry noting none found as of today and list searched paths
- Unwritable paths or permission errors — stop and report.
- Template missing — create a minimal `AGENTS.md` with required sections and tag `[TEMPLATE MISSING]`.

## Expected Output
- Artifact: New feature hub at `.devagent/workspace/features/<feature_slug>/` containing `AGENTS.md`, `research/`, `spec/`, and `tasks/`. `AGENTS.md` includes a populated `References` section citing internal sources (if found).
- Communication: Short summary including the slug, created `AGENTS.md` path, and recommended next commands.

## Follow‑up Hooks (Recommended next steps can vary by feature)
- Brainstorm ideas `devagent brainstorm`
- Clarify scope: `devagent clarify-feature`
- Research discovery: `devagent research`
- Draft spec: `devagent create-spec`
- Plan tasks: `devagent plan-tasks`
- Prepare execution prompts: `devagent create-task-prompt`


