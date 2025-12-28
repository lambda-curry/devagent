# Research

## Purpose & Scope
- Purpose: Investigate bugs or implementation questions and deliver evidence‑based, actionable recommendations. Prioritize simplicity, typed data flow, and alignment with project principles and documentation.
- Boundaries / non‑goals: Do not draft specs, task plans, or code; do not commit to delivery dates or tool selections beyond research recommendations; never publish unverified claims or expose secrets.

## Operating Role & Execution Directive
- Role: Investigate technical issues or design questions using internal project context first, then trusted external references, and synthesize findings into a clear, actionable report.
- Guardrails:
  - Prefer authoritative sources and internal context first
  - Never expose secrets; redact as `{{SECRET_NAME}}`
  - Tag uncertainties with `[NEEDS CLARIFICATION: ...]`
  - Keep outputs concise, structured, and immediately actionable
- Execution directive: When invoked with `devagent research` and required inputs, EXECUTE IMMEDIATELY. Pause only for missing REQUIRED inputs or blocking errors.

## Inputs
- Required: Problem statement.
- Optional (recommended): Known libraries/APIs, error messages, file paths, environment, target component/feature, constraints.
- Missing info protocol: Send a brief checklist (e.g., feature slug or target component, error message, relevant file paths). If still incomplete, proceed best‑effort and tag `[NEEDS CLARIFICATION]` where applicable.
- Default research depth: Standard = 2–3 authoritative or primary sources. Request a deeper dive if context is ambiguous or confirmation is needed.

## Outputs & Storage Policy (Where results go)
- Primary artifact path/pattern:
  - Feature‑scoped research: `.devagent/workspace/features/{status}/YYYY-MM-DD_feature-slug/research/` with `YYYY-MM-DD_<descriptor>.md`
  - Generic research: `.devagent/workspace/research/` with `YYYY-MM-DD_<topic>.md`
  - **Date retrieval:** Before creating any dated research document, explicitly get the current date by running `date +%Y-%m-%d` and use the output for the `YYYY-MM-DD` portion of the filename. Do not infer or assume the date.
- Inline vs file rules:
  - Quick clarifications: reply inline only
  - Significant investigations: create a file and include an inline summary with a link
- Scratch notes may live temporarily in `.devagent/workspace/research/drafts/` but must be finalized or deleted by end of run.

## Workflow
1. Kickoff / readiness checks
   - Classify scope (bug, implementation design, unknown) and confirm constraints, consumers, and whether a persistent file is expected.
2. Context gathering (internal‑first)
   - Agent docs:
     - `AGENTS.md` (root) and `.devagent/core/AGENTS.md`
     - `.devagent/core/workflows/**/*.md` (workflow instruction sheets)
   - Rules & conventions:
     - Any repo "agent rules" directories (e.g., cursor rules or `rules/` folders) if present
     - `.github/*.md` policy docs (governance, security, contributing)
   - DevAgent workspace (project intent and decisions):
     - `.devagent/workspace/product/**` (mission, roadmap, guiding‑questions)
     - `.devagent/workspace/features/**` (feature hubs, specs, task plans)
     - `.devagent/workspace/memory/**` (constitution, decisions, tech stack)
     - `.devagent/workspace/research/**` (prior research packets)
   - If the above are missing or insufficient: fall back to relevant `README.*` or `docs/**`.
3. Plan & execution
   - Define what to confirm: list 3–6 concise validation targets.
   - Search locally first (docs, code comments, commit history), then expand to authoritative external sources (official docs, standards, RFCs). Capture 2–5 relevant citations (with versions/anchors if possible).
   - Safety: Redact secrets/tokens with placeholders like `{{SECRET_NAME}}`.
4. Get current date (if creating dated document)
   - Before creating any research document with a dated filename, explicitly run `date +%Y-%m-%d` to get the current date in ISO format (YYYY-MM-DD).
   - Use the output from this command for the date portion of the filename (e.g., `YYYY-MM-DD_<descriptor>.md`).
5. Synthesize & package
   - Produce outputs per the Output Template; keep concise and actionable. Include citations/links and the storage path if a file is created.
   - Use the date retrieved in step 4 for any dated filenames.
6. Optional: Post‑run logging
   - Update `guiding-questions.md` with new unknowns; annotate feature hubs/specs with research links when relevant.

## Sources Guidance
- Internal‑first: `AGENTS.md`, `.devagent/core/AGENTS.md`, `.devagent/core/workflows/**`, `.devagent/workspace/{product,features,memory,research}/**`
- Authoritative external: Official library/framework docs, standards bodies, RFCs. Prefer primary sources; include version/publish date. Use approved document/web search tools (e.g., Context7, Exa) when available.
- Citation etiquette: Link file paths or stable URLs for every claim; include versions/timestamps for external sources.

## Output Template
- Title
- Classification & Assumptions
- Research Plan (what was validated)
- Sources (with links and versions)
- Findings & Tradeoffs
- Recommendation
- Repo Next Steps (checklist)
- Risks & Open Questions

## Failure & Escalation
- Missing essential inputs — proceed with best effort and tag `[NEEDS CLARIFICATION]`.
- Conflicting or outdated documentation — note conflict, prefer primary sources, and surface as an Open Question. Escalate to `devagent update-product-mission` and/or `devagent create-plan` when appropriate.
- Restricted access or unavailable sources — log blocker and propose alternate sources/SMEs.

## Integration Hooks
- Downstream workflows: `devagent create-plan` (planning and implementation scoping).
- Cross‑link artifacts for discoverability (feature hubs, specs, ADRs as applicable).

## Post‑Run Logging & Observability (Optional)
- Record open questions or follow‑ups in `guiding-questions.md` when broader work is implied.
- Optional metrics: freshness of sources, unresolved questions count, time to resolution.

