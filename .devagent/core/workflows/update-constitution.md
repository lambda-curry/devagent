# Update Constitution

## Mission
- Primary goal: Evaluate and implement proposed constitution amendments while preserving traceability across memory, feature hubs, and downstream agents.
- Boundaries / non-goals: Do not originate strategic changes without a documented trigger; avoid modifying other memory assets unless the constitution update explicitly requires it; never skip required steward or owner confirmations (default: executing developer).
- Success signals: Each amendment follows the checklist, clause owners (or the executing developer when operating solo) acknowledge the change, and the Amendment Log plus decision journal capture why the update happened.

## Execution Directive
When invoked with `devagent update-constitution` and required inputs, **EXECUTE IMMEDIATELY**. Do not summarize, describe, or request approval—perform the work using available tools. Only pause for missing REQUIRED inputs or blocking errors.

## Inputs
- Required: Amendment proposal (link to research note or feature hub entry), impacted clause IDs or draft clauses, confirmation owner for approval (default: executing developer), target timeline.
- Optional: Supporting evidence (research packets, compliance guidance, quotes), suggested review cadence adjustments, related feature hub status.
- Request missing info by: Listing absent items alongside examples (e.g., "Impacted clause IDs (example: `C1, C3`)") and pausing until the requester fills the gaps.

## Resource Strategy
- Constitution workspace (`.devagent/workspace/memory/constitution.md` and `constitution_update_checklist.md`) — primary references for clause language and required steps.
- Memory decision log (`.devagent/workspace/memory/decision-journal.md`) — capture the rationale and cross-link to workshops or incidents.
- Feature hub research folders — confirm the originating context and ensure related artifacts reference the correct clauses.
- Product artifacts (`.devagent/workspace/product/mission.md`, `guiding-questions.md`, `roadmap.md`) — verify alignment; only adjust when the amendment drives a documented change.
- `devagent update-product-mission` — consult when amendments shift mission framing or ownership responsibilities.
- `devagent research-feature` — engage to validate fresh evidence or gather additional context when sources are stale or disputed.

## Knowledge Sources
- Internal: Memory workspace, product docs, feature hub timelines, prior Amendment Log entries.
- External: Regulatory notices, standards updates, vendor policy memos surfaced via approved research tools when compliance clauses are involved.
- Retrieval etiquette: Prefer dated sources; add citations to the amendment proposal if new external material informed the change.

## Workflow
1. Intake triage: Confirm proposal completeness against the constitution checklist; decline or request revisions if core inputs are missing.
2. Context review: Read the originating research, decision journal entry, and affected clauses to understand baseline intent.
3. Impact mapping: List downstream artifacts (feature hubs, agent briefs, tasks) that need updates and notify owners early.
4. Drafting & validation: Edit clause text using the constitution template conventions, capture review cadence updates, and circulate the draft to listed stewards.
5. Approval capture: Record explicit sign-off (timestamp, approver) in the proposal note; halt if required confirmations are not reached.
6. Publication: Merge approved edits into `constitution.md`, update the Clause Directory, and append a new row to the Amendment Log.
7. Memory updates: Add a matching entry to `decision-journal.md`, link to affected feature hubs, and ensure related agents update their briefs or checklists.
8. Broadcast: Share a concise summary (change, clauses, follow-ups) with the requester and tag downstream agents responsible for action items.

## Adaptation Notes
- Emergency incidents: Prioritize accuracy over speed; explicitly mark temporary clauses and set a short review cadence.
- Large-scale rewrites: Break the work into staged amendments, ensuring each batch has its own approvals and Amendment Log entry.
- Multi-team environments: Document which teams adopt the clause and note any exceptions within the Clause Directory notes column.

## Failure & Escalation
- Common blockers: Missing steward approvals, conflicting source data, unresolved compliance questions, version drift between proposals and main constitution.
- Recovery playbook: Issue a blocker report referencing the constitution checklist, escalate to the proposal owner or `devagent update-product-mission`, and pause publication until alignment is restored.

## Expected Output
- Artifacts: Updated `constitution.md` with clause edits, refreshed Clause Directory entries, new Amendment Log row, synchronized `decision-journal.md` entry, and notifications sent to anyone impacted.
- Communication: Amendment summary covering clause changes, rationale, approvals, and next review dates delivered to the requester and relevant agents.

## Follow-up Hooks
- Downstream agents: Inform devagent create-plan when clause updates affect planning standards or implementation guardrails.
- Metrics / signals: Track amendment cycle time, number of clauses reviewed without change, and outstanding follow-up actions resulting from constitution updates.
