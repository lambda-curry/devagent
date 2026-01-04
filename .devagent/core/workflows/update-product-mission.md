# Update Product Mission

## Mission
- Primary goal: Facilitate focused working sessions that keep the DevAgent product mission current, actionable, and reflected across product artifacts in real time.
- Boundaries / non-goals: Do not unilaterally write product strategy, commit roadmap items without required confirmation, or trigger downstream build agents. Surface gaps instead of guessing.
- Success signals: `workspace/product/mission.md` and related artifacts updated during the session, open questions logged in `guiding-questions.md`, and the session owner confirms the mission narrative mirrors their intent.

## Standard Instructions Reference
Before executing this workflow, review standard instructions in `.devagent/core/AGENTS.md` → Standard Workflow Instructions for:
- Date handling
- Metadata retrieval
- Context gathering order
- Standard guardrails
- Storage patterns

## Execution Directive
Follow standard execution directive in `.devagent/core/AGENTS.md` → Standard Workflow Instructions.

## Inputs
- Required: Latest versions of `workspace/product/mission.md`, `workspace/product/roadmap.md`, `workspace/product/guiding-questions.md`, the current constitution clauses, and the most recent memory entries covering mission-related decisions; session owner (default: executing developer) availability; target outcomes for the working session.
- Optional: Recent user research notes, analytics snapshots, market intelligence, recorded transcripts from prior sessions.
- Request missing info by: Listing the absent artifacts or unanswered questions, offering example answers (e.g., “Primary customer segment could be X or Y—please confirm”), and pausing until ownership is clarified.

## Resource Strategy
- `workspace/product/mission.md`: Canonical baseline; read before kickoff, diff after updates to highlight changes.
- `workspace/product/guiding-questions.md`: Capture prompts, verbatim answers, and unresolved items; rely on the “Open Follow-ups” table for continuity.
- `.devagent/workspace/memory/decision-journal.md`: Log session summary (date, participants, key changes) before closing. Mission updates are inherently strategic decisions and should always be logged in the decision journal.
- `.devagent/workspace/memory/constitution.md`: Review delivery principles and guardrails; adjust clause proposals only when the mission shift demands new behaviors.
- `workspace/product/roadmap.md`: Adjust only when the mission shift demands new milestones; otherwise note “no change.”
- `devagent research`: Pull in when evidence backing the mission is thin or conflicting; request targeted validation tasks.
- `devagent architect-spec`: Notify when mission updates imply spec revisions or net-new capability briefs.

## Workspace & Filing
- Use `.devagent/workspace/product/` as the shared surface for mission context that other agents consume during planning.
- Key artifacts:
  - `mission.md` — canonical product narrative (Product, Who, Problem, Why now, Solution, Metrics).
  - `roadmap.md` — milestones translating mission themes into delivery horizons.
  - `guiding-questions.md` — outstanding discovery threads earmarked for research or follow-up input.
  - `.devagent/workspace/memory/constitution.md` — long-term guardrails the mission must honour.
- Keep these documents synchronized during working sessions; when substantial shifts occur, tag downstream agents so they can pull the updated context.

## Knowledge Sources
- Internal: `.devagent/workspace/product/` artifacts, prior working session notes, decision logs.
- External: Research summaries supplied by devagent research, market/competitive snapshots validated by the session owner.
- Retrieval etiquette: Always read the most recent artifacts before a session, cite the source document when referencing data, and time-stamp new external intel in `guiding-questions.md`.

## Workflow
1. Kickoff readiness: Confirm session goal, any planned attendees, and latest artifact timestamps; postpone only when a required perspective is unavailable.
2. Context sync: Summarize the current mission narrative and outstanding follow-ups from `guiding-questions.md`; ask for corrections before proceeding.
3. Prompt-driven discovery: Facilitate the core questions (product, audience, problem, urgency, solution, metrics, risks), requesting concrete examples and proof points; log answers inline.
4. Live synthesis: Update mission, roadmap, and proposed constitution tweaks as insights emerge; mark assumptions plainly and tag for validation.
5. Validation loop: Read back the refreshed mission components, invite objections, and resolve wording until the session owner agrees the narrative is ready.
6. Closure & logging: Record a concise decision entry in the memory journal, elevate unresolved questions to the “Open Follow-ups” table, and propose next-session focus areas.

## Adaptation Notes
- Early-stage teams: Spend extra time defining customer segments and problem statements; allow placeholders for metrics with explicit validation owners.
- Mature products: Emphasize metric shifts, risk mitigation, and alignment with existing roadmap checkpoints; treat radical changes as proposals needing executive review.
- Async mode: When responses arrive via written prompts, consolidate answers, share diffs for review, and wait for explicit confirmation before publishing.

## Failure & Escalation
- Common blockers: Missing decision-maker, contradictory inputs, stale or unavailable artifacts, ambiguous success metrics.
- Recovery playbook: Flag the blocker in-session, document it in `guiding-questions.md`, request assistance from the session owner, and pause updates until clarity is restored.

## Expected Output
- Artifacts: Updated `workspace/product/mission.md`, `workspace/product/roadmap.md`, appended entries in `workspace/product/guiding-questions.md`, proposed constitution updates (if any), and a new entry in `.devagent/workspace/memory/decision-journal.md`.
- Communication: End-of-session summary covering key mission changes, unresolved questions, and recommended next focus areas delivered to the session owner (chat or note).

## Follow-up Hooks
- Downstream workflows: Alert devagent create-spec and devagent plan-tasks when mission updates imply spec changes or implementation planning. Coordinate with devagent create-plan after specs are refreshed.
- Metrics / signals: Track cadence of mission updates, number of unresolved follow-ups closed per session, and session owner satisfaction notes to inform future work.
