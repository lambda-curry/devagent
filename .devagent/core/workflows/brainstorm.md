# Brainstorm Features

## Mission
- Primary goal: Facilitate structured ideation sessions that generate, cluster, and prioritize feature candidates aligned with the product mission, providing actionable inputs for research and specification work.
- Boundaries / non-goals: Do not conduct evidence-based research (that's devagent research), draft specs (that's devagent architect-spec), or commit roadmap changes (that's devagent create-product-mission). Focus on creative exploration and prioritization without implementation or evidence validation.
- Success signals: Sessions produce 3-5 prioritized feature candidates with clear next steps, ideas align with mission metrics and constitution principles, and downstream workflows can proceed without re-scoping.

## Standard Instructions Reference
Before executing this workflow, review standard instructions in `.devagent/core/AGENTS.md` → Standard Workflow Instructions for:
- Date handling
- Metadata retrieval
- Context gathering order
- Standard guardrails
- Storage patterns

## Execution Directive
Follow standard execution directive in `.devagent/core/AGENTS.md` → Standard Workflow Instructions, with the following workflow-specific customization:
- **BEGIN AN INTERACTIVE BRAINSTORM SESSION IMMEDIATELY**—start the conversation and ask the first questions.

## Interactive Session Model (Default)
This workflow runs as a multi-turn conversation that progresses through phases (Problem → Ideas → Clustering → Evaluation → Prioritization) and only produces the final Brainstorm Packet when phases are complete (or when the user asks to finish early).

### Phase Tracking (Hard Rules)
Maintain a running phase tracker across the session and update it every turn.

**Phases (in order):**
1. `Problem / Context`
2. `Ideas`
3. `Clustering`
4. `Evaluation`
5. `Prioritization`
6. `Packaging / Handoff`

**Allowed phase/item status labels (use exactly these):**
- `✅ complete`
- `⏳ in progress`
- `⬜ not started`
- `❓ unknown`
- `🔍 needs research` (route to `devagent research`)
- `⚠️ not important`
- `🚫 not applicable`
- `⏭️ deferred`
- `🚧 blocked` (name the blocker)

At the top of each turn, show a compact progress header, e.g.:
- `Problem ✅ | Ideas ⏳ (8 ideas) | Clustering ⬜ | Evaluation ⬜ | Prioritization ⬜`

### Incremental Ideation (Hard Rules)
- Generate ideas in batches of **5–10 at a time**, then stop and ask for feedback.
- Do not generate the full 15–30 ideas in a single response.
- After each batch, ask the user whether to: (a) generate more, (b) prune/edit, or (c) move to clustering.

### Completion Gate (Hard Rules)
Do not generate the final Brainstorm Packet until:
1. The user confirms they’re ready to move past ideation, and
2. Clustering, evaluation, and prioritization have been completed (or explicitly marked with status labels such as `⏭️ deferred`, `❓ unknown`, `🔍 needs research`, `🚧 blocked`).

If the user asks to finish early, generate the packet anyway but clearly mark incomplete phases and open items using the allowed status labels.

## Inputs
- Required: Brainstorm topic or problem statement, desired mode (`exploratory`, `targeted`, or `expansion`), mission context (from `workspace/product/mission.md`), known constraints (technical, compliance, budget, timeline).
- Optional: Prior brainstorm results, user feedback or pain points, competitive intelligence, specific stakeholder perspectives to explore (user, developer, business, technical), guiding questions from `workspace/product/guiding-questions.md`.
- Request missing info by: Sending a mode-specific checklist (e.g., "Provide specific mission gap or user need for targeted mode", "Link existing feature concept for expansion mode"); if core inputs are still missing, record them as assumptions and proceed with available context, flagging gaps in the output.

## Resource Strategy
- `.devagent/core/templates/brainstorm-packet-template.md` — base outline for all brainstorm outputs; duplicate and customize per mode.
- `.devagent/workspace/product/brainstorms/` — canonical storage for general brainstorm packets (format: `YYYY-MM-DD_<topic>.md`).
- `.devagent/workspace/features/{status}/YYYY-MM-DD_<feature-slug>/brainstorms/` — feature-specific brainstorm storage (format: `YYYY-MM-DD_<topic>.md`).
- **Date retrieval:** Review Standard Workflow Instructions in `.devagent/core/AGENTS.md` for date handling.
- `.devagent/workspace/product/mission.md` — primary source for mission alignment and success metrics.
- `.devagent/workspace/memory/constitution.md` — guardrails and principles that ideas must respect; cite relevant clauses when evaluating candidates.
- `.devagent/workspace/product/roadmap.md` — context for existing priorities and strategic themes.
- devagent update-product-mission — validate mission alignment or request clarification on strategic priorities before deep ideation.
- devagent research — hand off prioritized feature candidates with formulated research questions for evidence gathering.

## Operating Modes
- **Exploratory:** Open-ended ideation from a problem statement or opportunity. Generate 15-30 ideas using multiple techniques (prompt-based, constraint-based, analogy, SCAMPER, "How Might We" framing). Produce a brainstorm packet with clustered themes, prioritized top 3-5 candidates, evaluation matrix, and research questions.
- **Targeted:** Generate solutions for a specific mission gap or user need with defined constraints. Focus ideation on meeting stated requirements. Evaluate against constraint criteria and mission metrics. Produce a prioritized list of viable solutions with clear trade-offs.
- **Expansion:** Take an existing feature concept and generate variations, enhancements, or alternative approaches. Explore different implementation angles, scope adjustments, and complementary capabilities. Produce a comparative evaluation of variations with recommended directions.

## Knowledge Sources
- Internal: `.devagent/workspace/product/` artifacts (mission, roadmap, guiding-questions), `.devagent/workspace/memory/` logs (constitution, decision-journal), feature hubs for related work, existing specs and task plans for context.
- External: Industry best practices (via research tools when needed), technology trends, competitive patterns (when explicitly provided or researched).
- Retrieval etiquette: Start with internal mission and constitution sources, cite file paths for all internal references, flag when external research would strengthen evaluation, and refresh mission context before each session.

## Workflow
1. **Kickoff / readiness checks:** Confirm brainstorm topic, mode (exploratory/targeted/expansion), mission context, known constraints, and any specific perspectives to explore. Determine if this is a general brainstorm or feature-specific brainstorm. Verify access to mission artifacts and constitution clauses.
2. **Context gathering:** Pull relevant mission goals, success metrics, constitution principles, guiding questions, and any prior brainstorm results. Note existing constraints, opportunities, and strategic themes.
3. **Divergent phase (interactive):** Generate ideas incrementally in batches of **5–10** using multiple techniques tailored to the mode:
   - **Exploratory:** Prompt-based generation, analogies from other domains, constraint-based creativity, SCAMPER framework, "How Might We" questions, perspective shifts (user, developer, business, technical).
   - **Targeted:** Solutions addressing specific criteria, constraint satisfaction approaches, trade-off variations, hybrid combinations.
   - **Expansion:** Feature variations (scope up/down), alternative implementations, complementary capabilities, phased approaches.
   - After each batch: update phase tracking and ask for feedback before generating the next batch.
4. **Clustering:** Group similar ideas, identify common themes, reduce redundancy, and surface patterns. Label each cluster with a descriptive theme name.
5. **Convergent phase:** Evaluate ideas against mission metrics, constitution principles, technical feasibility, and impact potential. Score each cluster or candidate using the evaluation matrix (mission alignment, user impact, technical feasibility, estimated effort).
6. **Prioritization:** Rank top 3-5 candidates with scoring rationale. For each candidate, document: alignment with mission metrics, expected impact, implementation complexity, key assumptions, and risks.
7. **Get current date:** Before creating the brainstorm packet, review Standard Workflow Instructions in `.devagent/core/AGENTS.md` for date handling.
8. **Package outputs:** Create brainstorm packet using the template, including:
   - Problem statement and brainstorm mode
   - Full idea list (divergent phase)
   - Clustered themes with patterns identified
   - Evaluation matrix with scoring
   - Prioritized candidates (top 3-5) with detailed rationale
   - Research questions for devagent research
   - Parking lot for lower-priority or future ideas
   - Session metadata (date from step 7, participants, constraints, assumptions)
9. **Post-run logging:** Store brainstorm packet in appropriate location using the date retrieved in step 7, and prepare hand-off for downstream agents:
   - **General brainstorms:** `.devagent/workspace/product/brainstorms/YYYY-MM-DD_<topic>.md`
   - **Feature-specific brainstorms:** `.devagent/workspace/features/{status}/YYYY-MM-DD_<feature-slug>/brainstorms/YYYY-MM-DD_<topic>.md`

## Adaptation Notes
- **Exploratory mode** emphasizes breadth and creative diversity—encourage wild ideas and defer judgment until convergent phase. Use multiple ideation techniques to maximize idea space exploration.
- **Targeted mode** should focus on constraint satisfaction and criteria alignment—be explicit about trade-offs and how each solution meets stated requirements.
- **Expansion mode** works best with a clear baseline feature concept—generate variations systematically (scope, approach, phasing) and provide comparative analysis against the baseline.
- **Storage location guidance:**
  - Use **general brainstorms** (`.devagent/workspace/product/brainstorms/`) for broad product strategy, mission exploration, or cross-cutting concerns
  - Use **feature-specific brainstorms** (`.devagent/workspace/features/{status}/YYYY-MM-DD_<feature-slug>/brainstorms/`) when brainstorming variations, enhancements, or implementation approaches for a specific feature
- When mission context is ambiguous, coordinate with devagent update-product-mission before deep ideation to ensure alignment.
- For complex or high-stakes features, consider running multiple brainstorm sessions (exploratory → targeted) to progressively refine the solution space.

## Failure & Escalation
- Common blockers: Unclear problem statement or mission context, conflicting constraints, missing stakeholder perspectives, ambiguous success criteria, prior brainstorms not accessible.
- Recovery playbook: 
  - For unclear context: Request clarification from session owner, coordinate with devagent update-product-mission for mission validation, document assumptions and proceed with caveat.
  - For conflicting constraints: Surface the conflict explicitly, explore trade-off scenarios, recommend decision owner and escalation path.
  - For missing perspectives: Proceed with available viewpoints, flag gaps in output, recommend follow-up sessions with additional stakeholders.
  - When ideas consistently conflict with constitution: Pause ideation, review principles with session owner, consider whether mission or constitution needs updating.

## Expected Output
- **All modes:** Markdown brainstorm packet stored in appropriate location following the template structure, plus chat response summarizing top candidates and next steps:
  - **General brainstorms:** `.devagent/workspace/product/brainstorms/YYYY-MM-DD_<topic>.md`
  - **Feature-specific brainstorms:** `.devagent/workspace/features/{status}/YYYY-MM-DD_<feature-slug>/brainstorms/YYYY-MM-DD_<topic>.md`
- **Exploratory:** Full idea list with clustered themes, top 3-5 prioritized candidates with evaluation matrix, research questions for devagent research, and parking lot for future ideas.
- **Targeted:** Solutions addressing specific criteria, comparative evaluation against constraints, recommended solution(s) with trade-off analysis, and research questions for validation.
- **Expansion:** Feature variations with comparative analysis, recommended directions with rationale, implementation trade-offs, and suggested phasing or scoping adjustments.
- **All outputs include:** Session metadata and clear hand-off points for downstream agents.

## Start Here (First Turn)
If required inputs are present, start with:
1. A 1-line restatement of the brainstorm topic and mode.
2. The progress header (phase tracker).
3. Exactly 2–3 kickoff questions (typically clarifying problem statement + constraints) and wait for answers.

## Follow-up Hooks
- Downstream workflows: 
  - devagent research — receives prioritized candidates with formulated research questions for evidence-based validation
  - devagent update-product-mission — can be notified if brainstorm reveals mission gaps or strategic pivots
  - devagent create-plan — receives validated candidates (post-research) for plan creation
- Integration points:
  - Cross-reference relevant constitution clauses in outputs
  - Link to related feature hubs if brainstorm extends existing work
  - Note in brainstorm packet if session addresses or raises open questions for future reference
- Metrics / signals: Track brainstorm cadence, number of candidates progressing to research, alignment scores with mission metrics, and downstream agent rework rates (signals need for clearer outputs).
