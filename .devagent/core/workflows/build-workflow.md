# Build Workflow

## Purpose & Scope
- Purpose: Design high‑quality agent prompts and instruction sheets ("agent briefs") that integrate with the DevAgent roster and are easy to adopt across projects.
- Boundaries / non‑goals: Do not implement the agent's code or run workflows; focus on brief architecture, documentation, and hand‑off guidance.

## Standard Instructions Reference
Before executing this workflow, review standard instructions in `.devagent/core/AGENTS.md` → Standard Workflow Instructions for:
- Date handling
- Metadata retrieval
- Context gathering order
- Standard guardrails
- Storage patterns

## Execution Directive
Follow standard execution directive in `.devagent/core/AGENTS.md` → Standard Workflow Instructions.

## Operating Role
- Role: Analyze existing agents and product artifacts, identify overlaps/gaps, and produce a finalized agent brief aligned to repository standards and downstream consumers.

## Inputs
- Required: Target agent purpose, scope boundaries, expected artifacts (and primary storage path/pattern)
- Optional: Known resources (peer agents, tools, APIs), prior art/reference prompts, project‑specific constraints, adoption environment considerations
- Missing info protocol: Send a short checklist (purpose, boundaries, outputs, consumers). If still incomplete, proceed best‑effort and tag `[NEEDS CLARIFICATION]` where applicable.

## Outputs & Storage Policy (Where results go)
- Primary artifact: Agent brief at `.devagent/core/agents/<AgentName>.md` using the standard template (or documented variation)
- Template evolution: When base structure needs to change, update `.devagent/core/templates/` and note rationale
- Communication: Provide a concise summary inline and link to the saved brief; cross‑link related agents when scope intersects

## Workflow
1. Kickoff / readiness checks
   - Confirm purpose, scope, outputs, and consumers; capture any constraints or review expectations
2. Context gathering
   - Review relevant agents in `.devagent/core/agents/`, product mission and workspace memory, and any specs/tasks that will consume the new agent
3. Plan & outline
   - Start from `.devagent/core/templates/agent-brief-template.md`; mark sections to keep, customize, or omit
4. Draft
   - Fill each section with project‑specific detail; define Outputs & Storage Policy and Integration Hooks concretely
5. Validate
   - Cross‑check for completeness, guardrails, naming and storage conventions, and alignment with the constitution or product mission
   - Detect overlaps/conflicts with existing agents; record resolution or open questions
6. Synthesize & package
   - Save/update the agent brief; summarize changes inline and link to the artifact; propose template updates if patterns should graduate

## Sources Guidance
- Internal‑first: `.devagent/core/agents/`, `.devagent/workspace/product/`, `.devagent/workspace/memory/`, `.devagent/core/templates/`
- Authoritative external: Context7 library docs for tooling references; approved web/document search tools (e.g., Exa) when available; reputable examples only when internal patterns do not exist
- Citation etiquette: Link file paths or stable URLs; include versions/timestamps when referencing external docs

## Output Template
Agent briefs produced by AgentBuilder should follow this structure (tailor as needed):
- Purpose & Scope
- Operating Role & Execution Directive
- Inputs
- Outputs & Storage Policy (Where results go)
- Workflow
- Sources Guidance
- Output Template (schema for this agent’s deliverables, if applicable)
- Failure & Escalation
- Integration Hooks
- Post‑Run Logging & Observability (Optional)

## Failure & Escalation
- Missing essential inputs (purpose, scope, outputs) — request via checklist; proceed best‑effort with `[NEEDS CLARIFICATION]`
- Overlapping scope or conflicting missions — flag explicitly; escalate to `#ProductMissionPartner` and/or `#SpecArchitect` for resolution
- Unclear adoption path or storage policy — propose options and request confirmation

## Integration Hooks
- Downstream consumers of new briefs: `#SpecArchitect`, `#TaskPlanner`, `#TaskExecutor`, and repository maintainers for adoption
- Cross‑references to related/peer agents to prevent duplication and clarify boundaries

## Follow-up Hooks
- Recommend which roster agents should review or consume the new agent (e.g., devagent create-spec, devagent plan-tasks).
- Log open questions or validation tasks in `guiding-questions.md` to ensure adoption.
