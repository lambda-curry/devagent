# Research

## Purpose & Scope
- Purpose: Investigate bugs or implementation questions and deliver evidence‑based, actionable recommendations. Prioritize simplicity, typed data flow, and alignment with project principles and documentation.
- Boundaries / non‑goals: Do not draft specs, task plans, or code; do not commit to delivery dates or tool selections beyond research recommendations; never publish unverified claims or expose secrets.

## Standard Instructions Reference
Before executing this workflow, review standard instructions in `.devagent/core/AGENTS.md` → Standard Workflow Instructions for:
- Date handling
- Metadata retrieval
- Context gathering order
- Standard guardrails
- Storage patterns

## Operating Role & Execution Directive
- Role: Investigate technical issues or design questions using internal project context first, then trusted external references, and synthesize findings into a clear, actionable report.
- Execution directive: Follow standard execution directive in `.devagent/core/AGENTS.md` → Standard Workflow Instructions.

## Inputs
- Required: Problem statement.
- Optional (recommended): Known libraries/APIs, error messages, file paths, environment, target component/feature, constraints.
- Missing info protocol:
  - If the user provides no explicit problem statement, **infer the most likely research question** from earlier conversation context and any available task artifacts. Start by writing an **Inferred Problem Statement** and an **Assumptions** list (tag assumptions as `[INFERRED]`), then proceed best‑effort.
  - Otherwise (or if key details are still missing), send a brief checklist (e.g., task slug or target component, error message, relevant file paths). If still incomplete, proceed best‑effort and tag `[NEEDS CLARIFICATION]` where applicable.
- Default research depth: Standard = 2–3 authoritative or primary sources. Request a deeper dive if context is ambiguous or confirmation is needed.

## Outputs & Storage Policy (Where results go)
- Primary artifact path/pattern:
  - Task‑scoped research: `.devagent/workspace/tasks/{status}/YYYY-MM-DD_task-slug/research/` with `YYYY-MM-DD_<descriptor>.md`
  - Generic research: `.devagent/workspace/research/` with `YYYY-MM-DD_<topic>.md`
  - Review Standard Workflow Instructions in `.devagent/core/AGENTS.md` for date handling and storage patterns.
- Inline vs file rules:
  - Quick clarifications: reply inline only
  - Significant investigations: create a file and include an inline summary with a link

## Workflow
1. Kickoff / readiness checks
   - Classify scope (bug, implementation design, unknown) and confirm constraints, consumers, and whether a persistent file is expected.
2. Context gathering (internal‑first)
   - Review Standard Workflow Instructions in `.devagent/core/AGENTS.md` for context gathering order.
3. Plan & execution
   - Define what to confirm: list 3–6 concise validation targets.
   - Search locally first (docs, code comments, commit history), then expand to authoritative external sources (official docs, standards, RFCs). Capture 2–5 relevant citations (with versions/anchors if possible).
   - Safety: Redact secrets/tokens with placeholders like `{{SECRET_NAME}}`.
4. Get current date (if creating dated document)
   - Review Standard Workflow Instructions in `.devagent/core/AGENTS.md` for date handling.
5. Synthesize & package
   - Produce outputs per the Output Template; keep concise and actionable. Include citations/links and the storage path if a file is created.
   - Use the date retrieved in step 4 for any dated filenames.
6. Optional: Post‑run logging
   - Update `guiding-questions.md` with new unknowns; annotate task hubs/specs with research links when relevant.

## Sources Guidance
- Internal‑first: Review Standard Workflow Instructions in `.devagent/core/AGENTS.md` for context gathering order and standard guardrails.
- Authoritative external: Official library/framework docs, standards bodies, RFCs. Prefer primary sources; include version/publish date. Use approved document/web search tools (e.g., Context7, Exa) when available.
- Citation etiquette: Review Standard Workflow Instructions in `.devagent/core/AGENTS.md` for standard guardrails. Link file paths or stable URLs for every claim; include versions/timestamps for external sources.

## Output Template
- **Filename:** `YYYY-MM-DD_<short-description>.md`
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
- Cross‑link artifacts for discoverability (task hubs, specs, ADRs as applicable).

## Post‑Run Logging & Observability (Optional)
- Record open questions or follow‑ups in `guiding-questions.md` when broader work is implied.
- Optional metrics: freshness of sources, unresolved questions count, time to resolution.
