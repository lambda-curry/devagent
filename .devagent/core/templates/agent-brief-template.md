# Agent Brief Template

Use this template when drafting a new roster agent. Replace bracketed guidance with concrete details and remove any rows that do not apply.

## Purpose & Scope
- Purpose: <clear objective for this agent>
- Boundaries / non-goals: <what the agent must not do>

## Operating Role & Execution Directive
- Role: <concise role statement describing how the agent operates>
- Guardrails:
  - Prefer authoritative sources and project-internal context first
  - Never expose secrets or credentials; redact as {{SECRET_NAME}}
  - Tag uncertainties with [NEEDS CLARIFICATION: ...]
- Execution directive: When invoked with `#AgentName` and required inputs, EXECUTE IMMEDIATELY. Pause only for missing REQUIRED inputs or blocking errors.

## Inputs
- Required: <must-have data, artifacts, approvals>
- Optional: <nice-to-have context>
- Missing info protocol: <provide a short checklist to request gaps; if still missing, proceed best‑effort and tag [NEEDS CLARIFICATION]>

## Outputs & Storage Policy (Where results go)
- Primary artifact path/pattern: <e.g., `.devagent/core/agents/<AgentName>.md` or feature/task-specific location>
- Inline vs file rules:
  - Quick clarifications: reply inline only
  - Significant outputs: create a file and include an inline summary with a link
- Naming conventions: <e.g., `YYYY-MM-DD_<descriptor>.md` for dated artifacts>

## Workflow
1. Kickoff / readiness checks: <pre-flight questions>
2. Context gathering: <internal docs/code/specs to review>
3. Plan & execution: <ordered actions with decision points>
4. Synthesize & package: <how to assemble outputs per template>
5. Optional: Post‑run logging: <memory updates, ADR notes, guiding-questions>

## Sources Guidance
- Internal‑first: <list internal systems/paths>
- Authoritative external: <official docs, standards, RFCs>; approved document/web search tools (e.g., Context7, Exa) when available
- Citation etiquette: <include links, versions, timestamps where applicable>

## Output Template
<define the schema for this agent’s deliverable(s). Example below; tailor as needed>
- Title
- Classification & Assumptions
- Sources (with links and versions)
- Findings & Tradeoffs
- Recommendation
- Repo Next Steps (checklist)
- Risks & Open Questions

## Failure & Escalation
- Best‑effort policy for missing inputs (with [NEEDS CLARIFICATION] tags)
- Common blockers & fallback steps
- Escalation rules (who/when to notify)

## Integration Hooks
- Downstream/peer agents that consume this output (e.g., `#SpecArchitect`, `#TaskPlanner`)
- How to cross‑link artifacts for discoverability

## Post‑Run Logging & Observability (Optional)
- What to log (e.g., new guiding questions, decisions)
- Optional metrics (e.g., freshness of sources, unresolved questions)

---

### Recording Template Changes
- If the template itself needs to evolve, update this file and announce the change via AgentBuilder so other agents can be normalized.
- When creating a one‑off variation, document why it exists and whether it should graduate into this template.
