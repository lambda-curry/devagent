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
- Internal: Feature hub template and existing workspace conventions
- External: None; this workflow does not browse or import outside content

## Workflow
1. Kickoff
   - Establish working title and summary:
     - If title provided: use it.
     - If only description/idea provided: derive a tentative title from the first clause/sentence (Title Case, max ~8 words) and mark `[DERIVED]` in metadata.
     - If description is missing but an initial idea/title exists: derive a one‑sentence summary from the idea/title (active voice, present tense, ≤ 160 chars) and mark `[DERIVED]`.
   - Derive `feature_slug`:
     - Prefer provided slug if valid (lowercase, a‑z0‑9‑, no leading/trailing dashes, collapse repeats).
     - Otherwise derive from title (or derived title) by lowercasing, replacing non‑alphanumerics with dashes, and trimming consecutive/edge dashes.
2. Collision check
   - If `.devagent/workspace/features/<feature_slug>/` already exists, append a numeric suffix (e.g., `-2`) and note the adjustment in the README.
3. Structure creation
   - Create the feature hub directory with subfolders: `research/`, `spec/`, `tasks/`.
4. `AGENTS.md` population
   - Start from the template and fill placeholders:
     - Feature Name → title (append " [DERIVED]" if inferred from description/idea)
     - Last Updated → today (ISO date)
     - Status → `Draft`
     - Feature Hub → `.devagent/workspace/features/<feature_slug>/`
     - Owners → provided owners or `[NEEDS CLARIFICATION]`
     - Summary → provided description/idea or derived one‑sentence summary (append " [DERIVED]")
     - Leave other sections present and ready for downstream agents
   - Append a "Next Steps" section recommending follow‑up workflows with ready‑to‑run commands.
5. Output packaging
   - Save files, then print the created paths and the derived slug.

## Failure & Escalation
- Missing both title and description/idea — request via checklist and pause.
- Unwritable paths or permission errors — stop and report.
- Template missing — create a minimal `AGENTS.md` with required sections and tag `[TEMPLATE MISSING]`.

## Expected Output
- Artifact: New feature hub at `.devagent/workspace/features/<feature_slug>/` containing `AGENTS.md`, `research/`, `spec/`, and `tasks/`.
- Communication: Short summary including the slug, created `AGENTS.md` path, and recommended next commands.

## Follow‑up Hooks (Recommended next steps can vary by feature)
- Brainstorm ideas `devagent brainstorm`
- Clarify scope: `devagent clarify-feature`
- Research discovery: `devagent research`
- Draft spec: `devagent create-spec`
- Plan tasks: `devagent plan-tasks`
- Prepare execution prompts: `devagent create-task-prompt`


