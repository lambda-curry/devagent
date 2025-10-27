# New Feature

## Mission
- Primary goal: From a short description, scaffold the minimal feature hub so the team can begin research/spec work immediately.
- Boundaries / non‑goals: Do not implement product code, decide detailed scope, or finalize specs. Hand off to downstream workflows for clarification, research, and planning.
- Success signals: A new feature hub folder exists with a clean slug, populated README, and standard subfolders; owners and summary are captured; clear next‑step workflow links are provided.

## Execution Directive
When invoked with `devagent new-feature` and required inputs, **EXECUTE IMMEDIATELY**. Do not summarize or seek approval—perform the scaffolding. Pause only for missing REQUIRED inputs or blocking errors (e.g., slug collision).

## Inputs
- Required: Feature title (human‑readable), short description (1–3 sentences)
- Optional: Owners (names or roles), related missions/links, initial tags/labels, desired slug (otherwise derive)
- Missing info protocol: Send a short checklist requesting title, description, and owners. If owners or related missions are missing, proceed and tag `[NEEDS CLARIFICATION]` in the README.

## Resource Strategy
- Target hub: `.devagent/workspace/features/<feature_slug>/`
  - Files/dirs to create:
    - `README.md` — derived from `.devagent/core/templates/feature-hub-template/README.md` with placeholders filled
    - `research/` — empty folder (optionally seed an initial packet later via `devagent research`)
    - `spec/` — empty folder (specs created later via `devagent create-spec`)
    - `tasks/` — empty folder (task prompts created later via `devagent create-task-prompt`)
- Templates:
  - `.devagent/core/templates/feature-hub-template/README.md`
  - Optionally referenced later: `research-packet-template.md`, `spec-document-template.md`, `task-prompt-template.md`

## Knowledge Sources
- Internal: Feature hub template and existing workspace conventions
- External: None; this workflow does not browse or import outside content

## Workflow
1. Kickoff
   - Validate inputs; derive `feature_slug` by lowercasing title and replacing non‑alphanumerics with dashes; trim consecutive dashes.
   - If a slug is provided, prefer it after validating format.
2. Collision check
   - If `.devagent/workspace/features/<feature_slug>/` already exists, append a numeric suffix (e.g., `-2`) and note the adjustment in the README.
3. Structure creation
   - Create the feature hub directory with subfolders: `research/`, `spec/`, `tasks/`.
4. README population
   - Start from the template and fill placeholders:
     - Feature Name → title
     - Status → `idea`
     - Owners → provided owners or `[NEEDS CLARIFICATION]`
     - Summary → short description
     - Related missions → provided links or leave placeholder
     - Latest spec/research → prefilled paths pointing to `spec/` and `research/` with dated filenames to be created later
   - Append a "Next Steps" section recommending follow‑up workflows with ready‑to‑run commands.
5. Output packaging
   - Save files, then print the created paths and the derived slug.

## Failure & Escalation
- Missing title or description — request via checklist and pause.
- Unwritable paths or permission errors — stop and report.
- Template missing — create a minimal README with required sections and tag `[TEMPLATE MISSING]`.

## Expected Output
- Artifact: New feature hub at `.devagent/workspace/features/<feature_slug>/` containing `README.md`, `research/`, `spec/`, and `tasks/`.
- Communication: Short summary including the slug and recommended next commands.

## Follow‑up Hooks (Recommended next steps can vary by feature)
- Brainstorm ideas `devagent brainstorm`
- Clarify scope: `devagent clarify-feature`
- Research discovery: `devagent research`
- Draft spec: `devagent create-spec`
- Plan tasks: `devagent plan-tasks`
- Prepare execution prompts: `devagent create-task-prompt`


