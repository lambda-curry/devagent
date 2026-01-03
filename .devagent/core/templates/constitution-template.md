# Constitution Template

Use this scaffold when creating or overhauling a product constitution. Replace bracketed guidance with concrete details, and remove rows or sections that do not apply to your organization.

## Preamble
- Purpose: <why the constitution exists>
- Scope: <which teams or workflows it governs>
- Stewardship model: <who maintains it and how changes are requested>

## How to Amend
1. Proposal capture: <where draft amendments live (e.g., task hub research note)>
2. Validation steps: <checks against mission, constitution clauses, compliance requirements>
3. Versioning: <archive location> and note to append summary to the Amendment Log.

## Clause Format
For each clause use the following structure:
```
### <Clause ID>. <Clause Title>
- **Statement:** <binding guidance>
- **Steward:** <role responsible for upkeep>
- **Refresh cadence:** <review frequency>
- **Traceability:** <where to verify compliance>
```
Add optional sub-bullets for examples, guardrails, or escalation triggers when needed.

## Clause Directory
| Clause | Last Reviewed | Next Review Due | Notes |
|--------|---------------|-----------------|-------|
| <ID> | <YYYY-MM-DD> | <YYYY-MM-DD> | <context or follow-ups> |

## Related Artifacts
- <memory docs, agent briefs, task hubs>

## Amendment Log
Use reverse chronological order so the newest entry appears first.
| Date | Change Summary | Clauses | Notes |
|------|----------------|---------|-------|
| <YYYY-MM-DD> | <what changed> | <IDs> | <links or owners> |

---

### Implementation Checklist
- Copy this template into your memory workspace (e.g., `.devagent/memory/constitution.md`).
- Populate the preamble and initial clauses with real data.
- When amending, update both the clause content and the Amendment Log entry in the same commit.
